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

function syncLevelState(p: PlayState, level: typeof p.levels[number]): void {
  if (level.kind !== "physics-stress") {
    p.walls   = [];
    p.bodies  = [];
    p.circles = [];
    return;
  }

  p.walls = buildWalls(level, p.canvasW, p.canvasH);

  const isRect = level.shape === "rect";
  p.bodies  = isRect ? spawnRects(level.count, level, p.canvasW, p.canvasH) : [];
  p.circles = isRect ? [] : spawnCircles(level.count, level, p.canvasW, p.canvasH);
}

export function selectLevel(p: PlayState, index: number): void {
  if (!p.levels[index]) throw new Error(`Campaign has no level at index ${index}`);
  p.levelIndex = index;
  syncLevelState(p, p.levels[index]!);
}

export function resetPlayState(p: PlayState): void {
  const level = p.levels[p.levelIndex];
  if (!level) throw new Error(`resetPlayState: no level at index ${p.levelIndex}`);
  syncLevelState(p, level);
}

export function createPlayState(campaign: Campaign, audio: Audio): PlayState {
  if (!campaign.levels[0]) throw new Error("Campaign has no levels");
  return {
    levels:     campaign.levels,
    levelIndex: 0,
    volState:   { dragging: false, value: audio.volume },
    canvasW:    0,
    canvasH:    0,
    walls:      [],
    bodies:     [],
    circles:    []
  };
}

export function updatePlayState(p: PlayState, dt: number): boolean {
  if (wasPressed("Digit1")) return true;
  const level = p.levels[p.levelIndex];
  if (!level) return false;

  if (level.kind === "physics-stress") {
    if (level.shape === "rect") updateRects  (p.bodies,  p.walls, p.canvasW, p.canvasH, dt);
    else                        updateCircles(p.circles, p.walls, p.canvasW, p.canvasH, dt);
  }

  return false;
}

export function renderPlayState(
  ctx: CanvasRenderingContext2D,
  p: PlayState,
  _w: number,
  _h: number,
): void {
  const level = p.levels[p.levelIndex];
  if (!level) return;

  if (level.kind === "physics-stress") {
    renderWalls(ctx, p.walls);
    if (level.shape === "rect") renderRects(ctx, p.bodies);
    else                        renderCircles(ctx, p.circles);
  }
}
