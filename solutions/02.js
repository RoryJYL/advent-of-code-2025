import { readFileSync } from "node:fs";

function solution1() {
  const input = readFileSync("../input/2.txt", "utf8");
  const intervals = input.split(",");

  let res = 0;

  for (const interval of intervals) {
    const [start, end] = interval.split("-").map(Number);
    for (let i = start; i <= end; i += 1) {
      const str = `${i}`;
      const length = str.length;
      if (length % 2 !== 0) {
        continue;
      }

      const mid = length / 2;
      if (str.slice(0, mid) === str.slice(mid)) {
        res += i;
      }
    }
  }

  return res;
}

function solution2() {
  const input = readFileSync("../input/2.txt", "utf8");
  const intervals = input.split(",");

  let res = 0;

  for (const interval of intervals) {
    const [start, end] = interval.split("-").map(Number);
    for (let i = start; i <= end; i += 1) {
      if (findPattern(i)) {
        res += i;
      }
    }
  }

  return res;
}

function findPattern(id) {
  const str = `${id}`;
  const length = str.length;
  const mid = Math.floor(length / 2);

  for (let i = mid; i > 0; i -= 1) {
    if (length % i !== 0) {
      continue;
    }

    const times = length / i;
    if (str.slice(0, i).repeat(times) === str) {
      return true;
    }
  }

  return false;
}

console.log(solution1());
console.log(solution2());
