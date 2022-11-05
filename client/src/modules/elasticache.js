import { createClient } from 'redis';

// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");

// Set the region
AWS.config.update({
  region: "ap-southeast-2",
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  aws_session_token: process.env.AWS_SESSION_TOKEN,
});

const elasti = "cab432mascon-001.km2jzi.0001.apse2.cache.amazonaws.com:6379";
var redisClient = createClient({
  url: `redis://${elasti}`,
});

function redisSetup() {
  (async () => {
    try {
      await redisClient.connect();
      console.log(`connected to Redis`);
    } catch (err) {
      console.log(`Error connecting to Redis ${err}`);
    }
  })();
}

redisSetup();

export default async function redisGet(key) {
  return await redisClient.get(key);
}