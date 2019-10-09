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

(function init(){
    NG = new NoiseGenerator([255, 255, 20]);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    noiseScale = [0.006, 0.006];
    drawInterval = setInterval(draw, 1000/6);
})();

function draw(){
    time += 0.05;
    const s = 5;
    for(let y = 0; y < canvas.height; y+= s){
        for(let x = 0; x < canvas.width; x+=s){
            let color = Math.floor(constrain(map(new Array(octaves).fill(0).reduce((acc, _, index) => {
                let val = NG.noise([x*noiseScale[0]*index+adjustment*index, y*noiseScale[1]*index+adjustment*index, time]);
                return acc+val*Math.pow(0.55, index-1);
            }, 0), -1, 1, 0, 255), 0, 255))
            ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
            rect(x, y, s, s);
        }
    }
}

function rect(x, y, w, h){
    ctx.fillRect(x, y, w, h);
}
