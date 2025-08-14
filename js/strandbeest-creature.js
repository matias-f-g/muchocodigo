let bug;

function setup() {
  createCanvas(750, 600);
  angleMode(DEGREES);
  bug = new Bug(width/2, height/2);
}

function draw() {
  background(255);
  bug.update();
  bug.show();
}

function keyPressed() {
  if (key === 'd') {
    bug.acceleration.x += 0.5;
  } else if (key === 'a') {
    bug.acceleration.x -= 0.5;
  }
}

class Bug {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = 30;
    this.leg1 = new Leg(60, 0, 0, 0, 1);
    this.leg2 = new Leg(-60, 0, 0, 5, 1);
  }
  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }
  update() {
    let gravity = createVector(0, 0.1);
    let bugG = p5.Vector.mult(gravity, this.mass);
    this.applyForce(bugG);
    
    this.velocity.add(this.acceleration);
    this.velocity.limit(2);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.velocity.mult(0.99);
    
    this.checkEdges();
  }
  show () {
    push();
      translate(this.position.x, this.position.y);
      fill(200, 170, 10);
      arc(-30, 0, 360, 260, 180, 0, CHORD);
      fill(200, 180, 150);
      ellipse(this.leg2.position.x - 90, this.leg2.position.y - 90, 20, 15);
      fill(0);
      ellipse(this.leg2.position.x - 95, this.leg2.position.y - 90, 10, 12);
      let legAcceleration = constrain(this.velocity.x, -1, 1);
      this.leg1.upShow(legAcceleration);
      this.leg2.upShow(legAcceleration);
    pop();
  }
  checkEdges() {
    let bounce = -0.6;
    let alto = 90;
    if (this.position.y > height - alto) {
      this.position.y = height - alto;
      this.velocity.y *= bounce;
  }
    if (this.position.x > width - this.radius) {
      this.position.x = width - this.radius;
      this.velocity.x *= bounce;
  } else if (this.position.x < 0 + this.radius) {
      this.position.x = 0 + this.radius;
      this.velocity.x *= bounce;
  }
  }
}

class Leg {
  constructor(x, y, dir, sAn, big) {
    this.big = big;
    this.position = createVector(x, y);
    this.angle = dir;
    this.angleRef = [220, 160, 130, 62, 90, 246, 151, 158, 128, 64];
    this.m = new Rotor(0, -(7 * this.big), 15 * this.big, sAn * 24);
    this.b = new Bone(-(38 * this.big), 0, 41.5 * this.big);
    this.d = new Bone(-(38 * this.big), 0, 40.1 * this.big);
    this.c = new Bone(-(38 * this.big), 0, 39.3 * this.big);
    this.j = new Part(this.m.endPos.x, this.m.endPos.y, 50 * this.big, this.angleRef[0 + sAn]);
    this.e = new Part(this.j.endPos.x, this.j.endPos.y, 55.8 * this.big, this.angleRef[1 + sAn]);
    this.k = new Part(this.m.endPos.x, this.m.endPos.y, 61.9 * this.big, this.angleRef[2 + sAn]);
    this.f = new Part(this.e.endPos.x, this.e.endPos.y, 39.4 * this.big, this.angleRef[3 + sAn]);
    this.h = new Part(this.f.endPos.x, this.f.endPos.y, 65.7 * this.big, this.angleRef[4 + sAn]);
    this.i = new Bone(this.k.endPos.x, this.k.endPos.y, 49 * this.big);
    this.g = new Bone(this.k.endPos.x, this.k.endPos.y, 36.7 * this.big);
  }
  upShow (nAngle) {
    push();
      translate(this.position.x, this.position.y);
      rotate(this.angle);
      this.m.update(nAngle);
      this.m.show();
      this.j.update(this.m.endPos.x, this.m.endPos.y, this.b.origin.x, this.b.origin.y, this.b.len, 1);
      this.j.show();
      this.b.update(this.b.origin.x, this.b.origin.y, this.j.endPos.x, this.j.endPos.y);
      this.b.show();
      this.e.update(this.j.endPos.x, this.j.endPos.y, this.b.origin.x, this.b.origin.y, this.d.len, 1);
      this.e.show();    
      this.d.update(this.d.origin.x, this.d.origin.y, this.e.endPos.x, this.e.endPos.y);
      this.d.show();
      this.k.update(this.m.endPos.x, this.m.endPos.y, this.b.origin.x, this.b.origin.y, this.c.len, -1);
      this.k.show();
      this.c.update(this.c.origin.x, this.c.origin.y, this.k.endPos.x, this.k.endPos.y);
      this.c.show();
      this.f.update(this.e.endPos.x, this.e.endPos.y, this.k.endPos.x, this.k.endPos.y, this.g.len, 1);
      this.f.show();
      this.g.update(this.f.endPos.x, this.f.endPos.y, this.k.endPos.x, this.k.endPos.y);
      this.g.show();
      this.h.update(this.f.endPos.x, this.f.endPos.y, this.k.endPos.x, this.k.endPos.y, this.i.len, 1);
      this.h.show();
      this.g.update(this.k.endPos.x, this.k.endPos.y, this.h.endPos.x, this.h.endPos.y);
      this.g.show();
      line(this.m.origin.x, this.m.origin.y, this.b.origin.x, this.b.origin.y);
    pop();
  }
}

class Bone {
  constructor(x, y, len) {
    this.origin = createVector(x, y);
    this.endPos = createVector(0, 0);
    this.len = len;
  }
  update(ox, oy, ex, ey) {
    this.origin = createVector(ox, oy);
    this.endPos = createVector(ex, ey);
  }
  show() {
    circle(this.origin.x, this.origin.y, 5);
    circle(this.endPos.x, this.endPos.y, 5);
    line(this.origin.x, this.origin.y, this.endPos.x, this.endPos.y);
  }
}

class Part {
  constructor(x, y, len, ang) {
    this.origin = createVector(x, y);
    this.endPos = this.origin.copy();
    this.endPos.setHeading(this.angle);
    this.endPos.setMag(this.len);
    this.len = len;
    this.angleVelocity = 0;
    this.angle = ang;
  }
  update(fx, fy, dx, dy, fixDist, upDown) {
    this.origin = createVector(fx, fy);
    this.endPos = this.origin.copy();
    this.endPos.setHeading(this.angle);
    this.endPos.setMag(this.len);
    let tempPos = p5.Vector.add(this.endPos, this.origin);
    let i = 0;
    if (dist(dx, dy, tempPos.x, tempPos.y) > fixDist ) {
      while (dist(dx, dy, tempPos.x, tempPos.y) > fixDist && i < 9000) { 
        this.angle -= (0.001 * upDown);
        this.origin = createVector(fx, fy);
        this.endPos = this.origin.copy();
        this.endPos.setHeading(this.angle);
        this.endPos.setMag(this.len);
        tempPos = p5.Vector.add(this.endPos, this.origin);
        i++;
      }
    } else {
      while (dist(dx, dy, tempPos.x, tempPos.y) < fixDist && i < 9000) { 
        this.angle += (0.001 * upDown);
        this.origin = createVector(fx, fy);
        this.endPos = this.origin.copy();
        this.endPos.setHeading(this.angle);
        this.endPos.setMag(this.len);
        tempPos = p5.Vector.add(this.endPos, this.origin);
        i++
      }
    }
  }
  show() {
    circle(this.origin.x, this.origin.y, 5);
    this.endPos.add(this.origin);
    circle(this.endPos.x, this.endPos.y, 5);
    line(this.origin.x, this.origin.y, this.endPos.x, this.endPos.y);
  }
}

class Rotor {
  constructor(x, y, len, iniAng) {
    this.origin = createVector(x, y);
    this.endPos = this.origin.copy();
    this.endPos.setHeading(this.angle);
    this.endPos.setMag(this.len);
    this.len = len;
    this.angle = iniAng;
    this.angleAcceleration = 0;
    this.angleVelocity = 0;
  }
  update(newAngle) {
    this.angleAcceleration = newAngle;
    this.angleVelocity += this.angleAcceleration;
    if (this.angleVelocity > 2 ) {
      this.angleVelocity = 2; 
    } else if (this.angleVelocity < -2 ) {
      this.angleVelocity = -2;
    }
    this.angle += this.angleVelocity;
    this.angleAcceleration = 0;
    this.angleVelocity *= 0.9;
    
    this.endPos = this.origin.copy();
    this.endPos.setHeading(this.angle);
    this.endPos.setMag(this.len);
  }
  show() {
    circle(this.origin.x, this.origin.y, 14);
    this.endPos.add(this.origin);
    circle(this.endPos.x, this.endPos.y, 5);
    line(this.origin.x, this.origin.y, this.endPos.x, this.endPos.y);
  }
}
