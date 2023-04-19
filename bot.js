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
const buyable = [1, 3, 5, 6, 8, 9, 11, 12, 13, 14, 15, 16, 18, 19, 21, 23, 24, 25, 26, 27, 28, 29, 31, 32, 34, 35, 37, 39]


class Bot{
    static boardInfo = {}

    constructor(player) {
        this.player = player
        this.thinking = false
    }

    async update() {
        if (this.thinking) { return }
        if (board.auction && board.auction.playerlist[board.auction.turn] === this.player) { this.bidOnAuction2(); return }
        if (this.player !== players[turn] || players.some(pl => pl.animationOffset !== 0) ||
            board.showDices || board.animateDices) { return }
        
        this.thinking = true
        await new Promise(resolve => setTimeout(resolve, randomIntFromRange(500, 1000)))
        this.thinking = false
        /* Logic Before */
        if (this.player.negative) {
            if (!this.handleBankrupt()) {
                this.player.ownedPlaces.forEach(bP => {
                    bP.owner = undefined
                })
                this.player.ownedPlaces = []
                return
            }
        }
        
        if (this.player.inJail) {
            let result = await this.handleJail()
            
            if (result === false) {
                turn = (turn + 1) % players.length
                board.showDices = false
                board.animateDices = false
                return
            } else {
                this.player.rolls = false
                this.player.getOutOfJail()
                this.player.teleportTo(this.player.steps + result)
            }
        }
        /* -------------------- */
        // Wait For All Animations To Finish
        this.player.rollDice()
        while (board.animateDices || this.player.animationOffset !== 0) { await new Promise(requestAnimationFrame) }
        if (this.player.inJail) { return }

        let bP = board.boardPieces[this.player.steps]

        if (this.player.negative) {
            this.handleBankrupt()
        }

        // Trade, Buy House


        // Buy or Auction
        if (bP.owner || !((bP.piece.type || bP.piece.group) in groups)) { return }

        let moneyLeft = this.player.money - bP.piece.price
        if (moneyLeft < this.getAverageLoss(12)) { 
            board.auction = new Auction(bP)
            board.currentCard = undefined
            board.buyButton.visible = false;
            board.auctionButton.visible = false;
        } else {
            let group = bP.piece.group || bP.piece.type
            let owners = {}
            for (let id of groups[group] || []) { 
                if (!board.boardPieces[id].owner) { continue }
                owners[players.indexOf(board.boardPieces[id].owner)]++ 
            }
            // Someone owns more than half
            if (moneyLeft > 2 * this.getAverageLoss(12) || Object.values(owners).some(amount => amount / groups[group].length >= 0.5)) {
                this.buyPiece(bP)  
            }
        }
        
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

    getAverageLoss(ahead) {
        let totalLoss = 0
        for (let i = 1; i <= ahead; i++) {
            let bP = board.boardPieces[(this.player.steps + i) % 40]
            // this.probabilityOfNumber() Will Just Return 0 For i > 12 which
            // you don't want if you check the entire board
            totalLoss += getPieceRent(bP, i, this.player) * (ahead > 12 ? 1 : probabilityOfNumber(i))
        }
        return totalLoss / ahead
    }

    getAverageIncome(ahead) {
        let totalIncome = 0
        for (let player of players) {
            if (player === this.player) { continue }
            for (let i = 1; i <= ahead; i++) {
                let bP = board.boardPieces[(player.steps + i) % 40]
                // this.probabilityOfNumber() Will Just Return 0 For i > 12 which
                // you don't want if you check the entire board
                totalIncome += getPieceRent(bP, i, player) * (ahead > 12 ? 1 : probabilityOfNumber(i))
            }
        }
        return totalIncome / ahead
    }

    async handleJail() {
        if (this.player.money > 5000 * 10) { // Less Than 1 / 10 Of Money Is Needed To Get Out Of Jail
            this.player.money -= 50
            return 0
        } else {
            let dice1 = randomIntFromRange(1, 6)
            let dice2 = randomIntFromRange(1, 6)
            await new Promise(resolve => this.player.animateDice(dice1, dice2, () => resolve()))
            return dice1 === dice2 ? dice1 + dice2 : false
        }
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
        const rankedPlayers = rankPlayers()
        const weights = {
            'ownGroup': 0.2,
            'enemyGroup': 0.1,
            'enemyRank': 0.1,
            'moneyLeft': 0.4,
            'moneySaved': 0.2
        }

        for (const option of [100, 10, 2]) {
            // Current Money, Current Price, Bid | (Average Income, Average Loss) > Average Money Change Next Cycle
            const remainingMoney = this.player.money - currentPrice - option// + this.getAverageIncome() - this.getAverageLoss()
            if (remainingMoney < 0) { continue }

            let moneyToSpend = originalPrice - currentPrice - option
            
            if (bP.piece.group) {
                let owner
                groups[bP.piece.group].forEach(id => {
                    let boardPiece = board.boardPieces[id]
                    if (boardPiece === bP) { return }
                    if (!owner) { owner = boardPiece.owner; return }
                    if (boardPiece.owner !== owner) { owner = null }
                })

                if (owner) {
                    let factor = owner === this.player ? 2 : 1.5
                    moneyToSpend += Math.min(moneyToSpend + factor * bP.piece.price, factor * this.player.money)
                }
            }

            if (moneyToSpend > 0) {
                this.thinking = true
                await new Promise(resolve => {
                    setTimeout(() => {
                        board.auction.addMoney(option)
                        this.thinking = false
                        resolve()
                    }, randomIntFromRange(1000, 2000))
                })
                break
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

function getPieceRent(boardPiece, steps, player) {
    if (!boardPiece.owner || boardPiece.mortgaged || boardPiece.owner === player) { return 0 }
    if (boardPiece.piece.type === 'station') {
        return 25 * Math.pow(2, boardPiece.owner.ownedPlaces.filter(bP => bP.piece.type === 'station').length - 1)
    } else if (boardPiece.piece.type === 'utility') {
        return steps * (boardPiece.owner.ownedPlaces.some(bP => bP.piece.type === 'utility') ? 10 : 4)
    } else {
        return boardPiece.piece.rent[boardPiece.level] * (hasGroup(boardPiece.piece.group, boardPiece.owner) ? 2 : 1)
    }
}

function rankPlayers() {
    return players.slice().sort((a,b) => {
        let valueA = 0
        let valueB = 0
        a.ownedPlaces.forEach(bP => valueA += bP.piece.price + bP.level * bP.piece.housePrice)
        b.ownedPlaces.forEach(bP => valueB += bP.piece.price + bP.level * bP.piece.housePrice)
        return valueA > valueB
    })
}