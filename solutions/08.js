import { readFileSync } from "node:fs";
import {
  MaxPriorityQueue,
  MinPriorityQueue,
} from "@datastructures-js/priority-queue";

function solution1() {
  const MAX_SIZE = 1000;

  const input = readFileSync("../input/08.txt", "utf8");
  const lines = input.split("\n").map((line) => line.split(","));
  const queue = new MaxPriorityQueue((connect) => connect.dis);

  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
      const dis = calcDis(lines[i], lines[j]);
      if (queue.size() < MAX_SIZE) {
        queue.enqueue({ dis, nodes: [i, j] });
      } else {
        if (dis < queue.front().dis) {
          queue.dequeue();
          queue.enqueue({ dis, nodes: [i, j] });
        }
      }
    }
  }

  const connections = queue.toArray();
  let setList = [];
  for (const { nodes } of connections) {
    let cur = new Set(nodes);
    const newSetList = [];
    for (const set of setList) {
      if (set.has(nodes[0]) || set.has(nodes[1])) {
        cur = cur.union(set);
      } else {
        newSetList.push(set);
      }
    }
    newSetList.push(cur);
    setList = newSetList;
  }

  return setList
    .sort((a, b) => b.size - a.size)
    .slice(0, 3)
    .reduce((pre, cur) => pre * cur.size, 1);
}

function calcDis(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

function solution2() {
  const input = readFileSync("../input/08.txt", "utf8");
  const lines = input.split("\n").map((line) => line.split(","));
  const queue = new MinPriorityQueue((connect) => connect.dis);
  const length = lines.length;

  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
      const dis = calcDis(lines[i], lines[j]);
      queue.enqueue({ dis, nodes: [i, j] });
    }
  }

  const connections = queue.toArray();
  let setList = [];
  for (const { nodes } of connections) {
    let cur = new Set(nodes);
    const newSetList = [];
    for (const set of setList) {
      if (set.has(nodes[0]) || set.has(nodes[1])) {
        cur = cur.union(set);
      } else {
        newSetList.push(set);
      }
    }
    newSetList.push(cur);
    if (cur.size === length) {
      const [node1, node2] = nodes;
      return lines[node1][0] * lines[node2][0];
    }
    setList = newSetList;
  }
}

console.log(solution1());
console.log(solution2());
