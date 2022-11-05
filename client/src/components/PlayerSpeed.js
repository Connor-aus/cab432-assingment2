import ".././App.css";
import React from "react";
import { Col } from "react-bootstrap";

export default function PLayerSpeed(props) {
  return (
    <Col>
      <h4 style={{ color: `${props.colour}`, fontWeight: "bold" }}>
        {props.name} = {speedCheck(props.speed)}
      </h4>
    </Col>
  );
}

function speedCheck(speed) {
  if (speed == 0) return "?";
  else return speed;
}
