const express = require("express");
const router = express.Router();
const lib = require("../modules/lib");
const dynamoDB = require("../modules/dynamoDB");
const elasticache = require("../modules/elasticache");
const astar = require("../modules/pathAstar");
const bfs = require("../modules/pathBFS");
const dijkstras = require("../modules/pathDijkstras");

router.get("/:cols/:rows/:seed", async (req, res) => {
  try {
    // database key
    var responseId = `${req.params.cols}x${req.params.rows}-${req.params.seed}`;

    // check cache
    try {
      var redisClient = elasticache.redisSetup();

      var getResult = await redisClient.get(responseId);

      if (getResult != null) {
        console.log("CACHE RESULT ___________________________");
        console.log(getResult);

        res.json(getResult);
        console.log("Astar response sent from cache", getResult);

        return;
      }
    } catch (err) {
      console.log(err);
    }

    try {
      // check dynamo database
      getResult = await dynamoDB.dynamoGet(responseId);

      if (getResult.Item != null) {
        // update cache
        // await redisClient.setEx(responseId, 3600, JSON.stringify({ getResult }));

        res.json(getResult);

        console.log("Astar response sent from DB");

        return;
      }
    } catch (err) {
      console.log("Failed to get from DB: ", err);

      // if resource not found, try create table in DB
      if (err.code == "ResourceNotFoundException") console.log("second");
      {
        try {
          await dynamoDB.dynamoCreate();
        } catch (err) {
          console.log("Error creating table: ", err);
        }
      }
    }

    var blankGrid = lib.makeGrid(req.params.cols, req.params.rows);
    var maze = lib.generateMaze(blankGrid, req.params.seed);

    // // select algorithm
    // if (req.params.alg == "Astar") results = astar.calculateRoute(maze);
    // else if (req.params.alg == "BFS") results = bfs.calculateRoute(maze);
    // else if (req.params.alg == "Dijkstras")
    //   results = dijkstras.calculateRoute(maze);

    // get algorithm paths and costs
    var astarResults = astar.calculateRoute(maze);
    var bfsResults = bfs.calculateRoute(maze);
    var dijkstraResults = dijkstras.calculateRoute(maze);

    // // no route found
    // if (results.length < 1) {
    //   res.json([]);
    //   return;
    // }

    var astarCoords = lib.getCoords(astarResults[0]);
    var astarCost = astarResults[1];
    var bfsCoords = lib.getCoords(bfsResults[0]);
    var bfsCost = bfsResults[1];
    var dijkstraCoords = lib.getCoords(dijkstraResults[0]);
    var dijkstraCost = dijkstraResults[1];

    var response = lib.generateResponse(
      astarCoords,
      astarCost,
      bfsCoords,
      bfsCost,
      dijkstraCoords,
      dijkstraCost
    );

    console.log("getresult: ", getResult);

    // save to db and cache
    try {
      await dynamoDB.dynamoPut(responseId, response);
      await redisClient.setEx(responseId, 3600, JSON.stringify({ response }));
    } catch (err) {
      console.log("Failed to update DB or cache: ", err);
    }

    res.json(response);
    console.log(`${req.params.alg} response sent: `, response);
  } catch (err) {
    console.log("Error calculating route Astar: ", err);
  }
});

module.exports = router;
