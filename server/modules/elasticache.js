const redis = require("redis");

// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");

// Set the region
AWS.config.update({
  region: "ap-southeast-2",
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  aws_session_token: process.env.AWS_SESSION_TOKEN,
});

function redisSetup() {
  const elasti = "cab432mascon-001.km2jzi.0001.apse2.cache.amazonaws.com:6379";
  var redisClient = redis.createClient({
    url: `redis://${elasti}`,
  });

  (async () => {
    try {
      await redisClient.connect();
      console.log(`connected to Redis`);
    } catch (err) {
      console.log(`Error connecting to Redis ${err}`);
    }
  })();

  return redisClient;
}

module.exports = { redisSetup };
