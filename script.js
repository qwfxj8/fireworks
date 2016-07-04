var WID = 800;
var HEI = 900;
var CENTER_X = WID/2;
var CENTER_Y = HEI/2;
var HALF_WID = WID*0.5;
var HALF_HEI = HEI*0.5;


var canvas = document.getElementById("mycanvas");
canvas.width=WID;
canvas.height=HEI;
var ctx = canvas.getContext('2d');

var GRAVITY = 0.1;
var FRICTION = 0.999;
var SPARK_VEL = 2;
var MIN_SPARKS = 5;
var MAX_SPARKS = 30;
var LAUNCH_VEL_Y = 12;
var LAUNCH_VEL_YVAR = 3;
var LAUNCH_VEL_X = 0.5;
var ACTIVE_TIME_VAR = 19;
var MIN_ACTIVE_TIME = 1;
var VEL_THRESHOLD = 2;
var MARGIN = 100;
var COOLDOWN = 5;

var START_TIME = 40;
var END_TIME = 500;
var RECORD = 0;

if(RECORD)
{
  var capturer = new CCapture( {
      framerate: 30,
      verbose: false,
      format: 'webm',
      //workersPath: '../common/'
  } );
}

function stringifyColor(rgb)
{
  return 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
}

function World()
{
  var stuffs = [];
  this.stuffs = stuffs;
  this.addStuff = function(stuff){
    stuffs.push(stuff);
  };
  this.act = function(){
    var newStuffs = [];
    for(var i = 0; i < stuffs.length; i++){
      if(stuffs[i].act())
      {
        newStuffs.push(stuffs[i]);
      }
    }
    stuffs = newStuffs;
  };
  this.render = function(cx){
    cx.fillStyle = 'rgba(0,0,0,0.1)';
    cx.fillRect(0,0,WID,HEI);
    for(var i = 0; i < stuffs.length; i++){
      stuffs[i].render(cx);
    }
  };
}
var world = new World();

var time = 0;

setInterval(function(){
  time++;
  if(time % 40 == 0){
    
    var color = {'h':Math.random()*1.0,'s':1.0,'v':1.0};
    var atime = Math.floor(Math.random()*ACTIVE_TIME_VAR+MIN_ACTIVE_TIME);
    var spk = new Spark(Math.random()*(WID-2*MARGIN)+MARGIN,HEI,(Math.random()-0.5)*LAUNCH_VEL_X,(Math.random()-0.5)*LAUNCH_VEL_YVAR-LAUNCH_VEL_Y, color, atime);
    world.addStuff(spk);
  }
  
  if(RECORD)
  {
    if(time === START_TIME)
    {
      capturer.start();
    }
    else if(time < END_TIME)
    {
      capturer.capture(canvas);
    }
    else if(time === END_TIME)
    {
      capturer.stop();
      capturer.save();
      RECORD = false;
    }
  }

  world.act();
  world.render(ctx);
}, 30);

function clampRound(x)
{
  while(x<0)
    x+=1;
  while(x>1)
    x-=1;
  return x;
}

function makeSparks(xx,yy,num,vely,hue)
{
  var offset =Math.random()*Math.PI*2;
  for(var i = 0; i < num; i++)
  {
    var angle = i/num*Math.PI*2+offset;
    var color = {'h':clampRound(hue+Math.random()*0.07),'s': Math.random()*0.2+0.8,'v':Math.random()*0.5+0.5};
    world.addStuff(new Spark(xx,yy,Math.cos(angle)*SPARK_VEL, (Math.sin(angle))*SPARK_VEL+vely, color, -1));
  }
}

function randomIntRange(min,max)
{
  return Math.floor(Math.random()*(max-min+1))+min;
}

function Spark(xx,yy,velx,vely,color,activeTime)
{
  var sparkCount = randomIntRange(MIN_SPARKS,MAX_SPARKS);
  var size = 1;
  this.act = function() {
    //if(activeTime < 0)
    {
      vely += GRAVITY;
    }
    velx *= FRICTION;
    vely *= FRICTION;
  
    xx += velx;
    yy += vely;
    
    //if(activeTime === 0)
    //{
    if(activeTime > 0 && vely > -VEL_THRESHOLD)
    {
      activeTime--;
      if(activeTime % COOLDOWN == 0)
      {
        makeSparks(xx,yy,sparkCount,vely,color.h);
      }
      if(activeTime === 0)
      {
        activeTime = -0.5;
      }
    }
    //}
    //if(activeTime >= 0)
    //{
    //  activeTime--;
    //}
    return yy <= HEI + 10;
  };
  this.render = function(cx) {
    if(activeTime !== -0.5)
    {
      var c2 = {'h':color.h,'s':color.s,'v':color.v*(Math.random()*0.5+0.5)};
      cx.fillStyle = stringifyColor(HSVtoRGB(c2));
      cx.fillRect(xx-size, yy-size, size*2,size);
    }
  };
}