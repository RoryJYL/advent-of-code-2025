import { readFileSync } from "node:fs";

function solution1() {
  const input = readFileSync("../input/11.txt", "utf8");
  const lines = input.split("\n");
  const map = parseRack(lines);
  const queue = [...map.get("you")];

  let res = 0;
  while (queue.length) {
    const cur = queue.shift();
    if (cur === "out") {
      res += 1;
      continue;
    }
    const outputs = map.get(cur);
    queue.push(...outputs);
  }

  return res;
  // return dfs1("svr", map, new Set());
}

function solution2() {
  const input = readFileSync("../input/11.txt", "utf8");
  const lines = input.split("\n");
  const map = parseRack(lines);
  return countPaths(map, "svr", "out", "fft", "dac");
}

function parseRack(connections) {
  const map = new Map();
  for (const connect of connections) {
    const input = connect.split(":")[0];
    const outputs = connect.split(" ").slice(1);
    map.set(input, outputs);
  }

  return map;
}

function buildReverse(map) {
  const rev = new Map();
  for (const [u, outs] of map.entries()) {
    for (const v of outs) {
      if (!rev.has(v)) rev.set(v, []);
      rev.get(v).push(u);
    }
  }
  return rev;
}

function dfsReach(start, adj) {
  const seen = new Set();
  const stack = [start];
  while (stack.length) {
    const u = stack.pop();
    if (seen.has(u)) continue;
    seen.add(u);
    const outs = adj.get(u) || [];
    for (const v of outs) {
      if (!seen.has(v)) stack.push(v);
    }
  }
  return seen;
}

function topoSort(nodes, adj) {
  const indeg = new Map();
  for (const n of nodes) indeg.set(n, 0);
  for (const u of nodes) {
    for (const v of adj.get(u) || []) {
      if (!nodes.has(v)) continue;
      indeg.set(v, (indeg.get(v) || 0) + 1);
    }
  }

  const q = [];
  for (const [n, d] of indeg.entries()) {
    if (d === 0) q.push(n);
  }

  const order = [];
  while (q.length) {
    const u = q.shift();
    order.push(u);
    for (const v of adj.get(u) || []) {
      if (!nodes.has(v)) continue;
      indeg.set(v, indeg.get(v) - 1);
      if (indeg.get(v) === 0) q.push(v);
    }
  }

  return order;
}

function countPaths(map, start, target, fftNode, dacNode) {
  const rev = buildReverse(map);

  // 从 start 出发能到的点
  const fromStart = dfsReach(start, map);
  const toTarget = dfsReach(target, rev);

  // 只保留既 fromStart 又 toTarget 的点
  const useful = new Set();
  for (const n of fromStart) {
    if (toTarget.has(n)) useful.add(n);
  }
  useful.add(target);

  const order = topoSort(useful, map);

  // dp[node] = [noFftNoDac, hasFftOnly, hasDacOnly, hasBoth]
  const dp = new Map();
  for (const n of useful) {
    dp.set(n, [0, 0, 0, 0]);
  }

  const startState = [0, 0, 0, 0];
  let mask0 = 0;
  if (start === fftNode) {
    mask0 |= 1;
  }
  if (start === dacNode) {
    mask0 |= 2;
  }
  startState[mask0] = 1;
  dp.set(start, startState);

  // 按拓扑顺序转移
  for (const u of order) {
    const states = dp.get(u);
    const outs = map.get(u) || [];
    for (const v of outs) {
      if (!useful.has(v)) {
        continue;
      }

      if (!dp.has(v)) dp.set(v, [0, 0, 0, 0]);
      const vs = dp.get(v);

      for (let mask = 0; mask < 4; mask++) {
        const cnt = states[mask];
        if (cnt === 0) {
          continue;
        }
        let newMask = mask;
        if (v === fftNode) {
          newMask |= 1;
        }
        if (v === dacNode) {
          newMask |= 2;
        }
        vs[newMask] += cnt;
      }
    }
  }

  const res = dp.get(target) || [0, 0, 0, 0];
  return res[3];
}

console.log(solution1());
console.log(solution2());
