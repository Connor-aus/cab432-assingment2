import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";

import { SearchBar } from "../components/SearchBar";
import { GameList } from "../components/GameList";
import { GameInfo } from "../components/GameInfo";
import { Video } from "../components/Video";


// import { Visualiser } from "../src/components/visualiser";
// import { MazeG } from "../src/components/maze_generators";
import './../css/style.css';


export function Home() {
  const [search, setSearch] = useState("");
  const [games, setGames] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [videoTrailerId, setVideoTrailerId] = useState(null);
  const [videoReviewId, setVideoReviewId] = useState(null);
  const [videoStoryId, setVideoStoryId] = useState(null);
  const [videoPlaythroughId, setVideoPlaythroughId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // callback functio for SearchBar
  const searchGame = (searchText) => {
    setSearch(searchText);
  };

  // callback functio for GameList
  const selectGame = (selection) => {
    setSelectedGame(selection);
  };

  // triggers API request for game data
  useEffect(() => {
    (async () => {
      if (search === "") return;

      try {
        let res = await fetch(`/search/${search}`);
        let data = await res.json();

        // display error if search returns no results
        if (data === 0) {
          setErrorMessage("game not found");
          return;
        }

        setErrorMessage("");
        setSelectedGame(data[0]);
        setGames(data);

        console.log("Successful request for game data : " + search);
      } catch (err) {
        setErrorMessage("error gathering game data");
        console.log("Error fetching data : " + err);
      }
    })();
  }, [search]);

  // triggers API request for video ids
  useEffect(() => {
    (async () => {
      if (selectedGame == null) return;

      try {
        let res = await fetch(`/video/${selectedGame.name} game trailer`);
        let data = await res.json();
        setVideoTrailerId(data);

        console.log(
          "Successful request for game trailer : " + selectedGame.name
        );
      } catch (err) {
        console.log("Error fetching video trailer data : " + err);
      }

      try {
        let res = await fetch(`/video/${selectedGame.name} game review`);
        let data = await res.json();
        setVideoReviewId(data);

        console.log(
          "Successful request for game review : " + selectedGame.name
        );
      } catch (err) {
        console.log("Error fetching video review data : " + err);
      }

      try {
        let res = await fetch(`/video/${selectedGame.name} game story`);
        let data = await res.json();
        setVideoStoryId(data);

        console.log("Successful request for game story : " + selectedGame.name);
      } catch (err) {
        console.log("Error fetching video story data : " + err);
      }

      try {
        let res = await fetch(`/video/${selectedGame.name} playthrough ep 1`);
        let data = await res.json();
        setVideoPlaythroughId(data);

        console.log(
          "Successful request for game playthrough : " + selectedGame.name
        );
      } catch (err) {
        console.log("Error fetching video playthrough data : " + err);
      }
    })();
  }, [selectedGame]);

  // move up and remove React.
  let [_count, setCount] = React.useState(0);
  const [mazeGenerator] = React.useState(() =>
    walk(grid, GRID_SIZE, GRID_SIZE)
  );

  useEffect(() => {
    let id = setInterval(() => {
      setCount((p) => p + 1);
      mazeGenerator.next();
    }, 100);
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
        {grid.map((x, xIndex) => (
          <div key={xIndex} className={`box box-${x}`}>
            {' '}
            {x}
          </div>
        ))}
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






const GRID_SIZE = 100;
document.documentElement.style.setProperty('--grid-size', `${GRID_SIZE}`);

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
        yield index;
        continue;
      }
    }

    index = stack.pop();
    // l('steping back to', index);
  }
}

const kiff = (size = GRID_SIZE) => {
  console.time('walk');
  const grid = range(0, size * size).fill(0);
  Array.from(walk(grid, size, size));
  console.timeEnd('walk');
  return grid;
};

window.kiff = kiff;

const grid = range(0, GRID_SIZE * GRID_SIZE).fill(0);
