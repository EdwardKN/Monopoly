var api = require('./api');
var pieces = JSON.parse(require('node:fs').readFileSync("./boardPieces.json"));

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

        this.playerStep = (onlyStep, player, diceRoll) => {
            this.currentPlayer.push(player);
            if(!onlyStep && !this.mortgaged){
                if (this.piece.price < 0) {
                    // Why would the price be negative?
                    player.money += this.piece.price;
                    alert(player.name + " betalade " + -this.piece.price + "kr")
                } else if (this.piece.price > 0 && this.owner === undefined) {
                    // If this isn't owned by anyone (and the price is more than 0kr; Why?)
                    setTimeout(() => {
                        if (this.piece.card === undefined) {
                            if(confirm("Vill du köpa " + this.piece.name + " för " + this.piece.price + "kr?" + "\n" + "\n"+ this.info())){
                                player.money -= this.piece.price;
                                this.owner = player;
                                player.ownedPlaces.push(this);
                            }  
                        } else if (player.bot === undefined) {
                            api.showCard(this);
//                            board.currentCard = this;
                        }
                    }, 50);
                } else if(this.owner !== player && this.owner !== undefined) {
                    // The owner isn't this player, but there is an owner.

                    if(this.piece.type === "utility"){
                        let amountOwned = this.owner.ownedPlaces.filter(e => e.piece.type == "utility").length;
                        let multiply = amountOwned == 1 ? 4 : 10;

                        player.money -=  diceRoll * multiply;
                        this.owner.money += diceRoll * multiply;

                        alert(this.owner.name + " fick precis " + (diceRoll * multiply) + "kr av " + player.name)                        
                    }else if(this.piece.type === "station"){
                        let amountOwned = this.owner.ownedPlaces.filter(e => e.piece.type == "station").length - 1;

                        player.money -=  25 * Math.pow(2,amountOwned);
                        this.owner.money += 25 * Math.pow(2,amountOwned);

                        alert(this.owner.name + " fick precis " + (25 * Math.pow(2,amountOwned)) + "kr av " + player.name)
                    }else{
                        let ownAll = BoardManager.board.boardPieces.filter(x => x != this).filter(x => x.piece.group == this.piece.group).every(x => x.owner == this.owner);
                        let multiply = this.level == 0 && ownAll ? 2 : 1;

                        player.money -= this.piece.rent[this.level] * multiply;
                        this.owner.money += this.piece.rent[this.level] * multiply;

                        alert(this.owner.name + " fick precis " + (this.piece.rent[this.level] * multiply) + "kr av " + player.name)
                    }
                 } else if (this.piece.type === "chance") {
                    let random = randomIntFromRange(0, ChanceTile.alternatives.length - 1);
                    ChanceTile.alternatives[random](player);
                }else if(this.piece.type === "community Chest"){
                    let random = randomIntFromRange(0, CommunityChestTile.alternatives.length - 1);
                    CommunityChestTile.alternatives[random](player);
                }else if(this.piece.type === "income tax"){
                    if(player.money > 2000){
                        alert("Betala 200kr i skatt")
                        player.money -= 200;
                    }else{
                        alert("Betala " + player.money * 0.1 + "kr i skatt")
                        player.money *= 0.9;
                    }
                }
            }
        }
    }    
}

class CommunityChestTile {
    static alternatives = [
        (player) => { alert("Gå till start!"); player.teleportTo(0); },
        (player) => { alert("Gå till finkan!"); player.goToPrison(); },
        (player) => { alert("Få 10kr av alla andra spelare"); player.money += (PlayerManager.getNumberOfPlayers() - 1) * 10; players.filter(x => x != player).forEach(x => { x.money -= 10; }); },
        (player) => { alert("Få 50kr av alla andra spelare"); player.money += (PlayerManager.getNumberOfPlayers() - 1) * 50; players.filter(x => x != player).forEach(x => { x.money -= 50; }); },
        (player) => { alert("Betala 40kr för varje hus du har och 135kr för varje hotell"); player.ownedPlaces.reduce((total, x) => total + (x.level < 5 ? 40*x.level : 135), 0); },
        (player) => { alert("Förlora 25kr!"); player.money -= 25; },
        (player) => { alert("Förlora 50kr!"); player.money -= 50; },
        (player) => { alert("Förlora 50kr!"); player.money -= 50; }, // Repeat? Why?
        (player) => { alert("Förlora 50kr!"); player.money -= 50; }, // Repeat? Why?
        (player) => { alert("Få 10kr"); player.money += 10; },
        (player) => { alert("Få 20kr"); player.money += 20; },
        (player) => { alert("Få 50kr!"); player.money += 50; },
        (player) => { alert("Få 100kr"); player.money += 100; },
        (player) => { alert("Få 100kr"); player.money += 100; }, // Repeat? Why?
        (player) => { alert("Få 100kr"); player.money += 100; }, // Repeat? Why?
        (player) => { alert("Få 200kr"); player.money += 200; },
        (player) => { alert("Inte inlagd, men ska vara ett GET OUT OF JAIL kort"); },
    ];
}

class ChanceTile {
    static alternatives = [
        (player) => { alert("Gå till start!"); player.teleportTo(0); },
        (player) => { alert("Gå till finkan!"); player.goToPrison(); },
        (player) => { alert("Gå till Hässleholm!"); player.teleportTo(24); },
        (player) => { alert("Gå till Simrishamn!"); player.teleportTo(11); },
        (player) => { alert("Gå till Malmö!"); player.teleportTo(39); },
        (player) => { alert("Gå till närmsta tågstation!"); player.teleportTo([ 15, 25, 35, 45 ].find(x => player.steps < x) % 40); },
        (player) => { alert("Gå tillbaka tre steg!"); player.teleportTo(player.steps - 3); },
        (player) => { alert("Betala 25kr för varje hus du har och 100kr för varje hotell"); player.ownedPlaces.reduce((total, x) => total + (x.level < 5 ? 25*x.level : 100), 0); },
        (player) => { alert("Få 50kr av alla andra spelare"); player.money += (PlayerManager.getNumberOfPlayers() - 1) * 50; PlayerManager.players.filter(x => x != player).forEach(x => x.money -= 50); },
        (player) => { alert("Få 50kr"); player.money += 50; },
        (player) => { alert("Få 150kr"); player.money += 150; },
        (player) => { alert("Inte inlagd, men ska vara ett GET OUT OF JAIL kort"); },
        (player) => { alert("Inte inlagd"); }
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

        this.update = function () {
            this.boardPieces.forEach(g => g.update())
            if(!this.win){
                this.boardPieces.forEach(g => {
                    // Left side    or right side
                    if (g.side == 0 || g.side === 3){
                        g.currentPlayer.forEach(p => p.update())
                    } else{
                        for (let i = (g.currentPlayer.length - 1); i >= 0; i--) {
                            // Why update this differently from the other sides?
                            g.currentPlayer[i].update()
                        }
                    }
                });
            }

            this.prisonExtra.currentPlayer.forEach(p => p.update())
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
        var player = new Player(PlayerManager.getNumberOfPlayers(), (Math.random() * 1e6).toString(16), false);

        PlayerManager.players.push(player);
        api.addPlayer(player.name, player.colorIndex, player.bot != undefined);

        return PlayerManager.players;
    }
}

class Player {
    /**
     * 
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
        
        this.rolls = false;
        this.numberOfRolls = false;
        this.inJail = false;
        this.ownedPlaces = [];
        this.timer = undefined;
        this.negative = false;

        // If this is a bot, it'll be set to a bot class
        this.bot = undefined;

        if(bot == true) {
            // Probably add this to backend
            this.bot = new Bot(this);
        }

        this.update = function () {
            this.money = Math.floor(this.money);
            this.checkMoney();
            if(this.bot !== undefined){
                this.bot.update();
            }
        }

        this.checkMoney = function(){
            if(this.money < 0 && this.ownedPlaces.length == 0){
                turn = turn % (players.length - 1);

                if(players.length-1 === 1){
                    // If there's only one player left
                    // the remaining player is the winner.
                    board.win = true;
                }
                this.money = 0;
                // Remove player
                players.splice(players.indexOf(this),1)

            }
            this.negative = this.money < 0;
        }

        this.teleportTo = (steps) => {
            this.steps = steps;
            api.teleportTo(this.steps, this.colorIndex);
        }

        this.goToPrison = function(){
            alert("Gå till finkan!")
            this.teleportTo(10)
            this.inJail = true;
            this.rolls = true;
        }

        this.getOutOfJail = function(){
            let self = this;
            board.prisonExtra.currentPlayer.forEach(function(e,i){
                if(e == self){
                    board.prisonExtra.currentPlayer.splice(i,1)
                }
            })
            self.inJail = false;
            self.steps = 10;
            board.boardPieces[10].playerStep(true,self);
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
                        let diceSum = dice1+dice2;

                        // Return dices to clients
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
                            board.randomizeDice();
                            board.dice1 = dice1;
                            board.dice2 = dice2;
                            board.showDices = true;

                            if(dice1 === dice2){
                                this.getOutOfJail()
                                this.teleportTo(this.steps + dice1 + dice2);
                            }
                            this.rolls = true;
                            setTimeout(() => {
                                board.showDices = false;
                            }, 1000);
                        }
                    }else{
                        turn = (turn+1)%players.length;
                        this.rolls = false;
                        this.numberOfRolls = 0;
                    }
                    
                }
            }
            
        }
    }
}

class Auction{
    constructor(card){
        this.card = card;
        this.turn = 0;
        this.auctionMoney = 0;
        this.time = 472;
        this.started = false;
        this.timer = undefined;
        this.playerlist = [...players];


        this.update = function(){
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

        this.addMoney = function(money){
            this.auctionMoney += money;
            this.turn = (this.turn + 1) % this.playerlist.length;
            this.time = 472;
        }
    }
}

module.exports = {
    PlayerManager,
    BoardManager
}