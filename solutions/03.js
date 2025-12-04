import { readFileSync } from "node:fs";

function solution1() {
  const input = readFileSync("../input/03.txt", "utf8");
  const lines = input.split("\n");

  let res = 0;
  for (const line of lines) {
    res += findMax(line, 2);
  }

  return res;
}

function solution2() {
  const input = readFileSync("../input/03.txt", "utf8");
  const lines = input.split("\n");

  let res = 0;
  for (const line of lines) {
    res += findMax(line, 12);
  }

  return res;
}

/**
 * Find the largest number composed of ${count} digits
 * @param {String} str
 * @param {Number} count
 */
function findMax(str, count) {
  let res = 0;
  const length = str.length;
  let max = 0;

  for (let i = 0; i < count; i += 1) {
    for (let j = max; j < length - count + i + 1; j += 1) {
      const ch = str[j];
      const num = Number(ch);
      if (num > Number(str[max])) {
        max = j;
      }
    }

    res = res * 10 + Number(str[max]);
    max += 1;
  }

  return res;
}

console.log(solution1());
console.log(solution2());
