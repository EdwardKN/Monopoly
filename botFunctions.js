async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

function mortgagePiece(player, bP) {
    bP.mortgaged = true
    player.money += bP.piece.price / 2
    player.totalEarned += bP.piece.price / 2
    player.playerBorder.startMoneyAnimation(bP.piece.price / 2)
}

function unmortgagePiece(player, bP) {
    bP.mortgaged = false
    player.money -= 0.65 * bP.piece.price
    player.totalLost += 0.65 * bP.piece.price
    player.playerBorder.startMoneyAnimation(- 1.1 * bP.piece.price / 2)
}

function buyHouse(player, bP) {
    bP.level++
    player.money -= bP.piece.housePrice
    player.totalLost += bP.piece.housePrice
    player.playerBorder.startMoneyAnimation(-bP.piece.housePrice)
}

function sellHouse(player, bP) {
    bP.level--
    player.money += bP.piece.housePrice / 2
    player.totalEarned += bP.piece.housePrice / 2
    player.playerBorder.startMoneyAnimation(bP.piece.housePrice / 2)
}

function buyPiece(player, bP) {
    bP.owner = player
    player.ownedPlaces.push(bP)
    player.money -= bP.piece.price
    player.totalLost += bP.piece.price
    player.playerBorder.startMoneyAnimation(-bP.piece.price)
}

function sellPiece(player, bP) {
    bP.owner = undefined
    player.ownedPlaces.splice(player.ownedPlaces.indexOf(bP), 1)
    if (player.ownedPlaces.length === 0 && player.money < 0) { player.checkDept() }
    if (!bP.mortgaged) {
        player.money += bP.piece.price / 2
        player.totalEarned += bP.piece.price / 2
        player.playerBorder.startMoneyAnimation(bP.piece.price / 2)
    }
}

function createAuction(bP) {
    board.auction = new Auction(bP)
    board.currentCard = undefined
    board.buyButton.visible = false
    board.auctionButton.visible = false
}

function startAuction() {
    board.auction.started = true
    board.auction.duration = 10 * speeds.auctionSpeed
    board.auction.startTime = performance.now()
    board.auction.timer = setInterval(() => {
        board.auction.time = 472 * (1 - (performance.now() - board.auction.startTime) / board.auction.duration)
    }, 10)
}