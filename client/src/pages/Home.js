import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";

import { SearchBar } from "../components/SearchBar";

import "./../css/style.css";

export function Home() {
  const [seed, setSeed] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [playerX, setPlayerX] = useState(0);
  const [playerY, setPlayerY] = useState(0);
  const [grid2, setGrid2] = useState([]);
  const [rendered, setRendered] = useState(false);

  var gridy = makeGrid();

  // register key events
  document.onkeydown = (e) => {
    e = e || window.event;
    if (e.code === "KeyW" && playerY > 0) {
      if (grid2[playerX][playerY].walls > 8) {
        console.log("up arrow pressed");
        setPlayerY((y) => {
          return y - 1;
        });
      }
    } else if (e.code === "KeyD" && playerX < cols - 1) {
      if (grid2[playerX][playerY].walls % 2 == 1) {
        console.log("right arrow pressed");
        setPlayerX((x) => {
          return x + 1;
        });
      }
    } else if (e.code === "KeyS" && playerY < rows - 1) {
      if (grid2[playerX][playerY + 1].walls > 8) {
        console.log("down arrow pressed");
        setPlayerY((y) => {
          return y + 1;
        });
      }
    } else if (e.code === "KeyA" && playerX > 0) {
      if (grid2[playerX - 1][playerY].walls % 2 == 1) {
        console.log("left arrow pressed");
        setPlayerX((x) => {
          return x - 1;
        });
      }
    }
  };

  // player moved
  useEffect(() => {}, [playerY], [playerX]);

  // callback function for seed value selection
  const searchSeed = (seedInput) => {
      var seedInt = parseInt(seedInput);
      if (typeof(seedInt) != "number") {
        setErrorMessage("seed must be a number");
        return;
      }

      if (seedInt < 99999 && seedInt > 1) {
        setSeed(seedInt);
        setErrorMessage("");
        return;
      }
      
      setErrorMessage("seed must be between 0 - 100000");
  };

  // // triggers API request for game data
  // useEffect(() => {
  //   (async () => {
  //     if (search === "") return;

  //     try {
  //       let res = await fetch(`/search/${search}`);
  //       let data = await res.json();

  //       // display error if search returns no results
  //       if (data === 0) {
  //         setErrorMessage("game not found");
  //         return;
  //       }

  //       setErrorMessage("");
  //       setSelectedGame(data[0]);
  //       setGames(data);

  //       console.log("Successful request for game data : " + search);
  //     } catch (err) {
  //       setErrorMessage("error gathering game data");
  //       console.log("Error fetching data : " + err);
  //     }
  //   })();
  // }, [search]);

  useEffect(() => {
    (async () => {
      if (!rendered) {
        var result = walk(gridy, cols, rows);
        setGrid2(result);
        setRendered(true);
      }
    })();
  }, []);

  // console.log("rendered = " + rendered);
  // console.log(grid2);
  // console.log("player = " + playerX + playerY);

  return (
    <Container fluid className="bordercon">
      <Row style={{ color: "rgb(255, 188, 62)", marginTop: "30px" }}>
        <h1>Welcome to Maze Racer</h1>
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
              gridTemplateColumns: `repeat(${cols}, 20px)`,
              gridTemplateRows: `repeat(${rows}, 20px)`,
            }}
          >
            {grid2.map((row, yIndex) =>
              row.map((cell, xIndex) => {
                if (xIndex == playerX && yIndex == playerY) {
                  return (
                    <div
                      key={[cell.y, cell.x]}
                      className={`player box-${grid2[cell.y][cell.x].walls}`}
                    ></div>
                  );
                } else {
                  return (
                    <div
                      key={[cell.y, cell.x]}
                      className={`box box-${grid2[cell.y][cell.x].walls}`}
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

// error message if no game is found
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

const cols = 10; //columns in the grid
const rows = 10; //rows in the grid

// represents a gridpoint
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.walls = 0;
    this.visited = false;
  }
}

function makeGrid() {
  var grid2 = [cols];

  for (let i = 0; i < cols; i++) {
    grid2[i] = [rows];

    for (let j = 0; j < rows; j++) {
      grid2[i][j] = new Cell(i, j);
    }
  }

  return grid2;
}

//used to get random number
function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function chooseDirection(grid, neighbours, x, y) {
  if (neighbours % 2 == 1) {
    neighbours -= 1;
    if (!grid[x + 1][y].visited) return 1; // right
  }

  if (neighbours >= 8) {
    neighbours -= 8;
    if (!grid[x][y - 1].visited) return 8; // up
  }

  if (neighbours >= 4) {
    neighbours -= 4;
    if (!grid[x - 1][y].visited) return 4; // left
  }

  if (neighbours == 2) if (!grid[x][y + 1].visited) return 2; // down

  return 0; // no options
}

function getNeighbours(x, y, columns, rows) {
  var neighbour = 0;

  if (x < 0 || x >= columns || y < 0 || y >= rows) {
    return neighbour;
  }

  if (y > 0) {
    neighbour += 8;
  }
  if (x < cols - 1) {
    neighbour += 1;
  }
  if (y < rows - 1) {
    neighbour += 2;
  }
  if (x > 0) {
    neighbour += 4;
  }
  return neighbour;
}

function walk(grid, width, height) {
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
    options = true;

    direction = chooseDirection(grid, neighbours, x, y);
    //console.log(direction + " = direction");
    switch (direction) {
      case 1:
        grid[x][y].walls += 1;
        grid[x + 1][y].walls += 4;
        x++;
        break;
      case 2:
        grid[x][y].walls += 2;
        grid[x][y + 1].walls += 8;
        y++;
        break;
      case 4:
        grid[x][y].walls += 4;
        grid[x - 1][y].walls += 1;
        x--;
        break;
      case 8:
        grid[x][y].walls += 8;
        grid[x][y - 1].walls += 2;
        y--;
        break;
      case 0:
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

    index = stack.pop();
    //console.log("to " + index);
    x = index[0];
    y = index[1];
  }

  //console.log("visited = " + visited);
  //console.log(grid);
  grid[cols / 2 - 1][rows / 2 - 1].walls = 15;
  return grid;
}

// TODO maybe not needed (everything below)

// const range = (min, max) =>
//   Array.from({ length: max - min }).map((_, i) => i + min);

// const GRID_SIZE = 50;
// document.documentElement.style.setProperty("--grid-size", `${GRID_SIZE}`);

// const grid = range(0, GRID_SIZE * GRID_SIZE).fill(0);

// const kiff = (size = GRID_SIZE) => {
//   console.time("walk");
//   const grid = range(0, size * size).fill(0);
//   Array.from(walk(grid, size, size));
//   console.timeEnd("walk");
//   return grid;
// };

// window.kiff = kiff;
