/**
 * The class used for using the server
 * @Warning Any functions/variables with an underscore in the beginning are internal and
 * shouldn't be accessed from outside this class.
 */
class Api {
    // Websocket used to communicate to the server
    static _websocket = undefined;

    // Whether or not this is in multiplayer mode
    static online = false;

    // The id of the player at this client
    static currentPlayer = -1;

    /**
     * Move to some location
     * @param {number} location 
     */
    static moveTo(location) {
        Api.getWebSocket().send(JSON.stringify({ "event_type": "move", "tiles_moved": location }));
    }

    /**
     * Bid in an auction
     * @param {number} bid The amount of money to bid, (-1 is the same as the the player giving up)
     * @param {BoardPiece} tile The boardpiece which is up for auction
     * @param {boolean} isOut Whether or not this player is out
     */
    static auctionBid(tile, bid, isOut) {
        Api.getWebSocket().send(JSON.stringify({ event_type: "auction_bid", tile: tile.piece, bid, is_out: isOut }));
    }

    /**
     * Start an auction
     * @param {BoardPiece} tile The boardpiece which is up for auction
     */
    static auctionStart(tile) {
        Api.getWebSocket().send(JSON.stringify({ event_type: "auction_start", tile: tile.piece }));
    }

    /**
     * Show an auction
     * @param {BoardPiece} tile The boardpiece which is up for auction
     */
    static auctionShow(tile) {
        Api.getWebSocket().send(JSON.stringify({ event_type: "auction_show", tile: tile.piece }));
    }

    /**
     * @Unimplemented
     * @param {String} type Either CHANCE_CARD or COMMUNITY_CHEST
     * @param {number} id The id of the event
     */
    static randomEvent(type, id) {
        if (!/^(CHANCE_CARD|COMMUNITY_CHEST)$/.test(type)) throw "Invalid event type";
        
        // ID system should work, given that both clients play the same version of the game
        Api.getWebSocket().send(JSON.stringify({ event_type: "random_event", type, id }));
    }

    /**
     * Change turn to the next player
     */
    static changeTurn() {
        Api.getWebSocket().send(JSON.stringify({ event_type: "change_turn" }));
    }

    /**
     * Purchase a tile
     * @param {BoardPiece} tile The boardpiece that has been purchased
     * @param {number|undefined} price If this was purchased through an auction, this is the price paid for it.
     */
    static tilePurchased(tile, price) {
        Api.getWebSocket().send(JSON.stringify({ event_type: "tile_purchased", tile: tile.piece, price }));
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