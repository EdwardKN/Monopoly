var { Tile } = require("./tile");
var { Player } = require("./player");
const { Logger } = require("./logger");

class Auction {
    /**
     * @param {Tile} tile 
     * @param {Player[]} players 
     */
    constructor(tile, players) {
        this.players = players;
        this.tile = tile;

        this.currentPlayer = players[0];
        this.highestBid = {
            bidder: players[0],
            amount: 0
        };
    }

    /**
     * @returns {Player} The player who's turn it changing to
     */
    changeTurn() {
        // Remove all players who don't have enough money
        this.players = this.players.filter(p => p.money >= this.highestBid.amount, this);

        var currentIndex = this.players.findIndex(p => p.colorIndex == this.currentPlayer.colorIndex, this);
        var nextIndex = (currentIndex + 1) % this.players.length;

        this.currentPlayer = this.players[nextIndex];
        return this.currentPlayer;
    }

    /**
     * @param {Player} player 
     * @param {number} amount 
     */
    bid(player, amount) {
        if (this.highestBid.amount < amount) {
            this.highestBid = {
                bidder: player,
                amount
            }
            Logger.log(`Player (${player.name}) bid ${amount}kr and is now the highest bidder`, "Auction::bid", Logger.STANDARD);
            Logger.log(JSON.stringify(this.players), "Auction::bid", Logger.VERBOSE);
            Logger.log(JSON.stringify(this.highestBid), "Auction::bid", Logger.VERBOSE);
        } else {
            var index = this.players.findIndex(p => p.colorIndex == player.colorIndex);
            this.players.splice(index, 1);
            Logger.log(`Player (${player.name}) didn't bid enough and got booted from the auction`, "Auction::bid", Logger.STANDARD);
            Logger.log(JSON.stringify(this.players), "Auction::bid", Logger.VERBOSE);
        }
    }
}

class AuctionManager {
    /**
     * @type {Auction}
     */
    static #auction = undefined;

    /**
     * @returns {Auction|undefined}
     */
    static getAuction() {
        if (AuctionManager.#auction == undefined) {
            AuctionManager.#auction = new Auction();
        }
        return AuctionManager.#auction;
    }

    static endAuction() {
        var tile = AuctionManager.#auction.tile;
        var highestBid = AuctionManager.#auction.highestBid;

        highestBid.bidder.money -= highestBid.amount;
        tile.owner = highestBid.bidder;

        AuctionManager.#auction = undefined;
    }
}

module.exports = {
    AuctionManager
}