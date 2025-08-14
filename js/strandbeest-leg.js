let leg;
let amp = 3;

function setup() {
  createCanvas(750, 600);
  angleMode(DEGREES);
  leg = new Leg(width/2, height/2, 0);
}

function draw() {
  background(230);
  leg.show();
}

class Leg {
  constructor(x, y, dir) {
    this.position = createVector(x, y);
    this.angle = dir;
    this.m = new Rotor(0, -(7 * amp), 15 * amp);
    this.b = new Bone(-(38 * amp), 0, 41.5 * amp);
    this.d = new Bone(-(38 * amp), 0, 40.1 * amp);
    this.c = new Bone(-(38 * amp), 0, 39.3 * amp);
    this.j = new Part(0, 0, 50 * amp, 220);
    this.e = new Part(this.j.endPos.x, this.j.endPos.y, 55.8 * amp, 180);
    this.k = new Part(0, 0, 61.9 * amp, 130);
    this.f = new Part(this.e.endPos.x, this.e.endPos.y, 39.4 * amp, 90);
    this.h = new Part(this.f.endPos.x, this.f.endPos.y, 65.7 * amp, 90);
    this.i = new Bone(this.k.endPos.x, this.k.endPos.y, 49 * amp);
    this.g = new Bone(this.k.endPos.x, this.k.endPos.y, 36.7 * amp);
  }
  update(x, y, dir) {
    this.position = createVector(x, y);
    this.angle = dir;
  }
  show () {
    push();
      translate(this.position.x, this.position.y);
      rotate(this.angle);
      this.m.update();
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
  constructor(x, y, len) {
    this.origin = createVector(x, y);
    this.endPos = this.origin.copy();
    this.endPos.setHeading(this.angle);
    this.endPos.setMag(this.len);
    this.len = len;
    this.angleVelocity = -1;
    this.angle = 0;
  }
  update() {
    this.angle += this.angleVelocity;
    this.endPos = this.origin.copy();
    this.endPos.setHeading(this.angle);
    this.endPos.setMag(this.len);
  }
  show() {
    circle(this.origin.x, this.origin.y, 10);
    this.endPos.add(this.origin);
    circle(this.endPos.x, this.endPos.y, 5);
    line(this.origin.x, this.origin.y, this.endPos.x, this.endPos.y);
  }
}
