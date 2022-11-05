const express = require("express");
const router = express.Router();
const lib = require("../modules/lib");
const dynamoDB = require("../modules/dynamoDB");
const elasticache = require("../modules/elasticache");
const astar = require("../modules/pathAstar");
const bfs = require("../modules/pathBFS");
const dijkstras = require("../modules/pathDijkstras");

router.get("/:alg/:cols/:rows/:seed", async (req, res) => {
  try {
    // database key
    var responseId = `${req.params.cols}x${req.params.rows}-${req.params.seed}-${req.params.alg}`;

    // check cache
    try {
      var redisClient = elasticache.redisSetup();

      var getResult = await redisClient.get(responseId);

      if (getResult != null) {
        console.log("CACHE RESULT ___________________________")
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
      if (err.code == "ResourceNotFoundException") console.log("second"); {

        try {
          await dynamoDB.dynamoCreate();
        } catch (err) {
          console.log("Error creating table: ", err);
        }
      }
    }

    var blankGrid = lib.makeGrid(req.params.cols, req.params.rows);
    var maze = lib.generateMaze(blankGrid, req.params.seed);
    var results = [];

    // select algorithm
    if (req.params.alg == "Astar") results = astar.calculateRoute(maze);
    else if (req.params.alg == "BFS") results = bfs.calculateRoute(maze);
    else if (req.params.alg == "Dijkstras")
      results = dijkstras.calculateRoute(maze);

    // no route found
    if (results.length < 1) {
      res.json([]);
      return;
    }

    var routeCoords = lib.getCoords(results[0]);
    var cost = results[1];
    var response = lib.generateResponse(responseId, routeCoords, cost);

    // save to db and cache
    try {
      await dynamoDB.dynamoPut(responseId, routeCoords, cost);
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
