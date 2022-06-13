/**
 * 
 * @param {Object} (optional) position, velocity, diameter properties
 */
function Cell({position, velocity, diameter, life, type }) {


  //--------------------------------------------------------
  //--Begin internal class variables------------------------
  //--------------------------------------------------------

  // set the position if it's passed in
  // handle position
  if (position === undefined) { // if it wasn't passed in
    // create default vector
    this._position = createVector(0, 0, 0);
  } else this._position = position; // use object property passed in

  //handle velocity
  if (velocity === undefined) {
    //create default velocity
    this._velocity = createVector(0, 0, 0);
  } else this._velocity = velocity;

  //handle diameter
  if (diameter === undefined) {
    //deafult diameter
    this._diameter = 20;
  } else this._diameter = diameter;


  //handles life
  if (life === undefined) {
    //default life
    this._life = 100;
  } else this._life = life;

  //handles type
  if(type === undefined) {
    //default type
    this._type = "Cell";
  } else {
    this._type = type;
  }


  // current instantaneous acceleration
  this._acceleration = createVector(0, 0, 0);


  //---------------------------------------------------
  //--Begin class functions----------------------------
  //---------------------------------------------------
  /**
   * 
   * @param {p5.Vector, Array, or Number} force Force (3D) to apply to this object.
   */
  this.applyForce = function (force) {


    if (force !== undefined) {
      this._acceleration.add(force);
    }
  }


  /**
   * Internal use only. Apply current acceleration.
   */
  this._accelerate = function () {

    this._velocity.add(this._acceleration);
    this._acceleration.mult(0); // remove acceleration
  }

  /**
   * This function actually updates the position by accelerating and applying the velocity.
   */
  this.update = function () {

    //call internal accelerate function to apply acceleration
    this._accelerate();

    //add the velocity to the position to "move" the cell
    this._position.add(this._velocity);

    this._life--;

  }


  //------------ setter and getter functions go here! ----------

  // Add set/get functions for diameter, velocity below based on the example:

  /**
   * Set position safely.
   */
  this.setPosition = function (position) {
    this._position = position;
  }
  /**
   * Get position safely.
   */

  this.getPosition = function () {
    return this._position;
  }

  //set velocity safely
  this.setVelocity = function (velocity) {
    this._velocity = velocity;
  }
  //get velocity safely
  this.getVelocity = function () {
    return this._velocity;
  }

  //set diameter safely
  this.setDiameter = function (diameter) {
    this._diameter = diameter;
  }
  //get diameter safely
  this.getDiameter = function () {
    return this._diameter;
  }

  //set life safely
  this.setLife = function (life) {
    this._life = life;
  }
  //get life
  this.getLife = function () {
    return this._life;
  }

  //set cell type
  this.setType = function (type) {
    this._type = type;
  }
  //get cell type
  this.getType = function () {
    return this._type;
  }

  /**
   * ------------------------------------------------------------------ 
   * This function takes a Vector representing the centre coordinate 
   * of the sphere world (worldCenterPos) and the diameter of the sphere.
   * It should make sure that this cell's position (taking into account diameter)
   * is inside that sphere world. This function will reverse the direction of the velocity of 
   * the cell when it moves outside the boundaries of the sphere container.
   * It will also move the cell's position to completely back inside the 
   * sphere container to make sure it doesn't get stuck in the border.
   * This is a pretty simple example - a real one would reflect the cell across
   * the sphere surface according to the angle of impact. 

   * @param {p5.Vector} worldCenterPos centre coordinate of world as a p5.Vector
   * @param {Number} worldDiameter diameter of world as a number
   */
  this.constrainToSphere = function (worldCenterPos, worldDiameter) {
    if (this._position.dist(worldCenterPos) > worldDiameter / 2) {
      // find point on world sphere in direction of (this._position - worldCenterPos)
      let positionDirection = p5.Vector.sub(this._position, worldCenterPos).normalize();

      // new magnitude is inside world sphere accounting for this cell's radius 
      let newMagnitude = worldDiameter / 2 - this._diameter;
      this._position = p5.Vector.mult(positionDirection, newMagnitude); // position is magnitude * direction 

      this._velocity = positionDirection.mult(-this._velocity.mag() * 0.5); // opposite direction, slower!

      // this also is interesting and more realistic
      // this.applyForce(positionDirection.mult(-1.2*this._velocity.mag())); // opposite direction, slower!
    }
  }
  //---------------------------------------------------------------


  //---------------------------------------------------------------
  //--End class functions------------------------------------------
  //---------------------------------------------------------------
}