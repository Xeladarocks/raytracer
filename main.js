// Canvas setup
var twidth = window.innerWidth;
var theight = window.innerHeight;
// eslint-disable-next-line no-undef
var app = new PIXI.Application(twidth, theight, {
  //transparent: true,
  backgroundColor: 0x000, //#000
  antialias: false
});

// Container setup
var myContainer = document.getElementById("pixi-canvas-container");
myContainer.width = twidth;
myContainer.height = theight;
myContainer.appendChild(app.view); // append canvas to container

myContainer.setAttribute("tabindex", "0");
myContainer.focus();

// eslint-disable-next-line no-undef
var graphics = new PIXI.Graphics();
app.stage.addChild(graphics); // graph

var fpsElement = document.getElementById("fps");
var counter = 0;
var fpsArray = new Array();

window.addEventListener("keydown", onKeyDown, false);
window.addEventListener("keyup", onKeyUp, false);

var keyW = false;
var keyA = false;
var keyS = false;
var keyD = false;

var map = [ ["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"],
            ["1","0","0","0","0","0","4","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","2","0","0","0","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","0","3","0","0","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","3","0","0","0","0","0","0","0","0","0","0","0","3","0","0","0","0","1"],
            ["1","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","0","2","0","0","2","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","0","0","2","2","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","0","0","2","2","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","0","3","0","0","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","0","0","0","0","0","0","0","0","0","0","4","0","0","0","0","1"],
            ["1","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","1"],
            ["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"] ]

var h = myContainer.offsetHeight, w = myContainer.offsetWidth;

var posX = 12, posY = 2;  //x and y start position
var dirX = -1, dirY = 0; //initial direction vector
var planeX = 0, planeY = twidth / theight - 1; //the 2d raycaster version of camera plane

var time = 0; //time of current frame
var oldTime = 0; //time of previous frame

app.ticker.add(function() {
    graphics.clear();
    for(var x = 0; x < w; x++) {
        //calculate ray position and direction
        var cameraX = 2 * x / w - 1; //x-coordinate in camera space
        var rayDirX = dirX + planeX * cameraX;
        var rayDirY = dirY + planeY * cameraX;

        //which box of the map we're in
        var mapX = Math.round(posX);
        var mapY = Math.round(posY);

        //length of ray from current position to next x or y-side
        var sideDistX;
        var sideDistY;

            //length of ray from one x or y-side to next x or y-side
        var deltaDistX = Math.abs(1 / rayDirX);
        var deltaDistY = Math.abs(1 / rayDirY);
        var perpWallDist;

        //what direction to step in x or y-direction (either +1 or -1)
        var stepX;
        var stepY;

        var hit = 0; //was there a wall hit?
        var side; //was a NS or a EW wall hit?
            
        //calculate step and initial sideDist
        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (posX - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - posX) * deltaDistX;
        } if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (posY - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - posY) * deltaDistY;
        }

      
        //perform DDA
        while (hit === 0) {
            //jump to next map square, OR in x-direction, OR in y-direction
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }
            //Check if ray has hit a wall
            if (map[mapX][mapY] > 0)hit = 1;
        }

        //Calculate distance projected on camera direction (Euclidean distance will give fisheye effect!)
        if (side == 0) perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
        else           perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;

        //Calculate height of line to draw on screen
        var lineHeight = (h / perpWallDist);

        //calculate lowest and highest pixel to fill in current stripe
        var drawStart = -lineHeight / 2 + h / 2;
        if(drawStart < 0)drawStart = 0;
        var drawEnd = lineHeight / 2 + h / 2;
        if(drawEnd >= h)drawEnd = h - 1;
        
        //choose wall color
        var color;
        switch(map[mapX][mapY]) {
            case "1":  color = 0xFF0000;  break; //#FF0000
            case "2":  color = 0x00FF00;  break; //#00FF00
            case "3":  color = 0x0000FF;  break; //#0000FF
            case "4": color = 0xFFFF00; break; //#FFFF00
            default: color = 0xff69b4; break; //#ff69b4 
        }

        //give x and y sides different brightness
        if (side == 1) {color = color / 1.5;}

        //verLine(x, drawStart, drawEnd, color);
        //draw the pixels of the stripe as a vertical line
        graphics.lineStyle(1, color).moveTo(x, drawStart).lineTo(x, drawEnd);
        //console.log("moveTo: "+x+","+drawStart+" lineTo: "+x+","+drawEnd)
    }

    oldTime = time;
    time = new Date().getTime();
    var frameTime = (time - oldTime) / 1000.0; //frameTime is the time this frame has taken, in seconds
    //fpsElement.innerText = 1.0 / frameTime; //FPS counter
    if (counter >= 60) {
        var sum = fpsArray.reduce(function(a,b) { return a + b });
        var average = Math.ceil(sum / fpsArray.length);
        counter = 0;
        fpsElement.innerText = Math.round(average.toFixed(2)); // push to FPS div[span]
    } else {
        if (fps !== Infinity) {
            fpsArray.push(1 / frameTime);
        }
        counter++;
    }
    
    //speed modifiers
    var moveSpeed = frameTime * 5.0; //the constant value is in squares/second
    var rotSpeed = frameTime * 3.0; //the constant value is in radians/second

    //move forward if no wall in front of you
    if (keyW === true) {
      if(map[Math.round(posX + dirX * moveSpeed)][Math.round(posY)] == 0) posX += dirX * moveSpeed;
      if(map[Math.round(posX)][Math.round(posY + dirY * moveSpeed)] == 0) posY += dirY * moveSpeed;
    }
    //move backwards if no wall behind you
    if (keyS === true) {
      if(map[Math.round(posX - dirX * moveSpeed)][Math.round(posY)] == 0) posX -= dirX * moveSpeed;
      if(map[Math.round(posX)][Math.round(posY - dirY * moveSpeed)] == 0) posY -= dirY * moveSpeed;
    }
    //rotate to the right
    if (keyD === true) {
      //both camera direction and camera plane must be rotated
      var oldDirX = dirX;
      dirX = dirX * Math.cos(-rotSpeed) - dirY * Math.sin(-rotSpeed);
      dirY = oldDirX * Math.sin(-rotSpeed) + dirY * Math.cos(-rotSpeed);
      var oldPlaneX = planeX;
      planeX = planeX * Math.cos(-rotSpeed) - planeY * Math.sin(-rotSpeed);
      planeY = oldPlaneX * Math.sin(-rotSpeed) + planeY * Math.cos(-rotSpeed);
    }
    //rotate to the left
    if (keyA === true) {
      //both camera direction and camera plane must be rotated
      var oldDirX = dirX;
      dirX = dirX * Math.cos(rotSpeed) - dirY * Math.sin(rotSpeed);
      dirY = oldDirX * Math.sin(rotSpeed) + dirY * Math.cos(rotSpeed);
      var oldPlaneX = planeX;
      planeX = planeX * Math.cos(rotSpeed) - planeY * Math.sin(rotSpeed);
      planeY = oldPlaneX * Math.sin(rotSpeed) + planeY * Math.cos(rotSpeed);
    }

});