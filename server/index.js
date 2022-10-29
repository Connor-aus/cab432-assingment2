const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const cors = require('cors');
require('dotenv').config();

const gameSearchRouter = require('./routes/GameSearchAPI');
const videoRouter = require('./routes/VideoAPI');
const getCountRouter = require('./routes/GetCountAPI');
const updateCountRouter = require('./routes/UpdateCountAPI');

app.use(cors());

// Serve out any static assets correctly
app.use(express.static("../client/build"));

// search for a game
app.use("/search", gameSearchRouter);

// get videos relating to game
app.use("/video", videoRouter);

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
