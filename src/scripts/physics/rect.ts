import type { OBB, AABB } from "@starweb-libs/physics/types.js";
import { obbVsAabb      } from "@starweb-libs/physics/collision.js";
import type { Level     } from "../level/types.ts";

export function spawnRects(
  count: number,
  level: Level & { kind: "physics-stress" },
  cw: number,
  ch: number
): OBB[] {
  const pad = level.padding;
  const px = cw * pad + 10;
  const py = ch * pad + 10;
  return Array.from({ length: count }, () => ({
    cx:    px + Math.random() * (cw - px * 2),
    cy:    py + Math.random() * (ch - py * 2),
    hw:    10 + Math.random() * 20,
    hh:    10 + Math.random() * 20,
    angle: Math.random() * Math.PI * 2,
  }));
}

export function updateRects(bodies: OBB[], walls: AABB[], canvasW: number, canvasH: number, dt: number): void {
  for (const b of bodies) {
    b.cx += Math.cos(b.angle) * 100 * (dt / 1000);
    b.cy += Math.sin(b.angle) * 100 * (dt / 1000);
    for (const wall of walls) {
      const mtv = obbVsAabb(b, wall);
      if (mtv) {
        b.cx += mtv.axis.x * mtv.depth;
        b.cy += mtv.axis.y * mtv.depth;
        const dot = Math.cos(b.angle) * mtv.axis.x + Math.sin(b.angle) * mtv.axis.y;
        const rx = Math.cos(b.angle) - 2 * dot * mtv.axis.x;
        const ry = Math.sin(b.angle) - 2 * dot * mtv.axis.y;
        b.angle = Math.atan2(ry, rx);
      }
    }
    if (b.cx < 0 || b.cx > canvasW || b.cy < 0 || b.cy > canvasH) {
      b.cx = canvasW / 2;
      b.cy = canvasH / 2;
    }
  }
}

export function renderRects(ctx: CanvasRenderingContext2D, bodies: OBB[]): void {
  ctx.strokeStyle = "#0f0";
  for (const b of bodies) {
    ctx.save();
    ctx.translate(b.cx, b.cy);
    ctx.rotate(b.angle);
    ctx.strokeRect(-b.hw, -b.hh, b.hw * 2, b.hh * 2);
    ctx.restore();
  }
}
