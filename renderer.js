var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");
canvas.id = "game"


var board;

var rotation = 0;

var turn = 0;

var players = [];

const drawScale = 2;

var offsets = {
    x:Math.floor(window.innerWidth/2) - 832,
    y:Math.floor(window.innerHeight/2) - 416
}

const pieces = [
    {
        name:"Brown 1",
        price:60,
        rent:[2,10,30,90,160,250],
        housePrice:50,
        group:"Brown"
    },
    {
        name:"Community Chest",
        type:"community Chest"
    },
    {
        name:"Brown 2",
        price:60,
        rent:[4,20,60,180,320,450],
        housePrice:50,
        group:"Brown"
    },
    {
        name:"Income tax",
        price:-200
    },
    {
        name:"Station 1",
        price:200,
        type:"station"
    },
    {
        name:"Light blue 1",
        price:100,
        rent:[6,30,90,270,400,550],
        housePrice:50,
        group:"light blue"
    },
    {
        name:"Chance",
        type:"chance"
    },
    {
        name:"Light blue 2",
        price:100,
        rent:[6,30,90,270,400,550],
        housePrice:50,
        group:"light blue"
    },
    {
        name:"Light blue 3",
        price:120,
        rent:[8,40,100,300,450,600],
        housePrice:50,
        group:"light blue"
    },
    {
        name:"Jail",
    },
    {
        name:"Pink 1",
        price:140,
        rent:[10,50,150,450,625,750],
        housePrice:100,
        group:"pink"
    },
    {
        name:"Electric company",
        price:150,
        type:"utility"
    },
    {
        name:"Pink 2",
        price:140,
        rent:[10,50,150,450,625,750],
        housePrice:100,
        group:"pink"
    },
    {
        name:"Pink 3",
        price:160,
        rent:[12,60,180,500,700,900],
        housePrice:100,
        group:"pink"
    },
    {
        name:"Station 2",
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
        name:"Community Chest",
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
        name:"Free Parking",
    },
    {
        name:"Red 1",
        price:220,
        rent:[18,90,250,700,875,1050],
        housePrice:150,
        group:"red"
    },
    {
        name:"Chance",
        type:"chance"
    },
    {
        name:"Red 2",
        price:220,
        rent:[18,90,250,700,875,1050],
        housePrice:150,
        group:"red"
    },
    {
        name:"Red 3",
        price:240,
        rent:[20,100,300,750,925,1100],
        housePrice:150,
        group:"red"
    },
    {
        name:"Station 3",
        price:200,
        type:"station"
    },
    {
        name:"Yellow 1",
        price:260,
        rent:[22,110,330,800,975,1150],
        housePrice:150,
        group:"yellow"
    },
    {
        name:"Yellow 2",
        price:260,
        rent:[22,110,330,800,975,1150],
        housePrice:150,
        group:"yellow"
    },
    {
        name:"Water Company",
        price: 150,
        type:"utility"
    },
    {
        name:"Yellow 3",
        price:280,
        rent:[24,120,360,850,1025,1200],
        housePrice:150,
        group:"yellow"
    },
    {
        name:"Go To Jail",
    },
    {
        name:"Green 1",
        price:300,
        rent:[26,130,390,900,1100,1275],
        housePrice:200,
        group:"green"
    },
    {
        name:"Green 2",
        price:300,
        rent:[26,130,390,900,1100,1275],
        housePrice:200,
        group:"green"
    },
    {
        name:"Community Chest",
        type:"community Chest"
    },
    {
        name:"Green 3",
        price:320,
        rent:[28,150,450,1000,1200,1400],
        housePrice:200,
        group:"green"
    },
    {
        name:"Station 4",
        price:200,
        type:"station"
    },
    {
        name:"Chance",
        type:"chance"
    },
    {
        name:"Blue 1",
        price:350,
        rent:[35,175,500,1100,1300,1500],
        housePrice:200,
        group:"blue"
    },
    {
        name:"Super Tax",
        price:-100
    },
    {
        name:"Blue 2",
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
    board:{
        src:["./images/board.png"]
    },
    part:{
        src:["./images/emptyPart.png","./images/brown.png","./images/light_blue.png",
        "./images/pink.png","./images/orange.png",
        "./images/red.png","./images/yellow.png",
        "./images/green.png","./images/blue.png",
        "/images/chance.png","/images/chance2.png","/images/chance3.png",
        "/images/train.png", "/images/water.png"]
    },
    corner:{
        src:["./images/go.png","./images/prison.png","./images/parking.png","./images/gotoprison.png"]
    },
    player:{
        src:["./images/player.png","./images/player2.png","./images/player3.png"]
    },
    backGround:{
        src:["./images/insideboard.png","./images/background.png"]
    },
    house:{
        src:["./images/house.png","./images/hotel.png"]
    }
};

var mouse = {
    x:0,
    y:0
}
window.addEventListener("resize", e=> {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    offsets = {
        x:Math.floor(window.innerWidth/2) - 832,
        y:Math.floor(window.innerHeight/2) - 416
    }
})

canvas.addEventListener("mousemove",function(e){
    mouse = {
        x:e.offsetX - offsets.x,
        y:e.offsetY - offsets.y
    }
})

window.addEventListener("mousedown",function(e){
    board.boardPieces.forEach(function(side){
        side.forEach(function(piece){
            piece.click();
        })
    })
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

    players.push(new Player(images.player.img[0],players.length,"green"))
    players.push(new Player(images.player.img[1],players.length,"yellow"))
    players.push(new Player(images.player.img[2],players.length,"purple"))

}

function update(){
    requestAnimationFrame(update);
    c.imageSmoothingEnabled = false;

    c.clearRect(0,0,canvas.width,canvas.height);
    showBackground();

    board.update();
    c.fillStyle = "black";
    c.font = "20px Arial";


    players.forEach(function(player,i,a) { 
        c.fillText(player.name + ": " + player.money + "$", 10, 40*i + 70);
    })
    c.fillText("Just nu: Player"+(turn+1), 10, players.length*40 + 70);
    
}

function showBackground(){
    for(let x = -1; x < 2; x++){
        for(let y = -1; y < 2; y++){
            drawIsometricImage(-352 + 832*x ,352+824*y,images.backGround.img[1],false,0,0,832,416,0,0)

        }
    }
    drawIsometricImage(-92,352,images.backGround.img[0],false,0,0,572,286,0,0)
}

class Board{
    constructor(){
        this.boardPieces = [];
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
        this.click = function(){
            if(this.hover === true){
                this.show = true;
                console.log("---------")
                if(this.owner !== undefined){
                    console.log(this.owner.name)
                }
                if(this.piece.name !== undefined){
                    console.log(this.piece.name)
                }
                console.log(this.level)
                if(this.piece.price !== undefined){
                    console.log(this.piece.price)
                }
                if(this.piece.rent !== undefined){
                    this.piece.rent.forEach(e => {
                        console.log(e)
                    })
                }
                this.currentPlayer.forEach(e => {
                    console.log(e.name)
                })
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
        this.playerStep = function (player,diceRoll){
            this.currentPlayer.push(player);

            if(this.piece.price < 0){
                player.money += this.piece.price;
            }else if(this.piece.price > 0 && player.money >= this.piece.price && this.owner === undefined){
                setTimeout(() => {
                    if(confirm("Vill du köpa " + this.piece.name + " för " + this.piece.price + "$?")){
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
                    console.log(this.owner.name + " fick precis " + (diceRoll * multiply) + "$")
                    
                }else if(this.piece.type === "station"){
                    let tmp = -1;
                    this.owner.ownedPlaces.forEach(e => {
                        if(e.piece.type === "station"){
                            tmp++;
                        }
                    })
                    player.money -=  25 * Math.pow(2,tmp);
                    this.owner.money += 25 * Math.pow(2,tmp);
                    console.log(this.owner.name + " fick precis " + (25 * Math.pow(2,tmp)) + "$")

                }else{
                    player.money -= this.piece.rent[this.level];
                    this.owner.money += this.piece.rent[this.level];
                    console.log(this.owner.name + " fick precis " + (this.piece.rent[this.level]) + "$")

                }
            }else if(this.piece.type === "chance"){
                let random = randomIntFromRange(1,13)
                console.log(random)
                if(random === 1){
                    player.teleportTo(0)
                    player.money += 200;
                }
                if(random === 2){
                    if(player.step >= 24){
                        player.money+=200;   
                    }
                    player.teleportTo(24)
                }
                if(random === 3){
                    if(player.step >= 11){
                        player.money+=200;   
                    }
                    player.teleportTo(11)
                }
                if(random === 4){
                    if(player.step >= 0 || player.step >= 35){
                        player.money+=200;
                        player.teleportTo(5)
                    }
                    if(player.step >= 5 && player.step < 15){
                        player.teleportTo(15)
                    }
                    if(player.step >= 15 && player.step < 25){
                        player.teleportTo(25)
                    }
                    if(player.step >= 25 && player.step < 35){
                        player.teleportTo(35)
                    }
                }
                if(random === 5){
                    player.money += 50;
                }
                if(random === 6){
                    //get out of jail
                }
                if(random === 7){
                    player.teleportTo(player.steps-3)
                }
                if(random === 8){
                    player.teleportTo(10)
                    player.inJail = true;
                }
                if(random === 9){
                    // pay 25 för varje hus och 100 för alla hotell
                }
                if(random === 10){
                    // konstig
                }
                if(random === 11){
                    player.teleportTo(39);
                }
                if(random === 12){
                    player.money -= (players.length-1)*50
                    players.forEach(e=> {if(e !== player){e.money+=50}})
                }
                if(random === 13){
                    player.money += 150
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
    }
    
}

class Player{

    constructor(img,index,color){
        this.name = "Player" + (index+1);
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
        this.draw = function () {
            drawIsometricImage(800-this.x*64,700-this.y*64,this.img,false,0,0,32,32,0,-this.offsetY)
        }
        this.update = function () {
            this.updateVisual();
            this.draw();
        }
        this.updateVisual = function (){
            
            if(this.stepsWithOffset === 0){
                this.x = 0;
                this.y = 0;
            }
            if(this.stepsWithOffset > 0 && this.stepsWithOffset < 10){
                this.y = 0;
                this.x = this.steps + 1;
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
            
            if(this.inJail === false){
                this.stepsWithOffset = 40 + (this.steps + (rotation%4)*10)
                this.stepsWithOffset = this.stepsWithOffset%40;
            }else{
                this.stepsWithOffset = 40 + (10 + (rotation%4)*10)
                this.stepsWithOffset = this.stepsWithOffset%40;

                this.x = 11
                this.y = 1;
            }
            

            if(this.steps === 0){
                for(let i = 0; i<board.boardPieces[3][9].currentPlayer.length; i++){
                    if(board.boardPieces[3][9].currentPlayer[i] === this){
                        this.offsetY = i*20
                    }
                }
            }else{
                for(let i = 0; i<board.boardPieces[Math.floor((this.steps-1)/10)][(this.steps-1)%10].currentPlayer.length; i++){
                    if(board.boardPieces[Math.floor((this.steps-1)/10)][(this.steps-1)%10].currentPlayer[i] === this){
                        this.offsetY = i*20
                    }                
                }
            }
            
        }
        this.teleportTo = function(step){
            if(this.steps === 0){
                let index = board.boardPieces[3][9].currentPlayer.indexOf(this);
                board.boardPieces[3][9].currentPlayer.splice(index,1)
            }else{
                let index = board.boardPieces[Math.floor((this.steps-1)/10)][(this.steps-1)%10].currentPlayer.indexOf(this);
                board.boardPieces[Math.floor((this.steps-1)/10)][(this.steps-1)%10].currentPlayer.splice(index,1) 
            }
            this.steps = step;
            this.rolls = true;

            if(this.steps === 0){
                board.boardPieces[3][9].playerStep(this);
            }else{
                board.boardPieces[Math.floor((this.steps-1)/10)][(this.steps-1)%10].playerStep(this,0);
            }
        }
        
        this.rollDice = function(){
            if(this.inJail === false){
                if(this.rolls === false){
                    if(this.steps === 0){
                        let index = board.boardPieces[3][9].currentPlayer.indexOf(this);
                        board.boardPieces[3][9].currentPlayer.splice(index,1)
                    }else{
                        let index = board.boardPieces[Math.floor((this.steps-1)/10)][(this.steps-1)%10].currentPlayer.indexOf(this);
                        board.boardPieces[Math.floor((this.steps-1)/10)][(this.steps-1)%10].currentPlayer.splice(index,1) 
                    }
                    let dice1 = randomIntFromRange(1,6);
                    let dice2 = randomIntFromRange(1,6);
                    console.log(dice1,dice2)
                    if(dice1 === dice2){
                        if(this.numberOfRolls === 3){
                            this.steps = 10;
                            players.forEach(e => {e.updateVisual();})
                        }
                        this.numberOfRolls++;
                        this.rolls = false;
                    }else{
                        this.rolls = true;
                    }
                    let diceSum = dice1+dice2;
        
                    this.steps += dice1+dice2;
                    if(this.steps >= 40){
                        this.money+=200
                    }
                    this.steps = this.steps%40;
                    

                    if(this.steps === 30){
                        this.steps = 10;
                        this.inJail = true;
                    }


        
                    if(this.steps === 0){
                        board.boardPieces[3][9].playerStep(this);
                    }else{
                        board.boardPieces[Math.floor((this.steps-1)/10)][(this.steps-1)%10].playerStep(this,diceSum);
                    }
                }else{
                    turn = (turn+1)%players.length;
                    this.rolls = false;
                    this.numberOfRolls = 0;
                    
                }
            }else{
                if(confirm("Vill du betala 50$ för att komma ut eller slå dubbelt?")){
                    this.money -= 50;
                    this.inJail = false;
                }else{
                    let dice1 = randomIntFromRange(1,6);
                    let dice2 = randomIntFromRange(1,6);
                
                    if(dice1 === dice2){
                        this.inJail = false;
                    }
                }
                turn = (turn+1)%players.length;
            }
        }
        
        board.boardPieces[3][9].currentPlayer.push(this);
    }
}


init();
update();


