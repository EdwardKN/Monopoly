var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");


var board;

var rotation = 0;

var players = [];

const drawScale = 2;

const pieces = [
    {
        name:"Brown 1",
        price:60,
        rent:[2,10,30,90,160,250]
    },
    {
        name:"Community Chest"
    },
    {
        name:"Brown 2",
        price:60,
        rent:[4,20,60,180,320,450]
    },
    {
        name:"Income tax",
        price:-200
    },
    {
        name:"Station 1",
        price:200
    },
    {
        name:"Light blue 1",
        price:100,
        rent:[6,30,90,270,400,550]
    },
    {
        name:"Chance",
    },
    {
        name:"Light blue 2",
        price:100,
        rent:[6,30,90,270,400,550]
    },
    {
        name:"Light blue 3",
        price:120,
        rent:[8,40,100,300,450,600]
    },
    {
        name:"Jail",
    },
    {
        name:"Pink 1",
        price:140,
        rent:[10,50,150,450,625,750]
    },
    {
        name:"Electric company",
        price:150
    },
    {
        name:"Pink 2",
        price:140,
        rent:[10,50,150,450,625,750]
    },
    {
        name:"Pink 3",
        price:160,
        rent:[12,60,180,500,700,900]
    },
    {
        name:"Station 2",
        price:200
    },
    {
        name:"Orange 1",
        price:180,
        rent:[14,70,200,550,750,950]
    },
    {
        name:"Community Chest",
    },
    {
        name:"Orange 2",
        price:180,
        rent:[14,70,200,550,750,950]
    },
    {
        name:"Orange 3",
        price:200,
        rent:[16,80,220,600,800,1000]
    },
    {
        name:"Free Parking",
    },
    {
        name:"Red 1",
        price:220,
        rent:[18,90,250,700,875,1050]
    },
    {
        name:"Chance"
    },
    {
        name:"Red 2",
        price:220,
        rent:[18,90,250,700,875,1050]
    },
    {
        name:"Red 3",
        price:240,
        rent:[20,100,300,750,925,1100]
    },
    {
        name:"Station 3",
        price:200
    },
    {
        name:"Yellow 1",
        price:260,
        rent:[22,110,330,800,975,1150]
    },
    {
        name:"Yellow 2",
        price:260,
        rent:[22,110,330,800,975,1150]
    },
    {
        name:"Water Company",
        price: 150
    },
    {
        name:"Yellow 3",
        price:280,
        rent:[24,120,360,850,1025,1200]
    },
    {
        name:"Go To Jail",
    },
    {
        name:"Green 1",
        price:300,
        rent:[26,130,390,900,1100,1275]
    },
    {
        name:"Green 2",
        price:300,
        rent:[26,130,390,900,1100,1275]
    },
    {
        name:"Community Chest"
    },
    {
        name:"Green 3",
        price:320,
        rent:[28,150,450,1000,1200,1400]
    },
    {
        name:"Station 4",
        price:200
    },
    {
        name:"Chance"
    },
    {
        name:"Blue 1",
        price:350,
        rent:[35,175,500,1100,1300,1500]
    },
    {
        name:"Super Tax",
        price:-100
    },
    {
        name:"Blue 2",
        price:400,
        rent:[50,200,600,1400,1700,2000]
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
        src:["./images/emptyPart.png","./images/brown.png","./images/light_blue.png","./images/pink.png","./images/orange.png","./images/red.png","./images/yellow.png","./images/green.png","./images/blue.png"]
    },
    corner:{
        src:["./images/emptyCorner.png","./images/go.png","./images/prison.png"]
    },
    player:{
        src:["./images/player.png"]
    }
};

var mouse = {
    x:0,
    y:0
}

window.addEventListener("resize",function(e){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})
window.addEventListener("mousemove",function(e){
    mouse = {
        x:e.x,
        y:e.y
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
function drawRotatedImage(x,y,w,h,img,angle,mirrored,cropX,cropY,cropW,cropH){
    let degree = angle * Math.PI / 180;
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

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    preRender(images);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    

    board = new Board();    

    players.push(new Player(images.player.img[0],players.length))
    players.push(new Player(images.player.img[0],players.length))

}

function animate(){
    requestAnimationFrame(animate);
    c.imageSmoothingEnabled = false;

    c.clearRect(0,0,canvas.width,canvas.height);

    board.update();
    c.font = "30px Arial";

    players.forEach(function(player,i,a) { 
        player.update(); 
        c.fillText(player.money, 10, 50*i + 50);
    })

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
        
        this.setImg = function(){
            this.side = (side+rotation)%4
            this.img = img[0];
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
                this.img = img[1]
            }
            if(this.n === 9 && this.side === 0){
                this.img = img[2]
            }
        }
                
        this.update = function () {
            this.setImg();
            let mouseSquareX = (to_grid_coordinate(mouse.x-416*drawScale,mouse.y).x/64) 
            let mouseSquareY = (to_grid_coordinate(mouse.x-416*drawScale,mouse.y).y/64)
            if(this.x/64*drawScale > mouseSquareX-1*drawScale && this.x/64*drawScale < mouseSquareX && side === 2 && this.n !== 9 && mouseSquareY >= 0*drawScale && mouseSquareY < 2*drawScale
            ||this.x/64*drawScale > mouseSquareX-2*drawScale && this.x/64*drawScale < mouseSquareX && side === 2 && this.n === 9 && mouseSquareY >= 0*drawScale && mouseSquareY < 2*drawScale

            ||this.x/64*drawScale > mouseSquareX-1*drawScale && this.x/64*drawScale < mouseSquareX && side === 0 && this.n !== 9 && mouseSquareY >= 11*drawScale && mouseSquareY < 13*drawScale
            ||this.x/64*drawScale > mouseSquareX-2*drawScale && this.x/64*drawScale < mouseSquareX && side === 0 && this.n === 9 && mouseSquareY >= 11*drawScale && mouseSquareY < 13*drawScale

            ||this.y/64*drawScale > mouseSquareY-1.5*drawScale && this.y/64*drawScale < mouseSquareY-0.5*drawScale && side === 3 && this.n !== 9 && mouseSquareX >= 11*drawScale && mouseSquareX < 13*drawScale
            ||this.y/64*drawScale > mouseSquareY-2*drawScale && this.y/64*drawScale < mouseSquareY && side === 3 && this.n === 9 && mouseSquareX >= 11*drawScale && mouseSquareX < 13*drawScale

            ||this.y/64*drawScale > mouseSquareY-1.5*drawScale && this.y/64*drawScale < mouseSquareY-0.5*drawScale && side === 1 && this.n !== 9 && mouseSquareX >= 0*drawScale && mouseSquareX < 2*drawScale
            ||this.y/64*drawScale > mouseSquareY-2*drawScale && this.y/64*drawScale < mouseSquareY && side === 1 && this.n === 9 && mouseSquareX >= 0*drawScale && mouseSquareX < 2*drawScale
            ){
                this.offsetY = -1;
            }else{
                this.offsetY = 0;
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
        this.playerStep = function (player){
            console.log(this.owner)
            if(this.piece.price < 0){
                player.money += this.piece.price;
            }else if(this.piece.price > 0 && player.money >= this.piece.price && this.owner === undefined){
                if(confirm("Vill du köpa " + this.piece.name + " för " + this.piece.price + "$?")){
                    player.money -= this.piece.price;
                    this.owner = player;
                }
            }else if(this.owner !== player){
                player -= this.piece.rent[this.level];
                this.owner += this.piece.rent[this.level];
            }
        }
    }
}

class Player{

    constructor(img,index){
        this.img = img;
        this.x = 0;
        this.y = 0;
        this.steps = 0;
        this.money = 2000;
        this.index = index
        this.offsetY = 1;
        this.stepsWithOffset = (this.steps - rotation*10)
        this.draw = function () {
            

            
            drawIsometricImage(800-this.x*64,700-this.y*64,this.img,false,0,0,32,32,0,-this.offsetY)
        }
        this.update = function () {
            this.draw();
        }
        this.updateVisual = function (){
            this.stepsWithOffset = 40 + (this.steps - rotation*10)

            if(this.steps >= 40){
                this.money += 200;
            }
            this.steps = this.steps%40;
            this.stepsWithOffset = this.stepsWithOffset%40;

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
            for(let i = 0; i<players.length; i++){
                if(i !== this.index){
                   if(players[i].steps === this.steps){
                    players[i].offsetY = 20*i
                    this.offsetY = 20*this.index
                   }else{
                    this.offsetY = 1;
                   }
            }
            }
        }
        
        this.rollDice = function(){
            let dice1 = randomIntFromRange(1,6);
            let dice2 = randomIntFromRange(1,6);

            this.steps += dice1+dice2;

            this.updateVisual();

            if(this.steps === 0){
                board.boardPieces[3][9].playerStep(this);
            }else{
                board.boardPieces[Math.floor((this.steps-1)/10)][(this.steps-1)%10].playerStep(this);
            }
            
        }
    }
}


init();
animate();


