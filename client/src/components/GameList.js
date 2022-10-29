import React, { useState, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import ToggleButton from "react-bootstrap/ToggleButton";
import ListGroup from "react-bootstrap/ListGroup";

export function GameList(props) {
  const [games, setGames] = useState(null);
  const [selectedGame, setSelectedGame] = useState(props.games[0].name);

  // re-render when new arguments passed to function
  useEffect(() => {
    (async () => {
      setGames(props.games);
    })();
  }, [props.games]);

  if (games == null) return null;

  // standard button output
  function renderGameButton(game) {
    return (
      <ListGroup.Item style={{ backgroundColor: "rgb(31, 34, 51)" }}>
        <ToggleButton
          variant="outline-warning"
          type="checkbox"
          checked={game.name === selectedGame}
          onClick={() => setGame(game)}
        >
          {game.name}
        </ToggleButton>
      </ListGroup.Item>
    );
  }

  // highlights selected game and triggers callback function
  function setGame(game) {
      props.selectGame(game);
      setSelectedGame(game.name);
  }

  return (
    <Container>
      <Row style={{ color: "white" }}>
        <h3>Searched Game</h3>
      </Row>
      <Row>
        <ListGroup variant="flush">
          <ListGroup.Item style={{ backgroundColor: "rgb(31, 34, 51)" }}>
            <ToggleButton
              variant="outline-danger"
              type="checkbox"
              checked={games[0].name === selectedGame}
              onClick={() => setGame(games[0])}
            >
              {games[0].name}
            </ToggleButton>
          </ListGroup.Item>
          <br />
          <Row style={{ color: "white" }}>
            <h3>Similar Games</h3>
          </Row>
          {renderGameButton(games[1])}
          {renderGameButton(games[2])}
          {renderGameButton(games[3])}
          {renderGameButton(games[4])}
          {renderGameButton(games[5])}
        </ListGroup>
      </Row>
    </Container>
  );
}
