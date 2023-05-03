const specialWeights = {
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
    39: 1.7
}

/*
even: true Bygga hus jämnt
mortgage: true
*/

class Bot{
    /**
    * @param {object} boardInfo Every Players Owned Pieces With The Index As The Key
    * @param {boolean} thinking If Any Bot Is Currently Playing A Move
    **/
    static boardInfo = {}
    static thinking = false

    constructor(player) {
        this.player = player
        this.randomness = 0.1
    }

    async update() {
        if (board.trade) { await this.handleTrade('receive') }

        if (Bot.thinking) { return }
        
        // Bid And Start Auction
        if (board.auction) {
            if (board.auction.playerlist[board.auction.turn] === this.player) {
                if (!board.auction.started) {
                    board.auction.started = true;
                    board.auction.duration = 10 * speeds.auctionSpeed;
                    board.auction.startTime = performance.now();
                    board.auction.timer = setInterval(() => { board.auction.time = 472 * (1 - (performance.now() - board.auction.startTime) / board.auction.duration) },10);
                }
                this.bidOnAuction()
            }
            return
        }
        // Check If Bots Turn And No Animations Are Playing
        if (this.player !== players[turn] || players.some(p => p.animationOffset !== 0) ||
            board.showDices || board.animateDices) { return }
        // Random Delay
        Bot.thinking = true
        await new Promise(resolve => setTimeout(resolve, randomIntFromRange(speeds.botMin, speeds.botMax)))
        Bot.thinking = false

        // Before Roll Dice
        if (!await this.handleBankrupt()) {
            this.player.ownedPlaces.forEach(bP => bP.owner = undefined)
            this.player.ownedPlaces = []
            players.splice(players.indexOf(this.player), 1)
            turn = turn % players.length
            return
        }

        if (this.player.inJail) {
            let result = await this.handleJail()
            
            if (result === false) {
                turn = (turn + 1) % players.length
                board.showDices = false // Should not return here
                board.animateDices = false
                return
            } else {
                this.player.rolls = false
                this.player.getOutOfJail()
                this.player.teleportTo(this.player.steps + result)
            }
        }

        // Roll Dice | Random awaits For Temporary Alerts Fix
        Bot.thinking = true
        this.player.rollDice()
        while (board.animateDices || this.player.animationOffset !== 0) { await new Promise(requestAnimationFrame) }
        if (['chance', 'community chest'].includes(board.boardPieces[this.player.steps].type)) {
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        await new Promise(resolve => setTimeout(resolve, randomIntFromRange(speeds.botMin, speeds.botMax)))
        while (this.player.animationOffset !== 0) { await new Promise(requestAnimationFrame) } 
        let bP = board.boardPieces[this.player.steps]

        await new Promise(resolve => setTimeout(resolve, randomIntFromRange(speeds.botMin, speeds.botMax)))
        // Bankrupt after move?
        if (!await this.handleBankrupt()) {
            Bot.thinking = false
            this.player.ownedPlaces.forEach(bP => bP.owner = undefined)
            this.player.ownedPlaces = []
            players.splice(players.indexOf(this.player), 1)
            turn = turn % players.length
            return
        }


        if (!bP.owner && Object.keys(boardWeights).includes(`${bP.n}`) &&
        this.player.laps >= board.settings.roundsBeforePurchase) {
            // Buy or Auction
            let moneyLeft = this.player.money - bP.piece.price
            if (moneyLeft < this.getAverageLoss(12) && board.settings.auction) { 
                board.auction = new Auction(bP)
                board.currentCard = undefined
                board.buyButton.visible = false
                board.auctionButton.visible = false
            } else {
                let func = bP
                let args = []
                if (bP.piece.group) {
                    func = 'ownedGroup'
                    args.push(bP.piece.group)
                } else {
                    func = bP.piece.type === 'utility' ? 'ownedUtility' : 'ownedStations'
                }
                
                // Someone owns more than half
                if (moneyLeft > 2 * this.getAverageLoss(12) || players.some(player => this[func](player, ...args).length >= 0.5)) {
                    this.buyPiece(bP)  
                }
            }
        } else if (bP.owner && bP.owner !== this.player) { this.player.checkDebt(bP.owner) }        

        /*
        Priority:
        1. Buy House
        2. Unmortgage
        3. Trade
        */


        // Unmortgage
        // 1.1 * (bP.piece.price / 2)
        for (let bP of this.player.ownedPlaces) {
            if (!bP.mortgaged) { continue }

        }


        if (this.player.rolls) {
            this.player.numberOfRolls = 0
            turn = (turn + 1) % players.length
            board.dice1 = 0
            board.dice2 = 0
        }
        Bot.thinking = false
        this.player.rolls = false
    }


    buyPiece(boardPiece) {
        this.player.money -= boardPiece.piece.price
        boardPiece.owner = this.player
        this.player.ownedPlaces.push(boardPiece)
    }

    sellPiece(boardPiece) {
        if (!boardPiece.mortgaged) { this.player.money += boardPiece.piece.price / 2; this.player.playerBorder.startMoneyAnimation(boardPiece.piece.price / 2)}
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
        if (!this.player.negative) { return true }
        while (this.player.money < 0) {
            if (this.player.ownedPlaces.every(bP => bP.mortgaged) || this.player.ownedPlaces.length === 0) { return false }

            // logic
            for (let bP of this.player.ownedPlaces) {
                if (board.settings.mortgage && this.player.ownedPlaces.every(b => {
                    if (b.piece.type) { return true }
                    if (!groups[b.piece.group].includes(b.piece.group)) { return true }
                    return b.piece.group.level === 0
                })) {
                    this.player.money += bP.piece.price / 2
                    bP.mortgaged = true
                } else { this.sellPiece(bP)}
            }
        }
        return true
    }

    async bidOnAuction() {
        const bP = board.auction.card
        const currentPrice = board.auction.auctionMoney

        for (const option of [100, 10, 2]) {
            const cost = currentPrice + option
            // Current Money, Current Price, Bid | (Average Income, Average Loss) > Average Money Change Next Cycle
            if (this.player.money - cost < this.getAverageLoss(12)) { continue }

            // Dubbel hyra? 
            let maxValueToSpend = bP.piece.price * (board.settings.doubleincome ? 1.05 : 1)

            if (bP.piece.group === 'station') {
                maxValueToSpend *= specialWeights.station[ownedStations(this.player).length]
            } else if (bP.piece.group === 'utility') {
                maxValueToSpend *= specialWeights.utility[ownedUtility(this.player).length]
            } else {                
                if (players.some(player => ownedGroup(player, bP.piece.group).length >= 0.5)) {
                    maxValueToSpend *= specialWeights.group[bP.piece.group]
                } else { maxValueToSpend *= boardWeights[bP.n] }
            }

            maxValueToSpend *= 1 - this.randomness + Math.random() * this.randomness * 2
            
            if (maxValueToSpend >= cost) {
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

    async handleTrade(type) { // Handle Trade Request
        if (type === 'start') {
            /*
            What does the bot want?
            Is there a trade that satisfies that?
            */
           // What does the bot want
           let wants = []


        } else if (type === 'receive') {
            // Before Trade 
            let otherPlayer = board.trade.p1 

            let before1 = 0
            let before2 = 0
            
            otherPlayer.ownedPlaces.forEach(bP => before1 += getPieceRent(bP, 7, this.player))
            this.player.ownedPlaces.forEach(bP => before2 += getPieceRent(bP, 7, otherPlayer))

            // After Imaginary Trade
            let after1 = 0
            let after2 = 0

            // Also add the other money to the other player
            otherPlayer.ownedPlaces.forEach((bP, i) => {
                const cost = getPieceRent(bP, 7, this.player)
                if (!board.trade.p1PropertyButtons[i].selected) {
                    after1 += cost
                } else { after2 += cost }
            })
            this.player.ownedPlaces.forEach((bP, i) => {
                const cost = getPieceRent(bP, 7, otherPlayer)
                if (!board.trade.p2PropertyButtons[i].selected) {
                    after2 += cost
                } { after1 += cost }
            })

            // Negative? Lose On It
            let d1 = after1 - before1
            let d2 = after2 - before2
            let money = board.trade.p1Slider.value - board.trade.p2Slider.value

            let random = this.randomness * (2 * Math.random() - 1)
            let d = d2 + random + money

            if (d > 0 && d > d1) { // Better than before
                board.trade.p2ConfirmButton.selected = true
            } else { board.trade.p2ConfirmButton.selected = false }
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
        let valueA = a.money
        let valueB = b.money
        a.ownedPlaces.forEach(bP => valueA += bP.piece.price + bP.level * bP.piece.housePrice)
        b.ownedPlaces.forEach(bP => valueB += bP.piece.price + bP.level * bP.piece.housePrice)
        return valueA > valueB
    })
}

function ownedStations(player) {
    return player.ownedPlaces.filter(bP => bP.piece.type === 'station')
}

function ownedUtility(player) {
    return player.ownedPlaces.filter(bP => bP.piece.type === 'utility')
}

function ownedGroup(player, group) {
    return player.ownedPlaces.filter(bP => bP.piece.group === group)
}