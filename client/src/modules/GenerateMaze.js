import RandomNumGen from "../components/RandomNumGen";

// directions
const right = 1;
const down = 2;
const left = 4;
const up = 8;

// represents a gridpoint
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.walls = 0;
    this.up = false;
    this.down = false;
    this.right = false;
    this.left = false;
    this.visited = false;
  }
}

// inititate the a blank grid
export function makeGrid(width, height) {
  var grid = [width];

  for (let i = 0; i < width; i++) {
    grid[i] = [height];

    for (let j = 0; j < height; j++) {
      grid[i][j] = new Cell(i, j);
    }
  }

  return grid;
}

function chooseDirection(grid, neighbours, x, y, seed) {
  var validDirections = [];

  if (neighbours.includes(right))
    if (!grid[x + 1][y].visited) validDirections.push(right); // right

  if (neighbours.includes(up))
    if (!grid[x][y - 1].visited) validDirections.push(up); // up

  if (neighbours.includes(left))
    if (!grid[x - 1][y].visited) validDirections.push(left); // left

  if (neighbours.includes(down))
    if (!grid[x][y + 1].visited) validDirections.push(down); // down

  var numberOfDirections = validDirections.length;

  if (numberOfDirections < 1) return 0; // no options

  // use modula result as the index for the selection
  return validDirections[seed % numberOfDirections];
}

function getNeighbours(x, y, cols, rows) {
  var neighbours = [];

  if (x < 0 || x >= cols || y < 0 || y >= rows) return neighbours;

  if (x < cols - 1) neighbours.push(right);

  if (y < rows - 1) neighbours.push(down);

  if (x > 0) neighbours.push(left);

  if (y > 0) neighbours.push(up);

  return neighbours;
}

export function generateMaze(grid, seed) {
  var width = grid[0].length;
  var height = grid.length;

  var x = 0;
  var y = 0;
  grid[x][y].visited = true;
  var stack = [];
  stack.push([x, y]);

  let visited = 1;
  const size = width * height;
  var options = true;
  var index = [];
  var direction;

  while (visited < size) {
    var neighbours = getNeighbours(x, y, width, height);

    options = true;

    seed = RandomNumGen(seed);

    direction = chooseDirection(grid, neighbours, x, y, seed);
    switch (direction) {
      case right:
        grid[x][y].right = true;
        grid[x + 1][y].left = true;
        x++;
        break;
      case down:
        grid[x][y].down = true;
        grid[x][y + 1].up = true;
        y++;
        break;
      case left:
        grid[x][y].left = true;
        grid[x - 1][y].right = true;
        x--;
        break;
      case up:
        grid[x][y].up = true;
        grid[x][y - 1].down = true;
        y--;
        break;
      default:
        options = false;
        break;
    }

    if (options) {
      stack.push([x, y]);
      grid[x][y].visited = true;
      visited++;

      continue;
    }

    index = stack.pop();
    x = index[0];
    y = index[1];
  }

  // grid[centre[0]][centre[1]].up = true;
  // grid[centre[0]][centre[1]].down = true;
  // grid[centre[0]][centre[1]].right = true;
  // grid[centre[0]][centre[1]].left = true;

  // grid[centre[0]][centre[1] + 1].up = true;
  // grid[centre[0]][centre[1] - 1].down = true;
  // grid[centre[0] + 1][centre[1]].left = true;
  // grid[centre[0] - 1][centre[1]].right = true;

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
        calculateWalls(grid[i][j]);
    }
  }

  return grid;
}

function calculateWalls(cell) {
  cell.walls = 0;

  if (cell.right == true) cell.walls += right;

  if (cell.down == true) cell.walls += down;

  if (cell.left == true) cell.walls += left;

  if (cell.up == true) cell.walls += up;
}