// WebsocketServer, used to broadcast messages to all
var websocket = undefined;

/**
 * 
 * @param {number} steps
 * @param {number} currentPlayerIndex
 */
function teleportTo(steps, currentPlayerIndex) {
    websocket.broadcastUTF(JSON.stringify(new MoveEvent(steps, currentPlayerIndex)));
}

/**
 * 
 * @param {String} username 
 * @param {number} index 
 * @param {boolean} isBot 
 */
function addPlayer(username, index, isBot) {
    websocket.broadcastUTF(JSON.stringify(new PlayerJoinEvent(username, index, isBot)));
}

function showCard(card) {
    console.log("[ShowCard]");
    console.log(card);
}

class Event {
    constructor(eventType, data) {
        this.event_type = eventType;
        this.data = data;
    }
}

class PlayerJoinEvent extends Event {
    constructor(username, index, isBot) {
        super("player_joined", { username, index, isBot });
    }
}

class MoveEvent extends Event {
    /**
     * 
     * @param {number} steps 
     * @param {number} currentPlayerIndex 
     */
    constructor(steps, currentPlayerIndex) {
        super("move_event", { steps: steps, player: currentPlayerIndex });
    }
}


module.exports = {
    teleportTo,
    addPlayer,
    setWebsocket: wss => { websocket = wss }
}