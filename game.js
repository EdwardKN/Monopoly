var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");
canvas.id = "game"
var backCanvas = document.createElement("canvas");
var backC = backCanvas.getContext("2d");

var menus = [];

var firstclick = false;

var musictimer;

var musicOn = JSON.parse(getCookie("musicOn") === undefined ? false : getCookie("musicOn"));

var musicPlaying;

var finish = JSON.parse(getCookie("finish") === undefined ? false : getCookie("finish"));;

var musicVolume = JSON.parse(getCookie("musicVolume") === undefined ? 100 : getCookie("musicVolume"));

var timeouts = [];
var intervals = [];

window.onload = fixCanvas;

window.addEventListener("resize", fixCanvas)

function fixCanvas(){
   
     backCanvas.width = window.innerWidth;
    backCanvas.height = window.innerHeight;
    let tmp = {
        width:undefined,
        height:undefined
    }
    if(window.screen.availWidth*9 < window.screen.availHeight*16){
        tmp.width = window.screen.availWidth;
        tmp.height = (window.screen.availWidth*9)/16;
    }else{
        tmp.width = (window.screen.availHeight*16)/9;
        tmp.height = window.screen.availHeight;
    }
    
    scale = Math.sqrt(Math.pow(tmp.width,2) + Math.pow(tmp.height,2))/Math.sqrt(Math.pow(1920,2) + Math.pow(1080,2))/window.devicePixelRatio*scaleMultiplier
    if(window.innerWidth*9 < window.innerHeight*16){
        canvas.width = window.innerWidth;
        canvas.height = (window.innerWidth*9)/16;
    }else{
        canvas.width = (window.innerHeight*16)/9;
        canvas.height = window.innerHeight;
    }
}

canvas.addEventListener("mousemove",function(e){
    mouse = {
        x:e.offsetX,
        y:e.offsetY,
    }
})

window.addEventListener("mousedown",function(e){
    document.documentElement.requestFullscreen()
    if(firstclick === false && musicOn){
        firstclick = true;
        if(finish){
            playSound(sounds.msc,musicVolume,true)
        }else{
            playSound(sounds.music,musicVolume,true)
        }
    }
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
function split(str, index) {
    const result = [str.slice(0, index), str.slice(index)];
  
    return result;
  }

async function preRender(imageObject){
    await loadSpriteSheet();
    Object.entries(imageObject).forEach(image => {
        image[1].sprites = [];
        for(i=0;i<image[1].src.length;i++){
            let src = (image[1].src[i].split("/"))
            let src2 = src[src.length-2] + "/"+ src[src.length-1]
            image[1].sprites.push(spritesheet.frames[spritesheet.frames.map(function(e) { return e.filename; }).indexOf(src2 + ".png")])
        }
    });
}
async function loadSounds(soundObject){
    Object.entries(soundObject).forEach(async function(sound) {
        sound[1].sound = new Audio(sound[1].src)
        if(sound[1].type === "multiple"){
            sound[1].labels = []
            let tmp = await fetch("."+sound[1].src.split(".")[0]+sound[1].src.split(".")[1] + ".txt")
            let tmp2 = (await tmp.text()).split("\n")
            let tmp3 = (tmp2.map(e => e.replaceAll("\t","")))
            let tmp4 = (tmp3.map(e => e.replaceAll(" ","")))
            let tmp5 = (tmp4.map(e => e.replaceAll("\r","")))
            let tmp6 = (tmp5.map(e => split(e,8)[0]))
            let tmp7 = (tmp6.filter(e => e != ""))
            let tmp8 = (tmp7.map(e => JSON.parse(e)))
            sound[1].labels = tmp8
        }
    });
}

function drawRotatedImageFromSpriteSheet(x,y,w,h,frame,angle,mirrored,cropX,cropY,cropW,cropH,offset,drawcanvas){
    let degree = angle * Math.PI / 180;

    let middlePoint = {
        x:Math.floor(x*scale+w/2*scale),
        y:Math.floor(y*scale+h/2*scale)
    };
    if(drawcanvas === undefined){
        drawcanvas = c;
    }

    drawcanvas.save();
    drawcanvas.translate(middlePoint.x,middlePoint.y);
    drawcanvas.rotate(degree);
    if(mirrored === true){
        drawcanvas.scale(-1, 1);
    }
    
    drawcanvas.drawImage(spritesheetImage,Math.floor(cropX+frame.frame.x),Math.floor(cropY+frame.frame.y),Math.floor(cropW),Math.floor(cropH),Math.floor(-w/2*scale),Math.floor(-h/2*scale),Math.floor(w*scale),Math.floor(h*scale));

    drawcanvas.restore();
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
    return x+w>x2 && x<x2+w2 && y+h>y2 && y<y2+h2;
};
function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && 
           !isNaN(parseFloat(str)) 
  }

function drawIsometricImage(x,y,img,mirror,cropX,cropY,cropW,cropH,offsetX,offsetY,sizeOveride,drawcanvas){
    let scaleOfThis = drawScale;
    if(sizeOveride !== undefined){
        scaleOfThis = sizeOveride*drawScale;
    }
    if(drawcanvas === undefined){
        drawcanvas = c;
    }
    drawRotatedImageFromSpriteSheet(to_screen_coordinate(x*drawScale,y*drawScale).x + 850 + offsetX*drawScale,to_screen_coordinate(x*drawScale,y*drawScale).y + 120 + offsetY*drawScale,cropW*scaleOfThis,cropH*scaleOfThis,img,0,mirror,cropX,cropY,cropW,cropH,true,drawcanvas)
}



function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
};

function playSound(sound,volume,repeat){
    if(sound.type === "single"){
        let myClonedAudio = sound.sound.cloneNode();
        myClonedAudio.volume = volume;
        myClonedAudio.play();
    }else{
        let random = Math.floor(Math.random() * sound.labels.length)
        let myClonedAudio = sound.sound.cloneNode();
        myClonedAudio.volume = volume;
        myClonedAudio.currentTime = sound.labels[random]
        myClonedAudio.play();
        let start = sound.labels[random];
        let end = sound.labels[random+1] != undefined ? sound.labels[random+1] : sound.sound.duration

        setTimeout(function(){
            myClonedAudio.pause();
        },(end - start)*1000)

        if(repeat && musicOn){
            musicPlaying = myClonedAudio;
            musictimer = setTimeout(function(){
                playSound(sound,volume,true)
            },(end - start)*1000)
        }
    }

};
function startGame(playerlist,settings){
    board = new Board();

    board.settings = settings;
    let tmpArray =[];
    for(i = 0; i < playerlist.length; i++){
        tmpArray.push(i);
    }
    for(i = 0; i < playerlist.length; i++){
        let tmpI = randomIntFromRange(0,tmpArray.length-1);
        let correctI = tmpArray[tmpI]
        players.push(new Player(images.player.sprites[playerlist[correctI].color],playerlist[correctI].color,playerlist[correctI].name,playerlist[correctI].bot))
        tmpArray.splice(tmpI,1)
    }
    turn = randomIntFromRange(0,playerlist.length-1)
    board.textsize = measureText({font:"Arcade",text:"Just nu: " + players[turn].name});
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
        this.settingsButtons.push(new Button([true,false],100,220,images.buttons.sprites[10],function(){},500,40,false,false,false,false,false,false,"Ge alla skattepengar till fri parkering",42,"black"))
        this.settingsButtons.push(new Button([true,false],100,220+ this.settingsButtons.length*45,images.buttons.sprites[10],function(){},500,40,false,false,false,false,false,false,"Ge alla bankpengar till fri parkering",42,"black"))
        this.settingsButtons.push(new Button([true,false],100,220 + this.settingsButtons.length*45,images.buttons.sprites[10],function(){},500,40,false,false,false,false,false,false,"Dubbel hyra på komplett färggrupp",42,"black"))
        this.settingsButtons.push(new Button([true,false],100,220 + this.settingsButtons.length*45,images.buttons.sprites[10],function(){},500,40,false,false,false,false,false,false,"Auktioner",42,"black"))
        this.settingsButtons.push(new Button([true,false],100,220 + this.settingsButtons.length*45,images.buttons.sprites[10],function(){},500,40,false,false,false,false,false,false,"Få/förlora pengar i fängelset",42,"black"))
        this.settingsButtons.push(new Button([true,false],100,220 + this.settingsButtons.length*45,images.buttons.sprites[10],function(){},500,40,false,false,false,false,false,false,"Möjlighet att inteckna",42,"black"))
        this.settingsButtons.push(new Button([true,false],100,220 + this.settingsButtons.length*45,images.buttons.sprites[10],function(){},500,40,false,false,false,false,false,false,"Jämn utbyggnad",42,"black"))
        this.settingsButtons.push(new Slider(456*drawScale,300*drawScale + this.settingsButtons.length*12,502*drawScale,40*drawScale,0,3000,100,true,50,"kr","Startkapital: "))
        this.settingsButtons.push(new Slider(456*drawScale,300*drawScale + this.settingsButtons.length*12*drawScale,502*drawScale,40*drawScale,0,5,1,true,50,"","Antal varv innan köp: "))
        this.settingsButtons[2].selected = true
        this.settingsButtons[3].selected = true
        this.settingsButtons[4].selected = true
        this.settingsButtons[5].selected = true
        this.settingsButtons[6].selected = true
        this.settingsButtons[7].percentage = 0.45
        this.readyPlayers = [];
        this.settingsButtons[1].disabled = true;

        this.backButton = new Button([false,false],-337,220,images.buttons.sprites[12],function(){
            self.current = false;
            menus[0].current = true;
            self.backButton.visible = false;
            self.startButton.visible = false;
            self.playerInputs.forEach( e=>{
                e.textInput.htmlElement.style.display = "none"
                e.textInput.visible = false;
                e.botButton.visible = false;
                e.colorButton.visible = false;
                e.colorButtons.forEach(g => g.visible = false)
                })
        },325,60,false,false,false,false,false,false)
        this.startButton = new Button([false,false],250,650,images.buttons.sprites[11],function(){
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
            self.backButton.visible = false;
            self.startButton.visible = false;
            self.settingsButtons.forEach(e => e.visible = false)
            self.playerInputs.forEach( e=>{
                e.textInput.htmlElement.style.display = "none"
                e.textInput.value = "";
                e.textInput.htmlElement.value = "";
                e.textInput.colorId = undefined;
                e.textInput.visible = false;
                e.botButton.visible = false;
                e.colorButtons.forEach(g => g.selected = false)
                e.colorButton.img = images.colorButtons.sprites[8];
                e.colorButton.visible = false;
                e.colorButtons.forEach(g => g.visible = false)
                e.botButton.selected = false;
                e.textInput.htmlElement.disabled = false;
                e.textInput.oldvalue = ""
            })
            self.useableColors = [0,1,2,3,4,5,6,7]
        },97*2,80,false,false,false,false,false,false)
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
                botButton: new Button([true,false],-50 +42,self.playerInputs.length*55 - 32,images.buttons.sprites[13],function(){
                    self.playerInputs[id].textInput.htmlElement.value = ""
                    if(self.playerInputs[id].botButton.selected){
                        if(self.playerInputs[id].colorId !== undefined){
                            self.useableColors.push(self.playerInputs[id].colorId)
                        }
                        self.amountBots++;
                        self.playerInputs[id].colorButton.img = images.colorButtons.sprites[8]
                        self.playerInputs[id].colorId = undefined;
                        self.playerInputs[id].colorButtons.forEach(e => e.selected = false);
                    }else{
                        self.amountBots--;
                        self.playerInputs[id].textInput.htmlElement.value = ""
                        self.playerInputs[id].textInput.oldvalue = "";
                        self.playerInputs[id].textInput.htmlElement.disabled = false;
                    }
                },40,40,false,false),
                colorButton: new Button([true,false],-50,self.playerInputs.length*55 - 32,images.colorButtons.sprites[8],function(){
                    if(self.playerInputs[id].colorButton.selected){
                        self.disableAll = true;
                        if(id < 4){
                            for(let i = id+1; i < 3+id; i++){
                                self.playerInputs[i].textInput.w = 400
                            }
                        }else{
                            for(let i = id-2; i < id; i++){
                                self.playerInputs[i].textInput.w = 400
                            }
                        }
                    }else{
                        self.disableAll = false;
                        self.playerInputs.forEach(e => e.textInput.w = 560)
                    }
                },40,40,false,false,false,true,false,{x:300,y:300,w:200,h:200,onlySelected:true}),
                colorButtons: []
            }
            for(let i = 0; i < 8; i++){
                tmp.colorButtons.push(new Button([true,false],110 + (i%4)*47,self.playerInputs.length*55 +150 + Math.floor(i/2)*50,images.colorButtons.sprites[i],function(){
                    let select = self.playerInputs[id].colorButtons[i].selected;
                    self.playerInputs[id].colorButtons.forEach(e => {
                        e.selected = false;
                    })
                    if(select === true){
                        self.playerInputs[id].colorButtons[i].selected = true;
                        self.playerInputs[id].colorButton.img = images.colorButtons.sprites[i];
                        if(self.playerInputs[id].colorId !== undefined){
                            self.useableColors.push(self.playerInputs[id].colorId)
                        }
                        self.useableColors.splice(self.useableColors.indexOf(i),1)
                        self.playerInputs[id].colorId = i;
                    }else{
                        self.playerInputs[id].colorButtons[i].selected = false;

                        self.playerInputs[id].colorButton.img = images.colorButtons.sprites[8];
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
                drawRotatedImageFromSpriteSheet(0,0,981*drawScale,552*drawScale,images.mainMenu.sprites[3],0,0,0,0,981,552)
                this.readyPlayers = [];

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
                            e.colorButtons[i].y = e.y/2 + (i%2)*50 + 281 - self.playerInputs.length*40/2 +118
                        }else{
                            e.colorButtons[i].y = e.y/2 + (i%2)*50 + 291 - self.playerInputs.length*40/2 +262
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

                        e.textInput.htmlElement.value = "Bot " + lastBotId;
                        e.textInput.htmlElement.disabled = true;
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
                    if(e.textInput.value !== "" && !e.botButton.selected){
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
                            c.fillRect(e.colorButton.x*drawScale*scale + 550*scale,e.colorButton.y*drawScale*scale -630*scale,410*scale,230*scale)
                            e.colorButton.invertedHitbox = {x:e.colorButton.x*drawScale + 550,y:e.colorButton.y*drawScale -610,w:410,h:210,onlySelected:true}
                        }else{
                            c.fillRect(e.colorButton.x*drawScale*scale +550*scale,e.colorButton.y*drawScale*scale -26*scale -294*scale,410*scale,230*scale)
                            e.colorButton.invertedHitbox = {x:e.colorButton.x*drawScale +550,y:e.colorButton.y*drawScale -26 -294,w:410,h:210,onlySelected:true}
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

        this.localButton = new Button([false,false],-322,380,images.mainMenu.sprites[1],function(){
            self.current = false;
            menus[1].current = true;
            self.localButton.visible = false;
            self.onlineButton.visible = false;
            self.musicButton.visible = false;
            self.fullScreenButton.visible = false;
        },195,52,false,false,true)
        this.onlineButton = new Button([false,false],-322,540,images.mainMenu.sprites[2],function(){
            self.current = false;
            self.localButton.visible = false;
            self.onlineButton.visible = false;
            self.musicButton.visible = false;
            self.fullScreenButton.visible = false;
            showOnlineLobby();
        },195,52,false,false,true)

        this.musicButton = new Button([true,false],-317+40+140,700,images.buttons.sprites[14],function(){
            document.cookie = `musicOn=${!self.musicButton.selected};Expires=Sun, 22 oct 2030 08:00:00 UTC;`;
            clearTimeout(musictimer)
            if(self.musicButton.selected){
                if(musicPlaying !== undefined && musicOn){
                    musicPlaying.pause();
                    musicOn = false;
                }
            }else{
                firstclick = true;
                musicOn = true;
                if(finish){
                    playSound(sounds.msc,1,true)
                }else{
                    playSound(sounds.music,1,true)
                }            
            }
        },40,40,false)
        this.finishButton = new Button([true,false],-317,700,images.buttons.sprites[19],function(){
            if(self.finishButton.selected){
                finish = true;
            }else{
                finish = false;
                
            }
            document.cookie = `finish=${finish};Expires=Sun, 22 oct 2030 08:00:00 UTC;`;
            clearTimeout(musictimer)
            if(musicOn){
                musicPlaying.pause();
            }
            musicOn = false;
            firstclick = true;
            musicOn = true;
            if(finish){
                playSound(sounds.msc,musicVolume,true)
            }else{
                playSound(sounds.music,musicVolume,true)
            }

        },40,40,false)
        this.finishButton.selected = finish;
        this.fullScreenButton = new Button([true,true],-357,700,images.buttons.sprites[18],function(){
            if(this.selected){
                document.documentElement.requestFullscreen()
            }else{
                document.exitFullscreen()
            }
        },40,40,false)
        this.volume = new Slider(240-80,1000,280,80,0,100,1,true,50,"%","",function(){
            musicVolume = self.volume.value/100;
            document.cookie = `musicVolume=${musicVolume};Expires=Sun, 22 oct 2030 08:00:00 UTC;`;
            if(musicOn){
                musicPlaying.volume = musicVolume;
            }
        })
        this.scalePlus = new Button([false,false],562,700,images.lobbyMenu.sprites[0],function(){
           scaleMultiplier *= Math.sqrt(2);
           fixCanvas();
        },40,40,false)
        this.scaleMinus = new Button([false,false],522,700,images.lobbyMenu.sprites[1],function(){
            scaleMultiplier /= Math.sqrt(2);
            fixCanvas();
         },40,40,false)
        this.volume.percentage = musicVolume


        this.musicButton.selected = !musicOn
        
        this.onlineButton.disabled = false;

        this.draw = function(){
            if(this.current){
                drawRotatedImageFromSpriteSheet(0,0,981*drawScale,552*drawScale,images.mainMenu.sprites[0],0,0,0,0,981,552)
                musicOn = !this.musicButton.selected;
                this.localButton.visible = true;
                this.onlineButton.visible = true;
                this.musicButton.visible = true;
                this.finishButton.visible = true;
                this.fullScreenButton.visible = true;
                this.fullScreenButton.selected = document.fullscreenElement != null;
                this.localButton.draw();
                this.onlineButton.draw();
                this.musicButton.draw();
                this.finishButton.draw();
                this.fullScreenButton.draw();
                this.volume.visible = true;
                this.volume.draw();
                if(Math.floor(scale*window.screen.availWidth) == 1080){
                    this.scalePlus.disabled = true;
                }else{
                    this.scalePlus.disabled = false;
                }
                this.scalePlus.visible  = true;
                this.scalePlus.draw();
                this.scaleMinus.visible = true;
                this.scaleMinus.draw()
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
        this.htmlElement = document.createElement("input");
        document.body.appendChild(this.htmlElement)
        this.oldvalue = this.htmlElement.value;

        this.htmlElement.style.position = "absolute"

        this.htmlElement.style.padding = "0px"
        this.htmlElement.style.zIndex = 100;
        this.htmlElement.style.display = "none"
        this.htmlElement.style.fontFamily = "Arcade"
        this.htmlElement.style.lineHeight = "200%"

        this.draw = function(){
            this.htmlElement.style.left = this.x*scale +(window.innerWidth-canvas.width)/2 -5*scale+ "px";
            this.htmlElement.style.top = this.y*scale+ (window.innerHeight-canvas.height)/2-5*scale+"px";
            this.htmlElement.style.width = this.w*scale+ "px";
            this.htmlElement.style.height = this.h*scale+ "px";
            this.htmlElement.style.fontSize = this.font*scale + "px"
            this.htmlElement.maxLength = this.maxLength;
            this.htmlElement.style.border = 5*scale+"px solid black "

            if(this.visible){
                if(this.oldvalue !== this.htmlElement.value){
                    this.oldvalue = this.htmlElement.value;
                    if(!this.htmlElement.disabled){
                        playSound(sounds.key,1,false)
                    }
                }
                this.htmlElement.style.display = "inline"
                this.value = this.htmlElement.value

            }
        }
    }
}

async function init(){
    document.body.appendChild(canvas);
    canvas.style.zIndex = -100;
    document.body.appendChild(backCanvas);
    backCanvas.style.zIndex = -150;

    canvas.width = innerWidth;
    canvas.height = innerHeight;
    
    await preRender(images);
    loadSounds(sounds);   


    if (location.search != "") {
        await showOnlineLobby();
        return;
    }
    
    
    if(fastLoad === false){
        menus.push(new MainMenu())
        menus.push(new LocalLobby())
        update();

    }else{
        menus.push(new MainMenu())
        menus.push(new LocalLobby())


        menus[0].localButton.visible = false;
        menus[0].onlineButton.visible = false;
        menus[0].musicButton.visible = false;
        menus[0].current = false;

        let playerlist = []
        let playerAmount = 8;
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

        let settings = {
            freeParking:false,
            allFreeparking:false,
            doubleincome:true,
            auctions:true,
            prisonmoney:true,
            mortgage:true,
            even:true,
            startmoney:1400,
            roundsBeforePurchase:0,
        }
        startGame(playerlist,settings)
        update();

    }
}

function update(){
    requestAnimationFrame(update);

    c.imageSmoothingEnabled = true;
    c.clearRect(0,0,canvas.width,canvas.height);
    showBackground();

    if(board !== undefined && players.length >0){
        board.update();
    }

    let tmp = false;

    buttons.forEach(e =>{
        if(e.hover && e.visible){
            tmp = true;
        }
    });

    if(tmp === true){
        canvas.style.cursor = "pointer"
    }else{
        canvas.style.cursor = "auto"
    }

    menus.forEach(e => e.draw())
}

function showBackground(){
    for(let x = -4; x <8; x++){
        for(let y = -4; y < 8; y++){
            drawIsometricImage(-352*2    + 832*x,+832*y,images.background.sprites[1],false,0,0,832,416,0,0,1,backC)

        }
    }
    drawIsometricImage(-92,352,images.background.sprites[0],false,0,0,572,286,0,0)
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
            players.forEach(e => buttons.splice(buttons.indexOf(e.playerBorder.button),1))
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
            board.textsize = measureText({font:"Arcade",text:"Just nu: " + players[turn].name});
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
            var index =  players.findIndex(x => x.colorIndex == evt.detail.player);
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
    } catch(err) {
        alert("VIKTIGT!\nDu kommer att hamna på en annan webbsida.\nFör att gå med i spelet måste du klicka på:\nAvancerat...>Acceptera risken och fortsätt\nOm du inte gör detta så kommer du inte kunna ansluta till spelet.");
        location = "https://" + serverURL + "/" + btoa(location.href) + "/" + encodeURI(username);
    }
}

class Board{
    constructor(){
        this.boardSettings = {
            freeParking:false
        }
        this.dice1 = 1;
        this.dice2 = 1;
        this.dice1Type = 0;
        this.dice2Type = 0;
        this.boardPieces = [];
        this.prisonExtra = new BoardPiece(-1,[])
        this.showDices = false;
        this.animateDices = false;
        this.win = false;
        this.auction = undefined;
        this.trade = undefined;
        this.currentShowingCard = undefined;
        let self = this;
        this.textsize = 0;
        this.musicButton = new Button([true,false],31,530,images.buttons.sprites[14],function(){
            document.cookie = `musicOn=${!self.musicButton.selected};Expires=Sun, 22 oct 2030 08:00:00 UTC;`;
            clearTimeout(musictimer)
            if(self.musicButton.selected){
                if(musicPlaying !== undefined && musicOn){
                    musicPlaying.pause();
                    musicOn = false;
                }
            }else{
                firstclick = true;
                musicOn = true;
                if(finish){
                    playSound(sounds.msc,1,true)
                }else{
                    playSound(sounds.music,1,true)
                }            
            }
        },40,40,false)
        this.musicButton.selected = !musicOn;
        this.fullScreenButton = new Button([true,true],81,530,images.buttons.sprites[18],function(){
            if(this.selected){
                document.documentElement.requestFullscreen()
            }else{
                document.exitFullscreen()
            }
        },40,40,false)

        this.goToMainMenuButton = new Button([false,false],143,530,images.buttons.sprites[15],function(){
            board.getToMainMenuButton.selected = false;
            board.goToMainMenuButton.visible = false;
            board.escapeConfirm.visible = false;
            board.getToMainMenuButton.visible = true;
            board.musicButton.visible = false;
            board.fullScreenButton.visible = false;
        },40,40,false,false,false,false,false,{x:722,y:336,w:256*drawScale,h:224*drawScale});
        this.escapeConfirm = new Button([false,false],191,530,images.buttons.sprites[16],function(){
            board.getToMainMenuButton.selected = false;
            board.goToMainMenuButton.visible = false;
            board.escapeConfirm.visible = false;
            board.getToMainMenuButton.visible = false;
            board.fullScreenButton.visible = false;
            players.forEach(e => buttons.splice(buttons.indexOf(e.playerBorder.button),1))
            players = [];
            menus[0].current = true;
            board = undefined;
            if (Api.online) Api.disconnect();
            timeouts.forEach(e => clearTimeout(e));
            intervals.forEach(e => clearInterval(e));
            timeouts = [];
        },40,40,false,false,false,false,false,);

        this.getToMainMenuButton = new Button([true,false],90 ,700,images.buttons.sprites[17],function(){
        },80,40,false,false,false,true,false,false)

        this.getToMainMenuButton.visible = true;

        this.payJailButton = new Button([false,false],-10,520,images.jailMenu.sprites[1],function(){
            players[turn].money -= 50;
            if(board.settings.freeParking){
                board.boardPieces[20].money += 50;
            }
            players[turn].rolls = true;
            players[turn].getOutOfJail("MONEY");
            board.payJailButton.visible = false;
            board.rollJailButton.visible = false;
            board.jailCardButton.visible = false;
            players[turn].playerBorder.startMoneyAnimation(-50);
                
        },82,35);
        this.rollJailButton = new Button([false,false],85,520,images.jailMenu.sprites[2],function(){
            let dice1 = randomIntFromRange(1,6);
            let dice2 = randomIntFromRange(1,6);
            players[turn].rolls = true;

            let self = players[turn];

            players[turn].timeInJail++;

            players[turn].animateDice(dice1,dice2,function(){
                board.animateDices = false; 
                if(dice1 === dice2|| players[turn].timeInJail === 3){
                    self.getOutOfJail("DICE")
                }
                if(dice1 === dice2){
                    self.teleportTo(self.steps + dice1 + dice2);
                    players[turn].rolls = false;
                }
            })
            board.payJailButton.visible = false;
            board.rollJailButton.visible = false;
            board.jailCardButton.visible = false;
        },82,35);
        this.jailCardButton = new Button([false,false],180,520,images.jailMenu.sprites[3],function(){
            players[turn].jailcardAmount--;
            players[turn].getOutOfJail("CARD");
            board.payJailButton.visible = false;
            board.rollJailButton.visible = false;
            board.jailCardButton.visible = false;
        },82,35);
        this.rollDiceButton = new Button([false,false],76,530,images.buttons.sprites[0],function(){players[turn].rollDice()},107,23,false,false,false,true)
        this.nextPlayerButton = new Button([false,false],76,530,images.buttons.sprites[1],function(){
            if(players[turn].money >= 0){
                players[turn].rolls = false;
                players[turn].numberOfRolls = 0;
                if (Api.online) {
                    Api.changeTurn();
                } else {
                    turn = (turn+1)%players.length;
                    board.textsize = measureText({font:"Arcade",text:"Just nu: " + players[turn].name});
                }

                board.nextPlayerButton.visible = false;
            }
            board.animateDices = false;
            board.showDices = false;
        },107,23)

        if (Api.online && Api.currentPlayer == 0) {
            this.rollDiceButton.visible = true;
            this.nextPlayerButton.visible = false;
        }

        this.currentCard = undefined;
        this.cardCloseButton = new Button([false,false],241,318,images.buttons.sprites[7],function(){
            board.currentCard = undefined;
            board.sellButton.visible = false;
            board.mortgageButton.visible = false;
            board.upgradeButton.visible = false;
            board.downgradeButton.visible = false;
            board.getToMainMenuButton.visible = true;
        },18,18,false,false,false,false,false,{x:722,y:236,w:256*drawScale,h:324*drawScale})
        this.sellButton = new Button([false,false],130,580,images.buttons.sprites[2],function(){
            if(board.currentCard.mortgaged === false){
                players[turn].money+= board.currentCard.piece.price/2
                players[turn].checkDebt(board.boardPieces[20]);
                players[turn].playerBorder.startMoneyAnimation(board.currentCard.piece.price/2);
            }
            players[turn].ownedPlaces.splice(players[turn].ownedPlaces.indexOf(board.currentCard),1);
            board.currentCard.owner = undefined;
        },40,40);
        this.mortgageButton = new Button([false,false],80,580,images.buttons.sprites[3],function(){
            if(board.currentCard.mortgaged === true){
                if (Api.online) {
                    Api.tilePurchased(board.currentCard, (board.currentCard.piece.price/2)*1.1);
                    return;
                }
                
                board.currentCard.mortgaged = false;
                if(board.settings.allFreeparking){
                    board.boardPieces[20].money += (board.currentCard.piece.price/2)*1.1
                }
                players[turn].money -= (board.currentCard.piece.price/2)*1.1
                players[turn].playerBorder.startMoneyAnimation(-(board.currentCard.piece.price/2)*1.1)
            }else{
                if (Api.online) {
                    Api.mortagedTile(board.currentCard);
                    return;
                }

                board.currentCard.mortgaged = true;
                players[turn].money += board.currentCard.piece.price/2
                players[turn].playerBorder.startMoneyAnimation(board.currentCard.piece.price/2)
                players[turn].checkDebt(board.boardPieces[20]);
            }
        },40,40);
        this.upgradeButton = new Button([false,false],75,580,images.buttons.sprites[4],function(){
            if (Api.online) {
                Api.propertyChangedLevel(board.currentCard, board.currentCard.level + 1, true);
                return;
            }

            board.currentCard.level++;
            board.currentCard.owner.money -= board.currentCard.piece.housePrice;
            if(board.settings.allFreeparking){
                board.boardPieces[20].money += board.currentCard.piece.housePrice;
            }
            players[turn].playerBorder.startMoneyAnimation(-board.currentCard.piece.housePrice)
        },40,40);
            this.downgradeButton = new Button([false,false],25,580,images.buttons.sprites[5],function(){
            if (Api.online) {
                Api.propertyChangedLevel(board.currentCard, board.currentCard.level - 1, false);
                return;
            }
            board.currentCard.level--;
            board.currentCard.owner.money += board.currentCard.piece.housePrice/2;
            players[turn].playerBorder.startMoneyAnimation(board.currentCard.piece.housePrice/2)
            players[turn].checkDebt(board.boardPieces[20]);
        },40,40);
        this.buyButton = new Button([false,false],25,580,images.buttons.sprites[6],function(){
            if (Api.online) {
                Api.tilePurchased(board.currentCard);
                return;
            }
            players[turn].money -= board.currentCard.piece.price;
            if(board.settings.allFreeparking){
                board.boardPieces[20].money += board.currentCard.piece.price;
            }
            players[turn].playerBorder.startMoneyAnimation(-board.currentCard.piece.price);
            board.currentCard.owner = players[turn];
            players[turn].ownedPlaces.push(board.currentCard);
            board.currentCard = undefined;
            board.getToMainMenuButton.visible = true;
            board.buyButton.visible = false;
            board.auctionButton.visible = false;
        },97,40);

        this.auctionButton = new Button([false,false],25 + 117,580,images.buttons.sprites[8],function(){
            if (Api.online) {
                Api.auctionShow(board.currentCard);
                return;
            }
            board.auction = new Auction(board.currentCard)
            board.currentCard = undefined;
            board.getToMainMenuButton.visible = true;
            board.buyButton.visible = false;
            board.auctionButton.visible = false;
        },97,40);

            for(let n = 0; n < 40; n++){
                if(n%10 === 0){
                    this.boardPieces.push(new BoardPiece(n,images.corner.sprites))
                }else{
                    this.boardPieces.push(new BoardPiece(n,images.part.sprites))
                }
        }

        this.update = function () {
                let fontsize = (1/this.textsize.width)*65000 > 50 ? 50 : (1/this.textsize.width)*65000
                c.fillStyle = "white";
                c.font = fontsize*scale+"px Arcade";
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
                c.fillStyle = "black"
                c.font = 80*scale+"px Arcade"
                c.textAlign = "center"
                c.fillText("Grattis " + players[0].name + "! Du vann!",1000*scale,600*scale)
            }
            players.forEach(e => e.playerBorder.drawButton())

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
            this.getToMainMenuButton.draw();
            if(this.getToMainMenuButton.selected){
                this.confirmMenu();
            }
            if(this.currentShowingCard !== undefined){
                this.currentShowingCard.draw();
            }
        }  

        this.confirmMenu = function(){
            this.getToMainMenuButton.visible = false;
            c.fillRect(722*scale,336*scale,512*scale,448*scale)
            drawRotatedImageFromSpriteSheet(722,336,512,448,images.exitMenu.sprites[0],0,false,0,0,256,224)  

            this.goToMainMenuButton.visible = true;
            this.goToMainMenuButton.draw();
            this.escapeConfirm.visible = true;
            this.escapeConfirm.draw();
            this.musicButton.visible = true;
            this.fullScreenButton.visible = true;
            this.fullScreenButton.selected = document.fullscreenElement != null;
            this.musicButton.draw();
            this.fullScreenButton.draw();
        }
        this.randomizeDice = function () {
            this.dice1Type = randomIntFromRange(0,3);
            this.dice2Type = randomIntFromRange(0,3);
        }
        this.showCard = function (){
            if(this.currentCard !== undefined){
                drawRotatedImageFromSpriteSheet(722,236,images.card.sprites[this.currentCard.piece.card].frame.w*drawScale,images.card.sprites[this.currentCard.piece.card].frame.h*drawScale,images.card.sprites[this.currentCard.piece.card],0,false,0,0,images.card.sprites[this.currentCard.piece.card].frame.w,images.card.sprites[this.currentCard.piece.card].frame.h)

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

                    if (players[Api.online ? Api.currentPlayer : turn].bot === undefined) this.cardCloseButton.visible = true;
                    if(this.currentCard.owner === players[Api.online ? Api.currentPlayer : turn] && players[Api.online ? Api.currentPlayer : turn].bot === undefined){
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
                        if(this.currentCard.mortgaged === true && players[turn].money <= ((this.currentCard.piece.price/2)*1.1) || highest > 0 || !this.settings.mortgage){
                            this.mortgageButton.disabled = true;
                        }else{
                            this.mortgageButton.disabled = false;
                        }
                        
                    }
                    this.cardCloseButton.visible = true;


                }else{
                    this.cardCloseButton.visible = true;

                    if(this.currentCard === board.boardPieces[players[Api.online ? Api.currentPlayer : turn].steps] && this.auction === undefined && players[Api.online ? Api.currentPlayer : turn].bot === undefined){
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
                    drawRotatedImageFromSpriteSheet(722,236,images.mortgageOverlay.sprites[0].frame.w*drawScale,images.mortgageOverlay.sprites[0].frame.h*drawScale,images.mortgageOverlay.sprites[0],0,false,0,0,images.mortgageOverlay.sprites[0].frame.w,images.mortgageOverlay.sprites[0].frame.h)
                }
            }else{
                this.cardCloseButton.visible = false;
            }
            
        }
        this.showJailmenu = function(){
            drawIsometricImage(0,0,images.jailMenu.sprites[0],false,0,0,300,90,-90,198)

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
            if(players[turn].animationOffset !== 0 || this.showDices === true || this.animateDices === true){
                drawIsometricImage(500,500,images.dice.sprites[0],false,this.dice1Type*64,(this.dice1-1)*64,64,64,0,0)
                drawIsometricImage(550,400,images.dice.sprites[0],false,this.dice2Type*64,(this.dice2-1)*64,64,64,0,0)
                this.nextPlayerButton.visible = false;
                this.rollDiceButton.visible = false;
            }else{
                if (Api.online) {
                    if (players[turn].colorIndex != Api.currentPlayer) {
                        return;
                    }
                }

                if(players[turn].rolls === false){
                    if(players[turn].bot === undefined && this.auction === undefined && players[turn].inJail === false && !this.getToMainMenuButton.selected && this.currentShowingCard === undefined){
                        this.rollDiceButton.visible = true;
                        this.nextPlayerButton.visible = false;
                    }else{
                        this.rollDiceButton.visible = false;
                        this.nextPlayerButton.visible = false;
                    }
                }else{
                    if(players[turn].bot === undefined && this.auction === undefined && !this.getToMainMenuButton.selected && this.currentShowingCard === undefined){
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
    constructor(x,y,w,h,from,to,steps,showtext,font,unit,beginningText,onChange,onrelease){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.visible = false;
        this.disabled = false;
        this.min = from;
        this.max = to;
        this.percentage = 0;
        this.value = 0;
        this.follow = false;
        this.showtext = showtext;
        this.font = font;
        this.unit = unit;
        this.steps = steps;
        this.beginningText = beginningText;
        this.from = from;
        this.to = to;
        this.last = this.value;
        if(onChange === undefined){
            this.onChange = function(){}
        }else{
            this.onChange = onChange;
        }
        if(onrelease === undefined){
            this.onrelease = function(){}
        }else{
            this.onrelease = onrelease;
        }
        buttons.push(this);
        this.draw = function(){
            if (this.disabled) this.hover = false;
            if (!this.visible) return;
            
            if(this.visible){
                this.value = Math.round((((this.to-this.from)*this.percentage) + this.from)/this.steps)*this.steps;

                if(this.value !== this.last){
                    this.last = this.value;
                    playSound(sounds.clicks,0.1,false)
                    this.onChange();
                }
                if(this.value > this.to){
                    this.value = this.to;
                }
                if(this.value < this.from){
                    this.value = this.from;
                }
                c.fillStyle = "black";
                c.fillRect(this.x*scale,this.y*scale,this.w*scale,this.h*scale)
                c.fillStyle = "white";
                c.fillRect(this.x*scale + 4*scale,this.y*scale + 4*scale,this.w*scale-8*scale,this.h*scale-8*scale)
                c.fillStyle = "black";
                if(this.showtext){
                c.font = this.font*scale + "px Arcade";
                c.textAlign = "center";
                    c.fillText(this.beginningText + this.value+this.unit,this.x*scale+ + this.w/2*scale,this.y*scale + this.h/1.5*scale)
                }
                c.fillRect(this.x*scale + (this.percentage*(this.w-8))*scale,this.y*scale,10*scale,this.h*scale)
            }
            if(detectCollition(this.x*scale,this.y*scale,this.w*scale,this.h*scale,mouse.x,mouse.y,1,1)){
                this.hover = true;
            }else{
                this.hover = false;
            }
            if(this.follow === true){
                this.percentage = (mouse.x-(this.x*scale))/(this.w*scale-4*scale);
            }
            if(this.percentage <= 0){
                this.percentage = 0;
            }
            if(this.percentage >= 1){
                this.percentage = 1;
            }
        }
        this.click = function(){
            if (this.disabled) return;

            if(this.hover === true){
                this.follow = true;
            }
        }
        this.release = function(){
            if (this.disabled) return;
            if(this.follow === true){
                this.percentage = (mouse.x-(this.x*scale))/(this.w*scale-4*scale);
                this.value = Math.round((((this.to-this.from)*this.percentage) + this.from)/this.steps)*this.steps;
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

class Trade{
    constructor(p1,p2){
        this.p1 = p1;
        this.p2 = p2;
        timeouts.push(setTimeout(() => {
            players.forEach(e => {e.playerBorder.button.selected = false;e.playerBorder.button.disabled = true})
        }, 1));

        this.contents = {
            // This is what each player offers
            // Currently only used in the online version
            p1: { money: 0, tiles: [] },
            p2: { money: 0, tiles: [] }
        };

        let self = this;
        this.closeButton = new Button([false,false],364 + 128 +71,290-50,images.buttons.sprites[7],function(){if (Api.online) { Api.tradeConcluded(self.p2.colorIndex, false); } self.closeButton.visible = false;board.trade = undefined;board.getToMainMenuButton.visible = true; players.forEach(e => {e.playerBorder.button.disabled = false})},18,18,false,
        false,false,false,false,{x:66,y:70,w:1025+512+280,h:1020})
        this.closeButton.visible = true;

        this.p1Slider = new Slider(300-142,220,742,60,0,this.p1.money,10,true,30,"kr","")
        this.p1ConfirmButton = new Button([true,false],-70 -64-35,680,images.trade.sprites[1],function(){
            if (Api.online && self.p1.colorIndex == Api.currentPlayer) {
                if (self.p2ConfirmButton.selected) {
                    Api.tradeConcluded(self.p2.colorIndex, true, self.contents);
                } else {
                    Api.tradeAcceptUpdate(self.p2.colorIndex, self.p1ConfirmButton.selected);
                }
            }
        },150,50)
        if(this.p1.bot !== undefined){
            this.p1ConfirmButton.disabled = true;
            this.p1Slider.disabled = true;
        }
        this.p1ConfirmButton.visible = true;

        if (Api.online && this.p1.colorIndex != Api.currentPlayer) {
            this.p2ConfirmButton.disabled = true;
            this.p1Slider.disabled = true;
        }

        this.p2ConfirmButton = new Button([true,false],180 +64+35,680,images.trade.sprites[1],function(){},150,50)
        this.p2Slider = new Slider(1050,220,742,60,0,this.p2.money,10,true,30,"kr","")
        if(this.p2.bot !== undefined){
            this.p2ConfirmButton.disabled = true;
            this.p2Slider.disabled = true;
        }
        this.p2ConfirmButton.visible = true;

        if (Api.online && this.p2.colorIndex != Api.currentPlayer) {
            this.p2ConfirmButton.disabled = true;
            this.p2Slider.disabled = true;
        }

        this.p1PropertyButtons = [];
        this.p2PropertyButtons = [];

        this.p1.ownedPlaces.forEach(function(e,i){
            let tmp = 0;
            if(i%2 === 1){
                tmp = 190
            }
            let textColor = e.piece.color;
            let text = e.piece.name + " " + e.piece.price + "kr"
            let fontSize = 21
            if(e.mortgaged){
                textColor = "black"
                text = e.piece.name + "(Intecknad)"
                if(e.piece.name === "Vattenledningsverket"){
                    fontSize = 18;
                }
            }
            let but = (new Button([true,false],-360 + tmp + 198 - 128+10,240 + 22*Math.floor(i/2) + 110,images.trade.sprites[2],function(){
                if (Api.online) {
                    if (this.selected) {
                        self.contents.p1.tiles.push(e.piece);
                    } else {
                        self.contents.p1.tiles.splice(self.contents.p1.tiles.findIndex(x => x.card == e.piece.card), 1);
                    }
                    Api.tradeContentUpdated(self.p2.colorIndex, self.contents.p1);
                }
            },186,21,false,false,false,false,false,false,text,fontSize,textColor,"ArcadeBold"))

            if(self.p1.bot !== undefined){
                but.disabled = true;
            }
            if(e.level !== 0){
                but.disabled = true;
            }

            but.card = e.piece.card;
            self.p1PropertyButtons.push(but);
        });
        
        this.p2.ownedPlaces.forEach(function(e,i){
            let tmp = 0;
            if(i%2 === 1){
                tmp = 190
            }
            let textColor = e.piece.color;
            let text = e.piece.name + " " + e.piece.price + "kr"
            let fontSize = 21;
            if(e.mortgaged){
                textColor = "black"
                text = e.piece.name + "(Intecknad)"
                if(e.piece.name === "Vattenledningsverket"){
                    fontSize = 18;
                }
            }
            let but = (new Button([true,false],-30 + tmp + 200,240 + 22*Math.floor(i/2) + 110,images.trade.sprites[2],function(){},186,21,false,false,false,false,false,false,text,fontSize,textColor,"ArcadeBold"))

            if(self.p2.bot !== undefined || (Api.online && self.p2.colorIndex != Api.currentPlayer)){
                but.disabled = true;
            }
            if(e.level !== 0){
                but.disabled = true;
            }

            but.card = e.piece.card;
            self.p2PropertyButtons.push(but);
        });

        this.update = function(){
            drawIsometricImage(0,0,images.trade.sprites[0],false,0,0,images.trade.sprites[0].frame.w,images.trade.sprites[0].frame.h,-320-71,images.trade.sprites[0].frame.h/50 - 50,1)
            this.closeButton.draw();
            this.p1ConfirmButton.draw();
            this.p2ConfirmButton.draw();
            
            this.p1Slider.visible = true;
            this.p1Slider.draw();
            this.p2Slider.visible = true;
            this.p2Slider.draw();
            c.font = 50*scale+"px Arcade";
            c.fillStyle = "black"
            c.textAlign = "right"
            c.fillText(this.p1.money + "kr" + "   " +this.p1.name,880*scale,180*scale)
            c.textAlign = "left"
            c.fillText(this.p2.name+ "   " +this.p2.money + "kr",1070*scale,180*scale)
            this.p1PropertyButtons.forEach(e => {e.visible=true;e.draw()});
            this.p2PropertyButtons.forEach(e => {e.visible=true;e.draw()});

            if(this.p1ConfirmButton.selected && this.p2ConfirmButton.selected && !Api.online){
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
                this.p1PropertyButtons.forEach(e => {e.visible=false});
                this.p2PropertyButtons.forEach(e => {e.visible=false});
                players.forEach(e => {e.playerBorder.button.selected = false;e.playerBorder.button.disabled = false})
                board.trade = undefined;
                board.getToMainMenuButton.visible = true; 
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
        let textsize = measureText({font:"Arcade",text:this.player.name})

        
        this.button = new Button([true,false],this.x,this.y,images.playerOverlay.sprites[8],function(){            
            players.forEach(e =>{if(e.playerBorder != self){e.playerBorder.button.selected = false;e.playerBorder.createTradebutton.visible = false;}})
            self.createTradebutton.visible = false;
            if (Api.online) {
                if (Api.currentPlayer != players[turn].colorIndex) {
                    self.createTradebutton.visible = false;
                } else if (Api.currentPlayer == self.player.colorIndex) {
                    self.createTradebutton.visible = false;
                } else {
                    self.createTradebutton.visible = true;
                }
            }
            players.forEach( e => e.playerBorder.button.disabled = false)

        },354,54,false,false,false,true,false,{x:0,y:0,w:249,h:54,onlySelected:true}) 

        this.createTradebutton = new Button([false,false],this.x,this.y,images.buttons.sprites[9],function(){
            self.createTradebutton.visible = false;
            self.showInfo = false;
            if (Api.online && board.trade == undefined) {
                Api.requestTrade(self.player.colorIndex);
            }
            board.trade = new Trade(players[turn],self.player); 
            board.getToMainMenuButton.visible = false; 
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
                c.textAlign = "right"
                c.font = (50)*scale+"px Arcade";
                c.fillText(Math.abs(Math.floor(this.latestTrancaction)) + "kr",this.x*drawScale*scale+1350*scale,this.y*drawScale*scale-335*scale - (-this.moneyTime+1)*20*scale)
                c.globalAlpha = 1;
            }else{
                c.globalAlpha = this.moneyTime;
                c.textAlign = "right"
                c.font = (50)*scale+"px Arcade";
                c.fillText(Math.abs(Math.floor(this.latestTrancaction)) + "kr",this.x*scale+1050*scale,this.y*drawScale*scale-335*scale- (-this.moneyTime+1)*20*scale)
                c.globalAlpha = 1;
            }
        }

        this.init = function(){
            // What does this function even do?
            if(players.length === 5) {
                if (this.realIndex === 4){
                    this.index = 3;
                } else if(this.realIndex === 2){
                    this.index = 4;
                } else if(this.realIndex === 3){
                    this.index = 2;
                }
            } else if (players.length == 6) {
                if(this.realIndex === 4){
                    this.index = 2;
                } else if(this.realIndex === 2){
                    this.index = 4;
                } else if(this.realIndex === 3){
                    this.index = 6;
                } else if(this.realIndex === 5){
                    this.index = 3;
                }
            } else if (players.length == 7) {
                if(this.realIndex === 4){
                    this.index = 5;
                } else if(this.realIndex === 2){
                    this.index = 4;
                } else if(this.realIndex === 3){
                    this.index = 6;
                } else if(this.realIndex === 5){
                    this.index = 3;
                } else if(this.realIndex === 6){
                    this.index = 2;
                }
            } else if (players.length == 8) {
                if(this.realIndex === 4){
                    this.index = 5;
                } else if(this.realIndex === 2){
                    this.index = 4;
                } else if(this.realIndex === 3){
                    this.index = 6;
                } else if(this.realIndex === 5){
                    this.index = 7;
                } else if(this.realIndex === 6){
                    this.index = 2;
                } else if(this.realIndex === 7){
                    this.index = 3;
                }
            }
        }
        this.drawButton = function(){
            this.button.visible = true;
            this.button.draw()
            if(this.button.mirror === false){
                drawRotatedImageFromSpriteSheet(this.x*drawScale+466 + 694+209,this.y*drawScale+5 - 400,48,96,images.player.sprites[this.player.colorIndex],0,false,0,0,24,48,false)
                let fontsize = (1/textsize.width)*40000 > 50 ? 50 : (1/textsize.width)*40000
                c.font = fontsize*scale + "px Arcade";
                c.fillStyle ="black"
                c.textAlign = "left"
                c.fillText(this.player.name,this.x*drawScale*scale+750*scale,this.y*drawScale*scale-335*scale)
                c.textAlign = "right"
                c.font = (50)*scale+"px Arcade";
                if(this.moneyTime <= 0){
                    c.fillText(this.player.money + "kr",this.x*drawScale*scale+1350*scale,this.y*drawScale*scale-335*scale)
                }
            }else{
                drawRotatedImageFromSpriteSheet(this.x*drawScale +723,this.y*drawScale -396,48,96,images.player.sprites[this.player.colorIndex],0,false,0,0,24,48,false)
                let fontsize = (1/textsize.width)*40000 > 50 ? 50 : (1/textsize.width)*40000
                c.font = fontsize*scale + "px Arcade";

                c.fillStyle ="black"
                c.textAlign = "left"
                c.fillText(this.player.name,this.x*scale+420*scale,this.y*drawScale*scale-335*scale)
                c.textAlign = "right"
                c.font = (50)*scale+"px Arcade";
                if(this.moneyTime <= 0){
                    c.fillText(this.player.money + "kr",this.x*scale+1030*scale,this.y*drawScale*scale-335*scale)
                }

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
                this.x = 374-124
                this.y = 200;
                this.button.mirror = false;
            }
            if(this.index === 2){
                this.x = -358
                this.y = 700-14;
                this.button.mirror = true;
            }
            if(this.index === 3){
                this.x = 374-124
                this.y = 700-14;
                this.button.mirror = false;
            }
            if(this.index === 4){
                this.x = -358
                this.y = 200 + 54;
                this.button.mirror = true;
            }
            if(this.index === 5){
                this.x = 374-124
                this.y = 200 +54;
                this.button.mirror = false;
            }
            if(this.index === 6){
                this.x = -358
                this.y = 700 -54-14;
                this.button.mirror = true;
            }
            if(this.index === 7){
                this.x = 374-124
                this.y = 700 -54-14;
                this.button.mirror = false;
            }
            this.button.y = this.y
            this.button.x = this.x
            
            

            
            
            let mirrorAdder = -10;
            if(!this.button.mirror){
                mirrorAdder = 300;
            }
            let mirrorAdder2 = 0;
            if(!this.button.mirror){
                mirrorAdder2 = 0;
            }
            this.createTradebutton.x = this.x + 60

            
            if(this.button.selected){
                players.forEach( e => e.playerBorder.button.disabled = true)
                this.button.disabled = false;
                if(this.index === 0 || this.index === 1 || this.index === 4 || this.index === 5){
                    this.button.invertedHitbox.x = this.x*drawScale +715
                    this.button.invertedHitbox.y = this.y*drawScale - 400 + 54*drawScale;
                    this.button.invertedHitbox.w = this.button.w*drawScale
                    this.button.invertedHitbox.h = this.player.ownedPlaces.length*12*drawScale + 12*5*drawScale;
                    this.createTradebutton.y = this.y + 73 + 12*this.player.ownedPlaces.length;
                    drawRotatedImageFromSpriteSheet(this.x*drawScale+715+mirrorAdder2,this.y*drawScale + 54*drawScale -400,354*drawScale,27*drawScale,images.playerOverlay.sprites[11],0,this.button.mirror,0,0,354,27,false)
                    for(let i = 0; i < this.player.ownedPlaces.length; i++){
                        drawRotatedImageFromSpriteSheet(this.x*drawScale+715+mirrorAdder2,this.y*drawScale + 67 *drawScale + 12*drawScale*i + 27 - 400,354*drawScale,15*drawScale,images.playerOverlay.sprites[10],0,this.button.mirror,0,0,354,15,false)
                        c.font = 24*scale+"px Arcade";
                        c.fillStyle ="black"
                        c.textAlign = "left"
                        if(this.player.ownedPlaces[i].piece.type !== "station" && this.player.ownedPlaces[i].piece.type !== "utility"){
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + this.player.ownedPlaces[i].piece.rent[this.player.ownedPlaces[i].level] + "kr",this.x*scale+400*scale+ mirrorAdder*drawScale*scale,this.y*drawScale*scale + 65*drawScale*scale + 12*drawScale*i*scale - 364*scale)
                        }else if(this.player.ownedPlaces[i].piece.type === "station"){
                            let tmp = -1;
                            this.player.ownedPlaces.forEach(e => {
                                if(e.piece.type === "station"){
                                    tmp++;
                                }
                            })
                            
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + 25 * Math.pow(2,tmp) + "kr",this.x*scale+400*scale+ mirrorAdder*drawScale*scale,this.y*drawScale*scale + 65*drawScale*scale + 12*drawScale*i*scale - 364*scale)
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
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + multiply + "*slag kr",this.x*scale+400*scale+ mirrorAdder*drawScale*scale,this.y*drawScale*scale + 65*drawScale*scale + 12*drawScale*i*scale - 364*scale)
                        }
                    }
                    drawRotatedImageFromSpriteSheet(this.x*drawScale +715+mirrorAdder2,this.y*drawScale + 80*drawScale +12*drawScale*this.player.ownedPlaces.length -400,354*drawScale ,13*drawScale,images.playerOverlay.sprites[10],0,this.button.mirror,0,0,354,13,false)
                    drawRotatedImageFromSpriteSheet(this.x*drawScale +715+mirrorAdder2,this.y*drawScale + 80*drawScale +12*drawScale*(this.player.ownedPlaces.length+1) -400,354*drawScale ,13*drawScale,images.playerOverlay.sprites[10],0,this.button.mirror,0,0,354,13,false)
                    drawRotatedImageFromSpriteSheet(this.x*drawScale +715+mirrorAdder2,this.y*drawScale + 80*drawScale +12*drawScale*(this.player.ownedPlaces.length+2) -400,354*drawScale ,20*drawScale,images.playerOverlay.sprites[9],0,this.button.mirror,0,0,354,27,false)
                    if (!Api.online) {
                        if(players[turn] !== this.player && board.currentCard === undefined && board.trade === undefined && players[turn].bot === undefined && players[turn].animationOffset === 0 && board.animateDices === false && board.showDices === false){
                            this.createTradebutton.visible = true;
                        }else{
                            this.createTradebutton.visible = false;
                        }
                    }

                    this.createTradebutton.draw();
                }else{
                    this.button.invertedHitbox.x = this.x*drawScale +715
                    this.button.invertedHitbox.y = this.y*drawScale - 400-this.player.ownedPlaces.length*12*drawScale - 12*5*drawScale;
                    this.button.invertedHitbox.w = this.button.w*drawScale
                    this.button.invertedHitbox.h = this.player.ownedPlaces.length*12*drawScale + 12*5*drawScale;
                    drawRotatedImageFromSpriteSheet(this.x*drawScale +715+mirrorAdder2,this.y*drawScale - 27*drawScale -400,354*drawScale,27*drawScale,images.playerOverlay.sprites[11],180,!this.button.mirror,0,0,354,27,false)
                    for(let i = 0; i < this.player.ownedPlaces.length; i++){
                        drawRotatedImageFromSpriteSheet(this.x*drawScale +715+mirrorAdder2,this.y*drawScale - 57 *drawScale - 12*drawScale*i + 27+10 -400,354*drawScale,13*drawScale,images.playerOverlay.sprites[10],180,!this.button.mirror,0,0,354,13,false)
                        c.font = 25*scale+"px Arcade";
                        c.fillStyle ="black"
                        c.textAlign = "left"
                        if(this.player.ownedPlaces[i].piece.type !== "station" && this.player.ownedPlaces[i].piece.type !== "utility"){
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + this.player.ownedPlaces[i].piece.rent[this.player.ownedPlaces[i].level] + "kr",this.x*scale+400*scale+ mirrorAdder*drawScale*scale,this.y*drawScale*scale + 110*drawScale*scale - 12*drawScale*i*scale - 634*scale)
                        }else if(this.player.ownedPlaces[i].piece.type === "station"){
                            let tmp = -1;
                            this.player.ownedPlaces.forEach(e => {
                                if(e.piece.type === "station"){
                                    tmp++;
                                }
                            })
                            
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + 25 * Math.pow(2,tmp) + "kr",this.x*scale+400*scale+ mirrorAdder*drawScale*scale,this.y*drawScale*scale + 110*drawScale*scale - 12*drawScale*i*scale - 634*scale)
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
                            c.fillText(this.player.ownedPlaces[i].piece.name + "  " + multiply + "*slag kr",this.x*scale+400*scale+ mirrorAdder*drawScale*scale,this.y*drawScale*scale + 110*drawScale*scale - 12*drawScale*i*scale - 634*scale)
                        }                    
                    }
                    drawRotatedImageFromSpriteSheet(this.x*drawScale +715,this.y*drawScale - 25*drawScale*1.5 -12*drawScale*this.player.ownedPlaces.length -400,354*drawScale ,13*drawScale,images.playerOverlay.sprites[10],0,this.button.mirror,0,0,354,13,false)
                    drawRotatedImageFromSpriteSheet(this.x*drawScale +715,this.y*drawScale - 25*drawScale*1.5 -12*drawScale*(this.player.ownedPlaces.length+1) -400,354*drawScale ,13*drawScale,images.playerOverlay.sprites[10],0,this.button.mirror,0,0,354,13,false)
                    drawRotatedImageFromSpriteSheet(this.x*drawScale +715,this.y*drawScale - 25*drawScale*1.5 -12*drawScale*(this.player.ownedPlaces.length+3) -400,354*drawScale ,27*drawScale,images.playerOverlay.sprites[9],180,!this.button.mirror,0,0,354,27,false)
                    this.createTradebutton.y = this.y - 50 - 12*this.player.ownedPlaces.length;
                    if(players[turn] !== this.player && board.currentCard === undefined && board.trade === undefined && players[turn].bot === undefined && players[turn].animationOffset === 0 && board.animateDices === false && board.showDices === false){
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
    constructor(card) {
        this.card = card;
        this.turn = turn;
        this.auctionMoney = 0;
        this.time = 472;
        this.started = false;
        this.timer = undefined;
        this.playerlist = [...players];


        this.addMoneyButton2 = new Button([false,false],-80,540,images.auction.sprites[1],function(){     
            board.auction.addMoney(2);
        },54,54,false)
        this.addMoneyButton10 = new Button([false,false],10,540,images.auction.sprites[2],function(){
            board.auction.addMoney(10);
        },54,54,false)
        this.addMoneyButton100 = new Button([false,false],100,540,images.auction.sprites[3],function(){
            board.auction.addMoney(100);
        },54,54,false)
        this.startAuctionButton = new Button([false,false],-85,540,images.auction.sprites[5],function(){
            if (Api.online) {
                Api.auctionStart(board.auction.card);
                return;
            }
            board.auction.started = true;
            board.auction.duration = 10 * speeds.auctionSpeed;
            board.auction.startTime = performance.now();
            board.auction.timer = intervals.push(setInterval(function(){
                board.auction.time = 472 * (1 - (performance.now() - board.auction.startTime) / board.auction.duration);
            },10));
        },240,40,false)
        
        this.draw = function(){
            drawIsometricImage(0,0,images.card.sprites[card.piece.card],false,0,0,images.card.sprites[this.card.piece.card].frame.w,images.card.sprites[this.card.piece.card].frame.h,images.card.sprites[this.card.piece.card].frame.w/3,images.card.sprites[this.card.piece.card].frame.h/7.5,1)
            drawIsometricImage(0,0,images.auction.sprites[0],false,0,0,images.auction.sprites[0].frame.w,images.card.sprites[this.card.piece.card].frame.h,-images.card.sprites[this.card.piece.card].frame.w/1.5,images.card.sprites[this.card.piece.card].frame.h/7.5,1)
            c.fillStyle = "black";
            c.font = 80*scale+"px Arcade";
            c.textAlign = "center";
            c.fillText(this.auctionMoney + "kr", 790*scale, 450*scale);
            c.font = 80*scale+"px Arcade";
            c.fillText(this.playerlist[this.turn].name, 790*scale, 550*scale);

            if(this.started){
                if ((!Api.online && this.playerlist[this.turn].bot === undefined) || (Api.online && Api.currentPlayer == this.playerlist[this.turn].colorIndex)) {
                    this.startAuctionButton.visible = false;

                    this.addMoneyButton2.visible = true;
                    this.addMoneyButton10.visible = true;
                    this.addMoneyButton100.visible = true;

                    this.addMoneyButton2.draw();
                    this.addMoneyButton10.draw();
                    this.addMoneyButton100.draw();
                }else{
                    this.startAuctionButton.visible = false;
                    this.addMoneyButton2.visible = false;
                    this.addMoneyButton10.visible = false;
                    this.addMoneyButton100.visible = false;
                }
                
                drawIsometricImage(0,0,images.auction.sprites[4],false,0,30,240,30,-150,220,1)
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
                    if (Api.online && this.playerlist[this.turn].colorIndex == Api.currentPlayer) Api.auctionBid(this.card, -1, true);
                    
                    this.playerlist.splice(this.playerlist.indexOf(this.playerlist[this.turn]),1)
                    this.turn = (this.turn)%this.playerlist.length;
                    this.time = 472;
                    this.startTime = performance.now();
                    if(this.playerlist.length === 1){
                        for(let i = 0; i<players.length; i++){
                            if(this.playerlist[0].colorIndex == players[i].colorIndex){
                                intervals.forEach(e => clearInterval(e));
                                clearInterval(this.timer)
                                if(this.auctionMoney !== 0){
                                    players[i].money -= this.auctionMoney;
                                    if(board.settings.allFreeparking){
                                        board.boardPieces[20].money += this.auctionMoney;
                                    }
                                    players[i].playerBorder.startMoneyAnimation(-this.auctionMoney)
                                    board.auction.card.owner = players[i];
                                    players[i].ownedPlaces.push(this.card);
                                }
                                    buttons.splice(buttons.indexOf(this.addMoneyButton2),1)
                                    buttons.splice(buttons.indexOf(this.addMoneyButton10),1)
                                    buttons.splice(buttons.indexOf(this.addMoneyButton100),1)
                                    buttons.splice(buttons.indexOf(this.startAuctionButton),1)
                                    board.currentCard = undefined;
                                    board.getToMainMenuButton.visible = true;
                                    board.buyButton.visible = false;
                                    board.auction = undefined;
                            }
                        }
                        
                    }
                }
            }else{
                if (Api.online) {
                    this.startAuctionButton.visible = Api.currentPlayer == players[turn].colorIndex;
                    this.startAuctionButton.draw();
                } else {
                    if(this.playerlist[this.turn].bot === undefined){
                        this.startAuctionButton.visible = true;
                        this.startAuctionButton.draw();
                    }else{
                        this.startAuctionButton.visible = false;
                    }
                }

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

            if (this.addMoneyButton2.disabled) this.time = -10;
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
            this.startTime = performance.now();
        }
    }
}

class Button{
    constructor(select,x,y,img,onClick,w,h,showBorder,mirror,screencenter,disableselectTexture,disablesound,invertedHitbox,text,font,textcolor,textFont){
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
        this.invertedHitbox = invertedHitbox;
        this.textFont = textFont;
        if(textcolor == undefined){
            this.textcolor = "black"
        }    
        if(mirror === true){
            this.mirror = true;
        }
        if(screencenter === true){
            this.screencenter = true;
        }
        if(textFont == undefined){
            this.textFont = "Arcade"
        }    

        this.showBorder = showBorder;
        if(buttons.includes(this)){

        }else{
            buttons.push(this);
        }

        
        this.draw = function(){
            if (!this.visible) return;

            if(this.visible && this.img !== undefined){
                if(!this.disabled && this.selected === false){
                    if(detectCollition(this.x*drawScale*scale+715*scale,this.y*drawScale*scale-400*scale,this.w*drawScale*scale,this.h*drawScale*scale,mouse.x,mouse.y,1,1)){
                        if(this.img.frame.w > this.w){
                            drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w,0,this.w,this.h)
                        }else{
                            drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,0,0,this.w,this.h)
                        }
                        this.hover = true;
                    }else{
                        this.hover = false;
                        drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,0,0,this.w,this.h)
                    }    
                }else{
                    if(this.disabled){
                        this.hover = false;
                        if(this.select[0] === false){
                            drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w*2,0,this.w,this.h)
                        }else{
                            if(this.img.frame.w > this.w*2){
                                if(this.selected){
                                    drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w*3,0,this.w,this.h)
                                }else{
                                    drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w*1,0,this.w,this.h)
                                }
                            }else{
                                drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,0,0,this.w,this.h)
                            }
                        }
                    }else{
                        if(detectCollition(this.x*drawScale*scale+715*scale,this.y*drawScale*scale-400*scale,this.w*drawScale*scale,this.h*drawScale*scale,mouse.x,mouse.y,1,1)){

                            if(this.img.frame.w <= this.w*3){
                                if(this.disableselectTexture){
                                    drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w*1,0,this.w,this.h)
                                }else if(!this.select[1]){
                                    drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w*1,0,this.w,this.h)
                                }else{
                                    drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w*2,0,this.w,this.h)
                                }
                            }else{
                                
                                drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w*3,0,this.w,this.h)
                            }
                            this.hover = true;
                        }else{
                            this.hover = false;
                                if(this.disableselectTexture){
                                    drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w,0,this.w,this.h)
                                }else{
                                    drawRotatedImageFromSpriteSheet(this.x*drawScale+715,this.y*drawScale-400,this.w*drawScale,this.h*drawScale,this.img,0,this.mirror,this.w*2,0,this.w,this.h)
                                }
                            
                        }
                    }
                    
                }
                if(this.text !== undefined){
                    c.font = this.font*scale + "px " + this.textFont;
                    c.fillStyle = this.textcolor
                    c.textAlign = "center"
                    c.fillText(this.text,this.x*drawScale*scale + 715*scale + this.w*scale,this.y*drawScale*scale -400*scale + this.h*scale/2 + this.font*scale/2 + this.h*scale/2.5)
                }
                
            }else if(this.visible){
                if(detectCollition(this.x*drawScale*scale+715*scale,this.y*drawScale*scale-400*scale,this.w*drawScale*scale,this.h*drawScale*scale,mouse.x,mouse.y,1,1)){
                    this.hover = true;
                }else{
                    this.hover = false;
                }
            }
            if(showBorder){
                c.strokeStyle = "black";
                c.strokeRect(this.x*drawScale*scale+715*scale,this.y*drawScale*scale-400*scale,this.w*drawScale*scale,this.h*drawScale*scale)
                if(this.invertedHitbox !== undefined){
                    c.strokeRect(this.invertedHitbox.x*scale,this.invertedHitbox.y*scale,this.invertedHitbox.w*scale,this.invertedHitbox.h*scale)
                }
            }
            
        }
        this.click = function(){
            if (this.disabled || !this.visible) return;
            if(detectCollition(this.x*drawScale*scale+715*scale,this.y*drawScale*scale-400*scale,this.w*drawScale*scale,this.h*drawScale*scale,mouse.x,mouse.y,1,1)||
            this.invertedHitbox !== undefined && this.invertedHitbox !== false && this.invertedHitbox.onlySelected === undefined && !detectCollition(this.invertedHitbox.x*scale,this.invertedHitbox.y*scale,this.invertedHitbox.w*scale,this.invertedHitbox.h*scale,mouse.x,mouse.y,1,1) ||
            this.invertedHitbox !== undefined && this.invertedHitbox !== false && this.invertedHitbox.onlySelected === true && this.selected && !detectCollition(this.invertedHitbox.x*scale,this.invertedHitbox.y*scale,this.invertedHitbox.w*scale,this.invertedHitbox.h*scale,mouse.x,mouse.y,1,1)){
                if(this.select[0] === true){
                    if(this.selected){
                        this.selected = false;
                    }else{
                        this.selected = true;
                    }
                }

                this.onClick();
                
                this.hover = false;
                if(!this.disablesound){
                    playSound(sounds.release,1)
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
        this.currentOffsetvalue = 0;
        this.visible = true;
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

            let mouseSquareX = (to_grid_coordinate(mouse.x,mouse.y).x - 1210*scale)  /(64*scale)
            let mouseSquareY = (to_grid_coordinate(mouse.x,mouse.y).y + 740*scale)/(64*scale)
            if(board.currentCard !== undefined|| this.piece.type === "chance" || this.piece.type === "community Chest" || this.piece.type === "income tax" || this.piece.type === "tax" ||this.n%10 === 0 || board.auction !== undefined || board.trade !== undefined || players[turn].inJail === true || board.showDices || board.animateDices || players[turn].animationOffset !== 0 || board.getToMainMenuButton.selected  || board.currentShowingCard !== undefined){
                this.offsetY = this.currentOffsetvalue;
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
                this.offsetY = this.currentOffsetvalue;
                this.hover = false;
            }

            this.draw();
            
        }
        this.draw = function () {
            if(this.n%10 !== 0){
                if(this.mortgaged === false){
                    drawIsometricImage(this.x,this.y,this.img,false,96*this.imgSide,0,96,48,this.offsetX,this.offsetY);
                }else{
                    drawIsometricImage(this.x,this.y,images.part.sprites[17],false,96*this.imgSide,0,96,48,this.offsetX,this.offsetY);
                }
                if(this.owner !== undefined){
                    if(this.side === 2){
                        drawIsometricImage(this.x-10,this.y,images.playerOverlay.sprites[this.owner.colorIndex],false,96*this.imgSide,0,96,48,this.offsetX,this.offsetY);
                    }else{
                        drawIsometricImage(this.x,this.y,images.playerOverlay.sprites[this.owner.colorIndex],false,96*this.imgSide,0,96,48,this.offsetX,this.offsetY);
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
                        drawIsometricImage(this.x+13*drawScale + i*8*drawScale,this.y-31*drawScale,images.house.sprites[0],false,0,0,24,24,this.offsetX,this.offsetY);
                    }
                    if(this.imgSide === 1){
                        drawIsometricImage(this.x+13*drawScale + i*8*drawScale,this.y+15*drawScale,images.house.sprites[0],false,0,0,24,24,this.offsetX,this.offsetY);
                    }
                    if(this.imgSide === 2){
                        drawIsometricImage(this.x+5*drawScale ,this.y-21*drawScale+ i*8*drawScale,images.house.sprites[0],false,24,0,24,24,this.offsetX,this.offsetY);
                    }
                    if(this.imgSide === 3){
                        drawIsometricImage(this.x+50*drawScale ,this.y-21*drawScale+ i*8*drawScale,images.house.sprites[0],false,24,0,24,24,this.offsetX,this.offsetY);
                    }
                }
            }else if(this.piece.housePrice !== undefined){
                if(this.imgSide === 0){
                    drawIsometricImage(this.x+28*drawScale,this.y-31*drawScale,images.house.sprites[1],false,0,0,24,24,this.offsetX,this.offsetY);
                }
                if(this.imgSide === 1){
                    drawIsometricImage(this.x+28*drawScale,this.y+15*drawScale,images.house.sprites[1],false,0,0,24,24,this.offsetX,this.offsetY);
                }
                if(this.imgSide === 2){
                    drawIsometricImage(this.x+5*drawScale ,this.y-8*drawScale,images.house.sprites[1],false,24,0,24,24,this.offsetX,this.offsetY);
                }
                if(this.imgSide === 3){
                    drawIsometricImage(this.x+50*drawScale ,this.y-8*drawScale,images.house.sprites[1],false,24,0,24,24,this.offsetX,this.offsetY);
                }
            }
        }
       

        this.click = function(){
            if(this.hover === true){
                playSound(sounds.release,1)
                if(this.piece.card !== undefined){
                    board.currentCard = this;
                    board.getToMainMenuButton.visible = false;
                }
            }
        }
        this.playerStep = function (onlyStep,player,diceRoll){
            this.currentPlayer.push(player);
            if(this.currentPlayer.length <= 2){
                this.currentOffsetvalue = 1;
                let self = this;
                timeouts.push(setTimeout(() => {
                    self.currentOffsetvalue = 0;
                }, speeds.stepSpeed));
            }
            
            if(!onlyStep && !this.mortgaged && player.laps >= board.settings.roundsBeforePurchase){
                if(this.piece.price < 0){
                    player.money += this.piece.price;
                    board.boardPieces[20].money -= this.piece.price;
                    player.playerBorder.startMoneyAnimation(this.piece.price)
                }else if(this.piece.price > 0 && this.owner === undefined){
                    if(player.bot === undefined){
                        board.currentCard = this;     
                        board.getToMainMenuButton.visible = false;   
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
                    let random = randomIntFromRange(1,14);
                    if (Api.online) {
                        if (players[turn].colorIndex == Api.currentPlayer) Api.randomEvent("CHANCE_CARD", random);
                    } else {
                        this.doChanceCard(random, player);
                    }
                }else if(this.piece.type === "community Chest"){
                    let random = randomIntFromRange(1,17);
                    if (Api.online) {
                        if (players[turn].colorIndex == Api.currentPlayer) Api.randomEvent("COMMUNITY_CHEST", random);
                    } else {
                        this.doCommunityChest(random, player);
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
                }else if(this.freeParking && this.money !== 0){
                    player.money += this.money;
                    player.playerBorder.startMoneyAnimation(this.money)
                    this.money = 0;
                }
            }
        }

        this.doChanceCard = (random, player) => {
            board.currentShowingCard = new CurrentCard(random,"chance")
            if(random === 1){
                board.currentShowingCard.onContinue = function(){player.teleportTo(0, true, false)}
            }
            if(random === 2){
                board.currentShowingCard.onContinue = function(){player.teleportTo(24, true, false)}
            }
            if(random === 3){
                board.currentShowingCard.onContinue = function(){player.teleportTo(11, true, false)}
            }
            if(random === 4){
                if(this.n === 7 ){
                    board.currentShowingCard.onContinue = function(){player.teleportTo(12, undefined, false)}
                }
                if(this.n === 22){
                    board.currentShowingCard.onContinue = function(){player.teleportTo(28, true, false)}
                }
                if(this.n === 36){
                    board.currentShowingCard.onContinue = function(){player.teleportTo(-28, false,false)}
                }
            }
            if(random === 5){
                if(this.n === 7){
                    board.currentShowingCard.onContinue = function(){player.teleportTo(-5, false,false)}
                }
                if(this.n === 22){
                    board.currentShowingCard.onContinue = function(){player.teleportTo(25, false,false)}
                }
                if(this.n === 36){
                    board.currentShowingCard.onContinue = function(){player.teleportTo(-35, false,false)}
                }
            }
            if(random === 6){
                board.currentShowingCard.onContinue = function(){player.money += 50;player.playerBorder.startMoneyAnimation(50)}   
            }
            if(random === 7){
                board.currentShowingCard.onContinue = function(){player.jailcardAmount++;}
            }
            if(random === 8){
                board.currentShowingCard.onContinue = function(){player.teleportTo(-(player.steps-3), false,false)}
            }
            if(random === 9){
                board.currentShowingCard.onContinue = function(){player.goToPrison();}
            }
            if(random === 10){
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
                    board.currentShowingCard.onContinue = function(){player.money -= tmp;player.playerBorder.startMoneyAnimation(-tmp)}
                }else{
                    board.currentShowingCard.onContinue = function(){player.money -= tmp;}
                }
            }
            if(random === 11){
                board.currentShowingCard.onContinue = function(){player.teleportTo(5, undefined, false);}
            }
            if(random === 12){
                board.currentShowingCard.onContinue = function(){player.teleportTo(39, undefined, false);}
            }
            if(random === 13){
                board.currentShowingCard.onContinue = function(){
                    player.money += (players.length-1)*50
                    player.playerBorder.startMoneyAnimation(((players.length-1)*50),true)
                    players.forEach(e=> {if(e !== player){e.money-=50;e.playerBorder.startMoneyAnimation(-50)}})                
                }
                
            }
            if(random === 14){
                board.currentShowingCard.onContinue = function(){player.money += 150;player.playerBorder.startMoneyAnimation(150)}  
            }
        }

        this.doCommunityChest = (random, player) => {
            board.currentShowingCard = new CurrentCard(random,"community")
            if(random === 1){
                board.currentShowingCard.onContinue = function(){player.teleportTo(0, undefined, false)}  
            }
            if(random === 2){
                board.currentShowingCard.onContinue = function(){player.money += 200;player.playerBorder.startMoneyAnimation(200)}  
            }
            if(random === 3){
                board.currentShowingCard.onContinue = function(){
                    player.money -= 50;
                    if(board.settings.freeParking){
                        board.boardPieces[20].money += 50;
                    }
                    player.playerBorder.startMoneyAnimation(-50)
                }  
            }
            if(random === 4){
                board.currentShowingCard.onContinue = function(){
                    player.money += 50;
                    player.playerBorder.startMoneyAnimation(50)
                }
            }
            if(random === 5){
                board.currentShowingCard.onContinue = function(){
                    player.jailcardAmount++;
                }
            }
            if(random === 6){
                board.currentShowingCard.onContinue = function(){
                    player.goToPrison()
                }
            }
            if(random === 7){
                board.currentShowingCard.onContinue = function(){
                    player.money += (players.length-1)*50
                    player.playerBorder.startMoneyAnimation(((players.length-1)*50))
                    players.forEach(e=> {if(e !== player){e.money-=50;e.playerBorder.startMoneyAnimation(-50,true)}})
                }
            }
            if(random === 8){
                board.currentShowingCard.onContinue = function(){
                    player.money += 100;
                    player.playerBorder.startMoneyAnimation(100)
                }
            }
            if(random === 9){
                board.currentShowingCard.onContinue = function(){
                    player.money += 20;
                    player.playerBorder.startMoneyAnimation(20)
                }   
            }
            if(random === 10){
                board.currentShowingCard.onContinue = function(){
                    player.money += (players.length-1)*10
                    player.playerBorder.startMoneyAnimation((players.length-1)*10)
                    players.forEach(e=> {if(e !== player){e.money-=10;e.playerBorder.startMoneyAnimation(-10,true)}})
                }
            }
            if(random === 11){
                board.currentShowingCard.onContinue = function(){
                    player.money += 100;
                    player.playerBorder.startMoneyAnimation(100)
                }
            }
            if(random === 12){
                board.currentShowingCard.onContinue = function(){
                    player.money -= 50;
                    if(board.settings.freeParking){
                        board.boardPieces[20].money += 50;
                    }
                    player.playerBorder.startMoneyAnimation(-50)
                }
            }
            if(random === 13){
                board.currentShowingCard.onContinue = function(){
                    player.money -= 50;
                    if(board.settings.freeParking){
                        board.boardPieces[20].money += 50;
                    }
                    player.playerBorder.startMoneyAnimation(-50)
                }
            }
            if(random === 14){
                board.currentShowingCard.onContinue = function(){
                    player.money -= 25;
                    if(board.settings.freeParking){
                        board.boardPieces[20].money += 25;
                    }
                    player.playerBorder.startMoneyAnimation(-25)
                }
            }
            if(random === 15){
                board.currentShowingCard.onContinue = function(){
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
            }
            if(random === 16){
                board.currentShowingCard.onContinue = function(){
                    player.money += 10;
                    player.playerBorder.startMoneyAnimation(10)
                }
            }
            if(random === 17){
                board.currentShowingCard.onContinue = function(){
                    player.money += 100;
                    player.playerBorder.startMoneyAnimation(100)
                }
            }
        }
    }
}
class CurrentCard{
    constructor(card,type) {
        let self = this;
        this.card = card;
        this.type = type;
        this.continue = function(){};
        
        if(this.type == "chance"){
            this.img = images.chanceCards.sprites[card]
            if(this.img === undefined){
                this.img = images.chanceCards.sprites[0]
            }
        }else if(this.type == "community"){
            console.log(images.communityCards)
            this.img = images.communityCards.sprites[card]
            if(this.img === undefined){
                this.img = images.communityCards.sprites[0]
            }
        }
        
        this.onContinue = undefined;
        this.cardCloseButton = new Button([false,false],369,352,images.buttons.sprites[7],function(){self.continue()},18,18,false,false,false,false,false,{x:371+98,y:350-50,w:512*drawScale,h:256*drawScale})
        this.cardCloseButton.visible = true;
        this.okayButton = new Button([false,false],40,530,images.buttons.sprites[20],function(){self.continue()},200,60,false,false,false)
        this.okayButton.visible = true;

        this.draw = function(){
            drawRotatedImageFromSpriteSheet(470,300,512*2,256*2,this.img,0,false,0,0,512,256,0,c)            
            this.cardCloseButton.draw();
            this.okayButton.draw();
        }
        this.continue = function(){
            self.card = undefined;
            self.cardCloseButton.visible = false;
            self.okayButton.visible = false;
            board.currentShowingCard = undefined;
            self.onContinue();
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
            let mortgaged = 0;
            this.ownedPlaces.forEach(e =>{if(e.mortgaged === true){mortgaged++}})
            if(this.money < 0 && this.ownedPlaces.length == 0+mortgaged){
                if (Api.online) {
                    Api.changeTurn();
                } else {
                    delete Bot.boardInfo[turn]
                    turn = turn%(players.length-1);
                    board.textsize = measureText({font:"Arcade",text:"Just nu: " + players[turn].name});

                }

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
                this.lastMoneyInDebt = this.money
                this.inDebtTo.money += (moneyToAdd);
                if(this.money >= 0){
                    this.inDebtTo.playerBorder.startMoneyAnimation(moneyToAdd - this.money); 
                    this.inDebtTo.money -= this.money;
                    this.inDebtTo = undefined;
                    this.lastMoneyInDebt = 0;
                }else{
                    this.inDebtTo.playerBorder.startMoneyAnimation(moneyToAdd); 
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
            this.teleportTo(10, false, false);
            this.inJail = true;
            this.rolls = true;
        }
        this.getOutOfJail = function(type, sendToServer = true){
            if (Api.online && sendToServer) {
                Api.exitJail(type);
                return;
            }

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
        this.teleportTo = function(step, getMoney = true, sendToServer = true){
            if (Api.online && sendToServer) {
                Api.moveTo(step);
                return;
            }

            let oldStep = this.steps;
            let direction = 1;
            if(step < 0){
                direction = -1;
                step = -step
            }

            this.steps = step%40;

            var dicesum = this.steps - oldStep;
            if (this.steps < oldStep) dicesum += 40;

            this.animateSteps(oldStep,this.steps,dicesum,direction,getMoney);
        }
        this.animateSteps = function(from,to,dicesum,direction,getMoney){
            board.getToMainMenuButton.visible = false;

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
                    board.getToMainMenuButton.visible = true;
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
                    if(((to-self.animationOffset)%40-1) === -1 && getMoney){
                        board.boardPieces[0].playerStep(true,self);
                        self.playerBorder.startMoneyAnimation(200)
                            self.money += 200;
                            self.laps++;
                    }else{
                        board.boardPieces[(to2-self.animationOffset)%40].playerStep(true,self);
                    }
                    

                }
            },speeds.stepSpeed);
            intervals.push(self.timer)
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
                    timeouts.push(setTimeout(() => {
                        board.animateDices = false;
                        callback()
                    }, speeds.diceSpeed.delay));
                }else{
                    timeouts.push(setTimeout(myFunction, counter));
                }
            }
            timeouts.push(setTimeout(myFunction, counter));
        }
        
        this.rollDice = function(){
            if(this.negative === false){
                if(this.inJail === false){
                    if(this.rolls === false){
                        let dice1 = randomIntFromRange(1,6);
                        let dice2 = randomIntFromRange(1,6);
                        this.numberOfRolls++;
                        if(dice1 === dice2){
                            this.rolls = false;
                        }else{
                            this.rolls = true;
                        }
                        
                        this.diceSum = dice1+dice2;
                        this.dice1 = dice1
                        this.dice2 = dice2
                        board.getToMainMenuButton.visible = false;
                        
                        let self = this;
                        this.animateDice(dice1,dice2,function(){
                            if(self.numberOfRolls === 3 && dice1 === dice2){
                                alert("Olagligt att slå dubbla tärningar tre gånger!")
                                self.goToPrison();
                                return;
                            }
                            board.animateDices = false;
                            self.teleportTo((self.steps + dice1 + dice2)%40);
                            board.nextPlayerButton.visible = true;
                            board.goToMainMenuButton.visible = true;
                        })
                    }
                }
            }
            
        }

        board.boardPieces[0].currentPlayer.push(this);
    }
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
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
    var data, w, size =  120; // for higher accuracy increase this size in pixels.
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
    return ({text, font, baseSize = size}) => {   
        size = baseSize;
        can.height = size * 2;
        font = size + "px "+ font;          
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
        while(lIdx < rIdx) {
            if (left === undefined && !isColumnEmpty(lIdx)) { left = lIdx }
            if (right === undefined && !isColumnEmpty(rIdx)) { right = rIdx }
            if (right !== undefined && left !== undefined) { break }
            lIdx += 1;
            rIdx -= 1;
        }
        data = undefined; // release RAM held
        can.width = 1; // release RAM held
        return right - left >= 1 ? {
            left, right, rightOffset: w - right,  width: right - left, 
            measuredWidth: w, font, baseSize} : undefined;
    }   
})();

init();