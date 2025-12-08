import { readFileSync } from "node:fs";

function solution1() {
  const input = readFileSync("../input/07.txt", "utf8");
  const lines = input.split("\n").map((line) => line.split(""));
  const rows = lines.length;
  const cols = lines[0].length;
  const dirs = [
    [1, -1],
    [1, 1],
  ];

  let res = 0;

  for (let i = 0; i < rows - 1; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      const ch = lines[i][j];

      if (ch === "S" || ch === "|") {
        const next = lines[i + 1][j];
        if (next === "^") {
          res += 1;

          for (const [dirX, dirY] of dirs) {
            const newX = i + dirX;
            const newY = j + dirY;
            if (newX >= 0 && newX < rows && newY >= 0 && newY < cols) {
              lines[newX][newY] = "|";
            }
          }
        } else {
          lines[i + 1][j] = "|";
        }
      }
    }
  }

  return res;
}

function solution2() {
  const input = readFileSync("../input/07.txt", "utf8");
  const lines = input.split("\n").map((line) => line.split(""));
  const rows = lines.length;
  const cols = lines[0].length;
  const dirs = [
    [1, -1],
    [1, 1],
  ];

  for (let i = 0; i < rows - 1; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      const ch = lines[i][j];

      if (ch === "S") {
        lines[i + 1][j] = 1;
        continue;
      }

      if (Number.isFinite(ch)) {
        const next = lines[i + 1][j];
        if (next === "^") {
          for (const [dirX, dirY] of dirs) {
            const newX = i + dirX;
            const newY = j + dirY;
            if (newX >= 0 && newX < rows && newY >= 0 && newY < cols) {
              if (Number.isFinite(lines[newX][newY])) {
                lines[newX][newY] += ch;
              } else {
                lines[newX][newY] = ch;
              }
            }
          }
        } else {
          if (Number.isFinite(lines[i + 1][j])) {
            lines[i + 1][j] += ch;
          } else {
            lines[i + 1][j] = ch;
          }
        }
      }
    }
  }

  return lines[rows - 1]
    .filter(Number.isFinite)
    .reduce((pre, cur) => pre + cur, 0);
}

console.log(solution1());
console.log(solution2());
