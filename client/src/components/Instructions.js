import ".././App.css";
import React from "react";

export default function Instructions() {
  return (
    <div className="inst">
      <p>
        Instructions: This is a game in which you get to race against some of
        the most efficient, and least efficient, sorting algorithms on the
        market. The number next to each of the player's names represents the
        number of calculations that were required to find the correct path.
      </p>
      <p>
        To begin, enter a seed value above and select "Generate Maze". Remember
        this seed value if you want to play the same maze again. You can use the
        "W, A, S, D" keys to move you player.
      </p>
      <p>
        See if you can beat the mighty algorithms - maybe using less
        calculations. Study your maze, then press "space" to begin the race.
      </p>
    </div>
  );
}
