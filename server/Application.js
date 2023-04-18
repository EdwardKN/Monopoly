/**
 * Auctions
 * If one player lands on the "Gå till finkan" tile, both players proceed to go there, since both players get the event to go there
 * If a player makes it so the turn changes to the next person before the animation is finished, there isn't an alternative to purchase the tile. But it shouldn't even be able to get in this state.
 */

var https = require('node:https');
var { ClientRequest, ServerResponse } = require('node:http');
var { readFileSync } = require('node:fs');
var os = require('node:os');
var websocket = require('websocket');
var { PlayerManager } = require('./player');
var api = require("./api");

var network = Object.values(os.networkInterfaces()).map(x => x.filter(y => !y.internal).find(y => y.family == "IPv4")).find(x => x != undefined)?.address;
if (network == undefined) {
    network = Object.values(os.networkInterfaces()).map(x => x.filter(y => !y.internal).find(y => y.family == "IPv6")).find(x => x != undefined)?.address;
    if (network == undefined) {
        network = "127.0.0.1";
    } else {
        network = "[" + network + "]";
    }
}

var port = 60000 + Math.round((Math.random() - 0.5) * 10000);
var server = https.createServer({ key: readFileSync("./certs/domain.key"), cert: readFileSync("./certs/domain.crt"), passphrase: readFileSync("./certs/passphrase").toString("utf-8") }, serverHandler).listen(port, () => console.log("Clients can now connect at the Address:\n%s:%s\n", network, port));

const COUNTDOWN_DURATION = 30 * 1000;
var startGameTimer = undefined;

/**
 * 
 * @param {ClientRequest} request 
 * @param {ServerResponse} response 
 */
function serverHandler(request, response) {
    response.setHeader("Location", Buffer.from(request.url.split("/")[1], "base64") + "?" + btoa(network + ":" + port));
    response.writeHead(302).end();
}

var websocketServer = new websocket.server({
    httpServer: server,
    autoAcceptConnections: false,
});

websocketServer.on('request', websocketHandler);

function originIsAllowed(origin) {
    // Official github page and testing
    return true//origin.includes("edwardkn.github.io") || origin.includes("localhost") || origin.includes(network);
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
    } else if (startGameTimer != undefined && startGameTimer.time + COUNTDOWN_DURATION <= performance.now()) {
        request.reject(undefined, "GAME_ONGOING");
        return;
    }

    var connection = request.accept('', request.origin);
    if (PlayerManager.getNumberOfPlayers() == 1) {
        startGameTimer = { id: setTimeout(() => { api.startGame(PlayerManager.players); }, COUNTDOWN_DURATION), time: performance.now() };
    }
    
    
    // Send message with info about the game
    var playerInfo = PlayerManager.playerJoined();
    connection.sendUTF(JSON.stringify({
        event_type: "join_info",
        data: {
            players: playerInfo,
            thisPlayer: playerInfo.length - 1,
            countdown: startGameTimer?.time == undefined ? -1 : Math.floor(performance.now() - startGameTimer.time),
            countdownDuration: COUNTDOWN_DURATION
        }
    }));
    
    var player = PlayerManager.players[playerInfo.length - 1];

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