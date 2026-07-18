import type { OBB, AABB, CircleBody } from "@starweb-libs/physics/types.js";
import type { SliderState           } from "@starweb-libs/ui/types.js";
import type {
  TitleMenuState,
  SettingsMenuState,
  LevelSelectState,
  PauseMenuState,
  CompleteMenuState
} from "@starweb-libs/menus/types.js";
import type { Level } from "../level/types.ts";

export interface PlayState {
  levels:     Level[];
  levelIndex: number;
  volState:   SliderState;
  canvasW:    number;
  canvasH:    number;
  walls:      AABB[];
  bodies:     OBB[];
  circles:    CircleBody[];
}

export type FrameState = { game: "menu-title";     ui: TitleMenuState    | null }
                       | { game: "menu-settings";  ui: SettingsMenuState | null }
                       | { game: "menu-levels";    ui: LevelSelectState  | null }
                       | { game: "level-playing";  ui:                     null }
                       | { game: "level-paused";   ui: PauseMenuState    | null }
                       | { game: "level-complete"; ui: CompleteMenuState | null }
