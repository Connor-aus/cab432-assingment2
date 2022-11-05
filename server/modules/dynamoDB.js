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
var db = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

// create table function
async function dynamoCreate() {
  await createRequest();
}

// create table params
var createParams = {
  TableName: `mascon1`,
  KeySchema: [
    { AttributeName: "qut-username", KeyType: "HASH" }, //Partition key
    { AttributeName: "id", KeyType: "RANGE" }, //Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: "qut-username", AttributeType: "S" },
    { AttributeName: "id", AttributeType: "S" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10,
  },
};

// DB create table request
var createRequest = async () => {
  await db
    .createTable(createParams, function (err, data) {
      if (err) {
        console.error(
          "Unable to create table. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        console.log(
          "Created table. Table description JSON:",
          JSON.stringify(data, null, 2)
        );
      }
    })
    .promise();
};

// DB put function
async function dynamoPut(id, coords, cost) {
  putParams.Item["id"] = id;
  putParams.Item["path"] = coords;
  putParams.Item["speed"] = cost;

  var result = await putRequest();

  return result;
}

// DB put request params
var putParams = {
  TableName: `mascon1`,
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
        console.log("Error in Dynamo put: ", err);
      } else {
        console.log("Success in Dynamo put: ", data.Item);
      }
    })
    .promise();
};

// Db get function
async function dynamoGet(id) {
  getParams.Key["id"] = id;

  var result = await getRequest();

  return result;
}

// DB get request params
var getParams = {
  TableName: `mascon1`,
  Key: { "qut-username": "n8844488@qut.edu.au", id: "test" },
};

// get request
var getRequest = async () =>
  await docClient
    .get(getParams, function (err, data) {
      if (err) {
        console.log("Error in Dynamo get: ", err);
      } else {
        console.log("Success in Dynamo get: ", data.Item);
        return data.Item;
      }
    })
    .promise();

module.exports = { dynamoCreate, dynamoPut, dynamoGet };
