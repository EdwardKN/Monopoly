/**
 * The class used for using the server
 */
class Api {
    // Websocket used to communicate to the server
    static #websocket = undefined;

    // Whether or not this is in multiplayer mode
    static online = false;

    // The id of the player at this client
    static currentPlayer = -1;

    // The ...
    static centralizedServer = "https://monopoly.endy.workers.dev";

    /**
     * Sent when this player exited jail
     * @param {String} type Either DICE, CARD or MONEY depending on how the player exited jail
     */
    static exitJail(type = "DICE") {
        Api.getWebSocket().send(JSON.stringify({ event_type: "exited_jail", type }));
    }

    /**
     * Request to start a trade with someone 
     * @param {number} target 
     */
    static requestTrade(target) {
        Api.getWebSocket().send(JSON.stringify({ event_type: "trade_request", target_player: target }));
    }

    /**
     * Sent when the trade is concluded, either by mutual agreement or by one player opting out
     * @param {boolean} successful 
     * @param {{ money: number, tiles: BoardPiece.piece[] }}} contents 
     */
    static tradeConcluded(target, successful, contents) {
        Api.getWebSocket().send(JSON.stringify({ event_type: "trade_concluded", target_player: target, successful, contents }));
    }

    /**
     * Update the contents of the ongoing trade
     * @param {{ money: number, tiles: BoardPiece.piece[] }} contents 
     */
    static tradeContentUpdated(target, contents) {
        Api.getWebSocket().send(JSON.stringify({ event_type: "trade_content_update", target_player: target, contents }));
    }

    /**
     * This player accepted/unaccepted the trade
     * @param {boolean} accepted Whether or not this player accepts the trade 
     */
    static tradeAcceptUpdate(target, accepted) {
        Api.getWebSocket().send(JSON.stringify({ event_type: "trade_accept_update", target_player: target, accepted }));
    }
    
    /**
     * Move to some location
     * @param {number} location 
     */
    static moveTo(location) {
        Api.getWebSocket().send(JSON.stringify({ event_type: "move", "tiles_moved": location }));
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
     * @param {String} type Either CHANCE_CARD or COMMUNITY_CHEST
     * @param {number} id The id of the event
     */
    static randomEvent(type, id) {
        if (!/^(CHANCE_CARD|COMMUNITY_CHEST)$/.test(type)) throw "Invalid event type";
        var money = players.find(x => x.colorIndex == Api.currentPlayer).money;
        // ID system should work, given that both clients play the same version of the game
        Api.getWebSocket().send(JSON.stringify({ event_type: "card_event", type, id, money }));
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
     * Sell a tile
     * @param {BoardPiece} tile 
     */
    static tileSold(tile) {
        Api.getWebSocket().send(JSON.stringify({ event_type: "tile_sold", tile: tile.piece }));
    }

    /**
     * Purchase a property
     * @param {BoardPiece} tile The boardpiece that has been modified
     * @param {number} newLevel The new level of this property
     * @param {boolean} isUpgrade Whether the level of this went up or down
     */
    static propertyChangedLevel(tile, newLevel, isUpgrade) {
        Api.getWebSocket().send(JSON.stringify({ event_type: "property_changed", tile: { ...tile.piece, side: tile.side }, new_level: newLevel, is_upgrade: isUpgrade }));
    }

    /**
     * Mortgage a tile
     * @param {BoardPiece} tile 
     */
    static mortagedTile(tile) {
        Api.getWebSocket().send(JSON.stringify({ event_type: "tile_mortgaged", tile: tile.piece }));
    }

    /**
     * This player is ready to begin the game
     */
    static readyUp() {
        Api.getWebSocket().send(JSON.stringify({ event_type: "ready_up" }));
    }

    /**
     * Check if a certain url is active
     * @param {string} serverURL 
     * @returns {boolean} Whether or not the supplied url has an active server (No prefix)
     */
    static async serverActive(serverURL) {
        var url = new URL(Api.centralizedServer + "/get");

        url.searchParams.set("url", encodeURI(serverURL));

        var result = await (await fetch(url.toString())).json();

        if (result.error != undefined) throw result.error;

        return result.exists;
    }

    /**
     * @param {String|URL} url The address to the game server (No prefix prepended)
     */
    static async openWebsocketConnection(url, username) {
        return new Promise((resolve, reject) => {
            var ws = new WebSocket("wss://" + url + "?" + encodeURI(username));
            
            ws.onmessage = Api.#messageHandler;
            ws.onerror = (_, ev) => reject(ev);
            ws.onopen = () => {
                Api.#websocket = ws;
                resolve();
            };
        })
    }

    /**
     * Disconnect from the server
     */
    static disconnect() {
        Api.getWebSocket()?.close();
        Api.online = false;
    }

    static #messageHandler(message) {
        var event = JSON.parse(message.data);

        console.log(event);

        document.body.dispatchEvent(new CustomEvent(event.event_type, { detail: event.data }));
    }

    /**
     * @returns {WebSocket} websocket
     */
    static getWebSocket() {
        if (Api.#websocket == undefined || Api.#websocket.readyState != Api.#websocket.OPEN) {
            throw "Please open an websocket first (Api.openWebsocketConnection())";
        }

        return Api.#websocket;
    }
}