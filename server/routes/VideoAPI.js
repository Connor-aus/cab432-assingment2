const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/:search", async (req, res) => {
  try {
    let config = buildReqConfig(req.params.search);

    let response = await axios(config);

    let videoId = getVideoId(response.data);
    res.json(videoId);

    console.log(`Successful query: YouTube video : ${req.params.search}`);
  } catch (err) {
    console.log(`Error fetching video data for ${req.params.search} : ` + err);
  }
});

let data = "";

// generates request config
let buildReqConfig = (search) => {
  let =
    url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${search}&type=video&key=${process.env.YOUTUBE_APIKEY}`;

  return {
    method: "get",
    url: url,
    headers: {},
    data: data,
  };
};

let getVideoId = (responseData) => {
  let id = responseData.items[0].id.videoId;
  return id;
};

module.exports = router;
