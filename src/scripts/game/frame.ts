import type { Audio                               } from "@starweb-libs/audio/audio.js";
import { wasPressed                               } from "@starweb-libs/engine/input/keyboard.js";
import { transition                               } from "@starweb-libs/menus/transition.js";
import { handleTitleFrame,    renderTitleFrame    } from "@starweb-libs/menus/title.js";
import { handleSettingsFrame, renderSettingsFrame } from "@starweb-libs/menus/settings.js";
import { handleLevelFrame,    renderLevelFrame    } from "@starweb-libs/menus/levels.js";
import { handlePauseFrame,    renderPauseFrame    } from "@starweb-libs/menus/pause.js";
import { handleCompleteFrame, renderCompleteFrame } from "@starweb-libs/menus/complete.js";
import type { FrameState, PlayState } from "./types.ts";
import { updatePlayState, renderPlayState, selectLevel, resetPlayState } from "./play.ts";
import { buildWalls } from "../level/build.ts";

function handlePlayingFrame(fs: FrameState, ps: PlayState, a: Audio, dt: number): FrameState {
  if (updatePlayState(ps, dt)) {
    a.playSound("win");
    return { game: "level-complete", ui: null };
  }
  return fs;
}

export function updateFrame(
  fs: FrameState,
  ps: PlayState,
  a: Audio,
  dt: number,
  size: { width: number; height: number },
): FrameState {
  const newW = size.width;
  const newH = size.height;
  if (newW !== ps.canvasW || newH !== ps.canvasH) {
    ps.canvasW = newW;
    ps.canvasH = newH;
    const level = ps.levels[ps.levelIndex];
    if (level) ps.walls = buildWalls(level, newW, newH);
  }

  if (wasPressed("Escape")) {
    if (fs.game === "level-playing") return transition({ game: "level-paused",  ui: null }, a);
    if (fs.game === "level-paused" ) return transition({ game: "level-playing", ui: null }, a);
  }

  const { width: w, height: h } = size;
  switch (fs.game) {
    case "menu-title":     return handleTitleFrame   (w, h, a, ps.levels.length, () => selectLevel(ps, 0));
    case "menu-levels":    return handleLevelFrame   (w, h, a, ps.levels, (i) => selectLevel(ps, i));
    case "menu-settings":  { const r = handleSettingsFrame(w, h, ps.volState, a); ps.volState = r.volState; return r.frame; }
    case "level-playing":  return handlePlayingFrame (fs, ps, a, dt);
    case "level-paused":   return handlePauseFrame   (w, h, a, () => resetPlayState(ps));
    case "level-complete": return handleCompleteFrame(w, h, a, ps.levelIndex, ps.levels.length, (i) => selectLevel(ps, i), () => resetPlayState(ps));
  }
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  fs: FrameState,
  ps: PlayState,
  size: { width: number; height: number },
): void {
  const { width: w, height: h } = size;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  if (!fs.game.startsWith("menu-")) renderPlayState(ctx, ps);
  switch (fs.game) {
    case "menu-title":     renderTitleFrame   (ctx, fs.ui, "Web Engine Sandbox", 0.08); break;
    case "menu-settings":  renderSettingsFrame(ctx, fs.ui);       break;
    case "menu-levels":    renderLevelFrame   (ctx, fs.ui);       break;
    case "level-paused":   renderPauseFrame   (ctx, fs.ui, w, h); break;
    case "level-complete": renderCompleteFrame(ctx, fs.ui, w, h); break;
  }
}
