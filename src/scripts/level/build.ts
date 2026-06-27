import type { AABB  } from "@starweb-libs/physics/types.js";
import type { Level } from "./types.ts";

export function buildWalls(level: Level, cw: number, ch: number): AABB[] {
  if (level.kind !== "physics-stress") return [];
  const pad = level.padding;
  const px = cw * pad;
  const py = ch * pad;
  const iw = cw - px * 2;
  const ih = ch - py * 2;
  const t = 4;
  const border: AABB[] = [
    { cx: px + iw/2,     cy: py + t/2,      hw: (iw + t)/2, hh: t/2  },
    { cx: px + iw/2,     cy: py + ih - t/2, hw: (iw + t)/2, hh: t/2  },
    { cx: px + t/2,      cy: py + ih/2,     hw: t/2,        hh: ih/2 },
    { cx: px + iw - t/2, cy: py + ih/2,     hw: t/2,        hh: ih/2 },
  ];
  const extras = (level.extraWalls ?? []).map(e => ({
    cx: (e.x + e.w/2) * cw,
    cy: (e.y + e.h/2) * ch,
    hw: e.w/2 * cw,
    hh: e.h/2 * ch,
  }));
  return [...border, ...extras];
}
