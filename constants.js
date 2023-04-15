var board;

var turn = 0;

var players = [];

const drawScale = 2;

const fastLoad = true;

var f = new FontFace('Arcade', 'url(./fonts/SFPixelate-Bold.ttf)');

f.load().then(function(font){document.fonts.add(font);});

var buttons = [];

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
        src:["./images/Cards/browncard1","./images/Cards/browncard2","./images/Cards/lightbluecard1","./images/Cards/lightbluecard2","./images/Cards/lightbluecard3"
            ,"./images/Cards/pinkcard1","./images/Cards/pinkcard2","./images/Cards/pinkcard3","./images/Cards/orangecard1","./images/Cards/orangecard2","./images/Cards/orangecard3"
            ,"./images/Cards/redcard1","./images/Cards/redcard2","./images/Cards/redcard3","./images/Cards/yellowcard1","./images/Cards/yellowcard2","./images/Cards/yellowcard3"
            ,"./images/Cards/greencard1","./images/Cards/greencard2","./images/Cards/greencard3","./images/Cards/bluecard1","./images/Cards/bluecard2"
            ,"./images/cards/electricitycard","./images/cards/waterworkscard"
            ,"./images/cards/eaststation","./images/cards/northstation","./images/cards/centralstation","./images/cards/southstation"
        ]
    },
    corner:{
        src:["./images/corners/Go","./images/corners/prison","./images/corners/parking","./images/corners/gotoprison"
        ]
    },
    player:{
        src:["./images/players/player","./images/players/player2","./images/players/player3","./images/players/player4",
        "./images/players/player5","./images/players/player6","./images/players/player7","./images/players/player8"
        ]
    },
    playerOverlay:{
        src:["./images/players/redowned","./images/players/pinkowned","./images/players/purpleowned","./images/players/blueowned",
        "./images/players/lightblueowned","./images/players/greenowned","./images/players/yellowowned","./images/players/orangeowned",
        "./images/buttons/playerborder","./images/menus/playerinfobottom","./images/menus/playerinfomiddle","./images/menus/playerinfotop"
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
        name:"Sjöbo",
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
        name:"Eslöv",
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
        name:"Hörby",
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
        name:"Höör",
        price:100,
        rent:[6,30,90,270,400,550],
        housePrice:50,
        group:"light blue",
        img:1,
        card:3
    },
    {
        name:"Furulund",
        price:120,
        rent:[8,40,100,300,450,600],
        housePrice:50,
        group:"light blue",
        img:1,
        card:4
    },
    {
        name:"§ängelse",
        img:1
    },
    {
        name:"Simrishamn",
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
        name:"Svedala",
        price:140,
        rent:[10,50,150,450,625,750],
        housePrice:100,
        group:"pink",
        img:2,
        card:6
    },
    {
        name:"Staffanstorp",
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
        name:"Lomma",
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
        name:"Kävlinge",
        price:180,
        rent:[14,70,200,550,750,950],
        housePrice:100,
        group:"orange",
        img:3,
        card:9
    },
    {
        name:"Vellinge",
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
        name:"Båstad",
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
        name:"Höganäs",
        price:220,
        rent:[18,90,250,700,875,1050],
        housePrice:150,
        group:"red",
        img:4,
        card:12
    },
    {
        name:"Hässleholm",
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
        name:"Ystad",
        price:260,
        rent:[22,110,330,800,975,1150],
        housePrice:150,
        group:"yellow",
        img:5,
        card:14
    },
    {
        name:"Ängelholm",
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
        name:"Trelleborg",
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
        name:"Landskrona",
        price:300,
        rent:[26,130,390,900,1100,1275],
        housePrice:200,
        group:"green",
        img:6,
        card:17
    },
    {
        name:"Kristianstad",
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
        name:"Lund",
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
        name:"Helsingborg",
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
        name:"Malmö", 
        price:400,
        rent:[50,200,600,1400,1700,2000],
        housePrice:200,
        group:"blue",
        img:7,
        card:21
    }
]