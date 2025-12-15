import { readFileSync } from "node:fs";

function solution() {
  const input = readFileSync("../input/12.txt", "utf8");
  const lines = input.split("\n");

  const shapes = [];
  let i = 0;

  function isShapeHeader(s) {
    return /^\d+:\s*$/.test(s);
  }
  function isRegionLine(s) {
    return /^\d+x\d+:\s*/.test(s);
  }

  while (i < lines.length) {
    const line = lines[i].trimEnd();
    if (line === "") {
      i++;
      continue;
    }
    if (isRegionLine(line)) break;
    if (!isShapeHeader(line)) {
      // skip unexpected lines
      i++;
      continue;
    }
    const idx = parseInt(line, 10);
    i++;
    const grid = [];
    while (i < lines.length) {
      const row = lines[i].trimEnd();
      if (row === "") {
        break;
      }
      if (isShapeHeader(row) || isRegionLine(row)) {
        break;
      }
      grid.push(row);
      i += 1;
    }
    shapes[idx] = { idx, grid };
    while (i < lines.length && lines[i].trimEnd() === "") {
      i += 1;
    }
  }

  const numShapes = shapes.length;

  // ---------- Normalize shape variants (rotations + flips), keep unique ----------
  // Represent a variant by a canonical string of its trimmed grid.
  function trimGrid(g) {
    const H = g.length,
      W = g[0].length;
    let minR = H,
      maxR = -1,
      minC = W,
      maxC = -1;
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        if (g[r][c] === "#") {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }
    if (maxR === -1) return [""]; // no blocks (shouldn't happen)
    const out = [];
    for (let r = minR; r <= maxR; r++) {
      out.push(g[r].slice(minC, maxC + 1));
    }
    return out;
  }

  function rotate90(g) {
    const H = g.length,
      W = g[0].length;
    const out = Array.from({ length: W }, () => Array(H).fill("."));
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        out[c][H - 1 - r] = g[r][c];
      }
    }
    return out.map((row) => row.join(""));
  }

  function flipH(g) {
    // horizontal flip (mirror)
    return g.map((row) => row.split("").reverse().join(""));
  }

  function gridToKey(g) {
    return g.join("\n");
  }

  const shapeVariants = new Array(numShapes);
  const shapeArea = new Array(numShapes).fill(0);

  for (let si = 0; si < numShapes; si++) {
    const base = shapes[si]?.grid;
    if (!base) continue;

    // compute area
    let a = 0;
    for (const row of base) for (const ch of row) if (ch === "#") a++;
    shapeArea[si] = a;

    const seen = new Set();
    const vars = [];

    function addVariant(g0) {
      const t = trimGrid(g0);
      const key = gridToKey(t);
      if (seen.has(key)) return;
      seen.add(key);

      const h = t.length;
      const w = t[0].length;
      const cells = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (t[y][x] === "#") cells.push({ x, y });
        }
      }
      vars.push({ w, h, cells, area: cells.length });
    }

    // generate 8 transforms: 4 rotations of original and of flipped
    let g = base.slice();
    for (let r = 0; r < 4; r++) {
      addVariant(g);
      g = rotate90(g);
    }
    g = flipH(base);
    for (let r = 0; r < 4; r++) {
      addVariant(g);
      g = rotate90(g);
    }

    shapeVariants[si] = vars;
  }

  const regions = [];
  while (i < lines.length) {
    const line = lines[i].trim();
    i++;
    if (!line) continue;
    const m = line.match(/^(\d+)x(\d+):\s*(.*)$/);
    if (!m) continue;
    const W = parseInt(m[1], 10);
    const H = parseInt(m[2], 10);
    const counts = m[3]
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((x) => parseInt(x, 10));
    regions.push({ W, H, counts });
  }

  function canFitRegion(W, H, counts) {
    // quick area prune
    let needArea = 0;
    for (let si = 0; si < counts.length; si++) {
      needArea += (counts[si] || 0) * (shapeArea[si] || 0);
    }
    if (needArea > W * H) return false;

    const nCells = W * H;
    const nChunks = Math.ceil(nCells / 64);

    // For each shape type, build all placement masks in this region
    const placementsByShape = new Array(numShapes);
    for (let si = 0; si < numShapes; si++) placementsByShape[si] = [];

    for (let si = 0; si < numShapes; si++) {
      const vars = shapeVariants[si];
      if (!vars || vars.length === 0) continue;

      const allMasks = [];
      for (const v of vars) {
        if (v.w > W || v.h > H) continue;
        for (let oy = 0; oy <= H - v.h; oy++) {
          for (let ox = 0; ox <= W - v.w; ox++) {
            const bits = makeEmptyBits(nChunks);
            for (const c of v.cells) {
              const x = ox + c.x;
              const y = oy + c.y;
              setBit(bits, y * W + x);
            }
            allMasks.push(bits);
          }
        }
      }
      placementsByShape[si] = allMasks;
    }

    // Build piece instances list: each is {shape, options: bitsets[]}
    const pieces = [];
    for (let si = 0; si < counts.length; si++) {
      const q = counts[si] | 0;
      if (q <= 0) continue;
      const opts = placementsByShape[si];
      if (!opts || opts.length === 0) return false; // need some but no placement exists at all
      for (let k = 0; k < q; k++) pieces.push({ shape: si, options: opts });
    }

    // Heuristic: sort by fewest options first
    pieces.sort((a, b) => a.options.length - b.options.length);

    const occ = makeEmptyBits(nChunks);
    const memo = new Map();
    function dfs(idx) {
      if (idx === pieces.length) return true;

      const key = `${idx}|${bitsKey(occ)}`;
      const cached = memo.get(key);
      if (cached !== undefined) return cached;

      const piece = pieces[idx];

      // Try each placement that doesn't overlap current occupancy
      for (const m of piece.options) {
        if (bitsOverlap(occ, m)) continue;
        bitsOrInPlace(occ, m);
        if (dfs(idx + 1)) {
          memo.set(key, true);
          return true;
        }
        bitsXorInPlace(occ, m); // undo
      }

      memo.set(key, false);
      return false;
    }

    return dfs(0);
  }

  let ok = 0;
  for (const r of regions) {
    if (canFitRegion(r.W, r.H, r.counts)) ok++;
  }
  return ok;
}

function makeEmptyBits(nChunks) {
  const a = new Array(nChunks);
  for (let i = 0; i < nChunks; i++) a[i] = 0n;
  return a;
}

function bitsOverlap(a, b) {
  for (let i = 0; i < a.length; i++) {
    if ((a[i] & b[i]) !== 0n) return true;
  }
  return false;
}

function bitsOrInPlace(dst, src) {
  for (let i = 0; i < dst.length; i++) dst[i] |= src[i];
}

function bitsXorInPlace(dst, src) {
  // since we only add/remove without overlap, XOR is safe for undo
  for (let i = 0; i < dst.length; i++) dst[i] ^= src[i];
}

function bitsKey(a) {
  // reasonably fast key; good enough for typical AoC-sized inputs
  // join BigInt -> string
  return a.map((x) => x.toString()).join(",");
}

function setBit(bits, idx) {
  const chunk = (idx / 64) | 0;
  const off = idx % 64;
  bits[chunk] |= 1n << BigInt(off);
}

console.log(solution());
