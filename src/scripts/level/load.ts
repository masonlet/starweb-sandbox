import { isObj, num, str, optStr, arr } from "@starweb-libs/engine/validate.js";
import type { Level, NormalizedRect   } from "./types.ts";

export function loadLevel(rawLevel: unknown): Level {
  if (!isObj(rawLevel)) throw new Error("Level: not an object");

  const name = optStr(rawLevel, "name", "Level");
  const base = name !== undefined ? { name } : {};

  const kind = str(rawLevel, "kind", "Level");
  if (kind === "physics-stress") {
    const count    = num(rawLevel, "count", "Level");
    const padding  = num(rawLevel, "padding", "Level");
    const shape    = str(rawLevel, "shape",   "Level");
    if (shape !== "rect" && shape !== "circle") throw new Error(
      `Level: shape must be "rect" or "circle"`
    );

    const rawWalls = rawLevel["extraWalls"];
    const extraWalls: NormalizedRect[] = rawWalls === undefined
      ? [] : arr(rawLevel, "extraWalls", "Level").map((w, i) => {
          if (!isObj(w)) throw new Error(`Level.extraWalls[${i}]: not an object`);
          return {
            x: num(w, "x", `Level.extraWalls[${i}]`),
            y: num(w, "y", `Level.extraWalls[${i}]`),
            w: num(w, "w", `Level.extraWalls[${i}]`),
            h: num(w, "h", `Level.extraWalls[${i}]`),
          };
        });

    return { ...base, kind, count, padding, shape, extraWalls };
  }

  throw new Error(`Level: unknown kind "${kind}"`);
}
