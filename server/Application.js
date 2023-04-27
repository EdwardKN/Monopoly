var os = require('node:os');
var https = require('node:https');
var websocket = require('websocket');
var { readFileSync } = require('node:fs');
var { ClientRequest, ServerResponse } = require('node:http');

var api = require("./api");
var { PlayerManager } = require('./player');
const { Logger } = require('./Logger');

const CONFIG = JSON.parse(readFileSync("./config.json", "utf-8"));

var network = Object.values(os.networkInterfaces()).map(x => x.filter(y => !y.internal).find(y => y.family == "IPv4")).find(x => x != undefined)?.address;
if (network == undefined) {
    network = Object.values(os.networkInterfaces()).map(x => x.filter(y => !y.internal).find(y => y.family == "IPv6")).find(x => x != undefined)?.address;
    if (network == undefined) {
        network = "127.0.0.1";
    } else {
        network = "[" + network + "]";
    }
}

Logger.setOutputLevel(CONFIG.LOGGING_LEVEL);

var port = CONFIG.PORT;
var server = https.createServer({ key: readFileSync("./certs/monopoly.key"), cert: readFileSync("./certs/monopoly.crt"), passphrase: readFileSync("./certs/passphrase", "utf-8") }, serverHandler)
    .listen(port, () => {
        Logger.log("New session started\n============================================\n", "Server.onstart", Logger.VERBOSE);
        Logger.log(`Klienter kan nu ansluta till servern med denna adress:\n${network}:${port}\n`, undefined, Logger.NONE);
    });

var gameHasStarted = false;

/**
 * 
 * @param {ClientRequest} request 
 * @param {ServerResponse} response 
 */
function serverHandler(request, response) {
    response.setHeader("Location", Buffer.from(request.url.split("/")[1], "base64") + "?" + btoa(network + ":" + port) + "&" + request.url.split("/")[2]);
    response.writeHead(302).end();
}

var websocketServer = new websocket.server({
    httpServer: server,
    autoAcceptConnections: false,
});

websocketServer.on('request', websocketHandler);

function originIsAllowed(origin) {
    return CONFIG.ALLOWED_DOMAINS.includes("*") || CONFIG.ALLOWED_DOMAINS.some(domain => origin.includes(domain));
}

/**
 * @param {websocket.request} request 
 * @returns 
 */
function websocketHandler(request) {
    var playername = decodeURI(request.resourceURL.search.substring(1));
    if (!originIsAllowed(request.origin)) {
        request.reject(undefined, "INVALID_ORIGIN");
        return;
    } else if (gameHasStarted) {
        request.reject(undefined, "GAME_ONGOING");
        return;
    } else if (PlayerManager.getNumberOfPlayers() >= 8) {
        request.reject(undefined, "GAME_FULL");
        return;
    } else if (PlayerManager.players.some(p => p.name == playername)) {
        request.reject(undefined, "DUPLICATE_NAME");
        return;
    }

    var connection = request.accept('', request.origin);    
    
    // Send message with info about the game
    var playerInfo = PlayerManager.playerJoined(playername);
    var player = PlayerManager.players[playerInfo.length - 1];
    connection.sendUTF(JSON.stringify({
        event_type: "join_info",
        data: {
            players: playerInfo,
            thisPlayer: player.colorIndex,
            settings: CONFIG.GAME_SETTINGS,
        }
    }));
    
    Logger.log(`Player (${player.name}) joined the lobby`, "Connection::onOpen", Logger.STANDARD);
    connection.on('message', message => {
        if (message.type === 'utf8') {
            var event = JSON.parse(message.utf8Data);
            switch(event.event_type) {
                case "move":
                    if (event.tiles_moved >= 40) {
                        event.tiles_moved %= 40;
                        // Get 200kr when past GO
                        player.money += 200;
                    }

                    Logger.log(`Player (${player.name}) moved to tile: ${event.tiles_moved}`, "Event::onMove", Logger.STANDARD);
                    Logger.log(JSON.stringify(player), "Event::onMove", Logger.VERBOSE);
                    player.teleportTo(event.tiles_moved);
                    break;
                case "change_turn":
                    var newPlayer = PlayerManager.players[(PlayerManager.players.indexOf(player) + 1) % PlayerManager.getNumberOfPlayers()];
                    Logger.log(`Turn changed from player (${player.name}) to player (${newPlayer.name})`, "Event::onChangeTurn", Logger.STANDARD);
                    Logger.log(JSON.stringify(player), "Event::onChangeTurn", Logger.VERBOSE);
                    Logger.log(JSON.stringify(newPlayer), "Event::onChangeTurn", Logger.VERBOSE);
                    api.newTurn(newPlayer.colorIndex);
                    break;
                case "tile_purchased":
                    player.money -= event.price || event.tile.price;
                    Logger.log(`Player (${player.name}) purchased the tile: (${event.tile.name}). Remaining balance: ${player.money}kr`, "Event::onTilePurchase", Logger.STANDARD);
                    Logger.log(JSON.stringify(player), "Event::onTilePurchase", Logger.VERBOSE);

                    // BoardPiece.piece.card is the image it should be, therefore this can be used as an id in the same manner that Player.colorIndex is used as an id.
                    api.tilePurchased(player.colorIndex, player.money, event.tile.card);
                    break;
                case "property_changed":
                    // The cost of houses seems to be decided by which side the tile is on, first is 50, then 100, then 150 and lastly 200.
                    var price = Math.round((event.tile.side + 1) * 50 * (event.is_upgrade ? 1 : -1/2));
                    player.money -= price;
                    Logger.log(`Player (${player.name}) purchased property on the tile: (${event.tile.name}). Remaining balance: ${player.money}kr, level: ${event.new_level}`, "Event::onPropertyPurchase", Logger.STANDARD);
                    Logger.log(JSON.stringify(player), "Event::onPropertyPurchase", Logger.VERBOSE);
                    api.propertyChanged(player.colorIndex, event.tile.card, player.money, event.new_level);
                    break;
                case "random_event":
                    player.money = event.money;
                    Logger.log(`Random event with id: (${event.id}; ${event.type}) happened to player (${player.name})`, "Event::onCardEvent", Logger.STANDARD);
                    Logger.log(JSON.stringify(player), "Event::onCardEvent", Logger.VERBOSE);
                    api.randomEvent(event.id, player, event.type);
                    break;
                case "auction_start":
                    Logger.log(`Auction of tile (${event.tile.name}) started`, "Event::onAuctionStart", Logger.STANDARD);
                    api.auctionStart(event.tile.card);
                    break;
                case "auction_show":
                    Logger.log(`Auction of tile (${event.tile.name}) shown`, "Event::onAuctionShow", Logger.STANDARD);
                    api.auctionShow(event.tile.card);
                    break;
                case "auction_bid":
                    var newPlayer = PlayerManager.players[(PlayerManager.players.indexOf(player) + 1) % PlayerManager.getNumberOfPlayers()];
                    Logger.log(`Player (${player.name}) bid ${event.bid}kr on the tile (${event.tile.name})`, "Event::onAuctionBid", Logger.STANDARD);
                    Logger.log(JSON.stringify(player), "Event::onAuctionBid", Logger.VERBOSE);
                    Logger.log(JSON.stringify(newPlayer), "Event::onAuctionBid", Logger.VERBOSE);
                    api.auctionBid(player.colorIndex, newPlayer.colorIndex, event.bid, event.tile.card, event.is_out);
                    break;
                case "ready_up":
                    player.isReady = !player.isReady;
                    Logger.log(`Player (${player.name}) is ready`, "Event::onReadyUp", Logger.STANDARD);
                    Logger.log(JSON.stringify(player), "Event::onReadyUp", Logger.VERBOSE);

                    if (PlayerManager.getNumberOfPlayers() >= 2 && PlayerManager.players.every(x => x.isReady)) {
                        gameHasStarted = true;
                        api.startGame(PlayerManager.players);
                    } else {
                        api.readyUp(player.colorIndex);
                    }
                    break;
                case "tile_mortgaged":
                    player.money += event.tile.price / 2;
                    Logger.log(`Player (${player.name}) mortgaged the tile (${event.tile.name}). Balance ${player.money}kr`, "Event::onTileMortgaged", Logger.STANDARD);
                    Logger.log(JSON.stringify(player), "Event::onTileMortgaged", Logger.VERBOSE);

                    api.mortgageTile(player.colorIndex, event.tile.card, player.money);
                    break;
                case "trade_request":
                    Logger.log(`Player (${player.name}) requested to trade with player (${PlayerManager.players.find(x => x.colorIndex == event.target_player).name})`, "Event::onTradeRequest", Logger.STANDARD);
                    Logger.log(JSON.stringify(player), "Event::onTradeRequest", Logger.VERBOSE);
                    Logger.log(JSON.stringify(PlayerManager.players.find(x => x.colorIndex == event.target_player)), "Event::onTradeRequest", Logger.VERBOSE);
                    api.requestTrade(event.target_player);
                    break;
                case "trade_content_update":
                    Logger.log(`Player (${player.name}) updated contents of trade with player (${PlayerManager.players.find(x => x.colorIndex == event.target_player).name})`, "Event::onTradeContentUpdate", Logger.STANDARD);
                    Logger.log("Contents: " + JSON.stringify(event.contents), "Event::onTradeContentUpdate", Logger.VERBOSE);
                    Logger.log(JSON.stringify(player), "Event::onTradeContentUpdate", Logger.VERBOSE);
                    Logger.log(JSON.stringify(PlayerManager.players.find(x => x.colorIndex == event.target_player)), "Event::onTradeContentUpdate", Logger.VERBOSE);
                    api.tradeContentUpdated(event.target_player, event.contents);
                    break;
                case "trade_accept_update":
                    Logger.log(`Player (${player.name}) ${event.accepted ? "accepted" : "declined"} trade with player (${PlayerManager.players.find(x => x.colorIndex == event.target_player).name})`, "Event::onTradeContentUpdate", Logger.STANDARD);
                    Logger.log("Contents: " + JSON.stringify(event.contents), "Event::onTradeAcceptUpdate", Logger.VERBOSE);
                    Logger.log(JSON.stringify(player), "Event::onTradeContentUpdate", Logger.VERBOSE);
                    Logger.log(JSON.stringify(PlayerManager.players.find(x => x.colorIndex == event.target_player)), "Event::onTradeContentUpdate", Logger.VERBOSE);
                    api.tradeAcceptUpdate(event.target_player, event.accepted, event.contents);
                    break;
                case "trade_concluded": 
                    Logger.log(`Trade concluded; Successful: (${event.successful})`, "Event::onTradeConcluded", Logger.STANDARD);
                    if (event.successful) {
                        player.money -= event.contents.p1.money;
                        player.money += event.contents.p2.money;
                        
                        var p2 = PlayerManager.players.find(p => p.colorIndex == event.target_player);
                        p2.money -= event.contents.p2.money;
                        p2.money += event.contents.p1.money;
                    }
                    Logger.log(JSON.stringify(player), "Event::onTradeConcluded", Logger.VERBOSE);
                    Logger.log(JSON.stringify(PlayerManager.players.find(x => x.colorIndex == event.target_player)), "Event::onTradeConcluded", Logger.VERBOSE);
                    api.tradeConcluded(player.colorIndex, event.target_player, event.successful, event.contents);
                    break;
                case "exited_jail":
                    Logger.log(`Player (${player.name}) exited jail`, "Event::onJailExit", Logger.STANDARD);
                    if (event.type == "MONEY") {
                        player.money -= 50;
                    }

                    Logger.log(JSON.stringify(player), "Event::onJailExit", Logger.VERBOSE);
                    api.exitedJail(player.colorIndex, event.type);
                    break;
                default:
                    console.log(event);
                    console.error("<Warning> Event (%s) doesn't have any handler", event.event_type);

            }
        }
    });

    connection.on('close', (reasonCode, description) => {
        PlayerManager.playerLeft(player);
    });
}

api.setWebsocket(websocketServer);
module.exports = {
    websocket: websocketServer
}