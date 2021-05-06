
let scale = 2;
let namesOn = true;


/* ======================================

                 Objects
    
   ======================================*/
class Spring{
  constructor(a1,a2,k,l){
    this.a1 = a1;
    this.a2 = a2;
    a1.connList.push(this);
    a2.connList.push(this);
    this.k = k;
    this.l = l;
    springList.push(this);
  }
  
  draw(){
    //draw line
    let p1 = this.a1.p;
    let p2 = this.a2.p;
    stroke('black');
    strokeWeight(2*scale);
    line(p1.x,p1.y,p2.x,p2.y);
    //draw cross
    stroke('orange');
    strokeWeight(5*scale);
    let angle = this.getAngle();
    let intersections = 10;
    for(let i = 1; i<intersections; i++){
      let dx = (p2.x - p1.x)/intersections;
      let dy = (p2.y - p1.y)/intersections;
      point(p1.x+dx*i,p1.y+dy*i);
    }
    //draw endpoints
    stroke('red');
    strokeWeight(1*scale);
    point(p1.x,p1.y);
    point(p2.x,p2.y);
    strokeWeight(3*scale);
    let c = this.centerOfSpring();
    point(c.x,c.y);
  }
  
  length(){
    let p1 = this.a1.p;
    let p2 = this.a2.p;
    let tmp = p5.Vector.sub(p1,p2);
    return p5.Vector.mag(tmp);
  }
  
  getForce(a){
    let c = this.centerOfSpring();
    let p = a.p;
    let fd = createVector(c.x-p.x, c.y-p.y);
    fd.normalize();
    let f = this.k*(this.length()-this.l);
    fd.mult(f);
    return fd;
  }
  
  centerOfSpring(){
    let p1 = this.a1.p;
    let p2 = this.a2.p;
    return createVector((p1.x+p2.x)/2,(p1.y+p2.y)/2);
  }
  
  getAngle(){
    let p1 = this.a1.p;
    let p2 = this.a2.p;
    let dx = p1.x-p2.x;
    let dy = p1.y-p2.y;
    return atan2(dy,dx);
  }
  
  setP1(p1){
    this.p1 = p1;
  }
  
  setP2(p2){
    this.p2 = p2;
  }
  
  set(k,s){
    if(s==="stiff")
      this.k = k
  }
}

class Damper{
  constructor(a1,a2,d){
    this.a1 = a1;
    this.a2 = a2;
    a1.connList.push(this);
    a2.connList.push(this);
    this.d = d;
    springList.push(this);
  }
  
  draw(){
    //draw line
    let p1 = this.a1.p;
    let p2 = this.a2.p;
    stroke(50);
    strokeWeight(7*scale);
    line(p1.x,p1.y,p2.x,p2.y);
    stroke(220);
    strokeWeight(6.5*scale);
    line(p1.x,p1.y,p2.x,p2.y);
  }
  
  length(){
    let p1 = this.a1.p;
    let p2 = this.a2.p;
    let tmp = p5.Vector.sub(p1,p2);
    return p5.Vector.mag(tmp);
  }
  
  getForce(a){
    let f = p5.Vector.mult(a.v,-this.d);
    return f;
  }
  
  centerOfDamper(){
    let p1 = this.a1.p;
    let p2 = this.a2.p;
    return createVector((p1.x+p2.x)/2,(p1.y+p2.y)/2);
  }
  
  set(d,s){
    if(s==="damp")
      this.d = d
  }
}


class GravityForce{
  constructor(a,g=9.81){
    this.g = g;
    a.connList.push(this);
  }
  
  getForce(a){
    return createVector(0, a.m*this.g);
  }
}

class MassPoint{
  constructor(p,m,name){
    this.p = createVector(p[0],p[1]);
    this.v = createVector(0,0);
    this.m = m;
    this.F = createVector(0,0);
    this.name = name;
    this.selected = false;
    pointList.push(this);
    this.connList = []; // This will be set in the Spring constructor
  }
  
  draw(){    
    let p = this.p;
    let F = p5.Vector.mult(this.v,scale);
    drawArrow(p,F,"lightgreen");
    if(namesOn){
      strokeWeight(0);
      text(this.name,this.p.x+24,this.p.y+3);
    }
    
    stroke(this.m*2+140,this.m*2-140,0);
    if(this.m<20)
      strokeWeight(scale*this.m+4);
    else
      strokeWeight(scale*20+4);
    point(this.p.x,this.p.y);
  }
  
  set(p){
    this.p = p;
  }
  
  pointUpdateForce(){
   if(!this.selected)
   for(let i = 0; i < this.connList.length; i++){
     let conn = this.connList[i];
     let F = conn.getForce(this); 
     this.F.add(F);
   }
  }
  
  pointApplyForce(){
    this.F.mult(dt);
    this.v.add(this.F);
    this.p.add(this.v);
    //this.v.mult(0.90);
  }
  
  pointResetForce(){
    this.v = createVector(0,0);
    this.F = createVector(0,0);
  }
}


class Slider{
  constructor(getFunc, setFunc, low, high, steps, name,x,y,length){
    this.setFunc = setFunc;
    this.low = low;
    this.high = high;
    this.steps = steps;
    this.name = name;
    this.hovered = false;
    this.get = getFunc;
    this.set = setFunc;
    this.internalStep = steps/2;
    this.x = x;
    this.y = y;
    this.length = length;
    this.clicked = false;
  }
  
  processInput(){
    let x = this.x;
    let y = this.y;
    let length = this.length;
    let mv = createVector(mouseX, mouseY);
    let v = createVector(x+this.internalStep/this.steps*length*scale,y);
    let distance = mv.dist(v);
    if(distance < 5*scale){
      this.hovered = true;
    }else{
      this.hovered = false;
    }
    if(!this.clicked){
    if(this.hovered){
      if(mouseIsPressed){
        this.clicked=true;
      }
    }
    }else{
      let newx = (mouseX-x)/(length*scale);
      newx = floor(newx*this.steps);
        if(newx<this.internalStep){
          this.internalStep += newx-this.internalStep;
        }else if(newx > this.internalStep){
          this.internalStep += newx-this.internalStep;
        }
      if(this.internalStep < 0){
        this.internalStep = 0;
      }
      if(this.internalStep > this.steps){
        this.internalStep = this.steps;
      }
      
      let newval = (this.internalStep*this.high/this.steps)+this.low;
      this.set(newval);
      
      if(!mouseIsPressed){
        this.clicked=false;
      }
      
      updateValues();
    }
    
  }
  
  draw(){
    let x = this.x;
    let y = this.y;
    let length = this.length
    stroke("black")
    strokeWeight(10*scale);
    line(x,y,x+length*scale,y);
    stroke("white")
    strokeWeight(8*scale);
    line(x,y,x+length*scale,y);
    if(this.hovered)
      stroke('lightgreen');
    else
      stroke('darkred')
    let v = this.internalStep/this.steps*length;
    circle(x+v*scale,y,1);
    strokeWeight(0);
    color(0);
    text(str(this.get())+" "+this.name,x+(length+10)*scale,y+2*scale);
  }
}

/* ======================================

           Function Definition
    
   ======================================*/
function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3*scale);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 7;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}

/* ======================================

              Global Variables
    
   ======================================*/
let s;
let a1;
let a2;
let a3;
let pointList;
let springList;
let dt= 0.01;
let stiffness = 5;
let dampening = 5;
let slowmo = 0.05;
let dtSlider = new Slider(()=>dt,(v)=>dt=v,0.001,0.1,100,"dt",20,20*scale,200);
dtSlider.internalStep=10;
let stiffSlider = new Slider(()=>stiffness,(v)=>stiffness=v,0.1,10,500,"Stiffness",20,40*scale,200);
stiffSlider.internalStep=250;
let dampSlider = new Slider(()=>dampening,(v)=>dampening=v,0,10,100,"Damping",20,60*scale,200);
dampSlider.internalStep=50;
function updateValues(){
  for(let i = 0; i < springList.length; i++){
    springList[i].set(stiffness,"stiff");
    springList[i].set(dampening,"damp");
  }
}

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.mouseWheel(mouseWheelRolled);
  springList = []
  pointList = []
  a1 = new MassPoint([windowWidth/2,windowHeight/2-200],5,"a1");
  a2 = new MassPoint([windowWidth/2,windowHeight/2-50],15,"a2");
  a3 = new MassPoint([windowWidth/2,windowHeight/2],15,"a3");
  
  d1 = new Damper(a1,a2,dampening);
  d2 = new Damper(a2,a3,dampening);
  s = new Spring(a1,a2,stiffness, 100);
  s2 = new Spring(a2,a3,stiffness, 100);
  new GravityForce(a2);
  new GravityForce(a3);
  
  print(a2.connList)
  print(a3.connList)
  a1.connList = [];
}

function mouseWheelRolled(event) {
  for(let i = 0; i < pointList.length; i++){
    let a = pointList[i];
    let mv = createVector(mouseX,mouseY);
    if(mv.dist(a.p)<a.m*scale){
      if (event.deltaY > 0) {
        a.m +=1;
      } else {
        if(a.m>1)
          a.m -=1;
      }
    }
  }
  
}

function resetAll(){
  for(let i = 0; i < pointList.length; i++){
    let a = pointList[i];
    a.pointResetForce();
    a.pointResetForce();
  }
}

let holded = undefined;
function processInput(){
  if (holded === undefined){
    for(let i = 0; i < pointList.length; i++){
      let a = pointList[i];
      let mv = createVector(mouseX,mouseY);
      if(p5.Vector.mag(p5.Vector.sub(mv,a.p))<40){
        stroke('red');
        strokeWeight(2);
        circle(a.p.x,a.p.y,40);
        if(mouseIsPressed){
          
          a.selected = true;
          a.pointResetForce();
          a.p = mv;
          holded = a;
        }
      }
    }
  }else{
    let mv = createVector(mouseX,mouseY);
    holded.p = mv;
    holded.pointResetForce();
  }
  
  dtSlider.processInput();
  stiffSlider.processInput();
  dampSlider.processInput();
}

function mouseReleased(){
  if(holded!==undefined)
    holded.selected = false;
  holded = undefined;
}

function processPhysics(){
  for(let i = 0; i < pointList.length; i++){
    pointList[i].F = createVector(0, 0);
  }
  
  for(let i = 0; i < pointList.length; i++){
    pointList[i].pointUpdateForce();
  }
}


function applyPhysics(){
  for(let i = 0; i < pointList.length; i++){
    let a = pointList[i];
    a.pointApplyForce();
  }
}

function paintObjects(){
  for(let i = 0; i < springList.length; i++){
    springList[i].draw();
  }
  for(let i = 0; i < pointList.length; i++){
    pointList[i].draw();
  }
  
  dtSlider.draw();
  stiffSlider.draw();
  dampSlider.draw();
}

function draw() {
  background(255);
  processInput();
  for(let i=0; i <= 4; i+=dt){
    processPhysics();
  }
  applyPhysics();
  paintObjects();
}
