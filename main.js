var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
var offset = 0;
var camera = {x:0, y:0, z:0};
let z_distance = 25;
var object = [[1, 1, z_distance],
              [3, 2, z_distance],
              [7, 5, z_distance]];
var I = [];
var num_missed = 0;

var PutPixel = function(color) {
    imagedata.data[offset++] = color[0];
    imagedata.data[offset++] = color[1];
    imagedata.data[offset++] = color[2];
    imagedata.data[offset++] = 255; // Alpha = 255 (full opacity)
};

// Displays the contents of the offscreen buffer into the canvas.
var UpdateCanvas = function() {
    ctx.putImageData(imagedata, 0, 0);
    offset = 0;
};

function areaTri(p1, p2, p3)
{
    return ((p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])) / 2; // (Ax(By−Cy)+Bx(Cy-Ay)+Cx(Ay−By)) / 2
}

function isInside(pt, object) {
    let p1 = object[0];
    let p2 = object[1];
    let p3 = object[2];
    let area = areaTri(p1, p2, p3);          //area of triangle ABC
    let area1 = areaTri(pt, p2, p3);         //area of PBC
    let area2 = areaTri(p1, pt, p3);         //area of APC
    let area3 = areaTri(p1, p2, pt);        //area of ABP

    if(area === (area1+area2+area3))return true;
    return false;
}

for (let y=0;y<canvas.height; y++) {
    for (let x=0;x<canvas.width; x++) {
        I[0] = x;
        I[1] = y;
        I[2] = 15;
        let result = isInside(I, object);
        if(result === true){
            PutPixel(x, y, 'rgb(0,0,0)');
        } else {
            num_missed++;
        }
    }
}
console.log(num_missed);

UpdateCanvas();
