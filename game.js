var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");
canvas.id = "game"

var menus = [];

setTimeout(() => {
    if(window.innerWidth*9 < window.innerHeight*16){
        canvas.width = window.innerWidth;
        canvas.height = (window.innerWidth*9)/16;
    }else{
        canvas.width = (window.innerHeight*16)/9;
        canvas.height = window.innerHeight;
    }
    scale = Math.sqrt(Math.pow(canvas.width,2) + Math.pow(canvas.height,2))/2250
}, 100);

window.addEventListener("resize", e=> {
    
    if(window.innerWidth*9 < window.innerHeight*16){
        canvas.width = window.innerWidth;
        canvas.height = (window.innerWidth*9)/16;
    }else{
        canvas.width = (window.innerHeight*16)/9;
        canvas.height = window.innerHeight;
    }
    offsets = {
        x:Math.floor(window.innerWidth/2) - 832*drawScale/2,
        y:Math.floor(window.innerHeight/2) - 416*drawScale/2
    }
    scale = Math.sqrt(Math.pow(canvas.width,2) + Math.pow(canvas.height,2))/2250
})

canvas.addEventListener("mousemove",function(e){
    mouse = {
        x:e.offsetX - offsets.x,
        y:e.offsetY - offsets.y,
        realX:e.offsetX,
        realY:e.offsetY,
        offsetX:e.offsetX,
        offsety:e.offsetY,
    }
})

window.addEventListener("mousedown",function(e){
    //canvas.requestFullscreen()
    textInputs.forEach(g => {
        g.follow = false;
    })
    buttons.forEach(e =>{
        e.click();
    })

})
window.addEventListener("mouseup",function(e){

    buttons.forEach(e =>{
        if(e.release !== undefined){
            e.release();
        }
    })

})

window.addEventListener("keydown",function(e){
    if(e.keyCode === 27){
        board.currentCard = undefined;
    }
    textInputs.forEach(g => {
        g.input(e)
    })
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
        //x+= offsets.x;
        //y+= offsets.y
    }

    let middlePoint = {
        x:x*scale+w/2*scale,
        y:y*scale+h/2*scale
    };

    c.save();
    c.translate(middlePoint.x,middlePoint.y);
    c.rotate(degree);
    if(mirrored === true){
        c.scale(-1, 1);
    }
    
    c.drawImage(img,Math.floor(cropX),Math.floor(cropY),Math.floor(cropW),Math.floor(cropH),Math.floor(-w/2)*scale,Math.floor(-h/2)*scale,Math.floor(w)*scale,Math.floor(h)*scale);

    c.restore();
}

function drawRotatedText(x,y,text,font,angle,color,mirrored,overide){
    let degree = angle * Math.PI / 180;
    if(overide !== true){
        x+= offsets.x;
        y+= offsets.y
    }
   
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
    drawRotatedImage(to_screen_coordinate(x*drawScale,y*drawScale).x + 850 + offsetX*drawScale,to_screen_coordinate(x*drawScale,y*drawScale).y + 150 + offsetY*drawScale,cropW*scaleOfThis,cropH*scaleOfThis,img,0,mirror,cropX,cropY,cropW,cropH,true)
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
function startGame(playerlist,settings){
    board.settings = settings;
    let tmpArray =[];
    for(i = 0; i < playerlist.length; i++){
        tmpArray.push(i);
    }
    for(i = 0; i < playerlist.length; i++){
        let tmpI = randomIntFromRange(0,tmpArray.length-1);
        let correctI = tmpArray[tmpI]
        players.push(new Player(images.player.img[playerlist[correctI].color],playerlist[correctI].color,playerlist[correctI].name,playerlist[correctI].bot))
        tmpArray.splice(tmpI,1)
    }
    turn = randomIntFromRange(0,playerlist.length-1)
    players.forEach(e=> e.playerBorder.init())
    Bot.boardInfo = players.reduce((dict, player, i) => { dict[i] = player.ownedPlaces; return dict }, {})
}

class LocalLobby {
    constructor() {
        this.current = false;
        let self = this;
        this.playerInputs = [];
        this.amountBots = 0;
        this.settingsButtons = [];
        this.settingsButtons.push(new Button(true,100,220,images.buttons.img[10],function(){},500,40,false,false,false,false,false,"Ge alla skattepengar till fri parkering",42,"black"))
        this.settingsButtons.push(new Button(true,100,220+ this.settingsButtons.length*45,images.buttons.img[10],function(){},500,40,false,false,false,false,false,"Ge alla bankpengar till fri parkering",42,"black"))
        this.settingsButtons.push(new Button(true,100,220 + this.settingsButtons.length*45,images.buttons.img[10],function(){},500,40,false,false,false,false,false,"Dubbel hyra på komplett färggrupp",42,"black"))
        this.settingsButtons.push(new Button(true,100,220 + this.settingsButtons.length*45,images.buttons.img[10],function(){},500,40,false,false,false,false,false,"Auktioner",42,"black"))
        this.settingsButtons.push(new Button(true,100,220 + this.settingsButtons.length*45,images.buttons.img[10],function(){},500,40,false,false,false,false,false,"Få eller förlora pengar i fängelset",42,"black"))
        this.settingsButtons.push(new Button(true,100,220 + this.settingsButtons.length*45,images.buttons.img[10],function(){},500,40,false,false,false,false,false,"Möjlighet att inteckna",42,"black"))
        this.settingsButtons.push(new Button(true,100,220 + this.settingsButtons.length*45,images.buttons.img[10],function(){},500,40,false,false,false,false,false,"Jämn utbyggnad",42,"black"))
        this.settingsButtons.push(new Slider(456*drawScale,300*drawScale + this.settingsButtons.length*12,502*drawScale,40*drawScale,500,3000,100,true,30,"kr","Startkapital: "))
        this.settingsButtons.push(new Slider(456*drawScale,300*drawScale + this.settingsButtons.length*12*drawScale,502*drawScale,40*drawScale,0,5,1,true,30,"","Antal varv innan köp: "))
        this.settingsButtons[2].selected = true
        this.settingsButtons[3].selected = true
        this.settingsButtons[4].selected = true
        this.settingsButtons[5].selected = true
        this.settingsButtons[6].selected = true
        this.settingsButtons[7].percentage = 0.35
        this.readyPlayers = [];
        this.settingsButtons[1].disabled = true;

        this.backButton = new Button(false,-337,220,images.buttons.img[10],function(){
            self.current = false;
            menus[0].current = true;
            self.backButton.visible = false;
            self.startButton.visible = false;
            self.playerInputs.forEach( e=>{
                e.textInput.visible = false;
                e.botButton.visible = false;
                e.colorButton.visible = false;
                e.colorButtons.forEach(g => g.visible = false)
                })
        },200,40,true)
        this.startButton = new Button(false,250,650,images.buttons.img[11],function(){
            let playerlist = []

            self.readyPlayers.forEach(e =>{
                let tmpColor = e.colorId;
                if(e.colorId === undefined){
                    let random = randomIntFromRange(0,self.useableColors.length-1);
                    tmpColor = self.useableColors[random];
                    self.useableColors.splice(random,1)
                }
                let tmp = {
                    name:e.textInput.value,
                    color:tmpColor,
                    bot:e.botButton.selected
                }
                playerlist.push(tmp)
            })
            let settings = {
                freeParking:self.settingsButtons[0].selected,
                allFreeparking:self.settingsButtons[1].selected,
                doubleincome:self.settingsButtons[2].selected,
                auctions:self.settingsButtons[3].selected,
                prisonmoney:self.settingsButtons[4].selected,
                mortgage:self.settingsButtons[5].selected,
                even:self.settingsButtons[6].selected,
                startmoney:self.settingsButtons[7].value,
                roundsBeforePurchase:self.settingsButtons[8].value,
            }
            startGame(playerlist,settings)
            self.current = false;
            self.startButton.visible = false;
            self.backButton.visible = false;
            self.settingsButtons.forEach(e => {e.visible = false})
        },97*2,80,false,false,false,false,false,"Start",100,"black")
        this.disableAll = false;
        this.ableToStart = true;

        this.useableColors = [0,1,2,3,4,5,6,7]

        this.addmorePlayers = function(){
            let id = self.playerInputs.length
            let tmp = {
                id:id,
                colorId:undefined,
                y:(self.playerInputs.length*110 - 100),
                textInput: new TextInput(40,300,560,80,true,50,10),
                botButton: new Button(true,-50 +42,self.playerInputs.length*55 - 32,images.buttons.img[4],function(){
                    self.playerInputs[id].textInput.value = ""
                    if(self.playerInputs[id].botButton.selected){
                        self.amountBots++;
                        self.playerInputs[id].colorId = undefined;
                    }else{
                        self.amountBots--;
                        self.playerInputs[id].textInput.value = ""
                    }
                },40,40,false,false),
                colorButton: new Button(true,-50,self.playerInputs.length*55 - 32,images.colorButtons.img[8],function(){
                    if(self.playerInputs[id].colorButton.selected){
                        self.disableAll = true;
                    }else{
                        self.disableAll = false;
                    }
                },40,40,false,false,false,true),
                colorButtons: []
            }
            for(let i = 0; i < 8; i++){
                tmp.colorButtons.push(new Button(true,110 + (i%4)*47,self.playerInputs.length*55 +150 + Math.floor(i/2)*50,images.colorButtons.img[i],function(){
                    let select = self.playerInputs[id].colorButtons[i].selected;
                    self.playerInputs[id].colorButtons.forEach(e => {
                        e.selected = false;
                    })
                    if(select === true){
                        self.playerInputs[id].colorButtons[i].selected = true;
                        self.playerInputs[id].colorButton.img = images.colorButtons.img[i];
                        if(self.playerInputs[id].colorId !== undefined){
                            self.useableColors.push(self.playerInputs[id].colorId)
                        }
                        self.useableColors.splice(self.useableColors.indexOf(i),1)
                        self.playerInputs[id].colorId = i;
                    }else{
                        self.playerInputs[id].colorButtons[i].selected = false;

                        self.playerInputs[id].colorButton.img = images.colorButtons.img[8];
                        if(self.playerInputs[id].colorId !== undefined){
                            self.useableColors.push(self.playerInputs[id].colorId)
                        }
                        self.playerInputs[id].colorId = undefined;
                    }
                    


                },40,40,false,false))

                if(i === tmp.colorId){
                    tmp.colorButtons[i].selected = true;
                }
            }
            self.playerInputs.push(tmp)
        }

        for(let i = 0; i<8; i++){
            this.addmorePlayers();
        }

        this.draw = function(){
            if(this.current){
                this.readyPlayers = [];

                if(this.settingsButtons[8].value > 0){
                    this.settingsButtons[7].from = 0;
                }else{
                    this.settingsButtons[7].from = 500;
                }
                if(this.settingsButtons[0].selected === true){
                    this.settingsButtons[1].disabled = false;
                }else{
                    this.settingsButtons[1].disabled = true;
                    this.settingsButtons[1].selected = false;
                }
                this.settingsButtons.forEach(e => {e.visible = true; e.draw()})
                this.backButton.visible = true;
                this.startButton.visible = true;
                this.backButton.draw();

                this.playerInputs.forEach(function(e,index) {
                    e.textInput.y = e.y - self.playerInputs.length*40 + 600;
                    e.botButton.y = e.y/2 - self.playerInputs.length*40/2 + 238 + 262;
                    e.colorButton.y = e.y/2 - self.playerInputs.length*40/2 + 238 + 262;
                    for(let i = 0; i < 8; i++){
                        if(index >= self.playerInputs.length/2){
                            e.colorButtons[i].y = e.y/2 + (i%2)*47 + 286 - self.playerInputs.length*40/2 +118
                        }else{
                            e.colorButtons[i].y = e.y/2 + (i%2)*47 + 286 - self.playerInputs.length*40/2 +262
                        }
                        e.colorButtons[i].x = Math.floor(i/2)*50 - 125
                    }
                })
                this.ableToStart = true;

                this.playerInputs.forEach(e => {e.textInput.visible = true;e.botButton.visible = true;e.colorButton.visible = true})
                let lastBotId = 0;

                let playersReady = [];
                let botsReady = [];

                this.playerInputs.forEach(e => {
                    if((self.amountBots-self.playerInputs.length) == -1 && e.botButton.selected === false){
                        e.botButton.disabled = true;
                    }else{
                        e.botButton.disabled = false;
                    }
                    if(e.botButton.selected){
                        lastBotId++;
                        e.textInput.value = "Bot " + lastBotId;
                        e.colorButton.disabled = true;
                        e.textInput.disabled = true;
                    }else{
                        e.colorButton.disabled = false;
                        e.textInput.disabled = false;
                    }
                   

                    if(self.disableAll && !e.colorButton.selected){
                        e.textInput.disabled = true;
                        e.botButton.disabled = true;
                        e.colorButton.disabled = true;
                        
                    }else if(self.disableAll){
                        e.textInput.disabled = true;
                        e.botButton.disabled = true;
                        

                    }
                    if(e.textInput.value.length >= 0 && e.colorId !== undefined && !e.botButton.selected){
                        playersReady.push(e);
                        self.readyPlayers.push(e);
                    }
                    if(e.botButton.selected){
                        botsReady.push(e);
                        self.readyPlayers.push(e);
                    }
                    e.textInput.draw();
                    e.botButton.draw();
                    e.colorButton.draw();
                })
                if(playersReady.length < 1 && botsReady.length < 1){
                    this.ableToStart = false;
                }
                if(playersReady.length < 2 && botsReady.length < 1){
                    this.ableToStart = false;
                }
                if(playersReady.length === 0){
                    this.ableToStart = false;
                }
                this.playerInputs.forEach(function(e,i){
                    self.playerInputs.forEach(function(g,h){
                        if(e.textInput.value === g.textInput.value && i !== h && g.textInput.value !== ""){
                            self.ableToStart = false;
                        }
                    })
                    if(e.colorButton.selected){
                        

                        c.fillStyle = "black"
                        if(i >= self.playerInputs.length/2){
                            c.fillRect(e.colorButton.x*drawScale*scale + 550*scale,e.colorButton.y*drawScale*scale -610*scale,410*scale,210*scale)
                        }else{
                            c.fillRect(e.colorButton.x*drawScale*scale +550*scale,e.colorButton.y*drawScale*scale -26*scale -294*scale,410*scale,210*scale)
                        }
                        e.colorButtons.forEach(function(g,h){
                            for (let i = 0; i < self.useableColors.length; i++) {
                                if(h === self.useableColors[i]){
                                    g.disabled = false;
                                    i = 10;
                                }else if(!g.selected){
                                    g.disabled = true;
                                }
                            }
                            if(self.useableColors.length == 0){
                                if(!g.selected){
                                    g.disabled = true;
                                }
                            }
                            g.visible = true;
                            g.draw();
                        })
                    }else{
                        e.colorButtons.forEach(g =>{
                            g.visible = false;
                        })
                    }
                })
                playersReady.forEach(e => {if(e.textInput.value === ""){self.ableToStart = false}})
                if(this.ableToStart){
                    this.startButton.disabled = false;
                }else{
                    this.startButton.disabled = true;
                }
                this.startButton.draw();

            }
        }
    }
}

class MainMenu {
    constructor(){
        this.current = true;
        let self = this;

        this.localButton = new Button(false,-322,341,images.mainMenu.img[1],function(){
            self.current = false;
            menus[1].current = true;
            self.localButton.visible = false;
            self.onlineButton.visible = false;
        },195,51,false,false,true)
        this.onlineButton = new Button(false,-322,538,images.mainMenu.img[2],function(){
        },195,52,false,false,true)

        
        this.onlineButton.disabled = false;

        this.draw = function(){
            if(this.current){
                drawRotatedImage(0,0,981*drawScale,552*drawScale,images.mainMenu.img[0],0,0,0,0,981,552)
                this.localButton.visible = true;
                this.onlineButton.visible = true;
                this.localButton.draw();
                this.onlineButton.draw();
            }
        }
    }
}

class TextInput {
    constructor(x,y,w,h,showtext,font,maxLength){
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

        textInputs.push(this);
        buttons.push(this)

        this.draw = function(){
            if(this.visible){
                c.fillStyle = "black";
                c.fillRect(this.x*scale,this.y*scale,this.w*scale,this.h*scale)
                if(this.follow){
                    c.fillStyle = "lightgray";
                }else if(this.hover){
                    c.fillStyle = "gray";
                }else{
                    c.fillStyle = "white";
                }
                c.fillRect(this.x*scale + 4*scale,this.y*scale + 4*scale,this.w*scale-8*scale,this.h*scale-8*scale)
                c.fillStyle = "black";
                c.font = this.font*scale + "px Arcade";
                c.textAlign = "center";
                c.fillText(this.value,this.x*scale + this.w/2*scale,this.y*scale + this.h/1.5*scale)
            }
            if(detectCollition(this.x*scale,this.y*scale,this.w*scale,this.h*scale,mouse.realX,mouse.realY,1,1) && this.disabled === false){
                this.hover = true;
            }else{
                this.hover = false;
            }
        }
        this.click = function(){
            if(this.hover === true && this.disabled === false){
                if(this.follow === false){
                    this.follow = true;
                }else{
                    this.follow = false;
                }
            }
        }
        this.input = function(key){
            if(this.follow){
                if(key.keyCode > 46 && key.keyCode < 91 && this.value.length < this.maxLength){
                    this.value += key.key
                }
                if(key.keyCode === 8){
                    this.value = this.value.substring(0, this.value.length - 1);
                }
            }
        }
         
    }
}

function init(){
    document.body.appendChild(canvas);
    canvas.style.zIndex = -100;

    

    preRender(images);

    loadSounds(sounds);   

    board = new Board();
    
    if(fastLoad === false){
        menus.push(new MainMenu())
        menus.push(new LocalLobby())
    }else{
        let playerlist = []
        let playerAmount = 2;
        let botAmount = 0;
        let useableColors = [0,1,2,3,4,5,6,7]
        for(let i = 0; i < (playerAmount+botAmount); i++){
            let random = randomIntFromRange(0,useableColors.length-1)
            if(i < playerAmount){
                let tmp = {
                    name:"Spelare " + (i+1),
                    color:useableColors[random],
                    bot:false
                }
                playerlist.push(tmp)
            }else{
                let tmp = {
                    name:"Bot " + (i-1),
                    color:useableColors[random],
                    bot:true
                }
                playerlist.push(tmp)
            }
            useableColors.splice(random,1)
            
        }
        startGame(playerlist)
    }
}

function update(){
    requestAnimationFrame(update);
    c.imageSmoothingEnabled = false;
    c.clearRect(0,0,canvas.width,canvas.height);

    
    
    if(board !== undefined && players.length >0){
        board.update();
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

    menus.forEach(e => e.draw())
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
        this.boardSettings = {
            freeParking:false
        }
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
        this.payJailButton = new Button(false,-10,520,images.jailMenu.img[1],function(){
            players[turn].money -= 50;
            if(board.settings.freeParking){
                board.boardPieces[20].money += 50;
            }
            players[turn].rolls = true;
            players[turn].getOutOfJail();
            board.payJailButton.visible = false;
            players[turn].playerBorder.startMoneyAnimation(-50);
                
        },82,35);
        this.rollJailButton = new Button(false,85,520,images.jailMenu.img[2],function(){
            board.rollJailButton.visible = false;
            let dice1 = randomIntFromRange(1,6);
            let dice2 = randomIntFromRange(1,6);
            players[turn].rolls = true;

            let self = players[turn];

            players[turn].timeInJail++;

            players[turn].animateDice(dice1,dice2,function(){
                board.animateDices = false; 
                if(dice1 === dice2|| players[turn].timeInJail === 3){
                    self.getOutOfJail()
                }
                if(dice1 === dice2){
                    self.teleportTo(self.steps + dice1 + dice2);
                }
            })
        },82,35);
        this.jailCardButton = new Button(false,180,520,images.jailMenu.img[3],function(){
            players[turn].jailcardAmount--;
            players[turn].getOutOfJail();
            board.jailCardButton.visible = false;
        },82,35);
        this.rollDiceButton = new Button(false,76,530,images.buttons.img[0],function(){players[turn].rollDice()},107,23,false,false,false,true)
        this.nextPlayerButton = new Button(false,76,530,images.buttons.img[1],function(){
            if(players[turn].money >= 0){
                players[turn].numberOfRolls = 0;
                players[turn].rolls = false;
                players[turn].numberOfRolls = 0;
                turn = (turn+1)%players.length;
                board.dice1 = 0;
                board.dice2 = 0;
            }
        },107,23)
        this.currentCard = undefined;
        this.cardCloseButton = new Button(false,241,318,images.buttons.img[7],function(){board.currentCard = undefined;board.sellButton.visible = false;board.mortgageButton.visible = false;board.upgradeButton.visible = false;board.downgradeButton.visible = false;},18,18,false)
        this.sellButton = new Button(false,130,580,images.buttons.img[2],function(){
            if(board.currentCard.mortgaged === false){
                players[turn].money+= board.currentCard.piece.price/2
                players[turn].checkDebt(board.boardPieces[20]);
                players[turn].playerBorder.startMoneyAnimation(board.currentCard.piece.price/2);
            }
            players[turn].ownedPlaces.splice(players[turn].ownedPlaces.indexOf(board.currentCard),1);
            board.currentCard.owner = undefined;
        },40,40);
        this.mortgageButton = new Button(false,80,580,images.buttons.img[3],function(){
            if(board.currentCard.mortgaged === true){
                board.currentCard.mortgaged = false;
                if(board.settings.allFreeparking){
                    board.boardPieces[20].money += (board.currentCard.piece.price/2)*1.1
                }
                players[turn].money -= (board.currentCard.piece.price/2)*1.1
                players[turn].playerBorder.startMoneyAnimation(-(board.currentCard.piece.price/2)*1.1)
            }else{
                board.currentCard.mortgaged = true;
                players[turn].money += board.currentCard.piece.price/2
                players[turn].playerBorder.startMoneyAnimation((board.currentCard.piece.price/2)*1.1)
                players[turn].checkDebt(board.boardPieces[20]);
            }
        },40,40);
        this.upgradeButton = new Button(false,75,580,images.buttons.img[4],function(){
            board.currentCard.level++;
            board.currentCard.owner.money -= board.currentCard.piece.housePrice;
            if(board.settings.allFreeparking){
                board.boardPieces[20].money += board.currentCard.piece.housePrice;
            }
            players[turn].playerBorder.startMoneyAnimation(-board.currentCard.piece.housePrice)
        },40,40);
        this.downgradeButton = new Button(false,25,580,images.buttons.img[5],function(){
            board.currentCard.level--;
            board.currentCard.owner.money += board.currentCard.piece.housePrice/2;
            players[turn].playerBorder.startMoneyAnimation(board.currentCard.piece.housePrice/2)
            players[turn].checkDebt(board.boardPieces[20]);
        },40,40);
        this.buyButton = new Button(false,25,580,images.buttons.img[6],function(){
            players[turn].money -= board.currentCard.piece.price;
            if(board.settings.allFreeparking){
                board.boardPieces[20].money += board.currentCard.piece.price;
            }
            players[turn].playerBorder.startMoneyAnimation(-board.currentCard.piece.price);
            board.currentCard.owner = players[turn];
            players[turn].ownedPlaces.push(board.currentCard);
            board.currentCard = undefined;
            board.buyButton.visible = false;
            board.auctionButton.visible = false;
        },97,40);

        this.auctionButton = new Button(false,25 + 117,580,images.buttons.img[8],function(){
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
            showBackground();
                c.fillStyle = "white";
                c.font = 50*scale+"px Arcade";
                c.textAlign = "center";
                c.fillText("Just nu: " + players[turn].name, canvas.width/2, 50*scale);
            

            this.boardPieces.forEach(g => g.update())
            if(this.win === false){ 

            this.showDice()
            this.rollDiceButton.draw();
            this.nextPlayerButton.draw();
            this.boardPieces.forEach(g => g.drawHouses())

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
                
            
            this.showCard();
            if(this.auction !== undefined){
                this.auction.update();
            }
            
            if(players[turn].inJail === true && players[turn].bot === undefined && this.auction === undefined && players[turn].rolls === false && players[turn].animationOffset === 0 && this.showDices === false && this.animateDices === false){
                this.showJailmenu();
            }
            }else{
                drawRotatedText(820,450,"Grattis " + players[0].name + "! Du vann!", "80px Arcade",0,"black",false,false)
            }
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
                c.font =20*scale+"px Arcade";
                
                if(this.currentCard.owner !== undefined){
                    if(this.currentCard.piece.type !== "utility" && this.currentCard.piece.type !== "station"){
                        c.fillText("Ägare: " + this.currentCard.owner.name,985*scale,368*scale)
                    }else{
                        c.fillText("Ägare: " + this.currentCard.owner.name,985*scale,415*scale)
                    }


                    if(this.currentCard.owner === players[turn] && players[turn].bot === undefined){
                        this.cardCloseButton.visible = true;
                        this.sellButton.draw();
                        this.sellButton.visible = true;
                        this.mortgageButton.draw();
                        this.mortgageButton.visible = true;
                        if(this.currentCard.piece.type === "utility" || this.currentCard.piece.type === "station"){
                            this.sellButton.x = 150;
                            this.mortgageButton.x = 60;
                            this.upgradeButton.visible = false;
                            this.downgradeButton.visible = false;
                        }else{
                            this.sellButton.x = 200;
                            this.mortgageButton.x = 150;
                            this.upgradeButton.draw()
                            this.upgradeButton.visible = true;
                            this.downgradeButton.draw();
                            this.downgradeButton.visible = true;
                        }
                        
                        this.buyButton.visible = false;
                        let ownAll = true;
                        let lowest = 5;
                        let highest = 0;
                        for(let i = 0; i<board.boardPieces.length; i++){
                            if(board.boardPieces[i] !== this.currentCard){
                                if(board.boardPieces[i].piece.group === this.currentCard.piece.group){
                                    if(lowest > board.boardPieces[i].level){lowest = board.boardPieces[i].level}
                                    if(highest < board.boardPieces[i].level){highest = board.boardPieces[i].level}
                                    if(this.currentCard.owner !== board.boardPieces[i].owner){
                                        ownAll = false;
                                    }
                                }
                            }
                        }
                        if(lowest > this.currentCard.level || !this.settings.even){lowest = this.currentCard.level}
                        if(highest < this.currentCard.level || !this.settings.even){highest = this.currentCard.level}
                        if(this.currentCard.level < 5 && this.currentCard.piece.housePrice !== undefined && ownAll === true && this.currentCard.level === lowest && players[turn].money >= this.currentCard.piece.housePrice){
                                this.upgradeButton.disabled = false;
                        }else{
                            this.upgradeButton.disabled = true; 
                        }   
                        if(this.currentCard.level > 0 && this.currentCard.level === highest){
                            this.downgradeButton.disabled = false;
                        }else{
                            this.downgradeButton.disabled = true;
                        }
                        if(this.currentCard.mortgaged === true && players[turn].money <= ((this.currentCard.piece.price/2)*1.1) || this.currentCard.level !== 0 || !this.settings.mortgage){
                            this.mortgageButton.disabled = true;
                        }else{
                            this.mortgageButton.disabled = false;
                        }
                        
                    }
                }else{
                    this.cardCloseButton.visible = true;

                    if(this.currentCard === board.boardPieces[(players[turn].steps)] && this.auction === undefined && players[turn].bot === undefined){
                            
                        if(board.settings.auctions){
                            this.auctionButton.disabled = false;
                            this.cardCloseButton.visible = false;
                        }else{
                            this.auctionButton.disabled = true;
                            this.cardCloseButton.visible = true;
                        }
                        this.buyButton.draw();
                        this.buyButton.visible = true;
                        this.auctionButton.draw();
                        this.auctionButton.visible = true;
                        this.mortgageButton.visible = false;
                        this.sellButton.visible = false;
                        this.downgradeButton.visible = false;
                        this.upgradeButton.visible = false;
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
                    drawRotatedText(800,canvas.height/2 - 100,"Intecknad","150px Brush Script MT",45,"black",false)
                }
            }else{
                this.cardCloseButton.visible = true;
            }
            
        }
        this.showJailmenu = function(){
            drawIsometricImage(0,0,images.jailMenu.img[0],false,0,0,300,90,-90,198)

            this.payJailButton.visible = true;
            this.payJailButton.draw();
            this.rollJailButton.visible = true;
            this.rollJailButton.draw();
            this.jailCardButton.visible = true;
            this.jailCardButton.draw();
            if(players[turn].money >= 50){
                this.payJailButton.disabled = false;
            }else{
                this.payJailButton.disabled = true;
            }
            if(players[turn].jailcardAmount >= 1){
                this.jailCardButton.disabled = false;
            }else{
                this.jailCardButton.disabled = true;
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
                    if(players[turn].bot === undefined && this.auction === undefined && players[turn].inJail === false){
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
class Slider{
    constructor(x,y,w,h,from,to,steps,showtext,font,unit,beginningText){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.visible = false;
        this.disabled = false;
        this.percentage = 0;
        this.value = 0;
        this.follow = false;
        this.showtext = showtext;
        this.font = font;
        this.unit = unit;
        this.steps = steps;
        this.beginningText = beginningText;
        this.from = from;
        this.to = to

        buttons.push(this);
        this.draw = function(){
            if(this.visible){
                this.value = Math.round((((this.to-this.from)*this.percentage) + this.from)/this.steps)*this.steps;
                c.fillStyle = "black";
                c.fillRect(this.x*scale,this.y*scale,this.w*scale,this.h*scale)
                c.fillStyle = "white";
                c.fillRect(this.x*scale + 4*scale,this.y*scale + 4*scale,this.w*scale-8*scale,this.h*scale-8*scale)
                c.fillStyle = "black";
                c.font = this.font*scale + " Arcade";
                c.textAlign = "center";
                c.fillText(this.beginningText + this.value+this.unit,this.x*scale+ + this.w/2*scale,this.y*scale + this.h/1.5*scale)
                c.fillRect(this.x*scale + (this.percentage*(this.w-8))*scale,this.y*scale,10*scale,this.h*scale)
            }
            if(detectCollition(this.x*scale,this.y*scale,this.w*scale,this.h*scale,mouse.realX,mouse.realY,1,1)){
                this.hover = true;
            }else{
                this.hover = false;
            }
            if(this.follow === true){
                this.percentage = (mouse.realX-(this.x*scale))/(this.w*scale-4*scale);
            }
            if(this.percentage <= 0){
                this.percentage = 0;
            }
            if(this.percentage >= 1){
                this.percentage = 1;
            }
        }
        this.click = function(){
            if(this.hover === true){
                this.follow = true;
            }
        }
        this.release = function(){
            this.follow = false;
        }   
    }
}
class Trade{
    constructor(p1,p2){
        this.p1 = p1;
        this.p2 = p2;
        setTimeout(() => {
            players.forEach(e => {e.playerBorder.button.selected = false;e.playerBorder.button.disabled = true})
        }, 1);

        let self = this;
        this.closeButton = new Button(false,372,284,images.buttons.img[7],function(){self.closeButton.visible = false;board.trade = undefined;players.forEach(e => {e.playerBorder.button.disabled = false})},18,18,false)
        this.closeButton.visible = true;

        this.p1Slider = new Slider(500,300,400,60,0,this.p1.money,1,true,30,"kr")
        this.p1ConfirmButton = new Button(true,-70,650,images.trade.img[1],function(){},150,50)
        if(this.p1.bot === undefined){
            this.p1ConfirmButton.visible = true;
        }

        this.p2ConfirmButton = new Button(true,180,650,images.trade.img[1],function(){},150,50)
        if(this.p2.bot === undefined){
            this.p2ConfirmButton.visible = true;
        }
        this.p2Slider = new Slider(1050,300,400,60,0,this.p2.money,1,true,30,"kr")

        
        this.p1PropertyButtons = [];
        this.p2PropertyButtons = [];

        this.p1.ownedPlaces.forEach(function(e,i){
            let tmp = 0;
            if(i%2 === 1){
                tmp = 107
            }
            let but = (new Button(true,-170 + tmp,110 + 18*Math.floor(i/2),images.trade.img[2],function(){

            },106,17,false,false,false,false,false,e.piece.name + " " + e.piece.price + "kr","13px Arcade",e.piece.color))

            if(self.p1.bot !== undefined){
                but.disabled = true;
            }
            if(e.level !== 0){
                but.disabled = true;
            }
            self.p1PropertyButtons.push(but);
        })
        
        this.p2.ownedPlaces.forEach(function(e,i){
            let tmp = 0;
            if(i%2 === 1){
                tmp = 107
            }
            let but = (new Button(true,90 + tmp,110 + 18*Math.floor(i/2),images.trade.img[2],function(){

            },106,17,false,false,false,false,false,e.piece.name + " " + e.piece.price + "kr","13px Arcade",e.piece.color))

            if(self.p2.bot !== undefined){
                but.disabled = true;
            }
            self.p2PropertyButtons.push(but);
        })
        this.update = function(){
            drawIsometricImage(0,0,images.trade.img[0],false,0,0,images.trade.img[0].width,images.trade.img[0].height,-192,images.trade.img[0].height/50,1)
            this.closeButton.draw();
            this.p1ConfirmButton.draw();
            this.p2ConfirmButton.draw();
            if(p1.bot === undefined){
                this.p1Slider.visible = true;
                this.p1Slider.draw();
            }
            if(p2.bot === undefined){
                this.p2Slider.visible = true;
                this.p2Slider.draw();
            }
            c.font = 50*scale+"px Arcade";
            c.fillStyle = "black"
            c.textAlign = "right"
            c.fillText(this.p1.name,880*scale,280*scale)
            c.textAlign = "left"
            c.fillText(this.p2.name,1070*scale,280*scale)
            this.p1PropertyButtons.forEach(e => {e.visible=true;e.draw()});
            this.p2PropertyButtons.forEach(e => {e.visible=true;e.draw()});

            if(this.p1ConfirmButton.selected && this.p2ConfirmButton.selected){
                let p1New = [];
                let p2New = [];
                this.p1PropertyButtons.forEach(function(e,i){
                    if(e.selected === true){
                        p2New.push(self.p1.ownedPlaces[i])
                    }
                })
                this.p2PropertyButtons.forEach(function(e,i){
                    if(e.selected === true){
                        p1New.push(self.p2.ownedPlaces[i])
                    }
                })
                p1New.forEach(e =>{
                    self.p2.ownedPlaces.splice(self.p2.ownedPlaces.indexOf(e),1);
                    self.p1.ownedPlaces.push(e);
                    e.owner = self.p1;
                })
                p2New.forEach(e =>{
                    self.p1.ownedPlaces.splice(self.p1.ownedPlaces.indexOf(e),1);
                    self.p2.ownedPlaces.push(e);
                    e.owner = self.p2;
                })
                this.p1.money += this.p2Slider.value;
                this.p2.money += this.p1Slider.value;
                this.p1.money -= this.p1Slider.value;
                this.p2.money -= this.p2Slider.value;
                this.closeButton.visible = false;
                this.p1ConfirmButton.visible = false;
                this.p2ConfirmButton.visible = false;
                this.p1Slider.visible = false;
                this.p1Slider.visible = false;
                this.p1ConfirmButton.hover = false;
                this.p2ConfirmButton.hover = false;
                this.p1PropertyButtons.forEach(e => {e.visible=false});
                this.p2PropertyButtons.forEach(e => {e.visible=false});
                board.trade = undefined;
            }
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
        this.latestTrancaction;
        this.moneyTime = 0;

        let self = this;
        
        
        this.button = new Button(true,this.x,this.y,images.playerOverlay.img[8],function(){
            players.forEach(e =>{if(e.playerBorder != self){e.playerBorder.button.selected = false}})
            self.createTradebutton.visible = false;
        },260,54,false,false,false,true) 

        this.createTradebutton = new Button(false,this.x,this.y,images.buttons.img[9],function(){
            self.createTradebutton.visible = false;
            self.showInfo = false;
            board.trade = new Trade(players[turn],self.player); 
        },219,34,false,false,true)

        this.startMoneyAnimation = function(money,disablesound){
            this.moneyTime = 1;
            this.latestTrancaction = money;
            if(!disablesound){
                playSound(sounds.cash,1)
            }
        }
        this.moneyAnimation = function(){
            if(this.latestTrancaction < 0){
                c.fillStyle = "red";
            }else{
                c.fillStyle = "green";
            }

            if(this.button.mirror === false){
                c.globalAlpha = this.moneyTime;
                c.textAlign = "left"
                c.fillText(Math.abs(this.latestTrancaction) + "kr",this.x*drawScale*scale+1020*scale,this.y*drawScale*scale-335*scale - (-this.moneyTime+1)*20*scale)
                c.globalAlpha = 1;
            }else{
                c.globalAlpha = this.moneyTime;
                c.textAlign = "right"
                c.fillText(Math.abs(this.latestTrancaction) + "kr",this.x*scale+850*scale,this.y*drawScale*scale-335*scale- (-this.moneyTime+1)*20*scale)
                c.globalAlpha = 1;
            }
        }

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
            this.moneyTime -= speeds.moneyAnimationSpeed;
            
            if(this.index === 0){
                this.x = -358
                this.y = 200;
                this.button.mirror = true;
            }
            if(this.index === 1){
                this.x = 364
                this.y = 200;
                this.button.mirror = false;
            }
            if(this.index === 2){
                this.x = -358
                this.y = 700;
                this.button.mirror = true;
            }
            if(this.index === 3){
                this.x = 364
                this.y = 700;
                this.button.mirror = false;
            }
            if(this.index === 4){
                this.x = -358
                this.y = 200 + 54;
                this.button.mirror = true;
            }
            if(this.index === 5){
                this.x = 364
                this.y = 200 +54;
                this.button.mirror = false;
            }
            if(this.index === 6){
                this.x = -358
                this.y = 700 -54;
                this.button.mirror = true;
            }
            if(this.index === 7){
                this.x = 364
                this.y = 700 -54;
                this.button.mirror = false;
            }
            this.button.y = this.y
            this.button.x = this.x
            
            this.button.visible = true;
            this.button.draw()
            this.createTradebutton.x = this.x + 20 
            
            let mirrorAdder = 0;
            if(!this.button.mirror){
                mirrorAdder = 0;
            }
            if(this.button.mirror === false){
                drawRotatedImage(this.x*drawScale+466 + 715,this.y*drawScale+5 - 400,48,96,images.player.img[this.player.colorIndex],0,false,0,0,24,48,false)
                c.font = 40*scale+"px Arcade";
                c.fillStyle ="black"
                c.textAlign = "right"
                c.fillText(this.player.name,this.x*drawScale*scale+990*scale,this.y*drawScale*scale-335*scale)
                c.textAlign = "left"
                if(this.moneyTime <= 0){
                    c.fillText(this.player.money + "kr",this.x*drawScale*scale+1020*scale,this.y*drawScale*scale-335*scale)
                }
            }else{
                drawRotatedImage(this.x*drawScale +720,this.y*drawScale -396,48,96,images.player.img[this.player.colorIndex],0,false,0,0,24,48,false)
                c.font = 40*scale+"px Arcade";
                c.fillStyle ="black"
                c.textAlign = "left"
                c.fillText(this.player.name,this.x*scale+420*scale,this.y*drawScale*scale-335*scale)
                c.textAlign = "right"
                if(this.moneyTime <= 0){
                    c.fillText(this.player.money + "kr",this.x*scale+850*scale,this.y*drawScale*scale-335*scale)
                }

            }
            if(this.button.selected){
                if(this.index === 0 || this.index === 1 || this.index === 4 || this.index === 5){
                    this.createTradebutton.y = this.y + 80 + 27*this.player.ownedPlaces.length;
                    drawRotatedImage(this.x*drawScale+715,this.y*drawScale + 54*drawScale -400,260*drawScale,27*drawScale,images.playerOverlay.img[11],0,this.button.mirror,0,0,260,27,false)
                    for(let i = 0; i < this.player.ownedPlaces.length; i++){
                        drawRotatedImage(this.x*drawScale+715,this.y*drawScale + 67 *drawScale + 27*drawScale*i + 27,260*drawScale -400,27*drawScale,images.playerOverlay.img[10],0,this.button.mirror,0,0,260,27,false)
                        c.font = 30*scale+"px Arcade";
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
                            this.player.ownedPlaces.forEach(e => {
                                if(e.piece.type === "utility"){
                                    tmp++;
                                }
                            })
                            if(tmp === 1){multiply = 4;}
                            if(tmp === 2){multiply = 10}
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + multiply + " gånger tärning kr",this.x+80+ mirrorAdder*drawScale,this.y*drawScale + 54*1.35*drawScale + 27*drawScale*i + 54)
                        }
                    }
                    drawRotatedImage(this.x*drawScale +715,this.y*drawScale + 53*drawScale*1.5 +27*drawScale*this.player.ownedPlaces.length -400,260*drawScale ,27*drawScale,images.playerOverlay.img[10],0,this.button.mirror,0,0,260,27,false)
                    drawRotatedImage(this.x*drawScale +715,this.y*drawScale + 53*drawScale*1.5 +27*drawScale*(this.player.ownedPlaces.length+1) -400,260*drawScale ,27*drawScale,images.playerOverlay.img[9],0,this.button.mirror,0,0,260,27,false)
                    if(players[turn] !== this.player && board.trade === undefined && players[turn].bot === undefined){
                        this.createTradebutton.visible = true;
                    }else{
                        this.createTradebutton.visible = false;
                    }
                    this.createTradebutton.draw();
                }else{
                    drawRotatedImage(this.x*drawScale +715,this.y*drawScale - 27*drawScale -400,260*drawScale,27*drawScale,images.playerOverlay.img[11],180,!this.button.mirror,0,0,260,27,false)
                    for(let i = 0; i < this.player.ownedPlaces.length; i++){
                        drawRotatedImage(this.x*drawScale +715,this.y*drawScale - 67 *drawScale - 27*drawScale*i + 27 -400,260*drawScale,27*drawScale,images.playerOverlay.img[10],180,!this.button.mirror,0,0,260,27,false)
                        c.font = 30*scale+"px Arcade";
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
                            this.player.ownedPlaces.forEach(e => {
                                if(e.piece.type === "utility"){
                                    tmp++;
                                }
                            })
                            if(tmp === 1){multiply = 4;}
                            if(tmp === 2){multiply = 10}
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + multiply + " gånger tärning kr",this.x+80+ mirrorAdder*drawScale,this.y*drawScale - 27*1.35*drawScale - 27*drawScale*i)
                        }                    
                    }
                    drawRotatedImage(this.x*drawScale +715,this.y*drawScale - 35*drawScale*1.5 -27*drawScale*this.player.ownedPlaces.length -400,260*drawScale ,27*drawScale,images.playerOverlay.img[10],0,this.button.mirror,0,0,260,27,false)
                    drawRotatedImage(this.x*drawScale +715,this.y*drawScale - 35*drawScale*1.5 -27*drawScale*(this.player.ownedPlaces.length+1) -400,260*drawScale ,27*drawScale,images.playerOverlay.img[9],180,!this.button.mirror,0,0,260,27,false)
                    this.createTradebutton.y = this.y - 60 - 27*this.player.ownedPlaces.length;
                    if(players[turn] !== this.player && board.trade === undefined && players[turn].bot === undefined){
                        this.createTradebutton.visible = true;
                    }else{
                        this.createTradebutton.visible = false;
                    }
                    this.createTradebutton.draw();
                }
            }
            if(this.moneyTime > 0){
                this.moneyAnimation()
            }
            
        }
    }

}

class Auction{
    constructor(card){
        this.card = card;
        this.turn = turn;
        this.auctionMoney = 0;
        this.time = 472;
        this.started = false;
        this.timer = undefined;
        this.playerlist = [...players];


        this.addMoneyButton2 = new Button(false,-80,540,images.auction.img[1],function(){     
            board.auction.addMoney(2);
        },54,54,false)
        this.addMoneyButton10 = new Button(false,10,540,images.auction.img[2],function(){
            board.auction.addMoney(10);
        },54,54,false)
        this.addMoneyButton100 = new Button(false,100,540,images.auction.img[3],function(){
            board.auction.addMoney(100);
        },54,54,false)
        this.startAuctionButton = new Button(false,-85,540,images.auction.img[5],function(){
            board.auction.started = true;
            board.auction.duration = 10 * speeds.auctionSpeed;
            board.auction.startTime = performance.now();
            board.auction.timer = setInterval(function(){
                board.auction.time = 472 * (1 - (performance.now() - board.auction.startTime) / board.auction.duration);
            },10);
        },240,40,false)

        this.draw = function(){
            drawIsometricImage(0,0,images.card.img[card.piece.card],false,0,0,images.card.img[this.card.piece.card].width,images.card.img[this.card.piece.card].height,images.card.img[this.card.piece.card].width/3,images.card.img[this.card.piece.card].height/7.5,1)
            drawIsometricImage(0,0,images.auction.img[0],false,0,0,images.auction.img[0].width,images.card.img[this.card.piece.card].height,-images.card.img[this.card.piece.card].width/1.5,images.card.img[this.card.piece.card].height/7.5,1)
            c.fillStyle = "black";
            c.font = 80*scale+"px Arcade";
            c.textAlign = "center";
            c.fillText(this.auctionMoney + "kr", 790*scale, 450*scale);
            c.font = 80*scale+"px Arcade";
            c.fillText(this.playerlist[this.turn].name, 790*scale, 550*scale);

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
                c.fillStyle = "black"
                if(this.time < 464 && this.time >6){
                    c.fillRect(1028*scale,592*scale,-this.time*scale,56*scale)
                }
                if(this.time > 4){
                    c.fillRect(1028*scale,594*scale,2*scale,52*scale)
                }
                if(this.time > 2){
                    c.fillRect(1028*scale,596*scale,4*scale,48*scale)
                }
                if(this.time > 0){
                    c.fillRect(1028*scale,598*scale,6*scale,44*scale)
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
                                if(board.settings.allFreeparking){
                                    board.boardPieces[20].money += this.auctionMoney;
                                }
                                players[i].playerBorder.startMoneyAnimation(-this.auctionMoney)
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
                if(this.playerlist[this.turn].bot === undefined){
                    this.startAuctionButton.visible = true;
                    this.startAuctionButton.draw();
                }else{
                    this.startAuctionButton.visible = false;
                }

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
    constructor(select,x,y,img,onClick,w,h,showBorder,mirror,screencenter,disableselectTexture,disablesound,text,font,textcolor){
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
        this.font = font;
        this.selected = false;
        this.select = select
        this.disablesound = disablesound;
        this.textcolor = textcolor
        this.disableselectTexture = disableselectTexture;
        if(textcolor == undefined){
            this.textcolor = "black"
        }    
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
                if(!this.disabled && this.selected === false){
                    if(detectCollition(this.x*drawScale*scale+715*scale,this.y*drawScale*scale-400*scale,this.w*drawScale*scale,this.h*drawScale*scale,mouse.realX,mouse.realY,1,1)){
                        if(this.img.width < this.w*2){
                            drawRotatedImage(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,0,0,this.w,this.h)
                        }else{
                            drawRotatedImage(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w,0,this.w,this.h)
                        }
                        this.hover = true;
                    }else{
                        this.hover = false;
                        drawRotatedImage(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,0,0,this.w,this.h)
                    }    
                }else{
                    if(this.disabled){
                        this.hover = false;
                        if(this.select === false){
                            drawRotatedImage(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w*2,0,this.w,this.h)
                        }else{
                            if(this.img.width > this.w*2){
                                drawRotatedImage(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w*3,0,this.w,this.h)
                            }else{
                                drawRotatedImage(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,0,0,this.w,this.h)
                            }
                        }
                    }else{
                        if(detectCollition(this.x*drawScale*scale+715*scale,this.y*drawScale*scale-400*scale,this.w*drawScale*scale,this.h*drawScale*scale,mouse.realX,mouse.realY,1,1)){
                            if(this.img.width < this.w*2){
                                drawRotatedImage(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w*2,0,this.w,this.h)
                            }else{
                                drawRotatedImage(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w,0,this.w,this.h)
                            }
                            this.hover = true;
                        }else{
                            this.hover = false;
                                if(this.disableselectTexture){
                                    drawRotatedImage(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w,0,this.w,this.h)
                                }else{
                                    drawRotatedImage(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w*2,0,this.w,this.h)
                                }
                            
                        }
                    }
                    
                }
                if(this.text !== undefined){
                    c.font = this.font*scale + "px Arcade";
                    c.fillStyle = this.textcolor
                    c.textAlign = "center"
                    c.fillText(this.text,this.x*drawScale*scale + 715*scale + this.w*scale,this.y*drawScale*scale -400*scale + this.h*scale*1.5)
                }
                
            }else if(this.visible){
                if(detectCollition(this.x*drawScale*scale+715*scale,this.y*drawScale*scale-400*scale,this.w*drawScale*scale,this.h*drawScale*scale,mouse.realX,mouse.realY,1,1)){
                    this.hover = true;
                }else{
                    this.hover = false;
                }
            }
            if(showBorder){
                c.strokeStyle = "black";
                c.strokeRect(this.x*drawScale*scale+715*scale,this.y*drawScale*scale-400*scale,this.w*drawScale*scale,this.h*drawScale*scale)
            }
        }
        this.click = function(){
            if(this.visible && !this.disabled){
                if(detectCollition(this.x*drawScale*scale+715*scale,this.y*drawScale*scale-400*scale,this.w*drawScale*scale,this.h*drawScale*scale,mouse.realX,mouse.realY,1,1)){
                    if(this.select === false){
                        this.onClick();
                    }else{
                        if(this.selected){
                            this.selected = false;
                        }else{
                            this.selected = true;
                        }
                        this.onClick();
                    }
                    this.hover = false;
                    if(!this.disablesound){
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
        this.money = 0;
        this.freeParking = false;
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
            if(this.piece !== undefined){
                if(this.piece.name === "Fri parkering" && board.settings.freeParking){
                    this.freeParking = true;
                }
            }

            let mouseSquareX = (to_grid_coordinate(mouse.realX,mouse.realY).x - 1270*scale)  /(64*scale)
            let mouseSquareY = (to_grid_coordinate(mouse.realX,mouse.realY).y + 680*scale)/(64*scale)

            if(board.currentCard !== undefined && this !== board.currentCard || this.piece.type === "chance" || this.piece.type === "community Chest" || this.piece.type === "income tax" || this.piece.type === "tax" ||this.n%10 === 0 || board.auction !== undefined || board.trade !== undefined || players[turn].inJail === true){
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
            if(this.freeParking){
                c.font = 50*scale + "px Arcade"
                c.fillStyle = "black"
                c.fillText(this.money + "kr",980*scale,120*scale)
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
                if(this.piece.card !== undefined){
                    board.currentCard = this;
                }
            }
        }
        this.playerStep = function (onlyStep,player,diceRoll){
            this.currentPlayer.push(player);
            if(!onlyStep && !this.mortgaged && player.laps >= board.settings.roundsBeforePurchase){
                if(this.piece.price < 0){
                    player.money += this.piece.price;
                    board.boardPieces[20].money -= this.piece.price;
                    player.playerBorder.startMoneyAnimation(this.piece.price)
                }else if(this.piece.price > 0 && this.owner === undefined){
                    if(players[turn].bot === undefined){
                                board.currentCard = this;        
                    }
                }else if(this.owner !== player && this.owner !== undefined && board.settings.prisonmoney || this.owner !== player && this.owner !== undefined && !board.settings.prisonmoney && !this.owner.inJail){
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
                        player.playerBorder.startMoneyAnimation(-diceRoll * multiply,true)
                        this.owner.playerBorder.startMoneyAnimation(diceRoll * multiply)
                        player.checkDebt(this.owner);                        
                    }else if(this.piece.type === "station"){
                        let tmp = -1;
                        this.owner.ownedPlaces.forEach(e => {
                            if(e.piece.type === "station"){
                                tmp++;
                            }
                        })
                        player.money -=  25 * Math.pow(2,tmp);
                        this.owner.money += 25 * Math.pow(2,tmp);
                        player.playerBorder.startMoneyAnimation(-25 * Math.pow(2,tmp),true)
                        this.owner.playerBorder.startMoneyAnimation(25 * Math.pow(2,tmp))
                        player.checkDebt(this.owner);

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
                        if(ownAll && this.level === 0 && board.settings.doubleincome){
                            multiply = 2;
                        }
                        player.money -= this.piece.rent[this.level] * multiply;
                        this.owner.money += this.piece.rent[this.level] * multiply;
                        player.playerBorder.startMoneyAnimation(-this.piece.rent[this.level] * multiply,true)
                        this.owner.playerBorder.startMoneyAnimation(this.piece.rent[this.level] * multiply)
                        player.checkDebt(this.owner);
                    }
                }else if(this.piece.type === "chance"){

                    let random = randomIntFromRange(1,14)
                    if(random === 1){
                        alert("Gå till start!")
                        player.teleportTo(0, true)
                    }
                    if(random === 2){
                        alert("Gå till Hässleholm")
                        player.teleportTo(24, true)
                    }
                    if(random === 3){
                        alert("Gå till Simrishamn")
                        player.teleportTo(11, true)
                    }
                    if(random === 4){
                        alert("Gå till närmsta anläggning")
                        if(this.n === 7 ){
                            player.teleportTo(12)
                        }
                        if(this.n === 22){
                            player.teleportTo(28, true)
                        }
                        if(this.n === 36){
                            player.teleportTo(-28)
                        }
                    }
                    if(random === 5){
                        alert("Gå till närmsta tågstation")
                        if(this.n === 7){
                            player.teleportTo(-5)
                        }
                        if(this.n === 22){
                            player.teleportTo(25)
                        }
                        if(this.n === 36){
                            player.teleportTo(-35)
                        }
                    }
                    if(random === 6){
                        alert("Få 50kr")
                        player.money += 50;
                        player.playerBorder.startMoneyAnimation(50)
                    }
                    if(random === 7){
                        alert("Get out of jail card")
                        player.jailcardAmount++;
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
                        alert("Betala 25 för varje hus man har och 100 för varje hotell")
                        let tmp = 0;
                        board.boardPieces.forEach(function(e){
                            if(player === e.owner){
                                if(e.level < 5){
                                    player.money -= 25*e.level
                                    tmp+= 25*e.level
                                    if(board.settings.freeParking){
                                        board.boardPieces[20].money += 25*e.level;
                                    }
                                }else{
                                    player.money -= 100
                                    tmp += 100
                                    if(board.settings.freeParking){
                                        board.boardPieces[20].money += 100;
                                    }
                                }
                            }
                        })
                        if(tmp !== 0){
                            player.playerBorder.startMoneyAnimation(-tmp)
                        }
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
                        player.playerBorder.startMoneyAnimation(((players.length-1)*50),true)
                        players.forEach(e=> {if(e !== player){e.money-=50;e.playerBorder.startMoneyAnimation(-50)}})
                    }
                    if(random === 14){
                        alert("Få 150kr")
                        player.money += 150
                        player.playerBorder.startMoneyAnimation(150)
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
                        player.playerBorder.startMoneyAnimation(200)
                    }
                    if(random === 3){
                        alert("Förlora 50kr")
                        player.money -= 50;
                        if(board.settings.freeParking){
                            board.boardPieces[20].money += 50;
                        }
                        player.playerBorder.startMoneyAnimation(-50)
                    }
                    if(random === 4){
                        alert("Få 50kr")
                        player.money += 50;
                        player.playerBorder.startMoneyAnimation(50)
                    }
                    if(random === 4){
                        alert("Get out of jail card")
                        player.jailcardAmount++;
                    }
                    if(random === 5){
                        alert("Gå till finkan")
                        player.goToPrison()
                    }
                    if(random === 6){
                        alert("Få 50kr av alla andra spelare")
                        player.money += (players.length-1)*50
                        player.playerBorder.startMoneyAnimation(((players.length-1)*50))
                        players.forEach(e=> {if(e !== player){e.money-=50;e.playerBorder.startMoneyAnimation(-50,true)}})
                    }
                    if(random === 7){
                        alert("Få 100kr")
                        player.money += 100;
                        player.playerBorder.startMoneyAnimation(100)
                    }
                    if(random === 8){
                        alert("Få 20kr")
                        player.money += 20;
                        player.playerBorder.startMoneyAnimation(20)
                    }
                    if(random === 9){
                        alert("Få 10kr av alla andra spelare")
                        player.money += (players.length-1)*10
                        player.playerBorder.startMoneyAnimation((players.length-1)*10)
                        players.forEach(e=> {if(e !== player){e.money-=10;e.playerBorder.startMoneyAnimation(-50,true)}})
                    }
                    if(random === 10){
                        alert("Få 100kr")
                        player.money += 100;
                        player.playerBorder.startMoneyAnimation(100)
                    }
                    if(random === 11){
                        alert("Förlora 50kr")
                        player.money -= 50;
                        if(board.settings.freeParking){
                            board.boardPieces[20].money += 50;
                        }
                        player.playerBorder.startMoneyAnimation(-50)
                    }
                    if(random === 12){
                        alert("Förlora 50kr")
                        player.money -= 50;
                        if(board.settings.freeParking){
                            board.boardPieces[20].money += 50;
                        }
                        player.playerBorder.startMoneyAnimation(-50)
                    }
                    if(random === 13){
                        alert("Förlora 25kr")
                        player.money -= 25;
                        if(board.settings.freeParking){
                            board.boardPieces[20].money += 25;
                        }
                        player.playerBorder.startMoneyAnimation(-25)
                    }
                    if(random === 14){
                        alert("Betala 40 för varje hus man har och 115 för varje hotell")
                        let tmp = 0;
                        board.boardPieces.forEach(function(e){
                            if(player === e.owner){
                                if(e.level < 5){
                                    player.money -= 40*e.level
                                    if(board.settings.freeParking){
                                        board.boardPieces[20].money += 40*e.level;
                                    }
                                    tmp += 40*e.level
                                }else{
                                    player.money -= 115
                                    tmp += 115
                                    if(board.settings.freeParking){
                                        board.boardPieces[20].money += 115;
                                    }
                                }
                            }
                        })
                        if(tmp != 0){
                            player.playerBorder.startMoneyAnimation(-tmp)
                        }
                    }
                    if(random === 15){
                        alert("Få 10kr")
                        player.money += 10;
                        player.playerBorder.startMoneyAnimation(10)
                    }
                    if(random === 16){
                        alert("Få 100kr")
                        player.money += 100;
                        player.playerBorder.startMoneyAnimation(100)
                    }
                }else if(this.piece.type === "income tax"){
                    if(player.money > 2000){
                        player.money -= 200;
                        board.boardPieces[20].money += 200;
                        player.playerBorder.startMoneyAnimation(-200)
                    }else{
                        player.playerBorder.startMoneyAnimation(-Math.round(player.money * 0.1))
                        player.money =  Math.round(player.money * 0.9);
                        board.boardPieces[20].money += (Math.round(player.money * 0.1));
                    }
                }else if(this.freeParking){
                    player.money += this.money;
                    player.playerBorder.startMoneyAnimation(this.money)
                    this.money = 0;
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
                delete Bot.boardInfo[turn]
                turn = turn%(players.length-1);

                if(players.length-1 === 1){
                    board.win = true;
                }
                board.boardPieces[this.steps].currentPlayer.splice(board.boardPieces[this.steps].currentPlayer.indexOf(this),1)
                players.splice(players.indexOf(this),1)

            }else if(this.money < 0){
                this.negative = true;
            }  else{
                this.negative = false;
            }
        }
        this.checkDebt = function(player){
            if(this.money < 0 && this.lastMoneyInDebt === 0){
                player.money += this.money;
                this.inDebtTo = player;
                this.lastMoneyInDebt = this.money;
            }else if(this.inDebtTo !== undefined){
                let moneyToAdd =  this.money -this.lastMoneyInDebt;
                this.inDebtTo.money += moneyToAdd;
                this.inDebtTo.startMoneyAnimation(moneyToAdd)
                if(this.money >= 0){
                    this.inDebtTo.money -= this.money;
                    this.inDebtTo = undefined;
                    this.lastMoneyInDebt = 0;
                }
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
            self.timeInJail = 0;
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
                        self.playerBorder.startMoneyAnimation(200)
                            self.money += 200;
                            self.laps++;
                    }else{
                        board.boardPieces[(to2-self.animationOffset)%40].playerStep(true,self);
                    }
                    

                }
            },speeds.stepSpeed);
        }

        this.animateDice = function(dice1,dice2,callback){
            board.animateDices = true;

            let counter = speeds.diceSpeed.counter;
            playSound(sounds.dice,1)
            var myFunction = function() {
                board.randomizeDice();
                board.dice1 = randomIntFromRange(1,6)
                board.dice2 = randomIntFromRange(1,6)
                counter *= speeds.diceSpeed.factor
                if(counter > speeds.diceSpeed.threshold){
                    board.dice1 = dice1;
                    board.dice2 = dice2;
                    setTimeout(() => {
                        board.animateDices = false;
                        callback()
                    }, speeds.diceSpeed.delay);
                }else{
                    setTimeout(myFunction, counter);
                }
            }
            setTimeout(myFunction, counter);
        }
        
        this.rollDice = function(){
            if(this.negative === false){
                if(this.inJail === false){
                    if(this.rolls === false){
                        let oldStep = this.steps;
                        let dice1 = randomIntFromRange(1,6);
                        let dice2 = randomIntFromRange(1,6);
                        this.numberOfRolls++;
                        if(dice1 === dice2){
                            this.rolls = false;
                        }else{
                            this.rolls = true;
                        }
                        
                        let diceSum = dice1+dice2;
                        this.dice1 = dice1
                        this.dice2 = dice2
                        let self = this;

                        this.animateDice(dice1,dice2,function(){
                            if(self.numberOfRolls === 3 && dice1 === dice2){
                                alert("Olagligt att slå dubbla tärningar tre gånger!")
                                self.goToPrison();
                                return;
                            }
                            board.animateDices = false;
                            self.steps += dice1+dice2;
                            self.steps = self.steps%40;
                            self.animateSteps(oldStep,self.steps,diceSum,1,true)
                        })
                           
                    }
                }
            }
            
        }
        board.boardPieces[0].currentPlayer.push(this);

    }
}


init();
update();


