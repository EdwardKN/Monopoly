const { Logger } = require("./logger");

// WebsocketServer, used to broadcast messages to all
var websocket = undefined;

/**
 * @param {Player[]} players All the players in the game
 */
function startGame(players) {
    Logger.log(`Game started with ${players.length} players`, "API::startGame", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new StartEvent(players)));
}

/**
 * @Unused (Might be used later for the animation of die)
 * @param {number} dice1 A value between 1-6
 * @param {number} dice2 A value between 1-6
 */
function diceRoll(dice1, dice2) {
    Logger.log(`Dice rolled (${dice1}; ${dice2})`, "API::diceRoll", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new DiceEvent(dice1, dice2)));
}

/**
 * @param {number} steps The position of this player
 * @param {number} currentPlayerIndex The id of this player
 */
function teleportTo(steps, currentPlayerIndex) {
    Logger.log(`Player ${currentPlayerIndex} moved to tile: ${steps}`, "API::teleportTo", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new MoveEvent(steps, currentPlayerIndex)));
}

/**
 * @param {String} username The username of the removed player
 * @param {number} index The id of the player
 * @param {boolean} isBot Whether or not this user was a bot
 */
function addPlayer(username, index, isBot) {
    Logger.log(`${isBot ? "Bot" : "Player"} (${username}) joined`, "API::addPlayer", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new PlayerJoinEvent(username, index, isBot)));
}

/**
 * @param {String} username The username of the removed player
 * @param {number} index The id of the player
 * @param {boolean} isBot Whether or not this user was a bot
 */
function removePlayer(username, index, isBot) {
    Logger.log(`${isBot ? "Bot" : "Player"} (${username}) left`, "API::removePlayer", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new PlayerLeaveEvent(username, index, isBot)));
}

/**
 * @param {number} target The id of the the target player
 */
function requestTrade(target) {
    Logger.log(`Trade request to player (${target})`, "API::requestTrade", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new RequestTradeEvent(target)));
}

/**
 * @param {boolean} successful Whether or not the trade was successful
 * @param {{ money: number, tiles: BoardPiece.piece[] }} contents 
 */
function tradeAcceptUpdate(target, successful, contents) {
    Logger.log(`Trade accept button (${target}); Accepted: ${successful}; Contents: ${JSON.stringify(contents)}`, "API::tradeAcceptUpdate", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new TradeAcceptUpdateEvent(target, successful, contents)));
}

/**
 * @param {number} p1 The id of one of the player who are in a trade
 * @param {number} p2 The id of the other player in the trade
 * @param {boolean} successful Whether or not the trade was successful
 * @param {{ money: number, tiles: BoardPiece.piece[] }} contents 
 */
function tradeConcluded(p1, p2, successful, contents) {
    Logger.log(`Trade between (${p1}) and (${p2}) concluded; Successful: ${successful}; Contents: ${JSON.stringify(contents)}`, "API::tradeConcluded", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new TradeConcludedEvent(p1, p2, successful, contents)));
}

/**
 * @param {number} id The id of the player whose turn it will be
 */
function newTurn(id) {
    Logger.log(`Changed turn to: ${id}`, "API::newTurn", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new NewTurnEvent(id)));
}

/**
 * Send an event to the clients that another player drew a chance card or community chest
 * @param {String} id The id of the event
 * @param {Player} player The player this event happened to
 * @param {String} type Whether this is CHANCE_CARD or COMMUNITY_CHEST
 */
function randomEvent(id, player, type) {
    Logger.log(`Random event with id: (${id}; ${type}) happened to player (${player.name})`, "API::randomEvent", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new RandomEvent(id, type, player.colorIndex)));
}

/**
 * This is sent when an auction is won, when a tile is purchased and also when buying back a mortaged tile
 * @param {number} player The id of the player
 * @param {number} money The remaining balance of this player
 * @param {number} tile The id of the tile
 */
function tilePurchased(player, money, tile) {
    Logger.log(`Player (${player}) purchased the tile: (${tile}). Remaining balance: ${money}kr`, "API::tilePurchased", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new TilePurchasedEvent(player, money, tile)));
}

/**
 * @param {number} player The id of the player who made the purchase
 * @param {number} tile The id of the tile
 * @param {number} money The remaining balance of the player
 * @param {number} newLevel The new property level of this tile
 */
function propertyChanged(player, tile, money, newLevel) {
    Logger.log(`Player (${player}) purchased property on the tile: (${tile}). Remaining balance: ${money}kr, level: ${newLevel}`, "API::propertyChanged", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new PropertyChangedEvent(player, tile, money, newLevel)));
}

/**
 * @param {number} player The id of the player who bid
 * @param {number} nextPlayer The id of the next player
 * @param {number} bid The amount of money bid
 * @param {number} tile The id of the tile which is up for auction
 * @param {boolean} isOut Whether or not this player is out of the auction
 */
function auctionBid(player, nextPlayer, bid, tile, isOut) {
    Logger.log(`Player (${player}) bid ${bid}kr on the tile: (${tile})`, "API::auctionBid", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new AuctionBidEvent(player, nextPlayer, bid, tile, isOut)));
}

/**
 * @param {number} player The id of the player
 * @param {number} money The remaining balance of this player
 * @param {number} tile The id of the tile
 */
function mortgageTile(player, tile, money) {
    Logger.log(`Player (${player}) mortgaged the tile: (${tile}). Balance: ${money}kr`, "API::mortgageTile", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new MortgageEvent(player, money, tile)));
}

/**
 * @param {number} tile The tile which was put up for auction
 */
function auctionStart(tile) {
    Logger.log(`Auction of tile (${tile}) started`, "API::auctionStart", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new AuctionStartEvent(tile)));
}

/**
 * @param {number} tile The tile which was put up for auction
 */
function auctionShow(tile) {
    Logger.log(`Auction of tile (${tile}) shown`, "API::auctionShow", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new AuctionShowEvent(tile)));
}

/**
 * @param {number} player The id of the player
 */
function readyUp(player) {
    Logger.log(`Player (${player}) is ready`, "API::readyUp", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new PlayerReadyEvent(player)));
}

/**
 * @param {{ money: number, tiles: BoardPiece.piece[] }} contents 
 */
function tradeContentUpdated(target, contents) {
    Logger.log(`Content of trade updated; Contents: ${JSON.stringify(contents)}`, "API::tradeContentUpdated", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new TradeContentUpdateEvent(target, contents)));
}

/**
 * @param {number} player The id of the player
 * @param {String} type Either DICE, CARD or MONEY depending on the method of exit
 */
function exitedJail(player, type) {
    Logger.log(`Player (${player}) exited jail, using (${type})`, "API::exitedJail", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new PlayerExitedJailEvent(player, type)));
}

function tileSold(player, tile) {
    Logger.log(`Player (${player}) sold the tile (${tile})`, "API::tileSold", Logger.VERBOSE);
    websocket.broadcastUTF(JSON.stringify(new TileSoldEvent(player, tile)));
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

class TileSoldEvent extends Event {
    constructor(player, tile) {
        super("tile_sold_event", { player, tile });
    }
}

class PlayerExitedJailEvent extends Event {
    constructor(player, type) {
        super("exited_jail_event", { player, type });
    }
}

class RequestTradeEvent extends Event {
    constructor(target) {
        super("request_trade_event", { target });
    }
}

class TradeContentUpdateEvent extends Event {
    constructor(target, contents) {
        super("trade_content_update_event", { target, contents });
    }
}

class TradeAcceptUpdateEvent extends Event {
    constructor(target, successful, contents) {
        super("trade_accept_update_event", { target, successful, contents });
    }
}

class TradeConcludedEvent extends Event {
    constructor(p1, p2, successful, contents) {
        super("trade_concluded_event", { p1, p2, successful, contents });
    }
}

class PropertyChangedEvent extends Event {
    /**
     * @param {number} player The id of the player who made the purchase
     * @param {number} tile The id of the tile
     * @param {number} money The remaining balance of the player
     * @param {number} newLevel The new property level of this tile
     */
    constructor(player, tile, money, newLevel) {
        super("property_changed_event", { player, tile, money, new_level: newLevel });
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
     * @param {number} player The id of the player
     * @param {number} money The remaining balance of this player
     * @param {number} tile The id of the tile
     */
    constructor(player, money, tile) {
        super("tile_purchased_event", { player, tile, money });
    }
}

class MortgageEvent extends Event {
    /**
     * @param {number} player The id of the player
     * @param {number} money The remaining balance of this player
     * @param {number} tile The id of the tile
     */
    constructor(player, money, tile) {
        super("tile_mortgaged_event", { player, tile, money });
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

class PlayerLeaveEvent extends Event {
    /**
     * @param {String} username
     * @param {number} index 
     * @param {boolean} isBot 
     */
    constructor(username, index, isBot) {
        super("player_left", { username, index, isBot });
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

class PlayerReadyEvent extends Event {
    /**
     * @param {number} player 
     */
    constructor(player) {
        super("player_ready_event", { player });
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
    // Joining/Leaving
    startGame,
    readyUp,
    addPlayer,
    removePlayer,

    // Movement
    teleportTo,
    exitedJail,

    // Purchasing
    tilePurchased,
    propertyChanged,
    mortgageTile,
    tileSold,

    // Auction
    auctionStart,
    auctionShow,
    auctionBid,

    // Trade
    requestTrade,
    tradeContentUpdated,
    tradeAcceptUpdate,
    tradeConcluded,

    // Misc
    randomEvent,
    newTurn,

    setWebsocket: wss => { websocket = wss; }
}