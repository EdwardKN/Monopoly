/**
 * The class used for using the server
 * @Warning Any functions/variables with an underscore in the beginning are internal and
 * shouldn't be accessed from outside this class.
 */
class Api {
    static _websocket = undefined;

    /**
     * 
     * @param {number} amountOfTilesMoved 
     */
    static move(amountOfTilesMoved) {
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

    /**
     * 
     * @param {String|URL} url The address to the LAN-server (No prefix prepended)
     */
    static async openWebsocketConnection(url) {
        return new Promise((resolve, reject) => {
            var ws = new WebSocket("ws://" + url);
            
            ws.onmessage = (message) => console.log(message.data);
            ws.onerror = console.error;
            ws.onopen = () => {
                resolve();
                Api._websocket = ws;
            };
        })
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