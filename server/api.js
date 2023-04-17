// WebsocketServer, used to broadcast messages to all
var websocket = undefined;

/**
 * @param {Player[]} players
 */
function startGame(players) {
    websocket.broadcastUTF(JSON.stringify(new StartEvent(players)));
}

/**
 * @param {number} dice1 A value between 1-6
 * @param {number} dice2 A value between 1-6
 */
function diceRoll(dice1, dice2) {
    websocket.broadcastUTF(JSON.stringify(new DiceEvent(dice1, dice2)));
}

/**
 * @param {number} steps
 * @param {number} currentPlayerIndex
 */
function teleportTo(steps, currentPlayerIndex) {
    websocket.broadcastUTF(JSON.stringify(new MoveEvent(steps, currentPlayerIndex)));
}

/**
 * @param {String} username 
 * @param {number} index 
 * @param {boolean} isBot 
 */
function addPlayer(username, index, isBot) {
    websocket.broadcastUTF(JSON.stringify(new PlayerJoinEvent(username, index, isBot)));
}

/**
 * 
 * @param {number} id The id of the player whose turn it will be
 */
function newTurn(id) {
    websocket.broadcastUTF(JSON.stringify(new NewTurnEvent(id)));
}

/**
 * @param {BoardPiece} card The BoardPiece class.
 */
function showCard(card) {
    websocket.broadcastUTF(JSON.stringify(new ShowCardEvent(card)));
}

/**
 * Send an event to the clients that another player drew a chance card or community chest
 * @param {String} id The id of the event
 * @param {Player} player The player this event happened to
 */
function randomEvent(id, player) {
    websocket.broadcastUTF(JSON.stringify(new RandomEvent(id, player.colorIndex)));
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

class ShowCardEvent extends Event {
    /**
     * @param {object} card 
     */
    constructor(card) {
        super("show_card", { card });
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
    showCard,
    diceRoll,
    startGame,
    newTurn,
    setWebsocket: wss => { websocket = wss }
}