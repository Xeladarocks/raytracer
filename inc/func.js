function updateFps() {
    var fps;
    if (!lastCalledTime) {
        lastCalledTime = new Date().getTime();
        fps = 0;
    }
    var delta = (new Date().getTime() - lastCalledTime) / 1000;
    lastCalledTime = new Date().getTime();
    fps = Math.ceil((1/delta));
    if (counter >= 60) {
        var sum = fpsArray.reduce(function(a,b) { return a + b });
        var average = Math.ceil(sum / fpsArray.length);
        counter = 0;
        fpsElement.innerText = Math.round(average.toFixed(2)); // push to FPS div[span]
    } else {
        if (fps !== Infinity) {
            fpsArray.push(fps);
        }
        counter++;
    }
}

function onKeyDown(event) {
    var keyCode = event.keyCode;
    switch (keyCode) {
      case 68: //d
        keyD = true;
        break;
      case 83: //s
        keyS = true;
        break;
      case 65: //a
        keyA = true;
        break;
      case 87: //w
        keyW = true;
        break;
    }
  }
  
  function onKeyUp(event) {
    var keyCode = event.keyCode;
    switch (keyCode) {
      case 68: //d
        keyD = false;
        break;
      case 83: //s
        keyS = false;
        break;
      case 65: //a
        keyA = false;
        break;
      case 87: //w
        keyW = false;
        break;
    }
  }