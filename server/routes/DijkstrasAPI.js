const express = require("express");
const axios = require("axios");

const router = express.Router();

const lib = require("../modules/lib");

router.get("/:cols/:rows/:seed", async (req, res) => {
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

    var responseId = `${req.params.cols}x${req.params.rows}-${req.params.seed}-Dijkstra`;
    var response = generateResponse(responseId, routeCoords, cost);

    // save path to database

    // save path to cache

    var later = new Date().getTime();
    var totalTime = later - now;
    console.log("total D time = " + totalTime);
    console.log("length = " + results[0].length);

    res.json(response);

    console.log("Dijkstras response sent");
  } catch (err) {
    console.log("Error calculating route Astar: ");
    console.log(err);
  }
});

// get coordinates from result
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

//heuristic we will be using - Manhattan distance
//for other heuristics visit - https://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
function heuristic(position0, position1) {
  let d1 = Math.abs(position1.x - position0.x);
  let d2 = Math.abs(position1.y - position0.y);

  return d1 + d2;
}

//A star search implementation
var calculateRoute = (maze) => {
  var start = maze[0][0];
  var end = maze[maze.length - 1][maze[0].length - 1];
  var openSet = []; // unevaluated cells
  var closedSet = []; // completely evaluated cells
  var path = []; // path to end
  var calcs = 0; // number of calculations taken

  openSet.push(start);

  while (openSet.length > 0) {
    //assumption lowest index is the first one to begin with
    let lowestIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      calcs++;
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

      // return the traced path
      var result = [];
      result.push(path.reverse());
      result.push(calcs);

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

module.exports = router;