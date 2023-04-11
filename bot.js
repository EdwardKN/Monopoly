class Bot{
    constructor(player) {
        this.player = player;
    }

    async update() {
        if (this.player !== players[turn]) { return }
        if(this.player.animationOffset == 0  && board.showDices === false && board.animateDices === false){
            await this.player.rollDice()
            this.hasGroup()
            let boardPiece = board.boardPieces[this.player.steps]

            if (boardPiece.owner === undefined && this.player.money >= boardPiece.piece.price) {
                this.buyPiece(boardPiece)
            } else { this.player.rollDice() }
        }
    }

    buyPiece(boardPiece) {
        this.player.money -= boardPiece.piece.price
        boardPiece.owner = this.player
        this.player.ownedPlaces.push(boardPiece)
    }

    hasGroup() {
        let ownAll = false
        let prevGroup = board.boardPieces[0].piece.group
        board.boardPieces.forEach(piece => {
            if (piece.piece.group !== prevGroup) {
                if (ownAll) { return } else { ownAll = true }
            }
            if (piece.owner !== this.player) { ownAll = false }
            prevGroup = piece.piece.group
        })
        console.log(ownAll)
        if (ownAll) {
            
        }
    }

    getLengthOfGroup(group) {
        let l = 0
        board.boardPieces.forEach(piece => l += piece.piece.group === group ? 1 : 0)
    }
}
