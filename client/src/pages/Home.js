import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";

import { SearchBar } from "../components/SearchBar";

import "./../css/style.css";

export function Home() {
  const [search, setSearch] = useState("");
  const [games, setGames] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [playerX, setPlayerX] = useState(0);
  const [playerY, setPlayerY] = useState(0);
  const [player, setPlayer] = useState(0);

  // register key events
  document.onkeydown = (e) => {
    //console.log(grid);
    //console.log(range);
    e = e || window.event;
    if (e.code === "KeyW") {
      console.log("up arrow pressed");
      setPlayer((p) => p - 50);
    } else if (e.code === "KeyD") {
      console.log("right arrow pressed");
      setPlayer((p) => p + 1);
    } else if (e.code === "KeyS") {
      console.log("down arrow pressed");
      setPlayer((p) => p + 50);
    } else if (e.code === "KeyA") {
      console.log("left arrow pressed");
      setPlayer((p) => p - 1);
    }
  };

  // // player moved
  // useEffect(
  //   () => {
  //     (() => {})();
  //   },
  //   [playerY],
  //   [playerX]
  // );

  useEffect(() => {console.log("player")}, [playerY], [playerX]);

  // callback functio for SearchBar
  const searchGame = (searchText) => {
    setSearch(searchText);
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

  //move up and remove React.
  let [_count, setCount] = React.useState(0);
  const [mazeGenerator] = React.useState(() =>
    walk(grid, GRID_SIZE, GRID_SIZE)
  );
  //walk(grid, GRID_SIZE, GRID_SIZE)

  useEffect(() => {
    let id = setInterval(() => {
      setCount((p) => p + 1);
      mazeGenerator.next();
      console.log("generator");
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Container fluid className="bordercon">
      <Row style={{ color: "rgb(255, 188, 62)", marginTop: "30px" }}>
        <h1>Welcome to Maze Racer</h1>
      </Row>
      <Row className="borderr">
        <Col className="bordercol">
          <SearchBar onSubmit={searchGame} />
        </Col>
      </Row>
      {error(errorMessage)}
      <Row>
        <Col>
          <div>
            <div className="grid cf">
              {grid.map((x, xIndex) => {
                //console.log(x, xIndex, yIndex);
                //console.log(grid);
                if (xIndex == player) {
                  return <div key={xIndex} className={`player box-${x}`}></div>;
                } else {
                  return <div key={xIndex} className={`box box-${x}`}></div>;
                }
              })}
            </div>
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

const GRID_SIZE = 50;
document.documentElement.style.setProperty("--grid-size", `${GRID_SIZE}`);

const l = console.log.bind(console);
const t = console.table.bind(console);

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function getRandomItem(array) {
  return array[getRandomInt(0, array.length - 1)];
}

/**
 * - `min` included
 * - `max` excluded
 */
const range = (min, max) =>
  Array.from({ length: max - min }).map((_, i) => i + min);

var Direction = [1, 2, 4, 8];

function getNeighbours(currentIndex, columns, rows) {
  const neighbour = [];

  if (currentIndex < 0 || currentIndex >= columns * rows) {
    return neighbour;
  }
  // l(index);

  if (currentIndex >= columns) {
    neighbour.push([1, currentIndex - columns]);
    // l(`${index} can go up`);
  }
  if (currentIndex % columns !== columns - 1) {
    neighbour.push([2, currentIndex + 1]);
    // l(`${index} can go right`);
  }
  if (currentIndex >= 0 && currentIndex < columns * rows - columns) {
    neighbour.push([4, currentIndex + columns]);
    // l(`${index} can go down`);
  }
  if (currentIndex % columns > 0) {
    neighbour.push([8, currentIndex - 1]);
    // l(`${index} can go left`);
  }
  return neighbour;
}

function* walk(grid, width, height) {
  let index = getRandomInt(0, grid.length - 1);
  const stack = [index];
  const visited = new Set([index]);
  // l('starting at', index);

  let i = 0;
  grid[index] = i;

  yield index;
  while (visited.size < grid.length) {
    const neighbours = getNeighbours(index, width, height).filter(
      (x) => !visited.has(x[1])
    );

    if (neighbours.length) {
      // getRandomItem
      const [direction, nextIndex] = getRandomItem(neighbours);
      if (direction) {
        switch (direction) {
          case 1:
            grid[index] ^= 1;
            grid[nextIndex] ^= 4;
            break;
          case 2:
            grid[index] ^= 2;
            grid[nextIndex] ^= 8;
            break;
          case 4:
            grid[index] ^= 4;
            grid[nextIndex] ^= 1;
            break;
          case 8:
            grid[index] ^= 8;
            grid[nextIndex] ^= 2;
            break;
        }

        index = nextIndex;
        // l('moving to', index);
        stack.push(nextIndex);
        visited.add(nextIndex);
        i++;
        // grid[index] = i;
        // return index;
        continue;
      }
    }

    index = stack.pop();
    // l('steping back to', index);
  }
}

const kiff = (size = GRID_SIZE) => {
  console.time("walk");
  const grid = range(0, size * size).fill(0);
  Array.from(walk(grid, size, size));
  console.timeEnd("walk");
  return grid;
};

window.kiff = kiff;

const grid = range(0, GRID_SIZE * GRID_SIZE).fill(0);

var example1 = async () => {};
