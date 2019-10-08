var canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style = "position: fixed; top: 0; left: 0;";

document.body.append(canvas); 

var ctx = canvas.getContext("2d");
ctx.fillStyle = "#000000";
ctx.fillRect(0,0, canvas.width, canvas.height);

