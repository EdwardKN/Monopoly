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
 */
function randomEvent(id, player) {
    console.log("[S->C] Random event with id: (%s) happened to player (%s)", id, player.name);
    websocket.broadcastUTF(JSON.stringify(new RandomEvent(id, player.colorIndex)));
}

/**
 * 
 * @param {number} player The id of the player
 * @param {number} money The remaining balance of this player
 * @param {number} tile The id of the tile
 */
function tilePurchased(player, money, tile) {
    console.log("[S<-C] Player (%s) purchased the tile: (%d). Remaining balance: %dkr", player, tile, money);
    websocket.broadcastUTF(JSON.stringify(new TilePurchasedEvent(player, money, tile)));
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
     */
    constructor(id, player) {
        super("random_card", { id, player });
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
    randomEvent, // Unused
    tilePurchased,
    diceRoll, // Unused
    startGame,
    newTurn,
    setWebsocket: wss => { websocket = wss; }
}