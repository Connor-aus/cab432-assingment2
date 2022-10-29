const express = require("express");
const router = express.Router();

// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");

// Set the region
AWS.config.update({
  region: "ap-southeast-2",
});

// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

// Create variables to hold numeric key values
let count = 0;

router.get("/", async (req, res) => {
  try {
    await getRequest();

    res.json(count);

    console.log(`Successful get request for counter, result : ${count}`);
  } catch (err) {
    console.log(`Error executing get request for counter : ` + err);
  }
});

// get request params
var getParams = {
  TableName: "n8844488_assignment1",
  Key: { "qut-username": "n8844488@qut.edu.au", "my-basic-key": "01234567" },
};

// get request
var getRequest = async () =>
  await docClient
    .get(getParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data.Item);
        count = data.Item.counter;
      }
    })
    .promise();

module.exports = router;
