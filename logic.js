var canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style = "position: fixed; top: 0; left: 0;";

document.body.append(canvas); 

var ctx = canvas.getContext("2d");
var NG;
var octaves = 2;

let noiseScale;

let time = 0;
let drawInterval;
const adjustment = Math.PI*255/2;

let heights;

(function init(){
    NG = new NoiseGenerator([255, 255]);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    noiseScale = [0.01, 0.01];

    draw();
})();

function draw(){
    time += 0.05;
    let s = 1;
    let temp = 0;
    let imgData = ctx.createImageData(canvas.width/s, canvas.height/s);
    let vals = new Uint8ClampedArray(canvas.width*canvas.height*4/s/s)
    .map((_, index) => (index%4==0)?
      temp = Math.floor(map(NG.noise([((index/4)%(canvas.width/s))*noiseScale[0], Math.floor(index/4/canvas.width/s)*noiseScale[1], time]), 0, 1, 0, 255)):
      temp)
    .map((val, index) => (index%4 == 3)? 255: val);
    imgData.data.set(vals);
    ctx.putImageData(imgData, 0, 0);
}

function start(Hz){
    stop();
    hz = hz? hz : 1;
    drawInterval = setInterval(draw, 1000/hz);
}

function stop(){
    clearInterval(drawInterval);
}

function rect(x, y, w, h){
    ctx.fillRect(x, y, w, h);
}
