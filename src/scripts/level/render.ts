import type { AABB } from "@starweb-libs/physics/types.js";

export function renderWalls(ctx: CanvasRenderingContext2D, walls: AABB[]): void {
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  for (const wall of walls)
    ctx.strokeRect(wall.cx - wall.hw, wall.cy - wall.hh, wall.hw * 2, wall.hh * 2);
}
