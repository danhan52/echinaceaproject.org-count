var iWidth = 2250;
var iHeight = 3000;
var iMult = 1;
var imageObj;

var canvas, ctx;
var circles = [];
var count = 0;

var DELAY = 300, clicks = 0, timer = null;

// -------------------------------------------------------------
// objects :

function Circle(x, y, radius){
  this.x = x;
  this.y = y;
  this.radius = radius;
}

// -------------------------------------------------------------
// drawing functions

// draw circles on the canvas
function drawCircle(ctx, x, y) {
  ctx.fillStyle = 'rgba(255, 35, 55, 1.0)';
  ctx.beginPath();
  ctx.arc(x*iMult, y*iMult, 4/iMult, 0, Math.PI*2, true);
  ctx.stroke();
  ctx.fill();
}

function clear() { // clear canvas function
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(imageObj, 1, 1, iWidth, iHeight);
}


// draw the whole scene
function drawScene() {
  //clear();
  for (var i=0; i<circles.length; i++) { // display all our circles
    drawCircle(ctx, circles[i].x, circles[i].y);
  }

  document.getElementById('count').innerHTML = "Achenes: " + count;
}

// get position relative to canvas
function getPosition(el) {
  var xPos = 0;
  var yPos = 0;

  while (el) {
    if (el.tagName == "BODY") {
      // deal with browser quirks with body/window/document and page scroll
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }

    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos
  };
}

// zoom out and decrease canvas size
function zoomOut() {
  iWidth *= 0.75;
  iHeight *= 0.75;
  iMult *= 0.75;

  canvas.style.width = iWidth + "px";
  canvas.style.height = iHeight + "px";
  clear();
  drawScene();
}

// zoom in and increase canvas size
function zoomIn() {
  iWidth /= 0.75;
  iHeight /= 0.75;
  iMult /= 0.75;

  canvas.style.width = iWidth + "px";
  canvas.style.height = iHeight + "px";
  clear();
  drawScene();
}

// -------------------------------------------------------------
// other helper functions

// get a query string from the url
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// switch adding
function changeAdding() {
  adding = !adding;
}

// -------------------------------------------------------------
// initialization

$(function(){
  canvas = document.getElementById('scene');
  ctx = canvas.getContext('2d');
  imageObj = new Image();
  imageObj.src = getParameterByName("img");
  imageObj.onload = function() {
    ctx.drawImage(imageObj, 1, 1, iWidth, iHeight);
  };

  // binding mouseclick event (for adding new dots)
  $('#scene').click(function(e) {
    var parentPosition = getPosition(e.currentTarget);
    var mouseX = (e.clientX - parentPosition.x)/Math.pow(iMult,2);
    var mouseY = (e.clientY - parentPosition.y)/Math.pow(iMult,2);

    clicks++;

    if(clicks == 1) {
      circles.push(new Circle(mouseX, mouseY));
      timer = setTimeout(function() {
        count++;
        clicks = 0;             //after action performed, reset counter
      }, DELAY);
    } else {
      clearTimeout(timer);    //prevent single-click action
      count++;
      for (var i=0; i<circles.length; i++) {
        if (Math.pow(Math.pow(circles[i].x - mouseX, 2) +
        Math.pow(circles[i].y - mouseY, 2), 1/2) < 7) {
          circles.splice(i, 1);
          i -= 1;
          count--;
        }
      }
      clear();
      drawScene();
      clicks = 0;             //after action performed, reset counter
    }
  });

  $('#scene').dblclick(function(e) {
    e.preventDefault();  //cancel system double-click event
  });

  setInterval(drawScene, 30); // loop drawScene
});
