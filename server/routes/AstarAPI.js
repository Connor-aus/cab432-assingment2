const express = require("express");
const axios = require("axios");

const router = express.Router();

const lib = require("../modules/lib");

// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");

// Set the region
AWS.config.update({
  region: "ap-southeast-2",
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  aws_session_token: process.env.AWS_SESSION_TOKEN,
});

console.log(AWS.config.aws_access_key_id);
console.log(AWS.config.aws_secret_access_key);
console.log(AWS.config.aws_session_token);

var responseId = "test";

// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

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

    responseId = `${req.params.cols}x${req.params.rows}-${req.params.seed}-Astar`;
    var response = generateResponse(responseId, routeCoords, cost);

    // save path to database
    // set new value in request params
    updateParams.ExpressionAttributeValues[":n"] = routeCoords;
    await updateRequest();
    await getRequest();

    // save path to cache

    var later = new Date().getTime();
    var totalTime = later - now;
    console.log("total A time = " + totalTime);
    console.log("length = " + results[0].length);

    res.json(response);

    console.log("Astar response sent");
  } catch (err) {
    console.log("Error calculating route Astar: ");
    console.log(err);
  }
});

//update request params
var updateParams = {
  TableName: "mascontest1",
  ExpressionAttributeNames: {
    "#c": "counter",
  },
  Key: {
    "qut-username": "n8844488@qut.edu.au",
    "my-basic-key": `${responseId}`,
  },
  UpdateExpression: "set #c = :n",
  ExpressionAttributeValues: {
    ":n": 0,
  },
};

// update request
var updateRequest = async () => {
  console.log("responseId = " + responseId);
  await docClient
    .update(updateParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
    })
    .promise();
};

let DB = [];

// get request params
var getParams = {
  TableName: "mascontest1",
  Key: { "qut-username": "n8844488@qut.edu.au", "my-basic-key": "test" },
};

// get request
var getRequest = async () =>
  await docClient
    .get(getParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data.Item);
        DB = data.Item.counter;
        console.log("DB = ");
        console.log(DB);
      }
    })
    .promise();

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
