var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");
canvas.id = "game"

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

    buttons.forEach(e =>{
        e.click();
    })

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
function drawRotatedImage(x,y,w,h,img,angle,mirrored,cropX,cropY,cropW,cropH,offset){
    let degree = angle * Math.PI / 180;
    if(offset){
        x+= offsets.x;
        y+= offsets.y
    }

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
    drawRotatedImage(to_screen_coordinate(x*drawScale,y*drawScale).x + 832/2*drawScale - 64*drawScale + offsetX*drawScale,to_screen_coordinate(x*drawScale,y*drawScale).y + offsetY*drawScale,cropW*scaleOfThis,cropH*scaleOfThis,img,0,mirror,cropX,cropY,cropW,cropH,true)
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

function init(){
    document.body.appendChild(canvas);
    canvas.style.zIndex = -100;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    preRender(images);

    loadSounds(sounds);

    board = new Board(); 
    let playerAmount = 0;
    let botAmount = -2;

    if(fastLoad === true){
        playerAmount = 2;
        botAmount = 1;
    }

    let playerImages = [0,1,2,3,4,5,6,7]

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
    while(botAmount == -2){
        if(playerAmount < 8){
            let promptText = prompt("Hur många bots?") 
            if(isNumeric(promptText)){
                if(JSON.parse(promptText) > 8-playerAmount){
                    botAmount = -2;
                }else{
                    if(playerAmount === 1){
                        if(JSON.parse(promptText) === 0){
                            botAmount = -2
                        }else{
                            botAmount = JSON.parse(promptText) 
                        }
                    }else{
                        botAmount = JSON.parse(promptText)
                    }
                }
            }else{
                botAmount = -2;
            }
        }else{
            botAmount = -1
        }
    }

    for(i = 0; i < playerAmount; i++){
        let lastPlayername = "";
        let random = randomIntFromRange(0,playerImages.length-1)
        let playername = "";
        if(fastLoad === true){
            playername = "Spelare " + (i+1);
        }
        while(playername == ""){
            playername = prompt("Vad heter spelare " + (i+1) + "?",lastPlayername)
            lastPlayername = playername
            if(playername.length > 9 || playername.length < 2){
                playername = ""
            }
        }
        players.push(new Player(images.player.img[playerImages[random]],playerImages[random],playername,false))
        playerImages.splice(random,1)
    }
    for(i = 0; i < botAmount; i++){
        let random = randomIntFromRange(0,playerImages.length-1)
        players.push(new Player(images.player.img[playerImages[random]],playerImages[random],"Bot " + (i+1),true))
        playerImages.splice(random,1)
    }
    players.forEach(e=> e.playerBorder.init())
}

function update(){
    requestAnimationFrame(update);
    c.imageSmoothingEnabled = false;

    c.clearRect(0,0,canvas.width,canvas.height);
    showBackground();
    c.fillStyle = "white";
    c.font = "50px Arcade";
    c.textAlign = "center";
    c.fillText("Just nu: " + players[turn].name, canvas.width/2, 50);
    board.update();

    for(let i = players.length-1; i>-1; i--){
        if(players[i].playerBorder.index !== 2 && players[i].playerBorder.index !== 3){
            players[i].playerBorder.draw()
        }
    }
    for(let i = players.length-1; i>-1; i--){
        if(players[i].playerBorder.index == 2 || players[i].playerBorder.index == 3){
            players[i].playerBorder.draw()
        }
    }
    let tmp = false;

    buttons.forEach(e =>{
        if(e.hover){
            tmp = true;
        }
    })
    if(tmp === true){
        canvas.style.cursor = "pointer"
    }else{
        canvas.style.cursor = "auto"
    }
    
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
        this.trade = undefined;
        this.rollDiceButton = new Button(10,250,images.buttons.img[0],function(){players[turn].rollDice()},107,23)
        this.nextPlayerButton = new Button(10,250,images.buttons.img[1],function(){players[turn].rollDice()},107,23)
        this.currentCard = undefined;
        this.cardCloseButton = new Button(174,43,images.buttons.img[7],function(){board.currentCard = undefined;},18,18)
        this.sellButton = new Button(130,300,images.buttons.img[2],function(){
            if(board.currentCard.mortgaged === false){
                players[turn].money+= board.currentCard.piece.price/2
            }
            players[turn].ownedPlaces.splice(players[turn].ownedPlaces.indexOf(board.currentCard),1);
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
            players[turn].money -= board.currentCard.piece.price;
            board.currentCard.owner = players[turn];
            players[turn].ownedPlaces.push(board.currentCard);
            board.currentCard = undefined;
            board.buyButton.visible = false;
        },97,40);

        this.auctionButton = new Button(-43 + 117,300,images.buttons.img[8],function(){
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

            if(this.win === false){ 
                for(let i = 20; i >= 0; i--){
                    if(this.boardPieces[i].side == 0 || this.boardPieces[i].side === 3){
                        this.boardPieces[i].currentPlayer.forEach(p => p.update())
                    }else{
                        for(let g = (this.boardPieces[i].currentPlayer.length-1); g>-1; g--){                        
                            this.boardPieces[i].currentPlayer[g].update()
                        }
                    }
                    if(i === 10){
                        this.prisonExtra.currentPlayer.forEach(p => p.update())
                    }
                }
                for(let i = 20; i < 40; i++){
                    if(this.boardPieces[i].side == 0 || this.boardPieces[i].side === 3){
                        this.boardPieces[i].currentPlayer.forEach(p => p.update())
                    }else{
                        for(let g = (this.boardPieces[i].currentPlayer.length-1); g>-1; g--){                        
                            this.boardPieces[i].currentPlayer[g].update()
                        }
                    }
                }
                
            }
            this.showCard();
            if(this.auction !== undefined){
                this.auction.update();
            }
            if(this.trade !== undefined){
                this.trade.update();
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
                c.font ="20px Arcade";
                
                if(this.currentCard.owner !== undefined){
                    if(this.currentCard.piece.type !== "utility" && this.currentCard.piece.type !== "station"){
                        c.fillText("Ägare: " + this.currentCard.owner.name,canvas.width/2,canvas.height/2-200)
                    }else{
                        c.fillText("Ägare: " + this.currentCard.owner.name,canvas.width/2,canvas.height/2-153)
                    }


                    if(this.currentCard.owner === players[turn] && players[turn].bot === undefined){
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

                    if(this.currentCard === board.boardPieces[(players[turn].steps)] && this.auction === undefined && players[turn].bot === undefined){
                            
                        
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
            if(players[turn].animationOffset !== 0 ||this.showDices === true || this.animateDices === true){
            drawIsometricImage(500,500,images.dice.img[0],false,this.dice1Type*64,(this.dice1-1)*64,64,64,0,0)
            drawIsometricImage(550,400,images.dice.img[0],false,this.dice2Type*64,(this.dice2-1)*64,64,64,0,0)
            this.nextPlayerButton.visible = false;
            this.rollDiceButton.visible = false;
            }else{
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
class Trade{
    constructor(p1,p2){
        this.p1 = p1;
        this.p2 = p2;

        let self = this;
        this.closeButton = new Button(301,44,images.buttons.img[7],function(){self.closeButton.visible = false;board.trade = undefined;},18,18)
        this.closeButton.visible = true;

        this.update = function(){
            drawIsometricImage(0,0,images.trade.img[0],false,0,0,images.trade.img[0].width,images.trade.img[0].height,-192,images.trade.img[0].height/7.5,1)
            this.closeButton.draw();
        }
    }
}

class PlayerBorder{
    constructor(player){
        this.player = player;
        this.index = players.length;
        this.x = 0;
        this.y = 0;
        this.realIndex = this.index
        this.showInfo = false;

        let self = this;
        
        
        this.button = new Button(this.x,this.y,images.playerOverlay.img[8],function(){
            players.forEach(e =>{if(e.playerBorder.showInfo && e.playerBorder != self){e.playerBorder.showInfo = false}})
            if(!self.showInfo){
                self.showInfo = true;
            }else{
                self.showInfo = false;
            }
        },260,54,false,false,true) 

        this.createTradebutton = new Button(this.x,this.y,images.buttons.img[9],function(){
            self.createTradebutton.visible = false;
            self.showInfo = false;
            board.trade = new Trade(players[turn],self.player);
        },219,34,false,false,true)

        this.init = function(){
            if(players.length === 5 && this.realIndex === 4){
                this.index = 3
            }
            if(players.length === 5 && this.realIndex === 2){
                this.index = 4
            }
            if(players.length === 5 && this.realIndex === 3){
                this.index = 2
            }
            
            if(players.length === 6 && this.realIndex === 4){
                this.index = 2
            }
            if(players.length === 6 && this.realIndex === 2){
                this.index = 4
            }
            if(players.length === 6 && this.realIndex === 3){
                this.index = 6
            }
            if(players.length === 6 && this.realIndex === 5){
                this.index = 3
            }     

            if(players.length === 7 && this.realIndex === 4){
                this.index = 5
            }
            if(players.length === 7 && this.realIndex === 2){
                this.index = 4
            }
            if(players.length === 7 && this.realIndex === 3){
                this.index = 6
            }
            if(players.length === 7 && this.realIndex === 5){
                this.index = 3
            }   
            if(players.length === 7 && this.realIndex === 6){
                this.index = 2
            }       

            if(players.length === 8 && this.realIndex === 4){
                this.index = 5
            }
            if(players.length === 8 && this.realIndex === 2){
                this.index = 4
            }
            if(players.length === 8 && this.realIndex === 3){
                this.index = 6
            }
            if(players.length === 8 && this.realIndex === 5){
                this.index = 7
            }   
            if(players.length === 8 && this.realIndex === 6){
                this.index = 2
            }      
            if(players.length === 8 && this.realIndex === 7){
                this.index = 3
            }      
        }
        
        this.draw = function() {
            if(this.index === 0){
                this.x = 0
                this.y = 0;
                this.button.mirror = true;
            }
            if(this.index === 1){
                this.x = canvas.width/2 - 260
                this.y = 0;
                this.button.mirror = false;
            }
            if(this.index === 2){
                this.x = 0
                this.y = canvas.height/2 -54;
                this.button.mirror = true;
                
            }
            if(this.index === 3){
                this.x = canvas.width/2 - 260
                this.y = canvas.height/2 -54;
                this.button.mirror = false;
            }
            if(this.index === 4){
                this.x = 0
                this.y = 54;
                this.button.mirror = true;
            }
            if(this.index === 5){
                this.x = 0
                this.y = canvas.height/2 -54*2;
                this.button.mirror = true;
            }
            if(this.index === 6){
                this.x = canvas.width/2 - 260
                this.y = 54;
                this.button.mirror = false;
            }
            if(this.index === 7){
                this.x = canvas.width/2 - 260
                this.y = canvas.height/2 -108;
                this.button.mirror = false;
            }
            this.button.y = this.y
            this.button.x = this.x
            this.button.visible = true;
            this.button.draw()
            this.createTradebutton.x = this.x + 20 
            
            let mirrorAdder = 0;
            if(!this.button.mirror){
                mirrorAdder = canvas.width/4-120;
            }
            if(this.button.mirror === false){
                drawRotatedImage(this.x*drawScale+466,this.y*drawScale+5,48,96,images.player.img[this.player.colorIndex],0,false,0,0,24,48,false)
                c.font = "40px Arcade";
                c.fillStyle ="black"
                c.textAlign = "right"
                c.fillText(this.player.name,this.x*drawScale+450,this.y*drawScale+68)
                c.textAlign = "left"
                c.fillText(this.player.money + "kr",this.x*drawScale+50,this.y*drawScale+68)
            }else{
                drawRotatedImage(this.x*drawScale+6,this.y*drawScale+5,48,96,images.player.img[this.player.colorIndex],0,false,0,0,24,48,false)
                c.font = "40px Arcade";
                c.fillStyle ="black"
                c.textAlign = "left"
                c.fillText(this.player.name,this.x+80,this.y*drawScale+68)
                c.textAlign = "right"
                c.fillText(this.player.money + "kr",this.x+480,this.y*drawScale+68)

            }
            if(this.showInfo){
                if(this.index === 0 || this.index === 1 || this.index === 4 || this.index === 6){
                    this.createTradebutton.y = this.y + 80 + 27*this.player.ownedPlaces.length;
                    drawRotatedImage(this.x*drawScale,this.y*drawScale + 54*drawScale,260*drawScale,27*drawScale,images.playerOverlay.img[11],0,this.button.mirror,0,0,260,27,false)
                    for(let i = 0; i < this.player.ownedPlaces.length; i++){
                        drawRotatedImage(this.x*drawScale,this.y*drawScale + 67 *drawScale + 27*drawScale*i + 27,260*drawScale,27*drawScale,images.playerOverlay.img[10],0,this.button.mirror,0,0,260,27,false)
                        c.font = "30px Arcade";
                        c.fillStyle ="black"
                        c.textAlign = "left"
                        if(this.player.ownedPlaces[i].piece.type !== "station" && this.player.ownedPlaces[i].piece.type !== "utility"){
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + this.player.ownedPlaces[i].piece.rent[this.player.ownedPlaces[i].level] + "kr",this.x+80+ mirrorAdder*drawScale,this.y*drawScale + 54*1.35*drawScale + 27*drawScale*i + 54)
                        }else if(this.player.ownedPlaces[i].piece.type === "station"){
                            let tmp = -1;
                            this.player.ownedPlaces.forEach(e => {
                                if(e.piece.type === "station"){
                                    tmp++;
                                }
                            })
                            
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + 25 * Math.pow(2,tmp) + "kr",this.x+80+ mirrorAdder*drawScale,this.y*drawScale + 54*1.35*drawScale + 27*drawScale*i + 54)
                        }else{
                            let tmp = 0;
                            let multiply = 0;
                            this.owner.ownedPlaces.forEach(e => {
                                if(e.piece.type === "utility"){
                                    tmp++;
                                }
                            })
                            if(tmp === 1){multiply = 4;}
                            if(tmp === 2){multiply = 10}
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + multiply + " gånger tärning kr",this.x+80+ mirrorAdder*drawScale,this.y*drawScale + 54*1.35*drawScale + 27*drawScale*i + 54)
                        }
                    }
                    drawRotatedImage(this.x*drawScale,this.y*drawScale + 53*drawScale*1.5 +27*drawScale*this.player.ownedPlaces.length,260*drawScale ,27*drawScale,images.playerOverlay.img[10],0,this.button.mirror,0,0,260,27,false)
                    drawRotatedImage(this.x*drawScale,this.y*drawScale + 53*drawScale*1.5 +27*drawScale*(this.player.ownedPlaces.length+1),260*drawScale ,27*drawScale,images.playerOverlay.img[9],0,this.button.mirror,0,0,260,27,false)
                    if(players[turn] !== this.player && board.trade === undefined){
                        this.createTradebutton.visible = true;
                    }else{
                        this.createTradebutton.visible = false;
                    }
                    this.createTradebutton.draw();
                }else{
                    drawRotatedImage(this.x*drawScale,this.y*drawScale - 27*drawScale,260*drawScale,27*drawScale,images.playerOverlay.img[11],180,!this.button.mirror,0,0,260,27,false)
                    for(let i = 0; i < this.player.ownedPlaces.length; i++){
                        drawRotatedImage(this.x*drawScale,this.y*drawScale - 67 *drawScale - 27*drawScale*i + 27,260*drawScale,27*drawScale,images.playerOverlay.img[10],180,!this.button.mirror,0,0,260,27,false)
                        c.font = "30px Arcade";
                        c.fillStyle ="black"
                        c.textAlign = "left"
                        if(this.player.ownedPlaces[i].piece.type !== "station" && this.player.ownedPlaces[i].piece.type !== "utility"){
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + this.player.ownedPlaces[i].piece.rent[this.player.ownedPlaces[i].level] + "kr",this.x+80+ mirrorAdder*drawScale,this.y*drawScale - 27*1.35*drawScale - 27*drawScale*i)
                        }else if(this.player.ownedPlaces[i].piece.type === "station"){
                            let tmp = -1;
                            this.player.ownedPlaces.forEach(e => {
                                if(e.piece.type === "station"){
                                    tmp++;
                                }
                            })
                            
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + 25 * Math.pow(2,tmp) + "kr",this.x+80+ mirrorAdder*drawScale,this.y*drawScale - 27*1.35*drawScale - 27*drawScale*i)
                        }else{
                            let tmp = 0;
                            let multiply = 0;
                            this.owner.ownedPlaces.forEach(e => {
                                if(e.piece.type === "utility"){
                                    tmp++;
                                }
                            })
                            if(tmp === 1){multiply = 4;}
                            if(tmp === 2){multiply = 10}
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + multiply + " gånger tärning kr",this.x+80+ mirrorAdder*drawScale,this.y*drawScale - 27*1.35*drawScale - 27*drawScale*i)
                        }                    
                    }
                    drawRotatedImage(this.x*drawScale,this.y*drawScale - 35*drawScale*1.5 -27*drawScale*this.player.ownedPlaces.length,260*drawScale ,27*drawScale,images.playerOverlay.img[10],0,this.button.mirror,0,0,260,27,false)
                    drawRotatedImage(this.x*drawScale,this.y*drawScale - 35*drawScale*1.5 -27*drawScale*(this.player.ownedPlaces.length+1),260*drawScale ,27*drawScale,images.playerOverlay.img[9],180,!this.button.mirror,0,0,260,27,false)
                    this.createTradebutton.y = this.y - 60 - 27*this.player.ownedPlaces.length;
                    if(players[turn] !== this.player && board.trade === undefined){
                        this.createTradebutton.visible = true;
                    }else{
                        this.createTradebutton.visible = false;
                    }
                    this.createTradebutton.draw();
                }
            }
            
            
        }
    }

}

class Auction{
    constructor(card){
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
            board.auction.started = true;
            board.auction.duration = 10 * 1000;
            board.auction.startTime = performance.now();
            board.auction.timer = setInterval(function(){
                board.auction.time = 472 * (1 - (performance.now() - board.auction.startTime) / board.auction.duration);
            },10);
        },240,40,false)

        this.draw = function(){
            drawIsometricImage(0,0,images.card.img[card.piece.card],false,0,0,images.card.img[this.card.piece.card].width,images.card.img[this.card.piece.card].height,images.card.img[this.card.piece.card].width/3,images.card.img[this.card.piece.card].height/7.5,1)
            drawIsometricImage(0,0,images.auction.img[0],false,0,0,images.auction.img[0].width,images.card.img[this.card.piece.card].height,-images.card.img[this.card.piece.card].width/1.5,images.card.img[this.card.piece.card].height/7.5,1)
            c.fillStyle = "black";
            c.font = "80px Arcade";
            c.textAlign = "center";
            c.fillText(this.auctionMoney + "kr", canvas.width/2-190, canvas.height/2 - 75);
            c.font = "80px Arcade";
            c.fillText(this.playerlist[this.turn].name, canvas.width/2-190, canvas.height/2 - 150);

            if(this.started){
                if(this.playerlist[this.turn].bot === undefined){
                    this.startAuctionButton.visible = false;
                    this.addMoneyButton2.visible = true;
                    this.addMoneyButton2.draw();
                    this.addMoneyButton10.visible = true;
                    this.addMoneyButton10.draw();
                    this.addMoneyButton100.visible = true;
                    this.addMoneyButton100.draw();
                }else{
                    this.startAuctionButton.visible = false;
                    this.addMoneyButton2.visible = false;
                    this.addMoneyButton10.visible = false;
                    this.addMoneyButton100.visible = false;
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
                    this.playerlist.splice(this.playerlist.indexOf(this.playerlist[this.turn]),1)
                    this.turn = (this.turn)%this.playerlist.length;
                    this.time = 472;
                    this.startTime = performance.now();
                    if(this.playerlist.length === 1){
                        for(let i = 0; i<players.length; i++){
                            if(this.playerlist[0].colorIndex == players[i].colorIndex){
                                clearInterval(board.auction.timer)
                                players[i].money -= this.auctionMoney;
                                board.auction.card.owner = players[i];
                                players[i].ownedPlaces.push(this.card);
                                buttons.splice(buttons.indexOf(this.addMoneyButton2),1)
                                buttons.splice(buttons.indexOf(this.addMoneyButton10),1)
                                buttons.splice(buttons.indexOf(this.addMoneyButton100),1)
                                buttons.splice(buttons.indexOf(this.startAuctionButton),1)
                                board.currentCard = undefined;
                                board.buyButton.visible = false;
                                board.auction = undefined;
                            }
                        }

                    }
                }
    
                
            }else{
                this.startAuctionButton.visible = true;
                this.startAuctionButton.draw();
            }
            

        }
        this.update = function(){
        if(this.playerlist[this.turn].money < (this.auctionMoney+2)){
            this.addMoneyButton2.disabled = true;
        }else{
            this.addMoneyButton2.disabled = false;
        }
        if(this.playerlist[this.turn].money < (this.auctionMoney+10)){
            this.addMoneyButton10.disabled = true;
        }else{
            this.addMoneyButton10.disabled = false;
        }
        if(this.playerlist[this.turn].money < (this.auctionMoney+100)){
            this.addMoneyButton100.disabled = true;
        }else{
            this.addMoneyButton100.disabled = false;
        }
            this.draw();
            
        }
        this.addMoney = function(money){
            
            this.auctionMoney += money;
            this.turn = (this.turn+1)%this.playerlist.length;
            this.time = 472;
            this.startTime = performance.now();
        }
    }
}

class Button{
    constructor(x,y,img,onClick,w,h,showBorder,mirror,screencenter,text,textSize){
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
        this.textSize = textSize;
        if(mirror === true){
            this.mirror = true;
        }
        if(screencenter === true){
            this.screencenter = true;
        }

        this.showBorder = showBorder;
        buttons.push(this);

        this.draw = function(){
            
            if(this.visible && this.img !== undefined){
                if(!this.disabled){
                    if(this.screencenter){
                        if(detectCollition(this.x*drawScale,this.y*drawScale,this.w*drawScale,this.h*drawScale,mouse.realX,mouse.realY,1,1)){
                            if(this.img.width <= this.w*2){
                                drawRotatedImage(this.x*drawScale,this.y*drawScale,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w,0,this.w,this.h,false)
                            }else{
                                drawRotatedImage(this.x,this.y,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,0,this.w,this.w,this.h,false)
                            }
                            this.hover = true;
                        }else{
                            this.hover = false;
                            if(this.screencenter){
                                drawRotatedImage(this.x*drawScale,this.y*drawScale,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,0,0,this.w,this.h,false)
                            }else{
                                drawIsometricImage(0,0,this.img,this.mirror,0,0,this.w,this.h,this.x,this.y)
                            }
                        }
                    }else{
                        if(detectCollition(canvas.width/2 + this.x*drawScale - 64*drawScale,canvas.height/2 + this.y*drawScale - 208*drawScale,this.w*drawScale,this.h*drawScale,mouse.realX,mouse.realY,1,1)){
                            if(this.img.width < this.w*2){
                                drawIsometricImage(0,0,this.img,this.mirror,0,0,this.w,this.h,this.x,this.y)
                            }else{
                                drawIsometricImage(0,0,this.img,this.mirror,this.w,0,this.w,this.h,this.x,this.y)
                            }
                            this.hover = true;
                        }else{
                            this.hover = false;
                            if(this.screencenter){
                                drawRotatedImage(this.x*drawScale,this.y*drawScale,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,0,0,this.w,this.h,false)
                            }else{
                                drawIsometricImage(0,0,this.img,this.mirror,0,0,this.w,this.h,this.x,this.y)
                            }
                        }
                    }
                }else{
                    this.hover = false;
                    if(this.screencenter){
                        drawRotatedImage(this.x,this.y,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,0,this.w*2,this.w,this.h,false)
                    }else{
                        drawIsometricImage(0,0,this.img,this.mirror,this.w*2,0,this.w,this.h,this.x,this.y)
                    }
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
                if(this.screencenter){
                    c.strokeRect(this.x*drawScale,this.y*drawScale,this.w*drawScale,this.h*drawScale)
                }else{
                    c.strokeRect(canvas.width/2 + this.x*drawScale - 64*drawScale,canvas.height/2 + this.y*drawScale - 208*drawScale,this.w*drawScale,this.h*drawScale)
                }
            }
        }
        this.click = function(){
            if(this.visible && !this.disabled){
                if(this.screencenter){
                    if(detectCollition(this.x*drawScale,this.y*drawScale,this.w*drawScale,this.h*drawScale,mouse.realX,mouse.realY,1,1)){
                        this.onClick();
                        this.hover = false;
                        playSound(sounds.release,1)
                    }
                }else{
                    if(detectCollition(canvas.width/2 + this.x*drawScale - 64*drawScale,canvas.height/2 + this.y*drawScale - 208*drawScale,this.w*drawScale,this.h*drawScale,mouse.realX,mouse.realY,1,1)){
                        this.onClick();
                        this.hover = false;
                        playSound(sounds.release,1)
                    }
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
        buttons.push(this);
        
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
            if(board.currentCard !== undefined && this !== board.currentCard || this.piece.type === "chance" || this.piece.type === "community Chest" || this.piece.type === "income tax" || this.piece.type === "tax" ||this.n%10 === 0 || board.auction !== undefined || board.trade !== undefined){
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
                    if(this.side === 2){
                        drawIsometricImage(this.x-10,this.y,images.playerOverlay.img[this.owner.colorIndex],false,96*this.imgSide,0,96,48,this.offsetX,this.offsetY);
                    }else{
                        drawIsometricImage(this.x,this.y,images.playerOverlay.img[this.owner.colorIndex],false,96*this.imgSide,0,96,48,this.offsetX,this.offsetY);
                    }
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
       

        this.click = function(){
            if(this.hover === true){
                playSound(sounds.release,1)

                if(this.piece.card === undefined){
                    alert()
                }else{
                    if(board.currentCard === this){
                        board.currentCard = undefined;
                    }else{
                        board.currentCard = this;
                    }
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
                            if(confirm("Vill du köpa " + this.piece.name + " för " + this.piece.price + "kr?" + "\n" + "\n")){
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

                    let random = randomIntFromRange(1,14)
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
                        alert("Gå till närmsta anläggning")
                        if(this.n === 7 || this.n === 36){
                            player.teleportTo(12)
                        }
                        if(this.n === 22){
                            player.teleportTo(28)
                        }
                    }
                    if(random === 5){
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
                    if(random === 6){
                        alert("Få 50kr")
                        player.money += 50;
                    }
                    if(random === 7){
                        alert("Inte inlagd men ska vara ett GET OUT OF JAIL kort")
                        //get out of jail
                    }
                    if(random === 8){
                        alert("Gå bak tre steg")
                        player.teleportTo(-(player.steps-3))
                    }
                    if(random === 9){
                        alert("Gå till finkan!")
                        player.goToPrison();
                    }
                    if(random === 10){
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
                    if(random === 11){
                        alert("Gå till södra stationen")
                        player.teleportTo(5);
                    }
                    if(random === 12){
                        alert("Gå till Malmö")
                        player.teleportTo(39);
                    }
                    if(random === 13){
                        alert("Få 50kr av alla andra spelare")
                        player.money += (players.length-1)*50
                        players.forEach(e=> {if(e !== player){e.money-=50}})
                    }
                    if(random === 14){
                        alert("Få 150kr")
                        player.money += 150
                    }
                }else if(this.piece.type === "community Chest"){
                    let random = randomIntFromRange(1,16);
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
                }else if(this.piece.type === "income tax"){
                    if(player.money > 2000){
                        alert("Betala 200kr skatt")
                        player.money -= 200;
                    }else{
                        alert("Betala " + Math.round(player.money * 0.1) + "kr skatt")
                        player.money =  Math.round(player.money * 0.9);
                    }
                }
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
        this.numberOfRolls = 0;
        this.inJail = false;
        this.ownedPlaces = [];
        this.animationOffset = 0;
        this.timer = undefined;
        this.negative = false;
        this.bot = undefined;

        this.playerBorder = new PlayerBorder(this)
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
                turn = turn%(players.length-1);

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
            this.teleportTo(10,false)
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
        this.teleportTo = function(step,getMoney){
            let oldStep = this.steps;
            let direction = 1;
            if(step < 0){
                direction = -1;
                step = -step
            }
            if(getMoney === undefined){
                getMoney = true;
            }

            this.steps = step;
            this.rolls = true;

            this.animateSteps(oldStep,this.steps,0,direction,getMoney)
        }
        this.animateSteps = function(from,to,dicesum,direction,getMoney){
            let self = this;
            clearInterval(this.timer)
            if(to < from && direction === 1){
                to += 40
            }
            let to2 = to
            if(direction < 0){
                this.animationOffset = -(from-to);
            }else{
                this.animationOffset = to-from;
            }

            to = to%40
            board.showDices = true;
            self.timer = setInterval(function(){
                if(self.animationOffset <= 0 && direction === 1 || self.animationOffset >= 0 && direction === -1){
                    clearInterval(self.timer);
                    
                    board.boardPieces.forEach(function(b,i2) {b.currentPlayer.forEach(function(d,i3) {
                        if(d === self){
                            b.currentPlayer.splice(i3,1)
                        }
                    })})
                    if(to2 >= 40 && self.inJail === false && getMoney === true){
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
                        alert("Gå till finkan!")
                        self.goToPrison()
                    }
                    board.showDices = false;
                }else{
                    board.boardPieces.forEach(function(b,i2) {b.currentPlayer.forEach(function(d,i3) {
                        if(d === self){
                            b.currentPlayer.splice(i3,1)
                        }
                    })})

                    self.animationOffset -= 1*direction;
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
                                alert("Gå till finkan!")
                                this.goToPrison();
                            }
                            this.numberOfRolls++;
                            this.rolls = false;
                        }else{
                            this.rolls = true;
                        }
                        let diceSum = dice1+dice2;
                        this.dice1 = dice1
                        this.dice2 = dice2

                        board.animateDices = true;

                        let counter = 25;
                        let self = this;
                        var myFunction = function() {
                            board.randomizeDice();
                            board.dice1 = randomIntFromRange(1,6)
                            board.dice2 = randomIntFromRange(1,6)
                            playSound(sounds.dice,0.25)
                            counter *= 1.2;
                            if(counter > 1000){
                                playSound(sounds.dice,0.25)
                                board.dice1 = dice1;
                                board.dice2 = dice2;
                                setTimeout(() => {
                                    board.animateDices = false;
                                    self.steps += dice1+dice2;
                                    self.steps = self.steps%40;
                                    self.animateSteps(oldStep,self.steps,diceSum,1,true)
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
                        if(this.bot === undefined){
                        if(confirm("Vill du betala 50kr för att komma ut eller slå dubbelt?")){
                            this.money -= 50;
                            this.rolls = true;
                            this.getOutOfJail();
                        }else{
                            let dice1 = randomIntFromRange(1,6);
                            let dice2 = randomIntFromRange(1,6);
                            this.rolls = true;

                            board.animateDices = true;

                            let counter = 25;
                            let self = this;
                            var myFunction = function() {
                                board.randomizeDice();
                                board.dice1 = randomIntFromRange(1,6)
                                board.dice2 = randomIntFromRange(1,6)
                                playSound(sounds.dice,0.25)
                                counter *= 1.2;
                                if(counter > 1000){
                                    playSound(sounds.dice,0.25)
                                    board.dice1 = dice1;
                                    board.dice2 = dice2;
                                    setTimeout(() => {
                                        board.animateDices = false; 
                                        if(dice1 === dice2){
                                            self.getOutOfJail()
                                            self.teleportTo(self.steps + dice1 + dice2);
                                        }
                                        
                                    }, 1000);                  
                                }else{
                                    setTimeout(myFunction, counter);
                                }
                            }
                            setTimeout(myFunction, counter);
                            }
                        }
                    }else{
                        turn = (turn+1)%players.length;
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
update();


