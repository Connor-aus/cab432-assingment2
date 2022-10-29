const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/:game", async (req, res) => {
  let gameData;
  let searchedGame;

  // API1: to find game and similar games
  try {
    let data = singleGameReqData(req.params.game);
    let config = buildReqConfig(data);

    let response = await axios(config);

    // return 0 if search return no results
    if (response.data.length === 0) {
      res.json(0);
      console.log(`No game found for search : ${req.params.game}`)
      return;
    }

    // initialises data used for API2 request
    gameData = response.data[0];
    searchedGame = gameData.id;

    console.log(`Successful query: game search for ${req.params.game}`);
  } catch (err) {
    console.log("Error fetching game search : " + err);
  }

  // API2: find info relating to multiple games
  try {
    let data = multipleGameReqData(gameData);
    let config = buildReqConfig(data);

    let response = await axios(config);

    // searched game filtered from array and added to beginning
    responseData = response.data.filter(game => {
      if (game.id == searchedGame)
        searchedGame = game;
      else
        return game;
    });
    responseData.unshift(searchedGame);

    res.json(responseData);

    console.log(`Successful query: search info for ${req.params.game} and similar games`);
  } catch (err) {
    console.log("Error fetching game info : " + err);
  }
});

// request data when looking for a game by name
let singleGameReqData = (game) => {
  return `fields: similar_games; search: "${game}";`;
};

// request data when looking for multiple games by id
let multipleGameReqData = (gameData) => {
  let ids = gameData.id.toString();
  
  // set max of 9 to ensure searched game isn't excluded
  // request only returns 10 results in ascending order of id
  let count = gameData.similar_games.length;

  if (count >= 10)
    count = 9;

  for (let i = 0; i < count; i++) {
    ids = ids.concat(",");
    ids = ids.concat(gameData.similar_games[i].toString());
  }

  return `fields name, rating, summary; where id = (${ids});`;
};

// generates request config
let buildReqConfig = (data) => {
  return {
    method: "post",
    url: "https://api.igdb.com/v4/games",
    headers: {
      "Client-ID": `${process.env.IGDB_CLIENT_ID}`,
      Authorization: `${process.env.IGDB_AUTHORIZATION}`,
      "Content-Type": "text/plain",
    },
    data: data,
  };
};

module.exports = router;
