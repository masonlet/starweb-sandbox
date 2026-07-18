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

function handlePlayingFrame(
  frame: FrameState,
  playState: PlayState,
  audio: Audio,
  dt: number
): FrameState {
  if (updatePlayState(playState, dt)) {
    audio.playSound("win");
    return { game: "level-complete", ui: null };
  }
  return frame;
}

export function updateFrame(
  size: { width: number; height: number },
  frame: FrameState,
  playState: PlayState,
  a: Audio,
  dt: number
): FrameState {
  const newW = size.width;
  const newH = size.height;
  if (newW !== playState.canvasW || newH !== playState.canvasH) {
    playState.canvasW = newW;
    playState.canvasH = newH;
    const level = playState.levels[playState.levelIndex];
    if (level) playState.walls = buildWalls(level, newW, newH);
  }

  if (wasPressed("Escape")) {
    if (frame.game === "level-playing") return transition({ game: "level-paused",  ui: null }, a);
    if (frame.game === "level-paused" ) return transition({ game: "level-playing", ui: null }, a);
  }

  const { width: w, height: h } = size;
  switch (frame.game) {
    case "menu-title":     return handleTitleFrame   (w, h, a, playState.levels.length, () => selectLevel(playState, 0));
    case "menu-levels":    return handleLevelFrame   (w, h, a, playState.levels, (i) => selectLevel(playState, i));
    case "menu-settings":  { const r = handleSettingsFrame(w, h, playState.volState, a); playState.volState = r.volState; return r.frame; }
    case "level-playing":  return handlePlayingFrame (frame, playState, a, dt);
    case "level-paused":   return handlePauseFrame   (w, h, a, () => resetPlayState(playState));
    case "level-complete": return handleCompleteFrame(w, h, a, playState.levelIndex, playState.levels.length, (i) => selectLevel(playState, i), () => resetPlayState(playState));
  }
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  size: { width: number; height: number },
  frame: FrameState,
  playState: PlayState
): void {
  const { width: w, height: h } = size;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  if (!frame.game.startsWith("menu-")) renderPlayState(ctx, playState, w, h);

  switch (frame.game) {
    case "menu-title":     renderTitleFrame(ctx, frame.ui, "Web Engine Sandbox", 0.08); break;
    case "menu-settings":  renderSettingsFrame(ctx, frame.ui);       break;
    case "menu-levels":    renderLevelFrame   (ctx, frame.ui);       break;
    case "level-paused":   renderPauseFrame   (ctx, frame.ui, w, h); break;
    case "level-complete": renderCompleteFrame(ctx, frame.ui, w, h); break;
  }
}
