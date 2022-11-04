const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const cors = require('cors');
require('dotenv').config();

const pathFinder = require('./routes/PathfinderAPI');

app.use(cors());

app.use(express.static("../client/build"));

// Pathfinder API endpoint
// Calls correct Pathfinder from within route
app.use("/", pathFinder);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
