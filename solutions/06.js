import { readFileSync } from "node:fs";

function solution1() {
  const input = readFileSync("../input/06.txt", "utf8");
  const lines = input
    .split("\n")
    .map((line) => line.split(" ").filter((item) => !!item));
  const rows = lines.length;
  const cols = lines[0].length;

  let res = 0;

  for (let i = 0; i < cols; i += 1) {
    const numbers = new Array(rows - 1).fill(0);
    let operation = "";
    for (let j = 0; j < rows; j += 1) {
      if (j === rows - 1) {
        operation = lines[j][i];
        break;
      }

      numbers[j] = Number(lines[j][i]);
    }

    res += calc(numbers, operation);
  }

  return res;
}

function calc(numbers, operation) {
  return numbers.reduce(
    (pre, cur) => {
      return operation === "+" ? pre + cur : pre * cur;
    },
    operation === "+" ? 0 : 1,
  );
}

function solution2() {
  const input = readFileSync("../input/06.txt", "utf8");
  const lines = input.split("\n");
  let res = 0;

  const rows = lines.length;
  const cols = lines[0].length;
  let numbers = [];

  for (let i = cols - 1; i >= 0; i -= 1) {
    let str = "";
    for (let j = 0; j < rows - 1; j += 1) {
      const ch = lines[j][i];
      str += ch;
    }
    numbers.push(Number(str));
    if (lines[rows - 1][i] !== " ") {
      res += calc(numbers, lines[rows - 1][i]);
      numbers = [];
      i -= 1;
    }
  }

  return res;
}

console.log(solution1());
console.log(solution2());
