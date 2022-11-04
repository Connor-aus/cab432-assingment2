const express = require("express");
const axios = require("axios");

const router = express.Router();

const lib = require("../modules/lib");

require('dotenv').config();
const app = express();
const AWS = require('aws-sdk');
const redis = require('redis');


// Set the region
AWS.config.update({
  region: "ap-southeast-2",
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  aws_session_token: process.env.AWS_SESSION_TOKEN,
});


////////////////////////////////////////////////////////////////////////////////////
const {
  ElastiCacheClient,
} = require("@aws-sdk/client-elasticache");

const client = new ElastiCacheClient({ region: "ap-southeast-2" });

const elasti = "cab432mascon-001.km2jzi.0001.apse2.cache.amazonaws.com:6379";
var redisClient = redis.createClient({
  url: `redis://${elasti}`,
});


//const bucketName = "cab432n10838601-wikipedia-store2";
//const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
(async () => {
  try {
    await redisClient.connect();
    // s3.createBucket({ Bucket: bucketName });
    console.log(`Created redis bucket: ${bucketName}`);
  } catch (err) {
    // We will ignore 409 errors which indicate that the bucket already exists
    if (err.statusCode !== 409) {
      console.log(`Error creating redis bucket: ${err}`);
    }
  }
})();
//const key = "testkey";
//const s3key = `${key}`;
// const objectParams = {
//   Bucket: bucketName,
// //  Key: s3key,
// };

// (async () => {
//   try {
//  //   await s3.putObject(objectParams).promise()
//     console.log(`Successfully uploaded data to ${bucketName} / ${s3key}`);
//   } catch (err) {
//     console.log(err, err.stack);
//   }
// })();

app.get(async (req, res) => {
  //const key = req.query.key.trim();
  //const searchUrl =
  //  `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${key}`;
  const s3key = `wikipedia-${key}`;
  const redisKey = `wikipedia:${key}`;
  // Check S3
  const params = { Bucket: bucketName, Key: s3key };


  try {
    if (result) {
      const resultJSON = JSON.parse(result);
      res.json(resultJSON);
    } else {
      const s3Result = await s3.getObject(params).promise();
      const s3JSON = JSON.parse(s3Result.Body);
      redisClient.setEx(
        redisKey,
        3600,
        //JSON.stringify({ source: "From Redis Cache", ...s3JSON })
        JSON.stringify({ ...s3JSON, source: "From Redis Cache" })
      );

      res.json(s3JSON);
    }

  } catch (err) {
    if (err.statusCode === 404) {
      response = await axios.get(searchUrl);
      const responseJSON = response.data;
      redisClient.setEx(
        redisKey,
        3600,
        JSON.stringify({ source: "From Redis Cache", ...responseJSON })
      );
      const body = JSON.stringify({ source: "S3 bucket", ...responseJSON });
      const objectParams = { Bucket: bucketName, Key: s3key, Body: body };
      await s3.putObject(objectParams).promise();
      console.log(`Successfully uploaded data to ${bucketName}/${s3key}`);
      res.json({ source: "From wikipedia API", ...responseJSON });
    } else {
      res.json(err);
    }
  }
});

/////////////////////////////////////////////////////////////////////////////////////








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
    //const responseJSON = JSON.parse(response);
    // save path to database

    // save path to cache
    redisClient.setEx(
      responseId,
      //3600,
      //JSON.stringify({ source: "From Redis Cache", ...s3JSON })
      JSON.stringify({ ...response })
    );

    const result = await redisClient.get(responseId);
    console.log("=====redistest========");
    console.log(result);
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