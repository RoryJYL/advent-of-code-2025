import { readFileSync } from "node:fs";

function solution1() {
  const input = readFileSync("../input/09.txt", "utf8");
  const lines = input.split("\n").map((line) => line.split(","));

  let res = 0;

  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
      const area = calcArea(lines[i], lines[j]);
      res = Math.max(res, area);
    }
  }

  return res;
}

function solution2() {
  const input = readFileSync("../input/09.txt", "utf8");
  let rows = 0;
  let cols = 0;
  const redList = input.split("\n").map((line) => {
    const [y, x] = line.split(",").map(Number);
    rows = Math.max(rows, x + 1);
    cols = Math.max(cols, y + 1);
    return [x, y];
  });
  const length = redList.length;

  const grid = new Array(rows).fill().map(() => new Array(cols).fill("."));
  for (let i = 0; i < length; i += 1) {
    const cur = redList[i];
    const next = redList[(i + 1) % length];
    grid[cur[0]][cur[1]] = "#";
    grid[next[0]][next[1]] = "#";
    const isVertical = cur[1] === next[1];
    if (isVertical) {
      for (let j = cur[0] + 1; j < next[0]; j += 1) {
        grid[j][cur[1]] = "X";
      }
      for (let j = cur[0] - 1; j > next[0]; j -= 1) {
        grid[j][cur[1]] = "X";
      }
    } else {
      for (let j = cur[1] + 1; j < next[1]; j += 1) {
        grid[cur[0]][j] = "X";
      }
      for (let j = cur[1] - 1; j > next[1]; j -= 1) {
        grid[cur[0]][j] = "X";
      }
    }
  }

  // fill
  for (let i = 0; i < rows; i += 1) {
    const lastIndex = grid[i].findLastIndex((ch) => ch === "#" || ch === "X");
    for (let j = 0; j < cols; j += 1) {
      const ch = grid[i][j];

      if (ch === "#" || ch === "X") {
        let start = j + 1;
        while (start < lastIndex) {
          if (grid[i][start] === ".") {
            grid[i][start] = "X";
          }
          start += 1;
        }
        break;
      }
    }
  }

  let res = 0;

  for (let i = 0; i < length; i += 1) {
    for (let j = i + 1; j < length; j += 1) {
      if (!checkLine(redList[i], redList[j], grid)) {
        continue;
      }
      const area = calcArea(redList[i], redList[j]);
      res = Math.max(res, area);
    }
  }

  return res;
}

function calcArea(a, b) {
  return (Math.abs(a[0] - b[0]) + 1) * (Math.abs(a[1] - b[1]) + 1);
}

function checkLine(a, b, grid) {
  if (a[0] === b[0] || a[1] === b[1]) {
    return true;
  }

  const nodes = [
    [Math.min(a[0], b[0]), Math.min(a[1], b[1])],
    [Math.min(a[0], b[0]), Math.max(a[1], b[1])],
    [Math.max(a[0], b[0]), Math.max(a[1], b[1])],
    [Math.max(a[0], b[0]), Math.min(a[1], b[1])],
  ];
  const lines = [
    [nodes[0], nodes[1]],
    [nodes[1], nodes[2]],
    [nodes[3], nodes[2]],
    [nodes[0], nodes[3]],
  ];

  for (const line of [lines[0], lines[2]]) {
    const [node1, node2] = line;
    const x = node1[0];
    for (let i = node1[1]; i < node2[1]; i += 1) {
      if (grid[x][i] !== "#" && grid[x][i] !== "X") {
        return false;
      }
    }
  }

  for (const line of [lines[1], lines[3]]) {
    const [node1, node2] = line;
    const y = node1[1];
    for (let i = node1[0]; i < node2[0]; i += 1) {
      if (grid[i][y] !== "#" && grid[i][y] !== "X") {
        return false;
      }
    }
  }

  return true;
}

console.log(solution1());
console.log(solution2());
