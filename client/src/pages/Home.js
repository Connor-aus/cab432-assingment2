import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";

import { SearchBar } from "../components/SearchBar";
import RandomNumGen from "../components/RandomNumGen";

import "./../css/style.css";

export function Home() {
  const [seed, setSeed] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [maze, setMaze] = useState([]);
  const [mazeEnd, setMazeEnd] = useState([]);
  const [intervalArray, setIntervalArray] = useState([]);
  const [intervalSpeed, setIntervalSpeed] = useState(500);
  const [start, setStart] = useState(false);

  const [playerSpeed, setPlayerSpeed] = useState(0);
  const [playerX, setPlayerX] = useState(0);
  const [playerY, setPlayerY] = useState(0);

  const [AstarPath, setAstarPath] = useState([]);
  const [AstarSpeed, setAstarSpeed] = useState(0);
  const [AstarX, setAstarX] = useState(0);
  const [AstarY, setAstarY] = useState(0);

  const [BFSPath, setBFSPath] = useState([]);
  const [BFSSpeed, setBFSSpeed] = useState(0);
  const [BFSX, setBFSX] = useState(0);
  const [BFSY, setBFSY] = useState(0);

  const [dijkstrasPath, setDijkstrasPath] = useState([]);
  const [dijkstrasSpeed, setDijkstrasSpeed] = useState(0);
  const [dijkstrasX, setDijkstrasX] = useState(0);
  const [dijkstrasY, setDijkstrasY] = useState(0);

  // TODO create instructions popup

  const cols = 10; //columns in the maze
  const rows = 10; //rows in the maze

  // callback function setting the seed value
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

  // register key events for moving player
  // and starting game
  document.onkeydown = (e) => {
    e = e || window.event;

    if (maze.length < 1 || seed == 0) return;

    if (e.code === "Space") setStart(true);

    if (start == false) return;

    if (e.code === "KeyW" && playerY > 0) {
      if (maze[playerX][playerY].up) {
        setPlayerY((y) => {
          return y - 1;
        });
      }
    } else if (e.code === "KeyD" && playerX < cols - 1) {
      if (maze[playerX][playerY].right) {
        setPlayerX((x) => {
          return x + 1;
        });
      }
    } else if (e.code === "KeyS" && playerY < rows - 1) {
      if (maze[playerX][playerY].down) {
        setPlayerY((y) => {
          return y + 1;
        });
      }
    } else if (e.code === "KeyA" && playerX > 0) {
      if (maze[playerX][playerY].left) {
        setPlayerX((x) => {
          return x - 1;
        });
      }
    }
  };

  // player moved
  // re-render and check win
  useEffect(() => {
    setPlayerSpeed((x) => x + 1);
    
    // stop all intervals if player has won
    if(playerX == mazeEnd[0] && playerY == mazeEnd[1]) {
      for (var i = 0; i < intervalArray; i++) {
        intervalStopFunction(intervalArray[i]);
      }

      setIntervalArray([]);

      // TODO print results
    }

  }, [playerY, playerX]);

  // stop an interval function
  function intervalStopFunction(interval) {
    clearInterval(interval);
    setStart(false);
  }

  // game start
  useEffect(() => {
    if (start == false) return;

    console.log("starting game");

    // refence index of coordindates array
    var index = 0;

    console.log(intervalSpeed);

    function printAstar(i) {
      setAstarX(AstarPath[i][0]);
      setAstarY(AstarPath[i][1]);

      if (i >= AstarPath.length - 1) intervalStopFunction(myInterval);

      index++;
    }

    const myInterval = setInterval(() => printAstar(index), intervalSpeed);

    intervalArray.push(myInterval);
  }, [start]);

  // triggers API request for path data
  useEffect(() => {
    (async () => {
      if (seed == 0) return;

      // ensure game doesn't start prematurely
      setStart(false);

      // stop all intervals
      for (var i = 0; i < intervalArray; i++) {
        intervalStopFunction(intervalArray[i]);
      }

      // reset intervals
      setIntervalArray([]);

      // TODO put sets into array and loop through
      // reset player positions and speed
      setPlayerX(0);
      setPlayerY(0);
      setPlayerSpeed(0);
      setAstarX(0);
      setAstarY(0);
      setAstarSpeed(0);
      setBFSX(0);
      setBFSY(0);
      setBFSSpeed(0);
      setDijkstrasX(0);
      setDijkstrasY(0);
      setDijkstrasSpeed(0);

      try {
        // TODO check redis cache

        // pass to server
        let getAstarPath = async () => {
          console.log("sending request for Astar path");

          let res = await fetch(`/Astar/${cols}/${rows}/${seed}`);
          let data = await res.json();

          console.log(data.speed);

          // console.log("Astar path is long = " + data.path.length);

          if (data.length < 1) {
            console.log("path not found for Astar");
            return;
          }

          setAstarPath(data.path);
          setAstarSpeed(Math.random);

          // set text to bold

          console.log("Successful Astar path");
        };

        let getBFSPath = async () => {
          console.log("sending request for BFS path");

          let res = await fetch(`/BFS/${cols}/${rows}/${seed}`);
          let data = await res.json();

          //console.log(data);

          // console.log("BFS path is long = " + data.path.length);

          if (data.length < 1) {
            console.log("path not found for BFS");
            return;
          }

          setBFSPath(data.path);
          setBFSSpeed(Math.random);

          // set text to bold

          console.log("Successful BFS path");
        };

        let getDijkstrasPath = async () => {
          console.log("sending request for Dijkstras path");

          let res = await fetch(`/Dijkstras/${cols}/${rows}/${seed}`);
          let data = await res.json();

          //console.log(data);

          // console.log("Dijsktras path is long = " + data.path.length);

          if (data.length < 1) {
            console.log("path not found for Dijkstras");
            return;
          }

          setDijkstrasPath(data.path);
          setDijkstrasSpeed(Math.random);

          console.log("Successful Dijkstras path");
        };

        getAstarPath();
        getBFSPath();
        getDijkstrasPath();
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

      // inititate a blank grid
      var blankGrid = makeGrid(cols, rows);

      var result = generateMaze(blankGrid, seed);

      setMaze(result);

      setMazeEnd([cols - 1, rows - 1]);

      // setAstarX(blankGrid.length - 1);
    })();
  }, [seed]);

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
      <Row>{error(errorMessage)}</Row>
      <Row>
        <Col>
          <h4 style={{ color: "red", fontWeight: "bold" }}>
            Player = {playerSpeed}
          </h4>
        </Col>
        <Col>
          <h4 style={{ color: "blue", fontWeight: "bold" }}>
            Astar = {speedCheck(AstarSpeed)}
          </h4>
        </Col>
        <Col>
          <h4 style={{ color: "green", fontWeight: "bold" }}>
            BFS = {speedCheck(BFSSpeed)}
          </h4>
        </Col>
        <Col>
          <h4 style={{ color: "orange", fontWeight: "bold" }}>
            Dijkstra's = {speedCheck(dijkstrasSpeed)}
          </h4>
        </Col>
      </Row>
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

// TODO move to component
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

// TODO move to library
function speedCheck(speed) {
  if (speed == 0)
    return "?";
  else
    return speed;
}

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

  // set centre of map
  // var centre = [width / 2 - 1, height / 2 - 1];

  // grid[centre[0]][centre[1]].up = true;
  // grid[centre[0]][centre[1]].down = true;
  // grid[centre[0]][centre[1]].right = true;
  // grid[centre[0]][centre[1]].left = true;

  // grid[centre[0]][centre[1] + 1].up = true;
  // grid[centre[0]][centre[1] - 1].down = true;
  // grid[centre[0] + 1][centre[1]].left = true;
  // grid[centre[0] - 1][centre[1]].right = true;

  return grid;
}

function calculateWalls(cell) {
  cell.walls = 0;

  if (cell.right == true) cell.walls += right;

  if (cell.down == true) cell.walls += down;

  if (cell.left == true) cell.walls += left;

  if (cell.up == true) cell.walls += up;
}
