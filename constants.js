var board;

var turn = 0;

var players = [];

const drawScale = 2;

const fastSpeed = false;

const disableAlert = false;

const latestSaveVersion = 3;

var namn

if (disableAlert) {
    window.alert = function () { }
}


var f = new FontFace('Arcade', 'url(./fonts/SFPixelate.ttf)');
var fb = new FontFace('ArcadeBold', 'url(./fonts/SFPixelate-Bold.ttf)');
var fbc = new FontFace('Handwritten', 'url(./fonts/Always-In-My-Heart.ttf)');
var fbcd = new FontFace('Signature', 'url(./fonts/Scribble.ttf)');

f.load().then(function (font) { document.fonts.add(font); });
fb.load().then(function (font) { document.fonts.add(font); });
fbc.load().then(function (font) { document.fonts.add(font); });
fbcd.load().then(function (font) { document.fonts.add(font); });

var buttons = [];

var offsets = {
    x: Math.floor(window.innerWidth / 2) - 832 * drawScale / 2,
    y: Math.floor(window.innerHeight / 2) - 416 * drawScale / 2
}
var scale = 0;

var scaleMultiplier = 1;
var speeds;
if (fastSpeed === true) {
    speeds = {
        botMin: 100,
        botMax: 200,
        stepSpeed: 50,
        auctionSpeed: 100,
        diceSpeed: {
            counter: 1,
            factor: 10,
            threshold: 0,
            delay: 0,
        },
        moneyAnimationSpeed: 0.05

    }
} else {
    speeds = {
        botMin: 500,
        botMax: 1000,
        stepSpeed: 250,
        auctionSpeed: 500,
        diceSpeed: {
            counter: 10,
            factor: 1.4,
            threshold: 150,
            delay: 1000
        },
        moneyAnimationSpeed: 0.015

    }
}
var spritesheet;
var spritesheetImage

async function loadSpriteSheet() {
    var response = await fetch("./images/texture.json")
    spritesheet = await response.json();
    spritesheetImage = new Image();
    spritesheetImage.src = "./images/texture.png";
}

async function loadNames() {
    var response = await fetch("./namn.json")
    namn = await response.json();
}



var images = {
    spritesheet: {
        src: ["./images/spritesheet"]
    },
    part: {
        src: ["./images/plates/brown", "./images/plates/light_blue",
            "./images/plates/pink", "./images/plates/orange",
            "./images/plates/red", "./images/plates/yellow",
            "./images/plates/green", "./images/plates/blue",
            "./images/plates/chance", "./images/plates/chance2", "./images/plates/chance3",
            "./images/plates/train", "./images/plates/water", "./images/plates/electric",
            "./images/plates/supertax", "./images/plates/chest", "./images/plates/incometax",
            "./images/plates/mortgaged", "./images/plates/trainmortgaged", "./images/plates/electricmortgaged", "./images/plates/watermortgaged"
        ]
    },
    card: {
        src: ["./images/Cards/browncard1", "./images/Cards/browncard2", "./images/Cards/lightbluecard1", "./images/Cards/lightbluecard2", "./images/Cards/lightbluecard3"
            , "./images/Cards/pinkcard1", "./images/Cards/pinkcard2", "./images/Cards/pinkcard3", "./images/Cards/orangecard1", "./images/Cards/orangecard2", "./images/Cards/orangecard3"
            , "./images/Cards/redcard1", "./images/Cards/redcard2", "./images/Cards/redcard3", "./images/Cards/yellowcard1", "./images/Cards/yellowcard2", "./images/Cards/yellowcard3"
            , "./images/Cards/greencard1", "./images/Cards/greencard2", "./images/Cards/greencard3", "./images/Cards/bluecard1", "./images/Cards/bluecard2"
            , "./images/Cards/electricitycard", "./images/Cards/waterworkscard"
            , "./images/Cards/eaststation", "./images/Cards/northstation", "./images/Cards/centralstation", "./images/Cards/southstation"
        ]
    },
    corner: {
        src: ["./images/corners/Go", "./images/corners/prison", "./images/corners/parking", "./images/corners/gotoprison"
        ]
    },
    player: {
        src: ["./images/players/player", "./images/players/player2", "./images/players/player3", "./images/players/player4",
            "./images/players/player5", "./images/players/player6", "./images/players/player7", "./images/players/player8"
        ]
    },
    playerOverlay: {
        src: ["./images/players/redowned", "./images/players/pinkowned", "./images/players/purpleowned", "./images/players/blueowned",
            "./images/players/lightblueowned", "./images/players/greenowned", "./images/players/yellowowned", "./images/players/orangeowned",
            "./images/buttons/playerborder", "./images/menus/playerinfobottom", "./images/menus/playerinfomiddle", "./images/menus/playerinfotop"
        ]
    },
    background: {
        src: ["./images/static/insideboard", "./images/static/realbackground"
        ]
    },
    house: {
        src: ["./images/buildings/house", "./images/buildings/hotel"
        ]
    },
    dice: {
        src: ["./images/dices/dices"
        ]
    },
    buttons: {
        src: ["./images/buttons/rolldice", "./images/buttons/nextplayer",
            "./images/buttons/sellbutton", "./images/buttons/mortgage", "./images/buttons/arrowup", "./images/buttons/arrowdown",
            "./images/buttons/buythislawn", "./images/buttons/exitCard", "./images/buttons/auction", "./images/buttons/suggestatrade",
            "./images/buttons/setting", "./images/buttons/start", "./images/buttons/back", "./images/buttons/bot", "./images/buttons/music",
            "./images/buttons/no", "./images/buttons/yes", "./images/buttons/menu", "./images/buttons/fullscreen", "./images/buttons/flag",
            "./images/buttons/okej", "./images/buttons/antilising", "./images/buttons/load", "./images/buttons/saveselect"
        ]
    },
    auction: {
        src: ["./images/menus/auctionmenubackground", "./images/buttons/auction+2", "./images/buttons/auction+10", "./images/buttons/auction+100", "./images/buttons/exitauction", "./images/buttons/startauction"]
    },
    trade: {
        src: ["./images/menus/tradingmenu", "./images/buttons/accept", "./images/buttons/tradingcityname"]
    },
    jailMenu: {
        src: ["./images/menus/prisonmenu", "./images/buttons/prisonpay", "./images/buttons/prisonrolldice", "./images/buttons/prisongetoutofjail"]
    },
    lobbyMenu: {
        src: ["./images/buttons/plus", "./images/buttons/minus"]
    },
    mainMenu: {
        src: ["./images/menus/mainmenu", "./images/buttons/local", "./images/buttons/online", "./images/menus/lobbymenu", "./images/buttons/credits", "./images/menus/creditsmenu",]
    },
    exitMenu: {
        src: ["./images/menus/exitmenu", "./images/buttons/exitCardTrans"]
    },
    mortgageOverlay: {
        src: ["./images/Cards/mortgageoverlay"]
    },
    colorButtons: {
        src: ["./images/playercolorbuttons/playercolorbutton", "./images/playercolorbuttons/playercolorbutton2", "./images/playercolorbuttons/playercolorbutton3", "./images/playercolorbuttons/playercolorbutton4",
            "./images/playercolorbuttons/playercolorbutton5", "./images/playercolorbuttons/playercolorbutton6", "./images/playercolorbuttons/playercolorbutton7", "./images/playercolorbuttons/playercolorbutton8", "./images/playercolorbuttons/unselected"
        ]
    },
    chanceCards: {
        src: ["./images/community card and chance card/emptychancecard", "./images/community card and chance card/gatillstart", "./images/community card and chance card/gatillhassleholm", "./images/community card and chance card/gatillsimrishamn", "./images/community card and chance card/gatillnarmstaanlaggning", "./images/community card and chance card/gatillnarmstatagstation", "./images/community card and chance card/fa50kr", "./images/community card and chance card/lamnafinkangratis", "./images/community card and chance card/gabaktresteg", "./images/community card and chance card/gatillfinkan", "./images/community card and chance card/betalahushotell", "./images/community card and chance card/gatillsodrastationen", "./images/community card and chance card/gatillmalmo", "./images/community card and chance card/fa50kravallaandraspelare", "./images/community card and chance card/fa150kr"]
    },
    communityCards: {
        src: ["./images/community card and chance card/emptycommunitycard", "./images/community card and chance card/gatillstartc", "./images/community card and chance card/fa200krc", "./images/community card and chance card/forlora50krc", "./images/community card and chance card/fa50krc", "./images/community card and chance card/lamnafinkangratisc", "./images/community card and chance card/gatillfinkanc", "./images/community card and chance card/fa50kravallaandraspelarec", "./images/community card and chance card/fa100krc", "./images/community card and chance card/fa20krc", "./images/community card and chance card/fa10kravallaandraspelarec", "./images/community card and chance card/fa100krc", "./images/community card and chance card/forlora50krc", "./images/community card and chance card/forlora50krc", "./images/community card and chance card/forlora25krc", "./images/community card and chance card/betalahushotellc", "./images/community card and chance card/fa10krc", "./images/community card and chance card/fa100krc"]
    },
    specialCards: {
        src: ["./images/community card and chance card/specialempty", "./images/community card and chance card/gatillfinkanS", "./images/community card and chance card/illegaldices", "./images/community card and chance card/payincometax", "./images/community card and chance card/payrichtax"]
    },
    bankCheck: {
        src:["./images/community card and chance card/bankcheck"]
    },
    statMenu:{
        src:["./images/buttons/statbutton","./images/menus/statmenu","./images/menus/statmenu2","./images/menus/statmenu3","./images/menus/statmenu4","./images/menus/statmenu5","./images/buttons/changestat","./images/menus/stats","./images/buttons/networth","./images/buttons/moneyearned","./images/buttons/moneylost","./images/buttons/bestpiece","./images/buttons/worstpiece"]
    }
};

var sounds = {
    bell: {
        type: "single",
        src: "./sounds/bell.mp3"
    },
    card: {
        type: "single",
        src: "./sounds/card.mp3"
    },
    prison: {
        type: "single",
        src: "./sounds/prison.mp3"
    },
    car: {
        type: "single",
        src: "./sounds/car.mp3"
    },
    freeze: {
        type: "single",
        src: "./sounds/freeze.mp3"
    },
    train: {
        type: "single",
        src: "./sounds/train.mp3"
    },
    electric: {
        type: "single",
        src: "./sounds/electric.mp3"
    },
    water: {
        type: "single",
        src: "./sounds/water.mp3"
    },
    dice: {
        type: "single",
        src: "./sounds/dice.mp3"
    },
    click: {
        type: "single",
        src: "./sounds/click.mp3"
    },
    release: {
        type: "single",
        src: "./sounds/release.mp3"
    },
    movement: {
        type: "multiple",
        src: "./sounds/movement.mp3",
    },
    cash: {
        type: "multiple",
        src: "./sounds/cash.mp3",
    },
    music: {
        type: "multiple",
        src: "./sounds/music.mp3",
    },
    msc: {
        type: "multiple",
        src: "./sounds/msc.mp3",
    },
    key: {
        type: "multiple",
        src: "./sounds/keyboard.mp3",
    },
    clicks: {
        type: "multiple",
        src: "./sounds/slider.mp3",
    }
}

var mouse = {
    x: 10000,
    y: 10000
}
const pieces = [
    {
        name: "Start",
        img: 0
    },
    {
        name: "Sjöbo",
        price: 60,
        rent: [2, 10, 30, 90, 160, 250],
        housePrice: 50,
        group: "brown",
        img: 0,
        card: 0,
        color: "#795548"
    },
    {
        name: "Allmänning",
        type: "community chest",
        img: 15
    },
    {
        name: "Eslöv",
        price: 60,
        rent: [4, 20, 60, 180, 320, 450],
        housePrice: 50,
        group: "brown",
        img: 0,
        card: 1,
        color: "#795548"
    },
    {
        name: "Inkomstskatt",
        type: "income tax",
        img: 16,
    },
    {
        name: "Södra stationen",
        price: 200,
        type: "station",
        img: 11,
        card: 27,
        color: "black"
    },
    {
        name: "Hörby",
        price: 100,
        rent: [6, 30, 90, 270, 400, 550],
        housePrice: 50,
        group: "light blue",
        img: 1,
        card: 2,
        color: "#81d4fa"
    },
    {
        name: "Chans",
        type: "chance",
        img: 10
    },
    {
        name: "Höör",
        price: 100,
        rent: [6, 30, 90, 270, 400, 550],
        housePrice: 50,
        group: "light blue",
        img: 1,
        card: 3,
        color: "#81d4fa"
    },
    {
        name: "Furulund",
        price: 120,
        rent: [8, 40, 100, 300, 450, 600],
        housePrice: 50,
        group: "light blue",
        img: 1,
        card: 4,
        color: "#81d4fa"
    },
    {
        name: "fängelse",
        img: 1
    },
    {
        name: "Simrishamn",
        price: 140,
        rent: [10, 50, 150, 450, 625, 750],
        housePrice: 100,
        group: "pink",
        img: 2,
        card: 5,
        color: "#e91e63"
    },
    {
        name: "Elverket",
        price: 150,
        type: "utility",
        img: 13,
        card: 22,
        color: "black"
    },
    {
        name: "Svedala",
        price: 140,
        rent: [10, 50, 150, 450, 625, 750],
        housePrice: 100,
        group: "pink",
        img: 2,
        card: 6,
        color: "#e91e63"
    },
    {
        name: "Staffanstorp",
        price: 160,
        rent: [12, 60, 180, 500, 700, 900],
        housePrice: 100,
        group: "pink",
        img: 2,
        card: 7,
        color: "#e91e63"
    },
    {
        name: "Östra Stationen",
        price: 200,
        type: "station",
        img: 11,
        card: 24,
        color: "black"
    },
    {
        name: "Lomma",
        price: 180,
        rent: [14, 70, 200, 550, 750, 950],
        housePrice: 100,
        group: "orange",
        img: 3,
        card: 8,
        color: "#ffa000"
    },
    {
        name: "Allmänning",
        type: "community chest",
        img: 15
    },
    {
        name: "Kävlinge",
        price: 180,
        rent: [14, 70, 200, 550, 750, 950],
        housePrice: 100,
        group: "orange",
        img: 3,
        card: 9,
        color: "#ffa000"
    },
    {
        name: "Vellinge",
        price: 200,
        rent: [16, 80, 220, 600, 800, 1000],
        housePrice: 100,
        group: "orange",
        img: 3,
        card: 10,
        color: "#ffa000"
    },
    {
        name: "Fri parkering",
        img: 2
    },
    {
        name: "Båstad",
        price: 220,
        rent: [18, 90, 250, 700, 875, 1050],
        housePrice: 150,
        group: "red",
        img: 4,
        card: 11,
        color: "#e51c23"
    },
    {
        name: "Chans",
        type: "chance",
        img: 8
    },
    {
        name: "Höganäs",
        price: 220,
        rent: [18, 90, 250, 700, 875, 1050],
        housePrice: 150,
        group: "red",
        img: 4,
        card: 12,
        color: "#e51c23"
    },
    {
        name: "Hässleholm",
        price: 240,
        rent: [20, 100, 300, 750, 925, 1100],
        housePrice: 150,
        group: "red",
        img: 4,
        card: 13,
        color: "#e51c23"
    },
    {
        name: "Centralstationen",
        price: 200,
        type: "station",
        img: 11,
        card: 26,
        color: "black"
    },
    {
        name: "Ystad",
        price: 260,
        rent: [22, 110, 330, 800, 975, 1150],
        housePrice: 150,
        group: "yellow",
        img: 5,
        card: 14,
        color: "#ffeb3b"
    },
    {
        name: "Ängelholm",
        price: 260,
        rent: [22, 110, 330, 800, 975, 1150],
        housePrice: 150,
        group: "yellow",
        img: 5,
        card: 15,
        color: "#ffeb3b"
    },
    {
        name: "Vattenledningsverket",
        price: 150,
        type: "utility",
        img: 12,
        card: 23,
        color: "black"
    },
    {
        name: "Trelleborg",
        price: 280,
        rent: [24, 120, 360, 850, 1025, 1200],
        housePrice: 150,
        group: "yellow",
        img: 5,
        card: 16,
        color: "#ffeb3b"
    },
    {
        name: "Gå till finkan",
        img: 3
    },
    {
        name: "Landskrona",
        price: 300,
        rent: [26, 130, 390, 900, 1100, 1275],
        housePrice: 200,
        group: "green",
        img: 6,
        card: 17,
        color: "#42bd41"
    },
    {
        name: "Kristianstad",
        price: 300,
        rent: [26, 130, 390, 900, 1100, 1275],
        housePrice: 200,
        group: "green",
        img: 6,
        card: 18,
        color: "#42bd41"
    },
    {
        name: "Allmänning",
        type: "community chest",
        img: 15
    },
    {
        name: "Lund",
        price: 320,
        rent: [28, 150, 450, 1000, 1200, 1400],
        housePrice: 200,
        group: "green",
        img: 6,
        card: 19,
        color: "#42bd41"
    },
    {
        name: "Norra stationen",
        price: 200,
        type: "station",
        img: 11,
        card: 25,
        color: "black"
    },
    {
        name: "Chans",
        type: "chance",
        img: 9
    },
    {
        name: "Helsingborg",
        price: 350,
        rent: [35, 175, 500, 1100, 1300, 1500],
        housePrice: 200,
        group: "blue",
        img: 7,
        card: 20,
        color: "#0288d1"
    },
    {
        name: "Lyxskatt",
        price: -100,
        img: 14,
        type: "tax"
    },
    {
        name: "Malmö",
        price: 400,
        rent: [50, 200, 600, 1400, 1700, 2000],
        housePrice: 200,
        group: "blue",
        img: 7,
        card: 21,
        color: "#0288d1"
    }
]