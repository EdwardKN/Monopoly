// WebsocketServer, used to broadcast messages to all
var websocket = undefined;

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
 * @param {BoardPiece} card The BoardPiece class.
 */
function showCard(card) {
    console.log(card);
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
    constructor(eventType, data) {
        this.event_type = eventType;
        this.data = data;
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
    setWebsocket: wss => { websocket = wss }
}