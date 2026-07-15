import { transition } from "@starweb-libs/engine/transition.js";
import { wasPressed } from "@starweb-libs/engine/input/keyboard.js";
import type { Audio } from "@starweb-libs/audio/audio.js";
import type { FrameState, PlayState               } from "./types.ts";
import { updatePlayState,     renderPlayState     } from "./play.ts";
import { handleTitleFrame,    renderTitleFrame    } from "../ui/title.ts";
import { handleSettingsFrame, renderSettingsFrame } from "../ui/settings.ts";
import { handleLevelFrame,    renderLevelFrame    } from "../ui/levels.ts";
import { handlePauseFrame,    renderPauseFrame    } from "../ui/pause.ts";
import { handleCompleteFrame, renderCompleteFrame } from "../ui/complete.ts";
import { buildWalls                               } from "../level/build.ts";

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
  audio: Audio,
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
    if (frame.game === "level-playing") return transition({ game: "level-paused",  ui: null }, audio);
    if (frame.game === "level-paused" ) return transition({ game: "level-playing", ui: null }, audio);
  }

  const { width: w, height: h } = size;
  switch (frame.game) {
    case "menu-title":     return handleTitleFrame   (w, h, playState, audio);
    case "menu-levels":    return handleLevelFrame   (w, h, playState, audio);
    case "menu-settings":  return handleSettingsFrame(w, h, playState, audio);
    case "level-playing":  return handlePlayingFrame (frame, playState, audio, dt);
    case "level-paused":   return handlePauseFrame   (w, h, playState, audio);
    case "level-complete": return handleCompleteFrame(w, h, playState, audio);
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
    case "menu-title":     renderTitleFrame   (ctx, frame.ui);       break;
    case "menu-settings":  renderSettingsFrame(ctx, frame.ui);       break;
    case "menu-levels":    renderLevelFrame   (ctx, frame.ui);       break;
    case "level-paused":   renderPauseFrame   (ctx, w, h, frame.ui); break;
    case "level-complete": renderCompleteFrame(ctx, w, h, frame.ui); break;
  }
}
