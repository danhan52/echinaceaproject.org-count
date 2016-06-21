var iWidth = 700;
var iHeight = 1000;
var iMult = 1;
var whichImage = 0;
var whereImage = "http://echinaceaproject.org/count/xrayPosition/images/";
var imageObj;

var canvas, ctx;
var nowCounting = "full";
var wasCounting = "full";
var fullCt = [];
var partialCt = [];
var emptyCt = [];

var circles = [];


var DELAY = 300, clicks = 0, timer = null;

// -------------------------------------------------------------
// objects :

function Circle(x, y, radius, type, fromImage) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.type = type;
  this.fromImage = fromImage;
}

// -------------------------------------------------------------
// drawing functions

// draw circles[whichImage] on the canvas
function drawCircle(ctx, x, y, radius, type) {
  if (type == "full") {
    ctx.fillStyle = 'rgba(3, 179, 0, 1.0)';
  } else if (type == "partial") {
    ctx.fillStyle = 'rgba(181, 91, 0, 1.0)';
  }  else if (type == "empty") {
    ctx.fillStyle = 'rgba(173, 0, 179, 1.0)';
  }

  ctx.beginPath();
  ctx.arc(x*iMult, y*iMult, radius/iMult, 0, Math.PI*2, true);
  ctx.stroke();
  ctx.fill();
}

function clear() { // clear canvas function
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(imageObj, 1, 1, iWidth, iHeight);
}


// draw the whole scene
function drawScene() {
  for (var i=0; i<circles[whichImage].length; i++) {
    drawCircle(ctx, circles[whichImage][i].x, circles[whichImage][i].y, circles[whichImage][i].radius, circles[whichImage][i].type);
  }

  document.getElementById('fullCt').innerHTML = fullCt[whichImage];
  document.getElementById('partialCt').innerHTML = partialCt[whichImage];
  document.getElementById('emptyCt').innerHTML = emptyCt[whichImage];
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

// -------------------------------------------------------------
// other helper functions

// switch from one type of counting (e.g. full) to another
function switchCount() {
  if (nowCounting == "full") {
    nowCounting = "partial";
    document.getElementById("nowCount").innerHTML = "Now counting:" +
    "<br><span id='partial'>PARTIAL</span>";
    canvas.style.cursor = 'url(cursors/partial-pointer.cur), auto';
  } else if (nowCounting == "partial") {
    nowCounting = "empty";
    document.getElementById("nowCount").innerHTML = "Now counting:" +
    "<br><span id='empty'>EMPTY</span>";
    canvas.style.cursor = 'url(cursors/empty-pointer.cur), auto';
  } else if (nowCounting == "empty") {
    nowCounting = "full";
    document.getElementById("nowCount").innerHTML = "Now counting:" +
    "<br><span id='full'>FULL</span>";
    canvas.style.cursor = 'url(cursors/full-pointer.cur), auto';
  }
}

// create a csv for download
function makecsv() {
  var csvContent = "data:text/csv;charset=utf-8,x,y,type,image\n";
  for (var i=0; i<20; i++) {
    if (circles[i].length > 0) {
      for (var j=0; j<circles[i].length; j++) {
          csvContent += circles[i][j].x + "," + circles[i][j].y + "," + circles[i][j].type + "," + circles[i][j].fromImage + "\n";
      }
    }
  }

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "countData.csv");
  document.body.appendChild(link); // Required for FF

  link.click(); // This will download the data file
}

function switchImage() {
  whichImage = document.getElementById("images").value - 1;
  imageObj.src = whereImage + (whichImage+1) + ".jpg";
  clear();
  drawScene();
}

// -------------------------------------------------------------
// initialization

$(function(){
  for (var i = 0; i < 20; i++) {
    circles.push([]);
    fullCt.push(0);
    partialCt.push(0);
    emptyCt.push(0);
  }

  canvas = document.getElementById('scene');
  ctx = canvas.getContext('2d');
  canvas.style.cursor = 'url(cursors/full-pointer.cur), auto';
  imageObj = new Image();
  imageObj.src = whereImage + whichImage + ".jpg";
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
      circles[whichImage].push(new Circle(mouseX, mouseY, 4, nowCounting, whichImage))
      wasCounting = nowCounting;

      timer = setTimeout(function() {
        if (wasCounting == "full") {
          fullCt[whichImage]++;
        } else if (wasCounting == "partial") {
          partialCt[whichImage]++;
        } else if (wasCounting == "empty") {
          emptyCt[whichImage]++;
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

      if (wasCounting == "full") {
        fullCt[whichImage]++;
      } else if (wasCounting == "partial") {
        partialCt[whichImage]++;
      } else if (wasCounting == "empty") {
        emptyCt[whichImage]++;
      }

      for (var i=0; i<circles[whichImage].length; i++) {
        if (Math.pow(Math.pow(circles[whichImage][i].x - mouseX, 2) +
        Math.pow(circles[whichImage][i].y - mouseY, 2), 1/2) < 7) {
          if (circles[whichImage][i].type == "full") {
            fullCt[whichImage]--;
          } else if (circles[whichImage][i].type == "partial") {
            partialCt[whichImage]--;
          } else if (circles[whichImage][i].type == "empty") {
            emptyCt[whichImage]--;
          }
          circles[whichImage].splice(i, 1);
          i -= 1;
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
