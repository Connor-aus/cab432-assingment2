import React from "react";
import { Container, Row } from "react-bootstrap";

export function Video(props) {
  const url = `https://www.youtube.com/embed/${props.videoId}`;

  return (
    <Container>
      <Row>
        <div className="ratio ratio-16x9">
          <iframe src={url} title={props.description} allowFullScreen />
        </div>
      </Row>
      <Row style={{ color: 'white'}}>
        <h5>{props.videoDescription}</h5>
      </Row>
    </Container>
  );
}
