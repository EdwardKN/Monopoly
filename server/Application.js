var os = require('node:os');
var https = require('node:https');
var websocket = require('websocket');
var childProcess = require('node:child_process');
var { readFileSync } = require('node:fs');
var { ClientRequest, ServerResponse } = require('node:http');

var api = require("./modules/api");
var { PlayerManager } = require('./modules/player');
var { TileManager } = require("./modules/tile");
const { Logger } = require('./modules/logger');

const CONFIG = JSON.parse(readFileSync("./config.json", "utf-8"));
const CENTRALIZED_SERVER = "https://monopoly.endy.workers.dev";

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
TileManager.initBoard();

var port = CONFIG.PORT;
var server = https.createServer({ key: readFileSync("./certs/monopoly.key"), cert: readFileSync("./certs/monopoly.crt"), passphrase: readFileSync("./certs/passphrase", "utf-8") }, serverHandler)
    .listen(port, () => {
        Logger.log("New session started\n============================================\n", "Server.onstart", Logger.VERBOSE);
        Logger.log(`Klienter kan nu ansluta till servern med denna adress:\n${network}:${port}\n`, undefined, Logger.NONE);

        var url = new URL(CENTRALIZED_SERVER + "/connect");
        url.searchParams.set("url", encodeURI(`${network}:${port}`));
        url.searchParams.set("visibility", "private");

        https.get(url.toString(), (res) => { Logger.log("Registered with centralized server; Response-code: " + res.statusCode, "Server::OnStartUp", Logger.VERBOSE); });
    });

process.on('exit', () => {
    childProcess.execFileSync("node", ["./modules/exitHandler.js", CENTRALIZED_SERVER, network, port]);
});

process.on('SIGINT', () => {
    process.exit();
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
        var connection = request.accept(null, request.origin);
        connection.sendUTF(JSON.stringify({ event_type: "reject", data: { reason: "INVALID_ORIGIN" } }));
        connection.close();
        return;
    } else if (gameHasStarted) {
        var connection = request.accept(null, request.origin);
        connection.sendUTF(JSON.stringify({ event_type: "reject", data: { reason: "GAME_ONGOING" } }));
        connection.close();
        return;
    } else if (PlayerManager.getNumberOfPlayers() >= 8) {
        var connection = request.accept(null, request.origin);
        connection.sendUTF(JSON.stringify({ event_type: "reject", data: { reason: "GAME_FULL" } }));
        connection.close();
        return;
    } else if (PlayerManager.players.some(p => p.name == playername)) {
        var connection = request.accept(null, request.origin);
        connection.sendUTF(JSON.stringify({ event_type: "reject", data: { reason: "DUPLICATE_NAME" } }));
        connection.close();
        return;
    }

    var connection = request.accept(null, request.origin);    
    
    // Send message with info about the game
    var playerInfo = PlayerManager.playerJoined(playername);
    var player = PlayerManager.players[playerInfo.length - 1];
    player.money = CONFIG.GAME_SETTINGS.startmoney;
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
            var shownEventType = "on" + event.event_type.split("_").map(x => x[0].toUpperCase() + x.substring(1)).join("");
            var location = "Event" + "::" + shownEventType;
            
            switch(event.event_type) {
                case "move":
                    if (event.tiles_moved >= 40) {
                        event.tiles_moved %= 40;
                        // Get 200kr when past GO
                        player.money += 200;
                    }

                    var tile = TileManager.getTile(event.tiles_moved);
                    if (tile.owner != undefined && tile.owner != player) {
                        var rent = tile.getRent();
                        player.money -= rent;
                        tile.owner.money += rent;
                    }

                    Logger.log(`Player (${player.name}) moved to tile: ${event.tiles_moved}`, location, Logger.STANDARD);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);

                    player.teleportTo(event.tiles_moved);
                    break;
                case "change_turn":
                    var newPlayer = PlayerManager.players[(PlayerManager.players.indexOf(player) + 1) % PlayerManager.getNumberOfPlayers()];

                    Logger.log(`Turn changed from player (${player.name}) to player (${newPlayer.name})`, location, Logger.STANDARD);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);
                    Logger.log(JSON.stringify(newPlayer), location, Logger.VERBOSE);

                    api.newTurn(newPlayer.colorIndex);
                    break;
                case "tile_purchased":
                    var tile = TileManager.getFromID(event.tile.card);

                    if (player.money - (event.price || tile.piece.price) < 0) {
                        Logger.log(`Player (${player.name}) tried to purchase (${tile.piece.name}), probably through hack, but doesn't have enough money. Has: ${player.money}. Needs: ${event.price || tile.price}`, location, Logger.STANDARD);
                        Logger.log(JSON.stringify(player), location, Logger.VERBOSE);
                        break;
                    }

                    player.money -= event.price || tile.piece.price;

                    tile.owner = player;
                    tile.level = 0;
                    tile.mortaged = false;

                    Logger.log(`Player (${player.name}) purchased the tile: (${event.tile.name}). Remaining balance: ${player.money}kr`, location, Logger.STANDARD);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);

                    api.tilePurchased(player.colorIndex, player.money, event.tile.card);
                    break;
                case "property_changed":
                    // The cost of houses seems to be decided by which side the tile is on, first is 50, then 100, then 150 and lastly 200.
                    var price = Math.round((event.tile.side + 1) * 50 * (event.is_upgrade ? 1 : -1/2));
                    var tile = TileManager.getFromID(event.tile.card);

                    player.money -= price;
                    tile.level = event.new_level;

                    Logger.log(`Player (${player.name}) purchased property on the tile: (${event.tile.name}). Remaining balance: ${player.money}kr, level: ${event.new_level}`, location, Logger.STANDARD);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);

                    api.propertyChanged(player.colorIndex, event.tile.card, player.money, event.new_level);
                    break;
                case "card_event":
                    player.money = event.money;

                    Logger.log(`Card event with id: (${event.id}; ${event.type}) happened to player (${player.name})`, location, Logger.STANDARD);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);

                    api.randomEvent(event.id, player, event.type);
                    break;
                case "auction_start":
                    Logger.log(`Auction of tile (${event.tile.name}) started`, location, Logger.STANDARD);

                    api.auctionStart(event.tile.card);
                    break;
                case "auction_show":
                    Logger.log(`Auction of tile (${event.tile.name}) shown`, location, Logger.STANDARD);

                    api.auctionShow(event.tile.card);
                    break;
                case "auction_bid":
                    // Probable bug below, it uses the list of all the players in the game, not those who are in the auction
                    var newPlayer = PlayerManager.players[(PlayerManager.players.indexOf(player) + 1) % PlayerManager.getNumberOfPlayers()];

                    Logger.log(`Player (${player.name}) bid ${event.bid}kr on the tile (${event.tile.name})`, location, Logger.STANDARD);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);
                    Logger.log(JSON.stringify(newPlayer), location, Logger.VERBOSE);

                    api.auctionBid(player.colorIndex, newPlayer.colorIndex, event.bid, event.tile.card, event.is_out);
                    break;
                case "ready_up":
                    player.isReady = !player.isReady;

                    Logger.log(`Player (${player.name}) is ${player.isReady ? "" : "not"} ready`, location, Logger.STANDARD);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);

                    if (PlayerManager.getNumberOfPlayers() >= 2 && PlayerManager.players.every(x => x.isReady)) {
                        gameHasStarted = true;
                        api.startGame(PlayerManager.players);
                    } else {
                        api.readyUp(player.colorIndex);
                    }
                    break;
                case "tile_mortgaged":
                    player.money += event.tile.price / 2;
                    TileManager.getFromID(event.tile.card).mortaged = true;

                    Logger.log(`Player (${player.name}) mortgaged the tile (${event.tile.name}). Balance ${player.money}kr`, location, Logger.STANDARD);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);

                    api.mortgageTile(player.colorIndex, event.tile.card, player.money);
                    break;
                case "trade_request":
                    Logger.log(`Player (${player.name}) requested to trade with player (${PlayerManager.players.find(x => x.colorIndex == event.target_player).name})`, location, Logger.STANDARD);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);
                    Logger.log(JSON.stringify(PlayerManager.players.find(x => x.colorIndex == event.target_player)), location, Logger.VERBOSE);

                    api.requestTrade(event.target_player);
                    break;
                case "trade_content_update":
                    Logger.log(`Player (${player.name}) updated contents of trade with player (${PlayerManager.players.find(x => x.colorIndex == event.target_player).name})`, location, Logger.STANDARD);
                    Logger.log("Contents: " + JSON.stringify(event.contents), location, Logger.VERBOSE);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);
                    Logger.log(JSON.stringify(PlayerManager.players.find(x => x.colorIndex == event.target_player)), location, Logger.VERBOSE);

                    api.tradeContentUpdated(event.target_player, event.contents);
                    break;
                case "trade_accept_update":
                    Logger.log(`Player (${player.name}) ${event.accepted ? "accepted" : "declined"} trade with player (${PlayerManager.players.find(x => x.colorIndex == event.target_player).name})`, location, Logger.STANDARD);
                    Logger.log("Contents: " + JSON.stringify(event.contents), "Event::onTradeAcceptUpdate", Logger.VERBOSE);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);
                    Logger.log(JSON.stringify(PlayerManager.players.find(x => x.colorIndex == event.target_player)), location, Logger.VERBOSE);

                    api.tradeAcceptUpdate(event.target_player, event.accepted, event.contents);
                    break;
                case "trade_concluded": 
                    Logger.log(`Trade concluded; Successful: (${event.successful})`, location, Logger.STANDARD);
                    if (event.successful) {
                        player.money -= event.contents.p1.money;
                        player.money += event.contents.p2.money;
                        
                        var p2 = PlayerManager.players.find(p => p.colorIndex == event.target_player);
                        p2.money -= event.contents.p2.money;
                        p2.money += event.contents.p1.money;

                        event.contents.p1.tiles.forEach(t => {
                            var tile = TileManager.getFromID(t.card);
                            tile.owner = p2;
                        });

                        event.contents.p2.tiles.forEach(t => {
                            var tile = TileManager.getFromID(t.card);
                            tile.owner = p1;
                        });
                    }

                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);
                    Logger.log(JSON.stringify(PlayerManager.players.find(x => x.colorIndex == event.target_player)), location, Logger.VERBOSE);
                    Logger.log(JSON.stringify(event.contents), location, Logger.VERBOSE);

                    api.tradeConcluded(player.colorIndex, event.target_player, event.successful, event.contents);
                    break;
                case "exited_jail":
                    if (event.type == "MONEY") {
                        player.money -= 50;
                    }
                    
                    Logger.log(`Player (${player.name}) exited jail`, location, Logger.STANDARD);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);

                    api.exitedJail(player.colorIndex, event.type);
                    break;
                case "tile_sold":
                    var tile = TileManager.getFromID(event.tile.card);

                    player.money += event.tile.price / 2;
                    tile.owner = undefined;

                    Logger.log(`Player (${player.name}) sold the tile: (${event.tile.name})`, location, Logger.STANDARD);
                    Logger.log(JSON.stringify(player), location, Logger.VERBOSE);
                    Logger.log(JSON.stringify(event.tile), location, Logger.VERBOSE);

                    api.tileSold(player.colorIndex, event.tile.card);
                    break;
                default:
                    Logger.log(JSON.stringify(event), "No Handler", Logger.VERBOSE);
                    Logger.log(`Event (${event.event_type}) doesn't have any handler`, "No Handler", Logger.VERBOSE);
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