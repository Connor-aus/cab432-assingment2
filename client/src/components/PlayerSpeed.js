import ".././App.css";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { Container, Col } from "react-bootstrap";

export default function PLayerSpeed(props) {
  return (
    <Col>
      <h4 style={{ color: `${props.colour}`, fontWeight: "bold" }}>
        Dijkstra's = {speedCheck(props.speed)}
      </h4>
    </Col>
  );
}

function speedCheck(speed) {
  if (speed == 0) return "?";
  else return speed;
}
