var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");
var backCanvas = document.createElement("canvas");
var backC = backCanvas.getContext("2d");
var renderCanvas = document.createElement("canvas");
var renderC = renderCanvas.getContext("2d");

var menus = [];

var firstclick = false;

var musictimer;

var musicPlaying;



var finish = JSON.parse(getCookie("finish") === undefined ? false : getCookie("finish"));;

var musicVolume = JSON.parse(getCookie("musicVolume") === undefined ? 100 : getCookie("musicVolume"));

var musicOn = musicVolume === 0 ? 1 : 0;

var timeouts = [];
var intervals = [];

var playtime = 0;

setInterval(() => {
    playtime++;
    players.forEach(e => {if(e.dead === false){e.playTime++}})
}, 10);

window.onload = fixCanvas;

window.onbeforeunload = saveGame;

window.addEventListener("resize", fixCanvas)

function fixCanvas() {
    let smoothing = renderC.imageSmoothingEnabled

    backCanvas.width = window.innerWidth;
    backCanvas.height = window.innerHeight;
    canvas.width = 1920 / 2;
    canvas.height = 1080 / 2;
    if (window.innerWidth * 9 > window.innerHeight * 16) {
        renderCanvas.width = window.innerHeight * 16 / 9;
        renderCanvas.height = window.innerHeight;
        scale = renderCanvas.width / canvas.width

    } else {
        renderCanvas.width = window.innerWidth;
        renderCanvas.height = window.innerWidth * 9 / 16;
        scale = renderCanvas.height / canvas.height

    }
    renderC.imageSmoothingEnabled = smoothing;

}


renderCanvas.addEventListener("mousemove", function (e) {
    mouse = {
        x: e.offsetX / scale,
        y: e.offsetY / scale,
    }



})

window.addEventListener("mousedown", function (e) {
    if (firstclick === false) {
        firstclick = true;
        if (finish) {
            playSound(sounds.msc, musicVolume, true)
        } else {
            playSound(sounds.music, musicVolume, true)
        }
    }
    buttons.forEach(e => {
        e.click();
    })


})

window.addEventListener("mouseup", function (e) {
    buttons.forEach(e => {
        if (e.release !== undefined) {
            e.release();
        }
    })

})
function split(str, index) {
    const result = [str.slice(0, index), str.slice(index)];

    return result;
}

async function preRender(imageObject) {
    await loadSpriteSheet();
    Object.entries(imageObject).forEach(image => {
        image[1].sprites = [];
        for (i = 0; i < image[1].src.length; i++) {
            let src = (image[1].src[i].split("/"))
            let src2 = src[src.length - 2] + "/" + src[src.length - 1]
            image[1].sprites.push(spritesheet.frames[spritesheet.frames.map(function (e) { return e.filename; }).indexOf(src2 + ".png")])
        }
    });
}
async function loadSounds(soundObject) {
    Object.entries(soundObject).forEach(async function (sound) {
        sound[1].sound = new Audio(sound[1].src)
        if (sound[1].type === "multiple") {
            sound[1].labels = []
            let tmp = await fetch("." + sound[1].src.split(".")[0] + sound[1].src.split(".")[1] + ".txt")
            let tmp2 = (await tmp.text()).split("\n")
            let tmp3 = (tmp2.map(e => e.replaceAll("\t", "")))
            let tmp4 = (tmp3.map(e => e.replaceAll(" ", "")))
            let tmp5 = (tmp4.map(e => e.replaceAll("\r", "")))
            let tmp6 = (tmp5.map(e => split(e, 8)[0]))
            let tmp7 = (tmp6.filter(e => e != ""))
            let tmp8 = (tmp7.map(e => JSON.parse(e)))
            sound[1].labels = tmp8
        }
    });
}

function drawRotatedImageFromSpriteSheet(x, y, w, h, frame, angle, mirrored, cropX, cropY, cropW, cropH, offset, drawcanvas) {
    x = x / drawScale;
    y = y / drawScale;
    w = w / drawScale;
    h = h / drawScale;
    let degree = angle * Math.PI / 180;

    let middlePoint = {
        x: Math.floor(x + w / 2),
        y: Math.floor(y + h / 2)
    };
    if (drawcanvas === undefined) {
        drawcanvas = c;
    }

    drawcanvas.save();
    drawcanvas.translate(middlePoint.x, middlePoint.y);
    drawcanvas.rotate(degree);
    if (mirrored === true) {
        drawcanvas.scale(-1, 1);
    }

    drawcanvas.drawImage(spritesheetImage, Math.floor(cropX + frame.frame.x), Math.floor(cropY + frame.frame.y), Math.floor(cropW), Math.floor(cropH), Math.floor(-w / 2), Math.floor(-h / 2), Math.floor(w), Math.floor(h));

    drawcanvas.restore();
}

function to_screen_coordinate(x, y) {
    return {
        x: x * 0.5 + y * -0.5,
        y: x * 0.25 + y * 0.25
    }
}

function invert_matrix(a, b, c, d) {
    const det = (1 / (a * d - b * c));

    return {
        a: det * d,
        b: det * -b,
        c: det * -c,
        d: det * a,
    }
}

function to_grid_coordinate(x, y) {
    const a = 1 * 0.5;
    const b = -1 * 0.5;
    const c = 0.5 * 0.5;
    const d = 0.5 * 0.5;

    const inv = invert_matrix(a, b, c, d);

    return {
        x: Math.floor(x * inv.a + y * inv.b),
        y: Math.floor(x * inv.c + y * inv.d),
    }
}
function detectCollition(x, y, w, h, x2, y2, w2, h2) {
    return x + w > x2 && x < x2 + w2 && y + h > y2 && y < y2 + h2;
};
function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) &&
        !isNaN(parseFloat(str))
}

function drawIsometricImage(x, y, img, mirror, cropX, cropY, cropW, cropH, offsetX, offsetY, sizeOveride, drawcanvas) {
    let scaleOfThis = drawScale;
    if (sizeOveride !== undefined) {
        scaleOfThis = sizeOveride * drawScale;
    }
    if (drawcanvas === undefined) {
        drawcanvas = c;
    }
    drawRotatedImageFromSpriteSheet(to_screen_coordinate(x * drawScale, y * drawScale).x + 832 + offsetX * drawScale, to_screen_coordinate(x * drawScale, y * drawScale).y + 120 + offsetY * drawScale, cropW * scaleOfThis, cropH * scaleOfThis, img, 0, mirror, cropX, cropY, cropW, cropH, true, drawcanvas)
}



function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
};

function playSound(sound, volume, repeat) {
    if (sound.type === "single") {
        let myClonedAudio = sound.sound.cloneNode();
        myClonedAudio.volume = volume;
        myClonedAudio.play();
    } else {
        let random = Math.floor(Math.random() * sound.labels.length)
        let myClonedAudio = sound.sound.cloneNode();
        myClonedAudio.volume = volume;
        myClonedAudio.currentTime = sound.labels[random]
        myClonedAudio.play();
        let start = sound.labels[random];
        let end = sound.labels[random + 1] != undefined ? sound.labels[random + 1] : sound.sound.duration

        setTimeout(function () {
            myClonedAudio.pause();
        }, (end - start) * 1000)

        if (repeat) {
            musicPlaying = myClonedAudio;
            musictimer = setTimeout(function () {
                playSound(sound, musicVolume, true)
            }, (end - start) * 1000)
        }
    }
};
function startGame(playerlist, settings) {
    board = new Board();
    playtime = 0;


    board.settings = settings;
    let tmpArray = [];
    for (i = 0; i < playerlist.length; i++) {
        tmpArray.push(i);
    }
    for (i = 0; i < playerlist.length; i++) {
        let tmpI = randomIntFromRange(0, tmpArray.length - 1);
        let correctI = tmpArray[tmpI]
        players.push(new Player(images.player.sprites[playerlist[correctI].color], playerlist[correctI].color, playerlist[correctI].name, playerlist[correctI].bot))
        tmpArray.splice(tmpI, 1)
    }
    turn = randomIntFromRange(0, playerlist.length - 1)
    board.textsize = measureText({ font: "Arcade", text: "Just nu: " + players[turn].name });
    players.forEach(e => { e.playerBorder.init(); board.boardPieces[0].currentPlayer.push(e) })
    Bot.boardInfo = players.reduce((dict, player, i) => { dict[i] = player.ownedPlaces; return dict }, {})
}

function saveGame() {
    let gameToSave = {
        saveVersion:latestSaveVersion,
        players: [], 
        settings: board.settings, 
        turn: turn, 
        freeParkingMoney: 
        board.boardPieces[20].money, 
        currentDay: new Date().today(), 
        currentTime: new Date().timeNow(), 
        playtime: playtime, 
        screenshot: canvas.toDataURL(),
        currentCard: board.boardPieces.indexOf(board.currentCard),
        currentShowingCard:{card:board.currentShowingCard?.card,type:board.currentShowingCard?.type,info:board.currentShowingCard?.info},
        auction:{
            auctionMoney:board?.auction?.auctionMoney,
            card:board?.auction?.card.n,
            lastHasAdded:board?.auction?.lastHasAdded,
            started:board?.auction?.started,
            turn:board?.auction?.turn,
            playerlist:board?.auction?.playerlist.map(e => e.colorIndex)
        },
        boardPieces:[]
    };
    board.boardPieces.forEach(function(e,i){
        gameToSave.boardPieces.push(
            {
                totalEarned: e.totalEarned,
                name: e.piece.name,
                owner: e.owner?.name != undefined ? e.owner.name : "Banken"
            }
        )
    })
    
    let savedGames = JSON.parse(localStorage.getItem("games"))


    if (savedGames == undefined || savedGames == null) {
        savedGames = [];
    } else {
        if (savedGames.length >= 10) {
            savedGames.pop();
        }
    }
    if (board.id === undefined) {
        gameToSave.id = savedGames.length === 0 ? 0 : savedGames[savedGames.length - 1].id + 1
    } else {
        gameToSave.id = board.id;
    }

    players.forEach(player => {
        let tmpPlayer = {};
        tmpPlayer.bot = player.bot == undefined ? false : true
        tmpPlayer.colorIndex = player.colorIndex;
        tmpPlayer.hasStepped = player.hasStepped;
        tmpPlayer.inDebtTo = player.inDebtTo === undefined ? undefined : player.inDebtTo.name === undefined;
        tmpPlayer.inJail = player.inJail;
        tmpPlayer.jailcardAmount = player.jailcardAmount;
        tmpPlayer.lastMoneyInDebt = player.lastMoneyInDebt;
        tmpPlayer.money = player.money;
        tmpPlayer.name = player.name;
        tmpPlayer.negative = player.negative;
        tmpPlayer.numberOfRolls = player.numberOfRolls;
        tmpPlayer.rolls = player.rolls;
        tmpPlayer.steps = player.steps;
        tmpPlayer.timeInJail = player.timeInJail;
        tmpPlayer.ownedPlaces = player.ownedPlaces.map(e => e = e.n)
        tmpPlayer.ownedPlacesmortgaged = player.ownedPlaces.map(e => e = e.mortgaged)
        tmpPlayer.ownedPlaceslevel = player.ownedPlaces.map(e => e = e.level)
        tmpPlayer.laps = player.laps
        tmpPlayer.dead = player.dead;
        tmpPlayer.playTime = player.playTime
        tmpPlayer.totalEarned = player.totalEarned
        tmpPlayer.totalLost = player.totalLost
        gameToSave.players.push(tmpPlayer);
    })
    let tmp = false;
    savedGames.forEach(function (e, i) {
        if (e.id == gameToSave.id) {
            tmp = true;
            savedGames[i] = gameToSave;
        }
    })
    if (tmp === false) {
        savedGames.push(gameToSave);
    }
    if (gameToSave.players.length === 1) {
        savedGames.splice(savedGames.indexOf(gameToSave), 1)
    }

    localStorage.setItem("games", JSON.stringify(savedGames))
    return(gameToSave)
}


function loadGame(theGameToLoad) {
    let gameToLoad = JSON.parse(localStorage.getItem("games"))[theGameToLoad]

    board = new Board();
    board.id = gameToLoad.id;
    playtime = gameToLoad.playtime

    board.settings = gameToLoad.settings;
    for (i = 0; i < gameToLoad.players.length; i++) {
        players.push(new Player(images.player.sprites[gameToLoad.players[i].colorIndex], gameToLoad.players[i].colorIndex, gameToLoad.players[i].name, gameToLoad.players[i].bot))
        players[i].hasStepped = gameToLoad.players[i].hasStepped
        players[i].inJail = gameToLoad.players[i].inJail
        players[i].jailcardAmount = gameToLoad.players[i].jailcardAmount
        players[i].lastMoneyInDebt = gameToLoad.players[i].lastMoneyInDebt
        players[i].money = gameToLoad.players[i].money
        players[i].negative = gameToLoad.players[i].negative
        players[i].numberOfRolls = gameToLoad.players[i].numberOfRolls
        players[i].rolls = gameToLoad.players[i].rolls
        players[i].steps = gameToLoad.players[i].steps
        players[i].laps = gameToLoad.players[i].laps
        players[i].timeInJail = gameToLoad.players[i].timeInJail
        players[i].playTime = gameToLoad.players[i].playTime
        players[i].totalEarned = gameToLoad.players[i].totalEarned
        players[i].totalLost = gameToLoad.players[i].totalLost
        gameToLoad.players[i].ownedPlaces.forEach(function (e, g) {
            players[i].ownedPlaces.push(board.boardPieces[e])
            board.boardPieces[e].mortgaged = gameToLoad.players[i].ownedPlacesmortgaged[g];
            board.boardPieces[e].level = gameToLoad.players[i].ownedPlaceslevel[g];
            board.boardPieces[e].owner = players[i]
        })
    }
    for (i = 0; i < gameToLoad.players.length; i++) {
        if (gameToLoad.players[i].inDebtTo !== undefined) {
            players[i].inDebtTo = players.filter(e => e.name == gameToLoad.players[i].inDebtTo)[0]
        }
    }

    turn = gameToLoad.turn

    board.textsize = measureText({ font: "Arcade", text: "Just nu: " + gameToLoad.players[turn].name });

    players.forEach(e => {
        e.playerBorder.init();
        if (e.inJail === true) {
            board.prisonExtra.playerStep(true, e)
        } else {
            board.boardPieces[e.steps].playerStep(true, e)
        }
    })
    board.boardPieces[20].money = gameToLoad.freeParkingMoney;

    if(gameToLoad.currentShowingCard.type == "chance"){
        board.boardPieces[players[turn].steps].doChanceCard(gameToLoad.currentShowingCard.card,players[turn])
    }
    if(gameToLoad.currentShowingCard.type == "community"){
        board.boardPieces[players[turn].steps].doCommunityChest(gameToLoad.currentShowingCard.card,players[turn])
    }
    if(gameToLoad.currentShowingCard.type == "bankcheck"){
        board.currentShowingCard = new CurrentCard(0,"bankcheck",gameToLoad.currentShowingCard.info)

        board.currentShowingCard.onContinue = function(){

            if(players[players.map(e => e.name).indexOf(gameToLoad.currentShowingCard.info.to)]){
                players[players.map(e => e.name).indexOf(gameToLoad.currentShowingCard.info.to)].money += gameToLoad.currentShowingCard.info.amount;
                players[players.map(e => e.name).indexOf(gameToLoad.currentShowingCard.info.to)].totalEarned += gameToLoad.currentShowingCard.info.amount;
                players[players.map(e => e.name).indexOf(gameToLoad.currentShowingCard.info.to)].playerBorder.startMoneyAnimation(gameToLoad.currentShowingCard.info.amount)
            }
            if(players[players.map(e => e.name).indexOf(gameToLoad.currentShowingCard.info.from)]){
                players[players.map(e => e.name).indexOf(gameToLoad.currentShowingCard.info.from)].money -= gameToLoad.currentShowingCard.info.amount;
                players[players.map(e => e.name).indexOf(gameToLoad.currentShowingCard.info.to)].totalLost += gameToLoad.currentShowingCard.info.amount;
                players[players.map(e => e.name).indexOf(gameToLoad.currentShowingCard.info.from)].playerBorder.startMoneyAnimation(-gameToLoad.currentShowingCard.info.amount)
            }
            if(gameToLoad.currentShowingCard.info.to == "Banken" || gameToLoad.currentShowingCard.info.to == "Renovering AB"){
                if(board.settings.freeParking){
                    board.boardPieces[20].money += amount;
                }
            }
        }
        
    }
    if(gameToLoad.auction.card !== undefined){
        board.auction = new Auction(board.boardPieces[gameToLoad.auction.card]);
        board.auction.lastHasAdded = gameToLoad.auction.lastHasAdded;
        board.auction.started = gameToLoad.auction.started;
        board.auction.turn = gameToLoad.auction.turn;
        board.auction.auctionMoney = gameToLoad.auction.auctionMoney;
        board.auction.playerlist = [];
        gameToLoad.auction.playerlist.forEach(e => {
            board.auction.playerlist.push(players.filter(g => g.colorIndex == e)[0])
        })
    }
    if(gameToLoad.currentCard){
        board.currentCard = board.boardPieces[gameToLoad.currentCard]
    }
    gameToLoad.boardPieces.forEach(function(e,i){
        board.boardPieces[i].totalEarned = e.totalEarned;
    })



}





class LocalLobby {
    constructor() {
        this.current = false;
        let self = this;
        this.playerInputs = [];
        this.amountBots = 0;
        this.settingsButtons = [];
        this.settingsButtons.push(new Button([true, false], 80, 205, images.buttons.sprites[10], function () { }, 500, 40, false, false, false, false, false, false, "Ge alla skattepengar till fri parkering", 42, "black"))
        this.settingsButtons.push(new Button([true, false], 80, 205 + this.settingsButtons.length * 42, images.buttons.sprites[10], function () { }, 500, 40, false, false, false, false, false, false, "Ge alla bankpengar till fri parkering", 42, "black"))
        this.settingsButtons.push(new Button([true, false], 80, 205 + this.settingsButtons.length * 42, images.buttons.sprites[10], function () { }, 500, 40, false, false, false, false, false, false, "Dubbel hyra på komplett färggrupp", 42, "black"))
        this.settingsButtons.push(new Button([true, false], 80, 205 + this.settingsButtons.length * 42, images.buttons.sprites[10], function () { }, 500, 40, false, false, false, false, false, false, "Auktioner", 42, "black"))
        this.settingsButtons.push(new Button([true, false], 80, 205 + this.settingsButtons.length * 42, images.buttons.sprites[10], function () { }, 500, 40, false, false, false, false, false, false, "Få/förlora pengar i fängelset", 42, "black"))
        this.settingsButtons.push(new Button([true, false], 80, 205 + this.settingsButtons.length * 42, images.buttons.sprites[10], function () { }, 500, 40, false, false, false, false, false, false, "Möjlighet att inteckna", 42, "black"))
        this.settingsButtons.push(new Button([true, false], 80, 205 + this.settingsButtons.length * 42, images.buttons.sprites[10], function () { }, 500, 40, false, false, false, false, false, false, "Möjlighet att sälja", 42, "black"))
        this.settingsButtons.push(new Button([true, false], 80, 205 + this.settingsButtons.length * 42, images.buttons.sprites[10], function () { }, 500, 40, false, false, false, false, false, false, "Jämn utbyggnad", 42, "black"))
        this.settingsButtons.push(new Slider(436 * drawScale, 5 + this.settingsButtons.length * 42 * drawScale, 502 * drawScale, 40 * drawScale, 0, 3000, 100, true, 50, "kr", "Startkapital: "))
        this.settingsButtons.push(new Slider(436 * drawScale, 5 + this.settingsButtons.length * 42 * drawScale, 502 * drawScale, 40 * drawScale, 0, 5, 1, true, 50, "", "Antal varv innan köp: "))
        this.settingsButtons.push(new Slider(436 * drawScale, 5 + this.settingsButtons.length * 42 * drawScale, 502 * drawScale, 40 * drawScale, 0, 100, 10, true, 35, "%", "Lägsta bud på auktioner(% av gatupris): "))
        this.settingsButtons[2].selected = true
        this.settingsButtons[3].selected = true
        this.settingsButtons[4].selected = true
        this.settingsButtons[5].selected = true
        this.settingsButtons[6].selected = true
        this.settingsButtons[7].selected = true
        this.settingsButtons[8].percentage = 0.45
        this.settingsButtons[10].percentage = 0.5
        this.readyPlayers = [];
        this.settingsButtons[1].disabled = true;

        this.backButton = new Button([false, false], -337, 220, images.buttons.sprites[12], function () {
            self.current = false;
            menus[0].current = true;
            menus[0].volume.percentage = musicVolume
            self.playerInputs.forEach(e => {
                e.textInput.htmlElement.style.display = "none"
                e.textInput.value = "";
                e.textInput.htmlElement.value = "";
                e.textInput.colorId = undefined;
                e.colorButtons.forEach(g => g.selected = false)
                e.colorButton.img = images.colorButtons.sprites[8];
                e.botButton.selected = false;
                e.textInput.htmlElement.disabled = false;
                e.textInput.oldvalue = ""
            })
        }, 325, 60, false, false, false, false, false, false)
        this.startButton = new Button([false, false], 250, 670, images.buttons.sprites[11], function () {
            let playerlist = []

            self.readyPlayers.forEach(e => {
                let tmpColor = e.colorId;
                if (e.colorId === undefined) {
                    let random = randomIntFromRange(0, self.useableColors.length - 1);
                    tmpColor = self.useableColors[random];
                    self.useableColors.splice(random, 1)
                }
                let tmp = {
                    name: e.textInput.value.trim(),
                    color: tmpColor,
                    bot: e.botButton.selected
                }
                playerlist.push(tmp)
            })
            let settings = {
                freeParking: self.settingsButtons[0].selected,
                allFreeparking: self.settingsButtons[1].selected,
                doubleincome: self.settingsButtons[2].selected,
                auctions: self.settingsButtons[3].selected,
                prisonmoney: self.settingsButtons[4].selected,
                mortgage: self.settingsButtons[5].selected,
                sellable: self.settingsButtons[6].selected,
                even: self.settingsButtons[7].selected,
                startmoney: self.settingsButtons[8].value,
                roundsBeforePurchase: self.settingsButtons[9].value,
                auctionstartprice: self.settingsButtons[10].percentage,
            }
            startGame(playerlist, settings)
            self.current = false;
            self.playerInputs.forEach(e => {
                e.textInput.htmlElement.style.display = "none"
                e.textInput.value = "";
                e.textInput.htmlElement.value = "";
                e.textInput.colorId = undefined;
                e.colorButtons.forEach(g => g.selected = false)
                e.colorButton.img = images.colorButtons.sprites[8];
                e.botButton.selected = false;
                e.textInput.htmlElement.disabled = false;
                e.textInput.oldvalue = ""
            })
            self.useableColors = [0, 1, 2, 3, 4, 5, 6, 7]
        }, 97 * 2, 60, false, false, false, false, false, false)
        this.disableAll = false;
        this.ableToStart = true;

        this.useableColors = [0, 1, 2, 3, 4, 5, 6, 7]

        this.addmorePlayers = function () {
            let id = self.playerInputs.length
            let tmp = {
                id: id,
                colorId: undefined,
                y: (self.playerInputs.length * 110 - 100),
                nameIndex: randomIntFromRange(0, namn.length - 1),
                textInput: new TextInput(40, 300, 560, 80, true, 50, 10, "Spelare " + (id + 1)),
                botButton: new Button([true, false], -50 + 42, self.playerInputs.length * 55 - 32, images.buttons.sprites[13], function () {
                    self.playerInputs[id].textInput.htmlElement.value = ""
                    if (self.playerInputs[id].botButton.selected) {
                        if (self.playerInputs[id].colorId !== undefined) {
                            self.useableColors.push(self.playerInputs[id].colorId)
                        }
                        self.amountBots++;
                        self.playerInputs[id].colorButton.img = images.colorButtons.sprites[8]
                        self.playerInputs[id].colorId = undefined;
                        self.playerInputs[id].colorButtons.forEach(e => e.selected = false);
                    } else {
                        self.amountBots--;
                        self.playerInputs[id].textInput.htmlElement.value = ""
                        self.playerInputs[id].textInput.oldvalue = "";
                        self.playerInputs[id].textInput.htmlElement.disabled = false;
                    }
                    self.playerInputs[id].nameIndex = randomIntFromRange(0, namn.length - 1)
                }, 40, 40, false, false),
                colorButton: new Button([true, false], -50, self.playerInputs.length * 55 - 32, images.colorButtons.sprites[8], function () {
                    if (self.playerInputs[id].colorButton.selected) {
                        self.disableAll = true;
                        if (id < 4) {
                            for (let i = id + 1; i < 3 + id; i++) {
                                self.playerInputs[i].textInput.w = 400
                            }
                        } else {
                            for (let i = id - 2; i < id; i++) {
                                self.playerInputs[i].textInput.w = 400
                            }
                        }
                    } else {
                        self.disableAll = false;
                        self.playerInputs.forEach(e => e.textInput.w = 560)
                    }
                }, 40, 40, false, false, false, true, false, { x: 300, y: 300, w: 200, h: 200, onlySelected: true }),
                colorButtons: []
            }
            for (let i = 0; i < 8; i++) {
                tmp.colorButtons.push(new Button([true, false], 110 + (i % 4) * 47, self.playerInputs.length * 55 + 150 + Math.floor(i / 2) * 50, images.colorButtons.sprites[i], function () {
                    let select = self.playerInputs[id].colorButtons[i].selected;
                    self.playerInputs[id].colorButtons.forEach(e => {
                        e.selected = false;
                    })
                    if (select === true) {
                        self.playerInputs[id].colorButtons[i].selected = true;
                        self.playerInputs[id].colorButton.img = images.colorButtons.sprites[i];
                        if (self.playerInputs[id].colorId !== undefined) {
                            self.useableColors.push(self.playerInputs[id].colorId)
                        }
                        self.useableColors.splice(self.useableColors.indexOf(i), 1)
                        self.playerInputs[id].colorId = i;
                    } else {
                        self.playerInputs[id].colorButtons[i].selected = false;

                        self.playerInputs[id].colorButton.img = images.colorButtons.sprites[8];
                        if (self.playerInputs[id].colorId !== undefined) {
                            self.useableColors.push(self.playerInputs[id].colorId)
                        }
                        self.playerInputs[id].colorId = undefined;
                    }



                }, 40, 40, false, false,false))

                if (i === tmp.colorId) {
                    tmp.colorButtons[i].selected = true;
                }
            }
            self.playerInputs.push(tmp)
        }

        for (let i = 0; i < 8; i++) {
            this.addmorePlayers();
        }

        this.draw = function () {
            if (this.current) {
                drawRotatedImageFromSpriteSheet(0, 0, 960 * drawScale, 540 * drawScale, images.mainMenu.sprites[3], 0, 0, 0, 0, 960, 540)
                this.readyPlayers = [];

                if (this.settingsButtons[0].selected === true) {
                    this.settingsButtons[1].disabled = false;
                } else {
                    this.settingsButtons[1].disabled = true;
                    this.settingsButtons[1].selected = false;
                }
                this.settingsButtons.forEach(e => { e.visible = true; e.draw() })
                this.backButton.visible = true;
                this.startButton.visible = true;
                this.backButton.draw();

                this.playerInputs.forEach(function (e, index) {
                    e.textInput.y = e.y - self.playerInputs.length * 40 + 600;
                    e.botButton.y = e.y / 2 - self.playerInputs.length * 40 / 2 + 238 + 262;
                    e.colorButton.y = e.y / 2 - self.playerInputs.length * 40 / 2 + 238 + 262;
                    for (let i = 0; i < 8; i++) {
                        if (index >= self.playerInputs.length / 2) {
                            e.colorButtons[i].y = e.y / 2 + (i % 2) * 50 + 281 - self.playerInputs.length * 40 / 2 + 118
                        } else {
                            e.colorButtons[i].y = e.y / 2 + (i % 2) * 50 + 291 - self.playerInputs.length * 40 / 2 + 262
                        }
                        e.colorButtons[i].x = Math.floor(i / 2) * 50 - 125
                    }
                })
                this.ableToStart = true;

                this.playerInputs.forEach(e => { e.textInput.visible = true; e.botButton.visible = true; e.colorButton.visible = true })

                let playersReady = [];
                let botsReady = [];

                this.playerInputs.forEach(e => {
                    if ((self.amountBots - self.playerInputs.length) == -1 && e.botButton.selected === false) {
                        e.botButton.disabled = true;
                    } else {
                        e.botButton.disabled = false;
                    }
                    if (e.botButton.selected) {
                        e.textInput.htmlElement.value = namn[e.nameIndex] + "(Bot)";
                        e.textInput.htmlElement.disabled = true;
                        e.colorButton.disabled = true;
                        e.textInput.disabled = true;
                    } else {
                        e.colorButton.disabled = false;
                        e.textInput.disabled = false;
                    }


                    if (self.disableAll && !e.colorButton.selected) {
                        e.textInput.disabled = true;
                        e.botButton.disabled = true;
                        e.colorButton.disabled = true;

                    } else if (self.disableAll) {
                        e.textInput.disabled = true;
                        e.botButton.disabled = true;


                    }
                    if (e.textInput.value !== "" && !e.botButton.selected && e.textInput.value.replace(/\s/g, "").length > 0) {
                        playersReady.push(e);
                        self.readyPlayers.push(e);
                    }
                    if (e.botButton.selected) {
                        botsReady.push(e);
                        self.readyPlayers.push(e);
                    }
                    e.textInput.draw();
                    e.botButton.draw();
                    e.colorButton.draw();
                })
                if (playersReady.length < 1 && botsReady.length < 1) {
                    this.ableToStart = false;
                }
                if (playersReady.length < 2 && botsReady.length < 1) {
                    this.ableToStart = false;
                }
                if (playersReady.length === 0) {
                    this.ableToStart = false;
                }
                this.playerInputs.forEach(function (e, i) {


                    self.playerInputs.forEach(function (g, h) {
                        if (e.textInput.value === g.textInput.value && i !== h && g.textInput.value !== "") {
                            self.ableToStart = false;
                            if (e.botButton.selected) {
                                if (namn[e.nameIndex] == g.textInput.value) {
                                    e.nameIndex = randomIntFromRange(0, namn.length - 1)
                                }
                            }
                        }
                    })
                    if (e.colorButton.selected) {

                        c.fillStyle = "black"
                        if (i >= self.playerInputs.length / 2) {
                            c.fillRect(e.colorButton.x + 550 / 2, e.colorButton.y - 630 / 2, 410 / 2, 230 / 2)
                            e.colorButton.invertedHitbox = { x: e.colorButton.x * drawScale + 550, y: e.colorButton.y * drawScale - 610, w: 410, h: 210, onlySelected: true }
                        } else {
                            c.fillRect(e.colorButton.x + 550 / 2, e.colorButton.y - 26 / 2 - 294 / 2, 410 / 2, 230 / 2)
                            e.colorButton.invertedHitbox = { x: e.colorButton.x * drawScale + 550, y: e.colorButton.y * drawScale - 26 - 294, w: 410, h: 210, onlySelected: true }
                        }
                        e.colorButtons.forEach(function (g, h) {
                            for (let i = 0; i < self.useableColors.length; i++) {
                                if (h === self.useableColors[i]) {
                                    g.disabled = false;
                                    i = 10;
                                } else if (!g.selected) {
                                    g.disabled = true;
                                }
                            }
                            if (self.useableColors.length == 0) {
                                if (!g.selected) {
                                    g.disabled = true;
                                }
                            }
                            g.visible = true;
                            g.draw();
                        })
                    }
                })
                playersReady.forEach(e => { if (e.textInput.value === "") { self.ableToStart = false } })
                if (this.ableToStart) {
                    this.startButton.disabled = false;
                } else {
                    this.startButton.disabled = true;
                }
                this.startButton.draw();

            }
        }
    }
}
class StatMenu{
    constructor(){
        this.game = undefined;
        let self = this;
        

        this.type = 1;

        this.backButton = new Button([false, false], -345, 220, images.buttons.sprites[12], function () {
            self.current = false;
            menus[2].current = true;
            menus[2].init();
            menus[0].volume.percentage = musicVolume
        }, 325, 60, false, false, false, false, false, false)
        this.changeTypeButton = new Button([true, true], -345 + 340, 212, images.statMenu.sprites[6], function () {}, 81, 81, false, false, false, false, false, { x: 385, y: 184, w: 400*2, h: 400*2, onlySelected: true })

        this.statButtons = []
        this.statButtons.push(new Button([false,false],-154,380 + 60*this.statButtons.length,images.statMenu.sprites[8],function(){self.changeType(self.statButtons.indexOf(this) + 1)},380,55,false,false,false,true))
        this.statButtons.push(new Button([false,false],-154,380 + 60*this.statButtons.length,images.statMenu.sprites[9],function(){self.changeType(self.statButtons.indexOf(this) + 1)},380,55,false,false,false,true))
        this.statButtons.push(new Button([false,false],-154,380 + 60*this.statButtons.length,images.statMenu.sprites[10],function(){self.changeType(self.statButtons.indexOf(this) + 1)},380,55,false,false,false,true))
        this.statButtons.push(new Button([false,false],-154,380 + 60*this.statButtons.length,images.statMenu.sprites[11],function(){self.changeType(self.statButtons.indexOf(this) + 1)},380,55,false,false,false,true))
        this.statButtons.push(new Button([false,false],-154,380 + 60*this.statButtons.length,images.statMenu.sprites[12],function(){self.changeType(self.statButtons.indexOf(this) + 1)},380,55,false,false,false,true))

        this.changeType = function(typeToChangeTo){
            if(this.game.saveVersion >= 1){
                this.type = typeToChangeTo;
            }
        }

        this.draw = function(){
            if (this.current) {
                drawRotatedImageFromSpriteSheet(0, 0, 960 * drawScale, 540 * drawScale, images.statMenu.sprites[this.type], 0, 0, 0, 0, 960, 540)
                this.changeTypeButton.visible = true;
                this.changeTypeButton.draw();
                this.backButton.visible = true;
                this.backButton.draw();
                this.statButtons.forEach((e,i) => e.disabled = !(this.game.saveVersion <= 1 || i ===0))

                
                if(this.type == 1){
                    this.game.players = this.game.players.sort((a,b) => {
                        return a.tmp - b.tmp;
                    }).reverse()
    
                    this.game.players.forEach(function(e,i){
                        e.tmp = e.money;
    
                        c.textAlign = "left";
                        c.fillStyle = "black";  
                        c.font = "40px Arcade"
                        c.fillText(i+1, 20,i*54 + 134)
                        c.fillText(e.name, 80,i*54 + 134)
                        c.fillText(e.tmp + "kr", 560,i*54 + 134)
                        c.fillText(timeToText(e.playTime), 750,i*54 + 134)
                    })
                }
                if(this.type == 2){
                    this.game.players = this.game.players.sort((a,b) => {
                        return a.tmp - b.tmp;
                    })
    
                    this.game.players.forEach(function(e,i){
                        e.tmp = e.totalEarned;
                        c.textAlign = "left";
                        c.fillStyle = "black";  
                        c.font = "40px Arcade"
                        c.fillText(i+1, 20,i*54 + 134)
                        c.fillText(e.name, 80,i*54 + 134)
                        c.fillText(e.tmp + "kr", 560,i*54 + 134)
                        c.fillText(timeToText(e.playTime), 750,i*54 + 134)
                    })
                }
                if(this.type == 3){
                    this.game.players = this.game.players.sort((a,b) => {
                        return a.tmp - b.tmp;
                    })
    
                    this.game.players.forEach(function(e,i){
                        e.tmp = e.totalLost;
                        c.textAlign = "left";
                        c.fillStyle = "black";  
                        c.font = "40px Arcade"
                        c.fillText(i+1, 20,i*54 + 134)
                        c.fillText(e.name, 80,i*54 + 134)
                        c.fillText(e.tmp + "kr", 560,i*54 + 134)
                        c.fillText(timeToText(e.playTime), 750,i*54 + 134)
                    })
                }
                if(this.type == 4){
                    this.game.boardPiecesFiltered = this.game.boardPieces.filter(e => {
                        return (e.name !== "Start" && e.name !== "Allmänning" && e.name !== "Chans" && e.name !== "fängelse" && e.name !== "Fri parkering" && e.name !== "Gå till finkan")
                    })
                    this.game.boardPiecesFiltered = this.game.boardPiecesFiltered.sort((a,b) => {
                        return b.totalEarned - a.totalEarned;
                    })
    
                    for(let i = 0; i < 8; i++){
                        c.textAlign = "left";
                        c.fillStyle = "black";  
                        c.font = "40px Arcade"
                        c.fillText(i+1, 20,i*54 + 134)
                        c.fillText(this.game.boardPiecesFiltered[i].name, 80,i*54 + 134)
                        c.fillText(this.game.boardPiecesFiltered[i].totalEarned + "kr", 560,i*54 + 134)
                        c.fillText(timeToText(this.game.boardPiecesFiltered[i].owner), 750,i*54 + 134)
                    }    
                    
                }
                if(this.type == 5){
                    this.game.boardPiecesFiltered = this.game.boardPieces.filter(e => {
                        return (e.name !== "Start" && e.name !== "Allmänning" && e.name !== "Chans" && e.name !== "fängelse" && e.name !== "Fri parkering" && e.name !== "Gå till finkan")
                    })
                    this.game.boardPiecesFiltered = this.game.boardPiecesFiltered.sort((a,b) => {
                        return a.totalEarned - b.totalEarned;
                    })
    
                    for(let i = 0; i < 8; i++){
                        c.textAlign = "left";
                        c.fillStyle = "black";  
                        c.font = "40px Arcade"
                        c.fillText(i+1, 20,i*54 + 134)
                        c.fillText(this.game.boardPiecesFiltered[i].name, 80,i*54 + 134)
                        c.fillText(this.game.boardPiecesFiltered[i].totalEarned + "kr", 560,i*54 + 134)
                        c.fillText(timeToText(this.game.boardPiecesFiltered[i].owner), 750,i*54 + 134)
                    }    
                    
                }
                if(this.changeTypeButton.selected){
                    drawRotatedImageFromSpriteSheet(385, 184, 400 * drawScale, 400 * drawScale, images.statMenu.sprites[7], 0, 0, 0, 0, 400, 400)

                    this.statButtons.forEach(e => {
                        e.visible = true;
                        e.draw();
                    })
                }
            }
        }
    }
}
class CreditsMenu {
    constructor() {
        this.current = false;
        let self = this;

        this.backButton = new Button([false, false], -280, 220, images.buttons.sprites[12], function () {
            self.current = false;
            menus[0].current = true;
            menus[0].volume.percentage = musicVolume
        }, 325, 60, false, false, false, false, false, false)

        this.draw = function () {
            if (this.current) {
                drawRotatedImageFromSpriteSheet(0, 0, 960 * drawScale, 540 * drawScale, images.mainMenu.sprites[5], 0, 0, 0, 0, 960, 540)
                this.backButton.visible = true;
                this.backButton.draw();
            }
        }
    }

}
class LoadingMenu {
    constructor() {
        this.current = false;
        let self = this;

        this.backButton = new Button([false, false], -280, 220, images.buttons.sprites[12], function () {
            self.current = false;
            menus[0].current = true;
            menus[0].volume.percentage = musicVolume
        }, 325, 60, false, false, false, false, false, false)

        this.startButton = new Button([false, false], -213, 650, images.buttons.sprites[11], function () {
            self.buttons.forEach(function (e, i) {
                if (e.selected === true) {
                    self.games = JSON.parse(localStorage.getItem("games")).reverse()
                    menus[2].current = false;
                    loadGame(self.games.length - i - 1)
                }
            })
        }, 97 * 2, 60)
        this.deleteSave = new Button([false, false], 40, 650 + 20, images.buttons.sprites[2], function () {
            self.buttons.forEach(function (e, i) {
                if (e.selected === true) {
                    self.buttons.forEach(e => e.selected = false)

                    self.games = JSON.parse(localStorage.getItem("games")).reverse()

                    if (self.games.reverse().length == 1) {
                        localStorage.removeItem("games")
                        self.backButton.onClick();
                    } else {
                        self.games.reverse().splice(self.games.reverse().length - 1 - i, 1)

                        localStorage.setItem("games", JSON.stringify(self.games.reverse()))
                        self.init();
                    }
                    if (i === self.buttons.length - 1) {
                        self.buttons[i].selected = true;
                        self.buttons[i].onClick();
                    } else {
                        if (i - 1 === -1) {
                            self.buttons[i].selected = true;
                            self.buttons[i].onClick();
                        } else {
                            self.buttons[i - 1].selected = true;
                            self.buttons[i - 1].onClick();
                        }

                    }


                }
            })
        }, 40, 40)

        this.statButton = new Button([false, false], -300, 650 + 20, images.statMenu.sprites[0], function () {
            self.buttons.forEach(function (e, i) {
                if (e.selected === true) {
                    self.games = JSON.parse(localStorage.getItem("games")).reverse();
                    self.current = false;
                    menus[4].current = true;
                    menus[4].game = self.games.reverse()[self.games.length - i - 1];
                    menus[0].volume.percentage = musicVolume
                }
            })

        },40,40)


        this.buttons = [];
        if (localStorage.getItem("games") != null) {
            this.games = JSON.parse(localStorage.getItem("games")).reverse();
        }
        this.screenshot = new Image()

        this.draw = function () {
            if (this.current) {
                let tmp = false;


                drawRotatedImageFromSpriteSheet(0, 0, 960 * drawScale, 540 * drawScale, images.mainMenu.sprites[3], 0, 0, 0, 0, 960, 540)
                this.deleteSave.disabled = true;
                this.statButton.disabled = true;

                self.buttons.forEach(function (e, i) {
                    if (e.selected) {
                        c.drawImage(self.screenshot, 0, canvas.height / 4, canvas.width / 2, canvas.height / 2)
                        c.lineWidth = scale
                        c.strokeRect(0, canvas.height / 4, canvas.width / 2, canvas.height / 2)
                        c.fillStyle = self.games.reverse()[self.games.length - i - 1].saveVersion == latestSaveVersion ? "green" : "red";
                        c.shadowBlur = 5;
                        c.shadowColor = "black";
                        c.font = "20px Arcade";
                        c.textAlign = "left";
                        c.fillText("Sparfilsversion: " + (self.games.reverse()[self.games.length - i - 1].saveVersion == undefined ? 0 : self.games.reverse()[self.games.length - i - 1].saveVersion), 10, 425);
                        c.fillText("Spelversion: " + latestSaveVersion, 10, 445);
                        c.shadowBlur = 0;
                        self.games = JSON.parse(localStorage.getItem("games")).reverse()
                        if(self.games.reverse()[self.games.length - i - 1].players.filter(e => {return e.dead != true}).length > 1){
                            tmp = true;
                        }
                        if(self.games.reverse()[self.games.length - i - 1].saveVersion === latestSaveVersion){
                            self.statButton.disabled = false;
                        }
                        self.deleteSave.disabled = false;
                    }
                })
                this.deleteSave.visible = true;
                this.deleteSave.draw();

                this.startButton.disabled = !tmp;
                this.backButton.visible = true;
                this.backButton.draw();
                this.buttons.forEach(e => {
                    e.visible = true;
                    e.draw();
                })
                this.startButton.visible = true;
                this.statButton.visible = true;
                this.startButton.draw();
                this.statButton.draw();
            }
        }

        this.init = function () {
            if (localStorage.getItem("games") != null) {
                this.games = JSON.parse(localStorage.getItem("games")).reverse()
                this.buttons = [];
                this.games.forEach(function (e, i) {
                    if (i < 10) {
                        self.buttons.push(new Button([true, false], 140, 220 + 50 * i, images.buttons.sprites[23], function () {
                            self.games = JSON.parse(localStorage.getItem("games")).reverse()

                            if (self.buttons[i].selected) {
                                downscale(self.games[i].screenshot, canvas.width / 2, canvas.height / 2, { imageType: "png" }).
                                    then(function (dataURL) {
                                        self.screenshot.src = dataURL;
                                    })
                            }
                        }, 450, 40, false, false, false, false, false, { x: 100 * 2 + 720, y: 40 + 50 * 2 * i, w: 500 * 2, h: 40 * 2, onlySelected: true }, self.games[i].currentDay + " " + self.games[i].currentTime + "  Speltid:" + timeToText((self.games[i].playtime)), 38, "black"))
                    }
                })
            }
        }
    }
}

class MainMenu {
    constructor() {
        this.current = true;
        let self = this;

        this.localButton = new Button([false, false], -322, 380, images.mainMenu.sprites[1], function () {
            self.current = false;
            menus[1].current = true;
        }, 195, 52, false, false, true)
        this.loadButton = new Button([false, false], -322, 460, images.buttons.sprites[22], function () {
            self.current = false;
            menus[2].current = true;
            menus[2].init();
        }, 195, 52, false, false, true)
        this.creditsButton = new Button([false, false], -322, 620, images.mainMenu.sprites[4], function () {
            self.current = false;
            menus[3].current = true;
        }, 195, 52, false, false, true)

        this.onlineButton = new Button([false, false], -322, 540, images.mainMenu.sprites[2], function () {
            self.current = false;
            showOnlineLobby();
        }, 195, 52, false, false, true)

        this.musicButton = new Button([true, false], -317 + 40 + 140, 700, images.buttons.sprites[14], function () {
            if (self.musicButton.selected) {
                document.cookie = `musicOn=${musicVolume};Expires=Sun, 22 oct 2030 08:00:00 UTC;`;
                musicOn = musicVolume;
                musicVolume = 0;
                self.volume.percentage = 0
            } else {
                document.cookie = `musicOn=${musicVolume};Expires=Sun, 22 oct 2030 08:00:00 UTC;`;
                musicVolume = musicOn;
                self.volume.percentage = musicVolume
                musicOn = 0;
            }
            if (musicPlaying) {
                musicPlaying.volume = musicVolume;
            }

        }, 40, 40, false)
        this.imageSmoothingButton = new Button([true, false], -317 + 40 + 140 + 40, 700, images.buttons.sprites[21], function () {
            renderC.imageSmoothingEnabled = self.imageSmoothingButton.selected;
        }, 40, 40, false)

        this.finishButton = new Button([true, false], -317, 700, images.buttons.sprites[19], function () {
            if (self.finishButton.selected) {
                finish = true;
            } else {
                finish = false;

            }
            document.cookie = `finish=${finish};Expires=Sun, 22 oct 2030 08:00:00 UTC;`;
            clearTimeout(musictimer)
            musicPlaying.pause();
            firstclick = true;
            if (finish) {
                playSound(sounds.msc, musicVolume, true)
            } else {
                playSound(sounds.music, musicVolume, true)
            }



        }, 40, 40, false)
        this.finishButton.selected = finish;
        this.fullScreenButton = new Button([true, true], -357, 700, images.buttons.sprites[18], function () {
            if (this.selected) {
                document.documentElement.requestFullscreen()
            } else {
                document.exitFullscreen()
            }
        }, 40, 40, false)
        this.volume = new Slider(240 - 80, 1000, 280, 80, 0, 100, 1, true, 50, "%", "", function () {
            musicVolume = self.volume.value / 100;
            document.cookie = `musicVolume=${musicVolume};Expires=Sun, 22 oct 2030 08:00:00 UTC;`;
            if (musicPlaying) {
                musicPlaying.volume = musicVolume;
            }
        })
        this.volume.percentage = musicVolume
        this.onlineButton.disabled = false;

        this.draw = function () {
            if (this.current) {
                drawRotatedImageFromSpriteSheet(0, 0, 960 * drawScale, 540 * drawScale, images.mainMenu.sprites[0], 0, 0, 0, 0, 960, 540)
                this.loadButton.disabled = localStorage.getItem("games") == null
                this.musicButton.selected = musicVolume === 0 ? true : false;
                this.localButton.visible = true;
                this.onlineButton.visible = true;
                this.loadButton.visible = true;
                this.creditsButton.visible = true;
                this.musicButton.visible = true;
                this.imageSmoothingButton.visible = true;
                this.finishButton.visible = true;
                this.fullScreenButton.visible = true;
                this.fullScreenButton.selected = document.fullscreenElement != null;
                this.imageSmoothingButton.selected = renderC.imageSmoothingEnabled;
                this.volume.visible = true;
                this.localButton.draw();
                this.onlineButton.draw();
                this.loadButton.draw();
                this.creditsButton.draw();
                this.musicButton.draw();
                this.imageSmoothingButton.draw();
                this.finishButton.draw();
                this.fullScreenButton.draw();
                this.volume.draw();
            }
        }
    }
}

class TextInput {
    constructor(x, y, w, h, showtext, font, maxLength, placeHolder) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.visible = false;
        this.disabled = false;
        this.showtext = showtext;
        this.font = font;
        this.follow = false;
        this.value = ""
        this.maxLength = maxLength;
        this.placeHolder = placeHolder;
        this.htmlElement = document.createElement("input");
        document.body.appendChild(this.htmlElement)
        this.oldvalue = this.htmlElement.value;

        this.htmlElement.style.position = "absolute"

        this.htmlElement.style.padding = "0px"
        this.htmlElement.style.zIndex = 100;
        this.htmlElement.style.display = "none"
        this.htmlElement.style.fontFamily = "Arcade"
        this.htmlElement.style.lineHeight = "200%"
        this.htmlElement.placeholder = this.placeHolder != undefined ? this.placeHolder : ""

        this.htmlElement.addEventListener("mousemove", e => {
            mouse.x = 10000;
            mouse.y = 10000;
        })

        this.draw = function () {
            this.htmlElement.style.left = this.x * scale / 2 + (window.innerWidth - renderCanvas.width) / 2 - 5 * scale / 2 + "px";
            this.htmlElement.style.top = this.y * scale / 2 + (window.innerHeight - renderCanvas.height) / 2 - 5 * scale / 2 + "px";
            this.htmlElement.style.width = this.w * scale / 2 + "px";
            this.htmlElement.style.height = this.h * scale / 2 + "px";
            this.htmlElement.style.fontSize = this.font * scale / 2 + "px"
            this.htmlElement.maxLength = this.maxLength;
            this.htmlElement.style.border = 5 * scale / 2 + "px solid black "

            if (this.visible) {
                if (this.oldvalue !== this.htmlElement.value) {
                    this.oldvalue = this.htmlElement.value;
                    if (!this.htmlElement.disabled) {
                        playSound(sounds.key, 1, false)
                    }
                }
                this.htmlElement.style.display = "inline"
                this.value = this.htmlElement.value

            }
        }
    }
}

async function init() {
    document.body.appendChild(canvas);
    canvas.style.zIndex = -150;
    document.body.appendChild(backCanvas);
    backCanvas.style.zIndex = -100;
    document.body.appendChild(renderCanvas);
    renderCanvas.style.zIndex = 10;

    await preRender(images);
    loadSounds(sounds);

    await loadNames()


    if (location.search != "") {
        await showOnlineLobby();
        return;
    }


    if (fastLoad === false) {
        menus.push(new MainMenu())
        menus.push(new LocalLobby())
        menus.push(new LoadingMenu())
        menus.push(new CreditsMenu())
        menus.push(new StatMenu())
        update();

    } else {
        menus.push(new MainMenu())
        menus.push(new LocalLobby())
        menus.push(new LoadingMenu())
        menus.push(new CreditsMenu())
        menus.push(new StatMenu())

        menus[0].current = false;

        let playerlist = []
        let playerAmount = 2;
        let botAmount = 0;
        let useableColors = [0, 1, 2, 3, 4, 5, 6, 7]
        for (let i = 0; i < (playerAmount + botAmount); i++) {
            let random = randomIntFromRange(0, useableColors.length - 1)
            if (i < playerAmount) {
                let tmp = {
                    name: "Spelare " + (i + 1),
                    color: useableColors[random],
                    bot: false
                }
                playerlist.push(tmp)
            } else {
                let tmp = {
                    name: "Bot " + (i - 1),
                    color: useableColors[random],
                    bot: true
                }
                playerlist.push(tmp)
            }
            useableColors.splice(random, 1)

        }

        let settings = {
            freeParking: false,
            allFreeparking: false,
            doubleincome: true,
            auctions: true,
            prisonmoney: true,
            mortgage: true,
            even: true,
            startmoney: 1400,
            roundsBeforePurchase: 0,
            auctionstartprice: 0.5,
        }
        startGame(playerlist, settings)
        update();

    }
}

function update() {
    requestAnimationFrame(update);

    buttons.forEach(e => {
        e.visible = false;
    });

    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, canvas.width, canvas.height);
    renderC.clearRect(0, 0, renderCanvas.width, renderCanvas.height);
    showBackground();

    if (board !== undefined && players.length > 0) {
        board.update();
    }

    
    menus.forEach(e => e.draw())

    renderC.drawImage(canvas, 0, 0, renderCanvas.width, renderCanvas.height)

    let tmp = false;

    buttons.forEach(e => {
        if (e.hover && e.visible) {
            tmp = true;
        }
    });

    if (tmp === true) {
        renderCanvas.style.cursor = "pointer"
    } else {
        renderCanvas.style.cursor = "auto"
    }
}

function showBackground() {
    for (let x = -4; x < 8; x++) {
        for (let y = -4; y < 8; y++) {
            let coords = to_screen_coordinate(x, y)
            drawRotatedImageFromSpriteSheet((window.innerWidth - 832 * scale) + 832 * scale * 1.9 * coords.x, (window.innerHeight - 416 * scale) + 832 * scale * 1.9 * coords.y, 832 * scale * 2, 416 * scale * 2, images.background.sprites[1], 0, false, 0, 0, 832, 416, 0, backC)

        }
    }
    drawIsometricImage(-92, 352, images.background.sprites[0], false, 0, 0, 572, 286, 0, 0)
}

async function showOnlineLobby() {
    Api.online = true;
    var username = location.search == "" ? prompt("Vad vill du ha för namn?") : decodeURI(location.search.split("&")[1]);
    var serverURL = location.search == "" ? prompt("Ange addressen som servern visar, för att gå med i ett spel.\n(Obs. Om du inte har en server, följ anvisningarna på github)") : atob(location.search.substring(1).split("&")[0]);
    history.replaceState(undefined, undefined, location.href.replace(location.search, ""));
    try {
        document.body.addEventListener("start_game", (evt) => {
            var data = evt.detail;

            document.getElementById("lobby").style.display = "none";
            players.forEach(e => buttons.splice(buttons.indexOf(e.playerBorder.button), 1))
            players = [];
            data.players.forEach((player) => {
                players.push(new Player(images.player.sprites[player.colorIndex], player.colorIndex, player.name, false));
            });
            // Got no idea where the extra players come from, as they should be cleared aboved. But here's an extra check to remove them
            board.boardPieces[0].currentPlayer = board.boardPieces[0].currentPlayer.filter(x => players.indexOf(x) != -1);

            if (Api.currentPlayer == 0) {
                board.rollDiceButton.visible = true;
                board.nextPlayerButton.visible = false;
            }

            update();
        });

        document.body.addEventListener("join_info", (evt) => {
            var data = evt.detail;
            window.board = new Board();

            board.settings = data.settings;

            data.players.forEach((player) => {
                players.push(new Player(images.player.sprites[player.colorIndex], player.colorIndex, player.name, false));
            });

            Api.currentPlayer = data.thisPlayer;

            document.getElementById("lobby").style.display = "grid";

            data.players.forEach(p => {
                var player = document.createElement("div");
                var span = document.createElement("span");
                var img = document.createElement("img");

                player.className = "player";
                player.style.color = !p.isReady ? "red" : "green";

                span.innerText = p.name;
                img.src = images.player.src[p.colorIndex] + ".png";

                player.appendChild(span);
                player.appendChild(img);

                document.getElementById("player-container").appendChild(player);
            })
        });

        document.body.addEventListener("player_left", (evt) => {
            if (document.getElementById("lobby").style.display != "none") {
                // If the lobby is visible, remove this player from the list
                var playerContainer = document.getElementById("player-container");
                var index = players.findIndex(x => x.colorIndex == evt.detail.index);
                var player = players.splice(index, 1);
                playerContainer.removeChild(playerContainer.children[index]);
            } else {
                // Set the player to a bot if it left
                var player = players.find(x => x.colorIndex == evt.detail.index);
                player.bot = new Bot(player);
            }
        });

        document.body.addEventListener("player_joined", (evt) => {
            if (evt.detail.index == Api.currentPlayer || Api.currentPlayer == -1) return;
            players.push(new Player(images.player.sprites[evt.detail.index], evt.detail.index, evt.detail.username, false));

            var player = document.createElement("div");
            var span = document.createElement("span");
            var img = document.createElement("img");

            player.className = "player";

            span.innerText = evt.detail.username;
            img.src = images.player.src[evt.detail.index] + ".png";

            player.appendChild(span);
            player.appendChild(img);

            document.getElementById("player-container").appendChild(player);
        });

        document.body.addEventListener("move_event", (evt) => players[evt.detail.player].teleportTo(evt.detail.steps, evt.detail.step != 10, false));

        document.body.addEventListener("new_turn_event", (evt) => {
            turn = evt.detail.id;
            board.textsize = measureText({ font: "Arcade", text: "Just nu: " + players[turn].name });
            if (Api.currentPlayer == turn) {
                board.rollDiceButton.visible = true;
                board.nextPlayerButton.visible = false;
            } else {
                board.rollDiceButton.visible = false;
                board.nextPlayerButton.visible = false;
            }
        });

        document.body.addEventListener("tile_purchased_event", (evt) => {
            var data = evt.detail;
            var player = players.find(x => x.colorIndex == data.player);
            var currentCard = board.boardPieces.find(x => x.piece.card == data.tile);

            player.money = data.money;
            player.ownedPlaces.push(currentCard);

            currentCard.owner = player;
            board.currentCard = undefined;
            board.sellButton.visible = false;

            currentCard.mortgaged = false;

            clearInterval(board?.auction?.timer);
            board.auction = undefined;

            board.buyButton.visible = false;
            board.auctionButton.visible = false;
        });

        document.body.addEventListener("auction_show_event", (evt) => {
            var data = evt.detail;
            var currentCard = board.boardPieces.find(x => x.piece.card == data.tile);

            board.auction = new Auction(currentCard);
            board.currentCard = undefined;
            board.sellButton.visible = false;
            board.buyButton.visible = false;
            board.auctionButton.visible = false;
        });

        document.body.addEventListener("auction_start_event", (evt) => {
            board.auction.started = true;
            board.auction.timer = setInterval(() => {
                board.auction.time -= 1;
            }, 10);
        })

        document.body.addEventListener("auction_bid_event", (evt) => {
            var data = evt.detail;

            if (data.is_out) {
                if (board.auction == undefined) return;

                board.auction.playerlist.splice(board.auction.playerlist.findIndex(x => x.colorIndex == data.player), 1);
                if (board.auction.playerlist.length == 1 && board.auction.playerlist[0].colorIndex == Api.currentPlayer) {
                    Api.tilePurchased(board.auction.card, board.auction.auctionMoney);
                }
            } else {
                board.auction.auctionMoney = data.money;
                board.auction.turn = board.auction.playerlist.findIndex(x => x.colorIndex == data.nextPlayer);
            }
            board.auction.time = 432;


            if (data.player == Api.currentPlayer) {
                // Remove buttons
                board.auction.addMoneyButton2.visible = false;
                board.auction.addMoneyButton10.visible = false;
                board.auction.addMoneyButton100.visible = false;
            }
        });

        document.body.addEventListener("random_card", (evt) => {
            var data = evt.detail;
            var player = players.find(x => x.colorIndex == data.player);

            if (data.type == "CHANCE_CARD") {
                board.boardPieces[player.steps].doChanceCard(data.id, player);
            } else {
                board.boardPieces[player.steps].doCommunityChest(data.id, player);
            }
        });

        document.body.addEventListener("property_changed_event", (evt) => {
            var data = evt.detail;
            var currentCard = board.boardPieces.find(x => x.piece.card == data.tile);

            currentCard.level = data.new_level;
            currentCard.owner.money = data.money;
        });

        document.body.addEventListener("player_ready_event", (evt) => {
            var index = players.findIndex(x => x.colorIndex == evt.detail.player);
            if (document.getElementById("lobby").style.display != "none") {
                var playerContainer = document.getElementById("player-container");
                playerContainer.children[index].style.color = playerContainer.children[index].style.color == "green" ? "red" : "green";
            }
        });

        document.body.addEventListener("tile_mortgaged_event", (evt) => {
            var data = evt.detail;
            var currentCard = board.boardPieces.find(x => x.piece.card == data.tile);
            var player = players.find(x => x.colorIndex == data.player);

            currentCard.mortgaged = true;
            player.money = data.money;
        });

        document.body.addEventListener("request_trade_event", (evt) => {
            if (evt.detail.target == Api.currentPlayer) {
                var thisPlayer = players.find(x => x.colorIndex == Api.currentPlayer);
                var otherPlayer = players[turn];
                board.trade = new Trade(thisPlayer, otherPlayer);
            }
        });

        document.body.addEventListener("trade_concluded_event", (evt) => {
            if (evt.detail.successful) {
                var contents = evt.detail.contents;

                var p1 = players.find(p => p.colorIndex == evt.detail.p1);
                var p2 = players.find(p => p.colorIndex == evt.detail.p2);

                var p1New = contents.p2.tiles.map(tile => board.boardPieces.find(x => x.piece.card == tile.card));
                var p2New = contents.p1.tiles.map(tile => board.boardPieces.find(x => x.piece.card == tile.card));

                p1New.forEach(tile => {
                    p2.ownedPlaces.splice(p2.ownedPlaces.findIndex(t => t.piece.card == tile.piece.card), 1);
                    p1.ownedPlaces.push(tile);
                    tile.owner = p1;
                });

                p2New.forEach(tile => {
                    p1.ownedPlaces.splice(p1.ownedPlaces.findIndex(t => t.piece.card == tile.piece.card), 1);
                    p2.ownedPlaces.push(tile);
                    tile.owner = p2;
                });

                p1.money += contents.p2.money;
                p2.money += contents.p1.money;
                p1.money -= contents.p1.money;
                p2.money -= contents.p2.money;

                if (board.trade != undefined) {
                    board.trade.closeButton.visible = false;
                    board.trade.p1ConfirmButton.visible = false;
                    board.trade.p2ConfirmButton.visible = false;
                    board.trade.p1Slider.visible = false;
                    board.trade.p1Slider.visible = false;
                    board.trade.p1PropertyButtons.forEach(e => { e.visible = false; });
                    board.trade.p2PropertyButtons.forEach(e => { e.visible = false; });
                }
            }
            players.forEach(p => { p.playerBorder.button.disabled = false; });
            board.trade = undefined;
        });

        document.body.addEventListener("trade_accept_update_event", (evt) => {
            if (board.trade != undefined && evt.detail.target == Api.currentPlayer) {
                board.trade.p2ConfirmButton.selected = evt.detail.successful;
            }
        });

        document.body.addEventListener("trade_content_update_event", (evt) => {
            if (evt.detail.target == Api.currentPlayer) {
                board.trade.contents.p2 = evt.detail.contents;

                board.trade.p2Slider.percentage = (board.trade.contents.p2.money - board.trade.p2Slider.min) / (board.trade.p2Slider.max - board.trade.p2Slider.min);
                board.trade.p2PropertyButtons.forEach(button => {
                    button.selected = board.trade.contents.p2.tiles.some(tile => tile.card == button.card);
                });
            }
        });

        document.body.addEventListener("exited_jail_event", (evt) => {
            var player = players.find(p => p.colorIndex == evt.detail.player);
            if (evt.detail.player != Api.currentPlayer) {
                // This has already been done for the player in question
                if (evt.detail.type == "MONEY") {
                    player.money -= 50;
                } else if (evt.detail.type == "CARD") {
                    player.jailcardAmount -= 1;
                }
            }
            player.getOutOfJail(undefined, false);
        });

        await Api.openWebsocketConnection(serverURL, username);
    } catch (err) {
        alert("VIKTIGT!\nDu kommer att hamna på en annan webbsida.\nFör att gå med i spelet måste du klicka på:\nAvancerat...>Acceptera risken och fortsätt\nOm du inte gör detta så kommer du inte kunna ansluta till spelet.");
        location = "https://" + serverURL + "/" + btoa(location.href) + "/" + encodeURI(username);
    }
}

class Board {
    constructor(id) {
        id = undefined;
        this.boardSettings = {
            freeParking: false
        }
        this.dice1 = 1;
        this.dice2 = 1;
        this.dice1Type = 0;
        this.dice2Type = 0;
        this.boardPieces = [];
        this.prisonExtra = new BoardPiece(-1, [])
        this.showDices = false;
        this.animateDices = false;
        this.auction = undefined;
        this.trade = undefined;
        this.currentShowingCard = undefined;
        let self = this;
        this.textsize = 0;
        this.numberOfHotels = 0;
        this.numberOfHouses = 0;


        this.musicButton = new Button([true, false], 5 + 49 * 4, 530 + 40, images.buttons.sprites[14], function () {
            if (self.musicButton.selected) {
                document.cookie = `musicOn=${musicVolume};Expires=Sun, 22 oct 2030 08:00:00 UTC;`;
                musicOn = musicVolume;
                musicVolume = 0;
                self.volume.percentage = 0
            } else {
                document.cookie = `musicOn=${musicVolume};Expires=Sun, 22 oct 2030 08:00:00 UTC;`;
                musicVolume = musicOn;
                self.volume.percentage = musicVolume
                musicOn = 0;
            }
            if (musicPlaying) {
                musicPlaying.volume = musicVolume;
            }
        }, 40, 40, false)
        this.volume = new Slider(920, 540 + 200, 180, 80, 0, 100, 1, true, 50, "%", "", function () {
            musicVolume = self.volume.value / 100;
            document.cookie = `musicVolume=${musicVolume};Expires=Sun, 22 oct 2030 08:00:00 UTC;`;
            if (musicPlaying) {
                musicPlaying.volume = musicVolume;
            }
        })
        this.volume.percentage = musicVolume
        this.imageSmoothingButton = new Button([true, false], 5, 530 + 40, images.buttons.sprites[21], function () {
            renderC.imageSmoothingEnabled = self.imageSmoothingButton.selected;
        }, 40, 40, false)
        this.fullScreenButton = new Button([true, true], 5 + 49, 530 + 40, images.buttons.sprites[18], function () {
            if (this.selected) {
                document.documentElement.requestFullscreen()
            } else {
                document.exitFullscreen()
            }
        }, 40, 40, false)

        this.goToMainMenuButton = new Button([false, false], 5 + 49 * 1, 520, images.buttons.sprites[15], function () {
            board.getToMainMenuButton.selected = false;
        }, 40, 40, false, false, false, false, false, { x: 722, y: 336, w: 256 * drawScale, h: 256 * drawScale });

        this.escapeConfirm = new Button([false, false], 5 + 49 * 3, 520, images.buttons.sprites[16], function () {
            board.getToMainMenuButton.selected = false;
            setTimeout(() => {
                saveGame()
                players.forEach(e => buttons.splice(buttons.indexOf(e.playerBorder.button), 1))
                players = [];
                menus[4].current = true;
                menus[0].volume.percentage = musicVolume
                if (Api.online) Api.disconnect();
                timeouts.forEach(e => clearTimeout(e));
                intervals.forEach(e => clearInterval(e));
                timeouts = [];
                board = undefined;
                buttons = [];
                menus = [];

                init();
            }, 100);

        }, 40, 40, false, false, false, false, false,);
        this.statButton = new Button([false, false], 5 + 49 * 2, 520, images.statMenu.sprites[0], function () {
            board.getToMainMenuButton.selected = false;
            setTimeout(() => {
                let tmp2 = saveGame()
                players.forEach(e => buttons.splice(buttons.indexOf(e.playerBorder.button), 1))
                players = [];
                menus[4].current = true;
                menus[0].volume.percentage = musicVolume
                if (Api.online) Api.disconnect();
                timeouts.forEach(e => clearTimeout(e));
                intervals.forEach(e => clearInterval(e));
                timeouts = [];
                board = undefined;
                buttons = [];
                menus = [];

                init();
                setTimeout(() => {
                    menus[4].current = true;
                    menus[4].game = tmp2;
                    menus[0].current = false;
                },100)
            }, 100);

        }, 40, 40, false, false, false, false, false,);
        this.getToMainMenuButton = new Button([true, false], 84, 700, images.buttons.sprites[17], function () {
            self.volume.percentage = musicVolume
        }, 80, 40, false, false, false, true, false, false)


        this.payJailButton = new Button([false, false], -15, 500, images.jailMenu.sprites[1], function () {
            players[turn].money -= 50;
            if (board.settings.freeParking) {
                board.boardPieces[20].money += 50;
            }
            players[turn].rolls = true;
            players[turn].getOutOfJail("MONEY");
            players[turn].playerBorder.startMoneyAnimation(-50);

        }, 82, 35);
        this.rollJailButton = new Button([false, false], 80, 500, images.jailMenu.sprites[2], function () {
            let dice1 = randomIntFromRange(1, 6);
            let dice2 = randomIntFromRange(1, 6);
            players[turn].rolls = true;

            let self = players[turn];

            players[turn].timeInJail++;

            players[turn].animateDice(dice1, dice2, function () {
                board.animateDices = false;
                if (dice1 === dice2 || players[turn].timeInJail === 3) {
                    self.getOutOfJail("DICE")
                }
                if (dice1 === dice2) {
                    self.teleportTo(self.steps + dice1 + dice2);
                    players[turn].rolls = false;
                }
            })
        }, 82, 35);
        this.jailCardButton = new Button([false, false], 175, 500, images.jailMenu.sprites[3], function () {
            players[turn].jailcardAmount--;
            players[turn].getOutOfJail("CARD");
        }, 82, 35);
        this.rollDiceButton = new Button([false, false], 1, 480, images.buttons.sprites[0], function () { players[turn].rollDice() }, 246, 60, false, false, false, true)
        this.nextPlayerButton = new Button([false, false], 1, 480, images.buttons.sprites[1], function () {
            if (players[turn].money >= 0) {
                players[turn].rolls = false;
                players[turn].numberOfRolls = 0;
                if (Api.online) {
                    Api.changeTurn();
                } else {
                    turn = (turn + 1) % players.length;
                    board.textsize = measureText({ font: "Arcade", text: "Just nu: " + players[turn].name });
                }
            }
            board.animateDices = false;
            board.showDices = false;
        }, 246, 60)

        if (Api.online && Api.currentPlayer == 0) {
            this.rollDiceButton.visible = true;
        }

        this.currentCard = undefined;
        this.cardCloseButton = new Button([false, false], 233, 308, images.buttons.sprites[7], function () {
            board.currentCard = undefined;
        }, 18, 18, false, false, false, false, false, { x: 722, y: 236, w: 256 * drawScale, h: 324 * drawScale })
        this.sellButton = new Button([false, false], 100, 570, images.buttons.sprites[2], function () {
            if (board.currentCard.mortgaged === false) {
                players[turn].money += board.currentCard.piece.price / 2
                players[turn].totalEarned += board.currentCard.piece.price / 2
                players[turn].checkDebt(board.boardPieces[20]);
                players[turn].playerBorder.startMoneyAnimation(board.currentCard.piece.price / 2);
            } else {
                board.currentCard.mortgaged = false;
            }
            players[turn].ownedPlaces.splice(players[turn].ownedPlaces.indexOf(board.currentCard), 1);
            board.currentCard.owner = undefined;
            players[turn].hasStepped = true;
            board.currentCard = undefined;
        }, 40, 40, false, false, false, true);
        this.mortgageButton = new Button([false, false], 50, 570, images.buttons.sprites[3], function () {
            if (board.currentCard.mortgaged === true) {
                if (Api.online) {
                    Api.tilePurchased(board.currentCard, (board.currentCard.piece.price / 2) * 1.1);
                    return;
                }

                board.currentCard.mortgaged = false;
                if (board.settings.allFreeparking) {
                    board.boardPieces[20].money += (board.currentCard.piece.price / 2) * 1.1
                }
                players[turn].money -= (board.currentCard.piece.price / 2) * 1.1
                players[turn].totalLost += (board.currentCard.piece.price / 2) * 1.1
                players[turn].playerBorder.startMoneyAnimation(-(board.currentCard.piece.price / 2) * 1.1)
            } else {
                if (Api.online) {
                    Api.mortagedTile(board.currentCard);
                    return;
                }

                board.currentCard.mortgaged = true;
                players[turn].money += board.currentCard.piece.price / 2
                players[turn].totalEarned += board.currentCard.piece.price / 2
                players[turn].playerBorder.startMoneyAnimation(board.currentCard.piece.price / 2)
                players[turn].checkDebt(board.boardPieces[20]);
            }
        }, 40, 40);
        this.upgradeButton = new Button([false, false], 65, 570, images.buttons.sprites[4], function () {
            if (Api.online) {
                Api.propertyChangedLevel(board.currentCard, board.currentCard.level + 1, true);
                return;
            }
            let lowest = 5;
            let highest = 0;
            for (let i = 0; i < board.boardPieces.length; i++) {
                if (board.boardPieces[i] !== board.currentCard) {
                    if (board.boardPieces[i]?.piece?.group === board.currentCard?.piece?.group) {
                        if (lowest > board.boardPieces[i].level) { lowest = board.boardPieces[i].level }
                        if (highest < board.boardPieces[i].level) { highest = board.boardPieces[i].level }
                        if (board.currentCard.owner !== board.boardPieces[i].owner) {
                            ownAll = false;
                        }
                    }
                }
            }
            if (lowest > board.currentCard.level || !board.settings.even) { lowest = board.currentCard.level }
            if (highest < board.currentCard.level || !board.settings.even) { highest = board.currentCard.level }
            
            if(board.currentCard.level == lowest){
                board.currentCard.level++;
                board.currentCard.owner.money -= board.currentCard.piece.housePrice;
                board.currentCard.owner.totalLost += board.currentCard.piece.housePrice;
                if (board.settings.allFreeparking) {
                    board.boardPieces[20].money += board.currentCard.piece.housePrice;
                }
                players[turn].playerBorder.startMoneyAnimation(-board.currentCard.piece.housePrice)
            }else{
                for (let i = board.boardPieces.length - 1; i > 0; i--) {
                    if (board.boardPieces[i] !== board.currentCard) {
                        if (board.boardPieces[i].piece.group === board.currentCard.piece.group) {
                            if(board.boardPieces[i].level === lowest){
                                board.boardPieces[i].level++;
                                board.boardPieces[i].owner.money -= board.boardPieces[i].piece.housePrice;
                                board.boardPieces[i].owner.totalLost += board.boardPieces[i].piece.housePrice;
                                if (board.settings.allFreeparking) {
                                    board.boardPieces[20].money += board.boardPieces[i].piece.housePrice;
                                }
                                players[turn].playerBorder.startMoneyAnimation(-board.boardPieces[i].piece.housePrice)
                                return;
                            }
                        }
                    }
                }
            }
            
        }, 40, 40);
        this.downgradeButton = new Button([false, false], 15, 570, images.buttons.sprites[5], function () {
            if (Api.online) {
                Api.propertyChangedLevel(board.currentCard, board.currentCard.level - 1, false);
                return;
            }
            let lowest = 5;
            let highest = 0;
            for (let i = 0; i < board.boardPieces.length; i++) {
                if (board.boardPieces[i] !== board.currentCard) {
                    if (board.boardPieces[i]?.piece?.group === board.currentCard?.piece?.group) {
                        if (lowest > board.boardPieces[i].level) { lowest = board.boardPieces[i].level }
                        if (highest < board.boardPieces[i].level) { highest = board.boardPieces[i].level }
                        if (board.currentCard.owner !== board.boardPieces[i].owner) {
                            ownAll = false;
                        }
                    }
                }
            }
            if (lowest > board.currentCard.level || !board.settings.even) { lowest = board.currentCard.level }
            if (highest < board.currentCard.level || !board.settings.even) { highest = board.currentCard.level }

            if(board.currentCard.level === highest){
                board.currentCard.level--;
                board.currentCard.owner.money += board.currentCard.piece.housePrice / 2;
                board.currentCard.owner.totalEarned += board.currentCard.piece.housePrice / 2;
                players[turn].playerBorder.startMoneyAnimation(board.currentCard.piece.housePrice / 2)
                players[turn].checkDebt(board.boardPieces[20]);
            }else{
                for (let i = 0; i < board.boardPieces.length; i++) {
                    if (board.boardPieces[i] !== board.currentCard) {
                        if (board.boardPieces[i]?.piece?.group === board.currentCard?.piece?.group) {
                            if(board.boardPieces[i].level === highest){
                                board.boardPieces[i].level--;
                                board.boardPieces[i].owner.money += board.boardPieces[i].piece.housePrice / 2;
                                board.boardPieces[i].owner.totalEarned += board.boardPieces[i].piece.housePrice / 2;
                                players[turn].playerBorder.startMoneyAnimation(board.boardPieces[i].piece.housePrice / 2)
                                players[turn].checkDebt(board.boardPieces[20]);
                                return;
                            }
                        }
                    }
                }
            }
            
        }, 40, 40);
        this.buyButton = new Button([false, false], 15, 570, images.buttons.sprites[6], function () {
            if (Api.online) {
                Api.tilePurchased(board.currentCard);
                return;
            }
            players[turn].money -= board.currentCard.piece.price;
            players[turn].totalLost += board.currentCard.piece.price;
            if (board.settings.allFreeparking) {
                board.boardPieces[20].money += board.currentCard.piece.price;
            }
            players[turn].playerBorder.startMoneyAnimation(-board.currentCard.piece.price);
            board.currentCard.owner = players[turn];
            players[turn].ownedPlaces.push(board.currentCard);
            board.currentCard = undefined;
        }, 97, 40);

        this.auctionButton = new Button([false, false], 15 + 117, 570, images.buttons.sprites[8], function () {
            if (Api.online) {
                Api.auctionShow(board.currentCard);
                return;
            }
            board.auction = new Auction(board.currentCard)
        }, 97, 40);

        for (let n = 0; n < 40; n++) {
            if (n % 10 === 0) {
                this.boardPieces.push(new BoardPiece(n, images.corner.sprites))
            } else {
                this.boardPieces.push(new BoardPiece(n, images.part.sprites))
            }
        }

        this.update = async function () {
            this.numberOfHotels = 0;
            this.numberOfHouses = 0;
            board.boardPieces.forEach(e => {
                if(e.level < 5 && e.level > 0){
                    this.numberOfHouses += e.level;
                }else if(e.level == 5){
                    this.numberOfHotels++;
                }
            })
            
            if(players[turn].dead){
                turn = (turn + 1) % players.length;
                return;
            }
            if(players.filter(e => {{return e.dead === false}}).length === 1){
               let tmp = async function(){
                board.getToMainMenuButton.selected = false;
                setTimeout(() => {
                    let tmp2 = saveGame()
                    players.forEach(e => buttons.splice(buttons.indexOf(e.playerBorder.button), 1))
                    players = [];
                    menus[4].current = true;
                    menus[0].volume.percentage = musicVolume
                    if (Api.online) Api.disconnect();
                    timeouts.forEach(e => clearTimeout(e));
                    intervals.forEach(e => clearInterval(e));
                    timeouts = [];
                    board = undefined;
                    buttons = [];
                    menus = [];
    
                    init();
                    setTimeout(() => {
                        menus[4].current = true;
                        menus[4].game = tmp2;
                    },100)

                }, 100);
               } 
               await tmp();
            }
            
            
            let fontsize = (1 / this.textsize.width) * 50000 > 50 ? 50 : (1 / this.textsize.width) * 50000
            c.fillStyle = "white";
            c.font = fontsize / 2 + "px Arcade";
            c.textAlign = "center";
            c.fillText("Just nu: " + players[turn].name, canvas.width / 2, 50 / 2);


            this.boardPieces.forEach(g => g.update())


            if (players.length > 1) {

                this.showDice()
                this.rollDiceButton.draw();
                this.nextPlayerButton.draw();
                this.boardPieces.forEach(g => g.drawHouses())

                for (let i = 20; i >= 0; i--) {
                    if (this.boardPieces[i].side == 0 || this.boardPieces[i].side === 3) {
                        this.boardPieces[i].currentPlayer.forEach(p => p.update())
                    } else {
                        for (let g = (this.boardPieces[i].currentPlayer.length - 1); g > -1; g--) {
                            this.boardPieces[i].currentPlayer[g].update()
                        }
                    }
                    if (i === 10) {
                        this.prisonExtra.currentPlayer.forEach(p => p.update())
                    }
                }
                for (let i = 20; i < 40; i++) {
                    if (this.boardPieces[i].side == 0 || this.boardPieces[i].side === 3) {
                        this.boardPieces[i].currentPlayer.forEach(p => p.update())
                    } else {
                        for (let g = (this.boardPieces[i].currentPlayer.length - 1); g > -1; g--) {
                            this.boardPieces[i].currentPlayer[g].update()
                        }
                    }
                }


                this.showCard();
                if (this.auction !== undefined) {
                    this.auction.update();
                }

                if (players[turn].inJail === true && players[turn].bot === undefined && this.auction === undefined && players[turn].rolls === false && players[turn].animationOffset === 0 && this.showDices === false && this.animateDices === false) {
                    this.showJailmenu();
                }
            }
            players.forEach(e => e.playerBorder.drawButton())

            for (let i = players.length - 1; i > -1; i--) {
                if (players[i].playerBorder.index !== 2 && players[i].playerBorder.index !== 3) {
                    players[i].playerBorder.draw()
                }
            }
            for (let i = players.length - 1; i > -1; i--) {
                if (players[i].playerBorder.index == 2 || players[i].playerBorder.index == 3) {
                    players[i].playerBorder.draw()
                }
            }
            if (this.trade !== undefined) {
                this.trade.update();
            }
            if(this.auction == undefined && this.trade == undefined && this.currentCard == undefined && players[turn].animationOffset === 0 && this.showDices === false && this.animateDices === false && !this.getToMainMenuButton.selected){
                this.getToMainMenuButton.visible = true;
            }
            this.getToMainMenuButton.draw();
            if (this.getToMainMenuButton.selected) {
                this.confirmMenu();
            }
            if (this.currentShowingCard !== undefined) {
                this.currentShowingCard.draw();
            }
        }

        this.confirmMenu = function () {
            drawRotatedImageFromSpriteSheet(704, 336, 512, 512, images.exitMenu.sprites[0], 0, false, 0, 0, 256, 256)
            this.musicButton.selected = musicVolume === 0 ? true : false;

            this.goToMainMenuButton.visible = true;
            this.goToMainMenuButton.draw();
            this.escapeConfirm.visible = true;
            this.escapeConfirm.draw();
            this.statButton.visible = true;
            this.statButton.draw();
            this.volume.visible = true;
            this.volume.draw();
            this.musicButton.visible = true;
            this.fullScreenButton.visible = true;
            this.fullScreenButton.selected = document.fullscreenElement != null;
            this.musicButton.draw();
            this.imageSmoothingButton.visible = true;
            this.imageSmoothingButton.draw();
            this.imageSmoothingButton.selected = renderC.imageSmoothingEnabled;
            this.fullScreenButton.draw();


        }
        this.randomizeDice = function () {
            this.dice1Type = randomIntFromRange(0, 3);
            this.dice2Type = randomIntFromRange(0, 3);
        }
        this.showCard = function () {
            if (this.currentCard !== undefined) {
                drawRotatedImageFromSpriteSheet(canvas.width - images.card.sprites[this.currentCard.piece.card].frame.w, canvas.height - images.card.sprites[this.currentCard.piece.card].frame.h, images.card.sprites[this.currentCard.piece.card].frame.w * drawScale, images.card.sprites[this.currentCard.piece.card].frame.h * drawScale, images.card.sprites[this.currentCard.piece.card], 0, false, 0, 0, images.card.sprites[this.currentCard.piece.card].frame.w, images.card.sprites[this.currentCard.piece.card].frame.h)

                c.fillStyle = "black";
                c.textAlign = "center";
                c.font = 20 / 2 + "px Arcade";

                if (this.currentCard.owner !== undefined) {
                    if (this.currentCard.piece.type !== "utility" && this.currentCard.piece.type !== "station") {
                        c.fillText("Ägare: " + this.currentCard.owner.name, 965 / 2, 348 / 2)
                    } else {
                        c.fillText("Ägare: " + this.currentCard.owner.name, 965 / 2, 395 / 2)
                    }

                    if (players[Api.online ? Api.currentPlayer : turn].bot === undefined) this.cardCloseButton.visible = true;
                    if (this.currentCard.owner === players[Api.online ? Api.currentPlayer : turn] && players[Api.online ? Api.currentPlayer : turn].bot === undefined) {
                        this.sellButton.disabled = !this.settings.sellable
                        if (this.currentCard.level > 0) {
                            this.sellButton.disabled = true;
                        }
                        this.sellButton.visible = true;
                        this.mortgageButton.visible = true;
                        if (this.currentCard.piece.type === "utility" || this.currentCard.piece.type === "station") {
                            this.sellButton.x = 140;
                            this.mortgageButton.x = 50;
                        } else {
                            this.sellButton.x = 190;
                            this.mortgageButton.x = 140;
                            this.upgradeButton.visible = true;
                            this.downgradeButton.visible = true;
                        }

                        let ownAll = true;
                        let highest = 0;
                        let lowest = 5;
                        for (let i = 0; i < board.boardPieces.length; i++) {
                            if (board.boardPieces[i] !== this.currentCard) {
                                if (board.boardPieces[i].piece.group === this.currentCard.piece.group) {
                                    if (highest < board.boardPieces[i].level) { highest = board.boardPieces[i].level }
                                    if (lowest > board.boardPieces[i].level) { lowest = board.boardPieces[i].level }
                                    if (this.currentCard.owner !== board.boardPieces[i].owner) {
                                        ownAll = false;
                                    }
                                }
                            }
                        }
                        if (highest < this.currentCard.level || !this.settings.even) { highest = this.currentCard.level }
                        if (lowest > board.currentCard.level || !board.settings.even) { lowest = board.currentCard.level }

                        if (lowest < 5 && this.currentCard.piece.housePrice !== undefined && ownAll === true && players[turn].money >= this.currentCard.piece.housePrice) {
                            if(this.currentCard.level == lowest){
                                if(this.currentCard.level == 4 && this.numberOfHotels < 12){
                                    this.upgradeButton.disabled = false;
                                }else if(this.currentCard.level < 4 && this.numberOfHouses < 32){
                                    this.upgradeButton.disabled = false;
                                }else{
                                    this.upgradeButton.disabled = true;
                                }
                            }else{
                                for (let i = board.boardPieces.length - 1; i > 0; i--) {
                                    if (board.boardPieces[i] !== board.currentCard) {
                                        if (board.boardPieces[i].piece.group === board.currentCard.piece.group) {
                                            if(board.boardPieces[i].level === lowest){
                                                if(board.boardPieces[i].level == 4 && this.numberOfHotels < 12){
                                                    this.upgradeButton.disabled = false;
                                                }else if(board.boardPieces[i].level < 4 && this.numberOfHouses < 32){
                                                    this.upgradeButton.disabled = false;
                                                }else{
                                                    this.upgradeButton.disabled = true;
                                                }                                          
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            this.upgradeButton.disabled = true;
                        }
                        if (highest > 0) {
                            this.downgradeButton.disabled = false;
                        } else {
                            this.downgradeButton.disabled = true;
                        }
                        if (this.currentCard.mortgaged === true && players[turn].money <= ((this.currentCard.piece.price / 2) * 1.1) || highest > 0 || !this.settings.mortgage) {
                            this.mortgageButton.disabled = true;
                        } else {
                            this.mortgageButton.disabled = false;
                        }


                    }
                    this.cardCloseButton.visible = true;


                } else {
                    this.cardCloseButton.visible = true;
                    if (this.currentCard === board.boardPieces[players[Api.online ? Api.currentPlayer : turn].steps] && this.auction === undefined && players[Api.online ? Api.currentPlayer : turn].bot === undefined && players[turn].hasStepped === false) {
                        if (board.settings.auctions) {
                            this.auctionButton.disabled = false;
                            if (players.filter(e => e.money - this.currentCard.piece.price * this.settings.auctionstartprice >= 0).length < 2) {
                                this.auctionButton.disabled = true;
                                this.cardCloseButton.visible = true;
                                this.cardCloseButton.draw();
                            }

                        } else {
                            this.auctionButton.disabled = true;
                            this.cardCloseButton.visible = true;
                        }
                        this.buyButton.visible = true;
                        this.auctionButton.visible = true;

                        if (players[turn].money >= this.currentCard.piece.price) {
                            this.buyButton.disabled = false;
                        } else {
                            this.buyButton.disabled = true;
                        }


                    }

                }
                if (this.currentCard.mortgaged === true) {
                    drawRotatedImageFromSpriteSheet(702, 216, images.mortgageOverlay.sprites[0].frame.w * drawScale, images.mortgageOverlay.sprites[0].frame.h * drawScale, images.mortgageOverlay.sprites[0], 0, false, 0, 0, images.mortgageOverlay.sprites[0].frame.w, images.mortgageOverlay.sprites[0].frame.h)
                }
            }
            this.sellButton.draw();
            this.auctionButton.draw();
            this.buyButton.draw();
            this.upgradeButton.draw()
            this.downgradeButton.draw();
            this.mortgageButton.draw();
            this.cardCloseButton.draw();


        }
        this.showJailmenu = function () {
            drawIsometricImage(0, 0, images.jailMenu.sprites[0], false, 0, 0, 300, 90, -89, 200)

            this.payJailButton.visible = true;
            this.payJailButton.draw();
            this.rollJailButton.visible = true;
            this.rollJailButton.draw();
            this.jailCardButton.visible = true;
            this.jailCardButton.draw();
            if (players[turn].money >= 50) {
                this.payJailButton.disabled = false;
            } else {
                this.payJailButton.disabled = true;
            }
            if (players[turn].jailcardAmount >= 1) {
                this.jailCardButton.disabled = false;
            } else {
                this.jailCardButton.disabled = true;
            }
        }

        this.showDice = function () {
            if (players[turn].animationOffset !== 0 || this.showDices === true || this.animateDices === true) {
                drawIsometricImage(500, 500, images.dice.sprites[0], false, this.dice1Type * 64, (this.dice1 - 1) * 64, 64, 64, 0, 0)
                drawIsometricImage(550, 400, images.dice.sprites[0], false, this.dice2Type * 64, (this.dice2 - 1) * 64, 64, 64, 0, 0)
            } else {
                if (Api.online) {
                    if (players[turn].colorIndex != Api.currentPlayer) {
                        return;
                    }
                }

                if (players[turn].rolls === false) {
                    if (players[turn].bot === undefined && this.auction === undefined && players[turn].inJail === false && !this.getToMainMenuButton.selected && this.currentShowingCard === undefined) {
                        this.rollDiceButton.visible = true;
                    }
                } else {
                    if (players[turn].bot === undefined && this.auction === undefined && !this.getToMainMenuButton.selected && this.currentShowingCard === undefined) {
                        this.nextPlayerButton.visible = true;
                    }
                }

            }
        }
    }
}
class Slider {
    constructor(x, y, w, h, from, to, steps, showtext, font, unit, beginningText, onChange, onrelease) {
        this.x = x / 2;
        this.y = y / 2;
        this.w = w / 2;
        this.h = h / 2;
        this.visible = false;
        this.disabled = false;
        this.min = from;
        this.max = to;
        this.percentage = 0;
        this.value = 0;
        this.follow = false;
        this.showtext = showtext;
        this.font = font / 2;
        this.unit = unit;
        this.steps = steps;
        this.beginningText = beginningText;
        this.from = from;
        this.to = to;
        this.last = this.value;
        if (onChange === undefined) {
            this.onChange = function () { }
        } else {
            this.onChange = onChange;
        }
        if (onrelease === undefined) {
            this.onrelease = function () { }
        } else {
            this.onrelease = onrelease;
        }
        buttons.push(this);
        this.draw = function () {
            if (this.disabled) this.hover = false;
            if (!this.visible) return;

            if (this.visible) {
                this.value = Math.round((((this.to - this.from) * this.percentage) + this.from) / this.steps) * this.steps;

                if (this.value !== this.last) {
                    this.last = this.value;
                    playSound(sounds.clicks, 0.1, false)
                    this.onChange();
                }
                if (this.value > this.to) {
                    this.value = this.to;
                }
                if (this.value < this.from) {
                    this.value = this.from;
                }
                c.fillStyle = "black";
                c.fillRect(this.x, this.y, this.w, this.h)
                c.fillStyle = "white";
                c.fillRect(this.x + 4, this.y + 4, this.w - 8, this.h - 8)
                c.fillStyle = "black";
                if (this.showtext) {
                    c.font = this.font + "px Arcade";
                    c.textAlign = "center";
                    c.fillText(this.beginningText + this.value + this.unit, this.x + + this.w / 2, this.y + this.h / 1.5)
                }
                c.fillRect(this.x + (this.percentage * (this.w - Math.min(8, this.w / 12.5))), this.y, Math.min(5, this.w / 25), this.h)
            }
            if (detectCollition(this.x, this.y, this.w, this.h, mouse.x, mouse.y, 1, 1)) {
                this.hover = true;
            } else {
                this.hover = false;
            }
            if (this.follow === true) {
                this.percentage = Math.max(Math.min((mouse.x - (this.x)) / (this.w - 4), 1), 0);
            }
            if (this.percentage <= 0) {
                this.percentage = 0;
            }
            if (this.percentage >= 1) {
                this.percentage = 1;
            }
        }
        this.click = function () {
            if (this.disabled) return;

            if (this.hover === true) {
                this.follow = true;
            }
        }
        this.release = function () {
            if (this.disabled) return;
            if (this.follow === true) {
                this.percentage = Math.max(Math.min((mouse.x - (this.x)) / (this.w - 4), 1), 0);
                this.value = Math.round((((this.to - this.from) * this.percentage) + this.from) / this.steps) * this.steps;
                this.onrelease();
            }
            if (Api.online && board.trade != undefined) {
                // Update money
                board.trade.contents.p1.money = this.value;
                Api.tradeContentUpdated(board.trade.p2.colorIndex, board.trade.contents.p1);
            }

            this.follow = false;
        }
    }
}

class Trade {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        let textsize1 = measureText({ font: "Arcade", text: this.p1.name + "   " + this.p2.money })
        let textsize2 = measureText({ font: "Arcade", text: this.p2.name + "   " + this.p2.money })

        timeouts.push(setTimeout(() => {
            players.forEach(e => { e.playerBorder.button.selected = false; e.playerBorder.button.disabled = true })
        }, 1));

        this.contents = {
            // This is what each player offers
            // Currently only used in the online version
            p1: { money: 0, tiles: [] },
            p2: { money: 0, tiles: [] }
        };

        let self = this;
        this.closeButton = new Button([false, false], 364 + 128 + 63, 290 - 65, images.buttons.sprites[7], function () { if (Api.online) { Api.tradeConcluded(self.p2.colorIndex, false); }board.trade = undefined;players.forEach(e => { e.playerBorder.button.disabled = false }) }, 18, 18, false,
            false, false, false, false, { x: 66, y: 70, w: 1025 + 512 + 280, h: 1020 })
        this.closeButton.visible = true;

        this.p1Slider = new Slider(300 - 142, 200, 742, 60, 0, this.p1.money, 10, true, 30, "kr", "", function () {
            self.p1ConfirmButton.selected = false;
            self.p2ConfirmButton.selected = false;
        })
        this.p1ConfirmButton = new Button([true, false], -70 - 64 - 35, 660, images.trade.sprites[1], function () {
            if (Api.online && self.p1.colorIndex == Api.currentPlayer) {
                if (self.p2ConfirmButton.selected) {
                    Api.tradeConcluded(self.p2.colorIndex, true, self.contents);
                } else {
                    Api.tradeAcceptUpdate(self.p2.colorIndex, self.p1ConfirmButton.selected);
                }
            }
        }, 150, 50)
        if (this.p1.bot !== undefined) {
            this.p1ConfirmButton.disabled = true;
        }
        this.p1ConfirmButton.visible = true;

        if (Api.online && this.p1.colorIndex != Api.currentPlayer) {
            this.p2ConfirmButton.disabled = true;
            this.p1Slider.disabled = true;
        }

        this.p2ConfirmButton = new Button([true, false], 180 + 64 + 35, 660, images.trade.sprites[1], function () { }, 150, 50)
        this.p2Slider = new Slider(1050, 200, 742, 60, 0, this.p2.money, 10, true, 30, "kr", "", function () {
            self.p1ConfirmButton.selected = false;
            self.p2ConfirmButton.selected = false;
        })
        if (this.p2.bot !== undefined) {
            this.p2ConfirmButton.disabled = true;
        }
        this.p2ConfirmButton.visible = true;

        if (Api.online && this.p2.colorIndex != Api.currentPlayer) {
            this.p2ConfirmButton.disabled = true;
            this.p2Slider.disabled = true;
        }

        this.p1PropertyButtons = [];
        this.p2PropertyButtons = [];

        this.p1.ownedPlaces.forEach(function (e, i) {
            let tmp = 0;
            if (i % 2 === 1) {
                tmp = 190
            }
            let textColor = e.piece.color;
            let text = e.piece.name + " " + e.piece.price + "kr"
            let fontSize = 21
            if (e.mortgaged) {
                textColor = "black"
                text = e.piece.name + "(Intecknad)"
                if (e.piece.name === "Vattenledningsverket") {
                    fontSize = 18;
                }
            }
            let but = (new Button([true, false], -360 + tmp + 198 - 128, 240 + 22 * Math.floor(i / 2) + 110, images.trade.sprites[2], function () {
                if (Api.online) {
                    if (this.selected) {
                        self.contents.p1.tiles.push(e.piece);
                    } else {
                        self.contents.p1.tiles.splice(self.contents.p1.tiles.findIndex(x => x.card == e.piece.card), 1);
                    }
                    Api.tradeContentUpdated(self.p2.colorIndex, self.contents.p1);
                }
                self.p1ConfirmButton.selected = false;
                self.p2ConfirmButton.selected = false;
            }, 186, 21, false, false, false, false, false, false, text, fontSize, textColor, "ArcadeBold"))

            if (e.level !== 0) {
                but.disabled = true;
            }

            but.card = e.piece.card;
            self.p1PropertyButtons.push(but);
        });

        this.p2.ownedPlaces.forEach(function (e, i) {
            let tmp = 0;
            if (i % 2 === 1) {
                tmp = 190
            }
            let textColor = e.piece.color;
            let text = e.piece.name + " " + e.piece.price + "kr"
            let fontSize = 21;
            if (e.mortgaged) {
                textColor = "black"
                text = e.piece.name + "(Intecknad)"
                if (e.piece.name === "Vattenledningsverket") {
                    fontSize = 18;
                }
            }
            let but = (new Button([true, false], -30 + tmp + 200, 240 + 22 * Math.floor(i / 2) + 110, images.trade.sprites[2], function () {
                self.p1ConfirmButton.selected = false;
                self.p2ConfirmButton.selected = false;
            }, 186, 21, false, false, false, false, false, false, text, fontSize, textColor, "ArcadeBold"))

            if ((Api.online && self.p2.colorIndex != Api.currentPlayer)) {
                but.disabled = true;
            }
            if (e.level !== 0) {
                but.disabled = true;
            }

            but.card = e.piece.card;
            self.p2PropertyButtons.push(but);
        });

        this.update = function () {
            drawIsometricImage(0, 0, images.trade.sprites[0], false, 0, 0, images.trade.sprites[0].frame.w, images.trade.sprites[0].frame.h, -320 - 71, images.trade.sprites[0].frame.h / 50 - 50, 1)


            this.p1Slider.visible = true;
            this.p2Slider.visible = true;
            c.fillStyle = "black"
            c.textAlign = "right"
            let fontsize1 = (1 / textsize1.width) * 40000 > 25 ? 25 : (1 / textsize1.width) * 40000
            c.font = fontsize1 + "px Arcade";
            c.fillText(this.p1.money + "kr" + "   " + this.p1.name, 870 / 2, 160 / 2)
            c.textAlign = "left"
            let fontsize2 = (1 / textsize2.width) * 40000 > 25 ? 25 : (1 / textsize2.width) * 40000
            c.font = fontsize2 + "px Arcade";
            c.fillText(this.p2.name + "   " + this.p2.money + "kr", 1070 / 2, 160 / 2)
            this.p1PropertyButtons.forEach(e => { e.visible = true; e.draw() });
            this.p2PropertyButtons.forEach(e => { e.visible = true; e.draw() });
            this.p1ConfirmButton.visible = true;
            this.p2ConfirmButton.visible = true;

            if (this.p1ConfirmButton.selected && this.p2ConfirmButton.selected && !Api.online) {
                let p1New = [];
                let p2New = [];
                this.p1PropertyButtons.forEach(function (e, i) {
                    if (e.selected === true) {
                        p2New.push(self.p1.ownedPlaces[i])
                    }
                })
                this.p2PropertyButtons.forEach(function (e, i) {
                    if (e.selected === true) {
                        p1New.push(self.p2.ownedPlaces[i])
                    }
                })
                p1New.forEach(e => {
                    self.p2.ownedPlaces.splice(self.p2.ownedPlaces.indexOf(e), 1);
                    self.p1.ownedPlaces.push(e);
                    e.owner = self.p1;
                })
                p2New.forEach(e => {
                    self.p1.ownedPlaces.splice(self.p1.ownedPlaces.indexOf(e), 1);
                    self.p2.ownedPlaces.push(e);
                    e.owner = self.p2;
                })
                this.p1.money += this.p2Slider.value;
                this.p2.money += this.p1Slider.value;
                this.p1.money -= this.p1Slider.value;
                this.p2.money -= this.p2Slider.value;
                this.p1.totalEarned += this.p2Slider.value;
                this.p2.totalEarned += this.p1Slider.value;
                this.p1.totalLost += this.p1Slider.value;
                this.p2.totalLost += this.p2Slider.value;
                players.forEach(e => { e.playerBorder.button.selected = false; e.playerBorder.button.disabled = false })
                board.trade = undefined;
            }
            this.closeButton.visible = true;
            this.p1Slider.draw();
            this.p2Slider.draw();
            this.closeButton.draw();
            this.p1ConfirmButton.draw();
            this.p2ConfirmButton.draw();
        }
    }
}

class PlayerBorder {
    constructor(player) {
        this.player = player;
        this.index = players.length;
        this.x = 0;
        this.y = 0;
        this.realIndex = this.index
        this.showInfo = false;
        this.latestTrancaction;
        this.moneyTime = 0;

        let self = this;
        let textsize = measureText({ font: "Arcade", text: this.player.name })


        this.button = new Button([true, false], this.x, this.y, images.playerOverlay.sprites[8], function () {
            players.forEach(e => { if (e.playerBorder != self) { e.playerBorder.button.selected = false;} })
            if (Api.online) {
                if (Api.currentPlayer == players[turn].colorIndex && Api.currentPlayer != self.player.colorIndex){
                    self.createTradebutton.visible = true;
                }
            }
            players.forEach(e => e.playerBorder.button.disabled = false)

        }, 354, 54, false, false, false, true, false, { x: 0, y: 0, w: 249, h: 54, onlySelected: true })

        this.createTradebutton = new Button([false, false], this.x, this.y, images.buttons.sprites[9], function () {
            self.showInfo = false;
            if (Api.online && board.trade == undefined) {
                Api.requestTrade(self.player.colorIndex);
            }
            board.trade = new Trade(players[turn], self.player);
        }, 219, 34, false, false, true)


        this.startMoneyAnimation = function (money, disablesound) {
            this.moneyTime = 1;
            this.latestTrancaction = money;
            if (!disablesound) {
                playSound(sounds.cash, 1)
            }
        }
        this.moneyAnimation = function () {
            if (this.latestTrancaction < 0) {
                c.fillStyle = "red";
            } else {
                c.fillStyle = "green";
            }

            if (this.button.mirror === false) {
                c.globalAlpha = this.moneyTime;
                c.textAlign = "right"
                c.font = (50) / 2 + "px Arcade";
                c.fillText(Math.abs(Math.floor(this.latestTrancaction)) + "kr", this.x + 1350 / 2, this.y - 335 / 2 - (-this.moneyTime + 1) * 20)
                c.globalAlpha = 1;
            } else {
                c.globalAlpha = this.moneyTime;
                c.textAlign = "right"
                c.font = (50) / 2 + "px Arcade";
                c.fillText(Math.abs(Math.floor(this.latestTrancaction)) + "kr", this.x / 2 + 1030 / 2, this.y - 335 / 2 - (-this.moneyTime + 1) * 20)
                c.globalAlpha = 1;
            }
        }

        this.init = function () {
            // What does this function even do?
            if (players.length === 5) {
                if (this.realIndex === 4) {
                    this.index = 3;
                } else if (this.realIndex === 2) {
                    this.index = 4;
                } else if (this.realIndex === 3) {
                    this.index = 2;
                }
            } else if (players.length == 6) {
                if (this.realIndex === 4) {
                    this.index = 2;
                } else if (this.realIndex === 2) {
                    this.index = 4;
                } else if (this.realIndex === 3) {
                    this.index = 6;
                } else if (this.realIndex === 5) {
                    this.index = 3;
                }
            } else if (players.length == 7) {
                if (this.realIndex === 4) {
                    this.index = 5;
                } else if (this.realIndex === 2) {
                    this.index = 4;
                } else if (this.realIndex === 3) {
                    this.index = 6;
                } else if (this.realIndex === 5) {
                    this.index = 3;
                } else if (this.realIndex === 6) {
                    this.index = 2;
                }
            } else if (players.length == 8) {
                if (this.realIndex === 4) {
                    this.index = 5;
                } else if (this.realIndex === 2) {
                    this.index = 4;
                } else if (this.realIndex === 3) {
                    this.index = 6;
                } else if (this.realIndex === 5) {
                    this.index = 7;
                } else if (this.realIndex === 6) {
                    this.index = 2;
                } else if (this.realIndex === 7) {
                    this.index = 3;
                }
            }
        }
        this.drawButton = function () {
            this.button.visible = true;
            this.button.draw()
            if (this.button.mirror === false) {
                drawRotatedImageFromSpriteSheet(this.x * drawScale + 466 + 694 + 209, this.y * drawScale + 5 - 400, 48, 96, images.player.sprites[this.player.colorIndex], 0, false, 0, 0, 24, 48, false)
                let fontsize = (1 / textsize.width) * 40000 > 50 ? 50 : (1 / textsize.width) * 40000
                c.font = fontsize / 2 + "px Arcade";
                c.fillStyle = "black"
                c.textAlign = "left"
                c.fillText(this.player.name, this.x + 750 / 2, this.y - 335 / 2)
                c.textAlign = "right"
                c.font = (50) / 2 + "px Arcade";
                if (this.moneyTime <= 0) {
                    c.fillText(this.player.money + "kr", this.x + 1350 / 2, this.y - 335 / 2)
                }
            } else {
                drawRotatedImageFromSpriteSheet(this.x * drawScale + 723, this.y * drawScale - 396, 48, 96, images.player.sprites[this.player.colorIndex], 0, false, 0, 0, 24, 48, false)
                let fontsize = (1 / textsize.width) * 40000 > 50 ? 50 : (1 / textsize.width) * 40000
                c.font = fontsize / 2 + "px Arcade";

                c.fillStyle = "black"
                c.textAlign = "left"
                c.fillText(this.player.name, this.x / 2 + 420 / 2, this.y - 335 / 2)
                c.textAlign = "right"
                c.font = (50) / 2 + "px Arcade";
                if (this.moneyTime <= 0) {
                    c.fillText(this.player.money + "kr", this.x / 2 + 1030 / 2, this.y - 335 / 2)
                }

            }
        }

        this.draw = function () {
            this.moneyTime -= speeds.moneyAnimationSpeed;

            if (this.index === 0) {
                this.x = -358
                this.y = 200;
                this.button.mirror = true;
            }
            if (this.index === 1) {
                this.x = 374 - 124
                this.y = 200;
                this.button.mirror = false;
            }
            if (this.index === 2) {
                this.x = -358
                this.y = 700 - 14;
                this.button.mirror = true;
            }
            if (this.index === 3) {
                this.x = 374 - 124
                this.y = 700 - 14;
                this.button.mirror = false;
            }
            if (this.index === 4) {
                this.x = -358
                this.y = 200 + 54;
                this.button.mirror = true;
            }
            if (this.index === 5) {
                this.x = 374 - 124
                this.y = 200 + 54;
                this.button.mirror = false;
            }
            if (this.index === 6) {
                this.x = -358
                this.y = 700 - 54 - 14;
                this.button.mirror = true;
            }
            if (this.index === 7) {
                this.x = 374 - 124
                this.y = 700 - 54 - 14;
                this.button.mirror = false;
            }
            this.button.y = this.y
            this.button.x = this.x





            let mirrorAdder = -10;
            if (!this.button.mirror) {
                mirrorAdder = 300;
            }
            let mirrorAdder2 = 0;
            if (!this.button.mirror) {
                mirrorAdder2 = 0;
            }
            this.createTradebutton.x = this.x + 60


            if (this.button.selected) {
                players.forEach(e => e.playerBorder.button.disabled = true)
                this.button.disabled = false;
                if (this.index === 0 || this.index === 1 || this.index === 4 || this.index === 5) {
                    this.button.invertedHitbox.x = this.x * drawScale + 715
                    this.button.invertedHitbox.y = this.y * drawScale - 400 + 54 * drawScale;
                    this.button.invertedHitbox.w = this.button.w * drawScale
                    this.button.invertedHitbox.h = this.player.ownedPlaces.length * 12 * drawScale + 12 * 5 * drawScale;
                    this.createTradebutton.y = this.y + 73 + 12 * this.player.ownedPlaces.length;
                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715 + mirrorAdder2, this.y * drawScale + 54 * drawScale - 400, 354 * drawScale, 27 * drawScale, images.playerOverlay.sprites[11], 0, this.button.mirror, 0, 0, 354, 27, false)
                    for (let i = 0; i < this.player.ownedPlaces.length; i++) {
                        drawRotatedImageFromSpriteSheet(this.x * drawScale + 715 + mirrorAdder2, this.y * drawScale + 67 * drawScale + 12 * drawScale * i + 27 - 400, 354 * drawScale, 15 * drawScale, images.playerOverlay.sprites[10], 0, this.button.mirror, 0, 0, 354, 15, false)
                        c.font = 24 / 2 + "px Arcade";
                        c.fillStyle = "black"
                        c.textAlign = "left"
                        if (this.player.ownedPlaces[i].piece.type !== "station" && this.player.ownedPlaces[i].piece.type !== "utility") {
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + this.player.ownedPlaces[i].piece.rent[this.player.ownedPlaces[i].level] + "kr", this.x / 2 + 400 / 2 + mirrorAdder, this.y + 65 + 12 * i - 364 / 2)
                        } else if (this.player.ownedPlaces[i].piece.type === "station") {
                            let tmp = -1;
                            this.player.ownedPlaces.forEach(e => {
                                if (e.piece.type === "station") {
                                    tmp++;
                                }
                            })

                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + 25 * Math.pow(2, tmp) + "kr", this.x / 2 + 400 / 2 + mirrorAdder, this.y + 65 + 12 * i - 364 / 2)
                        } else {
                            let tmp = 0;
                            let multiply = 0;
                            this.player.ownedPlaces.forEach(e => {
                                if (e.piece.type === "utility") {
                                    tmp++;
                                }
                            })
                            if (tmp === 1) { multiply = 4; }
                            if (tmp === 2) { multiply = 10 }
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + multiply + "*slag kr", this.x / 2 + 400 / 2 + mirrorAdder, this.y + 65 + 12 * i - 364 / 2)
                        }
                    }
                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715 + mirrorAdder2, this.y * drawScale + 80 * drawScale + 12 * drawScale * this.player.ownedPlaces.length - 400, 354 * drawScale, 13 * drawScale, images.playerOverlay.sprites[10], 0, this.button.mirror, 0, 0, 354, 13, false)
                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715 + mirrorAdder2, this.y * drawScale + 80 * drawScale + 12 * drawScale * (this.player.ownedPlaces.length + 1) - 400, 354 * drawScale, 13 * drawScale, images.playerOverlay.sprites[10], 0, this.button.mirror, 0, 0, 354, 13, false)
                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715 + mirrorAdder2, this.y * drawScale + 80 * drawScale + 12 * drawScale * (this.player.ownedPlaces.length + 2) - 400, 354 * drawScale, 20 * drawScale, images.playerOverlay.sprites[9], 0, this.button.mirror, 0, 0, 354, 27, false)
                    if (!Api.online) {
                        if (players[turn] !== this.player && board.currentCard === undefined && board.trade === undefined && players[turn].bot === undefined && players[turn].animationOffset === 0 && board.animateDices === false && board.showDices === false) {
                            this.createTradebutton.visible = true;
                        }
                    }

                    this.createTradebutton.draw();
                } else {
                    this.button.invertedHitbox.x = this.x * drawScale + 715
                    this.button.invertedHitbox.y = this.y * drawScale - 400 - this.player.ownedPlaces.length * 12 * drawScale - 12 * 5 * drawScale;
                    this.button.invertedHitbox.w = this.button.w * drawScale
                    this.button.invertedHitbox.h = this.player.ownedPlaces.length * 12 * drawScale + 12 * 5 * drawScale;
                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715 + mirrorAdder2, this.y * drawScale - 27 * drawScale - 400, 354 * drawScale, 27 * drawScale, images.playerOverlay.sprites[11], 180, !this.button.mirror, 0, 0, 354, 27, false)
                    for (let i = 0; i < this.player.ownedPlaces.length; i++) {
                        drawRotatedImageFromSpriteSheet(this.x * drawScale + 715 + mirrorAdder2, this.y * drawScale - 57 * drawScale - 12 * drawScale * i + 27 + 10 - 400, 354 * drawScale, 13 * drawScale, images.playerOverlay.sprites[10], 180, !this.button.mirror, 0, 0, 354, 13, false)
                        c.font = 24 / 2 + "px Arcade";
                        c.fillStyle = "black"
                        c.textAlign = "left"
                        if (this.player.ownedPlaces[i].piece.type !== "station" && this.player.ownedPlaces[i].piece.type !== "utility") {
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + this.player.ownedPlaces[i].piece.rent[this.player.ownedPlaces[i].level] + "kr", this.x / 2 + 400 / 2 + mirrorAdder, this.y + 110 - 12 * i - 634 / 2)
                        } else if (this.player.ownedPlaces[i].piece.type === "station") {
                            let tmp = -1;
                            this.player.ownedPlaces.forEach(e => {
                                if (e.piece.type === "station") {
                                    tmp++;
                                }
                            })

                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + 25 * Math.pow(2, tmp) + "kr", this.x / 2 + 400 / 2 + mirrorAdder, this.y + 110 - 12 * i - 634 / 2)
                        } else {
                            let tmp = 0;
                            let multiply = 0;
                            this.player.ownedPlaces.forEach(e => {
                                if (e.piece.type === "utility") {
                                    tmp++;
                                }
                            })
                            if (tmp === 1) { multiply = 4; }
                            if (tmp === 2) { multiply = 10 }
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + multiply + "*slag kr", this.x / 2 + 400 / 2 + mirrorAdder, this.y + 110 - 12 * i - 634 / 2)
                        }
                    }
                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 25 * drawScale * 1.5 - 12 * drawScale * this.player.ownedPlaces.length - 400, 354 * drawScale, 13 * drawScale, images.playerOverlay.sprites[10], 0, this.button.mirror, 0, 0, 354, 13, false)
                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 25 * drawScale * 1.5 - 12 * drawScale * (this.player.ownedPlaces.length + 1) - 400, 354 * drawScale, 13 * drawScale, images.playerOverlay.sprites[10], 0, this.button.mirror, 0, 0, 354, 13, false)
                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 25 * drawScale * 1.5 - 12 * drawScale * (this.player.ownedPlaces.length + 3) - 400, 354 * drawScale, 27 * drawScale, images.playerOverlay.sprites[9], 180, !this.button.mirror, 0, 0, 354, 27, false)
                    this.createTradebutton.y = this.y - 50 - 12 * this.player.ownedPlaces.length;
                    if (players[turn] !== this.player && board.currentCard === undefined && board.trade === undefined && players[turn].bot === undefined && players[turn].animationOffset === 0 && board.animateDices === false && board.showDices === false) {
                        this.createTradebutton.visible = true;
                    }
                    this.createTradebutton.draw();
                }
            }
            if (this.moneyTime > 0) {
                this.moneyAnimation()
            }

        }
    }

}

class Auction {
    constructor(card) {
        this.card = card;
        this.turn = turn;
        this.auctionMoney = 0;
        this.started = false;
        this.playerlist = [...players];
        this.lastHasAdded = false;
        let self = this;

        this.playerlist.forEach(e => {
            e.textsize = measureText({ font: "Arcade", text: e.name })
        })


        this.addMoneyButton2 = new Button([false, false], -100, 490, images.auction.sprites[1], function () {
            board.auction.addMoney(2);
        }, 54, 54, false)
        this.addMoneyButton10 = new Button([false, false], -20, 490, images.auction.sprites[2], function () {
            board.auction.addMoney(10);
        }, 54, 54, false)
        this.addMoneyButton100 = new Button([false, false], 60, 490, images.auction.sprites[3], function () {
            board.auction.addMoney(100);
        }, 54, 54, false)
        this.startAuctionButton = new Button([false, false], -105, 550, images.auction.sprites[5], function () {
            if (Api.online) {
                Api.auctionStart(board.auction.card);
                return;
            }
            board.auction.started = true;
        }, 220, 40, false)

        this.exitAuctionButton = new Button([false, false], -105, 550, images.auction.sprites[4], function () {
            if (self.playerlist.length == 1||self.playerlist.length <= 2 && self.auctionMoney >= Math.round(card.piece.price * board.settings.auctionstartprice)) {
                self.lastHasAdded = true;
            }
            self.exitAuction()
        }, 220, 40, false)

        this.draw = function () {
            drawRotatedImageFromSpriteSheet(canvas.width, canvas.height - images.card.sprites[card.piece.card].frame.h, images.card.sprites[card.piece.card].frame.w * 2 - 22, images.card.sprites[card.piece.card].frame.h * 2, images.card.sprites[card.piece.card], 0, false, 0, 0, images.card.sprites[card.piece.card].frame.w, images.card.sprites[card.piece.card].frame.h, false)

            drawRotatedImageFromSpriteSheet(canvas.width - images.auction.sprites[0].frame.w * 2 + 22, canvas.height - images.card.sprites[card.piece.card].frame.h, images.auction.sprites[0].frame.w * 2, images.auction.sprites[0].frame.h * 2, images.auction.sprites[0], 0, false, 0, 0, images.auction.sprites[0].frame.w, images.auction.sprites[0].frame.h, false)
            if(this.auctionMoney >= Math.round(card.piece.price * board.settings.auctionstartprice)){
                c.fillStyle = "green";
            }else{
                c.fillStyle = "red";
            }
            c.font = 80 / 2 + "px Arcade";
            c.textAlign = "center";
            c.fillText(this.auctionMoney + "kr", canvas.width / 2 - 128 + 11, 430 / 2);
            c.font = (1 / this.playerlist[this.turn].textsize.width) * 22000 > 50 ? 50 : (1 / this.playerlist[this.turn].textsize.width) * 22000 + "px Arcade";
            c.fillStyle = "black"
            c.fillText(this.playerlist[this.turn].name, canvas.width / 2 - 128 + 11, 550 / 2);

            if (this.started) {
                if ((!Api.online && this.playerlist[this.turn].bot === undefined) || (Api.online && Api.currentPlayer == this.playerlist[this.turn].colorIndex)) {

                    this.addMoneyButton2.visible = true;
                    this.addMoneyButton10.visible = true;
                    this.addMoneyButton100.visible = true;
                    this.exitAuctionButton.visible = true;

                    this.addMoneyButton2.draw();
                    this.addMoneyButton10.draw();
                    this.addMoneyButton100.draw();
                    this.exitAuctionButton.draw();
                }
            } else {
                if (Api.online) {
                    this.startAuctionButton.visible = Api.currentPlayer == players[turn].colorIndex;
                    this.startAuctionButton.draw();
                } else {
                    if (this.playerlist[this.turn].bot === undefined) {
                        this.startAuctionButton.visible = true;
                        this.startAuctionButton.draw();
                    }
                }

            }
        }
        this.exitAuction = function () {
            if (Api.online && this.playerlist[this.turn].colorIndex == Api.currentPlayer) Api.auctionBid(this.card, -1, true);
            if (this.playerlist.length > 1) {
                this.playerlist.splice(this.playerlist.indexOf(this.playerlist[this.turn]), 1)
                this.turn = (this.turn) % this.playerlist.length;
            }
            if (this.playerlist.length === 1 && this.lastHasAdded) {
                for (let i = 0; i < players.length; i++) {
                    if (this.playerlist[0].colorIndex == players[i].colorIndex) {
                        if (this.auctionMoney >= Math.round(card.piece.price * board.settings.auctionstartprice)) {
                            players[i].money -= this.auctionMoney;
                            players[i].totalLost += this.auctionMoney;
                            if (board.settings.allFreeparking) {
                                board.boardPieces[20].money += this.auctionMoney;
                            }
                            players[i].playerBorder.startMoneyAnimation(-this.auctionMoney)
                            board.auction.card.owner = players[i];
                            players[i].ownedPlaces.push(this.card);
                        }
                        buttons.splice(buttons.indexOf(this.addMoneyButton2), 1)
                        buttons.splice(buttons.indexOf(this.addMoneyButton10), 1)
                        buttons.splice(buttons.indexOf(this.addMoneyButton100), 1)
                        buttons.splice(buttons.indexOf(this.startAuctionButton), 1)
                        buttons.splice(buttons.indexOf(this.exitAuctionButton), 1)
                        board.currentCard = undefined;
                        board.auction = undefined;
                    }
                }

            }
        }

        this.update = function () {
            if (Api.online) {
                this.addMoneyButton2.disabled = players[Api.currentPlayer].money < this.auctionMoney + 2;
                this.addMoneyButton10.disabled = players[Api.currentPlayer].money < this.auctionMoney + 10;
                this.addMoneyButton100.disabled = players[Api.currentPlayer].money < this.auctionMoney + 100;
            } else {
                this.addMoneyButton2.disabled = this.playerlist[this.turn].money < this.auctionMoney + 2;
                this.addMoneyButton10.disabled = this.playerlist[this.turn].money < this.auctionMoney + 10;
                this.addMoneyButton100.disabled = this.playerlist[this.turn].money < this.auctionMoney + 100;
            }

            if (this.addMoneyButton2.disabled) this.exitAuction()
            this.draw();
        }

        this.addMoney = function (money) {
            if (Api.online) {
                Api.auctionBid(this.card, this.auctionMoney + money, false);
                return;
            }

            this.auctionMoney += money;
            this.turn = (this.turn + 1) % this.playerlist.length;

            if (this.playerlist.length === 1 && this.auctionMoney >= Math.round(card.piece.price * board.settings.auctionstartprice)) {
                this.lastHasAdded = true;
                this.exitAuction();
            }

        }
    }
}

class Button {
    constructor(select, x, y, img, onClick, w, h, showBorder, mirror, screencenter, disableselectTexture, disablesound, invertedHitbox, text, font, textcolor, textFont) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img = img;
        this.onClick = onClick
        this.visible = false;
        this.disabled = false;
        this.hover = false;
        this.mirror = false;
        this.screencenter = false;
        this.text = text;
        this.font = font / 2;
        this.selected = false;
        this.select = select
        this.disablesound = disablesound;
        this.textcolor = textcolor
        this.disableselectTexture = disableselectTexture;
        this.invertedHitbox = invertedHitbox;
        this.textFont = textFont;
        if (textcolor == undefined) {
            this.textcolor = "black"
        }
        if (mirror === true) {
            this.mirror = true;
        }
        if (screencenter === true) {
            this.screencenter = true;
        }
        if (textFont == undefined) {
            this.textFont = "Arcade"
        }

        this.showBorder = showBorder;
        if (buttons.includes(this)) {

        } else {
            buttons.push(this);
        }


        this.draw = function () {
            if (!this.visible) return;

            if (this.visible && this.img !== undefined) {
                if (!this.disabled && this.selected === false) {
                    if (detectCollition(this.x + 358, this.y - 200, this.w, this.h, mouse.x, mouse.y, 1, 1)) {
                        if (this.img.frame.w > this.w) {
                            drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, this.w, 0, this.w, this.h)
                        } else {
                            drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, 0, 0, this.w, this.h)
                        }
                        this.hover = true;
                    } else {
                        this.hover = false;
                        drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, 0, 0, this.w, this.h)
                    }
                } else {
                    if (this.disabled) {
                        this.hover = false;
                        if (this.select[0] === false) {
                            if(this.disableselectTexture){
                                drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, this.w * 1, 0, this.w, this.h)
                            }else{
                                drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, this.w * 2, 0, this.w, this.h)
                            }
                        } else {
                            if (this.img.frame.w > this.w * 2) {
                                if (this.selected) {
                                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, this.w * 3, 0, this.w, this.h)
                                } else {
                                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, this.w * 1, 0, this.w, this.h)
                                }
                            } else {
                                drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, 0, 0, this.w, this.h)
                            }
                        }
                    } else {
                        if (detectCollition(this.x + 358, this.y - 200, this.w, this.h, mouse.x, mouse.y, 1, 1)) {

                            if (this.img.frame.w <= this.w * 3) {
                                if (this.disableselectTexture) {
                                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, this.w * 1, 0, this.w, this.h)
                                } else if (!this.select[1]) {
                                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, this.w * 1, 0, this.w, this.h)
                                } else {
                                    drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, this.w * 2, 0, this.w, this.h)
                                }
                            } else {

                                drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, this.w * 3, 0, this.w, this.h)
                            }
                            this.hover = true;
                        } else {
                            this.hover = false;
                            if (this.disableselectTexture) {
                                drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, this.w, 0, this.w, this.h)
                            } else {
                                drawRotatedImageFromSpriteSheet(this.x * drawScale + 715, this.y * drawScale - 400, this.w * drawScale, this.h * drawScale, this.img, 0, this.mirror, this.w * 2, 0, this.w, this.h)
                            }

                        }
                    }

                }
                if (this.text !== undefined) {
                    c.font = this.font + "px " + this.textFont;
                    c.fillStyle = this.textcolor
                    c.textAlign = "center"
                    c.fillText(this.text, this.x + 715 / 2 + this.w / 2, this.y - 400 / 2 + this.h / 2 / 2 + this.font / 2 + this.h / 2 / 2.5)
                }

            } else if (this.visible) {
                if (detectCollition(this.x + 358, this.y - 200, this.w, this.h, mouse.x, mouse.y, 1, 1)) {
                    this.hover = true;
                } else {
                    this.hover = false;
                }
            }
            if (showBorder) {
                c.strokeStyle = "black";
                c.strokeRect(this.x + 358, this.y - 200, this.w, this.h)
                if (this.invertedHitbox !== undefined) {
                    c.strokeRect(this.invertedHitbox.x / 2, this.invertedHitbox.y / 2, this.invertedHitbox.w / 2, this.invertedHitbox.h / 2)
                }
            }

        }
        this.click = function () {
            if (this.disabled || !this.visible) return;
            if (detectCollition(this.x + 358, this.y - 200, this.w, this.h, mouse.x, mouse.y, 1, 1) ||
                this.invertedHitbox !== undefined && this.invertedHitbox !== false && this.invertedHitbox.onlySelected === undefined && !detectCollition(this.invertedHitbox.x / 2, this.invertedHitbox.y / 2, this.invertedHitbox.w / 2, this.invertedHitbox.h / 2, mouse.x, mouse.y, 1, 1) ||
                this.invertedHitbox !== undefined && this.invertedHitbox !== false && this.invertedHitbox.onlySelected === true && this.selected && !detectCollition(this.invertedHitbox.x / 2, this.invertedHitbox.y / 2, this.invertedHitbox.w / 2, this.invertedHitbox.h / 2, mouse.x, mouse.y, 1, 1)) {
                if (this.select[0] === true) {
                    if (this.selected) {
                        this.selected = false;
                    } else {
                        this.selected = true;
                    }
                }
                this.onClick();

                this.hover = false;
                if (!this.disablesound) {
                    playSound(sounds.release, 1)
                }
            }
        }
    }
}

class BoardPiece {
    constructor(n, img) {
        this.side = Math.floor(n / 10);
        this.n = n;
        this.piece = pieces[this.n];
        if (this.n !== -1) {
            this.img = img[this.piece.img];
        }
        this.offsetX = 0;
        this.offsetY = 0;
        this.x = 0;
        this.y = 0;
        this.imgSide = 0;
        this.owner = undefined;
        this.level = 0;
        this.hover = false;
        this.currentPlayer = [];
        this.mortgaged = false;
        this.money = 0;
        this.freeParking = false;
        this.currentOffsetvalue = 0;
        this.visible = true;
        this.totalEarned = 0;
        buttons.push(this);


        this.setImg = function () {
            if (this.side === 0) {
                this.x = 128 * 5.5 - this.n * 64;
                this.y = 64 * 11;
                this.imgSide = 0;
            }
            if (this.side === 1) {
                this.x = 34;
                this.y = -32 + 128 * 10.5 + - this.n * 64;
                this.imgSide = 3;
                if (this.n % 10 === 0) {
                    this.x = 1;
                    this.y = -32 + 128 * 10.75 + - this.n * 64;
                }
            }
            if (this.side === 2) {
                this.x = (this.n % 10) * 64;
                this.y = 0;
                this.imgSide = 1;
                if (this.n % 10 !== 0) {
                    this.x = (this.n % 10) * 64 + 64;
                    this.y = 2;
                }
            }

            if (this.side === 3) {
                this.x = 128 * 5.5
                this.y = 0
                this.imgSide = 2;
                if (this.n % 10 !== 0) {
                    this.x = 128 * 5.75
                    this.y = 0.25 * 128 + 64 * (this.n % 10)
                }
            }
        }
        this.setImg();

        this.update = function () {
            if (this.piece !== undefined) {
                if (this.piece.name === "Fri parkering" && board.settings.freeParking) {
                    this.freeParking = true;
                }
            }

            let mouseSquareX = (to_grid_coordinate(mouse.x, mouse.y).x - 1200 / 2) / (64)
            let mouseSquareY = (to_grid_coordinate(mouse.x, mouse.y).y + 720 / 2) / (64)
            if (board.currentCard !== undefined || this.piece.type === "chance" || this.piece.type === "community chest" || this.piece.type === "income tax" || this.piece.type === "tax" || this.n % 10 === 0 || board.auction !== undefined || board.trade !== undefined || players[turn].inJail === true || board.showDices || board.animateDices || players[turn].animationOffset !== 0 || board.getToMainMenuButton.selected || board.currentShowingCard !== undefined || players.map(e => e.playerBorder.button.selected).includes(true)) {
                this.offsetY = this.currentOffsetvalue;
                this.hover = false;
            } else if (this.x / 64 > mouseSquareX - 1 && this.x / 64 < mouseSquareX && this.side === 2 && this.n % 10 !== 0 && mouseSquareY >= 0 && mouseSquareY < 2
                || this.x / 64 > mouseSquareX - 2 && this.x / 64 < mouseSquareX && this.side === 2 && this.n % 10 === 0 && mouseSquareY >= 0 && mouseSquareY < 2

                || this.x / 64 > mouseSquareX - 1 && this.x / 64 < mouseSquareX && this.side === 0 && this.n % 10 !== 0 && mouseSquareY >= 11 && mouseSquareY < 13
                || this.x / 64 > mouseSquareX - 2 && this.x / 64 < mouseSquareX && this.side === 0 && this.n % 10 === 0 && mouseSquareY >= 11 && mouseSquareY < 13

                || this.y / 64 > mouseSquareY - 1.5 && this.y / 64 < mouseSquareY - 0.5 && this.side === 3 && this.n % 10 !== 0 && mouseSquareX >= 11 && mouseSquareX < 13
                || this.y / 64 > mouseSquareY - 2 && this.y / 64 < mouseSquareY && this.side === 3 && this.n % 10 === 0 && mouseSquareX >= 11 && mouseSquareX < 13

                || this.y / 64 > mouseSquareY - 1.5 && this.y / 64 < mouseSquareY - 0.5 && this.side === 1 && this.n % 10 !== 0 && mouseSquareX >= 0 && mouseSquareX < 2
                || this.y / 64 > mouseSquareY - 2 && this.y / 64 < mouseSquareY && this.side === 1 && this.n % 10 === 0 && mouseSquareX >= 0 && mouseSquareX < 2
            ) {
                this.offsetY = -1;
                this.visible = true;
                this.hover = true;

            } else {
                this.offsetY = this.currentOffsetvalue;
                this.hover = false;
            }

            this.draw();

        }
        this.draw = function () {
            if (this.n % 10 !== 0) {
                if (this.mortgaged === false) {
                    drawIsometricImage(this.x, this.y, this.img, false, 96 * this.imgSide, 0, 96, 48, this.offsetX, this.offsetY);
                } else if (this.piece.type === "station") {
                    drawIsometricImage(this.x, this.y, images.part.sprites[18], false, 96 * this.imgSide, 0, 96, 48, this.offsetX, this.offsetY);
                } else if (this.piece.name === "Elverket") {
                    drawIsometricImage(this.x, this.y, images.part.sprites[19], false, 96 * this.imgSide, 0, 96, 48, this.offsetX, this.offsetY);
                } else if (this.piece.name === "Vattenledningsverket") {
                    drawIsometricImage(this.x, this.y, images.part.sprites[20], false, 96 * this.imgSide, 0, 96, 48, this.offsetX, this.offsetY);
                } else {
                    drawIsometricImage(this.x, this.y, images.part.sprites[17], false, 96 * this.imgSide, 0, 96, 48, this.offsetX, this.offsetY);
                }
                if (this.owner !== undefined) {
                    if (this.side === 2) {
                        drawIsometricImage(this.x - 10, this.y, images.playerOverlay.sprites[this.owner.colorIndex], false, 96 * this.imgSide, 0, 96, 48, this.offsetX, this.offsetY);
                    } else {
                        drawIsometricImage(this.x, this.y, images.playerOverlay.sprites[this.owner.colorIndex], false, 96 * this.imgSide, 0, 96, 48, this.offsetX, this.offsetY);
                    }
                }
            } else {
                drawIsometricImage(this.x, this.y, this.img, false, 0, 0, 128, 64, this.offsetX, this.offsetY);
            }
            if (this.freeParking) {
                c.font = 50 / 2 + "px Arcade"
                c.fillStyle = "black"
                c.fillText(this.money + "kr", 980 / 2, 120 / 2)
            }
        }
        this.drawHouses = function () {
            if (this.level < 5 && this.piece.housePrice !== undefined) {
                for (let i = 0; i < this.level; i++) {
                    if (this.imgSide === 0) {
                        drawIsometricImage(this.x + 13 * drawScale + i * 8 * drawScale, this.y - 31 * drawScale, images.house.sprites[0], false, 0, 0, 24, 24, this.offsetX, this.offsetY);
                    }
                    if (this.imgSide === 1) {
                        drawIsometricImage(this.x + 13 * drawScale + i * 8 * drawScale, this.y + 15 * drawScale, images.house.sprites[0], false, 0, 0, 24, 24, this.offsetX, this.offsetY);
                    }
                    if (this.imgSide === 2) {
                        drawIsometricImage(this.x + 5 * drawScale, this.y - 21 * drawScale + i * 8 * drawScale, images.house.sprites[0], false, 24, 0, 24, 24, this.offsetX, this.offsetY);
                    }
                    if (this.imgSide === 3) {
                        drawIsometricImage(this.x + 50 * drawScale, this.y - 21 * drawScale + i * 8 * drawScale, images.house.sprites[0], false, 24, 0, 24, 24, this.offsetX, this.offsetY);
                    }
                }
            } else if (this.piece.housePrice !== undefined) {
                if (this.imgSide === 0) {
                    drawIsometricImage(this.x + 28 * drawScale, this.y - 31 * drawScale, images.house.sprites[1], false, 0, 0, 24, 24, this.offsetX, this.offsetY);
                }
                if (this.imgSide === 1) {
                    drawIsometricImage(this.x + 28 * drawScale, this.y + 15 * drawScale, images.house.sprites[1], false, 0, 0, 24, 24, this.offsetX, this.offsetY);
                }
                if (this.imgSide === 2) {
                    drawIsometricImage(this.x + 5 * drawScale, this.y - 8 * drawScale, images.house.sprites[1], false, 24, 0, 24, 24, this.offsetX, this.offsetY);
                }
                if (this.imgSide === 3) {
                    drawIsometricImage(this.x + 50 * drawScale, this.y - 8 * drawScale, images.house.sprites[1], false, 24, 0, 24, 24, this.offsetX, this.offsetY);
                }
            }
        }


        this.click = function () {
            if (this.hover === true) {
                playSound(sounds.release, 1)
                if (this.piece.card !== undefined) {
                    board.currentCard = this;
                }
            }
        }
        this.playerStep = function (onlyStep, player, diceRoll) {
            this.currentPlayer.push(player);
            if (this.currentPlayer.length <= 2) {
                this.currentOffsetvalue = 1;
                let self = this;
                timeouts.push(setTimeout(() => {
                    self.currentOffsetvalue = 0;
                }, speeds.stepSpeed));
            }

            if (!onlyStep && !this.mortgaged && player.laps >= board.settings.roundsBeforePurchase) {
                if (this.piece.price < 0) {
                    board.currentShowingCard = new CurrentCard(4, "special")
                    let self = this;
                    board.currentShowingCard.onContinue = function () {
                        board.currentShowingCard = new CurrentCard(0,"bankcheck",{to:"Banken",amount:-self.piece.price,reason:"Skatt",from:player.name})
                        board.currentShowingCard.onContinue = function(){
                            player.money += self.piece.price;
                            self.totalEarned -= self.piece.price;
                            player.totalLost -= self.piece.price;
                            board.boardPieces[20].money -= self.piece.price;
                            player.playerBorder.startMoneyAnimation(self.piece.price)
                        }
                    }
                } else if (this.piece.price > 0 && this.owner === undefined) {
                    if (player.bot === undefined) {
                        board.currentCard = this;
                    }
                } else if (this.owner !== player && this.owner !== undefined && board.settings.prisonmoney || this.owner !== player && this.owner !== undefined && !board.settings.prisonmoney && !this.owner.inJail) {
                    if (this.piece.type === "utility") {
                        let tmp = 0;
                        let multiply = 0;
                        this.owner.ownedPlaces.forEach(e => {
                            if (e.piece.type === "utility") {
                                tmp++;
                            }
                        })
                        if (tmp === 1) {
                            multiply = 4;

                        }
                        if (tmp === 2) {
                            multiply = 10
                        }
                        board.currentShowingCard = new CurrentCard(0,"bankcheck",{to:this.owner.name,amount:diceRoll * multiply,reason:"Hyra",from:player.name})
                        let self = this;
                        board.currentShowingCard.onContinue = function(){
                            player.money -= diceRoll * multiply;
                            player.totalLost += diceRoll * multiply;
                            self.owner.money += diceRoll * multiply;
                            self.owner.totalEarned += diceRoll * multiply;
                            self.totalEarned += diceRoll * multiply;
                            player.playerBorder.startMoneyAnimation(-diceRoll * multiply, true)
                            self.owner.playerBorder.startMoneyAnimation(diceRoll * multiply)
                            player.checkDebt(self.owner);
                        }
                    } else if (this.piece.type === "station") {
                        let tmp = -1;
                        this.owner.ownedPlaces.forEach(e => {
                            if (e.piece.type === "station") {
                                tmp++;
                            }
                        })
                        board.currentShowingCard = new CurrentCard(0,"bankcheck",{to:this.owner.name,amount:25 * Math.pow(2, tmp),reason:"Hyra",from:player.name})
                        let self = this;
                        board.currentShowingCard.onContinue = function(){
                            player.money -= 25 * Math.pow(2, tmp);
                            player.totalLost += 25 * Math.pow(2, tmp);
                            self.owner.money += 25 * Math.pow(2, tmp);
                            self.owner.totalEarned += 25 * Math.pow(2, tmp);
                            self.totalEarned += 25 * Math.pow(2, tmp);
                            player.playerBorder.startMoneyAnimation(-25 * Math.pow(2, tmp), true)
                            self.owner.playerBorder.startMoneyAnimation(25 * Math.pow(2, tmp))
                            player.checkDebt(self.owner);
                        }
            

                    } else {
                        let ownAll = true;
                        for (let i = 0; i < board.boardPieces.length; i++) {
                            if (board.boardPieces[i] !== this) {
                                if (board.boardPieces[i].piece.group === this.piece.group) {
                                    if (this.owner !== board.boardPieces[i].owner) {
                                        ownAll = false;
                                    }
                                }
                            }
                        }
                        let multiply = 1;
                        if (ownAll && this.level === 0 && board.settings.doubleincome) {
                            multiply = 2;
                        }
                        board.currentShowingCard = new CurrentCard(0,"bankcheck",{to:this.owner.name,amount:this.piece.rent[this.level] * multiply,reason:"Hyra",from:player.name})
                        let self = this;
                        board.currentShowingCard.onContinue = function(){
                            player.money -= self.piece.rent[self.level] * multiply;
                            player.totalLost += self.piece.rent[self.level] * multiply;
                            self.owner.money += self.piece.rent[self.level] * multiply;
                            self.owner.totalEarned += self.piece.rent[self.level] * multiply;
                            self.totalEarned += self.piece.rent[self.level] * multiply;
                            player.playerBorder.startMoneyAnimation(-self.piece.rent[self.level] * multiply, true)
                            self.owner.playerBorder.startMoneyAnimation(self.piece.rent[self.level] * multiply)
                            player.checkDebt(self.owner);
                        }
                    }
                } else if (this.piece.type === "chance") {
                    let random = randomIntFromRange(1, 14);
                    if (Api.online) {
                        if (players[turn].colorIndex == Api.currentPlayer) Api.randomEvent("CHANCE_CARD", random);
                    } else {
                        this.doChanceCard(random, player);
                    }
                } else if (this.piece.type === "community chest") {
                    let random = randomIntFromRange(1, 17);
                    if (Api.online) {
                        if (players[turn].colorIndex == Api.currentPlayer) Api.randomEvent("COMMUNITY_CHEST", random);
                    } else {
                        this.doCommunityChest(random, player);
                    }
                } else if (this.piece.type === "income tax") {
                    board.currentShowingCard = new CurrentCard(3, "special")
                    board.currentShowingCard.onContinue = function () {
                        board.currentShowingCard = new CurrentCard(0,"bankcheck",{to:"Banken",amount:player.money > 2000 ? 200 : Math.round(player.money * 0.1),reason:"Skatt",from:player.name})
                        board.currentShowingCard.onContinue = function(){
                            if (player.money > 2000) {
                                player.money -= 200;
                                player.totalLost += 200;
                                self.totalEarned += 200;
                                board.boardPieces[20].money += 200;
                                player.playerBorder.startMoneyAnimation(-200)
                            } else {
                                player.playerBorder.startMoneyAnimation(-Math.round(player.money * 0.1))
                                player.money = Math.round(player.money * 0.9);
                                board.boardPieces[20].money += (Math.round(player.money * 0.1));
                                player.totalLost += (Math.round(player.money * 0.1));
                                self.totalEarned += (Math.round(player.money * 0.1));
                            }
                        }
                    }

                } else if (this.freeParking && this.money !== 0) {
                    player.money += this.money;
                    player.totalEarned += this.money;
                    player.playerBorder.startMoneyAnimation(this.money)
                    this.money = 0;
                }
            }
        }

        this.doChanceCard = (random, player) => {
            board.currentShowingCard = new CurrentCard(random, "chance")
            if (random === 1) {
                board.currentShowingCard.onContinue = function () { player.teleportTo(0, true, false) }
            }
            if (random === 2) {
                board.currentShowingCard.onContinue = function () { player.teleportTo(24, true, false) }
            }
            if (random === 3) {
                board.currentShowingCard.onContinue = function () { player.teleportTo(11, true, false) }
            }
            if (random === 4) {
                if (this.n === 7) {
                    board.currentShowingCard.onContinue = function () { player.teleportTo(12, undefined, false) }
                }
                if (this.n === 22) {
                    board.currentShowingCard.onContinue = function () { player.teleportTo(28, true, false) }
                }
                if (this.n === 36) {
                    board.currentShowingCard.onContinue = function () { player.teleportTo(-28, false, false) }
                }
            }
            if (random === 5) {
                if (this.n === 7) {
                    board.currentShowingCard.onContinue = function () { player.teleportTo(-5, false, false) }
                }
                if (this.n === 22) {
                    board.currentShowingCard.onContinue = function () { player.teleportTo(25, false, false) }
                }
                if (this.n === 36) {
                    board.currentShowingCard.onContinue = function () { player.teleportTo(-35, false, false) }
                }
            }
            if (random === 6) {
                board.currentShowingCard.onContinue = function () { 
                    player.money += 50; 
                    player.totalEarned += 50;
                    player.playerBorder.startMoneyAnimation(50)     
                }
            }
            if (random === 7) {
                board.currentShowingCard.onContinue = function () { player.jailcardAmount++; }
            }
            if (random === 8) {
                board.currentShowingCard.onContinue = function () { player.teleportTo(-(player.steps - 3), false, false) }
            }
            if (random === 9) {
                board.currentShowingCard.onContinue = function () { player.goToPrison(); }
            }
            if (random === 10) {
                let tmp = 0;
                board.boardPieces.forEach(function (e) {
                    if (player === e.owner) {
                        if (e.level < 5) {
                            tmp += 25 * e.level
                        } else {
                            tmp += 100
                        }
                    }
                })
                if (tmp !== 0) {
                    board.currentShowingCard.onContinue = function () {
                        board.currentShowingCard = new CurrentCard(0,"bankcheck",{to:"Renovering AB",amount:tmp,reason:"Avgift",from:player.name})
                        board.currentShowingCard.onContinue = function(){
                            player.money -= tmp; 
                            player.totalLost += tmp;
                            player.playerBorder.startMoneyAnimation(-tmp) 
                            if (board.settings.freeParking) {
                                board.boardPieces[20].money += tmp;
                                player.checkDebt(board.boardPieces[20]);
                            }else{
                                player.checkDebt();
                            }
                        }
                    }
                } else {
                    board.currentShowingCard.onContinue = function () {}
                }
            }
            if (random === 11) {
                board.currentShowingCard.onContinue = function () { player.teleportTo(5, undefined, false); }
            }
            if (random === 12) {
                board.currentShowingCard.onContinue = function () { player.teleportTo(39, undefined, false); }
            }
            if (random === 13) {
                board.currentShowingCard.onContinue = function () {
                    board.currentShowingCard = new CurrentCard(0,"bankcheck",{to:player.name,amount:(players.length - 1) * 50,reason:"",from:"Motspelare"})
                    board.currentShowingCard.onContinue = function(){
                        player.money += (players.length - 1) * 50
                        player.totalEarned += (players.length - 1) * 50;
                        player.playerBorder.startMoneyAnimation(((players.length - 1) * 50), true)
                        players.forEach(e => { if (e !== player) { e.money -= 50; e.totalLost += 50;e.playerBorder.startMoneyAnimation(-50) } })
                    }
                }
            }
            if (random === 14) {
                board.currentShowingCard.onContinue = function () {
                    player.money += 150; 
                    player.totalEarned += 150;
                    player.playerBorder.startMoneyAnimation(150) 
                }
            }
        }

        this.doCommunityChest = (random, player) => {
            board.currentShowingCard = new CurrentCard(random, "community")
            if (random === 1) {
                board.currentShowingCard.onContinue = function () { player.teleportTo(0, undefined, false) }
            }
            if (random === 2) {
                board.currentShowingCard.onContinue = function () { 
                    player.money += 200; 
                    player.totalEarned += 200;
                    player.playerBorder.startMoneyAnimation(200) 
                }
            }
            if (random === 3) {
                board.currentShowingCard.onContinue = function () {
                    player.money -= 50;
                    player.totalLost += 50;
                    if (board.settings.freeParking) {
                        board.boardPieces[20].money += 50;
                    }
                    player.playerBorder.startMoneyAnimation(-50)
                }
            }
            if (random === 4) {
                board.currentShowingCard.onContinue = function () {
                    player.money += 50;
                    player.totalEarned += 50;
                    player.playerBorder.startMoneyAnimation(50)           
                }
            }
            if (random === 5) {
                board.currentShowingCard.onContinue = function () {
                    player.jailcardAmount++;
                }
            }
            if (random === 6) {
                board.currentShowingCard.onContinue = function () {
                    player.goToPrison()
                }
            }
            if (random === 7) {
                board.currentShowingCard.onContinue = function () {
                    board.currentShowingCard = new CurrentCard(0,"bankcheck",{to:player.name,amount:(players.length - 1) * 50,reason:"",from:"Motspelare"})
                    board.currentShowingCard.onContinue = function(){
                        player.money += (players.length - 1) * 50
                        player.totalEarned += (players.length - 1) * 50;
                        player.playerBorder.startMoneyAnimation(((players.length - 1) * 50))
                        players.forEach(e => { if (e !== player) { e.money -= 50;e.totalLost += 50; e.playerBorder.startMoneyAnimation(-50, true) } })
                    }
                }
            }
            if (random === 8) {
                board.currentShowingCard.onContinue = function () {
                    player.money += 100;
                    player.totalEarned += 100;
                    player.playerBorder.startMoneyAnimation(100)
                }
            }
            if (random === 9) {
                board.currentShowingCard.onContinue = function () {
                    player.money += 20;
                    player.totalEarned += 20;
                    player.playerBorder.startMoneyAnimation(20)
                }
            }
            if (random === 10) {
                board.currentShowingCard.onContinue = function () {
                    board.currentShowingCard = new CurrentCard(0,"bankcheck",{to:player.name,amount:(players.length - 1) * 10,reason:"",from:"Motspelare"})
                    board.currentShowingCard.onContinue = function(){
                        player.money += (players.length - 1) * 10
                        player.totalEarned += (players.length - 1) * 10
                        player.playerBorder.startMoneyAnimation(((players.length - 1) * 10))
                        players.forEach(e => { if (e !== player) { e.money -= 10; e.totalLost += 10; e.playerBorder.startMoneyAnimation(-10, true) } })
                    }
                }
            }
            if (random === 11) {
                board.currentShowingCard.onContinue = function () {
                    player.money += 100;
                    player.totalEarned += 100;
                    player.playerBorder.startMoneyAnimation(100)
                }
            }
            if (random === 12) {
                board.currentShowingCard.onContinue = function () {
                    player.money -= 50;
                    player.totalLost += 50;
                    if (board.settings.freeParking) {
                        board.boardPieces[20].money += 50;
                    }
                    player.playerBorder.startMoneyAnimation(-50)
                }
            }
            if (random === 13) {
                board.currentShowingCard.onContinue = function () {
                    player.money -= 50;
                    player.totalLost += 50;
                    if (board.settings.freeParking) {
                        board.boardPieces[20].money += 50;
                    }
                    player.playerBorder.startMoneyAnimation(-50)
                }
            }
            if (random === 14) {
                board.currentShowingCard.onContinue = function () {
                    player.money -= 25;
                    player.totalLost += 25;
                    if (board.settings.freeParking) {
                        board.boardPieces[20].money += 25;
                    }
                    player.playerBorder.startMoneyAnimation(-25)
                }
            }
            if (random === 15) {
                let tmp = 0;
                board.boardPieces.forEach(function (e) {
                    if (player === e.owner) {
                        if (e.level < 5) {
                            tmp += 40 * e.level
                        } else {
                            tmp += 115
                        }
                    }
                })
                if (tmp !== 0) {
                    board.currentShowingCard.onContinue = function () {
                        board.currentShowingCard = new CurrentCard(0,"bankcheck",{to:"Renovering AB",amount:tmp,reason:"Avgift",from:player.name})
                        board.currentShowingCard.onContinue = function(){
                            player.money -= tmp;
                            player.totalLost += tmp;
                            player.playerBorder.startMoneyAnimation(-tmp) 
                            if (board.settings.freeParking) {
                                board.boardPieces[20].money += tmp;
                                player.checkDebt(board.boardPieces[20]);
                            }else{
                                player.checkDebt();
                            }
                        }
                    }
                } else {
                    board.currentShowingCard.onContinue = function () {}
                }
                
            }
            if (random === 16) {
                board.currentShowingCard.onContinue = function () {
                    player.money += 10;
                    player.totalEarned += 10;
                    player.playerBorder.startMoneyAnimation(10)
                }
            }
            if (random === 17) {
                board.currentShowingCard.onContinue = function () {
                    player.money += 100;
                    player.totalEarned += 100;
                    player.playerBorder.startMoneyAnimation(100)
                }
            }
        }
    }
}
class CurrentCard {
    constructor(card, type,info) {
        let self = this;
        this.card = card;
        this.type = type;
        this.info = info;
        this.continue = function () { };

        if (this.type == "chance") {
            this.img = images.chanceCards.sprites[this.card]
            if (this.img === undefined) {
                this.img = images.chanceCards.sprites[0]
            }
        } else if (this.type == "community") {
            this.img = images.communityCards.sprites[this.card]
            if (this.img === undefined) {
                this.img = images.communityCards.sprites[0]
            }
        } else if (this.type == "special") {
            this.img = images.specialCards.sprites[this.card]
            if (this.img === undefined) {
                this.img = images.specialCards.sprites[0]
            }
        }else if (this.type == "bankcheck") {
            this.img = images.bankCheck.sprites[this.card]
            if (this.img === undefined) {
                this.img = images.bankCheck.sprites[0]
            }
        }

        this.onContinue = undefined;
        this.cardCloseButton = new Button([false, false], 369, 352, images.exitMenu.sprites[1], function () { self.continue() }, 18, 18, false, false, false, false, false, { x: 371 + 98, y: 350 - 50, w: 512 * drawScale, h: 256 * drawScale })
        this.okayButton = new Button([false, false], 40, 530, images.buttons.sprites[20], function () { self.continue() }, 200, 60, false, false, false, false, false, { x: 371 + 98, y: 350 - 50, w: 512 * drawScale, h: 256 * drawScale })
        

        this.draw = function () {
            if (players[turn].bot === undefined) {
                this.okayButton.visible = true;
                this.cardCloseButton.visible = false;
            } else {
                this.cardCloseButton.visible = true;
                this.okayButton.visible = false;
            }
            if(this.type === "bankcheck"){
                this.cardCloseButton.visible = true;
                this.okayButton.visible = false;
            }
            drawRotatedImageFromSpriteSheet(470, 300, 512 * 2, 256 * 2, this.img, 0, false, 0, 0, 512, 256, 0, c)
            this.cardCloseButton.draw();
            this.okayButton.draw();
            if(this.type === "bankcheck"){
                c.fillStyle = "black"
                c.textAlign = "left"
                c.font = "25px Handwritten"
                c.fillText(new Date().getDate() + " " + monthToText(new Date().getMonth()),595,203)
                c.font = "50px Handwritten"
                c.fillText(info.to,400,245)
                c.font = "25px Handwritten"
                c.fillText(info.amount,670,249)
                c.font = "30px Handwritten"
                c.fillText(numberToText(info.amount),270,290)
                c.font = "30px Handwritten"
                c.fillText(info.reason,300,338)
                c.font = "37px Signature"
                c.fillText(info.from,510,338)
            }
        }
        this.continue = function () {
            self.card = undefined;
            board.currentShowingCard = undefined;
            self.onContinue();
        }



    }
}

class Player {

    constructor(img, index, name, bot) {
        this.name = name;
        this.img = img;
        this.x = 0;
        this.y = 0;
        this.steps = 0;
        this.money = board.settings.startmoney;
        this.colorIndex = index
        this.offsetY = 0;
        this.stepsWithOffset = (this.steps)
        this.rolls = false;
        this.numberOfRolls = 0;
        this.inJail = false;
        this.ownedPlaces = [];
        this.animationOffset = 0;
        this.timer = undefined;
        this.negative = false;
        this.bot = undefined;
        this.inDebtTo = undefined;
        this.lastMoneyInDebt = 0;
        this.jailcardAmount = 0;
        this.timeInJail = 0;
        this.laps = 0;
        this.hasStepped = false;
        this.dead = false;
        this.playTime = 0;
        this.totalEarned = board.settings.startmoney;
        this.totalLost = 0;

        this.playerBorder = new PlayerBorder(this)
        if (bot == true) {
            this.bot = new Bot(this);
        }


        this.draw = function () {
            drawIsometricImage(800 - this.x * 64 - 32, 700 - this.y * 64 - 32, this.img, false, 0, 0, 24, 48, 0, -this.offsetY, 1)
        }
        this.update = function () {
            if(this.dead === false){
                this.updateVisual();
                this.draw();
                this.money = Math.floor(this.money)
                this.checkMoney();
                if (this.bot !== undefined) {
                    this.bot.update();
                }
            }
        }

        this.checkMoney = function () {
            let mortgaged = 0;
            this.ownedPlaces.forEach(e => { if (e.mortgaged === true) { mortgaged++ } })
            if (this.money < 0 && this.ownedPlaces.length == 0 + mortgaged || this.money < 0 && !board.settings.sellable) {
                if (Api.online) {
                    Api.changeTurn();
                } else {
                    delete Bot.boardInfo[turn]
                    turn = turn % (players.length - 1);
                    board.textsize = measureText({ font: "Arcade", text: "Just nu: " + players[turn].name });

                }

                board.boardPieces[this.steps].currentPlayer.splice(board.boardPieces[this.steps].currentPlayer.indexOf(this), 1)
                board.boardPieces.forEach(e => {
                    if (e.owner === this) {
                        e.owner = undefined;
                        e.mortgaged = false;
                    }
                })
                this.dead = true;
                this.ownedPlaces = [];

            } else if (this.money < 0) {
                this.negative = true;
            } else {
                this.negative = false;
            }
        }
        this.checkDebt = function (player) {
            if (this.money < 0 && this.lastMoneyInDebt === 0) {
                player.money += this.money;
                this.inDebtTo = player;
                this.lastMoneyInDebt = this.money;
            } else if (this.inDebtTo !== undefined) {
                let moneyToAdd = this.money - this.lastMoneyInDebt;
                this.lastMoneyInDebt = this.money
                this.inDebtTo.money += (moneyToAdd);
                if (this.money >= 0) {
                    this.inDebtTo.playerBorder.startMoneyAnimation(moneyToAdd - this.money);
                    this.inDebtTo.money -= this.money;
                    this.inDebtTo = undefined;
                    this.lastMoneyInDebt = 0;
                } else {
                    this.inDebtTo.playerBorder.startMoneyAnimation(moneyToAdd);
                }
            }
        }
        this.updateVisual = function () {
            this.stepsWithOffset = 40 + (this.steps) - this.animationOffset
            this.stepsWithOffset = this.stepsWithOffset % 40;

            if (this.stepsWithOffset === 0) {
                this.x = 0;
                this.y = 0;
            }
            if (this.stepsWithOffset > 0 && this.stepsWithOffset < 10) {
                this.y = 0.5;
                this.x = this.stepsWithOffset + 1;
            }
            if (this.stepsWithOffset > 9 && this.stepsWithOffset < 21) {
                this.x = 11.5
                if (this.stepsWithOffset === 10) {
                    this.x = 12
                    this.y = this.stepsWithOffset - 10;
                } else if (this.stepsWithOffset < 20) {
                    this.y = this.stepsWithOffset - 9;
                } else {
                    this.x = 11.5
                    this.y = this.stepsWithOffset - 8 - 0.5;
                }
            }
            if (this.stepsWithOffset > 20 && this.stepsWithOffset < 30) {
                this.y = 11.5;
                this.x = 12 - (this.stepsWithOffset - 19)
            }
            if (this.stepsWithOffset > 29) {
                this.x = 0.5;
                if (this.stepsWithOffset === 30) {
                    this.x = 0.5;
                    this.y = 12 - (this.stepsWithOffset - 30) - 0.5
                } else {
                    this.y = 12 - (this.stepsWithOffset - 29)
                }
            }
            let tmpSteps = (this.steps - this.animationOffset + 40) % 40;

            if (this.inJail === true && this.animationOffset === 0) {
                this.x = 11.25;
                this.y = 0.70;
            }

            for (let i = 0; i < board.boardPieces[tmpSteps].currentPlayer.length; i++) {
                if (board.boardPieces[tmpSteps].currentPlayer[i] === this) {
                    if (tmpSteps === 0) {
                        if (i < Math.floor(board.boardPieces[tmpSteps].currentPlayer.length / 2)) {
                            this.x += 0.8
                            this.y -= ((i) / 1.4)
                        } else {
                            this.y -= ((i - Math.floor(board.boardPieces[tmpSteps].currentPlayer.length / 2)) / 1.4)
                        }
                    } else {
                        if (Math.floor(this.stepsWithOffset / 10) === 0) {
                            this.y -= ((i) / 1.4)
                        }
                        if (Math.floor(this.stepsWithOffset / 10) === 1) {
                            this.x += ((i) / 1.4)
                        }
                        if (Math.floor(this.stepsWithOffset / 10) === 2) {
                            this.y += ((i) / 1.4)
                        }
                        if (Math.floor(this.stepsWithOffset / 10) === 3) {
                            this.x -= ((i) / 1.4)
                        }
                    }
                }
            }
            for (let i = 0; i < board.prisonExtra.currentPlayer.length; i++) {
                if (board.prisonExtra.currentPlayer[i] === this) {
                    this.y += i / 1.8
                    this.x -= i / 1.8
                }
            }
        }
        this.goToPrison = function () {
            if (this.steps >= 30 || this.steps < 10) {
                this.teleportTo(10, false, false);
            } else {
                this.teleportTo(-10, false, false);
            }
            this.inJail = true;
            this.rolls = true;
        }
        this.getOutOfJail = function (type, sendToServer = true) {
            if (Api.online && sendToServer) {
                Api.exitJail(type);
                return;
            }

            let self = this;
            board.prisonExtra.currentPlayer.forEach(function (e, i) {
                if (e == self) {
                    board.prisonExtra.currentPlayer.splice(i, 1)
                }
            })
            self.inJail = false;
            self.steps = 10;
            self.timeInJail = 0;
            board.boardPieces[10].playerStep(true, self);
        }
        this.teleportTo = function (step, getMoney = true, sendToServer = true) {
            if (Api.online && sendToServer) {
                Api.moveTo(step);
                return;
            }

            let oldStep = this.steps;
            let direction = 1;
            if (step < 0) {
                direction = -1;
                step = -step
            }

            this.steps = step % 40;

            var dicesum = this.steps - oldStep;
            if (this.steps < oldStep) dicesum += 40;

            this.animateSteps(oldStep, this.steps, dicesum, direction, getMoney);
        }
        this.animateSteps = function (from, to, dicesum, direction, getMoney) {

            let self = this;
            clearInterval(this.timer)
            if (to < from && direction === 1) {
                to += 40
            }
            let to2 = to
            if (direction < 0) {
                this.animationOffset = -(from - to);
            } else {
                this.animationOffset = to - from;
            }

            to = to % 40
            board.showDices = true;
            self.timer = setInterval(function () {
                if(board.currentShowingCard == undefined){
                    if (self.animationOffset <= 0 && direction === 1 || self.animationOffset >= 0 && direction === -1) {
                        clearInterval(self.timer);

                        board.boardPieces.forEach(function (b, i2) {
                            b.currentPlayer.forEach(function (d, i3) {
                                if (d === self) {
                                    b.currentPlayer.splice(i3, 1)
                                }
                            })
                        })

                        if (to === 0) {
                            board.boardPieces[0].playerStep(false, self);
                        } else {
                            if (self.inJail === true) {
                                board.prisonExtra.playerStep(true, self);
                            } else {
                                board.boardPieces[to].playerStep(false, self, dicesum);
                            }
                        }
                        if (to === 30) {
                            board.currentShowingCard = new CurrentCard(1, "special")
                            board.currentShowingCard.onContinue = function () { self.goToPrison() };
                        }
                        board.showDices = false;

                    } else {
                        board.boardPieces.forEach(function (b, i2) {
                            b.currentPlayer.forEach(function (d, i3) {
                                if (d === self) {
                                    b.currentPlayer.splice(i3, 1)
                                }
                            })
                        })

                        self.animationOffset -= 1 * direction;
                        playSound(sounds.movement, 1)
                        if (((to - self.animationOffset) % 40 - 1) === -1 && getMoney) {
                            board.boardPieces[0].playerStep(true, self);
                            board.currentShowingCard = new CurrentCard(0,"bankcheck",{to:self.name,amount:200,reason:"Inkomst",from:"Banken"})
                            board.currentShowingCard.onContinue = function(){
                                self.playerBorder.startMoneyAnimation(200)
                                self.money += 200;
                                self.totalEarned += 200;
                            }
                            self.laps++;
                        } else {
                            board.boardPieces[(to2 - self.animationOffset) % 40].playerStep(true, self);
                        }


                    }
                }
                
            }, speeds.stepSpeed);
            intervals.push(self.timer)
        }

        this.animateDice = function (dice1, dice2, callback) {

            board.animateDices = true;

            let counter = speeds.diceSpeed.counter;
            playSound(sounds.dice, 1)
            var myFunction = function () {
                board.randomizeDice();
                board.dice1 = randomIntFromRange(1, 6)
                board.dice2 = randomIntFromRange(1, 6)
                counter *= speeds.diceSpeed.factor
                if (counter > speeds.diceSpeed.threshold) {
                    board.dice1 = dice1;
                    board.dice2 = dice2;
                    timeouts.push(setTimeout(() => {
                        board.animateDices = false;
                        callback()
                    }, speeds.diceSpeed.delay));
                } else {
                    timeouts.push(setTimeout(myFunction, counter));
                }
            }
            timeouts.push(setTimeout(myFunction, counter));
        }

        this.rollDice = function () {
            if (this.negative === false) {
                this.hasStepped = false;
                if (this.inJail === false) {
                    if (this.rolls === false) {
                        let dice1 = randomIntFromRange(1, 6);
                        let dice2 = randomIntFromRange(1, 6);
                        this.numberOfRolls++;
                        if (dice1 === dice2) {
                            this.rolls = false;
                        } else {
                            this.rolls = true;
                        }

                        this.diceSum = dice1 + dice2;
                        this.dice1 = dice1
                        this.dice2 = dice2

                        let self = this;
                        this.animateDice(dice1, dice2, function () {
                            if (self.numberOfRolls === 3 && dice1 === dice2) {
                                board.currentShowingCard = new CurrentCard(2, "special")
                                board.currentShowingCard.onContinue = function () { self.goToPrison(); }
                                return;
                            }
                            board.animateDices = false;
                            self.teleportTo((self.steps + dice1 + dice2) % 40);
                            board.nextPlayerButton.visible = true;
                        })
                    }
                }
            }

        }

    }
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        };
    };
    return undefined;
}

const measureText = (() => {
    var data, w, size = 120; // for higher accuracy increase this size in pixels.
    const isColumnEmpty = x => {
        var idx = x, h = size * 2;
        while (h--) {
            if (data[idx]) { return false }
            idx += can.width;
        }
        return true;
    }
    const can = document.createElement("canvas");
    const ctx = can.getContext("2d");
    return ({ text, font, baseSize = size }) => {
        size = baseSize;
        can.height = size * 2;
        font = size + "px " + font;
        if (text.trim() === "") { return }
        ctx.font = font;
        can.width = (w = ctx.measureText(text).width) + 8;
        ctx.font = font;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(text, 0, size);
        data = new Uint32Array(ctx.getImageData(0, 0, can.width, can.height).data.buffer);
        var left, right;
        var lIdx = 0, rIdx = can.width - 1;
        while (lIdx < rIdx) {
            if (left === undefined && !isColumnEmpty(lIdx)) { left = lIdx }
            if (right === undefined && !isColumnEmpty(rIdx)) { right = rIdx }
            if (right !== undefined && left !== undefined) { break }
            lIdx += 1;
            rIdx -= 1;
        }
        data = undefined; // release RAM held
        can.width = 1; // release RAM held
        return right - left >= 1 ? {
            left, right, rightOffset: w - right, width: right - left,
            measuredWidth: w, font, baseSize
        } : undefined;
    }
})();

Date.prototype.today = function () {
    return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "/" + this.getFullYear();
}
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
}

function monthToText(month){
    if(month === 0){
        return "Januari"
    }
    if(month === 1){
        return "Februari"
    }
    if(month === 2){
        return "Mars"
    }
    if(month === 3){
        return "April"
    }
    if(month === 4){
        return "Maj"
    }
    if(month === 5){
        return "Juni"
    }
    if(month === 6){
        return "Juli"
    }
    if(month === 7){
        return "Augusti"
    }
    if(month === 8){
        return "September"
    }
    if(month === 9){
        return "Oktober"
    }
    if(month === 10){
        return "November"
    }
    if(month === 11){
        return "December"
    }
}

function numberToText(number){
    let siffror = ["EN","ETT","TVÅ","TRE","FYRA","FEM","SEX","SJU","ÅTTA","NIO","TIO","ELVA","TOLV","TRETTON","FJORTON","FEMTON","SEXTON","SJUTTON","ARTON","NITTON","TJUGO","TRETTIO","FYRTIO","FEMTIO","SEXTIO","SJUTTIO","ÅTTIO","NITTIO","HUNDRA","TUSEN"]
    if(number < 21){
        return siffror[number];
    }else if(number < 100){
        if(number - Math.floor(number/10) * 10 == 1 ){
            if((number - Math.floor(number/10) * 10) !== 0){
                return (siffror[Math.floor(number/10) + 18] + siffror[number - Math.floor(number/10) * 10 - 1])
            }else{
                return (siffror[Math.floor(number/10) + 18])
            }
        }else{
            if(number - Math.floor(number/10) * 10 == 0 ){
                return (siffror[Math.floor(number/10) + 18])
            }else{
                return (siffror[Math.floor(number/10) + 18] + siffror[number - Math.floor(number/10) * 10])
            }
        }
    }else if(number == 100){
        return "ETT" + siffror[28]
    }else if(number < 1000 && JSON.parse(JSON.stringify(number).slice(1,2)) < 2){
        if(JSON.parse(JSON.stringify(number).slice(1,2)) !== 0){
            return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[28] + siffror[JSON.parse(JSON.stringify(number).slice(1,3))]
        }else if(JSON.parse(JSON.stringify(number).slice(2,3)) === 0){
            return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[28]
        }else if(JSON.parse(JSON.stringify(number).slice(2,3)) === 1){
            return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[28] + siffror[0]
        }else{
            return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[28] + siffror[JSON.parse(JSON.stringify(number).slice(2,3))]
        }
    }else if(number < 1000){
        if(JSON.parse(JSON.stringify(number).slice(2,3)) == 0){
            return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[28] + siffror[JSON.parse(JSON.stringify(number).slice(1,2)) + 18]
        }else{
            return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[28] + siffror[JSON.parse(JSON.stringify(number).slice(1,2)) + 18] + siffror[JSON.parse(JSON.stringify(number).slice(2,3))]
        }
    }else if(number == 1000){
        return "ET" +siffror[29];
    }else if(number < 10000){
        if(JSON.parse(JSON.stringify(number).slice(1,2)) == 0){
            if(JSON.parse(JSON.stringify(number).slice(2,3)) < 2 && JSON.parse(JSON.stringify(number).slice(2,3) > 0) ){
                return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[29]+ siffror[JSON.parse(JSON.stringify(number).slice(2,4))]
            }else if(JSON.parse(JSON.stringify(number).slice(2,3)) < 2 && JSON.parse(JSON.stringify(number).slice(3,4)) == 0){
                return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[29];
            }else if(JSON.parse(JSON.stringify(number).slice(2,3)) < 2){
                return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[29]+ siffror[JSON.parse(JSON.stringify(number).slice(3,4))]
            }else if(JSON.parse(JSON.stringify(number).slice(3,4)) == 0){
                return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[29] + siffror[JSON.parse(JSON.stringify(number).slice(2,3)) + 18]
            }else{
                return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[29] + siffror[JSON.parse(JSON.stringify(number).slice(2,3)) + 18] + siffror[JSON.parse(JSON.stringify(number).slice(3,4))]
            }
        }else{
            if(number < 10000 && JSON.parse(JSON.stringify(number).slice(2,3)) < 2){
                if(JSON.parse(JSON.stringify(number).slice(2,3)) == 0){
                    return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[29] +siffror[JSON.parse(JSON.stringify(number).slice(1,2))] + siffror[28] + siffror[JSON.parse(JSON.stringify(number).slice(3,4))]
                }else{
                    return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[29] +siffror[JSON.parse(JSON.stringify(number).slice(1,2))] + siffror[28] + siffror[JSON.parse(JSON.stringify(number).slice(2,4))]
                }
            }else if(JSON.parse(JSON.stringify(number).slice(3,4)) == 0){
                return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[29] + siffror[JSON.parse(JSON.stringify(number).slice(1,2))] + siffror[28] + siffror[JSON.parse(JSON.stringify(number).slice(2,3)) + 18]
            }else{
                return siffror[JSON.parse(JSON.stringify(number).slice(0,1))] + siffror[29] + siffror[JSON.parse(JSON.stringify(number).slice(1,2))] + siffror[28] + siffror[JSON.parse(JSON.stringify(number).slice(2,3)) + 18] + siffror[JSON.parse(JSON.stringify(number).slice(3,4))]
            }
        }
        
    }
}

// gammal funktion från sudoku
function timeToText(value){
    value = value/100
    returnValue = ""
    if(Math.floor(value/6000) > 9){
        returnValue += Math.floor(value/6000) + ":" 
    }else if(Math.floor(value/6000) > 0){
        returnValue += "0"+Math.floor(value/6000) + ":" 
    }else{
        returnValue += "00:" 
    }
    if(Math.floor(value/100)%60 > 9){
        returnValue += Math.floor(value/100)%60 + ":" 
    }else if(Math.floor(value/100)%60 > 0){
        returnValue += "0"+Math.floor(value/100)%60 + ":" 
    }else{
        returnValue += "00:" 
    }
    if(Math.floor(value)%60 > 9){
        returnValue += Math.floor(value%60)
    }else if(Math.floor(value)%60 > 0){
        returnValue += "0"+Math.floor(value%60)
    }else{
        returnValue += "00" 
    }
    return returnValue;
}

init();

//Sortering och inläggning av namn
/*

function parseCSV(str) {
    const arr = [];
    let quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c+1];        // Current character, next character
        arr[row] = arr[row] || [];             // Create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  const upperCaseFirstLetter = string =>
 `${string.slice(0, 1).toUpperCase()}${string.slice(1)}`;
*/
//const lowerCaseAllWordsExceptFirstLetters = string =>
// string.replaceAll(/\S*/g, word =>
 // `${word.slice(0, 1)}${word.slice(1).toLowerCase()}`
 //);

/*
 let women;
 let men;

 String.prototype.replaceAtIndex = function(_index, _newValue) {
   return this.substr(0, _index) + _newValue + this.substr(_index + _newValue.length)
}

readTextFile("namn-med-minst-tva-barare-31-december-2022_20230228 - Tilltalsnamn kvinnor.csv", function(text){
   let tmp = parseCSV(text);
   let tmp2 = tmp.filter(e => e[0] != "")
   let tmp3 = tmp2.filter(e => e[1].length > 3)
   let tmp4 = tmp3.map(e => upperCaseFirstLetter(lowerCaseAllWordsExceptFirstLetters(e[0])))
   let tmp5 = tmp4.map(e => {
       if(e.includes("-")){
           let index = e.indexOf("-")
           let toReplace = e.charAt(index+1).toUpperCase()
           return e.replaceAtIndex(index+1,toReplace)
       }else{
           return e
       }
   })
   women = tmp5
});
readTextFile("namn-med-minst-tva-barare-31-december-2022_20230228 - Tilltalsnamn män.csv", function(text){
   let tmp = parseCSV(text);
   let tmp2 = tmp.filter(e => e[0] != "")
   let tmp3 = tmp2.filter(e => e[1].length > 3)
   let tmp4 = tmp3.map(e => upperCaseFirstLetter(lowerCaseAllWordsExceptFirstLetters(e[0])))
   let tmp5 = tmp4.map(e => {
       if(e.includes("-")){
           let index = e.indexOf("-")
           let toReplace = e.charAt(index+1).toUpperCase()
           return e.replaceAtIndex(index+1,toReplace)
       }else{
           return e
       }
   })
   men = tmp5
   
   
   //download("namn",JSON.stringify(men.concat(women)))
});


*/