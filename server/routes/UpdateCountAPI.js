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

router.get("/:count", async (req, res) => {
  try {
    let count = parseInt(req.params.count) + 1;

    // set new value in request params
    updateParams.ExpressionAttributeValues[":n"] = count;

    await updateRequest();

    res.json(count);

    console.log(`Successfully updated counter to : ${count}`);
  } catch (err) {
    console.log(`Error updating counter : ` + err);
  }
});

//update request params
var updateParams = {
  TableName: "n8844488_assignment1",
  ExpressionAttributeNames: {
    "#c": "counter",
  },
  Key: {
    "qut-username": "n8844488@qut.edu.au",
    "my-basic-key": "01234567",
  },
  UpdateExpression: "set #c = :n",
  ExpressionAttributeValues: {
    ":n": 0,
  },
};

// update request
var updateRequest = async () =>
  await docClient
    .update(updateParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
    })
    .promise();

module.exports = router;
