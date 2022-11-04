import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


require('dotenv').config();
const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const axios = require('axios');
const redis = require('redis');


/////    dynamoDB //////////////////////////////////////////////////////

let awsConfig = {
  region: "ap-southeast-2",
  endpoint: "http://dynamodb.ap-southeast-2.amazonaws.com",
  // "accessKeyId": process.env.AWS_ACCESS_KEY_ID, "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY,
  // "sessionToken": process.env.AWS_SESSION_TOKEN,
  accessKeyId: "ASIA5DYSEEJ47NBDLQHE",
  secretAccessKey: "qaPCUB8abhjeZHQEq67XZVKwzboeTup8e3OH1BNQ",
  sessionToken: "IQoJb3JpZ2luX2VjEOH//////////wEaDmFwLXNvdXRoZWFzdC0yIkcwRQIgD43YUbUX8pJFyevvq0Te70N7wDSolkSy9CKyN3Eh7j8CIQCy41GtpKHkdOFWohEPdLlijzxOlW7Yp7cpkJTfEGMwdyq5AwjK//////////8BEAIaDDkwMTQ0NDI4MDk1MyIMtnkTc+38+0SyvMzSKo0DeohCxCzvVk7Ymwuv2Ge9USlCpNojchjJln20+PtoSYhKsBygTz4bQ4au4mlSfUBGgSY40b6ZINd3/UdzXBr7yBI7UUPxqhAL/7fWuyOVcn7AyZd20x4gv4aFusnfXrwaHvCHgYedzBiOklMwe939xEhKTiR/ZKUuska8hVZF6KM+g4onBNNTUcZxPJXo0fEIOkgSC+dAokVij+lRVhVyiLtSJ0nDQHiVXKiGGS5UeYsz8cUGl3LELhvj1pySHAyxXkSHwu3MPf6/kpL+hMSUsUIkpnLA6ALtEtaP43Ox6/yR1zyD6UvAiHea4nyzEp6HdDrLhqUhnzTX5HJisURHPCAJTmSIbsvcJFlKWxEv6kvz5CDkJeC2MDuBhtjs5zKYbwFgD5/JSlzS/VDQUaF9k3gnEhchWM1BFercVcebHKBAUvNt5r+iG5mt8WeHXtfsj1e2of4BC2lg0o/gleXcl/RceRYzYKH2m+ghc7oV+Ig0uzXjaXRdfx/57pZbkDd364B4nDUOggKrFxSLjTD2yZGbBjqmAYkT55RbiBgZYujmqKs7vxEqPe5cUUk1b/vNMapi/zW8QZ9z5CU6+IRmFHmy4KGpjgT7eloODWGX4MXv7GANQob7PLDIANjZ7haRtEpPwrZFpp0EMrxBkpeeecDVR2TXAm+N4GxG9UNdenKP2gmOuliBzN5vVIkjOuyxw3BlAGUyrz7+k/MnWDkmDX502DrUXIYaER76ZuSg19YnY97bVnS0tBAkBjY="
};

AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();

const seed = 232;
const cols = 1343;

// same seed value = overwrites the table row
let items = [
  { seed: seed, length: cols, path: [[1, 3], [2, 3]], counter: 4 },
  { seed: 2342, length: 1, path: [[1, 3], [2, 3]], counter: 0 },
  { seed: 234, length: 1, path: [[1, 3], [2, 3]], counter: 0 },
]

items.forEach(item => {
  const params = {
    TableName: 'csb432mascon',
    Key: {
      "qut-username": "n10838601@qut.edu.au",
    },
    Item: {
      "qut-username": "n10838601@qut.edu.au",
      'seed': item.seed,
      'length': item.length,
      'path': item.path,
      'counter': item.counter,
    }
  }
  docClient.put(params, (err, data) => {
    if (err) console.log(err)
    else console.log(data)
  })
})
/////////////////////////////////////////////////////////////////////////////////////////////////


const {
  ElastiCacheClient,
  AddTagsToResourceCommand,
} = require("@aws-sdk/client-elasticache");

const elasti = "cab432mascon-001.km2jzi.0001.apse2.cache.amazonaws.com:6379";
var redisClient = redis.createClient({
  url: `redis://${elasti}`,
});


// Create unique bucket name
const bucketName = "cab432n10838601-wikipedia-store2";
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
(async () => {
  try {
    await redisClient.connect();
    s3.createBucket({ Bucket: bucketName });
    console.log(`Created bucket: ${bucketName}`);
  } catch (err) {
    // We will ignore 409 errors which indicate that the bucket already exists
    if (err.statusCode !== 409) {
      console.log(`Error creating bucket: ${err}`);
    }
  }
})();

const key = "maze";
const s3key = `wikipedia - ${key}`

const objectParams = {
  Bucket: bucketName,
  Key: s3key,
};

(async () => {
  try {
    await s3.putObject(objectParams).promise()
    console.log(`Successfully uploaded data to ${bucketName} / ${s3key}`);
  } catch (err) {
    console.log(err, err.stack);
  }
})();


// Elasticache
// a client can be shared by different commands.
const client = new ElastiCacheClient({ region: "ap-southeast-2" });

// const params = {
//     key: "test",
//     value: "testvalue",
// };

// const command = new AddTagsToResourceCommand(params);

// // elasticache
// var test = async () => {
//     try {
//         console.log("testing send");
//         console.log(command);

//         const data = await client.send(command);

//         console.log("data = " + data);
//         // process data.
//     } catch (error) {
//         // error handling.
//     } finally {
//         console.log("finished");
//     }
// };

// test();



app.get("/api/store", async (req, res) => {
  const key = req.query.key.trim();
  const searchUrl =
    `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${key}`;
  const s3key = `wikipedia-${key}`;
  const redisKey = `wikipedia:${key}`;
  // Check S3
  const params = { Bucket: bucketName, Key: s3key };
  const result = await redisClient.get(redisKey);

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
app.listen(3001, () => {
  console.log("Server listening on port: ", 3001);
});


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
