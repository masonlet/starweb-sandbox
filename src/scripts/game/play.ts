import { wasPressed     } from "@starweb-libs/engine/input/keyboard.js";
import { Audio          } from "@starweb-libs/audio/audio.js";
import type { PlayState } from "./types.ts";
import type { Campaign  } from "../campaign/types.ts";
import { buildWalls     } from "../level/build.ts";
import { renderWalls    } from "../level/render.ts";
import {
  spawnRects,
  updateRects,
  renderRects
} from "../physics/rect.ts";
import {
  spawnCircles,
  updateCircles,
  renderCircles
} from "../physics/circles.ts";

function syncLevelState(ps: PlayState, level: typeof ps.levels[number]): void {
  if (level.kind !== "physics-stress") {
    ps.walls   = [];
    ps.bodies  = [];
    ps.circles = [];
    return;
  }

  ps.walls = buildWalls(level, ps.canvasW, ps.canvasH);

  const isRect = level.shape === "rect";
  ps.bodies  = isRect ? spawnRects(level.count, level, ps.canvasW, ps.canvasH) : [];
  ps.circles = isRect ? [] : spawnCircles(level.count, level, ps.canvasW, ps.canvasH);
}

export function selectLevel(ps: PlayState, index: number): void {
  if (!ps.levels[index]) throw new Error(`Campaign has no level at index ${index}`);
  ps.levelIndex = index;
  syncLevelState(ps, ps.levels[index]!);
}

export function resetPlayState(ps: PlayState): void {
  const level = ps.levels[ps.levelIndex];
  if (!level) throw new Error(`resetPlayState: no level at index ${ps.levelIndex}`);
  syncLevelState(ps, level);
}

export function createPlayState(c: Campaign, a: Audio): PlayState {
  if (!c.levels[0]) throw new Error("Campaign has no levels");
  return {
    levels:     c.levels,
    levelIndex: 0,
    volState:   { dragging: false, value: a.volume },
    canvasW:    0,
    canvasH:    0,
    walls:      [],
    bodies:     [],
    circles:    []
  };
}

export function updatePlayState(ps: PlayState, dt: number): boolean {
  if (wasPressed("Digit1")) return true;
  const level = ps.levels[ps.levelIndex];
  if (!level) return false;

  if (level.kind === "physics-stress") {
    if (level.shape === "rect") updateRects  (ps.bodies,  ps.walls, ps.canvasW, ps.canvasH, dt);
    else                        updateCircles(ps.circles, ps.walls, ps.canvasW, ps.canvasH, dt);
  }

  return false;
}

export function renderPlayState(ctx: CanvasRenderingContext2D, ps: PlayState): void {
  const level = ps.levels[ps.levelIndex];
  if (!level) return;

  if (level.kind === "physics-stress") {
    renderWalls(ctx, ps.walls);
    if (level.shape === "rect") renderRects(ctx, ps.bodies);
    else                        renderCircles(ctx, ps.circles);
  }
}
