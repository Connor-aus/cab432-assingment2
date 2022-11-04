import ".././App.css";
import React from "react";

export default function Instructions() {
  return (
    <div>
      <h5 style={{ color: "whitesmoke", fontStyle: "italic" }}>
        Instructions: This is a game in which you get to race against some of
        the most efficient, and least efficient, sorting algorithms on the
        market. The number next to each of the player's names represents the
        number of calculations that were required to find the correct path.
      </h5>
      <br></br>
      <h5 style={{ color: "whitesmoke", fontStyle: "italic" }}>
        To begin, enter a seed value above and select "Generate Maze". Remember
        this seed value if you want to play the same maze again. You can use the
        "w, a, s, d" keys to move you player.
      </h5>
      <br></br>
      <h5 style={{ color: "whitesmoke", fontStyle: "italic" }}>
        See if you can beat the mighty algorithms - maybe using less
        calculations. Study your maze, then press "space" to begin the race.
      </h5>
      <br></br>
    </div>
  );
}
