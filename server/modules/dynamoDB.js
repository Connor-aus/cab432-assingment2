// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
// const { ConfigurationServicePlaceholders } = require("aws-sdk/lib/config_service_placeholders");

// Set the region
AWS.config.update({
  region: "ap-southeast-2",
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  aws_session_token: process.env.AWS_SESSION_TOKEN,
});

// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

async function dynamoPut(id, coords, cost) {
    putParams.Item["id"] = id;
    putParams.Item["path"] = coords;
    putParams.Item["speed"] = cost;

    try {
        var result = await putRequest();
    } catch (err) {

    }
    return result;
}

// DB put request params
var putParams = {
    TableName: "mascon1",
    Item: {
      "qut-username": "n8844488@qut.edu.au",
      id: ``,
      path: [],
      speed: 0,
    },
  };
  
  // DB put request
  var putRequest = async () => {
    await docClient
      .put(putParams, function (err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data);
        }
      })
      .promise();
  };


async function dynamoGet(id) {
    getParams.Key["id"] = id;

    try {
        var result = await getRequest();
    } catch (err) {

    }
    return result;
}

    // get request params
    var getParams = {
        TableName: "mascon1",
        Key: { "qut-username": "n8844488@qut.edu.au", "id": "test" },
      };
      
      // get request
      var getRequest = async () =>
        await docClient
          .get(getParams, function (err, data) {
            if (err) {
              console.log("Error", err);
            } else {
              console.log("Success", data.Item);
              return data.Item;
            }
          }).promise();

module.exports = { dynamoPut, dynamoGet };
