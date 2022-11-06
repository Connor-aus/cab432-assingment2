const lib = require("./lib");

// reset visit cells
function resetVisited(maze) {
  for (var i = 0; i < maze.length; i++)
    for (var j = 0; j < maze[0].length; j++) maze[i][j].visited = false;
  return maze;
}

//BFS search implementation
var calculateRoute = (maze) => {
  maze = resetVisited(maze);

  var stack = [];
  var start = maze[0][0];
  var end = maze[maze.length - 1][maze[0].length - 1];
  var calcs = 0; // number of calculations taken
  var current = start;

  stack.push(start);

  //While there are nodes left to visit...
  while (current != end) {
    var current = stack.pop();
    current.visited = true;;
    var x = current.x;
    var y = current.y;
    var moved = false;

    calcs++;
    if (current.right == true) {
      calcs++;

      if (maze[x + 1][y].visited == false) {
        stack.push(current);
        stack.push(maze[x + 1][y]);
        moved == true;
      }
    }

    if (moved == true) continue;

    calcs++;
    if (current.down == true) {
      calcs++;

      if (maze[x][y + 1].visited == false) {
        stack.push(current);
        stack.push(maze[x][y + 1]);
        moved == true;
      }
    }

    if (moved == true) continue;

    calcs++;
    if (current.left == true) {
      calcs++;

      if (maze[x - 1][y].visited == false) {
        stack.push(current);
        stack.push(maze[x - 1][y]);
        moved == true;
      }
    }

    if (moved == true) continue;

    calcs++;
    if (current.up == true) {
      calcs++;

      if (maze[x][y - 1].visited == false) {
        stack.push(current);
        stack.push(maze[x][y - 1]);
        moved == true;
      }
    }
  }
  var result = [];
  result.push(stack);
  result.push(calcs);

  return result;
};

module.exports = { calculateRoute };
