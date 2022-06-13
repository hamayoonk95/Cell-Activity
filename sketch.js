/**
 * Cells workshop starter for IS51030B Graphics
 * Create a 3D sphere-shaped container of virtual "cells"
 * 
 * by Hamayoon Khan, 2021 <hkhan010@gold.ac.uk>
 */


//boolean var to begin the animation after user clicks start
let begin_animation = false;

//variables to track cells population
let dead_cells = 0;
let cells_birth = 0;
let med_kills = 0;

//arrays for cells and viruses
let cells = []; // array of cells objects
let viruses = [];

let lasttime = 0;

//variables for dropdown menus to choose type of cells
let shapes_div;
let cellshape_drpdwn;
let virusShape_drpdwn;

//3d model of covid and texture
let covid;
let covid_texture;

//3d model of cancerVirus and texture
let virus;
let virus_texture;

//3d model of red blood cell and texture
let redbloodCell;
let bloodCellTexture;

//texture for cell
let cell_texture;

//variables for medicine model, texture and its positions
let medicine;
let medicine_texture;
let medicine1_pos;
let medicine2_pos;

//Preload function to load 3d models and textures before program starts
function preload() {
  covid = loadModel("assets/Corona.obj", true);
  medicine = loadModel("assets/medicine.obj", true);
  virus = loadModel("assets/virus.obj", true);
  redbloodCell = loadModel("assets/redbloodcell.obj", true);

  cell_texture = loadImage("assets/celltexture.jpg");
  covid_texture = loadImage("assets/covidtexture.jpg");
  medicine_texture = loadImage("assets/medicinetxture.jpg");
  virus_texture = loadImage("assets/virustexture.jpg");
  bloodCellTexture = loadImage("assets/bloodcelltexture.jpg");
}


/**
 * Initialise the cells array with a number of new Cell objects
 * 
 * @param {Integer} maxCells Number of cells for the new array
 * @returns {Array} array of new Cells objects 
 */
function createCellsArray(maxCells) {
  let array = [];
  for (let i = 0; i < maxCells; i++) {
    array.push(new Cell({
      position: p5.Vector.random3D().mult(100),
      velocity: p5.Vector.random3D(),
      diameter: random(20, 40),
      life: random(200, 500),
      type: "Cell"
    }))
  }
  return array;
}

/**
 * Initialise the Viruses array with a number of new Virus objects
 * 
 * @param {Integer} maxCells Number of Virus for the new array
 * @returns {Array} array of new Viruses objects 
 */
function createVirusesArray(maxCells) {
  let array = [];
  for (let i = 0; i < maxCells; i++) {
    array.push(new Cell({
      position: p5.Vector.random3D().mult(100),
      velocity: p5.Vector.random3D(),
      diameter: random(20, 40),
      life: random(500, 1000),
    }))
  }
  return array;
}

/**
 *  draw each of the cells to the screen
 * @param {Array} CellsArray Array of Virus objects to draw 
 */
function drawViruses3D(cellsArray) {

  for (let cell of cellsArray) {
    cell.update();
    cell.setType(virusShape_drpdwn.value())
    switch (cell.getType()) {
      case "Covid":
        push();
        translate(cell._position);
        scale(0.3, 0.3, 0.3);
        rotateX(frameCount * 0.01);
        rotateY(frameCount * 0.01);
        rotateZ(frameCount * 0.01);
        texture(covid_texture);
        model(covid);
        pop();
        break;

      case "Cancer Cells":
        push();
        translate(cell._position);
        scale(0.5, 0.5, 0.5)
        texture(virus_texture);
        model(virus);
        pop();
        break;
    }
  }
}

/**
 *  draw each of the cells to the screen
 * @param {Array} cellsArray Array of Cell objects to draw 
 */
function drawCells3D(cellsArray) {

  //loop through cells array
  for (let cell of cellsArray) {
    //update cell function to apply acceleration to cells
    cell.update();

    //set cell's type to that of dropdown menu value
    cell.setType(cellshape_drpdwn.value())
    //switch statement to draw cells depending on what type is selected
    switch (cell.getType()) {
      case "Cell":
        push();
        translate(cell.getPosition());
        texture(cell_texture);
        sphere(cell.getDiameter());
        pop();
        break;

      case "Red blood cell":
        push();
        translate(cell.getPosition());
        //scale the cells to make them small
        scale(0.3, 0.3, 0.3);
        rotateZ(frameCount * 0.01);
        rotateX(frameCount * 0.01);
        rotateY(frameCount * 0.01)
        texture(bloodCellTexture);
        model(redbloodCell);
        pop();
        break;
    }
  }
}


/**
 * Check collision between two cells or viruses (overlapping positions)
 * @param {Cell} cell1 
 * @param {Cell} cell2 
 * @returns {Boolean} true if collided otherwise false
 */
function checkCollision(cell1, cell2) {
  //finds distance between two cells
  let distance = cell1.getPosition().dist(cell2.getPosition());
  //sum of the radius of two cells
  let radius = cell1.getDiameter() + cell2.getDiameter();
  //if distance is less than radius then return true
  if (distance < radius) {
    return true;
  }
}

/**
 * Collide two cells together
 * @param {Array} cellsArray Array of Cell objects to draw 
 */
 function collideCells(cellsArray) {
  // loop through the arrays
  for (let cell1 of cellsArray) {
    for (let cell2 of cellsArray) {
      if (cell1 !== cell2) // don't collide with itself or *all* cells will bounce!
      {
        if (checkCollision(cell1, cell2)) {
          // get direction of collision, from cell2 to cell1
          let collisionDirection = p5.Vector.sub(cell1.getPosition(), cell2.getPosition()).normalize();
          cell2.applyForce(collisionDirection);
          cell1.applyForce(collisionDirection.mult(-2)); // opposite direction
        }
      }
    }
  }
}

/**
 * Check collision between viruses and medicine
 * @param {Array} cellsArray 
 */
function checkMedicine(cellsArray) {

  for (let cell of cellsArray) {
    //distance between viruses and first medicine object
    let dist1 = cell.getPosition().dist(medicine1_pos);
    //distance between viruses and second medicine object
    let dist2 = cell.getPosition().dist(medicine2_pos);
    //if viruses is close to either of the medicine
    if (dist1 < 80 || dist2 < 80) {
      //remove the virus from array and canvas
      let index = cellsArray.indexOf(cell);
      cellsArray.splice(index, 1);
      //increase the count of deadcells and viruses killed by 1
      med_kills++;
      dead_cells++;
    }
  }
}

/**
 * Check collision between viruses and medicine
 * @param {Array} cellsArray 
 * @param {Array} virusesArray 
 */
function collide_cells_viruses(cellsArray, virusesArray) {
  //loop through viruses array and cells array
  for (let cells of cellsArray) {
    for (let virus of virusesArray) {
      //if the distance of a cell and virus is less than the sum of their radius
      if (cells.getPosition().dist(virus.getPosition()) < cells.getDiameter() + virus.getDiameter()) {
        //reduce the life of cell by 10
        cells._life -= 1;
        //reduce the life of virus by 5
        //NB: Viruses are stronger 
        virus._life -= 0.7;

        //get direction of collision, from virus to cell
        let collisionDirection = p5.Vector.sub(cells.getPosition(), virus.getPosition()).normalize();
        virus.applyForce(collisionDirection.mult(2));
        cells.applyForce(collisionDirection.mult(-3)); // opposite direction
      }
    }
  }
}


/**
 * Constrain cells to sphere world boundaries.
 * @param {Array} cellsArray Array of Cell objects to draw 
 */
function constrainCells(cellsArray, worldCenterPos, worldDiameter) {
  // loop through the array
  for (let cell of cellsArray) {
    //constrain cells to the world
    cell.constrainToSphere(worldCenterPos, worldDiameter);
  }
}

/**
 * Checks cell's life to remove 
 * @param {Array} cellsArray Array of Cell objects to draw
 * 
 */
function handleLife(cellsArray) {
  //loops through cells array
  for (let cell of cellsArray) {
    //check if each cell's life < 1
    if (cell.getLife() < 1) {
      //increase dead cell's count by 1
      dead_cells++;
      //get the index of the cell to remove using splice()
      let index = cellsArray.indexOf(cell);
      cellsArray.splice(index, 1);

    }
  }
}


/**
 * Divides a cell into two cells
 * @param {Array} cellsArray Array of Cell objects to draw
 * @param {number} chances number between 0 and 1 for a chance of cell division 
 */
function mitosis(cellsArray, chances) {
  //loop through the cells array
  for (let cell of cellsArray) {

    //limits the length of the array to exceed certain amount
    // cellsArray.length = min(cellsArray.length, 50);

    //index of the cell to be split into two
    let index = cellsArray.indexOf(cell);
    //conditional to check cell's life and random number for a chance to divide the cell
    if (cell.getLife() < 100 && cell.getLife() > 98 && random() < chances) {
      //remove the cell which is split into two
      cellsArray.splice(index, 1);

      //increase cells birth count
      cells_birth++;

      //create two new cells in position of old cell that died 
      for (let i = 0; i < 2; i++) {
        cellsArray.push(new Cell({
          position: cell.getPosition(),
          velocity: cell.getVelocity(),
          diameter: random(20, 40),
          life: random(1000, 2000)
        }))
      }
    }
  }
}

///----------------------------------------------------------------------------
/// p5js setup function 
///---------------------------------------------------------------------------
function setup() {
  createCanvas(800, 600, WEBGL);

  //position vectors for medicine
  medicine1_pos = createVector(-300, 0, 0);
  medicine2_pos = createVector(300, 0, 0);

  //creates a dropdown menu and fills it with options for viruses
  virusShape_drpdwn = createSelect("");
  virusShape_drpdwn.option("Covid");
  virusShape_drpdwn.option("Cancer Cells");
  virusShape_drpdwn.parent("#virusshape");

  //creates a dropdown menu and fills it with options for cells
  cellshape_drpdwn = createSelect("");
  cellshape_drpdwn.option("Cell");
  cellshape_drpdwn.option("Red blood cell");
  cellshape_drpdwn.parent("#cellshape");

  //when start button is clicked
  select("#start").mouseClicked(() => {
    //add the values from input field as parameter for number of cells to be created
    cells = createCellsArray(select("#no_cells").value());
    viruses = createCellsArray(select("#no_virus").value());

    //reset the population count of cells back to zero
    dead_cells = 0;
    cells_birth = 0;
    med_kills = 0;

    //begin animation to true
    begin_animation = true;
  })
}



///----------------------------------------------------------------------------
/// p5js draw function 
///---------------------------------------------------------------------------
function draw() {


  //if begin_animation is true
  if (begin_animation) {
    //if cells length is 0 (all cells died) then 
    if (cells.length == 0) {
      //show message viruses Won from HTML
      //reset the current cell count Div to 0
      select("#cells").html("Current Cells: " + 0);
      select("#Virus_Won").addClass("active");
    } else {
      //remove the class active if cells length is not zero
      select("#Virus_Won").removeClass("active");
    }

    //if viruses lenth is 0 (all viruses died) then
    if (viruses.length == 0) {
      //show message Cells won by adding class active from css to html div
      //reset the current virus count Div to 0
      select("#Cells_Won").addClass("active");
      select("#viruses").html("Current viruses: " + 0);
    } else {
      //remove the class if viruses length is not 0
      select("#Cells_Won").removeClass("active");
    }

    //select div tags from html and display the current cells count, viruses, deaths and births of cells
    select("#cells").html("Current Cells: " + cells.length);
    select("#viruses").html("Current viruses: " + viruses.length);
    select("#cells_dead").html("Cells Died: " + dead_cells);
    select("#cells_birth").html("Cells Birth: " + cells_birth);
    select("#med_kills").html("Viruses killed by meds: " + med_kills);



    orbitControl(); // camera control using mouse

    //lights(); // we're using custom lights here
    directionalLight(180, 180, 180, 0, 0, -width / 2);
    directionalLight(255, 255, 255, 0, 0, width / 2);


    ambientLight(60);
    pointLight(200, 200, 200, 0, 0, 0, 50);
    noStroke();
    background(80); // clear screen
    fill(220);
    ambientMaterial(80, 202, 94); // magenta material

    //mitosis function with cellarray as parameter and a 55% chance of division
    mitosis(cells, 0.55);
    //mitosis function with viruses array as parameter and a 50% chance of division
    mitosis(viruses, 0.50);

    //handle life for cells
    handleLife(cells);
    //handle life for viruses
    handleLife(viruses);

    collideCells(cells); // handle collisions for cells
    collideCells(viruses); // handle collisions for viruses

    constrainCells(cells, createVector(0, 0, 0), width); // keep cells in the world
    constrainCells(viruses, createVector(0, 0, 0), width); // keep viruses in the world

    //call checkMedicine on viruses to remove viruses if they collide
    checkMedicine(viruses);

    drawCells3D(cells); // draw the cells
    drawViruses3D(viruses); //draw the viruses

    //if viruses or cells collide
    //reduces both their life value
    collide_cells_viruses(cells, viruses);

    //adds medicines model to the canvas with specified size, values and rotation
    push();
    translate(medicine1_pos);
    scale(0.3, 0.2, 0.5);
    rotateX(frameCount * 0.01)
    rotateY(frameCount * 0.01)
    rotateZ(frameCount * 0.01);
    texture(medicine_texture)
    model(medicine);
    pop();

    push();
    translate(medicine2_pos);
    scale(0.3, 0.2, 0.5);
    rotateX(frameCount * 0.01)
    rotateY(frameCount * 0.01)
    rotateZ(frameCount * 0.01);
    texture(medicine_texture)
    model(medicine);
    pop();

    // draw world boundaries
    ambientMaterial(255, 102, 94); // magenta material for subsequent objects
    sphere(width); // this is the border of the world, a little like a "skybox" in video games
  }


}