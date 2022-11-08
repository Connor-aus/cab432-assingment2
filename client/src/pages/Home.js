import React, { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";

import SearchBar from "../components/SearchBar";
import Instructions from "../components/Instructions";
import PlayerSpeed from "../components/PlayerSpeed";
import { makeGrid, generateMaze } from "../modules/GenerateMaze";

import "./../css/style.css";

export function Home() {
  const [seed, setSeed] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [maze, setMaze] = useState([]);
  const [mazeEnd, setMazeEnd] = useState([]);
  const [start, setStart] = useState(false);
  const [intervalSpeed, setIntervalSpeed] = useState(200); // speed modifier
  const [intervalA, setIntervalA] = useState();
  const [intervalB, setIntervalB] = useState();
  const [intervalD, setIntervalD] = useState();

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

  const cols = 40; //columns in the maze
  const rows = 40; //rows in the maze

  // callback function setting the seed value
  const searchSeed = (seedInput) => {
    var seedInt = parseInt(seedInput);
    if (typeof seedInt != "number") {
      setErrorMessage("seed must be a number");
      return;
    }

    if (seedInt < 100000 && seedInt > 0) {
      setSeed(seedInt);
      setErrorMessage("");
      return;
    }

    setErrorMessage("seed must be between 1 - 100000");
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

  // stop game
  function stopGame() {
    setStart(false);

    clearInterval(intervalA);
    clearInterval(intervalB);
    clearInterval(intervalD);

    setIntervalA();
    setIntervalB();
    setIntervalD();
  }

  // calculate visual position of players
  function determinePlayer(xIndex, yIndex) {
    if (xIndex == playerX && yIndex == playerY) return `player-1`;

    if (xIndex == AstarX && yIndex == AstarY) return `player-2`;

    if (xIndex == BFSX && yIndex == BFSY) return `player-3`;

    if (xIndex == dijkstrasX && yIndex == dijkstrasY) return `player-4`;

    if (xIndex == mazeEnd[0] && yIndex == mazeEnd[1]) return `finish`;

    return `player-0`;
  }

  // player moved
  // re-render and check win
  useEffect(() => {
    if (start == false) return;

    setPlayerSpeed((x) => x + 1);
    // stop all intervals if player has won
    if (playerX == mazeEnd[0] && playerY == mazeEnd[1]) {
      stopGame();

      // TODO print results
    }
  }, [playerY, playerX]);

  // game start
  useEffect(() => {
    if (start == false) return;

    console.log("starting game");

    // refence index of coordindates arrays
    var indexA = 0;
    var indexB = 0;
    var indexD = 0;

    function printAstar(i) {
      setAstarX(AstarPath[i][0]);
      setAstarY(AstarPath[i][1]);

      if (i >= AstarPath.length - 1) clearInterval(intervalAstar);

      indexA++;
    }

    function printBFS(i) {
      setBFSX(BFSPath[i][0]);
      setBFSY(BFSPath[i][1]);

      if (i >= BFSPath.length - 1) clearInterval(intervalBFS);

      indexB++;
    }

    function printDijkstra(i) {
      setDijkstrasX(dijkstrasPath[i][0]);
      setDijkstrasY(dijkstrasPath[i][1]);

      if (i >= dijkstrasPath.length - 1) clearInterval(intervalDijkstras);

      indexD++;
    }

    const intervalAstar = setInterval(
      () => printAstar(indexA),
      (intervalSpeed * AstarSpeed) / (cols * rows)
    );
    const intervalBFS = setInterval(
      () => printBFS(indexB),
      (intervalSpeed * BFSSpeed) / (cols * rows) + 500
    );
    const intervalDijkstras = setInterval(
      () => printDijkstra(indexD),
      (intervalSpeed * dijkstrasSpeed) / (cols * rows) - 100
    );

    if (AstarSpeed != 0) setIntervalA(intervalAstar);
    if (BFSSpeed != 0) setIntervalB(intervalBFS);
    if (dijkstrasSpeed != 0) setIntervalD(intervalDijkstras);
  }, [start]);

  // triggers API request for path data
  useEffect(() => {
    (async () => {
      if (seed == 0) return;

      // ensure game doesn't start prematurely
      stopGame();

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
        // pass to server
        let getAstarPath = async () => {
          // DB key
          var key = `/${cols}/${rows}/${seed}`;

          console.log("sending request for Astar path");

          var res = await fetch(key);
          var data = await res.json();

          if (data.length < 1) {
            setErrorMessage("error gathering game data");
            return;
          }

          // if data is from cache
          if (data.response != null) {
            var cache = data.response;
            data = cache;
          }

          setAstarPath(data.astarPath);
          setAstarSpeed(data.astarSpeed);
          setBFSPath(data.bfsPath);
          setBFSSpeed(data.bfsSpeed);
          setDijkstrasPath(data.dijkstrasPath);
          setDijkstrasSpeed(data.dijkstrasSpeed);

          console.log("Successful Astar path");
        };

        getAstarPath();
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
    })();
  }, [seed]);

  return (
    <Container>
      <Row style={{ color: "rgb(255, 188, 62)", marginTop: "30px" }}>
        <h1>Welcome to Maze Runner</h1>
      </Row>
      <Row>
        <SearchBar onSubmit={searchSeed} />
      </Row>
      <Row>{error(errorMessage)}</Row>
      <Row>{Instructions()}</Row>
      <Row>
        {PlayerSpeed({ name: "Player", speed: playerSpeed, colour: "red" })}
        {PlayerSpeed({ name: "Astar", speed: AstarSpeed, colour: "blue" })}
        {PlayerSpeed({ name: "BFS", speed: BFSSpeed, colour: "green" })}
        {PlayerSpeed({
          name: "Dijkstra",
          speed: dijkstrasSpeed,
          colour: "orange",
        })}
      </Row>
      <br></br>
      <Row className="mazebox">
        <div
          style={{
            margin: "auto",
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 10px)`,
            gridTemplateRows: `repeat(${rows}, 10px)`,
          }}
        >
          {maze.map((col, yIndex) =>
            col.map((cell, xIndex) => {
              return (
                <div
                  key={[cell.y, cell.x]}
                  className={`${determinePlayer(xIndex, yIndex)} box-${maze[cell.y][cell.x].walls
                    }`}
                ></div>
              );
            })
          )}
        </div>
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
