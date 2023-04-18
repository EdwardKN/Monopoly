// WebsocketServer, used to broadcast messages to all
var websocket = undefined;

/**
 * @param {Player[]} players
 */
function startGame(players) {
    console.log("[S->C] Game started with %d players", players.length);
    websocket.broadcastUTF(JSON.stringify(new StartEvent(players)));
}

/**
 * @param {number} dice1 A value between 1-6
 * @param {number} dice2 A value between 1-6
 */
function diceRoll(dice1, dice2) {
    console.log("[S->C] Dice rolled (%d, %d)", dice1, dice2);
    websocket.broadcastUTF(JSON.stringify(new DiceEvent(dice1, dice2)));
}

/**
 * @param {number} steps
 * @param {number} currentPlayerIndex
 */
function teleportTo(steps, currentPlayerIndex) {
    console.log("[S->C] Player %d moved to tile %d", currentPlayerIndex, steps);
    websocket.broadcastUTF(JSON.stringify(new MoveEvent(steps, currentPlayerIndex)));
}

/**
 * @param {String} username 
 * @param {number} index 
 * @param {boolean} isBot 
 */
function addPlayer(username, index, isBot) {
    console.log("[S->C] New %s (%s) joined", isBot ? "bot" : "player", username);
    websocket.broadcastUTF(JSON.stringify(new PlayerJoinEvent(username, index, isBot)));
}

/**
 * 
 * @param {number} id The id of the player whose turn it will be
 */
function newTurn(id) {
    console.log("[S->C] Changed turn to %d", id);
    websocket.broadcastUTF(JSON.stringify(new NewTurnEvent(id)));
}

/**
 * Send an event to the clients that another player drew a chance card or community chest
 * @param {String} id The id of the event
 * @param {Player} player The player this event happened to
 * @param {String} type Whether this is CHANCE_CARD or COMMUNITY_CHEST
 */
function randomEvent(id, player, type) {
    console.log("[S->C] Random event with id: (%s; %s) happened to player (%s)", id, type, player.name);
    websocket.broadcastUTF(JSON.stringify(new RandomEvent(id, type, player.colorIndex)));
}

/**
 * This is sent both when an auction is won and when a tile is purchased
 * @param {number} player The id of the player
 * @param {number} money The remaining balance of this player
 * @param {number} tile The id of the tile
 */
function tilePurchased(player, money, tile) {
    console.log("[S->C] Player (%s) purchased the tile: (%d). Remaining balance: %dkr", player, tile, money);
    websocket.broadcastUTF(JSON.stringify(new TilePurchasedEvent(player, money, tile)));
}

/**
 * 
 * @param {number} player The id of the player who bid
 * @param {number} nextPlayer The id of the next player
 * @param {number} bid The amount of money bid
 * @param {number} tile The id of the tile which is up for auction
 * @param {boolean} isOut Whether or not this player is out of the auction
 */
function auctionBid(player, nextPlayer, bid, tile, isOut) {
    console.log("[S->C] Player (%s) bid: %dkr on the tile: (%d)", player, bid, tile);
    websocket.broadcastUTF(JSON.stringify(new AuctionBidEvent(player, nextPlayer, bid, tile, isOut)));
}

/**
 * @param {number} tile The tile which was put up for auction
 */
function auctionStart(tile) {
    console.log("[S->C] Auction of tile (%s) started", tile);
    websocket.broadcastUTF(JSON.stringify(new AuctionStartEvent(tile)));
}

/**
 * @param {number} tile The tile which was put up for auction
 */
function auctionShow(tile) {
    console.log("[S->C] Auction of tile (%s) shown", tile);
    websocket.broadcastUTF(JSON.stringify(new AuctionShowEvent(tile)));
}

class Event {
    /**
     * 
     * @param {String} eventType 
     * @param {{}} data 
     */
    constructor(eventType, data = {}) {
        this.event_type = eventType;
        this.data = data;
    }
}

class AuctionShowEvent extends Event {
    /**
     * @param {number} tile The tile which was put up for auction
     */
    constructor(tile) {
        super("auction_show_event", { tile });
    }
}

class AuctionBidEvent extends Event {
    /**
     * 
     * @param {number} player The id of the player who bid
     * @param {number} nextPlayer The id of the next player
     * @param {number} bid The amount of money bid
     * @param {number} tile The id of the tile which is up for auction
     */
    constructor(player, nextPlayer, money, tile, isOut) {
        super("auction_bid_event", { player, nextPlayer, money, tile, is_out: isOut });
    }
}

class AuctionStartEvent extends Event {
    /**
     * @param {number} tile The tile which was put up for auction
     */
    constructor(tile) {
        super("auction_start_event", { tile });
    }
}

class TilePurchasedEvent extends Event {
    /**
     * 
     * @param {number} player The id of the player
     * @param {number} money The remaining balance of this player
     * @param {number} tile The id of the tile
     */
    constructor(player, money, tile) {
        super("tile_purchased_event", { player, tile, money });
    }
}

class NewTurnEvent extends Event {
    /**
     * @param {number} id The id of the player whose turn it will be
     */
    constructor(id) {
        super("new_turn_event", { id });
    }
}

class RandomEvent extends Event {
    /**
     * @param {String} id 
     * @param {number} player
     * @param {String} type
     */
    constructor(id, type, player) {
        super("random_card", { id, type, player });
    }
}

class PlayerJoinEvent extends Event {
    /**
     * @param {String} username
     * @param {number} index 
     * @param {boolean} isBot 
     */
    constructor(username, index, isBot) {
        super("player_joined", { username, index, isBot });
    }
}

class StartEvent extends Event {
    /**
     * @param {Player[]} players 
     */
    constructor(players) {
        super("start_game", { players });
    }
}

class DiceEvent extends Event {
    /**
     * @param {number} dice1 
     * @param {number} dice2 
     */
    constructor(dice1, dice2) {
        super("dice_event", { dice1, dice2 });
    }
}

class MoveEvent extends Event {
    /**
     * @param {number} steps 
     * @param {number} currentPlayerIndex 
     */
    constructor(steps, currentPlayerIndex) {
        super("move_event", { steps, player: currentPlayerIndex });
    }
}


module.exports = {
    teleportTo,
    addPlayer,
    randomEvent,
    tilePurchased,
    auctionStart,
    auctionShow,
    auctionBid,
    startGame,
    newTurn,
    setWebsocket: wss => { websocket = wss; }
}