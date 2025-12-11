import { readFileSync } from "node:fs";

function solution1() {
  const input = readFileSync("../input/10.txt", "utf8");

  return solveMachinesBFS(input);
}

function solveMachinesBFS(input) {
  const lines = input.split("\n");

  let total = 0;
  for (const line of lines) {
    const machine = parseMachine(line);
    const presses = minPressesForMachineBFS(machine);
    total += presses;
  }
  return total;
}

function parseMachine(line) {
  // 指示灯图案 [.#...]
  const patternMatch = line.match(/\[([.#]+)\]/);
  if (!patternMatch) throw new Error("No pattern found in line: " + line);
  const patternStr = patternMatch[1];
  const n = patternStr.length;

  // '.' -> 0, '#' -> 1
  let targetMask = 0;
  for (let i = 0; i < n; i++) {
    if (patternStr[i] === "#") {
      targetMask |= 1 << i;
    }
  }

  // 按钮 (0,3,4) 之类
  const buttonMatches = [...line.matchAll(/\(([^)]*)\)/g)];
  const buttons = buttonMatches.map((m) => {
    const inside = m[1].trim();
    if (!inside) return [];
    return inside
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((x) => !Number.isNaN(x));
  });

  // 把每个按钮作用的灯变成 bitmask，方便 part1 XOR
  const buttonMasks = buttons.map((indices) => {
    let mask = 0;
    for (const idx of indices) {
      if (idx >= 0 && idx < n) {
        mask |= 1 << idx;
      }
    }
    return mask;
  });

  // 解析 joltages {3,5,4,7}
  const joltageMatch = line.match(/\{([^}]*)\}/);
  if (!joltageMatch) throw new Error("No joltages found in line: " + line);
  const joltages = joltageMatch[1]
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((x) => !Number.isNaN(x));

  return {
    nLights: n,
    targetMask,
    buttonMasks,
    // 给 part2 用
    joltages,
    buttonIndices: buttons,
  };
}

/**
 * 用 BFS 求单台机器的最少按键次数
 * @param {{nLights:number, targetMask:number, buttonMasks:number[]}} machine
 * @returns {number}
 */
function minPressesForMachineBFS(machine) {
  const { nLights, targetMask, buttonMasks } = machine;
  const m = buttonMasks.length;

  const start = 0;

  if (targetMask === start) return 0;

  // 状态总数：最多 2^nLights 种灯的组合
  const totalStates = 1 << nLights;
  const dist = new Array(totalStates).fill(-1); // -1 未访问
  const queue = [];

  dist[start] = 0;
  queue.push(start);

  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    const curSteps = dist[cur];

    // 尝试按每一个按钮
    for (let i = 0; i < m; i++) {
      const next = cur ^ buttonMasks[i]; // 翻转对应灯

      if (dist[next] === -1) {
        dist[next] = curSteps + 1;
        if (next === targetMask) {
          return dist[next];
        }
        queue.push(next);
      }
    }
  }

  return Infinity;
}

function solution2() {
  const input = readFileSync("../input/10.txt", "utf8");
  return solveMachinesJoltage(input);
}

function solveMachinesJoltage(input) {
  const lines = input.split("\n");

  let total = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    const machine = parseMachine(line);
    const presses = minPressesForMachineJoltage(machine);
    total += presses;
  }
  return total;
}

// 用整数线性方程 + 枚举自由变量来求解
function minPressesForMachineJoltage(machine) {
  const { joltages, buttonIndices } = machine;
  const k = joltages.length; // 计数器个数

  // 过滤掉对任何计数器都没影响的按钮（这些按钮按了只会浪费次数）
  const effectiveButtons = [];
  for (const btn of buttonIndices) {
    const filtered = btn.filter((idx) => idx >= 0 && idx < k);
    if (filtered.length > 0) {
      effectiveButtons.push(filtered);
    }
  }

  const m = effectiveButtons.length; // 有效按钮个数
  if (m === 0) {
    // 没有按钮，如果目标不是全 0，就无解；题目保证有解，这里简单抛错
    if (joltages.some((v) => v !== 0)) {
      throw new Error("No buttons but non-zero joltage target");
    }
    return 0;
  }

  const maxJ = Math.max(...joltages);

  // 构造方程 A * x = b
  // A: k 行 m 列，A[i][j] = 1 表示按钮 j 会让计数器 i +1
  const A = [];
  for (let i = 0; i < k; i++) {
    A[i] = new Array(m).fill(0);
  }
  for (let j = 0; j < m; j++) {
    for (const idx of effectiveButtons[j]) {
      A[idx][j] = 1;
    }
  }
  const b = joltages.slice();

  // 做增广矩阵 [A | b]
  const mat = [];
  for (let i = 0; i < k; i++) {
    const row = new Array(m + 1);
    for (let j = 0; j < m; j++) {
      row[j] = A[i][j];
    }
    row[m] = b[i];
    mat.push(row);
  }

  const EPS = 1e-9;

  // RREF，返回 pivotOfCol（每列的主元所在行）并就地修改 mat
  const pivotOfCol = rref(mat, m, EPS);

  // 检查是否无解（0 = 非 0 的情况）
  for (let r = 0; r < mat.length; r++) {
    let allZero = true;
    for (let c = 0; c < m; c++) {
      if (Math.abs(mat[r][c]) > EPS) {
        allZero = false;
        break;
      }
    }
    if (allZero && Math.abs(mat[r][m]) > EPS) {
      throw new Error("Inconsistent system for machine: no solution");
    }
  }

  const freeCols = [];
  const pivotVars = [];
  const pivotRhs = [];
  const pivotCoeff = [];

  for (let col = 0; col < m; col++) {
    const r = pivotOfCol[col];
    if (r === -1) {
      freeCols.push(col);
    } else {
      pivotVars.push(col);
      pivotRhs.push(mat[r][m]);
      const coeffRow = [];
      for (let fi = 0; fi < freeCols.length; fi++) {
        const fcol = freeCols[fi];
        coeffRow.push(mat[r][fcol]);
      }
      pivotCoeff.push(coeffRow);
    }
  }

  // 注意：上面循环里 freeCols 还在增长，所以 pivotCoeff 里目前还没有所有 freeCols 的系数；
  // 我们需要在 freeCols 全部确定后再构建 pivotCoeff。
  // 为了简单，我们重建 pivotVars / pivotRhs / pivotCoeff：

  const finalPivotVars = [];
  const finalPivotRhs = [];
  const finalPivotCoeff = [];

  for (let col = 0; col < m; col++) {
    const r = pivotOfCol[col];
    if (r !== -1) {
      finalPivotVars.push(col);
      finalPivotRhs.push(mat[r][m]);
      const coeffRow = [];
      for (let fi = 0; fi < freeCols.length; fi++) {
        const fcol = freeCols[fi];
        coeffRow.push(mat[r][fcol]);
      }
      finalPivotCoeff.push(coeffRow);
    }
  }

  const f = freeCols.length;

  // 如果没有自由变量，唯一解：直接读出每个变量值
  if (f === 0) {
    const x = new Array(m).fill(0);
    for (let idx = 0; idx < finalPivotVars.length; idx++) {
      const col = finalPivotVars[idx];
      const r = pivotOfCol[col];
      const val = mat[r][m];
      const rounded = Math.round(val);
      if (val < -EPS || Math.abs(val - rounded) > 1e-6) {
        throw new Error("Unique solution is not non-negative integer");
      }
      x[col] = rounded;
    }
    const sum = x.reduce((acc, v) => acc + v, 0);
    return sum;
  }

  // 有自由变量：暴力枚举 x_free ∈ [0 .. maxJ]，找最小 Σ x_j
  let best = Infinity;
  const freeValues = new Array(f).fill(0);

  function dfs(pos, currSum) {
    if (pos === f) {
      // 所有自由变量给定，计算所有主变量
      let total = currSum;

      // 先算 pivot 变量
      for (let pi = 0; pi < finalPivotVars.length; pi++) {
        let val = finalPivotRhs[pi];
        const coeffRow = finalPivotCoeff[pi];
        for (let fi = 0; fi < f; fi++) {
          val -= coeffRow[fi] * freeValues[fi];
        }

        if (val < -EPS) return; // 有主变量 < 0，非法

        const rounded = Math.round(val);
        if (Math.abs(val - rounded) > 1e-6) return; // 不是整数

        total += rounded;
        if (total >= best) return; // 不可能更优了
      }

      if (total < best) best = total;
      return;
    }

    // 剪枝：当前自由变量从 0 开始试，如果加上 v 已经不可能优于 best，就停
    for (let v = 0; v <= maxJ; v++) {
      const newSum = currSum + v;
      if (newSum >= best) break; // 后面的 v 只会更大，直接剪掉

      freeValues[pos] = v;
      dfs(pos + 1, newSum);
    }
  }

  dfs(0, 0);

  if (!Number.isFinite(best)) {
    throw new Error("No non-negative integer solution found for machine");
  }
  return best;
}

function rref(mat, m, EPS) {
  const rows = mat.length;
  const cols = m + 1; // 最后一列是常数项
  const pivotOfCol = new Array(m).fill(-1);

  let row = 0;
  for (let col = 0; col < m && row < rows; col++) {
    // 找这一列的主元行
    let pivotRow = -1;
    let maxAbs = EPS;
    for (let r = row; r < rows; r++) {
      const val = Math.abs(mat[r][col]);
      if (val > maxAbs) {
        maxAbs = val;
        pivotRow = r;
      }
    }
    if (pivotRow === -1) {
      continue; // 这一列没有主元
    }

    // 交换到当前行
    if (pivotRow !== row) {
      const tmp = mat[row];
      mat[row] = mat[pivotRow];
      mat[pivotRow] = tmp;
    }

    // 归一化主元
    const pivotVal = mat[row][col];
    for (let c = col; c < cols; c++) {
      mat[row][c] /= pivotVal;
    }

    // 消去其他行的这一列
    for (let r = 0; r < rows; r++) {
      if (r === row) continue;
      const factor = mat[r][col];
      if (Math.abs(factor) < EPS) continue;
      for (let c = col; c < cols; c++) {
        mat[r][c] -= factor * mat[row][c];
      }
    }

    pivotOfCol[col] = row;
    row++;
  }

  return pivotOfCol;
}

console.log(solution1());
console.log(solution2());
