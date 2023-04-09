var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");
canvas.id = "game"


var board;

var rotation = 0;

var turn = 0;

var players = [];

const drawScale = 2;

var offsets = {
    x:Math.floor(window.innerWidth/2) - 832*drawScale/2,
    y:Math.floor(window.innerHeight/2) - 416*drawScale/2
}

const pieces = [
    {
        name:"Brun 1",
        price:60,
        rent:[2,10,30,90,160,250],
        housePrice:50,
        group:"Brown"
    },
    {
        name:"Allmänning",
        type:"community Chest"
    },
    {
        name:"Brun 2",
        price:60,
        rent:[4,20,60,180,320,450],
        housePrice:50,
        group:"Brown"
    },
    {
        name:"Inkomstskatt",
        type:"income tax"
    },
    {
        name:"Södra stationen",
        price:200,
        type:"station"
    },
    {
        name:"Ljusblå 1",
        price:100,
        rent:[6,30,90,270,400,550],
        housePrice:50,
        group:"light blue"
    },
    {
        name:"Chans",
        type:"chance"
    },
    {
        name:"Ljusblå 2",
        price:100,
        rent:[6,30,90,270,400,550],
        housePrice:50,
        group:"light blue"
    },
    {
        name:"Ljusblå 3",
        price:120,
        rent:[8,40,100,300,450,600],
        housePrice:50,
        group:"light blue"
    },
    {
        name:"Fängelse",
    },
    {
        name:"Rosa 1",
        price:140,
        rent:[10,50,150,450,625,750],
        housePrice:100,
        group:"pink"
    },
    {
        name:"Elverket",
        price:150,
        type:"utility"
    },
    {
        name:"Rosa 2",
        price:140,
        rent:[10,50,150,450,625,750],
        housePrice:100,
        group:"pink"
    },
    {
        name:"Rosa 3",
        price:160,
        rent:[12,60,180,500,700,900],
        housePrice:100,
        group:"pink"
    },
    {
        name:"Östra Stationen",
        price:200,
        type:"station"
    },
    {
        name:"Orange 1",
        price:180,
        rent:[14,70,200,550,750,950],
        housePrice:100,
        group:"orange"
    },
    {
        name:"Allmänning",
        type:"community Chest"
    },
    {
        name:"Orange 2",
        price:180,
        rent:[14,70,200,550,750,950],
        housePrice:100,
        group:"orange"
    },
    {
        name:"Orange 3",
        price:200,
        rent:[16,80,220,600,800,1000],
        housePrice:100,
        group:"orange"
    },
    {
        name:"Fri parkering",
    },
    {
        name:"Röd 1",
        price:220,
        rent:[18,90,250,700,875,1050],
        housePrice:150,
        group:"red"
    },
    {
        name:"Chans",
        type:"chance"
    },
    {
        name:"Röd 2",
        price:220,
        rent:[18,90,250,700,875,1050],
        housePrice:150,
        group:"red"
    },
    {
        name:"Röd 3",
        price:240,
        rent:[20,100,300,750,925,1100],
        housePrice:150,
        group:"red"
    },
    {
        name:"Centralstationen",
        price:200,
        type:"station"
    },
    {
        name:"Gul 1",
        price:260,
        rent:[22,110,330,800,975,1150],
        housePrice:150,
        group:"yellow"
    },
    {
        name:"Gul 2",
        price:260,
        rent:[22,110,330,800,975,1150],
        housePrice:150,
        group:"yellow"
    },
    {
        name:"Vattenledningsverket",
        price: 150,
        type:"utility"
    },
    {
        name:"Gul 3",
        price:280,
        rent:[24,120,360,850,1025,1200],
        housePrice:150,
        group:"yellow"
    },
    {
        name:"Gå till finkan",
    },
    {
        name:"Grön 1",
        price:300,
        rent:[26,130,390,900,1100,1275],
        housePrice:200,
        group:"green"
    },
    {
        name:"Grön 2",
        price:300,
        rent:[26,130,390,900,1100,1275],
        housePrice:200,
        group:"green"
    },
    {
        name:"Allmänning",
        type:"community Chest"
    },
    {
        name:"Grön 3",
        price:320,
        rent:[28,150,450,1000,1200,1400],
        housePrice:200,
        group:"green"
    },
    {
        name:"Norra stationen",
        price:200,
        type:"station"
    },
    {
        name:"Chans",
        type:"chance"
    },
    {
        name:"Blå 1",
        price:350,
        rent:[35,175,500,1100,1300,1500],
        housePrice:200,
        group:"blue"
    },
    {
        name:"Lyxskatt",
        price:-100
    },
    {
        name:"Blå 2",
        price:400,
        rent:[50,200,600,1400,1700,2000],
        housePrice:200,
        group:"blue"
    },
    {
        name:"Start",
    }
]

var images = {
    part:{
        src:["./images/plates/emptyPart.png","./images/plates/brown.png","./images/plates/light_blue.png",
        "./images/plates/pink.png","./images/plates/orange.png",
        "./images/plates/red.png","./images/plates/yellow.png",
        "./images/plates/green.png","./images/plates/blue.png",
        "./images/plates/chance.png","./images/plates/chance2.png","./images/plates/chance3.png",
        "./images/plates/train.png", "./images/plates/water.png", "./images/plates/electric.png",
        "./images/plates/supertax.png","./images/plates/chest.png","./images/plates/incometax.png"]
    },
    corner:{
        src:["./images/corners/go.png","./images/corners/prison.png","./images/corners/parking.png","./images/corners/gotoprison.png"]
    },
    player:{
        src:["./images/players/player.png","./images/players/player2.png","./images/players/player3.png"]
    },
    background:{
        src:["./images/static/insideboard.png","./images/static/realbackground.png"]
    },
    house:{
        src:["./images/buildings/house.png","./images/buildings/hotel.png"]
    },
    dice:{
        src:["./images/dices/dices.png"]
    },
    buttons:{
        src:["./images/buttons/rolldice.png","./images/buttons/nextplayer.png"]
    }
};

var mouse = {
    x:0,
    y:0,
    realX:0,
    realY:0
}
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
        realY:e.y
    }
})

window.addEventListener("mousedown",function(e){
    board.boardPieces.forEach(function(side){
        side.forEach(function(piece){
            piece.click();
        })
    })
    board.diceClick();
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
function drawIsometricImage(x,y,img,mirror,cropX,cropY,cropW,cropH,offsetX,offsetY){
    drawRotatedImage(to_screen_coordinate(x*drawScale,y*drawScale).x + 832/2*drawScale - 64*drawScale + offsetX*drawScale,to_screen_coordinate(x*drawScale,y*drawScale).y + offsetY*drawScale,cropW*drawScale,cropH*drawScale,img,0,mirror,cropX,cropY,cropW,cropH)
}


function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
};

function init(){
    document.body.appendChild(canvas);
    canvas.style.zIndex = -100;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    preRender(images);



    board = new Board();  

    players.push(new Player(images.player.img[0],players.length,"green","Spelare 1"))
    players.push(new Player(images.player.img[1],players.length,"yellow","Spelare 2"))
    players.push(new Player(images.player.img[2],players.length,"purple","Spelare 3"))

}

function update(){
    requestAnimationFrame(update);
    c.imageSmoothingEnabled = false;

    c.clearRect(0,0,canvas.width,canvas.height);
    showBackground();

    board.update();
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
    })

    c.fillStyle = "black";
    c.font = "50px Brush Script MT";
    c.textAlign = "center";
    c.fillText("Just nu:" + players[turn].name, canvas.width/2, canvas.height/2 + 50);
    
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
        this.prisonExtra = new BoardPiece(-1,-1,[])
        this.showDices = false;
        for(let i = 0; i < 4; i++){
            let tmp = [];
            for(let n = 0; n < 10; n++){
                if(n === 9){
                    tmp.push(new BoardPiece(i,n,images.corner.img,pieces[i*10+n]))
                }else{
                    tmp.push(new BoardPiece(i,n,images.part.img,pieces[i*10+n]))
                }
            }
            this.boardPieces.push(tmp);
        }

        this.update = function () {
            this.boardPieces.forEach(e => e.forEach(g => g.update()))
            this.boardPieces.forEach(e => e.forEach(g => g.drawHouses()))
            this.boardPieces.forEach(e => e.forEach(g => g.currentPlayer.forEach(p => p.update())))
            this.prisonExtra.currentPlayer.forEach(p => p.update())
            this.showDice()
        }  
        this.randomizeDice = function () {
            this.dice1Type = randomIntFromRange(0,3);
            this.dice2Type = randomIntFromRange(0,3);
        }

        this.showDice = function () {
            if(players[turn].animationOffset > 0 ||this.showDices === true){
            drawIsometricImage(500,500,images.dice.img[0],false,this.dice1Type*64,(this.dice1-1)*64,64,64,0,0)
            drawIsometricImage(550,400,images.dice.img[0],false,this.dice2Type*64,(this.dice2-1)*64,64,64,0,0)
            }else{
                if(players[turn].rolls === false){
                    if(detectCollition(canvas.width/2 - 107/2*drawScale,canvas.height/2 + 42*drawScale,107*drawScale,23*drawScale,mouse.realX,mouse.realY,1,1)){
                        drawIsometricImage(0,0,images.buttons.img[0],false,107,0,107,23,10,250)
                    }else{
                        drawIsometricImage(0,0,images.buttons.img[0],false,0,0,107,23,10,250)
                    }
                }else{
                    if(detectCollition(canvas.width/2 - 107/2*drawScale,canvas.height/2 + 42*drawScale,107*drawScale,23*drawScale,mouse.realX,mouse.realY,1,1)){
                        drawIsometricImage(0,0,images.buttons.img[1],false,107,0,107,23,10,250)
                    }else{
                        drawIsometricImage(0,0,images.buttons.img[1],false,0,0,107,23,10,250)
                    }
                }
                
            }
        }
        this.diceClick = function(){
            if(players[turn].animationOffset === 0){
                if(detectCollition(canvas.width/2 - 107/2*drawScale,canvas.height/2 + 42*drawScale,107*drawScale,23*drawScale,mouse.realX,mouse.realY,1,1)){
                    players[turn].rollDice()
                }
            }
        }
    }
}

class BoardPiece{
    constructor(side,n,img,piece){
        this.side = side;
        this.n = n;
        this.img = img[0];
        this.offsetX = 0;
        this.offsetY = 0;
        this.x = 0;
        this.y = 0;
        this.imgSide = 0;
        this.piece = piece;
        this.owner = undefined;
        this.level = 0;
        this.hover = false;
        this.currentPlayer = [];
        this.inJail = false;
        
        this.setImg = function(){
            this.side = (side+rotation)%4
            if(this.side === 2){
                this.x = 128+this.n*64;
                this.y = 0;
                this.imgSide = 1;
                if(this.n === 9){
                    this.x = 128+this.n*64;
                    this.y = 0;
                }
            }
    
            if(this.side === 1){
                this.x = 32;
                this.y = -32 + 128*5+ - this.n*64;
                this.imgSide = 3;
                if(this.n === 9){
                    this.x = 0;
                    this.y = 0;
                }
            }
            if(this.side === 0){
                this.x = 128*5-this.n*64;
                this.y = 64*11;
                this.imgSide =0;
                if(this.n === 9){
                    this.x = 0;
                    this.y = 128+this.n*64;
                }
            }
            if(this.side === 3){
                this.x = 32 + 64*11
                this.y = -32 + 128+this.n*64;
                this.imgSide = 2;
                if(this.n === 9){
                    this.x = 128+this.n*64;
                    this.y = 128+this.n*64;
                }
            }
        }
                
        this.update = function () {
            this.setImg();
            let mouseSquareX = (to_grid_coordinate(mouse.x-416*drawScale,mouse.y).x/64) 
            let mouseSquareY = (to_grid_coordinate(mouse.x-416*drawScale,mouse.y).y/64)
            if(this.x/64*drawScale > mouseSquareX-1*drawScale && this.x/64*drawScale < mouseSquareX && this.side === 2 && this.n !== 9 && mouseSquareY >= 0*drawScale && mouseSquareY < 2*drawScale
            ||this.x/64*drawScale > mouseSquareX-2*drawScale && this.x/64*drawScale < mouseSquareX && this.side === 2 && this.n === 9 && mouseSquareY >= 0*drawScale && mouseSquareY < 2*drawScale

            ||this.x/64*drawScale > mouseSquareX-1*drawScale && this.x/64*drawScale < mouseSquareX && this.side === 0 && this.n !== 9 && mouseSquareY >= 11*drawScale && mouseSquareY < 13*drawScale
            ||this.x/64*drawScale > mouseSquareX-2*drawScale && this.x/64*drawScale < mouseSquareX && this.side === 0 && this.n === 9 && mouseSquareY >= 11*drawScale && mouseSquareY < 13*drawScale

            ||this.y/64*drawScale > mouseSquareY-1.5*drawScale && this.y/64*drawScale < mouseSquareY-0.5*drawScale && this.side === 3 && this.n !== 9 && mouseSquareX >= 11*drawScale && mouseSquareX < 13*drawScale
            ||this.y/64*drawScale > mouseSquareY-2*drawScale && this.y/64*drawScale < mouseSquareY && this.side === 3 && this.n === 9 && mouseSquareX >= 11*drawScale && mouseSquareX < 13*drawScale

            ||this.y/64*drawScale > mouseSquareY-1.5*drawScale && this.y/64*drawScale < mouseSquareY-0.5*drawScale && this.side === 1 && this.n !== 9 && mouseSquareX >= 0*drawScale && mouseSquareX < 2*drawScale
            ||this.y/64*drawScale > mouseSquareY-2*drawScale && this.y/64*drawScale < mouseSquareY && this.side === 1 && this.n === 9 && mouseSquareX >= 0*drawScale && mouseSquareX < 2*drawScale
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
            if(this.n !== 9){
                drawIsometricImage(this.x,this.y,this.img,false,96*this.imgSide,0,96,48,this.offsetX,this.offsetY);
            }else{
                drawIsometricImage(this.x,this.y,this.img,false,128*this.imgSide,0,128,64,this.offsetX,this.offsetY);
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
                this.show = true;
                
                alert(this.info())
                if(this.owner === players[turn]){
                    let ownAll = true;
                    for(let i = 0; i<board.boardPieces[this.side].length; i++){
                        if(board.boardPieces[this.side][i] !== this){
                            if(board.boardPieces[this.side][i].piece.group === this.piece.group){
                                if(this.owner !== board.boardPieces[this.side][i].owner){
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
                        if(confirm("Vill du köpa " + this.piece.name + " för " + this.piece.price + "$?" + "\n" + "\n"+ this.info())){
                            player.money -= this.piece.price;
                            this.owner = player;
                            player.ownedPlaces.push(this);
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
                        player.money -= this.piece.rent[this.level];
                        this.owner.money += this.piece.rent[this.level];
                        alert(this.owner.name + " fick precis " + (this.piece.rent[this.level]) + "$ av " + player.name)

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
        if(this.side === 0 && this.n === 2 || this.side === 0 && this.n === 0){
            this.img = img[1];
        }
        if(this.side === 0 && this.n === 8 || this.side === 0 && this.n === 7 || this.side === 0 && this.n === 5){
            this.img = img[2];
        }
        if(this.side === 1 && this.n === 0 || this.side === 1 && this.n === 2 || this.side === 1 && this.n === 3){
            this.img = img[3];
        }
        if(this.side === 1 && this.n === 8 || this.side === 1 && this.n === 7 || this.side === 1 && this.n === 5){
            this.img = img[4];
        }
        if(this.side === 2 && this.n === 0 || this.side === 2 && this.n === 2 || this.side === 2 && this.n === 3){
            this.img = img[5];
        }
        if(this.side === 2 && this.n === 8 || this.side === 2 && this.n === 6 || this.side === 2 && this.n === 5){
            this.img = img[6];
        }
        if(this.side === 3 && this.n === 0 || this.side === 3 && this.n === 1 || this.side === 3 && this.n === 3){
            this.img = img[7];
        }
        if(this.side === 3 && this.n === 8 || this.side === 3 && this.n === 6){
            this.img = img[8];
        }
        if(this.n === 9 && this.side === 3){
            this.img = img[0]
        }
        if(this.n === 9 && this.side === 0){
            this.img = img[1]
        }
        if(this.n === 9 && this.side === 1){
           this.img = img[2]
        }
        if(this.n === 9 && this.side === 2){
           this.img = img[3]
        }
        if(this.n === 6 && this.side === 0){
            this.img = img[11]
        }
        if(this.n === 1 && this.side === 2){
            this.img = img[9]
        }
        if(this.n === 5 && this.side === 3){
            this.img = img[10]
        }
        if(this.n === 4){
            this.img = img[12]
        }
        if(this.n === 7 && this.side === 2){
            this.img = img[13]
        }
        if(this.n === 1 && this.side === 1){
            this.img = img[14]
        }
        if(this.n === 7 && this.side === 3){
            this.img = img[15]
        }
        if(this.side === 0 && this.n === 1 || this.side === 1 && this.n === 6|| this.side === 3 && this.n === 2){
            this.img = img[16];
        }
        if(this.n === 3 && this.side === 0){
            this.img = img[17]
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
        this.stepsWithOffset = (this.steps - rotation*10)
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
            this.stepsWithOffset = 40 + (this.steps + (rotation%4)*10) - this.animationOffset
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
            if(tmpSteps === 0){
                for(let i = 0; i<board.boardPieces[3][9].currentPlayer.length; i++){
                    if(board.boardPieces[3][9].currentPlayer[i] === this){
                        this.offsetY = i*20
                    }
                }
            }else{
                for(let i = 0; i<board.boardPieces[Math.floor((tmpSteps-1)/10)][(tmpSteps-1)%10].currentPlayer.length; i++){
                    if(board.boardPieces[Math.floor((tmpSteps-1)/10)][(tmpSteps-1)%10].currentPlayer[i] === this){
                        this.offsetY = i*20
                    }                
                }
                for(let i = 0; i<board.prisonExtra.currentPlayer.length; i++){
                    if(board.prisonExtra.currentPlayer[i] === this){
                        this.offsetY = i*20;
                    }
                }

  
            }
        }
        this.goToPrison = function(){
            alert("Gå till finkan!")
            self.teleportTo(10)
            self.inJail = true;
            self.rolls = true;
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
            self.timer = setInterval(function(){
                if(self.animationOffset <= 0){
                    clearInterval(self.timer);
                    
                    board.boardPieces.forEach(function(e,i1) {e.forEach(function(b,i2) {b.currentPlayer.forEach(function(d,i3) {
                        if(d === self){
                            board.boardPieces[i1][i2].currentPlayer.splice(i3,1)
                        }
                    })})})
                    if(self.to >= 40){
                        alert(self.name + " gick förbi start och fick då 200$")
                    }
                    to = to%40
                    if(to === 0){
                        board.boardPieces[3][9].playerStep(false,self);
                    }else{
                        if(self.inJail === true){
                            board.prisonExtra.playerStep(true,self);
                        }else{
                            board.boardPieces[Math.floor((to-1)/10)][(to-1)%10].playerStep(false,self,dicesum);
                        }
                    }
                    if(to === 30){
                        this.goToPrison()
                    }

                }else{
                    board.boardPieces.forEach(function(e,i1) {e.forEach(function(b,i2) {b.currentPlayer.forEach(function(d,i3) {
                        if(d === self){
                            board.boardPieces[i1][i2].currentPlayer.splice(i3,1)
                        }
                    })})})

                    self.animationOffset--;
                    if(((to-self.animationOffset)%40-1) === -1){
                        board.boardPieces[3][9].playerStep(true,self);
                    }else{
                        
                        board.boardPieces[Math.floor(((to-self.animationOffset)%40-1)/10)][((to-self.animationOffset)%40-1)%10].playerStep(true,self);
                    }
                    

                }
            },500);
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

                    board.randomizeDice();
                    board.dice1 = dice1;
                    board.dice2 = dice2;

                    this.steps += dice1+dice2;
                    if(this.steps >= 40){
                        this.money+=200
                    }
                    this.steps = this.steps%40;
                    
                    this.animateSteps(oldStep,this.steps,diceSum)
                    
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
                        this.inJail = false;
                        this.steps = 10;
                        this.rolls = true;
                        board.prisonExtra.currentPlayer.forEach(function(e,i){
                            if(e === this){
                                board.prisonExtra.currentPlayer.splice(i,1)
                            }
                        })
                    }else{
                        let dice1 = randomIntFromRange(1,6);
                        let dice2 = randomIntFromRange(1,6);
                        board.randomizeDice();
                        board.dice1 = dice1;
                        board.dice2 = dice2;
                        board.showDices = true;

                        if(dice1 === dice2){
                            this.inJail = false;
                            this.steps = 10;
                            board.prisonExtra.currentPlayer.forEach(function(e,i){
                                if(e === this){
                                    board.prisonExtra.currentPlayer.splice(i,1)
                                }
                            })
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
        
        board.boardPieces[3][9].currentPlayer.push(this);
    }
}


init();
update();


