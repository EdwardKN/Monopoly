const groups = {
    'brown': [1, 3],
    'light blue': [6, 8, 9],
    'pink': [11, 13, 14],
    'orange': [16, 18, 19],
    'red': [21, 23, 24],
    'yellow': [26, 27, 29],
    'green': [31, 32, 34],
    'blue': [37, 39],
    'station': [5, 15, 25, 35],
    'utility': [12, 28]
}
let play = false
class Bot{
    constructor(player) {
        this.player = player
    }

    async update() {
        if (this.player !== players[turn] || players.some(pl => pl.animationOffset !== 0) ||
            board.showDices === true || board.animateDices === true || !play) { return }

        /* Logic Before */
        if (this.player.negative) {
            if (this.handleBankrupt()) {
                this.player.negative = false
            } else { // Lost
                this.player.ownedPlaces.forEach(bP => {
                    bP.owner = undefined
                })
                return
            }
        }
        
        if (this.player.inJail) {
            let result = await this.handleJail()
    
            if (result != false) { // Out
                this.player.numberOfRolls = 0
                this.player.getOutOfJail()
                this.player.rolls = false
                this.player.teleportTo(this.player.steps + result)
            } else {
                this.player.numberOfRolls++
                turn++
                board.showDices = false
                board.animateDices = false

                currentPlayer = players[turn]
                return
            }
        }
        /* -------------------- */
        // Wait For All Animations To Finish
        this.player.rollDice()
        while (board.animateDices || this.player.animationOffset !== 0) { await new Promise(requestAnimationFrame) }

        /* Logic After */
        let bP = board.boardPieces[this.player.steps]

        /*
        Checklist
        Buy:
        Piece or Auction or House or Mortgage back or Disrupt Group


        3. Trade? 
        4. Mortgage? 
        */

        if (this.player.negative) {
            this.handleBankrupt()
        }


        // Buy or Auction
        if ((bP.piece.type || bP.piece.group) in groups && bP.owner === undefined) {
            let moneyLeft = this.player.money - bP.piece.price
            let group = bP.piece.group || bP.piece.type
            if (moneyLeft < this.getAvergePrice(12)) { 
                board.auction = new Auction(bP)
                board.currentCard = undefined
                board.buyButton.visible = false;
                board.auctionButton.visible = false;
            } else {
                let owners = {}
                for (const id of groups[group] || []) {
                    let boardPiece = board.boardPieces[id]
                    owners[boardPiece.owner] = (owners[boardPiece.owner] || 0) + 1
                }
                // Someone owns more than half
                if (moneyLeft > 2 * this.getAvergePrice(12) || Object.keys(owners).some(e => e && owners[e] / groups[group].length >= 0.5)) {
                    this.buyPiece(bP)  
                }
            }
        }
    }

    async handleJail() {
        if (this.player.numberOfRolls === 3) { return 0 }

        if (this.player.money > 50000 * 10) { // Less Than 1 / 10 Of Money Is Needed To Get Out Of Jail
            this.player.money -= 50
            return 0
        } else {
            let r = 0
            await this.animateasdasd(function(dice1, dice2){
                r = dice1 === dice2 ? dice1 + dice2 : false
            })
            return r
        }
    }
    
    // Morgtage
    // Sell House
    // Morgtage
    // Sell Everything
    handleBankrupt() {
        while (this.player.money < 0) {
            for (const bP of this.player.ownedPlaces) {
                /* TEMPORARY FIX */
                if (this.player.money < 0) {
                    sellPiece(bP)
                }
            }
        }
        return true
    }

    getAvergePrice(ahead) {
        let totalPrice = 0
        let stationsOwned = this.player.ownedPlaces.filter(bP => bP.piece.type === 'station').length
        let utilitysOwned = this.player.ownedPlaces.filter(bP => bP.piece.type === 'utility').length
        let diceValue = this.player.dice1 + this.player.dice2
        for (let i = 1; i <= ahead; i++) {
            let bP = board.boardPieces[(this.player.steps + i) % 40]
            if (!bP || !bP.owner) { continue }

            if (bP.piece.type === 'station') {
                totalPrice += 25 * Math.pow(bP.piece.price, stationsOwned)
            } else if (bP.piece.type === 'utility') {
                totalPrice += diceValue * (utilitysOwned === 1 ? 4 : 10)
            } else if (bP.owner !== this.player) {
                totalPrice += bP.piece.rent[bP.level] * (this.hasGroup(bP.piece.group) ? 2 : 1)
            }
        }
        return totalPrice / 12
    }

    buyPiece(boardPiece) {
        this.player.money -= boardPiece.piece.price
        boardPiece.owner = this.player
        this.player.ownedPlaces.push(boardPiece)
    }

    sellPiece(boardPiece) {
        if (!boardPiece.mortgaged) { this.player.money += boardPiece.piece.price / 2 }
        boardPiece.owner = undefined
        this.player.ownedPlaces.splice(this.player.ownedPlaces.indexOf(boardPiece), 1)
    }

    hasGroup(group) {
        for (const step of groups[group]) {
            if (board.boardPieces[step].owner !== this.player) { return false }
        }
        return true
    }

    bidOnAuction() {
        const bP = board.auction.card
        const originalPrice = bP.piece.price
        const currentPrice = board.auction.auctionMoney
        const options = [2, 10, 100].filter(price => price < this.player.money - currentPrice)
        const averageLoss = 0
        let averageIncome = 0

        if (options.length === 0) { return }

        // Importance From 0 - 100+
        let importance = 0
        if (bP.piece.type === 'utility' && this.player.ownedPlaces.some(bP => bP.piece.type === 'utility')) {
            importance += 50
        } else if (bP.piece.type === 'station' && this.player.ownedPlaces.some(bP => bP.piece.type === 'station')) {
            const stationsOwned = this.player.ownedPlaces.filter(bP => bP.piece.type === 'station')
            importance += 25 * stationsOwned
        } // Check Group Fix Later

        // Not Very Smart To Buy The Piece For More Expensive
        const difference = currentPrice / originalPrice
        importance += 100 * (1 - difference)

        // Average Income - Average Loss
        const shareLost = (averageIncome - averageLoss) / this.player.money
        importance += 100 * (1 - shareLost)

        for (let i = options.length - 1; i >= 0; i--) {
            if (options[i] < importance) { board.auction.addMoney(options[i]) }
        }

    }

    async animateasdasd(callback) {
        return new Promise(resolve => {
        let dice1 = randomIntFromRange(1, 6)
        let dice2 = randomIntFromRange(1, 6)

        board.animateDices = true;
        let counter = 25;
        var myFunction = function() {
            board.randomizeDice();
            board.dice1 = randomIntFromRange(1,6)
            board.dice2 = randomIntFromRange(1,6)
            playSound(sounds.dice,0.25)
            counter *= 1.2;
            if(counter > 1000){
                playSound(sounds.dice,0.25)
                board.dice1 = dice1;
                board.dice2 = dice2;
                setTimeout(() => {
                    callback(dice1, dice2)
                    resolve()
                }, 1000);                  
            }else{
                setTimeout(myFunction, counter);
            }
        }
        setTimeout(myFunction, counter);})
    }
}