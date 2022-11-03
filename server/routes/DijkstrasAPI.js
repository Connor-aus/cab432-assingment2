const express = require("express");
const axios = require("axios");

const router = express.Router();

const lib = require("../modules/lib");

router.get("/:cols/:rows/:seed", async (req, res) => {
  // let gameData;
  // let searchedGame;

  // // API2: find info relating to multiple games
  // try {
  //   let data = multipleGameReqData(gameData);
  //   let config = buildReqConfig(data);

  //   let response = await axios(config);

  //   // searched game filtered from array and added to beginning
  //   responseData = response.data.filter(game => {
  //     if (game.id == searchedGame)
  //       searchedGame = game;
  //     else
  //       return game;
  //   });
  //   responseData.unshift(searchedGame);

  //   res.json(responseData);

  //   console.log(`Successful query: search info for ${req.params.game} and similar games`);
  // } catch (err) {
  //   console.log("Error fetching game info : " + err);
  // }

  try {
    // check database

    // if found, return result

    var now = new Date().getTime();

    var blankGrid = lib.makeGrid(req.params.cols, req.params.rows);

    var maze = lib.generateMaze(blankGrid, req.params.seed);

    var results = calculateRoute(maze);

    // no route found
    if (results.length < 1) {
      res.json([]);
      return;
    }

    var routeCoords = getCoords(results[0]);
    var cost = results[1];

    // console.log(routeCoords);

    var responseId = `${req.params.cols}x${req.params.rows}-${req.params.seed}-Astar`;
    var response = generateResponse(responseId, routeCoords, cost);

    var later = new Date().getTime();
    console.log("total time = " + (later - now));

    // save path to database

    // save path to cache

    res.json(response);
    
    console.log("Dijkstras response sent");
  } catch (err) {
    console.log("Error calculating route Astar: ");
    console.log(err);
  }
});

getCoords = (route) => {
  var coords = [];
  //console.log(route);

  route.forEach((c) => coords.push([c.x, c.y]));

  // for (var i = 0; i < route.length; i++) {
  //   coords.push([route[i].x, route[i].y]);
  //   console.log(route[i].x, route[i].y);
  // }

  return coords;
};

generateResponse = (id, route, cost) => {
  return {
    id: id,
    path: route,
    speed: cost,
  };
};

// let cols = 10; //columns in the grid
// let rows = 10; //rows in the grid

// let grid = new Array(cols); //array of all the grid points

let openSet = []; //array containing unevaluated grid points
let closedSet = []; //array containing completely evaluated grid points

let start; //starting grid point
let end; // ending grid point (goal)
let path = [];

//heuristic we will be using - Manhattan distance
//for other heuristics visit - https://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
function heuristic(position0, position1) {
  let d1 = Math.abs(position1.x - position0.x);
  let d2 = Math.abs(position1.y - position0.y);

  return d1 + d2;
}

//A star search implementation
var calculateRoute = (maze) => {
  start = maze[0][0];
  end = maze[maze.length - 1][maze[0].length - 1];

  openSet.push(start);

  while (openSet.length > 0) {
    //assumption lowest index is the first one to begin with
    let lowestIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].totalCost < openSet[lowestIndex].totalCost) {
        lowestIndex = i;
      }
    }
    let current = openSet[lowestIndex];

    if (current === end) {
      let temp = current;
      path.push(temp);
      while (temp.parent) {
        path.push(temp.parent);
        temp = temp.parent;
      }

      // console.log("DONE!");
      // return the traced path
      var result = [];
      result.push(path.reverse());
      result.push(end.totalCost);

      // console.log(result[0]);
      return result;
    }

    //remove current from openSet
    openSet.splice(lowestIndex, 1);

    //add current to closedSet
    closedSet.push(current);

    lib.updateNeighbours(current, maze);
    var neighbours = current.neighbours; 

    // console.log(neighbours);

    for (let i = 0; i < neighbours.length; i++) {
      let neighbour = neighbours[i];

      if (!closedSet.includes(neighbour)) {
        let possibleG = current.currentCost + 1;

        if (!openSet.includes(neighbour)) {
          openSet.push(neighbour);
        } else if (possibleG >= neighbour.currentCost) {
          continue;
        }

        neighbour.currentCost = possibleG;
        neighbour.estimatedCostRemaining = heuristic(neighbour, end);
        neighbour.totalCost =
          neighbour.currentCost + neighbour.estimatedCostRemaining;
        neighbour.parent = current;
      }
    }
  }

  //no solution by default
  return [];
};

// // request data when looking for a game by name
// let singleGameReqData = (game) => {
//   return `fields: similar_games; search: "${game}";`;
// };

// // request data when looking for multiple games by id
// let multipleGameReqData = (gameData) => {
//   let ids = gameData.id.toString();

//   // set max of 9 to ensure searched game isn't excluded
//   // request only returns 10 results in ascending order of id
//   let count = gameData.similar_games.length;

//   if (count >= 10) count = 9;

//   for (let i = 0; i < count; i++) {
//     ids = ids.concat(",");
//     ids = ids.concat(gameData.similar_games[i].toString());
//   }

//   return `fields name, rating, summary; where id = (${ids});`;
// };

// // generates request config
// let buildReqConfig = (data) => {
//   return {
//     method: "post",
//     url: "https://api.igdb.com/v4/games",
//     headers: {
//       "Client-ID": `${process.env.IGDB_CLIENT_ID}`,
//       Authorization: `${process.env.IGDB_AUTHORIZATION}`,
//       "Content-Type": "text/plain",
//     },
//     data: data,
//   };
// };

module.exports = router;
