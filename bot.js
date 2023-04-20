const ranking = {
    group: {
        'brown': 3,
        'light blue': 2.5,
        'pink': 2.6,
        'orange': 3,
        'red': 2.8,
        'yellow': 2.5,
        'green': 2,
        'blue': 2.2,
    },
    station: {
        0: 1,
        1: 1.5,
        2: 2,
        3: 2.5
    },
    utility: {
        0: 1,
        1: 3
    }
}

const boardWeights = {
    1: 1,
    3: 1.2,
    5: 2,
    6: 1.2,
    8: 1.2,
    9: 1.4,
    11: 1,
    12: 1,
    13: 1.1,
    14: 1.1,
    15: 1,
    16: 1.7,
    18: 1.7,
    19: 1.6,
    21: 1.5,
    23: 1.7,
    24: 2,
    25: 1,
    26: 1.2,
    27: 1.3,
    28: 1,
    29: 1.4,
    31: 1.1,
    32: 1.2,
    34: 1.3,
    35: 1,
    37: 1.5,
    39: 2
}



class Bot{
    static boardInfo = {}
    static thinking = false

    constructor(player) {
        this.player = player
    }

    async update() {
        if (Bot.thinking) { return }
        if (board.auction) {
            if (board.auction.playerlist[board.auction.turn] === this.player) {
                if (!board.auction.started) {
                    board.auction.started = true
                    board.auction.duration = 10 * speeds.auctionSpeed
                    board.auction.startTime = performance.now()
                    board.auction.timer = setInterval(() => { board.auction.time = 472 * (1 - (performance.now() - board.auction.startTime) / board.auction.duration) }, 10)
                }
                this.bidOnAuction()
            }
            return
        }
        if (this.player !== players[turn] || players.some(pl => pl.animationOffset !== 0) ||
            board.showDices || board.animateDices) { return }
        
        Bot.thinking = true; await new Promise(resolve => setTimeout(resolve, randomIntFromRange(speeds.botMin, speeds.botMax))); Bot.thinking = false

        if (this.player.negative) {
            if (!this.handleBankrupt()) {
                this.player.ownedPlaces.forEach(bP => {
                    bP.owner = undefined
                })
                this.player.ownedPlaces = []
                players.splice(players.indexOf(this.player), 1)
                turn = turn >= players.length ? 0 : turn
                delete this.player, this
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
        Bot.thinking = true
        this.player.rollDice()
        while (board.animateDices || this.player.animationOffset !== 0) { await new Promise(requestAnimationFrame) }
        if (['chance', 'community chest'].includes(board.boardPieces[this.player.steps].type)) {
            await new Promise(resolve => setTimeout(resolve, 250))
        }
        await new Promise(resolve => setTimeout(resolve, randomIntFromRange(speeds.botMin, speeds.botMax)))
        while (this.player.animationOffset !== 0) { await new Promise(requestAnimationFrame) } 
        let bP = board.boardPieces[this.player.steps]
        
        players[turn].rolls = false
        players[turn].numberOfRolls = 0
        turn = (turn + 1) % players.length
        board.dice1 = 0
        board.dice2 = 0
        Bot.thinking = false

        if (this.player.negative) {
            this.handleBankrupt()
        }

        if (!bP.owner && buyable.includes(bP.n)) {
            // Buy or Auction
            let moneyLeft = this.player.money - bP.piece.price
            if (moneyLeft < this.getAverageLoss(12)) { 
                board.auction = new Auction(bP)
                board.currentCard = undefined
                board.buyButton.visible = false
                board.auctionButton.visible = false
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
        } else if (bP.owner) { this.player.checkDebt(bP.owner) }

        // Create Trade
        

        // Unmortgage
        for (let bP of this.player.ownedPlaces) {
            if (!bP.mortgaged) { continue }

        }
    }


    buyPiece(boardPiece) {
        this.player.money -= boardPiece.piece.price
        this.player.playerBorder.startMoneyAnimation(-boardPiece.piece.price)
        boardPiece.owner = this.player
        this.player.ownedPlaces.push(boardPiece)
    }

    sellPiece(boardPiece) {
        if (!boardPiece.mortgaged) { this.player.money += boardPiece.piece.price / 2;this.player.playerBorder.startMoneyAnimation(boardPiece.piece.price / 2)}
        boardPiece.owner = undefined
        this.player.ownedPlaces.splice(this.player.ownedPlaces.indexOf(boardPiece), 1)
        if (this.player.ownedPlaces.length === 0 && this.player.money < 0) { this.player.checkDept() }
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
        if (this.player.money > 75 * 10) { // Less Than 1 / 15 Of Money Is Needed To Get Out Of Jail
            this.player.money -= 50
            this.player.playerBorder.startMoneyAnimation(-50);
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
       

        for (const option of [100, 10, 2]) {
            // Current Money, Current Price, Bid | (Average Income, Average Loss) > Average Money Change Next Cycle
            const remainingMoney = this.player.money - currentPrice - option
            if (remainingMoney < this.getAverageLoss(12)) { continue }

            let moneyToSpend = originalPrice - currentPrice - option
            let maxValueToSpend = bP.piece.price

            players.forEach(player => {
                if (player.ownedPlaces.filter(bP2 => bP2.piece.group === bP.piece.group).length / groups[bP.piece.group] > 0.5) {
                    if (player === this.player) { maxValueToSpend }
                }
            })

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
                    moneyToSpend += Math.min(moneyToSpend + factor * bP.piece.price, 1.2 * this.player.money)
                }
            }

            if (moneyToSpend > 0) {
                Bot.thinking = true
                await new Promise(resolve => {
                    setTimeout(() => {
                        board.auction.addMoney(option)
                        Bot.thinking = false
                        resolve()
                    }, randomIntFromRange(speeds.botMin, speeds.botMax))
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
        return 25 * Math.pow(2, ownedStations(player).length - 1)
    } else if (boardPiece.piece.type === 'utility') {
        return (7 || steps) * [0, 4, 10][ownedUtility(player).length]
    } else {
        return boardPiece.piece.rent[boardPiece.level] * (hasGroup(boardPiece.piece.group, boardPiece.owner) ? 2 : 1)
    }
}

function ownedUtility(player) {
    return player.ownedPlaces.filter(bP => bP.piece.type === 'utility')
}

function ownedStations(player) {
    return player.ownedPlaces.filter(bP => bP.piece.type === 'station')
}

function getPieceCost(bP, player) {
    if (!bP.owner || bP.owner === player) { return 0 }
    return bP.piece.price || 0
}

function rankPlayers() {
    return players.slice().sort((a,b) => {
        let valueA = 0
        let valueB = 0
        a.ownedPlaces.forEach(bP => valueA += getPieceRent(bP, null, a))
        b.ownedPlaces.forEach(bP => valueB += getPieceRent(bP, null, b))
        return valueA > valueB
    })
}