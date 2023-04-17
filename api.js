/**
 * The class used for using the server
 * @Warning Any functions/variables with an underscore in the beginning are internal and
 * shouldn't be accessed from outside this class.
 */
class Api {
    static _websocket = undefined;

    // Whether or not this is in multiplayer mode
    static online = false;

    // The id of the player at this client
    static currentPlayer = -1;

    /**
     * 
     * @param {number} amountOfTilesMoved 
     */
    static moveTo(amountOfTilesMoved) {
        var data = {
            "event_type": "move",
            "tiles_moved": amountOfTilesMoved
        }
        Api.getWebSocket().send(JSON.stringify(data));
    }

    /**
     * 
     * @param {number} bidAmount The amount of money to bid, (-1 is the same as the the player giving up)
     */
    static auctionBid(bidAmount) {

    }

    static changeTurn() {
        Api.getWebSocket().send(JSON.stringify({ event_type: "change_turn" }));
    }

    /**
     * This works, but only if the user gets redirected to the given url and accepts the self-signed certificate, this may add more complexity than what it's worth...
     * Also, how do I get it to work without exposing passwords and private keys and such stuff on github.
     * @param {String|URL} url The address to the LAN-server (No prefix prepended)
     */
    static async openWebsocketConnection(url) {
        return new Promise((resolve, reject) => {
            var ws = new WebSocket("wss://" + url);
            
            ws.onmessage = Api._messageHandler;
            ws.onerror = (_, ev) => reject(ev);
            ws.onopen = () => {
                Api._websocket = ws;
                resolve();
            };
        })
    }

    static _messageHandler(message) {
        var event = JSON.parse(message.data);

        console.log(event.event_type);
        console.log(event);

        document.body.dispatchEvent(new CustomEvent(event.event_type, { detail: event.data }));
    }

    /**
     * @returns {WebSocket} websocket
     */
    static getWebSocket() {
        if (Api._websocket == undefined || Api._websocket.readyState != Api._websocket.OPEN) {
            throw "Please open an websocket first (Api.openWebsocketConnection())";
        }

        return Api._websocket;
    }
}