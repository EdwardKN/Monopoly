var api = require('./api');
var pieces = JSON.parse(require('node:fs').readFileSync("./boardPieces.json"));

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
};

class BoardPiece{
    constructor(n){
        // The side on which this tile is located
        this.side = Math.floor(n/10);

        // n is the index of this tile
        this.n = n;

        // Data about the boardPiece such as cost, group and more.
        this.piece = pieces[this.n];

        // The player who owns this tile
        this.owner = undefined;

        // Level of buildings
        this.level = 0;

        // Players currently standing on this tile?
        this.currentPlayer = [];

        // If this is mortaged
        this.mortgaged = false;

        /**
         * 
         * @param {boolean} onlyStep Whether this is only visual or actual interaction?
         * @param {Player} player The current player
         * @param {number} diceRoll Dice sum
         */
        this.playerStep = (onlyStep, player, diceRoll) => {
            this.currentPlayer.push(player);
            if(!onlyStep && !this.mortgaged){
                if (this.piece.price < 0) {
                    // Why would the price be negative?
                    player.money += this.piece.price;
                    console.log(player.name + " betalade " + -this.piece.price + "kr")
                } else if(this.owner !== player && this.owner !== undefined) {
                    // The owner isn't this player, but there is an owner.

                    if(this.piece.type === "utility"){
                        let amountOwned = this.owner.ownedPlaces.filter(e => e.piece.type == "utility").length;
                        let multiply = amountOwned == 1 ? 4 : 10;

                        player.money -=  diceRoll * multiply;
                        this.owner.money += diceRoll * multiply;

                        console.log(this.owner.name + " fick precis " + (diceRoll * multiply) + "kr av " + player.name)                        
                    }else if(this.piece.type === "station"){
                        let amountOwned = this.owner.ownedPlaces.filter(e => e.piece.type == "station").length - 1;

                        player.money -=  25 * Math.pow(2,amountOwned);
                        this.owner.money += 25 * Math.pow(2,amountOwned);

                        console.log(this.owner.name + " fick precis " + (25 * Math.pow(2,amountOwned)) + "kr av " + player.name)
                    }else{
                        let ownAll = BoardManager.board.boardPieces.filter(x => x != this).filter(x => x.piece.group == this.piece.group).every(x => x.owner == this.owner);
                        let multiply = this.level == 0 && ownAll ? 2 : 1;

                        player.money -= this.piece.rent[this.level] * multiply;
                        this.owner.money += this.piece.rent[this.level] * multiply;

                        console.log(this.owner.name + " fick precis " + (this.piece.rent[this.level] * multiply) + "kr av " + player.name)
                    }
                 } else if (this.piece.type === "chance") {
                    // Pick a random alternative from the Chance Cards
                    let random = randomIntFromRange(0, ChanceTile.alternatives.length - 1);
                    ChanceTile.alternatives[random](player);
                }else if(this.piece.type === "community Chest"){
                    // Pick a random alternative from the Community Chest
                    let random = randomIntFromRange(0, CommunityChestTile.alternatives.length - 1);
                    CommunityChestTile.alternatives[random](player);
                }else if(this.piece.type === "income tax"){
                    // 10% of the player's money, up to a max of 200kr
                    var tax = Math.min(200, player.money * 0.10);
                    api.randomEvent("PAY_TAX", player);
                    console.log("Betala " + tax + "kr i skatt")
                    player.money -= tax;
                }
            }
        }
    }    
}

class CommunityChestTile {
    static alternatives = [
        (player) => { api.randomEvent("GO_TO_START", player); player.teleportTo(0); },
        (player) => { api.randomEvent("GO_TO_JAIL", player); player.goToPrison(); },
        (player) => { api.randomEvent("GET_10_FROM_OTHERS", player); player.money += (PlayerManager.getNumberOfPlayers() - 1) * 10; players.filter(x => x != player).forEach(x => { x.money -= 10; }); },
        (player) => { api.randomEvent("GET_50_FROM_OTHERS", player); player.money += (PlayerManager.getNumberOfPlayers() - 1) * 50; players.filter(x => x != player).forEach(x => { x.money -= 50; }); },
        (player) => { api.randomEvent("PAY_40_FOR_HOUSES_115_FOR_HOTELS", player); player.ownedPlaces.reduce((total, x) => total + (x.level < 5 ? 40*x.level : 115), 0); },
        (player) => { api.randomEvent("LOSE_25", player); player.money -= 25; },
        (player) => { api.randomEvent("LOSE_50", player); player.money -= 50; },
        (player) => { api.randomEvent("LOSE_50", player); player.money -= 50; },
        (player) => { api.randomEvent("LOSE_50", player); player.money -= 50; },
        (player) => { api.randomEvent("GET_10", player); player.money += 10; },
        (player) => { api.randomEvent("GET_20", player); player.money += 20; },
        (player) => { api.randomEvent("GET_50", player); player.money += 50; },
        (player) => { api.randomEvent("GET_100", player); player.money += 100; },
        (player) => { api.randomEvent("GET_100", player); player.money += 100; },
        (player) => { api.randomEvent("GET_100", player); player.money += 100; },
        (player) => { api.randomEvent("GET_200", player); player.money += 200; },
        (player) => { api.randomEvent("GET_OUT_OF_JAIL", player); },
    ];
}

class ChanceTile {
    static alternatives = [
        (player) => { api.randomEvent("GO_TO_START", player); player.teleportTo(0); },
        (player) => { api.randomEvent("GO_TO_PRISON", player); player.goToPrison(); },
        (player) => { api.randomEvent("GO_TO_HÄSSLEHOLM", player); player.teleportTo(24); },
        (player) => { api.randomEvent("GO_TO_SIMRISHAMN", player); player.teleportTo(11); },
        (player) => { api.randomEvent("GO_TO_MALMÖ", player); player.teleportTo(39); },
        (player) => { api.randomEvent("GO_TO_STATION", player); player.teleportTo([ 15, 25, 35, 45 ].find(x => player.steps < x) % 40); },
        (player) => { api.randomEvent("GO_BACK_3", player); player.teleportTo(player.steps - 3); },
        (player) => { api.randomEvent("PAY_25_FOR_HOUSES_100_FOR_HOTELS", player); player.ownedPlaces.reduce((total, x) => total + (x.level < 5 ? 25*x.level : 100), 0); },
        (player) => { api.randomEvent("GET_50_FROM_OTHERS", player); player.money += (PlayerManager.getNumberOfPlayers() - 1) * 50; PlayerManager.players.filter(x => x != player).forEach(x => x.money -= 50); },
        (player) => { api.randomEvent("GET_50", player); player.money += 50; },
        (player) => { api.randomEvent("GET_150", player); player.money += 150; },
        (player) => { api.randomEvent("GET_OUT_OF_JAIL", player); }
    ];
}

class Board {
    constructor() {
        this.boardPieces = [];
        this.prisonExtra = new BoardPiece(-1,[])
        this.win = false;
        this.auction = undefined;

        for (var i = 0; i < 40; i++) {
            // Initialize all of the boardPieces
            this.boardPieces[i] = new BoardPiece(i);
        }

        this.update = () => {
            if(this.auction !== undefined){
                this.auction.update();
            }
        }  
    }
}

class BoardManager {
    static board = new Board();

    // Should return some information about the state of the board
    static getJoinInfo = () => BoardManager.board;
}

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
     * 
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

        // If this is a bot, it'll be set to a bot class
        this.bot = undefined;

        if(bot == true) {
            // Probably add this to backend
            this.bot = new Bot(this);
        }

        this.update = () => {
            this.money = Math.floor(this.money);
            this.checkMoney();
            if(this.bot !== undefined){
                this.bot.update();
            }
        }

        this.checkMoney = function(){
            if(this.money < 0 && this.ownedPlaces.length == 0){
                turn = turn % (players.length - 1);

                if(players.length - 1 === 1){
                    // If there's only one player left
                    // the remaining player is the winner.
                    board.win = true;
                }
                this.money = 0;
                // Remove player
                PlayerManager.players.splice(players.indexOf(this),1)
            }
            this.negative = this.money < 0;
        }

        this.teleportTo = (steps) => {
            var diceSum = steps - this.steps;
            this.steps = steps;
            BoardManager.board.boardPieces[this.steps].playerStep(false, this, diceSum);
            api.teleportTo(this.steps, this.colorIndex);
        }

        this.goToPrison = () => {
            this.teleportTo(10)

            this.inJail = true;
            this.rolls = true;
        }

        this.getOutOfJail = () => {
            BoardManager.board.prisonExtra.currentPlayer.forEach((player, index) => {
                console.log(this);
                if(player == this){
                    BoardManager.board.prisonExtra.currentPlayer.splice(index, 1);
                }
            })
            this.inJail = false;
            this.steps = 10;
            board.boardPieces[10].playerStep(true,this);

        }
        
        this.rollDice = function(){
            // Delete all visual stuff from this function
            if(this.negative === false){
                if(this.inJail === false){
                    if(this.rolls === false){
                        let oldStep = this.steps;

                        let dice1 = randomIntFromRange(1,6);
                        let dice2 = randomIntFromRange(1,6);

                        if(dice1 === dice2){
                            if(this.numberOfRolls === 3){
                                this.goToPrison();
                            }
                            this.numberOfRolls++;
                            this.rolls = false;
                        }else{
                            this.rolls = true;
                        }

                        api.diceRoll(dice1, dice2);
                    }else{
                        turn = (turn+1)%players.length;
                        this.rolls = false;
                        this.numberOfRolls = 0;
                        board.dice1 = 0;
                        board.dice2 = 0;
                    }
                }else{
                    if(this.rolls === false){
                        if(confirm("Vill du betala 50kr för att komma ut eller slå dubbelt?")){
                            this.money -= 50;
                            this.rolls = true;
                            this.getOutOfJail();
                        }else{
                            let dice1 = randomIntFromRange(1,6);
                            let dice2 = randomIntFromRange(1,6);
                            BoardManager.board.randomizeDice();
                            board.dice1 = dice1;
                            board.dice2 = dice2;

                            if (dice1 === dice2) {
                                this.getOutOfJail()
                                this.teleportTo(this.steps + dice1 + dice2);
                            }
                            this.rolls = true;
                        }
                    } else {
                        turn = (turn + 1) % PlayerManager.players.length;
                        this.rolls = false;
                        this.numberOfRolls = 0;
                    }
                }
            }
        }
    }
}

class Auction {
    constructor(card){
        this.card = card;
        this.turn = 0;
        this.auctionMoney = 0;
        this.started = false;
        this.playerlist = [...players];

        this.update = () => {
            if(this.playerlist[this.turn].money < (this.auctionMoney + 2)){
                this.addMoneyButton2.disabled = true;
            }else{
                this.addMoneyButton2.disabled = false;
            }
            
            if(this.playerlist[this.turn].money < (this.auctionMoney + 10)){
                this.addMoneyButton10.disabled = true;
            }else{
                this.addMoneyButton10.disabled = false;
            }

            if(this.playerlist[this.turn].money < (this.auctionMoney + 100)){
                this.addMoneyButton100.disabled = true;
            }else{
                this.addMoneyButton100.disabled = false;
            }
        }

        this.addMoney = money => {
            this.auctionMoney += money;
            this.turn = (this.turn + 1) % this.playerlist.length;
        }
    }
}

module.exports = {
    PlayerManager,
    BoardManager
}