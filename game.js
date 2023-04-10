hvar canvas = document.createElement("canvas");
var c = canvas.getContext("2d");
canvas.id = "game"


var board;

var turn = 0;

var players = [];

const drawScale = 2;

var offsets = {
    x:Math.floor(window.innerWidth/2) - 832*drawScale/2,
    y:Math.floor(window.innerHeight/2) - 416*drawScale/2
}

var images = {
    part:{
        src:["./images/plates/brown.png","./images/plates/light_blue.png",
        "./images/plates/pink.png","./images/plates/orange.png",
        "./images/plates/red.png","./images/plates/yellow.png",
        "./images/plates/green.png","./images/plates/blue.png",
        "./images/plates/chance.png","./images/plates/chance2.png","./images/plates/chance3.png",
        "./images/plates/train.png", "./images/plates/water.png", "./images/plates/electric.png",
        "./images/plates/supertax.png","./images/plates/chest.png","./images/plates/incometax.png"
        ]
    },
    card:{
        src:["./images/cards/browncard1.png","./images/cards/browncard2.png","./images/cards/lightbluecard1.png","./images/cards/lightbluecard2.png","./images/cards/lightbluecard3.png"
            ,"./images/cards/pinkcard1.png","./images/cards/pinkcard2.png","./images/cards/pinkcard3.png","./images/cards/orangecard1.png","./images/cards/orangecard2.png","./images/cards/orangecard3.png"
            ,"./images/cards/redcard1.png","./images/cards/redcard2.png","./images/cards/redcard3.png","./images/cards/yellowcard1.png","./images/cards/yellowcard2.png","./images/cards/yellowcard3.png"
            ,"./images/cards/greencard1.png","./images/cards/greencard2.png","./images/cards/greencard3.png","./images/cards/bluecard1.png","./images/cards/bluecard2.png"
            ,"./images/cards/electricitycard.png","./images/cards/waterworkscard.png"
            ,"./images/cards/eaststation.png","./images/cards/northstation.png","./images/cards/centralstation.png","./images/cards/southstation.png"
        ]
    },
    corner:{
        src:["./images/corners/go.png","./images/corners/prison.png","./images/corners/parking.png","./images/corners/gotoprison.png"
        ]
    },
    player:{
        src:["./images/players/player.png","./images/players/player2.png","./images/players/player3.png","./images/players/player4.png",
        "./images/players/player5.png","./images/players/player6.png","./images/players/player7.png","./images/players/player8.png"
        ]
    },
    background:{
        src:["./images/static/insideboard.png","./images/static/realbackground.png"
        ]
    },
    house:{
        src:["./images/buildings/house.png","./images/buildings/hotel.png"
        ]
    },
    dice:{
        src:["./images/dices/dices.png"
        ]
    },
    buttons:{
        src:["./images/buttons/rolldice.png","./images/buttons/nextplayer.png",
        "./images/buttons/sellbutton.png","./images/buttons/mortgage.png","./images/buttons/arrowup.png","./images/buttons/arrowdown.png",
        "./images/buttons/buythislawn.png"
        ]
    }
};

var sounds = {
    click:{
        type:"single",
        src:"./sounds/click.mp3"
    },
    movement:{
        type:"multiple",
        src:"./sounds/movement/move-",
        amount:46
    }
}

var mouse = {
    x:0,
    y:0,
    realX:0,
    realY:0
}
const pieces = [
    {
        name:"Start",
        img:0
    },
    {
        name:"Brun 1",
        price:60,
        rent:[2,10,30,90,160,250],
        housePrice:50,
        group:"Brown",
        img:0,
        card:0
    },
    {
        name:"Allmänning",
        type:"community Chest",
        img:15
    },
    {
        name:"Brun 2",
        price:60,
        rent:[4,20,60,180,320,450],
        housePrice:50,
        group:"Brown",
        img:0,
        card:1
    },
    {
        name:"Inkomstskatt",
        type:"income tax",
        img:16,
    },
    {
        name:"Södra stationen",
        price:200,
        type:"station",
        img:11,
        card:27
    },
    {
        name:"Ljusblå 1",
        price:100,
        rent:[6,30,90,270,400,550],
        housePrice:50,
        group:"light blue",
        img:1,
        card:2
    },
    {
        name:"Chans",
        type:"chance",
        img:10
    },
    {
        name:"Ljusblå 2",
        price:100,
        rent:[6,30,90,270,400,550],
        housePrice:50,
        group:"light blue",
        img:1,
        card:3
    },
    {
        name:"Ljusblå 3",
        price:120,
        rent:[8,40,100,300,450,600],
        housePrice:50,
        group:"light blue",
        img:1,
        card:4
    },
    {
        name:"Fängelse",
        img:1
    },
    {
        name:"Rosa 1",
        price:140,
        rent:[10,50,150,450,625,750],
        housePrice:100,
        group:"pink",
        img:2,
        card:5
    },
    {
        name:"Elverket",
        price:150,
        type:"utility",
        img:13,
        card:22
    },
    {
        name:"Rosa 2",
        price:140,
        rent:[10,50,150,450,625,750],
        housePrice:100,
        group:"pink",
        img:2,
        card:6
    },
    {
        name:"Rosa 3",
        price:160,
        rent:[12,60,180,500,700,900],
        housePrice:100,
        group:"pink",
        img:2,
        card:7
    },
    {
        name:"Östra Stationen",
        price:200,
        type:"station",
        img:11,
        card:24
    },
    {
        name:"Orange 1",
        price:180,
        rent:[14,70,200,550,750,950],
        housePrice:100,
        group:"orange",
        img:3,
        card:8
    },
    {
        name:"Allmänning",
        type:"community Chest",
        img:15
    },
    {
        name:"Orange 2",
        price:180,
        rent:[14,70,200,550,750,950],
        housePrice:100,
        group:"orange",
        img:3,
        card:9
    },
    {
        name:"Orange 3",
        price:200,
        rent:[16,80,220,600,800,1000],
        housePrice:100,
        group:"orange",
        img:3,
        card:10
    },
    {
        name:"Fri parkering",
        img:2
    },
    {
        name:"Röd 1",
        price:220,
        rent:[18,90,250,700,875,1050],
        housePrice:150,
        group:"red",
        img:4,
        card:11
    },
    {
        name:"Chans",
        type:"chance",
        img:8
    },
    {
        name:"Röd 2",
        price:220,
        rent:[18,90,250,700,875,1050],
        housePrice:150,
        group:"red",
        img:4,
        card:12
    },
    {
        name:"Röd 3",
        price:240,
        rent:[20,100,300,750,925,1100],
        housePrice:150,
        group:"red",
        img:4,
        card:13
    },
    {
        name:"Centralstationen",
        price:200,
        type:"station",
        img:11,
        card:26
    },
    {
        name:"Gul 1",
        price:260,
        rent:[22,110,330,800,975,1150],
        housePrice:150,
        group:"yellow",
        img:5,
        card:14
    },
    {
        name:"Gul 2",
        price:260,
        rent:[22,110,330,800,975,1150],
        housePrice:150,
        group:"yellow",
        img:5,
        card:15
    },
    {
        name:"Vattenledningsverket",
        price: 150,
        type:"utility",
        img:12,
        card:23
    },
    {
        name:"Gul 3",
        price:280,
        rent:[24,120,360,850,1025,1200],
        housePrice:150,
        group:"yellow",
        img:5,
        card:16
    },
    {
        name:"Gå till finkan",
        img:3
    },
    {
        name:"Grön 1",
        price:300,
        rent:[26,130,390,900,1100,1275],
        housePrice:200,
        group:"green",
        img:6,
        card:17
    },
    {
        name:"Grön 2",
        price:300,
        rent:[26,130,390,900,1100,1275],
        housePrice:200,
        group:"green",
        img:6,
        card:18
    },
    {
        name:"Allmänning",
        type:"community Chest",
        img:15
    },
    {
        name:"Grön 3",
        price:320,
        rent:[28,150,450,1000,1200,1400],
        housePrice:200,
        group:"green",
        img:6,
        card:19
    },
    {
        name:"Norra stationen",
        price:200,
        type:"station",
        img:11,
        card:25
    },
    {
        name:"Chans",
        type:"chance",
        img:9
    },
    {
        name:"Blå 1",
        price:350,
        rent:[35,175,500,1100,1300,1500],
        housePrice:200,
        group:"blue",
        img:7,
        card:20
    },
    {
        name:"Lyxskatt",
        price:-100,
        img:14,
        type:"tax"
    },
    {
        name:"Blå 2", 
        price:400,
        rent:[50,200,600,1400,1700,2000],
        housePrice:200,
        group:"blue",
        img:7,
        card:21
    }
]

window.addEventListener("resize", e=> {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    offsets = {
        x:Math.floor(window.innerWidth/2) - 832*drawScale/2,
        y:Math.floor(window.innerHeight/2) - 416*drawScale/2
    }
})

canvas.addEventListener("mousemove",function(e){
    mouse = {
        x:e.offsetX - offsets.x,
        y:e.offsetY - offsets.y,
        realX:e.x,
        realY:e.y,
        offsetX:e.offsetX,
        offsety:e.offsetY,

    }
})

window.addEventListener("mousedown",function(e){
    board.boardPieces.forEach(function(piece){
            piece.click();
        })
    board.nextPlayerButton.click();
    board.rollDiceButton.click();
    board.cardCloseButton.click();
    board.buyButton.click();
    board.sellButton.click();
    board.mortgageButton.click();
    board.upgradeButton.click();
    board.downgradeButton.click();
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

            image[1].img[i].src = image[1].src[i];
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
    x+= offsets.x;
    y+= offsets.y
    let middlePoint = {
        x:x+w/2,
        y:y+h/2
    };

    c.save();
    c.translate(middlePoint.x,middlePoint.y);
    c.rotate(degree);
    if(mirrored === true){
        c.scale(-1, 1);
    }
    c.drawImage(img,Math.floor(cropX),Math.floor(cropY),Math.floor(cropW),Math.floor(cropH),Math.floor(-w/2),Math.floor(-h/2),Math.floor(w),Math.floor(h));
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
    drawRotatedImage(to_screen_coordinate(x*drawScale,y*drawScale).x + 832/2*drawScale - 64*scaleOfThis + offsetX*scaleOfThis,to_screen_coordinate(x*drawScale,y*drawScale).y + offsetY*drawScale,cropW*scaleOfThis,cropH*scaleOfThis,img,0,mirror,cropX,cropY,cropW,cropH)
}


function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
};

function playSound(sound){
    if(sound.type === "single"){
        let myClonedAudio = sound.sound.cloneNode();
        myClonedAudio.play();
    }else{
        let myClonedAudio = sound.sounds[Math.floor(Math.random() * sound.sounds.length)].cloneNode();
        myClonedAudio.play();
    }

};

function init(){
    document.body.appendChild(canvas);
    canvas.style.zIndex = -100;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    preRender(images);

    loadSounds(sounds);

    board = new Board();  
    let playerAmount = 0;

    let playerImages = [0,1,2,3,4,5,6,7]

    while(playerAmount == 0){
        let promptText = prompt("Hur många spelare?") 
        if(isNumeric(promptText)){
            if(JSON.parse(promptText) < 2 || JSON.parse(promptText) > 8){
                playerAmount = 0;
            }else{
                playerAmount = JSON.parse(promptText)
            }
        }else{
            playerAmount = 0;
        }
    }

    for(i = 0; i < playerAmount; i++){
        let random = randomIntFromRange(0,playerImages.length-1)
        players.push(new Player(images.player.img[playerImages[random]],players.length,"green","Spelare " + (i+1)))
        playerImages.splice(random,1)
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
            c.fillText(player.name + ": " + player.money + "$", 10, 80);
        }
        if(i === 1){
            c.textAlign = "right";
            c.fillText(player.name + ": " + player.money + "$", canvas.width-10, 80);
        }
        if(i === 2){
            c.textAlign = "left";
            c.fillText(player.name + ": " + player.money + "$", 10, canvas.height-30);
        }
        if(i === 3){
            c.textAlign = "right";
            c.fillText(player.name + ": " + player.money + "$", canvas.width-10, canvas.height-30);
        }
        if(i === 4){
            c.textAlign = "left";
            c.fillText(player.name + ": " + player.money + "$", 10, 160);
        }
        if(i === 5){
            c.textAlign = "right";
            c.fillText(player.name + ": " + player.money + "$", canvas.width-10, 160);
        }
        if(i === 6){
            c.textAlign = "left";
            c.fillText(player.name + ": " + player.money + "$", 10, canvas.height-110);
        }
        if(i === 7){
            c.textAlign = "right";
            c.fillText(player.name + ": " + player.money + "$", canvas.width-10, canvas.height-110);
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
        this.rollDiceButton = new Button(10,250,images.buttons.img[0],function(){players[turn].rollDice()},107,23)
        this.nextPlayerButton = new Button(10,250,images.buttons.img[1],function(){players[turn].rollDice()},107,23)
        this.currentCard = undefined;
        this.cardCloseButton = new Button(174,45,undefined,function(){board.currentCard = undefined;},15,15)
        this.sellButton = new Button(130,300,images.buttons.img[2],function(){},40,40);
        this.mortgageButton = new Button(80,300,images.buttons.img[3],function(){},40,40);
        this.upgradeButton = new Button(5,300,images.buttons.img[4],function(){},40,40);
        this.downgradeButton = new Button(-45,300,images.buttons.img[5],function(){},40,40);
        this.buyButton = new Button(-15,300,images.buttons.img[6],function(){
            if(players[turn].money >= board.currentCard.piece.price){
                players[turn].money -= board.currentCard.piece.price;
                board.currentCard.owner = players[turn];
                players[turn].ownedPlaces.push(board.currentCard);
                board.currentCard = undefined;
            }
        },160,40);

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
            this.boardPieces.forEach(g => g.currentPlayer.forEach(p => p.update()))
            this.prisonExtra.currentPlayer.forEach(p => p.update())
            this.showCard();
            this.fixCursor();
        }  

        this.fixCursor = function (){
            if(this.rollDiceButton.hover || this.nextPlayerButton.hover || this.cardCloseButton.hover || this.sellButton.hover || this.mortgageButton.hover || this.upgradeButton.hover || this.downgradeButton.hover || this.buyButton.hover){
                canvas.style.cursor = "pointer"
            }else{
                canvas.style.cursor = "auto"
            }
        }
        this.randomizeDice = function () {
            this.dice1Type = randomIntFromRange(0,3);
            this.dice2Type = randomIntFromRange(0,3);
        }
        this.showCard = function (){
            if(this.currentCard !== undefined){
                this.cardCloseButton.visible = true;
                drawIsometricImage(0,0,images.card.img[this.currentCard.piece.card],false,0,0,images.card.img[this.currentCard.piece.card].width,images.card.img[this.currentCard.piece.card].height,-images.card.img[this.currentCard.piece.card].width/4,images.card.img[this.currentCard.piece.card].height/7.5,1)
                this.cardCloseButton.draw();
                c.fillStyle = "black";
                c.textAlign = "center";
                c.font ="20px Brush Script MT";
                if(this.currentCard.owner !== undefined){
                    c.fillText("Ägare: " + this.currentCard.owner.name,canvas.width/2,canvas.height/3.5)
                    if(this.currentCard.owner === players[turn]){
                        this.sellButton.draw();
                        this.sellButton.visible = true;
                        this.mortgageButton.draw();
                        this.mortgageButton.visible = true;
                        this.upgradeButton.draw();
                        this.upgradeButton.visible = true;
                        this.downgradeButton.draw();
                        this.downgradeButton.visible = true;
                        this.buyButton.visible = false;
                    }
                }else{
                    if(this.currentCard === board.boardPieces[(players[turn].steps)]){
                        this.buyButton.draw();
                        this.buyButton.visible = true;
                    }else{
                        this.buyButton.visible = false;
                    }
                }
                this.nextPlayerButton.visible = false;
                this.rollDiceButton.visible = false;
            }else{
                this.cardCloseButton.visible = false;
            }
        }

        this.showDice = function () {
            if(players[turn].animationOffset > 0 ||this.showDices === true || this.animateDices === true){
            drawIsometricImage(500,500,images.dice.img[0],false,this.dice1Type*64,(this.dice1-1)*64,64,64,0,0)
            drawIsometricImage(550,400,images.dice.img[0],false,this.dice2Type*64,(this.dice2-1)*64,64,64,0,0)
            this.nextPlayerButton.visible = false;
            this.rollDiceButton.visible = false;
            }else{
                if(players[turn].rolls === false){
                    this.rollDiceButton.visible = true;
                    this.nextPlayerButton.visible = false;
                }else{
                    this.nextPlayerButton.visible = true;
                    this.rollDiceButton.visible = false;
                }
                
            }
        }
    }
}

class Button{
    constructor(x,y,img,onClick,w,h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img = img;
        this.onClick = onClick
        this.visible = false;
        this.disabled = false;
        this.hover = false;
        this.draw = function(){
            if(this.visible && this.img !== undefined){
                if(!this.disabled){
                    
                    if(detectCollition(canvas.width/2 + this.x*drawScale - 64*drawScale,canvas.height/2 + this.y*drawScale - 208*drawScale,this.w*drawScale,this.h*drawScale,mouse.realX,mouse.realY,1,1)){
                        drawIsometricImage(0,0,this.img,false,this.w,0,this.w,this.h,this.x,this.y)
                        this.hover = true;
                    }else{
                        this.hover = false;
                        drawIsometricImage(0,0,this.img,false,0,0,this.w,this.h,this.x,this.y)
                    }
                }else{
                    this.hover = false;
                    drawIsometricImage(0,0,this.img,false,this.w,0,this.w,this.h,this.x,this.y)
                }
                
            }else if(this.visible){
                if(detectCollition(canvas.width/2 + this.x*drawScale - 64*drawScale,canvas.height/2 + this.y*drawScale - 208*drawScale,this.w*drawScale,this.h*drawScale,mouse.realX,mouse.realY,1,1)){
                    this.hover = true;
                }else{
                    this.hover = false;
                }
            }

        }
        this.click = function(){
            c.fillStyle = "black";
            if(this.visible && !this.disabled){
                if(detectCollition(canvas.width/2 + this.x*drawScale - 64*drawScale,canvas.height/2 + this.y*drawScale - 208*drawScale,this.w*drawScale,this.h*drawScale,mouse.realX,mouse.realY,1,1)){
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
        this.inJail = false;
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
            if(board.currentCard !== undefined || this.piece.type === "chance" || this.piece.type === "community Chest" || this.piece.type === "income tax" || this.piece.type === "tax" ||this.n%10 === 0){
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
                message += "Pris:" + this.piece.price + "$\n" + "\n" 
            }

            if(this.owner !== undefined){
                message += "Ägare:" + this.owner.name + "\n" + "\n"
            }
            
            if(this.piece.rent !== undefined){
                this.piece.rent.forEach(function(e,i){
                    if(i === 0){
                        message += "Inga hus:" + e + "$\n"
                    }
                    if(i === 1){
                        message += "Ett hus:" + e + "$\n"
                    }
                    if(i === 2){
                        message += "Två hus:" + e + "$\n"
                    }
                    if(i === 3){
                        message += "Tre hus:" + e + "$\n"
                    }
                    if(i === 4){
                        message += "Fyra hus:" + e + "$\n"
                    }
                    if(i === 5){
                        message += "Hotell:" + e + "$\n"
                    }
                })
                message += "\n"
            }
            return message;
        }
        this.click = function(){
            if(this.hover === true){
                if(this.piece.card === undefined){
                    alert(this.info())
                }else{
                    board.currentCard = this;
                }
                if(this.owner === players[turn]){
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
                    
                    if(this.level < 5 && this.piece.housePrice !== undefined && ownAll === true){
                        if(confirm("Vill du köpa ett hus här för " + this.piece.housePrice + "$?")){
                            this.level++;
                            this.owner.money -= this.piece.housePrice;
                        }
                    }   
                }
            }
        }
        this.playerStep = function (onlyStep,player,diceRoll){
            this.currentPlayer.push(player);
            if(!onlyStep){
                if(this.piece.price < 0){
                    player.money += this.piece.price;
                    alert(player.name + " betalade " + -this.piece.price + "$")
                }else if(this.piece.price > 0 && player.money >= this.piece.price && this.owner === undefined){
                    setTimeout(() => {
                        if(this.piece.card === undefined){
                            if(confirm("Vill du köpa " + this.piece.name + " för " + this.piece.price + "$?" + "\n" + "\n"+ this.info())){
                                player.money -= this.piece.price;
                                this.owner = player;
                                player.ownedPlaces.push(this);
                            }  
                        }else{
                            board.currentCard = this;
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
                        alert(this.owner.name + " fick precis " + (diceRoll * multiply) + "$ av " + player.name)
                        
                    }else if(this.piece.type === "station"){
                        let tmp = -1;
                        this.owner.ownedPlaces.forEach(e => {
                            if(e.piece.type === "station"){
                                tmp++;
                            }
                        })
                        player.money -=  25 * Math.pow(2,tmp);
                        this.owner.money += 25 * Math.pow(2,tmp);
                        alert(this.owner.name + " fick precis " + (25 * Math.pow(2,tmp)) + "$ av " + player.name)

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
                        alert(this.owner.name + " fick precis " + (this.piece.rent[this.level] * multiply) + "$ av " + player.name)

                    }
                }else if(this.piece.type === "chance"){
                    let random = randomIntFromRange(1,13)
                    if(random === 1){
                        alert("Gå till start!")
                        player.teleportTo(0)
                        player.money += 200;
                    }
                    if(random === 2){
                        alert("Gå till röd 3")
                        if(player.steps >= 24){
                            player.money+=200;   
                        }
                        player.teleportTo(24)
                    }
                    if(random === 3){
                        alert("Gå till rosa 1")
                        if(player.steps >= 11){
                            player.money+=200;   
                        }
                        player.teleportTo(11)
                    }
                    if(random === 4){
                        alert("Gå till närmsta tågstation")
                        if(player.steps >= 0 || player.steps >= 35){
                            player.money+=200;
                            player.teleportTo(5)
                        }
                        if(player.steps >= 5 && player.steps < 15){
                            player.teleportTo(15)
                        }
                        if(player.steps >= 15 && player.steps < 25){
                            player.teleportTo(25)
                        }
                        if(player.steps >= 25 && player.steps < 35){
                            player.teleportTo(35)
                        }
                    }
                    if(random === 5){
                        alert("Få 50$")
                        player.money += 50;
                    }
                    if(random === 6){
                        alert("")
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
                        alert("")
                        // pay 25 för varje hus och 100 för alla hotell
                    }
                    if(random === 10){
                        alert("")
                        // konstig
                    }
                    if(random === 11){
                        alert("Gå till blå 3")
                        player.teleportTo(39);
                    }
                    if(random === 12){
                        alert("Få 50$ av alla andra spelare")
                        player.money -= (players.length-1)*50
                        players.forEach(e=> {if(e !== player){e.money+=50}})
                    }
                    if(random === 13){
                        alert("Få 150$")
                        player.money += 150
                    }
                }else if(this.piece.type === "community Chest"){
                    let random = randomIntFromRange(1,13);
                    if(random === 1){
                        alert("Gå till start")
                        player.teleportTo(0)
                        player.money += 200;
                    }
                    if(random === 2){
                        alert("Få 200$")
                        player.money += 200;
                    }
                    if(random === 3){
                        alert("Förlora 50$")
                        player.money -= 50;
                    }
                    if(random === 4){
                        alert("Få 50$")
                        player.money += 50;
                    }
                    if(random === 4){
                        alert("")
                        //jail free
                    }
                    if(random === 5){
                        alert("Gå till finkan")
                        player.goToPrison()
                    }
                    if(random === 6){
                        alert("Få 50$ av alla andra spelare")
                        player.money -= (players.length-1)*50
                        players.forEach(e=> {if(e !== player){e.money+=50}})
                    }
                    if(random === 7){
                        alert("Få 100$")
                        player.money += 100;
                    }
                    if(random === 8){
                        alert("Få 20$")
                        player.money += 20;
                    }
                    if(random === 9){
                        alert("Få 10$ av alla andra spelare")
                        player.money -= (players.length-1)*10
                        players.forEach(e=> {if(e !== player){e.money+=10}})
                    }
                    if(random === 10){
                        alert("Få 100$")
                        player.money += 100;
                    }
                    if(random === 11){
                        alert("Förlora 50$")
                        player.money -= 50;
                    }
                    if(random === 12){
                        alert("Förlora 50$")
                        player.money -= 50;
                    }
                    if(random === 13){
                        alert("Förlora 25$")
                        player.money -= 25;
                    }
                    if(random === 14){
                        alert("")
                        // pay 40 för varje hus och 115 för alla hotell
                    }
                    if(random === 15){
                        alert("Få 10$")
                        player.money += 10;
                    }
                    if(random === 16){
                        alert("Få 100$")
                        player.money += 100;
                    }
                }else if(this.piece.type === "income tax"){
                    if(player.money > 2000){
                        alert("Betala 200$ skatt")
                        player.money -= 200;
                    }else{
                        alert("Betala " + player.money * 0.1 + "$ skatt")
                        player.money = player.money * 0.9;
                    }
                }
            }
        }
        
    }
    
}

class Player{

    constructor(img,index,color,name){
        this.name = name;
        this.color = color;
        this.img = img;
        this.x = 0;
        this.y = 0;
        this.steps = 0;
        this.money = 1400;
        this.index = index
        this.offsetY = 0;
        this.stepsWithOffset = (this.steps)
        this.rolls = false;
        this.numberOfRolls = false;
        this.inJail = false;
        this.ownedPlaces = [];
        this.animationOffset = 0;
        this.timer = undefined;
        this.draw = function () {
            drawIsometricImage(800-this.x*64,700-this.y*64,this.img,false,0,0,32,32,0,-this.offsetY)
        }
        this.update = function () {
            this.updateVisual();
            this.draw();
        }
        this.updateVisual = function (){
            this.stepsWithOffset = 40 + (this.steps) - this.animationOffset
            this.stepsWithOffset = this.stepsWithOffset%40;
            
            if(this.stepsWithOffset === 0){
                this.x = 0;
                this.y = 0;
            }
            if(this.stepsWithOffset > 0 && this.stepsWithOffset < 10){
                this.y = 0;
                this.x = this.stepsWithOffset + 1;
            }
            if(this.stepsWithOffset > 9 && this.stepsWithOffset < 21){
                this.x = 12
                if(this.stepsWithOffset === 10){
                    this.y = this.stepsWithOffset-10;
                }else if(this.stepsWithOffset < 20){
                    this.y = this.stepsWithOffset-9;
                }else{
                    this.y = this.stepsWithOffset-8;
                }
            }
            if(this.stepsWithOffset > 20 && this.stepsWithOffset < 30){
                this.y = 12;
                this.x = 12 - (this.stepsWithOffset-19)
            }
            if(this.stepsWithOffset > 29){
                this.x = 0;
                if(this.stepsWithOffset === 30){
                    this.y = 12 - (this.stepsWithOffset-30)
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
                    this.offsetY = i*20
                }                
            }
            for(let i = 0; i<board.prisonExtra.currentPlayer.length; i++){
                if(board.prisonExtra.currentPlayer[i] === this){
                    this.offsetY = i*20;
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
        this.teleportTo = function(step){
            let oldStep = this.steps;

            this.steps = step;
            this.rolls = true;

            this.animateSteps(oldStep,this.steps,0)
        }
        this.animateSteps = function(from,to,dicesum){
            let self = this;
            clearInterval(this.timer)
            
            if(to <= from){
                to += 40
            };
            this.animationOffset = to-from;
            board.showDices = true;
            self.timer = setInterval(function(){
                if(self.animationOffset <= 0){
                    clearInterval(self.timer);
                    
                    board.boardPieces.forEach(function(b,i2) {b.currentPlayer.forEach(function(d,i3) {
                        if(d === self){
                            b.currentPlayer.splice(i3,1)
                        }
                    })})
                    if(self.to >= 40){
                        alert(self.name + " gick förbi start och fick då 200$")
                        self.money += 200;
                    }
                    to = to%40
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
                    playSound(sounds.movement)
                    if(((to-self.animationOffset)%40-1) === -1){
                        board.boardPieces[0].playerStep(true,self);
                    }else{
                        board.boardPieces[(to-self.animationOffset)%40].playerStep(true,self);
                    }
                    

                }
            },300);
        }
        
        this.rollDice = function(){
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
                        playSound(sounds.click)
                        counter *= 1.2;
                        if(counter > 1000){
                            playSound(sounds.click)
                            board.dice1 = dice1;
                            board.dice2 = dice2;
                            setTimeout(() => {
                                board.animateDices = false;
                                self.steps += dice1+dice2;
                                self.steps = self.steps%40;
                                self.animateSteps(oldStep,self.steps,diceSum)
                            }, 1000);                  
                        }else{
                            setTimeout(myFunction, counter);
                        }
                    }
                    setTimeout(myFunction, counter);
                    
                        
                    
                    
                }else{
                    turn = (turn+1)%players.length;
                    this.rolls = false;
                    this.numberOfRolls = 0;
                    board.dice1 = 0;
                    board.dice2 = 0;
                    
                }
            }else{
                if(this.rolls === false){
                    if(confirm("Vill du betala 50$ för att komma ut eller slå dubbelt?")){
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
                        }
                        this.rolls = true;
                        setTimeout(() => {
                            board.showDices = false;
                        }, 1000);
                    }
                }else{
                    turn = (turn+1)%players.length;
                    this.rolls = false;
                    this.numberOfRolls = 0;
                }
                
            }
        }
        
        board.boardPieces[0].currentPlayer.push(this);
    }
}


init();
update();


