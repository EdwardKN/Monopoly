var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");

var images = {
    board:{
        src:["./images/board.png"]
    }
};

window.addEventListener("resize",function(e){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
function drawRotatedImage(x,y,w,h,img,angle,mirrored){
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
    c.drawImage(img,Math.floor(-w/2),Math.floor(-h/2),Math.floor(w),Math.floor(h));
    c.restore();
}

function init(){
    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    preRender(images);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    c.imageSmoothingEnabled = false;

}

function animate(){
    requestAnimationFrame(animate);

    c.clearRect(0,0,canvas.width,canvas.height);

    drawRotatedImage(0,0,canvas.width,canvas.width/2,images.board.img[0],0,false);

}

init();
animate();


