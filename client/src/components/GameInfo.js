import React, { useEffect } from "react";
import { Container, Row } from "react-bootstrap";

export function GameInfo(props) {
  let rating = props.game.rating?.toString() ?? "-";

  // re-render function when new argument passed
  useEffect(() => {
      (async () => {})();
  }, [props.game]);

  return (
    <Container>
      <Row style={{ color: 'white'}}>
        <h2>{props.game.name}</h2>
        <br/>
        <br/>
        <br/>
        <h4>Rating</h4>
        <h4><i>{(rating.length > 4) ? rating.substring(0, 4) : rating} / 100</i></h4>
        <br/>
        <br/>
        <h4>Summary</h4>
        <h4><i>{props.game.summary ?? "not found"}</i></h4>
      </Row>
    </Container>
  );
}
