// set up image size (the changing one) and multiplier
var iWidth = 2250, iHeight = 3000, iMult = 1;
// set up image size (the permanent one)
var initWidth = 2250, initHeight = 3000;
// make image, canvas, and context objects
var imageObj;
var canvas, ctx;
// variables for keeping track up circle locations and count
var circles = [];
var count = 0;
// variables for dealing with double click operations
var DELAY = 300, clicks = 0, timer = null;
// point color and size
var color = "turquoise";
var ptSize = 6;
// scrolling things
var doc, pageHeight, pageWidth, scrolledX, scrolledY;

// -------------------------------------------------------------
// create a circle object
function Circle(x, y, radius){
  this.x = x;
  this.y = y;
  this.radius = radius;
}

// -------------------------------------------------------------
// drawing functions

// draw circles on the canvas
function drawCircle(ctx, x, y) {
  if (color == "turquoise") {
    ctx.fillStyle = "#00FFFF";
  } else {
    ctx.fillStyle = color;
  }
  ctx.beginPath();
  ctx.arc(x, y, ptSize/iMult, 0, Math.PI*2, true);
  ctx.stroke();
  ctx.fill();
}

// clear canvas and redraw image
function clear() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(imageObj, 1, 1, initWidth, initHeight);
}


// draw all circles and change the count
function drawScene() {
  for (var i=0; i<circles.length; i++) { // display all our circles
    drawCircle(ctx, circles[i].x, circles[i].y);
  }

  document.getElementById("count").innerHTML = "Achenes: " + count;
}

// -------------------------------------------------------------
// interactions with canvas functions

// get position relative to canvas - as opposed to the whole page
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
  iWidth *= 0.65;
  iHeight *= 0.65;
  iMult *= 0.65;

  canvas.style.width = iWidth + "px";
  canvas.style.height = iHeight + "px";
  clear();
  drawScene();

  pageHeight = (doc.scrollHeight - doc.clientHeight);
  pageWidth = (doc.scrollWidth - doc.clientWidth);
  var toX = Math.floor(percentageScrolledX*pageWidth/100);
  var toY = Math.floor(percentageScrolledY*pageHeight/100);
  window.scrollTo(toX, toY);
}

// zoom in and increase canvas size
function zoomIn() {
  iWidth /= 0.65;
  iHeight /= 0.65;
  iMult /= 0.65;

  canvas.style.width = iWidth + "px";
  canvas.style.height = iHeight + "px";
  clear();
  drawScene();

  pageHeight = (doc.scrollHeight - doc.clientHeight);
  pageWidth = (doc.scrollWidth - doc.clientWidth);
  var toX = Math.floor(percentageScrolledX*pageWidth/100);
  var toY = Math.floor(percentageScrolledY*pageHeight/100);
  window.scrollTo(toX, toY);
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
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// -------------------------------------------------------------
// cookies!!

function setCookie(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days*24*60*60*1000);
    var expires = "; expires=" + date.toGMTString();
  } else {
    var expires = "";
  }
  document.cookie = name + "=" + value + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function changePreferences() {
  color = document.getElementById("colors").value;
  setCookie("color", color, 365);
  if (document.getElementById("pts").value) {
    ptSize = document.getElementById("pts").value;
  }
  setCookie("ptSize", ptSize, 365);
  clear();
}

function eraseCookie(name) {
	setCookie(name,"",-1);
}

// -------------------------------------------------------------
// initialization

$(function(){
  $("#countingBox").draggable();

    doc = document.body;
    pageHeight = (doc.scrollHeight - doc.clientHeight);
    pageWidth = (doc.scrollWidth - doc.clientWidth);

  window.onscroll = function () {
    var yPosScroll = doc.scrollTop;
    percentageScrolledY = Math.floor((yPosScroll / pageHeight) * 100);
    var xPosScroll = doc.scrollLeft;
    percentageScrolledX = Math.floor((xPosScroll / pageWidth) * 100);
    // document.getElementById("digitty").innerHTML = percentageScrolledX + ", " + percentageScrolledY;
   };
  // get canvas, context, and create image
  canvas = document.getElementById("scene");
  ctx = canvas.getContext("2d");
  imageObj = new Image();
  imageObj.src = getParameterByName("img");
  imageObj.onload = function() {
    ctx.drawImage(imageObj, 1, 1, initWidth, initHeight);
  };

  // set preferences
  if (getCookie("color") != "") {
    color = getCookie("color");
  }
  document.getElementById("colors").value = color;
  if (getCookie("ptSize") != "") {
    ptSize = getCookie("ptSize");
  }
  document.getElementById("pts").value = ptSize;

  // binding mouseclick event (for adding new dots)
  $("#scene").click(function(e) {
    var parentPosition = getPosition(e.currentTarget);
    var mouseX = (e.clientX - parentPosition.x)/iMult;
    var mouseY = (e.clientY - parentPosition.y)/iMult;

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
        Math.pow(circles[i].y - mouseY, 2), 1/2) < ptSize/iMult) {
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

  $("#scene").dblclick(function(e) {
    e.preventDefault();  //cancel system double-click event
  });

  setInterval(drawScene, 30); // loop drawScene
});
