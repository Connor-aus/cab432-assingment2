const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const cors = require('cors');
require('dotenv').config();

const astarRouter = require('./routes/AstarAPI');
const bfsRouter = require('./routes/BFSAPI');
const dijkstrasRouter = require('./routes/DijkstrasAPI');
const getCountRouter = require('./routes/GetCountAPI');
const updateCountRouter = require('./routes/UpdateCountAPI');

app.use(cors());

// Serve out any static assets correctly
app.use(express.static("../client/build"));

// Astar pathfinder
app.use("/Astar", astarRouter);

// Breadth-First-Search pathfinder
app.use("/BFS", bfsRouter);

// Dijkstra's pathfinder
app.use("/Dijkstras", dijkstrasRouter);

// get counter
app.use("/count/get", getCountRouter, updateCountRouter);

// update counter
app.use("/count/update", updateCountRouter);


app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
