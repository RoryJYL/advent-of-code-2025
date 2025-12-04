import { readFileSync } from "node:fs";

function solution1() {
  const input = readFileSync("../input/04.txt", "utf8");
  const grid = input.split("\n");
  const rows = grid.length;
  const cols = grid[0].length;

  let res = 0;
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      if (checkAdjacent(grid, i, j)) {
        res += 1;
      }
    }
  }

  return res;
}

function solution2() {
  const input = readFileSync("../input/04.txt", "utf8");
  const grid = input.split("\n").map((line) => line.split(""));
  const rows = grid.length;
  const cols = grid[0].length;

  let res = 0;
  let isRemove = false;
  do {
    isRemove = false;
    for (let i = 0; i < rows; i += 1) {
      for (let j = 0; j < cols; j += 1) {
        if (checkAdjacent(grid, i, j)) {
          grid[i][j] = "x";
          res += 1;
          isRemove = true;
        }
      }
    }
  } while (isRemove);

  return res;
}

/**
 * Check adjacent is available
 * @param {String[][]} grid
 * @param {Number} x
 * @param {Number} y
 */
function checkAdjacent(grid, x, y) {
  if (grid[x][y] !== "@") {
    return false;
  }

  const max = 4;
  const dirs = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  for (const [dirX, dirY] of dirs) {
    const newX = x + dirX;
    const newY = y + dirY;
    if (
      newX >= 0 &&
      newX < rows &&
      newY >= 0 &&
      newY < cols &&
      grid[newX][newY] === "@"
    ) {
      count += 1;
      if (count >= max) {
        return false;
      }
    }
  }

  return true;
}

console.log(solution1());
console.log(solution2());
