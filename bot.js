class Bot{
    constructor(player) {
        this.player = player;
    }

    async update() {
        if (this.player !== players[turn]) { return }
        if (this.player.inJail) { this.handleJail(); return }
        if(this.player.animationOffset == 0  && board.showDices === false && board.animateDices === false){
            await this.player.rollDice()
            this.hasGroup()
            let boardPiece = board.boardPieces[this.player.steps]
            console.log(`${turn + 1}: ` + `${this.getAvergePrice(this.player.steps)}`)
            if (boardPiece.owner === undefined && this.player.money >= boardPiece.piece.price) {
                this.buyPiece(boardPiece)
            }
        }
    }

    handleJail() {
        if (this.player.money > 50 * 10) { // Less Than 1 / 10 Of Money Is Needed To Get Out Of Jail
            this.player.money -= 50
            this.player.getOutOfJail()
        } else {
            
        }

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
            if (!boardPiece.owner) { continue }
            // Station And Utility
            if (boardPiece.piece.type === 'station') {
                totalPrice += 25 * Math.pow(boardPiece.piece.price, stationsOwned)
            } else if (boardPiece.piece.type === 'utility') {
                totalPrice += this.player.dS * (utilitysOwned === 1 ? 4 : 10)
            } else if (boardPiece.piece.hasOwnProperty('group')) {
                totalPrice += boardPiece.piece.price
            }
        }
        return totalPrice / 12
    }

    hasGroup(group) {

    }
}
