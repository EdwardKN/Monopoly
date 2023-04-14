class Bot{
    constructor(player) {
        this.player = player;
    }

    async update() {
        if (this.player !== players[turn]) { return }
        if (this.player.negative) { this.handleBankrupt(); return }
        if (this.player.inJail) { this.handleJail(); return }
        if(this.player.animationOffset == 0  && board.showDices === false && board.animateDices === false){
            await this.player.rollDice()
            if (this.player.negative) { this.handleBankrupt(); return }

            let boardPiece = board.boardPieces[this.player.steps]
            if (boardPiece.owner === undefined && this.player.money - boardPiece.piece.price > 2 * this.getAvergePrice()) {
                this.buyPiece(boardPiece)
            }
        }
    }

    handleJail() {
        if (this.player.money > 50 * 10) { // Less Than 1 / 10 Of Money Is Needed To Get Out Of Jail
            this.player.money -= 50
            this.player.getOutOfJail()
        } else {
            let dice1 = randomIntFromRange(1, 6)
            let dice2 = randomIntFromRange(1, 6)
            console.log(dice1, dice2)
            if (dice1 === dice2) {
                this.player.getOutOfJail()
            }
        }
    }

    // Morgtage
    // Sell House
    // Morgtage
    // Sell Everything
    handleBankrupt() {
        while (this.player.money < 0) {
            for (const bP of this.player.ownedPlaces) {
                if (!this.hasGroup(bP.piece.group)) {
                    bP.mortgaged = true
                    this.player.money += bP.piece.price / 2
                }
            }
        }
        this.player.negative = false
    }

    buyPiece(boardPiece) {
        this.player.money -= boardPiece.piece.price
        boardPiece.owner = this.player
        this.player.ownedPlaces.push(boardPiece)
    }

    getAvergePrice(step) {
        let totalPrice = 0
        let stationsOwned = this.player.ownedPlaces.filter(bP => bP.piece.type === 'station').length
        let utilitysOwned = this.player.ownedPlaces.filter(bP => bP.piece.type === 'utility').length
        for (let i = 1; i <= 12; i++) {
            let boardPiece = board.boardPieces[(step + i) % 40]
            if (!boardPiece || !boardPiece) { continue }
            if (boardPiece.piece.type === 'station') {
                totalPrice += 25 * Math.pow(boardPiece.piece.price, stationsOwned)
            } else if (boardPiece.piece.type === 'utility') {
                totalPrice += this.player.dS * (utilitysOwned === 1 ? 4 : 10)
            } else if (boardPiece.owner !== this.player) {
                totalPrice += boardPiece.piece.price
            }
        }
        return totalPrice / 12
    }

    whoHasAGroup() {
        let hasbulla = {}
        players.forEach((player, i) => {
            let ownsAll = []
            let cur
            let all = false
            for (const bP of board.boardPieces) {
                if (!bP || !bP.piece.group) { continue }
                if (bP.piece.group !== cur) {
                    if (all) { ownsAll.push(cur) }
                    all = true
                    cur = bP.piece.group
                }
                if (bP.owner !== player) { all = false }
            }
            if (ownsAll.length) { hasbulla[i] = [ownsAll] }
        })
        return hasbulla
    }

    hasGroup(group) {
        return (this.whoHasAGroup()[turn] || []).includes(group)
    }

    getPieceWithHouse() {
        let hasHouse = []
        for (const bP of this.player.ownedPlaces) {
            if (bP.level) { hasHouse.push(bP) }
        }
        return hasHouse
    }
}

function cha() {
    players[0].teleportTo(1)
    board.boardPieces[1].owner = players[0]
    players[0].teleportTo(3)
    board.boardPieces[3].owner = players[0]
}