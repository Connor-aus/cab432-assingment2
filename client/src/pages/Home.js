import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";

import { SearchBar } from "../components/SearchBar";
import { GameList } from "../components/GameList";
import { GameInfo } from "../components/GameInfo";
import { Video } from "../components/Video";

export function Home() {
  const [search, setSearch] = useState("");
  const [games, setGames] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [videoTrailerId, setVideoTrailerId] = useState(null);
  const [videoReviewId, setVideoReviewId] = useState(null);
  const [videoStoryId, setVideoStoryId] = useState(null);
  const [videoPlaythroughId, setVideoPlaythroughId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // callback functio for SearchBar
  const searchGame = (searchText) => {
    setSearch(searchText);
  };

  // callback functio for GameList
  const selectGame = (selection) => {
    setSelectedGame(selection);
  };

  // triggers API request for game data
  useEffect(() => {
    (async () => {
      if (search === "") return;

      try {
        let res = await fetch(`/search/${search}`);
        let data = await res.json();

        // display error if search returns no results
        if (data === 0) {
          setErrorMessage("game not found");
          return;
        }

        setErrorMessage("");
        setSelectedGame(data[0]);
        setGames(data);

        console.log("Successful request for game data : " + search);
      } catch (err) {
        setErrorMessage("error gathering game data");
        console.log("Error fetching data : " + err);
      }
    })();
  }, [search]);

  // triggers API request for video ids
  useEffect(() => {
    (async () => {
      if (selectedGame == null) return;

      try {
        let res = await fetch(`/video/${selectedGame.name} game trailer`);
        let data = await res.json();
        setVideoTrailerId(data);

        console.log("Successful request for game trailer : " + selectedGame.name);
      } catch (err) {
        console.log("Error fetching video trailer data : " + err);
      }

      try {
        let res = await fetch(`/video/${selectedGame.name} game review`);
        let data = await res.json();
        setVideoReviewId(data);

        console.log("Successful request for game review : " + selectedGame.name);
      } catch (err) {
        console.log("Error fetching video review data : " + err);
      }

      try {
        let res = await fetch(`/video/${selectedGame.name} game story`);
        let data = await res.json();
        setVideoStoryId(data);

        console.log("Successful request for game story : " + selectedGame.name);
      } catch (err) {
        console.log("Error fetching video story data : " + err);
      }

      try {
        let res = await fetch(`/video/${selectedGame.name} playthrough ep 1`);
        let data = await res.json();
        setVideoPlaythroughId(data);

        console.log("Successful request for game playthrough : " + selectedGame.name);
      } catch (err) {
        console.log("Error fetching video playthrough data : " + err);
      }
    })();
  }, [selectedGame]);

  return (
    <Container fluid className="bordercon">
      <Row style={{ color: "rgb(255, 188, 62)", marginTop: "30px" }}>
        <h1>Welcome to Maze Racer</h1>
      </Row>
      <Row className="borderr">
        <Col className="bordercol">
          <SearchBar onSubmit={searchGame} />
        </Col>
      </Row>
      {error(errorMessage)}
      <Row className="borderr">
        <Col className="bordercol">
          {games ? <GameList games={games} selectGame={selectGame} /> : null}
        </Col>
        <Col className="bordercol">
          {selectedGame ? <GameInfo game={selectedGame} /> : null}
        </Col>
      </Row>
      <Row className="borderr">
        <Col className="bordercol">
          {videoTrailerId ? (
            <Video
              videoId={videoTrailerId}
              videoDescription={`${selectedGame.name} Trailer`}
            />
          ) : null}
        </Col>
        <Col className="bordercol">
          {videoReviewId ? (
            <Video
              videoId={videoReviewId}
              videoDescription={`${selectedGame.name} Review`}
            />
          ) : null}
        </Col>
      </Row>
      <Row className="borderr">
        <Col className="bordercol">
          {videoStoryId ? (
            <Video
              videoId={videoStoryId}
              videoDescription={`${selectedGame.name} Story`}
            />
          ) : null}
        </Col>
        <Col className="bordercol">
          {videoPlaythroughId ? (
            <Video
              videoId={videoPlaythroughId}
              videoDescription={`${selectedGame.name} Playthrough`}
            />
          ) : null}
        </Col>
      </Row>
    </Container>
  );
}

// error message if no game is found
const error = (message) => {
  if (message === "") return;

  return (
    <Row style={{ color: "white" }}>
      <h4>
        <i>{message}</i>
      </h4>
    </Row>
  );
};
