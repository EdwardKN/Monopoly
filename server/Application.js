var https = require('node:https');
var { ClientRequest, ServerResponse } = require('node:http');
var { readFileSync } = require('node:fs');
var os = require('node:os');
var websocket = require('websocket');
var gamelogic = require('./gamelogic');
var api = require("./api");

console.log(os.networkInterfaces());

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
    return origin.includes("edwardkn.github.io") || origin.includes("localhost") || origin.includes(network);
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
    if (gamelogic.PlayerManager.getNumberOfPlayers() == 1) {
        startGameTimer = { id: setTimeout(() => { api.startGame(gamelogic.PlayerManager.players); console.log("<Host> Game started") }, COUNTDOWN_DURATION), time: performance.now() };
    }
    
    
    // Send message with info about the game
    var boardInfo  = gamelogic.BoardManager.getJoinInfo();
    var playerInfo = gamelogic.PlayerManager.playerJoined();
    connection.sendUTF(JSON.stringify({
        event_type: "join_info",
        data: {
            board: boardInfo,
            players: playerInfo,
            thisPlayer: playerInfo.length - 1,
            countdown: startGameTimer?.time == undefined ? -1 : Math.floor(performance.now() - startGameTimer.time),
            countdownDuration: COUNTDOWN_DURATION
        }
    }));
    
    var player = gamelogic.PlayerManager.players[playerInfo.length - 1];

    console.log("<%s> Joined lobby", player.name);
    connection.on('message', message => {
        if (message.type === 'utf8') {
            var event = JSON.parse(message.utf8Data);
            console.log(event);
            switch(event.event_type) {
                case "move":
                    console.log("<%s> Moved to: %d", player.name, event.tiles_moved);
                    player.teleportTo(event.tiles_moved);
                    break;
                case "change_turn":
                    var newPlayer = gamelogic.PlayerManager.players[(gamelogic.PlayerManager.players.indexOf(player) + 1) % gamelogic.PlayerManager.getNumberOfPlayers()];
                    console.log("<%s> Changed turn to: %s", player.name, newPlayer.name);
                    api.newTurn(newPlayer.colorIndex);
                    break;

                default:
                    console.error("<Warning> Event (%s) doesn't have any handler", event.event_type);

            }
            if (event.event_type == "move") {
            }
        }
    });

    connection.on('close', (reasonCode, description) => {
        gamelogic.PlayerManager.playerLeft(player);
    });
}

api.setWebsocket(websocketServer);
module.exports = {
    websocket: websocketServer
}