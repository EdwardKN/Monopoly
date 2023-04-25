var os = require('node:os');
var https = require('node:https');
var websocket = require('websocket');
var { readFileSync } = require('node:fs');
var { ClientRequest, ServerResponse } = require('node:http');

var api = require("./api");
var { PlayerManager } = require('./player');

var network = Object.values(os.networkInterfaces()).map(x => x.filter(y => !y.internal).find(y => y.family == "IPv4")).find(x => x != undefined)?.address;
if (network == undefined) {
    network = Object.values(os.networkInterfaces()).map(x => x.filter(y => !y.internal).find(y => y.family == "IPv6")).find(x => x != undefined)?.address;
    if (network == undefined) {
        network = "127.0.0.1";
    } else {
        network = "[" + network + "]";
    }
}

var port = 55045; // Random port that I got, this will be the default now
var server = https.createServer({ key: readFileSync("./certs/monopoly.key"), cert: readFileSync("./certs/monopoly.crt"), passphrase: readFileSync("./certs/passphrase").toString("utf-8") }, serverHandler).listen(port, () => console.log("Klienter kan nu ansluta till servern med denna adress:\n%s:%s\n", network, port));

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
    // Official github page and testing
    return origin.includes("edwardkn.github.io") || origin.includes("localhost");
}

/**
 * 
 * @param {websocket.request} request 
 * @returns 
 */
function websocketHandler(request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject(undefined, "INVALID_ORIGIN");
        return;
    } else if (gameHasStarted) {
        request.reject(undefined, "GAME_ONGOING");
        return;
    } else if (PlayerManager.getNumberOfPlayers() >= 8) {
        request.reject(undefined, "GAME_FULL");
        return;
    }

    var connection = request.accept('', request.origin);    
    
    // Send message with info about the game
    var playerInfo = PlayerManager.playerJoined(decodeURI(request.resourceURL.search.substring(1)));
    var player = PlayerManager.players[playerInfo.length - 1];
    connection.sendUTF(JSON.stringify({
        event_type: "join_info",
        data: {
            players: playerInfo,
            thisPlayer: player.colorIndex
        }
    }));
    
    console.log("[S<-C] Player (%s) joined the lobby", player.name);
    connection.on('message', message => {
        if (message.type === 'utf8') {
            // I'm thinking about having as little validation on the server itself
            // It'll only act as a relay and sync the info about players and the board, such as money, owned tiles and position of players.
            // This way, it'll go faster and I don't have to recreate the whole game
            var event = JSON.parse(message.utf8Data);
            switch(event.event_type) {
                case "move":
                    // There's only 39 tiles on the board
                    event.tiles_moved %= 40;
                    console.log("[S<-C] Player (%s) moved to tile: %d", player.name, event.tiles_moved);
                    player.teleportTo(event.tiles_moved);
                    break;
                case "change_turn":
                    var newPlayer = PlayerManager.players[(PlayerManager.players.indexOf(player) + 1) % PlayerManager.getNumberOfPlayers()];
                    console.log("[S<-C] Turn changed from player %s to player %s", player.name, newPlayer.name);
                    api.newTurn(newPlayer.colorIndex);
                    break;
                case "tile_purchased":
                    player.money -= event.price || event.tile.price;
                    console.log("[S<-C] Player (%s) purchased the tile: (%s). Remaining balance: %dkr", player.name, event.tile.name, player.money);

                    // BoardPiece.piece.card is the image it should be, therefore this can be used as an id in the same manner that Player.colorIndex is used as an id.
                    api.tilePurchased(player.colorIndex, player.money, event.tile.card);
                    break;
                case "property_changed":
                    // The cost of houses seems to be decided by which side the tile is on, first is 50, then 100, then 150 and lastly 200.
                    var price = Math.round((event.tile.side + 1) * 50 * (event.is_upgrade ? 1 : -1/2));
                    player.money -= price;
                    console.log("[S<-C] Player (%s) purchased property on the tile: (%s). Remaining balance: %dkr, level: %d", player.name, event.tile.name, player.money, event.new_level);
                    api.propertyChanged(player.colorIndex, event.tile.card, player.money, event.new_level);
                    break;
                case "random_event":
                    console.log("[S<-C] Random event with id: (%s; %s) happened to player (%s)", event.id, event.type, player.name);
                    api.randomEvent(event.id, player, event.type);
                    break;
                case "auction_start":
                    console.log("[S<-C] Auction of tile (%s) started", event.tile.name);
                    api.auctionStart(event.tile.card);
                    break;
                case "auction_show":
                    console.log("[S<-C] Auction of tile (%s) shown", event.tile.name);
                    api.auctionShow(event.tile.card);
                    break;
                case "auction_bid":
                    var newPlayer = PlayerManager.players[(PlayerManager.players.indexOf(player) + 1) % PlayerManager.getNumberOfPlayers()];
                    console.log("[S<-C] Player (%s) bid %dkr on tile (%s)", player.name, event.bid, event.tile.name);
                    api.auctionBid(player.colorIndex, newPlayer.colorIndex, event.bid, event.tile.card, event.is_out);
                    break;
                case "ready_up":
                    console.log("[S<-C] Player (%s) is ready", player.name);
                    player.isReady = !player.isReady;

                    if (PlayerManager.getNumberOfPlayers() >= 2 && PlayerManager.players.every(x => x.isReady)) {
                        gameHasStarted = true;
                        api.startGame(PlayerManager.players);
                    } else {
                        api.readyUp(player.colorIndex);
                    }
                    break;
                case "tile_mortgaged":
                    player.money += event.tile.price / 2;
                    console.log("[S<-C] Player (%s) mortgaged tile: (%s). Balance: %dkr", player.name, event.tile.name, player.money);

                    api.mortgageTile(player.colorIndex, event.tile.card, player.money);
                    break;
                case "trade_request":
                    console.log("[S<-C] Player (%s) requested to trade with player (%s)", player.name, PlayerManager.players.find(x => x.colorIndex == event.target_player).name);
                    api.requestTrade(event.target_player);
                    break;
                case "trade_content_update":
                    console.log("[S<-C] Player (%s) updated contents of trade; Contents: %s", player.name, JSON.stringify(event.contents));
                    api.tradeContentUpdated(event.target_player, event.contents);
                    break;
                case "trade_accept_update":
                    console.log("[S<-C] Trade accept button clicked; Accepted: %s; Contents: %s", event.accepted, JSON.stringify(event.contents));
                    api.tradeAcceptUpdate(event.target_player, event.accepted, event.contents);
                    break;
                case "trade_concluded": 
                    console.log("[S<-C] Trade concluded; Successful: %s; Contents: %s", event.successful, JSON.stringify(event.contents));
                    api.tradeConcluded(player.colorIndex, event.target_player, event.successful, event.contents);
                    break;
                case "exited_jail":
                    console.log("[S<-C] Player (%s) bought their way out of jail", player.name);
                    api.exitedJail(player.colorIndex);
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