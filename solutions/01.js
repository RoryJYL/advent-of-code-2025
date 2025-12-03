import { readFileSync } from "node:fs";

const MAX = 100;

function solution1() {
  const input = readFileSync("../input/1.txt", "utf8");
  const lines = input.split("\n");
  let cur = 50;
  let res = 0;
  for (const line of lines) {
    const dir = line[0];
    const dis = Number(line.slice(1));
    if (dir === "L") {
      cur = (cur - dis + MAX) % MAX;
    } else {
      cur = (cur + dis) % MAX;
    }

    if (cur === 0) {
      res += 1;
    }
  }

  return res;
}

function solution2() {
  const input = readFileSync("../input/1.txt", "utf8");
  const lines = input.split("\n");
  let cur = 50;
  let res = 0;
  for (const line of lines) {
    const atZero = cur === 0;
    const dir = line[0];
    const orgDis = Number(line.slice(1));
    const circles = Math.floor(orgDis / MAX);
    const dis = orgDis % MAX;
    if (dir === "L") {
      cur = cur - dis;
    } else {
      cur = cur + dis;
    }

    res += circles;
    if (!atZero && (cur <= 0 || cur >= MAX)) {
      res += 1;
    }

    cur = (cur + MAX) % MAX;
  }

  return res;
}

console.log(solution1());
console.log(solution2());
