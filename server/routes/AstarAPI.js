const express = require("express");
const router = express.Router();
const lib = require("../modules/lib");
const dynamoDB = require("../modules/dynamoDB");
const elasticache = require("../modules/elasticache");

router.get("/:cols/:rows/:seed", async (req, res) => {
  try {   
    // database key
    var responseId = `${req.params.cols}x${req.params.rows}-${req.params.seed}-Astar`;
    
    // TODO move Redis get to front end
    // check cache
    try {
      var redisClient = elasticache.redisSetup();
      
      var getResult = await redisClient.get(responseId);
      
      if (getResult != null) {
        res.json(getResult);
        console.log("Astar response sent from cache", getResult);
        
        return;
      }
    } catch (err) {
      console.log(err);
    }
    
    console.log("received");
    // check dynamo database
    try {
      getResult = await dynamoDB.dynamoGet(responseId);
  
      if (getResult.Item != null) {
        // update cache
        redisClient.setEx(responseId, 3600, JSON.stringify({ getResult }));
  
        res.json(getResult);

        console.log("Astar response sent from DB");
  
        return;
      }
    } catch (err) {
      console.log(err);
    }

    var blankGrid = lib.makeGrid(req.params.cols, req.params.rows);
    var maze = lib.generateMaze(blankGrid, req.params.seed);
    var results = calculateRoute(maze);

    // no route found
    if (results.length < 1) {
      res.json([]);
      return;
    }

    var routeCoords = lib.getCoords(results[0]);
    var cost = results[1];
    var response = lib.generateResponse(responseId, routeCoords, cost);

    // save to cache and db
    try{
      await dynamoDB.dynamoPut(responseId,routeCoords,cost);
      redisClient.setEx(responseId, 3600, JSON.stringify({ response }));

    } catch (err) {
      console.log(err)
    }

    res.json(response);
    console.log("Astar response sent", response);
  } catch (err) {
    console.log("Error calculating route Astar: ", err);
  }
});

//heuristic we will be using - Manhattan distance
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
      // and number of calculations
      var result = [];
      result.push(path.reverse());
      result.push(calcs);

      return result;
    }

    //remove current from openSet
    openSet.splice(lowestIndex, 1);

    //add current to closedSet
    closedSet.push(current);

    lib.updateNeighbours(current, maze);
    var neighbours = current.neighbours;

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
