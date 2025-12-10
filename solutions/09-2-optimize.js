import { readFileSync } from "node:fs";

/**
 * 计算：使用两红点作为对角，且矩形内部只包含红/绿瓷砖时，能得到的最大面积
 *
 * input: 多行字符串，每行一个 "x,y"
 */
function maxRedGreenRectangle() {
  const input = readFileSync("../input/09.txt", "utf8");
  // 1. 解析输入成按顺序的红点（题目保证顺序连成折线）
  const points = input
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const [xs, ys] = line.split(",").map((s) => s.trim());
      return { x: Number(xs), y: Number(ys) };
    });

  const n = points.length;
  if (n < 2) return 0;

  // 2. 折线边：每个红点到下一个红点（首尾相连）
  const edges = [];
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    edges.push([a, b]);
  }

  // 3. 判断矩形 (以两个红点为对角) 是否被多边形边界切穿
  //    如果有任意一条边“穿进了矩形内部”，就视为不合法
  //
  //    这里完全照抄了那个 Haskell 思路：
  //      away(edge) = 这条边完全在矩形左边 / 右边 / 下方 / 上方
  //      intersects = 存在某条边不是 away
  //
  //    注意：这里的矩形是以红点坐标本身为边界（不 +0.5），
  //          和 AoC 讨论区里那版是一致的。
  function intersects(p, q) {
    const x1 = Math.min(p.x, q.x);
    const x2 = Math.max(p.x, q.x);
    const y1 = Math.min(p.y, q.y);
    const y2 = Math.max(p.y, q.y);

    for (const [a, b] of edges) {
      const lx1 = a.x;
      const ly1 = a.y;
      const lx2 = b.x;
      const ly2 = b.y;

      const exMinX = Math.min(lx1, lx2);
      const exMaxX = Math.max(lx1, lx2);
      const exMinY = Math.min(ly1, ly2);
      const exMaxY = Math.max(ly1, ly2);

      // 这条边完全在矩形外侧（四个方向之一）
      const away =
        exMaxX <= x1 || // 完全在左侧或贴左边界
        exMinX >= x2 || // 完全在右侧或贴右边界
        exMaxY <= y1 || // 完全在下方或贴下边界
        exMinY >= y2; // 完全在上方或贴上边界

      // 如果 not away，说明这条边“伸进了”矩形的内部区域
      if (!away) {
        return true; // 有穿过 -> 矩形不合法
      }
    }

    // 所有边都 away，说明多边形边界没有切穿矩形内部
    return false;
  }

  // 4. 枚举所有红点对，找最大合法矩形
  let maxArea = 0;

  for (let i = 0; i < n; i++) {
    const p = points[i];
    for (let j = i + 1; j < n; j++) {
      const q = points[j];

      const area = (Math.abs(p.x - q.x) + 1) * (Math.abs(p.y - q.y) + 1);
      if (area <= maxArea) continue; // 剪枝

      // 如果多边形边界没有穿过这个矩形内部，那它就是合法的红+绿矩形
      if (!intersects(p, q)) {
        maxArea = area;
      }
    }
  }

  return maxArea;
}

console.log(maxRedGreenRectangle());
