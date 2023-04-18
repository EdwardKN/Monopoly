var api = require('./api');

class PlayerManager {
    static players = [];
    static getNumberOfPlayers = () => PlayerManager.players.length;
    static playerJoined = () => {
        var player = new Player(PlayerManager.getNumberOfPlayers(), Math.round(Math.random() * 1e6).toString(16), false);

        PlayerManager.players.push(player);
        api.addPlayer(player.name, player.colorIndex, player.bot != undefined);

        return PlayerManager.players;
    }

    /**
     * @param {Player} player
     */
    static playerLeft = (player) => {
        PlayerManager.players.splice(PlayerManager.players.indexOf(player), 1);
    }
}

class Player {
    /**
     * @param {number} index 
     * @param {String} name The username of this player
     * @param {boolean} bot Whether or not this is a bot
     */
    constructor(index, name, bot) {
        // Username
        this.name = name;

        // Position
        this.steps = 0;

        // Money
        this.money = 1400;

        // Color of the piece, also a sort of id
        this.colorIndex = index;
        
        // Used for when the player rolls doubles
        this.rolls = false;

        // The number of times the player has rolled doubles in a row
        this.numberOfRolls = false;

        // Whether or not this player is in jail
        this.inJail = false;

        // All of the tiles owned by this player
        this.ownedPlaces = [];

        // Whether or not this player has a negative amount of money, e.g. when they've gone bankrupt and lost the game.
        this.negative = false;

        // Whether or not this is a bot
        this.isBot = bot;
    }

    teleportTo(steps) {
        this.steps = steps;
        api.teleportTo(this.steps, this.colorIndex);
    }
}

module.exports = {
    PlayerManager
}