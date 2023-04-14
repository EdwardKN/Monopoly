var http = require('node:http');
var websocket = require('websocket');
var gamelogic = require('./gamelogic');
var api = require("./api");

var port = 60000 + Math.round((Math.random() - 0.5) * 10000);
var server = http.createServer(serverHandler).listen(port);
console.log("Server started listening on port: " + port);

/**
 * 
 * @param {http.ClientRequest} request 
 * @param {http.ServerResponse} response 
 */
function serverHandler(request, response) {
    // This shouldn't be used at all, as this application uses websockets, not a REST API.
    response.setHeader("Connection", "Upgrade");
    response.setHeader("Upgrade", "websocket");

    response.writeHead(426).end();
}

var websocketServer = new websocket.server({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // Official github page and testing
    return origin.includes("edwardkn.github.io") || origin.includes("localhost");
}

websocketServer.on('request', websocketHandler);
console.log("Websocket server started");

/**
 * 
 * @param {websocket.request} request 
 * @returns 
 */
function websocketHandler(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    
    var connection = request.accept('', request.origin);
    
    // Send message with info about the game
    var boardInfo  = gamelogic. BoardManager.getJoinInfo();
    var playerInfo = gamelogic.PlayerManager.playerJoined();
    connection.sendUTF(JSON.stringify({
        board: boardInfo,
        players: playerInfo
    }));
    
    var thisPlayer = playerInfo.length - 1;
    console.log("<" + gamelogic.PlayerManager.players[thisPlayer].name + '> Player joined');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var event = JSON.parse(message.utf8Data);
            console.log(event);
            if (event.event_type == "move") {
                gamelogic.PlayerManager.players[thisPlayer].teleportTo(event.tiles_moved);
            }
        }
    });

    connection.on('close', function(reasonCode, description) {
        console.log("<" + gamelogic.PlayerManager.players[thisPlayer].name + '> Player left');
    });
}

api.setWebsocket(websocketServer);
module.exports = {
    websocket: websocketServer
}