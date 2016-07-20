var iWidth = 700;
var iHeight = 1000;
var iMult = 1;
var imageObj;

var canvas, ctx;
var nowCounting = "full";
var wasCounting = "full";
var fullCt = 0;
var partialCt = 0;
var emptyCt = 0;

var circles = [];

var DELAY = 300, clicks = 0, timer = null;

// -------------------------------------------------------------
// objects :

function Circle(x, y, radius, type) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.type = type;
}

// -------------------------------------------------------------
// drawing functions

// draw circles on the canvas
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

// clear canvas function
function clear() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(imageObj, 1, 1, iWidth, iHeight);
}


// draw the whole scene
function drawScene() {
  for (var i=0; i<circles.length; i++) {
    drawCircle(ctx, circles[i].x, circles[i].y, circles[i].radius, circles[i].type);
  }

  document.getElementById('fullCt').innerHTML = fullCt;
  document.getElementById('partialCt').innerHTML = partialCt;
  document.getElementById('emptyCt').innerHTML = emptyCt;
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

// -------------------------------------------------------------
// not used (but could be useful) functions

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
  var csvContent = "data:text/csv;charset=utf-8,x,y,type\n";
  circles.forEach(function(circ, index) {
    csvContent += circ.x + "," + circ.y + "," + circ.type + "\n";
  })
  // var encodedUri = encodeURI(csvContent);
  // window.open(encodedUri);
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  var fileNameList = getParameterByName("img").split("/");
  var fileName = fileNameList[fileNameList.length-1];
  fileName = fileName.replace(".jpg", "");
  link.setAttribute("download", fileName+".csv");
  document.body.appendChild(link); // Required for FF

  link.click(); // This will download the data file named "my_data.csv".
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
// initialization

$(function(){
  //document.getElementById("nowCount").innerHTML = nowCounting;
  canvas = document.getElementById('scene');
  canvas.style.cursor = 'url(cursors/full-pointer.cur), auto';
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
      circles.push(new Circle(mouseX, mouseY, 4, nowCounting))
      wasCounting = nowCounting;

      timer = setTimeout(function() {
        if (wasCounting == "full") {
          fullCt++;
        } else if (wasCounting == "partial") {
          partialCt++;
        } else if (wasCounting == "empty") {
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

      if (wasCounting == "full") {
        fullCt++;
      } else if (wasCounting == "partial") {
        partialCt++;
      } else if (wasCounting == "empty") {
        emptyCt++;
      }

      for (var i=0; i<circles.length; i++) {
        if (Math.pow(Math.pow(circles[i].x - mouseX, 2) +
        Math.pow(circles[i].y - mouseY, 2), 1/2) < 7) {
          if (circles[i].type == "full") {
            fullCt--;
          } else if (circles[i].type == "partial") {
            partialCt--;
          } else if (circles[i].type == "empty") {
            emptyCt--;
          }
          circles.splice(i, 1);
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
