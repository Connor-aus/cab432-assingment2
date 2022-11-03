import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";

import { SearchBar } from "../components/SearchBar";
import RandomNumGen from "../components/RandomNumGen";

import "./../css/style.css";

export function Home() {
  const [seed, setSeed] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [playerX, setPlayerX] = useState(0);
  const [playerY, setPlayerY] = useState(0);
  const [maze, setMaze] = useState([]);
  const [AstarPath, setAstarPath] = useState([]);
  const [AstarSpeed, setAstarSpeed] = useState(0);
  const [AstarX, setAstarX] = useState(0);
  const [AstarY, setAstarY] = useState(0);

  const cols = 50; //columns in the grid
  const rows = 50; //rows in the grid

  // inititate the a blank grid
  var blankGrid = makeGrid(cols, rows);

  // callback function for seed value selection
  const searchSeed = (seedInput) => {
    var seedInt = parseInt(seedInput);
    if (typeof seedInt != "number") {
      setErrorMessage("seed must be a number");
      return;
    }

    if (seedInt < 99999 && seedInt > 0) {
      setSeed(seedInt);
      setErrorMessage("");
      return;
    }

    setErrorMessage("seed must be between 0 - 100000");
  };

  // register key events
  document.onkeydown = (e) => {
    e = e || window.event;

    if (maze.length < 1) return;

    if (e.code === "KeyW" && playerY > 0) {
      // setAstarPath([[5,5],[6,6],[7,7],[8,8]]);
      // setAstarSpeed(20);
      if (maze[playerX][playerY].up) {
        console.log("up arrow pressed");
        setPlayerY((y) => {
          return y - 1;
        });
      }
    } else if (e.code === "KeyD" && playerX < cols - 1) {
      if (maze[playerX][playerY].right) {
        console.log("right arrow pressed");
        setPlayerX((x) => {
          return x + 1;
        });
      }
    } else if (e.code === "KeyS" && playerY < rows - 1) {
      if (maze[playerX][playerY].down) {
        console.log("down arrow pressed");
        setPlayerY((y) => {
          return y + 1;
        });
      }
    } else if (e.code === "KeyA" && playerX > 0) {
      if (maze[playerX][playerY].left) {
        console.log("left arrow pressed");
        setPlayerX((x) => {
          return x - 1;
        });
      }
    }
  };

  // player moved
  useEffect(() => {}, [playerY], [playerX]);

  // game start
  useEffect(() => {
    if (AstarSpeed == 0) return;

    console.log(AstarPath);

    function printAstar(i) {
      setAstarX(AstarPath[i][0]);
      setAstarY(AstarPath[i][1]);
      myStopFunction(i);
      index++;
      // console.log(index);
    }

    var index = 0;
    const myInterval = setInterval(() => printAstar(index), 500);

    function myStopFunction(index) {
      // console.log(index)
      // console.log(AstarPath.length)
      if (index >= AstarPath.length - 1) clearInterval(myInterval);
    }
  }, [AstarSpeed]);

  // triggers API request for game data
  useEffect(() => {
    (async () => {
      if (seed == 0) return;

      try {
        // construct key
        var key = `${cols}x${rows}.${seed}.Astar`;
        var exampleKey = "50x50.80.Astar";

        // check redis cache

        // check server
        let res = await fetch(`/Astar/${cols}/${rows}/${seed}`);

        console.log(res);

        let data = await res.json();

        console.log(data);

        // no path found
        if (data.length < 1) {
          // print error
          return;
        }

        setAstarPath(data.path);
        setAstarSpeed(data.speed);

        // display error if search returns no results
        if (data === 0) {
          setErrorMessage("path not found for Astar");
          return;
        }

        setErrorMessage("");
        setAstarPath(data);

        console.log("Successful Astar path");
      } catch (err) {
        setErrorMessage("error gathering game data");
        console.log("Error fetching data : " + err);
      }
    })();
  }, [seed]);

  useEffect(() => {
    (async () => {
      if (seed == 0) return;
      
        console.log("rendering map");

        var result = generateMaze(blankGrid, seed);

        setMaze(result);

        setAstarX(blankGrid.length - 1);
    })();
  }, [seed]);

  // console.log("rendered = " + rendered);
  // console.log(maze);
  // console.log("player = " + playerX + playerY);

  return (
    <Container fluid className="bordercon">
      <Row style={{ color: "rgb(255, 188, 62)", marginTop: "30px" }}>
        <h1>Welcome to Maze Runner</h1>
      </Row>
      <Row className="borderr">
        <Col className="bordercol">
          <SearchBar onSubmit={searchSeed} />
        </Col>
      </Row>
      {error(errorMessage)}
      <Row>
        <Col>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 10px)`,
              gridTemplateRows: `repeat(${rows}, 10px)`,
            }}
          >
            {maze.map((col, yIndex) =>
              col.map((cell, xIndex) => {
                if (xIndex == playerX && yIndex == playerY) {
                  calculateWalls(maze[cell.x][cell.y]);
                  // console.log(maze[cell.x][cell.y]);
                  return (
                    <div
                      key={[cell.y, cell.x]}
                      className={`player-1 box-${maze[cell.y][cell.x].walls}`}
                    ></div>
                  );
                } else if (xIndex == AstarX && yIndex == AstarY) {
                  calculateWalls(maze[cell.x][cell.y]);
                  // console.log(maze[cell.x][cell.y]);
                  return (
                    <div
                      key={[cell.y, cell.x]}
                      className={`player-2 box-${maze[cell.y][cell.x].walls}`}
                    ></div>
                  );
                } else {
                  calculateWalls(maze[cell.x][cell.y]);
                  // console.log(maze[cell.x][cell.y]);
                  return (
                    <div
                      key={[cell.y, cell.x]}
                      className={`player-0 box-${maze[cell.y][cell.x].walls}`}
                    ></div>
                  );
                }
              })
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

// error message
const error = (message) => {
  if (message === "") return;

  return (
    <Row style={{ color: "white" }}>
      <h4>
        <i>{message}</i>
      </h4>
    </Row>
  );
};

// TODO - move ALL this to a component

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
function makeGrid(width, height) {
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

function generateMaze(grid, seed) {
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
    //console.log(x + " x of new");
    //console.log(y + " y of new");
    var neighbours = getNeighbours(x, y, width, height);

    //console.log(neighbours + " = neighbours");
    //console.log(neighbours);
    options = true;

    // generate new random number for each step
    seed = RandomNumGen(seed);

    direction = chooseDirection(grid, neighbours, x, y, seed);
    //console.log(direction + " = direction");
    switch (direction) {
      case right:
        // grid[x][y].walls += 1;
        // grid[x + 1][y].walls += 4;
        grid[x][y].right = true;
        grid[x + 1][y].left = true;
        x++;
        break;
      case down:
        // grid[x][y].walls += 2;
        // grid[x][y + 1].walls += 8;
        grid[x][y].down = true;
        grid[x][y + 1].up = true;
        y++;
        break;
      case left:
        // grid[x][y].walls += 4;
        // grid[x - 1][y].walls += 1;
        grid[x][y].left = true;
        grid[x - 1][y].right = true;
        x--;
        break;
      case up:
        // grid[x][y].walls += 8;
        // grid[x][y - 1].walls += 2;
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
      //console.log("next " + x + "," + y);

      continue;
    }

    //console.log(stack)

    index = stack.pop();
    //console.log("to " + index);
    x = index[0];
    y = index[1];
  }

  //console.log("visited = " + visited);
  //console.log(grid);

  var centre = [width / 2 - 1, height / 2 - 1];
  // grid[cols / 2 - 1][rows / 2 - 1].walls = 15;

  grid[centre[0]][centre[1]].up = true;
  grid[centre[0]][centre[1]].down = true;
  grid[centre[0]][centre[1]].right = true;
  grid[centre[0]][centre[1]].left = true;

  grid[centre[0]][centre[1] + 1].up = true;
  grid[centre[0]][centre[1] - 1].down = true;
  grid[centre[0] + 1][centre[1]].left = true;
  grid[centre[0] - 1][centre[1]].right = true;

  // console.log(grid[0][0])
  // console.log(grid[0][1])
  // console.log(grid[9][9])
  // console.log(grid[9][8])

  return grid;
}

function calculateWalls(cell) {
  cell.walls = 0;

  if (cell.right == true) cell.walls += right;

  if (cell.down == true) cell.walls += down;

  if (cell.left == true) cell.walls += left;

  if (cell.up == true) cell.walls += up;
}
