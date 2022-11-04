import ".././App.css";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { Container, Col } from "react-bootstrap";

export default function SearchBar(props) {
  const [searchText, setsearchText] = useState("");
  const placeholderText = " enter a seed value";

  // generate error if seed value is not a number
  // or if the seed value is < 1

  return (
    <Container>
      <Col>
        <input
          type="text"
          placeholder={placeholderText}
          value={searchText}
          onChange={(e) => setsearchText(e.target.value)}
          style={{
            minWidth: "75px",
            borderRadius: "10px",
            paddingTop: "5px",
            paddingBottom: "5px",
            paddingLeft: "5px",
          }}
        />
        <Button
          variant="warning"
          onClick={() => props.onSubmit(searchText)}
          style={{ marginLeft: "15px", marginBottom: "5px" }}
        >
          Generate Maze
        </Button>
      </Col>
    </Container>
  );
}
