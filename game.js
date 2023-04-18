var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");
canvas.id = "game"

var board;

var turn = 0;

var players = [];

const drawScale = 2;

const fastLoad = false;

var offsets = {
    x:Math.floor(window.innerWidth/2) - 832*drawScale/2,
    y:Math.floor(window.innerHeight/2) - 416*drawScale/2
}

var images = {
    part:{
        src:["./images/plates/brown","./images/plates/light_blue",
        "./images/plates/pink","./images/plates/orange",
        "./images/plates/red","./images/plates/yellow",
        "./images/plates/green","./images/plates/blue",
        "./images/plates/chance","./images/plates/chance2","./images/plates/chance3",
        "./images/plates/train", "./images/plates/water", "./images/plates/electric",
        "./images/plates/supertax","./images/plates/chest","./images/plates/incometax"
        ]
    },
    card:{
        src:["./images/cards/browncard1","./images/cards/browncard2","./images/cards/lightbluecard1","./images/cards/lightbluecard2","./images/cards/lightbluecard3"
            ,"./images/cards/pinkcard1","./images/cards/pinkcard2","./images/cards/pinkcard3","./images/cards/orangecard1","./images/cards/orangecard2","./images/cards/orangecard3"
            ,"./images/cards/redcard1","./images/cards/redcard2","./images/cards/redcard3","./images/cards/yellowcard1","./images/cards/yellowcard2","./images/cards/yellowcard3"
            ,"./images/cards/greencard1","./images/cards/greencard2","./images/cards/greencard3","./images/cards/bluecard1","./images/cards/bluecard2"
            ,"./images/cards/electricitycard","./images/cards/waterworkscard"
            ,"./images/cards/eaststation","./images/cards/northstation","./images/cards/centralstation","./images/cards/southstation"
        ]
    },
    corner:{
        src:["./images/corners/go","./images/corners/prison","./images/corners/parking","./images/corners/gotoprison"
        ]
    },
    player:{
        src:["./images/players/player","./images/players/player2","./images/players/player3","./images/players/player4",
        "./images/players/player5","./images/players/player6","./images/players/player7","./images/players/player8"
        ]
    },
    playerOverlay:{
        src:["./images/players/redowned","./images/players/pinkowned","./images/players/purpleowned","./images/players/blueowned",
        "./images/players/lightblueowned","./images/players/greenowned","./images/players/yellowowned","./images/players/orangeowned"
    ]
    },
    background:{
        src:["./images/static/insideboard","./images/static/realbackground"
        ]
    },
    house:{
        src:["./images/buildings/house","./images/buildings/hotel"
        ]
    },
    dice:{
        src:["./images/dices/dices"
        ]
    },
    buttons:{
        src:["./images/buttons/rolldice","./images/buttons/nextplayer",
        "./images/buttons/sellbutton","./images/buttons/mortgage","./images/buttons/arrowup","./images/buttons/arrowdown",
        "./images/buttons/buythislawn","./images/buttons/exitCard","./images/buttons/auction"
        ]
    },
    auction:{
        src:["./images/menus/auctionmenubackground","./images/buttons/auction+2","./images/buttons/auction+10","./images/buttons/auction+100","./images/menus/auctionloadingbar","./images/buttons/startauction"]
    }
};

var sounds = {
    dice:{
        type:"single",
        src:"./sounds/dice.mp3"
    },
    click:{
        type:"single",
        src:"./sounds/click.mp3"
    },
    release:{
        type:"single",
        src:"./sounds/release.mp3"
    },
    movement:{
        type:"multiple",
        src:"./sounds/movement/move-",
        amount:46
    }
}

var mouse = {
    x: 0,
    y: 0,
    realX: 0,
    realY: 0
}
const pieces = [{"name":"Start","img":0},{"name":"Brun 1","price":60,"rent":[2,10,30,90,160,250],"housePrice":50,"group":"Brown","img":0,"card":0},{"name":"Allmänning","type":"community Chest","img":15},{"name":"Brun 2","price":60,"rent":[4,20,60,180,320,450],"housePrice":50,"group":"Brown","img":0,"card":1},{"name":"Inkomstskatt","type":"income tax","img":16},{"name":"Södra stationen","price":200,"type":"station","img":11,"card":27},{"name":"Ljusblå 1","price":100,"rent":[6,30,90,270,400,550],"housePrice":50,"group":"light blue","img":1,"card":2},{"name":"Chans","type":"chance","img":10},{"name":"Ljusblå 2","price":100,"rent":[6,30,90,270,400,550],"housePrice":50,"group":"light blue","img":1,"card":3},{"name":"Ljusblå 3","price":120,"rent":[8,40,100,300,450,600],"housePrice":50,"group":"light blue","img":1,"card":4},{"name":"Fängelse","img":1},{"name":"Rosa 1","price":140,"rent":[10,50,150,450,625,750],"housePrice":100,"group":"pink","img":2,"card":5},{"name":"Elverket","price":150,"type":"utility","img":13,"card":22},{"name":"Rosa 2","price":140,"rent":[10,50,150,450,625,750],"housePrice":100,"group":"pink","img":2,"card":6},{"name":"Rosa 3","price":160,"rent":[12,60,180,500,700,900],"housePrice":100,"group":"pink","img":2,"card":7},{"name":"Östra Stationen","price":200,"type":"station","img":11,"card":24},{"name":"Orange 1","price":180,"rent":[14,70,200,550,750,950],"housePrice":100,"group":"orange","img":3,"card":8},{"name":"Allmänning","type":"community Chest","img":15},{"name":"Orange 2","price":180,"rent":[14,70,200,550,750,950],"housePrice":100,"group":"orange","img":3,"card":9},{"name":"Orange 3","price":200,"rent":[16,80,220,600,800,1000],"housePrice":100,"group":"orange","img":3,"card":10},{"name":"Fri parkering","img":2},{"name":"Röd 1","price":220,"rent":[18,90,250,700,875,1050],"housePrice":150,"group":"red","img":4,"card":11},{"name":"Chans","type":"chance","img":8},{"name":"Röd 2","price":220,"rent":[18,90,250,700,875,1050],"housePrice":150,"group":"red","img":4,"card":12},{"name":"Röd 3","price":240,"rent":[20,100,300,750,925,1100],"housePrice":150,"group":"red","img":4,"card":13},{"name":"Centralstationen","price":200,"type":"station","img":11,"card":26},{"name":"Gul 1","price":260,"rent":[22,110,330,800,975,1150],"housePrice":150,"group":"yellow","img":5,"card":14},{"name":"Gul 2","price":260,"rent":[22,110,330,800,975,1150],"housePrice":150,"group":"yellow","img":5,"card":15},{"name":"Vattenledningsverket","price":150,"type":"utility","img":12,"card":23},{"name":"Gul 3","price":280,"rent":[24,120,360,850,1025,1200],"housePrice":150,"group":"yellow","img":5,"card":16},{"name":"Gå till finkan","img":3},{"name":"Grön 1","price":300,"rent":[26,130,390,900,1100,1275],"housePrice":200,"group":"green","img":6,"card":17},{"name":"Grön 2","price":300,"rent":[26,130,390,900,1100,1275],"housePrice":200,"group":"green","img":6,"card":18},{"name":"Allmänning","type":"community Chest","img":15},{"name":"Grön 3","price":320,"rent":[28,150,450,1000,1200,1400],"housePrice":200,"group":"green","img":6,"card":19},{"name":"Norra stationen","price":200,"type":"station","img":11,"card":25},{"name":"Chans","type":"chance","img":9},{"name":"Blå 1","price":350,"rent":[35,175,500,1100,1300,1500],"housePrice":200,"group":"blue","img":7,"card":20},{"name":"Lyxskatt","price":-100,"img":14,"type":"tax"},{"name":"Blå 2","price":400,"rent":[50,200,600,1400,1700,2000],"housePrice":200,"group":"blue","img":7,"card":21}];

window.addEventListener("resize", e => {
    const SIZE = 416;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    offsets = {
        x:Math.floor(window.innerWidth/2) - SIZE*2*drawScale/2,
        y:Math.floor(window.innerHeight/2) - SIZE*drawScale/2
    }
})

canvas.addEventListener("mousemove",function(e){
    mouse = {
        x: e.offsetX - offsets.x,
        y: e.offsetY - offsets.y,
        realX: e.x,
        realY: e.y,
        offsetX: e.offsetX,
        offsety: e.offsetY,
    }
})

window.addEventListener("mousedown",function(e){
    if (board == undefined) return;

    board.boardPieces.forEach(function(piece){
        piece.click();
    });
    board.nextPlayerButton.click();
    board.rollDiceButton.click();
    board.cardCloseButton.click();
    board.buyButton.click();
    board.sellButton.click();
    board.mortgageButton.click();
    board.upgradeButton.click();
    board.downgradeButton.click();
    board.auctionButton.click();
    if(board.auction !== undefined){
        board.auction.addMoneyButton2.click()
        board.auction.addMoneyButton10.click()
        board.auction.addMoneyButton100.click()
        board.auction.startAuctionButton.click();
    }
})

window.addEventListener("keydown",function(e){
    if(e.keyCode === 27){
        board.currentCard = undefined;
    }
})


function preRender(imageObject){
    Object.entries(imageObject).forEach(image => {
        image[1].img = [];
        for(i=0;i<image[1].src.length;i++){
            image[1].img.push(new Image());

            image[1].img[i].src = image[1].src[i] + ".png";
            c.drawImage(image[1].img[i],0,0)
        }
    });
}
function loadSounds(soundObject){
    Object.entries(soundObject).forEach(sound => {
        if(sound[1].type === "single"){
            sound[1].sound = new Audio(sound[1].src)
        }
        if(sound[1].type === "multiple"){
            sound[1].sounds = []
            for(let i = 1; i<sound[1].amount; i++){
                if(i < 10){
                    sound[1].sounds.push(new Audio(sound[1].src + "0" + i + ".mp3"))
                }else{
                    sound[1].sounds.push(new Audio(sound[1].src + i + ".mp3"))
                }
            }
        }
    });
}
function drawRotatedImage(x,y,w,h,img,angle,mirrored,cropX,cropY,cropW,cropH){
    let degree = angle * Math.PI / 180;
    x += offsets.x;
    y += offsets.y;
    let middlePoint = {
        x: x + w/2,
        y: y + h/2
    };

    c.save();
    c.translate(middlePoint.x,middlePoint.y);
    c.rotate(degree);
    if(mirrored === true){
        c.scale(-1, 1);
    }
    c.drawImage(img, Math.floor(cropX), Math.floor(cropY), Math.floor(cropW), Math.floor(cropH), -Math.floor(w/2), -Math.floor(h/2), Math.floor(w), Math.floor(h));
    c.restore();
}

function drawRotatedText(x,y,text,font,angle,color,mirrored){
    let degree = angle * Math.PI / 180;
    x+= offsets.x;
    y+= offsets.y
    let middlePoint = {
        x:x,
        y:y
    };

    c.save();
    c.translate(middlePoint.x,middlePoint.y);
    c.rotate(degree);
    if(mirrored === true){
        c.scale(-1, 1);
    }
    c.font = font;
    c.fillStyle = color;
    c.textAlign = "center"
    c.fillText(text,Math.floor(0),Math.floor(0));
    c.restore();
}

function to_screen_coordinate(x,y){
    return {
        x: x*0.5+y*-0.5,
        y: x*0.25+y*0.25
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

function to_grid_coordinate(x,y) {
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
function detectCollition(x,y,w,h,x2,y2,w2,h2){
    if(x+w>x2 && x<x2+w2 && y+h>y2 && y<y2+h2){
            return true;
        };
};
function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && 
           !isNaN(parseFloat(str)) 
  }

function drawIsometricImage(x,y,img,mirror,cropX,cropY,cropW,cropH,offsetX,offsetY,sizeOveride){
    let scaleOfThis = drawScale;
    if(sizeOveride !== undefined){
        scaleOfThis = sizeOveride*drawScale;
    }
    drawRotatedImage(to_screen_coordinate(x*drawScale,y*drawScale).x + 832/2*drawScale - 64*drawScale + offsetX*drawScale,to_screen_coordinate(x*drawScale,y*drawScale).y + offsetY*drawScale,cropW*scaleOfThis,cropH*scaleOfThis,img,0,mirror,cropX,cropY,cropW,cropH)
}


function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
};

function playSound(sound,volume){
    if(sound.type === "single"){
        let myClonedAudio = sound.sound.cloneNode();
        myClonedAudio.volume = volume;
        myClonedAudio.play();
    }else{
        let myClonedAudio = sound.sounds[Math.floor(Math.random() * sound.sounds.length)].cloneNode();
        myClonedAudio.volume = volume;
        myClonedAudio.play();
    }

};

async function init(){
    document.body.appendChild(canvas);
    canvas.style.zIndex = -100;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    
    // Would be preferable to have the background rendered before all of the alerts,
    // as the white background isn't that nice to look at
    Api.online = location.search != "" ? true : confirm("Do you want to play online?");
    if (Api.online) {
        var serverURL = location.search == "" ? prompt("If you're the host, then start the server.\nAfter that everyone should be able to join in a LAN.\nEnter the address shown by the server") : atob(location.search.substring(1));
        history.replaceState(undefined, undefined, location.href.replace(location.search, ""));
        try {
            var interval = -1;
            document.body.addEventListener("start_game", (evt) => {
                var data = evt.detail;
                
                clearInterval(interval);
                document.getElementById("lobby").style.display = "none";
                
                data.players.forEach((player) => {
                    players.push(new Player(images.player.img[player.colorIndex], player.colorIndex, player.name, false));
                });
                
                if (Api.currentPlayer == 0) {
                    board.rollDiceButton.visible = true;
                    board.nextPlayerButton.visible = false;
                }

                update();
            });

            document.body.addEventListener("join_info", (evt) => {
                var data = evt.detail;
                var countdownElement = document.querySelector("#lobby>center");

                Api.currentPlayer = data.thisPlayer;
                
                if (data.countdown == -1) {
                    countdownElement.innerText = "Waiting for more players";
                    countdownElement.className = "waiting";
                    
                    function onPlayerJoin() {
                        document.body.removeEventListener("player_joined", onPlayerJoin);
                        var startTime = performance.now();
                        var duration = 30 * 1000;
                        
                        countdownElement.className = "countdown";
                        interval = setInterval(() => { countdownElement.innerText = Math.floor((duration - (performance.now() - startTime)) / 1000); }, 100);
                    }
                    
                    document.body.addEventListener("player_joined", onPlayerJoin);
                } else {
                    var startTime = performance.now() - data.countdown;
                    var duration = 30 * 1000;
                    
                    countdownElement.className = "countdown";
                    interval = setInterval(() => { countdownElement.innerText = Math.floor((duration - (performance.now() - startTime)) / 1000); }, 100);
                }
            });

            
            document.body.addEventListener("move_event", (evt) => players[evt.detail.player].teleportTo(evt.detail.steps, false));

            document.body.addEventListener("new_turn_event", (evt) => {
                turn = evt.detail.id;
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
                board.auction.time = 472;


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
                    board.boardPieces[player.steps].doChanceCard(data.id);
                } else {
                    board.boardPieces[player.steps].doCommunityChest(data.id);
                }
            });
            
            await Api.openWebsocketConnection(serverURL);

            // Lobby
            // 1 minute after the first player joined (or when there's 8 players), start the game
            // Meanwhile show some menu with the other players and a countdown for how long there's left until the game starts, maybe some settings should be available to set for the host
        } catch(err) {
            alert("IMPORTANT\nYou will now be redirected to another page\nIt's important that you click on Advanced...>Accept the Risk and Continue\nIf you don't, you won't be able to connect to the game");
            location = "https://" + serverURL + "/" + btoa(location.href);
        }
    }

    preRender(images);
    loadSounds(sounds);

    board = new Board();

    if (!Api.online) {
        document.getElementById("lobby").style.display = "none";
        let playerAmount = 0;
        let botAmount = 0;

        let playerImages = [0,1,2,3,4,5,6,7]
    
        if (fastLoad === true){
            playerAmount = 2;
            botAmount = -1
        }

        while(playerAmount == 0){
            let promptText = prompt("Hur många spelare?") 
            if(isNumeric(promptText)){
                if(JSON.parse(promptText) < 1 || JSON.parse(promptText) > 8){
                    playerAmount = 0;
                }else{
                    playerAmount = JSON.parse(promptText)
                }
            }else{
                playerAmount = 0;
            }
        }

        while(botAmount == 0){
            if(playerAmount < 8) {
                let promptText = prompt("Hur många bots?");
                if(isNumeric(promptText)) {
                    if(JSON.parse(promptText) <= 8-playerAmount){
                        botAmount = JSON.parse(promptText)
                    }else{
                        botAmount = 0;
                    }
                }else{
                    botAmount = 0;
                }
            } else {
                botAmount = -1
            }
        }
        
        // Add all players
        for(i = 0; i < playerAmount; i++){
            let random = randomIntFromRange(0,playerImages.length-1)
            let playername = "";
            if(fastLoad === true){
                playername = "Spelare " + (i+1);
            }
            while(playername == ""){
                playername = prompt("Vad heter spelare " + (i+1) + "?")
                if(playername.length > 15 || playername.length < 2){
                    playername = ""
                }
            }
            players.push(new Player(images.player.img[playerImages[random]],playerImages[random],playername,false))
            playerImages.splice(random,1)
        }

        // Add all bots
        for(i = 0; i < botAmount; i++){
            let random = randomIntFromRange(0,playerImages.length-1)
            players.push(new Player(images.player.img[playerImages[random]],playerImages[random],"Bot " + (i+1),true))
            playerImages.splice(random,1)
        }

        update();
    }
}

function update(){
    requestAnimationFrame(update);
    c.imageSmoothingEnabled = false;

    c.clearRect(0,0,canvas.width,canvas.height);
    showBackground();

    c.fillStyle = "white";
    c.font = "80px calibri";
    players.forEach(function(player,i,a) { 
        if(i === 0){
            c.textAlign = "left";
            c.fillText(player.name + ": " + player.money + "kr", 10, 80);
        }
        if(i === 1){
            c.textAlign = "right";
            c.fillText(player.name + ": " + player.money + "kr", canvas.width-10, 80);
        }
        if(i === 2){
            c.textAlign = "left";
            c.fillText(player.name + ": " + player.money + "kr", 10, canvas.height-30);
        }
        if(i === 3){
            c.textAlign = "right";
            c.fillText(player.name + ": " + player.money + "kr", canvas.width-10, canvas.height-30);
        }
        if(i === 4){
            c.textAlign = "left";
            c.fillText(player.name + ": " + player.money + "kr", 10, 160);
        }
        if(i === 5){
            c.textAlign = "right";
            c.fillText(player.name + ": " + player.money + "kr", canvas.width-10, 160);
        }
        if(i === 6){
            c.textAlign = "left";
            c.fillText(player.name + ": " + player.money + "kr", 10, canvas.height-110);
        }
        if(i === 7){
            c.textAlign = "right";
            c.fillText(player.name + ": " + player.money + "kr", canvas.width-10, canvas.height-110);
        }
    })

    c.fillStyle = "black";
    c.font = "50px Brush Script MT";
    c.textAlign = "center";
    c.fillText("Just nu:" + players[turn].name, canvas.width/2, canvas.height/2 + 50);
    board.update();
    
}

function showBackground(){
    for(let x = -2; x < 4; x++){
        for(let y = -2; y < 4; y++){
            drawIsometricImage(-352*2 + 832*x,+832*y,images.background.img[1],false,0,0,832,416,0,0)

        }
    }
    drawIsometricImage(-92,352,images.background.img[0],false,0,0,572,286,0,0)
}

class Board{
    constructor(){
        this.dice1 = 0;
        this.dice2 = 0;
        this.dice1Type = 0;
        this.dice2Type = 0;
        this.boardPieces = [];
        this.prisonExtra = new BoardPiece(-1,[])
        this.showDices = false;
        this.animateDices = false;
        this.win = false;
        this.auction = undefined;
        this.rollDiceButton = new Button(10,250,images.buttons.img[0],() => { players[turn].rollDice(); board.nextPlayerButton.visible = true; },107,23)
        this.nextPlayerButton = new Button(10,250,images.buttons.img[1],() => { players[turn].rollDice(); board.nextPlayerButton.visible = false; },107,23)

        this.rollDiceButton.visible = Api.online && Api.currentPlayer == 0;
        this.nextPlayerButton.visible = Api.online && Api.currentPlayer == 0;

        this.currentCard = undefined;
        this.cardCloseButton = new Button(174,43,images.buttons.img[7],function(){board.currentCard = undefined;},18,18)
        this.sellButton = new Button(130,300,images.buttons.img[2],function(){
            if(board.currentCard.mortgaged === false){
                players[turn].money+= board.currentCard.piece.price/2
            }
            board.currentCard.owner = undefined;
        },40,40);

        this.mortgageButton = new Button(80,300,images.buttons.img[3],function(){
            if(board.currentCard.mortgaged === true){
                board.currentCard.mortgaged = false;
                players[turn].money -= (board.currentCard.piece.price/2)*1.1
            }else{
                board.currentCard.mortgaged = true;
                players[turn].money += board.currentCard.piece.price/2
            }
        },40,40);

        this.upgradeButton = new Button(5,300,images.buttons.img[4],function(){
            board.currentCard.level++;
            board.currentCard.owner.money -= board.currentCard.piece.housePrice;
        },40,40);

        this.downgradeButton = new Button(-45,300,images.buttons.img[5],function(){
            board.currentCard.level--;
            board.currentCard.owner.money += board.currentCard.piece.housePrice/2;
        },40,40);

        this.buyButton = new Button(-43,300,images.buttons.img[6],function(){
            if (Api.online) {
                Api.tilePurchased(board.currentCard);
                return;
            }

            players[turn].money -= board.currentCard.piece.price;
            board.currentCard.owner = players[turn];
            players[turn].ownedPlaces.push(board.currentCard);
            board.currentCard = undefined;
            board.buyButton.visible = false;
        },97,40);

        this.auctionButton = new Button(-43 + 117,300,images.buttons.img[8],function(){
            if (Api.online) {
                Api.auctionShow(board.currentCard);
                return;
            }

            board.auction = new Auction(board.currentCard)
            board.currentCard = undefined;
            board.buyButton.visible = false;
            board.auctionButton.visible = false;
        },97,40);

            for(let n = 0; n < 40; n++){
                if(n%10 === 0){
                    this.boardPieces.push(new BoardPiece(n,images.corner.img))
                }else{
                    this.boardPieces.push(new BoardPiece(n,images.part.img))
                }
        }

        this.update = function () {
            this.boardPieces.forEach(g => g.update())
            this.showDice()
            this.rollDiceButton.draw();
            this.nextPlayerButton.draw();
            this.boardPieces.forEach(g => g.drawHouses())
            if(this.win === false){ this.boardPieces.forEach(g => {
                if(g.side == 0 || g.side === 3){
                    g.currentPlayer.forEach(p => p.update())
                }else{
                    for(let i = (g.currentPlayer.length-1); i>-1; i--){                        
                        g.currentPlayer[i].update()
                    }
                }
            }
                ) 
            }
            this.prisonExtra.currentPlayer.forEach(p => p.update())
            this.showCard();
            this.fixCursor();
            if(this.auction !== undefined){
                this.auction.update();
            }
        }  

        this.fixCursor = function (){
            try{
                if(this.rollDiceButton.hover || this.nextPlayerButton.hover || this.cardCloseButton.hover || this.sellButton.hover || this.mortgageButton.hover 
                    || this.upgradeButton.hover || this.downgradeButton.hover || this.buyButton.hover|| this.auctionButton.hover|| 
                    this.auction.addMoneyButton2.hover || this.auction.addMoneyButton10.hover || this.auction.addMoneyButton100.hover){
                    canvas.style.cursor = "pointer"
                }else{
                    canvas.style.cursor = "auto"
                }
            }catch{
                canvas.style.cursor = "auto"
            }
            
        }
        this.randomizeDice = function () {
            this.dice1Type = randomIntFromRange(0,3);
            this.dice2Type = randomIntFromRange(0,3);
        }
        this.showCard = function (){
            if(this.currentCard !== undefined){
                drawIsometricImage(0,0,images.card.img[this.currentCard.piece.card],false,0,0,images.card.img[this.currentCard.piece.card].width,images.card.img[this.currentCard.piece.card].height,-images.card.img[this.currentCard.piece.card].width/4,images.card.img[this.currentCard.piece.card].height/7.5,1)
                this.cardCloseButton.draw();
                c.fillStyle = "black";
                c.textAlign = "center";
                c.font ="20px Brush Script MT";
                
                if(this.currentCard.owner !== undefined){
                    if(this.currentCard.piece.type !== "utility" && this.currentCard.piece.type !== "station"){
                        c.fillText("Ägare: " + this.currentCard.owner.name,canvas.width/2,canvas.height/2-200)
                    }else{
                        c.fillText("Ägare: " + this.currentCard.owner.name,canvas.width/2,canvas.height/2-153)
                    }


                    if(this.currentCard.owner === players[Api.online ? Api.currentPlayer : turn]){
                        this.cardCloseButton.visible = true;
                        this.sellButton.draw();
                        this.sellButton.visible = true;
                        this.mortgageButton.draw();
                        this.mortgageButton.visible = true;
                        if(this.currentCard.piece.type === "utility" || this.currentCard.piece.type === "station"){
                            this.sellButton.x = 80;
                            this.mortgageButton.x = 5;
                            this.upgradeButton.visible = false;
                            this.downgradeButton.visible = false;
                        }else{
                            this.sellButton.x = 130;
                            this.mortgageButton.x = 80;
                            this.upgradeButton.draw()
                            this.upgradeButton.visible = true;
                            this.downgradeButton.draw();
                            this.downgradeButton.visible = true;
                        }
                        
                        this.buyButton.visible = false;
                        let ownAll = true;
                        for(let i = 0; i<board.boardPieces.length; i++){
                            if(board.boardPieces[i] !== this.currentCard){
                                if(board.boardPieces[i].piece.group === this.currentCard.piece.group){
                                    if(this.currentCard.owner !== board.boardPieces[i].owner){
                                        ownAll = false;
                                    }
                                }
                            }
                        }
                        if(this.currentCard.level < 5 && this.currentCard.piece.housePrice !== undefined && ownAll === true){
                                this.upgradeButton.disabled = false;
                        }else{
                            this.upgradeButton.disabled = true; 
                        }   
                        if(this.currentCard.level > 0){
                            this.downgradeButton.disabled = false;
                        }else{
                            this.downgradeButton.disabled = true;
                        }
                        if(this.currentCard.mortgaged === true && players[turn].money <= ((this.currentCard.piece.price/2)*1.1)){
                            this.mortgageButton.disabled = true;
                        }else{
                            this.mortgageButton.disabled = false;
                        }
                        
                    }
                }else{
                    this.cardCloseButton.visible = true;

                    if(this.currentCard === board.boardPieces[(players[Api.online ? Api.currentPlayer : turn].steps)] && this.auction === undefined){
                        this.buyButton.draw();
                        this.buyButton.visible = true;
                        this.cardCloseButton.visible = false;
                        this.auctionButton.draw();
                        this.auctionButton.visible = true;
                        this.mortgageButton.visible = false;
                        this.sellButton.visible = false;
                        this.downgradeButton.visible = false;
                        this.upgradeButton.visible = false;

                        if(this.currentCard.piece.type === "station"){
                            this.buyButton.y = 310;
                            this.auctionButton.y = 310;
                        }else{
                            this.buyButton.y = 300;
                            this.auctionButton.y = 300;
                        }
                        if(players[turn].money >= this.currentCard.piece.price){
                            this.buyButton.disabled = false;
                        }else{
                            this.buyButton.disabled = true;
                        }
                    }else{
                        
                        this.buyButton.visible = false;
                        this.auctionButton.visible = false;
                    }
                }
                this.nextPlayerButton.visible = false;
                this.rollDiceButton.visible = false;
                if(this.currentCard.mortgaged === true){
                    drawRotatedText(canvas.width/2 + 50,canvas.height/2 - 100,"Intecknad","150px Brush Script MT",45,"black",false)
                }
            }else{
                this.cardCloseButton.visible = true;
            }
            
        }

        this.showDice = function () {
            if(players[turn].animationOffset > 0 ||this.showDices === true || this.animateDices === true){
                drawIsometricImage(500,500,images.dice.img[0],false,this.dice1Type*64,(this.dice1-1)*64,64,64,0,0)
                drawIsometricImage(550,400,images.dice.img[0],false,this.dice2Type*64,(this.dice2-1)*64,64,64,0,0)
                this.nextPlayerButton.visible = false;
                this.rollDiceButton.visible = false;
            }else{
                if (Api.online && turn != Api.currentPlayer) return;

                if(players[turn].rolls === false){
                    if(players[turn].bot === undefined && this.auction === undefined){
                        this.rollDiceButton.visible = true;
                        this.nextPlayerButton.visible = false;
                    }else{
                        this.rollDiceButton.visible = false;
                        this.nextPlayerButton.visible = false;
                    }
                }else{
                    if(players[turn].bot === undefined && this.auction === undefined){
                        this.rollDiceButton.visible = false;
                        this.nextPlayerButton.visible = true;
                    }else{
                        this.rollDiceButton.visible = false;
                        this.nextPlayerButton.visible = false;
                    }
                }
                
            }
        }
    }
}

class Auction{
    constructor(card) {
        this.card = card;
        this.turn = 0;
        this.auctionMoney = 0;
        this.time = 472;
        this.started = false;
        this.timer = undefined;
        this.playerlist = [...players];


        this.addMoneyButton2 = new Button(-150,280,images.auction.img[1],function(){     
            board.auction.addMoney(2);
        },54,54,false)
        this.addMoneyButton10 = new Button(-60,280,images.auction.img[2],function(){
            board.auction.addMoney(10);
        },54,54,false)
        this.addMoneyButton100 = new Button(30,280,images.auction.img[3],function(){
            board.auction.addMoney(100);
        },54,54,false)
        this.startAuctionButton = new Button(-150,220,images.auction.img[5],function(){
            if (Api.online) {
                Api.auctionStart(board.auction.card);
                return;
            }
            board.auction.started = true;
            board.auction.timer = setInterval(function(){
                board.auction.time--;
            },10);
        },240,40,false)
        
        this.draw = function(){
            drawIsometricImage(0,0,images.card.img[card.piece.card],false,0,0,images.card.img[this.card.piece.card].width,images.card.img[this.card.piece.card].height,images.card.img[this.card.piece.card].width/3,images.card.img[this.card.piece.card].height/7.5,1)
            drawIsometricImage(0,0,images.auction.img[0],false,0,0,images.auction.img[0].width,images.card.img[this.card.piece.card].height,-images.card.img[this.card.piece.card].width/1.5,images.card.img[this.card.piece.card].height/7.5,1)
            c.fillStyle = "black";
            c.font = "80px calibri";
            c.textAlign = "center";
            c.fillText(this.auctionMoney + "kr", canvas.width/2-190, canvas.height/2 - 75);
            c.font = "80px calibri";
            c.fillText(this.playerlist[this.turn].name, canvas.width/2-190, canvas.height/2 - 150);
            
            if(this.started){
                if ((!Api.online && this.playerlist[this.turn].bot === undefined) || (Api.online && Api.currentPlayer == this.playerlist[this.turn].colorIndex)) {
                    this.startAuctionButton.visible = false;
                    this.addMoneyButton2.visible = true;
                    this.addMoneyButton2.draw();
                    this.addMoneyButton10.visible = true;
                    this.addMoneyButton10.draw();
                    this.addMoneyButton100.visible = true;
                    this.addMoneyButton100.draw();
                }
                
                drawIsometricImage(0,0,images.auction.img[4],false,0,30,240,30,-150,220,1)
                if(this.time > 472){
                    this.time = 472
                }
                c.fillStyle = "white"
                if(this.time > 466){
                    c.fillRect(canvas.width/2-422,canvas.height/2 + 28,2,52)
                }
                if(this.time > 468){
                    c.fillRect(canvas.width/2-424,canvas.height/2 + 30,2,48)
                }
                if(this.time > 470){
                    c.fillRect(canvas.width/2-426,canvas.height/2 + 32,2,44)
                }
                if(this.time < 466 && this.time >0){
                    c.fillRect(canvas.width/2+44,canvas.height/2 + 26,-this.time + 3,56)
                }else if(this.time > 0){
                    c.fillRect(canvas.width/2+44,canvas.height/2 + 26,-467 + 3,56)
                }
                if(this.time > -2){
                    c.fillRect(canvas.width/2 + 44,canvas.height/2 + 28,2,52)
                }
                if(this.time > -4){
                    c.fillRect(canvas.width/2+ 46,canvas.height/2 + 30,2,48)
                }
                if(this.time > -6){
                    c.fillRect(canvas.width/2+ 48,canvas.height/2 + 32,2,44)
                }
                if(this.time < -6){
                    if (Api.online && this.playerlist[this.turn].colorIndex == Api.currentPlayer) Api.auctionBid(this.card, -1, true);
                    
                    this.playerlist.splice(this.playerlist.indexOf(this.playerlist[this.turn]),1)
                    this.turn = (this.turn)%this.playerlist.length;
                    this.time = 472;
                    if(this.playerlist.length === 1){
                        for(let i = 0; i<players.length; i++){
                            if(this.playerlist[0].colorIndex == players[i].colorIndex){
                                clearInterval(board.auction.timer)
                                players[i].money -= this.auctionMoney;
                                board.auction.card.owner = players[i];
                                players[i].ownedPlaces.push(this.card);
                                board.currentCard = undefined;
                                board.buyButton.visible = false;
                                board.auction = undefined;
                            }
                        }
                        
                    }
                }
            }else{
                if (Api.online) {
                    this.startAuctionButton.visible = Api.currentPlayer == turn;
                } else {
                    this.startAuctionButton.visible = true;
                }
                
                this.startAuctionButton.draw();
            }
        }

        this.update = function() {
            if (Api.online) {
                this.addMoneyButton2.disabled = players[Api.currentPlayer].money < this.auctionMoney + 2;
                this.addMoneyButton10.disabled = players[Api.currentPlayer].money < this.auctionMoney + 10;
                this.addMoneyButton100.disabled = players[Api.currentPlayer].money < this.auctionMoney + 100;
            } else {
                this.addMoneyButton2.disabled = this.playerlist[this.turn].money < this.auctionMoney + 2;
                this.addMoneyButton10.disabled = this.playerlist[this.turn].money < this.auctionMoney + 10;
                this.addMoneyButton100.disabled = this.playerlist[this.turn].money < this.auctionMoney + 100;
            }
            this.draw();
        }

        this.addMoney = function(money) {
            if (Api.online) {
                Api.auctionBid(this.card, this.auctionMoney + money, false);
                return;
            }

            this.auctionMoney += money;
            this.turn = (this.turn+1) % this.playerlist.length;
            this.time = 472;
        }
    }
}

class Button{
    constructor(x,y,img,onClick,w,h,showBorder){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img = img;
        this.onClick = onClick
        this.visible = false;
        this.disabled = false;
        this.hover = false;
        this.showBorder = showBorder;
        this.draw = function(){
            
            if(this.visible && this.img !== undefined){
                if(!this.disabled){
                    
                    if(detectCollition(canvas.width/2 + this.x*drawScale - 64*drawScale,canvas.height/2 + this.y*drawScale - 208*drawScale,this.w*drawScale,this.h*drawScale,mouse.realX,mouse.realY,1,1)){
                        if(this.img.width < this.w*2){
                            drawIsometricImage(0,0,this.img,false,0,0,this.w,this.h,this.x,this.y)
                        }else{
                            drawIsometricImage(0,0,this.img,false,this.w,0,this.w,this.h,this.x,this.y)
                        }
                        this.hover = true;
                    }else{
                        this.hover = false;
                        drawIsometricImage(0,0,this.img,false,0,0,this.w,this.h,this.x,this.y)
                    }
                }else{
                    this.hover = false;
                    drawIsometricImage(0,0,this.img,false,this.w*2,0,this.w,this.h,this.x,this.y)
                }
                
            }else if(this.visible){
                if(detectCollition(canvas.width/2 + this.x*drawScale - 64*drawScale,canvas.height/2 + this.y*drawScale - 208*drawScale,this.w*drawScale,this.h*drawScale,mouse.realX,mouse.realY,1,1)){
                    this.hover = true;
                }else{
                    this.hover = false;
                }
            }
            if(showBorder){
                c.strokeStyle = "black";
                c.strokeRect(canvas.width/2 + this.x*drawScale - 64*drawScale,canvas.height/2 + this.y*drawScale - 208*drawScale,this.w*drawScale,this.h*drawScale)
            }
        }
        this.click = function(){
            if(this.visible && !this.disabled){
                if(detectCollition(canvas.width/2 + this.x*drawScale - 64*drawScale,canvas.height/2 + this.y*drawScale - 208*drawScale,this.w*drawScale,this.h*drawScale,mouse.realX,mouse.realY,1,1)){
                    playSound(sounds.release,1)
                    this.onClick();
                    this.hover = false;
                }
            }
        }
        
    }
}

class BoardPiece{
    constructor(n,img){
        this.side = Math.floor(n/10);
        this.n = n;
        this.piece = pieces[this.n];
        if(this.n !== -1){
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
        
        this.setImg = function(){
            if(this.side === 0){
                this.x = 128*5.5-this.n*64;
                this.y = 64*11;
                this.imgSide =0;
            }
            if(this.side === 1){
                this.x = 32;
                this.y = -32 + 128*10.5+ - this.n*64;
                this.imgSide = 3;
                if(this.n%10 === 0){
                    this.x = 0;
                    this.y = -32 + 128*10.75+ - this.n*64;
                }
            }
            if(this.side === 2){
                this.x = (this.n%10)*64;
                this.y = 0;
                this.imgSide = 1;
                if(this.n%10 !== 0){
                    this.x = (this.n%10)*64 + 64;
                    this.y = 0;
                }
            }

            if(this.side === 3){
                this.x = 128*5.5
                this.y = 0
                this.imgSide = 2;
                if(this.n%10 !== 0){
                    this.x = 128*5.75
                    this.y = 0.25*128 + 64*(this.n%10)
                }
            }
        }
        this.setImg();
  
        this.update = function () {
            let mouseSquareX = (to_grid_coordinate(mouse.x-416*drawScale,mouse.y).x/64) 
            let mouseSquareY = (to_grid_coordinate(mouse.x-416*drawScale,mouse.y).y/64)
            if(board.currentCard !== undefined || this.piece.type === "chance" || this.piece.type === "community Chest" || this.piece.type === "income tax" || this.piece.type === "tax" ||this.n%10 === 0 || board.auction !== undefined ){
                this.offsetY = 0;
                this.hover = false;
            }else if(this.x/64*drawScale > mouseSquareX-1*drawScale && this.x/64*drawScale < mouseSquareX && this.side === 2 && this.n%10 !== 0 && mouseSquareY >= 0*drawScale && mouseSquareY < 2*drawScale
            ||this.x/64*drawScale > mouseSquareX-2*drawScale && this.x/64*drawScale < mouseSquareX && this.side === 2 && this.n%10 === 0 && mouseSquareY >= 0*drawScale && mouseSquareY < 2*drawScale

            ||this.x/64*drawScale > mouseSquareX-1*drawScale && this.x/64*drawScale < mouseSquareX && this.side === 0 && this.n%10 !== 0 && mouseSquareY >= 11*drawScale && mouseSquareY < 13*drawScale
            ||this.x/64*drawScale > mouseSquareX-2*drawScale && this.x/64*drawScale < mouseSquareX && this.side === 0 && this.n%10 === 0 && mouseSquareY >= 11*drawScale && mouseSquareY < 13*drawScale

            ||this.y/64*drawScale > mouseSquareY-1.5*drawScale && this.y/64*drawScale < mouseSquareY-0.5*drawScale && this.side === 3 && this.n%10 !== 0 && mouseSquareX >= 11*drawScale && mouseSquareX < 13*drawScale
            ||this.y/64*drawScale > mouseSquareY-2*drawScale && this.y/64*drawScale < mouseSquareY && this.side === 3 && this.n%10 === 0 && mouseSquareX >= 11*drawScale && mouseSquareX < 13*drawScale

            ||this.y/64*drawScale > mouseSquareY-1.5*drawScale && this.y/64*drawScale < mouseSquareY-0.5*drawScale && this.side === 1 && this.n%10 !== 0 && mouseSquareX >= 0*drawScale && mouseSquareX < 2*drawScale
            ||this.y/64*drawScale > mouseSquareY-2*drawScale && this.y/64*drawScale < mouseSquareY && this.side === 1 && this.n%10 === 0 && mouseSquareX >= 0*drawScale && mouseSquareX < 2*drawScale
            ){
                this.offsetY = -1;
                this.hover = true;
                
            }else{
                this.offsetY = 0;
                this.hover = false;
            }

            this.draw();
            
        }
        this.draw = function () {
            if(this.n%10 !== 0){
                drawIsometricImage(this.x,this.y,this.img,false,96*this.imgSide,0,96,48,this.offsetX,this.offsetY);
                if(this.owner !== undefined){
                    drawIsometricImage(this.x,this.y,images.playerOverlay.img[this.owner.colorIndex],false,96*this.imgSide,0,96,48,this.offsetX,this.offsetY);
                }
            }else{
                drawIsometricImage(this.x,this.y,this.img,false,0,0,128,64,this.offsetX,this.offsetY);
            }
        }
        this.drawHouses = function (){
            if(this.level < 5 && this.piece.housePrice !== undefined){
                for(let i = 0; i < this.level; i++){
                    if(this.imgSide === 0){
                        drawIsometricImage(this.x+13*drawScale + i*8*drawScale,this.y-31*drawScale,images.house.img[0],false,0,0,24,24,this.offsetX,this.offsetY);
                    }
                    if(this.imgSide === 1){
                        drawIsometricImage(this.x+13*drawScale + i*8*drawScale,this.y+15*drawScale,images.house.img[0],false,0,0,24,24,this.offsetX,this.offsetY);
                    }
                    if(this.imgSide === 2){
                        drawIsometricImage(this.x+5*drawScale ,this.y-21*drawScale+ i*8*drawScale,images.house.img[0],false,24,0,24,24,this.offsetX,this.offsetY);
                    }
                    if(this.imgSide === 3){
                        drawIsometricImage(this.x+50*drawScale ,this.y-21*drawScale+ i*8*drawScale,images.house.img[0],false,24,0,24,24,this.offsetX,this.offsetY);
                    }
                }
            }else if(this.piece.housePrice !== undefined){
                if(this.imgSide === 0){
                    drawIsometricImage(this.x+28*drawScale,this.y-31*drawScale,images.house.img[1],false,0,0,24,24,this.offsetX,this.offsetY);
                }
                if(this.imgSide === 1){
                    drawIsometricImage(this.x+28*drawScale,this.y+15*drawScale,images.house.img[1],false,0,0,24,24,this.offsetX,this.offsetY);
                }
                if(this.imgSide === 2){
                    drawIsometricImage(this.x+5*drawScale ,this.y-8*drawScale,images.house.img[1],false,24,0,24,24,this.offsetX,this.offsetY);
                }
                if(this.imgSide === 3){
                    drawIsometricImage(this.x+50*drawScale ,this.y-8*drawScale,images.house.img[1],false,24,0,24,24,this.offsetX,this.offsetY);
                }
            }
        }
        this.info = function() {
            let message = "";
            if(this.piece.name !== undefined){
                message += this.piece.name + "\n"
            }

            if(this.piece.price !== undefined){
                message += "Pris:" + this.piece.price + "kr\n" + "\n" 
            }

            if(this.owner !== undefined){
                message += "Ägare:" + this.owner.name + "\n" + "\n"
            }
            
            if(this.piece.rent !== undefined){
                this.piece.rent.forEach(function(e,i){
                    if(i === 0){
                        message += "Inga hus:" + e + "kr\n"
                    }
                    if(i === 1){
                        message += "Ett hus:" + e + "kr\n"
                    }
                    if(i === 2){
                        message += "Två hus:" + e + "kr\n"
                    }
                    if(i === 3){
                        message += "Tre hus:" + e + "kr\n"
                    }
                    if(i === 4){
                        message += "Fyra hus:" + e + "kr\n"
                    }
                    if(i === 5){
                        message += "Hotell:" + e + "kr\n"
                    }
                })
                message += "\n"
            }
            return message;
        }

        this.click = function(){
            if(this.hover === true && players[turn].bot === undefined){
                playSound(sounds.release,1)

                if(this.piece.card === undefined){
                    alert(this.info())
                }else{
                    board.currentCard = this;
                }


            }
        }
        this.playerStep = function (onlyStep,player,diceRoll){
            this.currentPlayer.push(player);
            if(!onlyStep && !this.mortgaged){
                if(this.piece.price < 0){
                    player.money += this.piece.price;
                    alert(player.name + " betalade " + -this.piece.price + "kr")
                }else if(this.piece.price > 0 && this.owner === undefined){
                    setTimeout(() => {
                        if(this.piece.card === undefined){
                            if(confirm("Vill du köpa " + this.piece.name + " för " + this.piece.price + "kr?" + "\n" + "\n"+ this.info())){
                                player.money -= this.piece.price;
                                this.owner = player;
                                player.ownedPlaces.push(this);
                            }  
                        }else{
                            if(players[turn].bot === undefined){
                                board.currentCard = this;
                            }
                        }
                        
                    }, 50);

                }else if(this.owner !== player && this.owner !== undefined){
                    if(this.piece.type === "utility"){
                        let tmp = 0;
                        let multiply = 0;
                        this.owner.ownedPlaces.forEach(e => {
                            if(e.piece.type === "utility"){
                                tmp++;
                            }
                        })
                        if(tmp === 1){
                            multiply = 4;

                        }
                        if(tmp === 2){
                            multiply = 10
                        }
                        player.money -=  diceRoll * multiply;
                        this.owner.money += diceRoll * multiply;
                        alert(this.owner.name + " fick precis " + (diceRoll * multiply) + "kr av " + player.name)
                        
                    }else if(this.piece.type === "station"){
                        let tmp = -1;
                        this.owner.ownedPlaces.forEach(e => {
                            if(e.piece.type === "station"){
                                tmp++;
                            }
                        })
                        player.money -=  25 * Math.pow(2,tmp);
                        this.owner.money += 25 * Math.pow(2,tmp);
                        alert(this.owner.name + " fick precis " + (25 * Math.pow(2,tmp)) + "kr av " + player.name)

                    }else{
                        let ownAll = true;
                        for(let i = 0; i<board.boardPieces.length; i++){
                            if(board.boardPieces[i] !== this){
                                if(board.boardPieces[i].piece.group === this.piece.group){
                                    if(this.owner !== board.boardPieces[i].owner){
                                        ownAll = false;
                                    }
                                }
                            }
                        }
                        let multiply = 1;
                        if(ownAll && this.level === 0){
                            multiply = 2;
                        }
                        player.money -= this.piece.rent[this.level] * multiply;
                        this.owner.money += this.piece.rent[this.level] * multiply;
                        alert(this.owner.name + " fick precis " + (this.piece.rent[this.level] * multiply) + "kr av " + player.name)

                    }
                }else if(this.piece.type === "chance"){
                    let random = randomIntFromRange(1,13);
                    if (Api.online) {
                        if (players[turn].colorIndex == Api.currentPlayer) Api.randomEvent("CHANCE_CARD", random);
                    } else {
                        this.doChanceCard(random);
                    }
                }else if(this.piece.type === "community Chest"){
                    let random = randomIntFromRange(1,16);
                    if (Api.online) {
                        if (players[turn].colorIndex == Api.currentPlayer) Api.randomEvent("COMMUNITY_CHEST", random);
                    } else {
                        this.doCommunityChest(random);
                    }
                }else if(this.piece.type === "income tax"){
                    if(player.money > 2000){
                        alert("Betala 200kr skatt")
                        player.money -= 200;
                    }else{
                        alert("Betala " + player.money * 0.1 + "kr skatt")
                        player.money = player.money * 0.9;
                    }
                }
            }
        }

        this.doChanceCard = (random) => {
            if(random === 1){
                alert("Gå till start!")
                player.teleportTo(0)
            }
            if(random === 2){
                alert("Gå till Hässleholm")
                player.teleportTo(24)
            }
            if(random === 3){
                alert("Gå till Simrishamn")
                player.teleportTo(11)
            }
            if(random === 4){
                alert("Gå till närmsta tågstation")
                if(this.n === 7){
                    player.teleportTo(15)
                }
                if(this.n === 22){
                    player.teleportTo(25)
                }
                if(this.n === 36){
                    player.teleportTo(5)
                }
            }
            if(random === 5){
                alert("Få 50kr")
                player.money += 50;
            }
            if(random === 6){
                alert("Inte inlagd men ska vara ett GET OUT OF JAIL kort")
                //get out of jail
            }
            if(random === 7){
                alert("Gå bak tre steg")
                player.teleportTo(player.steps-3)
            }
            if(random === 8){
                alert("Gå till finkan!")
                player.goToPrison();
            }
            if(random === 9){
                alert("Betala 40 för varje hus man har och 115 för varje hotell")
                board.boardPieces.forEach(function(e){
                    if(player === e.owner){
                        if(e.level < 5){
                            player.money -= 25*e.level
                        }else{
                            player.money -= 100
                        }
                    }
                })
            }
            if(random === 10){
                alert("Inte inlagd för att jag inte riktigt vet vad det ska vara")
                // konstig
            }
            if(random === 11){
                alert("Gå till Malmö")
                player.teleportTo(39);
            }
            if(random === 12){
                alert("Få 50kr av alla andra spelare")
                player.money += (players.length-1)*50
                players.forEach(e=> {if(e !== player){e.money-=50}})
            }
            if(random === 13){
                alert("Få 150kr")
                player.money += 150
            }
        }

        this.doCommunityChest = (random) => {
            if(random === 1){
                alert("Gå till start")
                player.teleportTo(0)
            }
            if(random === 2){
                alert("Få 200kr")
                player.money += 200;
            }
            if(random === 3){
                alert("Förlora 50kr")
                player.money -= 50;
            }
            if(random === 4){
                alert("Få 50kr")
                player.money += 50;
            }
            if(random === 4){
                alert("Inte inlagd men ska vara ett GET OUT OF JAIL kort")
                //jail free
            }
            if(random === 5){
                alert("Gå till finkan")
                player.goToPrison()
            }
            if(random === 6){
                alert("Få 50kr av alla andra spelare")
                player.money += (players.length-1)*50
                players.forEach(e=> {if(e !== player){e.money-=50}})
            }
            if(random === 7){
                alert("Få 100kr")
                player.money += 100;
            }
            if(random === 8){
                alert("Få 20kr")
                player.money += 20;
            }
            if(random === 9){
                alert("Få 10kr av alla andra spelare")
                player.money += (players.length-1)*10
                players.forEach(e=> {if(e !== player){e.money-=10}})
            }
            if(random === 10){
                alert("Få 100kr")
                player.money += 100;
            }
            if(random === 11){
                alert("Förlora 50kr")
                player.money -= 50;
            }
            if(random === 12){
                alert("Förlora 50kr")
                player.money -= 50;
            }
            if(random === 13){
                alert("Förlora 25kr")
                player.money -= 25;
            }
            if(random === 14){
                alert("Betala 40 för varje hus man har och 115 för varje hotell")
                board.boardPieces.forEach(function(e){
                    if(player === e.owner){
                        if(e.level < 5){
                            player.money -= 40*e.level
                        }else{
                            player.money -= 115
                        }
                    }
                })
            }
            if(random === 15){
                alert("Få 10kr")
                player.money += 10;
            }
            if(random === 16){
                alert("Få 100kr")
                player.money += 100;
            }
        }
    }
}

class Player{

    constructor(img,index,name,bot){
        this.name = name;
        this.img = img;
        this.x = 0;
        this.y = 0;
        this.steps = 0;
        this.money = 1400;
        this.colorIndex = index
        this.offsetY = 0;
        this.stepsWithOffset = (this.steps)
        this.rolls = false;
        this.numberOfRolls = false;
        this.inJail = false;
        this.ownedPlaces = [];
        this.animationOffset = 0;
        this.timer = undefined;
        this.negative = false;
        this.bot = undefined;
        if(bot == true ){
            this.bot = new Bot(this);
        }


        this.draw = function () {
            drawIsometricImage(800-this.x*64-32,700-this.y*64-32,this.img,false,0,0,24,48,0,-this.offsetY,1)
        }
        this.update = function () {
            this.updateVisual();
            this.draw();
            this.money = Math.floor(this.money)
            this.checkMoney();
            if(this.bot !== undefined){
                this.bot.update();
            }
        }

        this.checkMoney = function(){
            if(this.money < 0 && this.ownedPlaces.length == 0){
                if (Api.online) {
                    Api.changeTurn();
                } else {
                    turn = turn%(players.length-1);
                }

                if(players.length-1 === 1){
                    board.win = true;
                }
                this.money = 0;
                players.splice(players.indexOf(this),1)

            }else if(this.money < 0){
                this.negative = true;
            }  else{
                this.negative = false;
            }
        }
        this.updateVisual = function (){
            this.stepsWithOffset = 40 + (this.steps) - this.animationOffset
            this.stepsWithOffset = this.stepsWithOffset%40;
            
            if(this.stepsWithOffset === 0){
                this.x = 0;
                this.y = 0;
            }
            if(this.stepsWithOffset > 0 && this.stepsWithOffset < 10){
                this.y = 0.5;
                this.x = this.stepsWithOffset + 1;
            }
            if(this.stepsWithOffset > 9 && this.stepsWithOffset < 21){
                this.x = 11.5
                if(this.stepsWithOffset === 10){
                    this.x = 12
                    this.y = this.stepsWithOffset-10;
                }else if(this.stepsWithOffset < 20){
                    this.y = this.stepsWithOffset-9;
                }else{
                    this.x = 11.5
                    this.y = this.stepsWithOffset-8 -0.5;
                }
            }
            if(this.stepsWithOffset > 20 && this.stepsWithOffset < 30){
                this.y = 11.5;
                this.x = 12 - (this.stepsWithOffset-19)
            }
            if(this.stepsWithOffset > 29){
                this.x = 0.5;
                if(this.stepsWithOffset === 30){
                    this.x = 0.5;
                    this.y = 12 - (this.stepsWithOffset-30) -0.5
                }else{
                    this.y = 12 - (this.stepsWithOffset-29)
                }
            }
            let tmpSteps = (this.steps -this.animationOffset + 40)%40;

            if(this.inJail === true && this.animationOffset === 0){
                this.x = 11.25;
                this.y = 0.70;
            }
            
            for(let i = 0; i<board.boardPieces[tmpSteps].currentPlayer.length; i++){
                if(board.boardPieces[tmpSteps].currentPlayer[i] === this){
                    if(tmpSteps === 0){
                        if(i < Math.floor(board.boardPieces[tmpSteps].currentPlayer.length/2)){
                            this.x+=0.8
                            this.y-=((i)/1.4)
                        }else{
                            this.y-=((i-Math.floor(board.boardPieces[tmpSteps].currentPlayer.length/2))/1.4)
                        }
                    }else{
                        if(Math.floor(this.stepsWithOffset/10) === 0){
                            this.y-=((i)/1.4)
                        }
                        if(Math.floor(this.stepsWithOffset/10) === 1){
                            this.x+=((i)/1.4)
                        }
                        if(Math.floor(this.stepsWithOffset/10) === 2){
                            this.y+=((i)/1.4)
                        }
                        if(Math.floor(this.stepsWithOffset/10) === 3){
                            this.x-=((i)/1.4)
                        }
                    }
                }                
            }
            for(let i = 0; i<board.prisonExtra.currentPlayer.length; i++){
                if(board.prisonExtra.currentPlayer[i] === this){
                    this.y+=i/1.8
                    this.x-=i/1.8
                }
            }

  
            
        }
        this.goToPrison = function(){
            alert("Gå till finkan!")
            this.teleportTo(10)
            this.inJail = true;
            this.rolls = true;
        }
        this.getOutOfJail = function(){
            let self = this;
            board.prisonExtra.currentPlayer.forEach(function(e,i){
                if(e == self){
                    board.prisonExtra.currentPlayer.splice(i,1)
                }
            })
            self.inJail = false;
            self.steps = 10;
            board.boardPieces[10].playerStep(true,self);
        }
        this.teleportTo = function(step, sendToServer = true){
            console.log(step, this.steps);
            if (Api.online && sendToServer) {
                Api.moveTo(step);
                return;
            }

            // The animateSteps function seems to have stopped working. I'll need to look into it more tomorrow.

            let oldStep = this.steps;

            this.steps = step;
            this.rolls = true;

            this.animateSteps(oldStep,this.steps,0)
        }
        this.animateSteps = function(from,to,dicesum){
            let self = this;
            clearInterval(this.timer)
            if(to < from){
                to += 40
            }
            let to2 = to
            this.animationOffset = to-from;
            to = to%40
            board.showDices = true;
            self.timer = setInterval(function(){
                if(self.animationOffset <= 0){
                    clearInterval(self.timer);
                    
                    board.boardPieces.forEach(function(b,i2) {b.currentPlayer.forEach(function(d,i3) {
                        if(d === self){
                            b.currentPlayer.splice(i3,1)
                        }
                    })})
                    if(to2 >= 40 && self.inJail === false){
                        alert(self.name + " gick förbi start och fick då 200kr")
                        self.money += 200;
                    }
                    
                    if(to === 0){
                        board.boardPieces[0].playerStep(false,self);
                    }else{
                        if(self.inJail === true){
                            board.prisonExtra.playerStep(true,self);
                        }else{
                            board.boardPieces[to].playerStep(false,self,dicesum);
                        }
                    }
                    if(to === 30){
                        self.goToPrison()
                    }
                    board.showDices = false;
                }else{
                    board.boardPieces.forEach(function(b,i2) {b.currentPlayer.forEach(function(d,i3) {
                        if(d === self){
                            b.currentPlayer.splice(i3,1)
                        }
                    })})

                    self.animationOffset--;
                    playSound(sounds.movement,1)
                    if(((to-self.animationOffset)%40-1) === -1){
                        board.boardPieces[0].playerStep(true,self);
                    }else{
                        board.boardPieces[(to2-self.animationOffset)%40].playerStep(true,self);
                    }
                    

                }
            },300);
        }
        
        this.rollDice = function(){
            if(this.negative === false){
                if(this.inJail === false){
                    if(this.rolls === false){
                        let oldStep = this.steps;
                        let dice1 = randomIntFromRange(1,6);
                        let dice2 = randomIntFromRange(1,6);
                        if(dice1 === dice2){
                            if(this.numberOfRolls === 3){
                                this.goToPrison();
                            }
                            this.numberOfRolls++;
                            this.rolls = false;
                        }else{
                            this.rolls = true;
                        }
                        let diceSum = dice1+dice2;

                        
                        board.animateDices = true;

                        let counter = 25;
                        let self = this;
                        var myFunction = function() {
                            board.randomizeDice();
                            board.dice1 = randomIntFromRange(1,6)
                            board.dice2 = randomIntFromRange(1,6)
                            playSound(sounds.dice,0.5)
                            counter *= 1.2;
                            if(counter > 1000){
                                playSound(sounds.dice,0.5)
                                board.dice1 = dice1;
                                board.dice2 = dice2;
                                setTimeout(() => {
                                    board.animateDices = false;
                                    self.teleportTo(self.steps + dice1 + dice2);
                                }, 1000);                  
                            }else{
                                setTimeout(myFunction, counter);
                            }
                        }
                        setTimeout(myFunction, counter);
                    }else{
                        if (Api.online) {
                            Api.changeTurn();
                        } else {
                            turn = (turn+1)%players.length;
                        }

                        this.rolls = false;
                        this.numberOfRolls = 0;

                        board.dice1 = 0;
                        board.dice2 = 0;
                    }
                }else{
                    if(this.rolls === false){
                        if(confirm("Vill du betala 50kr för att komma ut eller slå dubbelt?")){
                            this.money -= 50;
                            this.rolls = true;
                            this.getOutOfJail();
                        }else{
                            let dice1 = randomIntFromRange(1,6);
                            let dice2 = randomIntFromRange(1,6);
                            board.randomizeDice();
                            board.dice1 = dice1;
                            board.dice2 = dice2;
                            board.showDices = true;

                            if(dice1 === dice2){
                                this.getOutOfJail()
                                this.teleportTo(this.steps + dice1 + dice2);
                            }
                            this.rolls = true;
                            setTimeout(() => {
                                board.showDices = false;
                            }, 1000);
                        }
                    }else{
                        if (Api.online) {
                            Api.changeTurn();
                        } else {
                            turn = (turn+1)%players.length;
                        }
                        this.rolls = false;
                        this.numberOfRolls = 0;
                    }
                    
                }
            }
            
        }
        board.boardPieces[0].currentPlayer.push(this);

    }
}


init();