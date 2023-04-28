var api = require('./api');

class PlayerManager {
    static players = [];
    static availableColors = [ 0, 1, 2, 3, 4, 5, 6, 7 ];
    static getNumberOfPlayers = () => PlayerManager.players.length;

    /**
     * @param {String} username The name of this new player
     * @returns {Player[]} All the players in the game
     */
    static playerJoined = (username) => {
        var player = new Player(PlayerManager.availableColors.shift(), username, false);

        PlayerManager.players.push(player);
        api.addPlayer(player.name, player.colorIndex, player.bot != undefined);

        return PlayerManager.players;
    }

    /**
     * @param {Player} player The player who left
     */
    static playerLeft = (player) => {
        PlayerManager.players.splice(PlayerManager.players.indexOf(player), 1);
        PlayerManager.availableColors.unshift(player.colorIndex);

        api.removePlayer(player.name, player.colorIndex, player.bot != undefined);
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
        this.money = 0;

        // Color of the piece, also a sort of id
        this.colorIndex = index;
        
        // Whether or not this player is in jail
        this.inJail = false;

        // All of the tiles owned by this player
        this.ownedPlaces = [];

        // Whether or not this player has a negative amount of money, e.g. when they've gone bankrupt and lost the game.
        this.negative = false;

        // Whether or not this is a bot
        this.isBot = bot;

        // Whether or not this player is ready to start the game
        this.isReady = false;
    }

    teleportTo(steps) {
        this.steps = steps;
        api.teleportTo(this.steps, this.colorIndex);
    }
}

module.exports = {
    PlayerManager
}