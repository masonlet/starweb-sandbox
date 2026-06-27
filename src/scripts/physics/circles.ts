import type { CircleBody, AABB        } from "@starweb-libs/physics/types.js";
import { circleVsCircle, circleVsAabb } from "@starweb-libs/physics/collision.js";
import type { Level                   } from "../level/types.ts";

export function spawnCircles(
  count: number,
  level: Level & { kind: "physics-stress" },
  cw:    number,
  ch:    number
): CircleBody[] {
  const pad    = level.padding;
  const px     = cw * pad + 30;
  const py     = ch * pad + 30;
  const rangeX = Math.max(0, cw - px * 2);
  const rangeY = Math.max(0, ch - py * 2);

  return Array.from({ length: count }, () => {
    const speed = 80 + Math.random() * 80;
    const angle = Math.random() * Math.PI * 2;
    return {
      cx:   px + Math.random() * rangeX,
      cy:   py + Math.random() * rangeY,
      r:    4 + Math.random() * 2,
      vx:   Math.cos(angle) * speed,
      vy:   Math.sin(angle) * speed,
      mass: 1,
    };
  });
}

export function updateCircles(
  circles: CircleBody[],
  walls:   AABB[],
  canvasW: number,
  canvasH: number,
  dt:      number
): void {
  const s = dt / 1000;

  for (const c of circles) {
    c.cx += c.vx * s;
    c.cy += c.vy * s;

    for (const wall of walls) {
      const mtv = circleVsAabb(c, wall);
      if (mtv) {
        c.cx += mtv.axis.x * mtv.depth;
        c.cy += mtv.axis.y * mtv.depth;
        const dot = c.vx * mtv.axis.x + c.vy * mtv.axis.y;
        if (dot < 0) {
          c.vx -= 2 * dot * mtv.axis.x;
          c.vy -= 2 * dot * mtv.axis.y;
        }
      }
    }
  }

  const len = circles.length;
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < len; i++) {
      const c = circles[i]!;
      for (let j = i + 1; j < len; j++) {
        const other = circles[j]!;
        const mtv   = circleVsCircle(c, other);
        if (mtv) {
          const totalMass = c.mass + other.mass;
          const ratioA    = other.mass / totalMass;
          const ratioB    = c.mass     / totalMass;

          c.cx     -= mtv.axis.x * mtv.depth * ratioA;
          c.cy     -= mtv.axis.y * mtv.depth * ratioA;
          other.cx += mtv.axis.x * mtv.depth * ratioB;
          other.cy += mtv.axis.y * mtv.depth * ratioB;

          const relVx = c.vx - other.vx;
          const relVy = c.vy - other.vy;
          const dot   = relVx * mtv.axis.x + relVy * mtv.axis.y;
          if (dot > 0) {
            const impulse = (2 * dot) / totalMass;
            c.vx     -= impulse * other.mass * mtv.axis.x;
            c.vy     -= impulse * other.mass * mtv.axis.y;
            other.vx += impulse * c.mass     * mtv.axis.x;
            other.vy += impulse * c.mass     * mtv.axis.y;
          }
        }
      }
    }
  }

  const buffer = 40;
  for (const c of circles) {
    if (c.cx < -buffer || c.cx > canvasW + buffer
     || c.cy < -buffer || c.cy > canvasH + buffer
    ) {
      c.cx = canvasW / 2;
      c.cy = canvasH / 2;
    }
  }
}

export function renderCircles(ctx: CanvasRenderingContext2D, circles: CircleBody[]): void {
  ctx.strokeStyle = "#0af";
  ctx.beginPath();
  for (const c of circles) {
    ctx.moveTo(c.cx + c.r, c.cy);
    ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
  }
  ctx.stroke();
}
