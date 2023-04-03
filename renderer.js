var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");

c.imageSmoothingEnabled = false;


var board;

var rotation = 1;

const drawScale = 2;

var images = {
    board:{
        src:["./images/board.png"]
    },
    part:{
        src:["./images/emptyPart.png","./images/brown.png","./images/light_blue.png","./images/pink.png","./images/orange.png","./images/red.png","./images/yellow.png","./images/green.png","./images/blue.png"]
    },
    corner:{
        src:["./images/emptyCorner.png","./images/go.png","./images/prison.png"]
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

function init(){
    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    preRender(images);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    

    board = new Board();

}

function animate(){
    requestAnimationFrame(animate);

    c.clearRect(0,0,canvas.width,canvas.height);

    board.draw();

}

class Board{
    constructor(){
        this.boardPieces = [];
        for(let i = 0; i < 4; i++){
            let tmp = [];
            for(let n = 0; n < 10; n++){
                if(n === 9){
                    tmp.push(new BoardPiece(i,n,images.corner.img))
                }else{
                    tmp.push(new BoardPiece(i,n,images.part.img))
                }
            }
            this.boardPieces.push(tmp);
        }

        this.draw = function () {
            this.boardPieces.forEach(e => e.forEach(g => g.update()))
        }  
    }
}

class BoardPiece{
    constructor(side,n,img){
        this.side = side;
        this.n = n;
        this.img = img[0];
        this.offsetX = 0;
        this.offsetY = 0;
        this.x = 0;
        this.y = 0;
        this.imgSide = 0;
        
        if(this.side === 0){
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
        if(this.side === 2){
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
            if(this.side === 2 && this.n === 2 || this.side === 2 && this.n === 0){
                this.img = img[1];
            }
            if(this.side === 2 && this.n === 8 || this.side === 2 && this.n === 7 || this.side === 2 && this.n === 5){
                this.img = img[2];
            }
            if(this.side === 1 && this.n === 0 || this.side === 1 && this.n === 2 || this.side === 1 && this.n === 3){
                this.img = img[3];
            }
            if(this.side === 1 && this.n === 8 || this.side === 1 && this.n === 7 || this.side === 1 && this.n === 5){
                this.img = img[4];
            }
            if(this.side === 0 && this.n === 0 || this.side === 0 && this.n === 2 || this.side === 0 && this.n === 3){
                this.img = img[5];
            }
            if(this.side === 0 && this.n === 8 || this.side === 0 && this.n === 6 || this.side === 0 && this.n === 5){
                this.img = img[6];
            }
            if(this.side === 3 && this.n === 0 || this.side === 3 && this.n === 1 || this.side === 3 && this.n === 3){
                this.img = img[7];
            }
            if(this.side === 3 && this.n === 8 || this.side === 3 && this.n === 6){
                this.img = img[8];
            }
            if(this.n === 9 && this.side === 0){
                this.img = img[1]
            }
            if(this.n === 9 && this.side === 3){
                this.img = img[2]
            }
        }
                
        this.update = function () {
            this.setImg();
            let mouseSquareX = (to_grid_coordinate(mouse.x-416*drawScale,mouse.y).x/64) 
            let mouseSquareY = (to_grid_coordinate(mouse.x-416*drawScale,mouse.y).y/64)
            if(this.x/64*drawScale > mouseSquareX-1*drawScale && this.x/64*drawScale < mouseSquareX && side === 0 && this.n !== 9 && mouseSquareY >= 0*drawScale && mouseSquareY < 2*drawScale
            ||this.x/64*drawScale > mouseSquareX-2*drawScale && this.x/64*drawScale < mouseSquareX && side === 0 && this.n === 9 && mouseSquareY >= 0*drawScale && mouseSquareY < 2*drawScale

            ||this.x/64*drawScale > mouseSquareX-1*drawScale && this.x/64*drawScale < mouseSquareX && side === 2 && this.n !== 9 && mouseSquareY >= 11*drawScale && mouseSquareY < 13*drawScale
            ||this.x/64*drawScale > mouseSquareX-2*drawScale && this.x/64*drawScale < mouseSquareX && side === 2 && this.n === 9 && mouseSquareY >= 11*drawScale && mouseSquareY < 13*drawScale

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
    }
}

init();
animate();


