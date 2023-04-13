var http = require('node:http');
var websocket = require('websocket');
var gamelogic = require('./gamelogic');
var api = require("./api");

var port = 443;
var server = http.createServer(serverHandler).listen(port);
console.log("Server started listening on port: " + port);

/**
 * 
 * @param {server.ClientRequest} request 
 * @param {server.ServerResponse} response 
 */
function serverHandler(request, response) {
    console.log(new Date() + " - " + request.method + " - " + request.url);

    response.writeHead(200).end("");
}

var websocketServer = new websocket.server({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
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
    console.log((new Date()) + ' Websocket connection accepted.');

    // Send message with info about the game
    var boardInfo  = gamelogic. BoardManager.getJoinInfo();
    var playerInfo = gamelogic.PlayerManager.playerJoined();
    connection.sendUTF(JSON.stringify({
        board: boardInfo,
        players: playerInfo
    }));

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log(JSON.parse(message.utf8Data));
            connection.sendUTF(message.utf8Data);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
}

api.setWebsocket(websocketServer);
module.exports = {
    websocket: websocketServer
}