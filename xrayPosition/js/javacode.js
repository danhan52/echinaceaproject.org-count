var iWidth = 700;
var iHeight = 1000;
var iMult = 1;
var imageObj;

var canvas, ctx;
var nowCounting = "full";
var full = [];
var fullCt = 0;
var partial = [];
var partialCt = 0;
var empty = [];
var emptyCt = 0;

var DELAY = 300, clicks = 0, timer = null;

// -------------------------------------------------------------
// objects :

function Circle(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;
}

// -------------------------------------------------------------
// drawing functions

// draw circles on the canvas
function drawCircle(ctx, x, y, type) {
  if (type == "f") {
    ctx.fillStyle = 'rgba(35, 255, 55, 1.0)';
  } else if (type == "p") {
    ctx.fillStyle = 'rgba(55, 35, 255, 1.0)';
  }  else if (type == "e") {
    ctx.fillStyle = 'rgba(255, 35, 35, 1.0)';
  }

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
  for (var i=0; i<full.length; i++) { // display all our circles
    drawCircle(ctx, full[i].x, full[i].y, "f");
  }
  for (var i=0; i<partial.length; i++) { // display all our circles
    drawCircle(ctx, partial[i].x, partial[i].y, "p");
  }
  for (var i=0; i<empty.length; i++) { // display all our circles
    drawCircle(ctx, empty[i].x, empty[i].y, "e");
  }

  document.getElementById('fullCt').innerHTML = full.length;
  document.getElementById('partialCt').innerHTML = partial.length;
  document.getElementById('emptyCt').innerHTML = empty.length;
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

function switchCount() {
  if (nowCounting == "full") {
    nowCounting = "partial";
    document.getElementById("nowCount").innerHTML = "Now counting:" +
      "<br><span id='partial'>PARTIAL</span>";
  } else if (nowCounting == "partial") {
    nowCounting = "empty";
    document.getElementById("nowCount").innerHTML = "Now counting:" +
      "<br><span id='empty'>EMPTY</span>";
  } else if (nowCounting == "empty") {
    nowCounting = "full";
    document.getElementById("nowCount").innerHTML = "Now counting:" +
      "<br><span id='full'>FULL</span>";
  }
}

// -------------------------------------------------------------
// initialization

$(function(){
  //document.getElementById("nowCount").innerHTML = nowCounting;
  canvas = document.getElementById('scene');
  ctx = canvas.getContext('2d');
  imageObj = new Image();
  imageObj.src = getParameterByName("img");
  imageObj.onload = function() {
    ctx.drawImage(imageObj, 1, 1, iWidth, iHeight);
  };

  $(document).keypress(function (e) {
    if (e.which == 115) {
      switchCount();
    }
  })

  // binding mouseclick event (for adding new dots)
  $('#scene').click(function(e) {

    var parentPosition = getPosition(e.currentTarget);
    var mouseX = (e.clientX - parentPosition.x)/Math.pow(iMult,2);
    var mouseY = (e.clientY - parentPosition.y)/Math.pow(iMult,2);

    clicks++;

    if(clicks == 1) {
      if (nowCounting == "full") {
        full.push(new Circle(mouseX, mouseY));
      } else if (nowCounting == "partial") {
        partial.push(new Circle(mouseX, mouseY));
      } else if (nowCounting == "empty") {
        empty.push(new Circle(mouseX, mouseY));
      }
      timer = setTimeout(function() {
        if (nowCounting == "full") {
          fullCt++;
        } else if (nowCounting == "partial") {
          partialCt++;
        } else if (nowCounting == "empty") {
          emptyCt++;
        }
        clicks = 0;             //after action performed, reset counter
      }, DELAY);
    } else {
      clearTimeout(timer);    //prevent single-click action
      if(document.selection && document.selection.empty) {
        document.selection.empty();
    } else if(window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
    }
      var didit;
      if (full.length > 0) {
        for (var i=0; i<full.length; i++) {
          if (Math.pow(Math.pow(full[i].x - mouseX, 2) +
          Math.pow(full[i].y - mouseY, 2), 1/2) < 7) {
            full.splice(i, 1);
            i -= 1;
          }
        }
      }
      if (partial.length > 0) {
        for (var i=0; i<partial.length; i++) {
          if (Math.pow(Math.pow(partial[i].x - mouseX, 2) +
          Math.pow(partial[i].y - mouseY, 2), 1/2) < 7) {
            partial.splice(i, 1);
            i -= 1;
          }
        }
      }
      if (empty.length > 0) {
        for (var i=0; i<empty.length; i++) {
          if (Math.pow(Math.pow(empty[i].x - mouseX, 2) +
          Math.pow(empty[i].y - mouseY, 2), 1/2) < 7) {
            empty.splice(i, 1);
            i -= 1;
          }
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
  $('#countingBox').dblclick(function(e) {
    e.preventDefault();  //cancel system double-click event
  });

  setInterval(drawScene, 30); // loop drawScene
});
