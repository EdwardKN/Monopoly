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
        if (Bot.thinking) { return }
        
        if (board.trade && board.trade.p2 === this.player) { await this.handleTrade('receive') }
        // Bid And Start Auction
        if (board.auction && board.auction.playerlist[board.auction.turn] === this.player) {
            this.bidOnAuction()
            return
        }
        // Check If Bots Turn And No Animations Are Playing
        if (this.player !== players[turn] || players.some(p => p.animationOffset !== 0) ||
            board.showDices || board.animateDices) { return }
        // Random Delay
        Bot.thinking = true
        await this.sleep(randomIntFromRange(speeds.botMin, speeds.botMax))
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
                board.auction.timer = setInterval(() => { board.auction.time = 472 * (1 - (performance.now() - board.auction.startTime) / board.auction.duration) },10);
            }
        } else if (bP.owner && bP.owner !== this.player) { this.player.checkDebt(bP.owner) }        


        /* Start Trade */



        /* Buy house */
        // Group: Blue --> Brown
        let keys = Object.keys(groups).reverse()

        for (let i = 0; i < keys.length; i++) {
            let group = keys[i]
            let bought = false

            if (hasGroup(this.player, group)) {
                let nums = groups[group]
                let levels = nums.map(n => board.boardPieces[n].level )
                let minLevel = Math.min(...levels)
                let minN = nums.filter(n => board.boardPieces[n].level == minLevel).reverse()

                // Boardpiece: Expensive --> Cheap
                for (let n of minN) {
                    let bP = board.boardPieces[n]
                    if (this.player.money - bP.piece.housePrice > this.getAverageLoss(40)) {
                        this.buyHouse(bP)
                        bought = true
                    }
                }
            }
            if (bought) { i++ } // May want to continue upgrading the same group
        }

        /* Unmortgage */
        // Sort by importance
        let mortgaged = []
        // Any broken groups?
        for (let group of keys) {
            let playerOwned = ownedGroup(this.player, group)
            if (playerOwned.length === groups[group].length) {
                playerOwned.forEach(bP => {
                    if (bP.mortgaged) {
                        mortgaged.push(bP)
                    }
                })
            }
        }

        // Rest of the mortgaged pieces
        mortgaged.concat(
            this.player.ownedPlaces.filter(bP => bP.mortgaged && !mortgaged.includes(bP))
            .sort((a, b) => b.n - a.n))

        for (let bP of mortgaged) {
            if (this.player.money - 1.1 * bP.piece.price / 2 > this.getAverageLoss(40)) {
                this.unmortgagePiece(bP)
            }
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

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    mortgagePiece(boardPiece) {
        this.player += boardPiece.piece.price / 2
        boardPiece.mortgaged = true
    }

    unmortgagePiece(boardPiece) {
        this.player.money -= 1.1 * boardPiece.piece.price / 2
        boardPiece.mortgaged = false
    }

    buyHouse(boardPiece) {
        this.player.money -= boardPiece.piece.housePrice
        boardPiece.level++
    }

    sellHouse(boardPiece) {
        this.player.money += boardPiece.piece.houseCost / 2
        boardPiece.level--
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


    handleBankrupt() {
        if (!this.player.negative) { return true }

        // Start with selling cheap

        while (this.player.money < 0) {
            let left = this.sortSellPieces()

            if (left.length === 0) { return false }

            if (left[i].level > 0) {
                this.sellHouse(left[i])
            } else {
                if (board.settings.mortgage) { this.mortgagePiece(left[0]) }
                else { this.sellPiece(left[0]) }
            }
        }
        return true
    }

    sortSellPieces() {
        let result = []
        if (board.settings.even) {
            for (let group in groups) {
                let owned = groups[group].filter(n => board.boardPieces[n].owner === this.player)
                
                // Only Get The Highest House Count
                let maxLevel = 0
                let maxed = []
                for (n of owned) {
                    let bP = board.boardPieces[n]
                    if (bP.level > maxLevel) {
                        maxLevel = bP.level
                        maxed = [bP]
                    } else if (bP.level === minLevel) {
                        maxed.push(bP)
                    }
                }
                maxed.forEach(bP => result.push(bP))
            }
        } else { result = this.player.ownedPlaces }
        return result
            .filter(bP => !bP.mortgaged)
            .sort((a, b) => this.calculateLossOfPiece(a, 7, null) - this.calculateLossOfPiece(b, 7, null))
    }

    calculateLossOfPiece(bP) {
        if (bP.level > 0) { return bP.piece.rent[bP.level] - bP.piece.rent[bP.level - 1] }
        
        // If group > Not Group all places half income
        let loss = 0
        if (bP.piece.group) {
            let owned = ownedGroup(this.player, bP.piece.group)

            if (!hasGroup(this.player, bP.piece.group)) { return getPieceRent(bP, 7, null) }

            for (let boardPiece of owned) {
                if (boardPiece === bP) {
                    loss += 2 * boardPiece.piece.rent
                } else { loss += boardPiece.piece.rent }
            }
        } else if (bP.piece.type === 'station') {
            return 25 * Math.pow(2, ownedStations(this.player).length - 1)

        } else if (bP.piece.type === 'utility') {
            let owned = ownedUtility(this.player)
            if (owned.length === 1) {
                loss += steps * 4
            } else {
                loss += steps * 16
            }
        }
        return loss
    }

    async bidOnAuction() {
        const bP = board.auction.card

        for (const option of [100, 10, 2]) {
            const cost = board.auction.auctionMoney + option

            // Dubbel hyra? 
            let maxValueToSpend = bP.piece.price * (board.settings.doubleincome ? 1.05 : 1)

            if (bP.piece.type === 'station') {
                maxValueToSpend *= specialWeights.station[ownedStations(this.player).length]
            } else if (bP.piece.type === 'utility') {
                maxValueToSpend *= specialWeights.utility[ownedUtility(this.player).length]
            } else {
                console.log(bP, bP.piece.group)
                if (players.some(player => ownedGroup(player, bP.piece.group).length / groups[bP.piece.group].length >= 0.5)) {
                    maxValueToSpend *= specialWeights.group[bP.piece.group]
                } else { maxValueToSpend *= boardWeights[bP.n] }
            }

            maxValueToSpend *= 1 - this.randomness + Math.random() * this.randomness * 2
            
            if (this.player.money - cost > this.getAverageLoss(12) && maxValueToSpend >= cost) {
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
            /*
            What does the bot want?
            Is there a trade that satisfies that?
            */
            // What does the bot want
            let wants = []
            // Filter groups, stations, utility


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

function hasGroup(player, group) {
    let ownes = ownedGroup(player, group)

    return ownes.length === groups[group].length &&
        ownes.every(bP => !bP.mortgaged)
}

function getPieceRent(boardPiece, steps, player) {
    if (!boardPiece.owner || boardPiece.mortgaged || boardPiece.owner === player) { return 0 }
    if (boardPiece.piece.type === 'station') {
        return 25 * Math.pow(2, boardPiece.owner.ownedPlaces.filter(bP => bP.piece.type === 'station').length - 1)
    } else if (boardPiece.piece.type === 'utility') {
        return steps * (boardPiece.owner.ownedPlaces.some(bP => bP.piece.type === 'utility') ? 10 : 4)
    } else {
        return boardPiece.piece.rent[boardPiece.level] * (hasGroup(boardPiece.owner, boardPiece.piece.group) ? 2 : 1)
    }
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

function rankPlayers() {
    return players.slice().sort((a, b) => {
        let valueA = a.money
        let valueB = b.money
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