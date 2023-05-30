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
    static thinking = false

    constructor(player) {
        this.player = player
    }

    async update() {
        if (Bot.thinking) { return }
        if (board.trade && board.trade.p2 === this.player) { await this.handleTrade('receive') }
        if (board.auction && board.auction.playerlist[board.auction.turn] === this.player) {
            this.bidOnAuction()
            return
        }
        if (this.player !== players[turn] || players.some(pl => pl.animationOffset !== 0) ||
            board.showDices || board.animateDices) { return }

        // Random Delay
        Bot.thinking = true
        await this.sleep(randomIntFromRange(speeds.botMin, speeds.botMax))
        Bot.thinking = false

        // Before Roll Dice
        if (!await this.handleBankrupt()) {
            removePlayer(this.player)
            return
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

        this.player.rollDice()
        
        while (board.animateDices || this.player.animationOffset !== 0) { await new Promise(requestAnimationFrame) }
        await this.sleep(250)

        if (board.currentShowingCard) {
            await this.sleep(randomIntFromRange(speeds.botMin + 1000, speeds.botMax + 1000))
            board.currentShowingCard.continue()
        }

        while (this.player.animationOffset !== 0) { await new Promise(requestAnimationFrame) } 
        let bP = board.boardPieces[this.player.steps]

        await this.sleep(randomIntFromRange(speeds.botMin, speeds.botMax))



        // Bankrupt after move?
        if (!await this.handleBankrupt()) {
            Bot.thinking = false
            removePlayer(this.player)
            return
        }

        // Buy 
        if (Object.keys(boardWeights).includes(`${bP.n}`) && !bP.owner &&
            this.player.laps >= board.settings.roundsBeforePurchase) {
            // Buy or Auction
            let moneyLeft = this.player.money - bP.piece.price
            let func = bP.piece.group || bP.piece.type

            if (moneyLeft > 2 * this.getAverageLoss(12) || (moneyLeft > this.getAverageLoss(12) &&
            players.some(player => window[func](player, bP.piece.group).length >= 0.5))) {
                this.buyPiece(bP)
            } else if (board.settings.auctions) {
                // Create auction
                board.auction = new Auction(bP)
                board.currentCard = undefined
                board.buyButton.visible = false
                board.auctionButton.visible = false
                // Wait normal delay
                Bot.thinking = true
                await this.sleep(2000)
                Bot.thinking = false
                // Start auction
                board.auction.started = true;
                board.auction.duration = 10 * speeds.auctionSpeed;
                board.auction.startTime = performance.now();
                board.auction.timer = setInterval(() => {
                    board.auction.time = 472 * 
                    (1 - (performance.now() - board.auction.startTime) / board.auction.duration)
                }, 10)
            }
            // Someone owns more than half
            if (moneyLeft > 2 * this.getAverageLoss(12) || Object.values(owners).some(amount => amount / groups[group].length >= 0.5)) {
                this.buyPiece(bP)  
            }
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
        if (this.player.money > 5000 * 10) { // Less Than 1 / 10 Of Money Is Needed To Get Out Of Jail
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

    // Handle trade requests
    async handleTrade(type) {
        if (type === 'start') {
            let wants = this.sortSellPieces().reverse()
            for (let i = 0; i < wants.length; i++) {
                for (let player of players) {
                    if (player === this.player) { continue }
                    if (player.ownedPlaces.includes(wans[i])) {
                        
                    }
                }
            }

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

            let d1 = after1 - before1
            let d2 = after2 - before2
            let moneyDiff = board.trade.p1Slider.value - board.trade.p2Slider.value
            d1 -= moneyDiff
            d2 += moneyDiff
            d2 += this.randomness * (2 * Math.random() - 1)

            /*
            Better than before?
            The other player doesn't gain 1/4
            more than the bot gains
            */
            if (d2 > 0 && d2 > d1 - d2 / 4) {
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
        let valueA = 0
        let valueB = 0
        a.ownedPlaces.forEach(bP => valueA += bP.piece.price + bP.level * bP.piece.housePrice)
        b.ownedPlaces.forEach(bP => valueB += bP.piece.price + bP.level * bP.piece.housePrice)
        return valueA > valueB
    })
}

function testAuction(group, station, utility) {
    let nums = []
    let amount = 0

    if (group) { nums = groups[group].map(e => e); amount = randomIntFromRange(1, nums.length - 1) }
    else if (station) { nums = [5, 15, 25, 35]; amount = randomIntFromRange(0, 3) }
    else if (utility) { nums = [12, 28]; amount = randomIntFromRange(0, 1) }
    else { nums = board.boardPieces.filter(e => e.piece.group).map(e => e.n); amount = 0 }

    for (let i = 0; i < amount; i++) {
        let r = randomIntFromRange(0, nums.length - 1)
        let bP = board.boardPieces[nums[r]]
        bP.owner = players[turn]
        players[turn].ownedPlaces.push(bP)
        nums.splice(r, 1)
    }
    
    let n = nums[randomIntFromRange(0, nums.length - 1)]
    let bP = board.boardPieces[n]
    board.auction = new Auction(bP)
    board.currentCard = undefined
    board.buyButton.visible = false
    board.auctionButton.visible = false
}

function testBuyProperty(player) {
    let group = Object.values(groups)[randomIntFromRange(0, Object.keys(groups).length - 1)]
    let lowest = randomIntFromRange(0, 4)
    for (let n of group) {
        let bP = board.boardPieces[n]
        bP.owner = player
        player.ownedPlaces.push(bP)
        bP.level = lowest + (Math.random() > 0.5 ? 1 : 0)
    }
}

function removePlayer(player) {
    player.ownedPlaces.forEach(bP => bP.owner = undefined)
    player.ownedPlaces = []
    players.splice(players.indexOf(player), 1)
    turn = turn % players.length
}