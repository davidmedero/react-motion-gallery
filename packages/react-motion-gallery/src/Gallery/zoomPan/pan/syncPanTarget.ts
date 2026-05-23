type VectorLike = {
  get(): number;
  set(value: number): void;
};

export type PanTarget = { x: number; y: number };
export type PanTargetSyncMode = "instant" | "target";

export type PanTargetSyncCtx = {
  panRef?: { current: PanTarget };
  locX: { current: VectorLike | null };
  prevX: { current: VectorLike | null };
  offX: { current: VectorLike | null };
  tgtX: { current: VectorLike | null };
  locY: { current: VectorLike | null };
  prevY: { current: VectorLike | null };
  offY: { current: VectorLike | null };
  tgtY: { current: VectorLike | null };
};

export function syncPanTarget(
  ctx: PanTargetSyncCtx,
  target: PanTarget,
  mode: PanTargetSyncMode = "instant"
) {
  const next = { x: target.x, y: target.y };

  if (ctx.panRef) ctx.panRef.current = next;

  ctx.tgtX.current?.set(next.x);
  ctx.tgtY.current?.set(next.y);

  if (mode === "target") return;

  ctx.offX.current?.set(next.x);
  ctx.locX.current?.set(next.x);
  ctx.prevX.current?.set(next.x);

  ctx.offY.current?.set(next.y);
  ctx.locY.current?.set(next.y);
  ctx.prevY.current?.set(next.y);
}
