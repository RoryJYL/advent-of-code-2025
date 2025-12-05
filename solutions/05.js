import { readFileSync } from "node:fs";

function solution1() {
  const input = readFileSync("../input/05.txt", "utf8");
  const lines = input.split("\n");
  const divide = lines.findIndex((line) => !line);
  const freshRanges = lines
    .slice(0, divide)
    .map((str) => {
      return str.split("-").map(Number);
    })
    .sort((a, b) => a[0] - b[0]);
  const ingredients = lines.slice(divide + 1).map(Number);

  let res = 0;
  for (const ingredient of ingredients) {
    if (checkIsFresh(freshRanges, ingredient)) {
      res += 1;
    }
  }

  return res;
}

function checkIsFresh(freshRanges, ingredient) {
  for (const [min, max] of freshRanges) {
    if (ingredient < min) {
      return false;
    }

    if (ingredient >= min && ingredient <= max) {
      return true;
    }
  }

  return false;
}

function solution2() {
  const input = readFileSync("../input/05.txt", "utf8");
  const lines = input.split("\n");
  const divide = lines.findIndex((line) => !line);
  const freshRanges = lines
    .slice(0, divide)
    .map((str) => {
      return str.split("-").map(Number);
    })
    .sort((a, b) => a[0] - b[0]);

  let res = 0;
  let i = 0;
  while (i < freshRanges.length) {
    const [min, max] = freshRanges[i];
    let curMin = min;
    let curMax = max;

    while (
      i < freshRanges.length - 1 &&
      ((freshRanges[i + 1][0] >= curMin && freshRanges[i + 1][0] <= curMax) ||
        (freshRanges[i + 1][0] < curMin && freshRanges[i + 1][1] >= curMin))
    ) {
      curMin = Math.min(curMin, freshRanges[i + 1][0]);
      curMax = Math.max(curMax, freshRanges[i + 1][1]);
      i += 1;
    }

    res += curMax - curMin + 1;
    i += 1;
  }

  return res;
}

console.log(solution1());
console.log(solution2());
