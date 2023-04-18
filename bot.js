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

class Bot{
    static boardInfo = {}

    constructor(player) {
        this.player = player
        this.thinking = false
    }

    async update() {
        if (this.thinking) { return }

        if (board.auction && board.auction.playerlist[board.auction.turn] === this.player) {
            this.bidOnAuction(); return }

        if (this.player !== players[turn] || players.some(pl => pl.animationOffset !== 0) ||
            board.showDices === true || board.animateDices === true) { return }
        
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

            if (result === false) {
                turn++
                board.showDices = false
                board.animateDices = false
                return
            } else {
                this.player.getOutOfJail()
                this.player.rolls = false
                this.player.teleportTo(this.player.steps + result)
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
            if (moneyLeft < this.getAverageLoss(12)) { 
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
                if (moneyLeft > 2 * this.getAverageLoss(12) || Object.keys(owners).some(e => e && owners[e] / groups[group].length >= 0.5)) {
                    this.buyPiece(bP)  
                }
            }
        }
    }

    async handleJail() {
        if (this.player.money > 50 * 10) { // Less Than 1 / 10 Of Money Is Needed To Get Out Of Jail
            this.player.money -= 50
            return 0
        } else {
            let r = 0
            await this.animateasdasd(function(dice1, dice2) {
                r = dice1 === dice2 ? dice1 + dice2 : false
            })
            return r
        }
    }

    getAverageLoss(ahead) {
        let totalLoss = 0
        for (let i = 1; i <= ahead; i++) {
            let bP = board.boardPieces[(this.player.steps + i) % 40]
            let value = 0

            if (!bP.owner || bP.owner === this.player || bP.mortgaged) { continue }
            if (bP.piece.type === 'station') {
                value += 25 * Math.pow(bP.piece.price, bP.owner.ownedPlaces.filter(bP => bP.piece.type === 'station')).length
            } else if (bP.piece.type === 'utility') {
                value += i * (bP.owner.ownedPlaces.some(bP => bP.piece.type === 'utility') ? 10 : 4)
            } else {
                value += bP.piece.rent[bP.level] * (hasGroup(bP.piece.group, bP.owner) ? 2 : 1)
            }
            // this.probabilityOfNumber() Will Just Return 0 For i > 12 which
            // you don't want if you check the entire board
            totalLoss += value * (ahead > 12 ? 1 : probabilityOfNumber(i))
        }
        return totalLoss / ahead
    }

    getAverageIncome(ahead) {
        let totalIncome = 0
        for (let player of players) {
            if (player === this.player) { continue }

            for (let i = 1; i <= ahead; i++) {
                let bP = board.boardPieces[(player.steps + i) % 40]
                let value = 0
                if (!bP.owner || bP.owner === player || bP.mortgaged) { continue }
                if (bP.piece.type === 'station') {
                    value += 25 * Math.pow(bP.piece.price, bP.owner.ownedPlaces.filter(bP => bP.piece.type === 'station')).length
                } else if (bP.piece.type === 'utility') {
                    value += i * (bP.owner.ownedPlaces.some(bP => bP.piece.type === 'utility') ? 10 : 4)
                } else {
                    value += bP.piece.rent[bP.level] * (hasGroup(bP.piece.group, this.player) ? 2 : 1)
                }
                // this.probabilityOfNumber() Will Just Return 0 For i > 12 which
                // you don't want if you check the entire board
                totalIncome += value * (ahead > 12 ? 1 : probabilityOfNumber(i))
            }
        }
        return totalIncome / ahead
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
            setTimeout(myFunction, counter);
        })
    }


    /* FIX */

    
    // Morgtage
    // Sell House
    // Morgtage
    // Sell Everything
    handleBankrupt() {
        while (this.player.money < 0) {
            for (const bP of this.player.ownedPlaces) {
                /* TEMPORARY FIX */
                if (this.player.money < 0) {
                    this.sellPiece(bP)
                }
            }
        }
        return true
    }

    async bidOnAuction() {
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
        if (importance + currentPrice > originalPrice) { importance -= 10 }
        



        this.thinking = true
        setTimeout(() => {
            for (let i = options.length - 1; i >= 0; i--) {
                if (options[i] < importance) { board.auction.addMoney(options[i]); return }
            }
            this.thinking = false
        }, randomIntFromRange(1000, 2000))
    }

    async bidOnAuction2() {
        const bP = board.auction.card
        const originalPrice = bP.piece.price
        const currentPrice = board.auction.auctionMoney
        const rankPlayers = players.sort((a,b) => {
            let valueA = 0
            let valueB = 0
            a.ownedPlaces(bP => valueA += bP.piece.rent[bP.level] * (hasGroup(bP.piece.group, a) ? 1 : 2))
            b.ownedPlaces(bP => valueB += bP.piece.rent[bP.level] * (hasGroup(bP.piece.group, b) ? 1 : 2))
            return valueA > valueB
        })
        console.log(rankPlayers)
        return

        for (const option of [100, 10, 2]) {
            // Current Money, Current Price, Bid | (Average Income, Average Loss) > Average Money Change Next Cycle
            const remainingMoney = this.player.money - currentPrice - option// + this.getAverageIncome() - this.getAverageLoss()
            if (remainingMoney < 0) { continue }

            let extraMoneyToSpend = originalPrice - currentPrice - option
            if (bP.piece.type === 'utility') {
                for (const player in players) {
                    if (player.some.ownedPlaces.some(bP => bP.piece.type === 'utility')) {
                        extraMoneyToSpend += Math.min(10)
                        break
                    }
                }
            } else if (bP.piece.type === 'station') {
                let ownedStations = players.reduce((dict, player, i) => {
                    dict[i] = player.ownedPlaces.filter(bP => bP.piece.type === 'station')
                    return dict
                }, {})
                console.log(ownedStations)
            }
        }
    }
}

function probabilityOfNumber(target) {
    let count = 0
    for (let i = 0; i <= 6; i++) {
        if (target - i >= target || i >= target || target - i > 6) { continue }
        count++
    }
    return count / 36
}

function hasGroup(group, player) {
    return groups[group].every(pos => !board.boardPieces[pos].mortgaged
        && board.boardPieces[pos].owner === player)
}