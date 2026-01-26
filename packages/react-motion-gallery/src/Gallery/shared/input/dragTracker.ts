/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxisKey, PointerEventType, WindowType } from "./pointerTypes"

export type DragAxis = {
  scroll: AxisKey
  cross?: AxisKey
}

export type DragTrackerOptions = {
  axis: DragAxis
  ownerWindow: WindowType
  windowMs?: number
  recentMs?: number
  releaseFreshMs?: number
  stillMs?: number
  moveEps?: number
  flickVel?: number
  flickDist?: number
  minVel?: number
}

export function createDragTracker(opts: DragTrackerOptions) {
  const {
    axis,
    ownerWindow,
    windowMs = 120,
    recentMs = 90,
    releaseFreshMs = 180,
    stillMs = 140,
    moveEps = 0.5,
    flickVel = 0.1,
    flickDist = 1,
    minVel = 0.06,
  } = opts

  const EPS = 1e-6

  type Sample = { t: number; dx: number; dy: number }
  let samples: Sample[] = []

  let startX = 0, startY = 0
  let lastX = 0, lastY = 0, lastT = 0
  let lastActiveT = 0

  function now(evt: PointerEventType): number {
    const ts = (evt as any).timeStamp as number | undefined
    const perf = ownerWindow?.performance?.now ? ownerWindow.performance.now() : Date.now()
    return (typeof ts === 'number' && ts > 0) ? ts : perf
  }

  function isMouse(evt: PointerEventType): evt is MouseEvent {
    return (ownerWindow as any).MouseEvent
      ? evt instanceof (ownerWindow as any).MouseEvent
      : 'clientX' in evt && !('touches' in (evt as any))
  }

  function readPoint(evt: PointerEventType, axisKey: AxisKey = axis.scroll) {
    const coord = axisKey === 'x' ? 'clientX' : 'clientY'
    if (isMouse(evt)) return (evt as MouseEvent)[coord]

    const te = evt as TouchEvent
    const touch =
      (te.touches && te.touches[0]) ||
      (te.changedTouches && te.changedTouches[0])

    return touch ? (touch as any)[coord] as number : (axisKey === 'x' ? lastX : lastY)
  }

  function trimTo(t: number) {
    const earliest = t - windowMs * 1.5
    while (samples.length && samples[0].t < earliest) samples.shift()
  }

  function velocityInWindow(endT: number, spanMs: number) {
    const startT = endT - spanMs
    let sumDx = 0, sumDy = 0
    let firstT = Number.POSITIVE_INFINITY, lastT = Number.NEGATIVE_INFINITY

    for (let i = samples.length - 1; i >= 0; i--) {
      const s = samples[i]
      if (s.t < startT) break

      firstT = Math.min(firstT, s.t)
      lastT = Math.max(lastT, s.t)

      const age = s.t - startT
      const w = 0.5 + 0.5 * (age / Math.max(spanMs, 1))

      sumDx += s.dx * w
      sumDy += s.dy * w
    }

    const dt = Math.max(lastT - firstT, EPS)
    return { vx: sumDx / dt, vy: sumDy / dt }
  }

  function displacementInWindow(endT: number, spanMs: number) {
    const startT = endT - spanMs
    let dx = 0, dy = 0

    for (let i = samples.length - 1; i >= 0; i--) {
      const s = samples[i]
      if (s.t < startT) break
      dx += s.dx
      dy += s.dy
    }

    return { dx, dy }
  }

  return {
    axis,

    pointerDown(evt: PointerEventType) {
      samples = []
      startX = lastX = readPoint(evt, 'x')
      startY = lastY = readPoint(evt, 'y')
      return { x: startX, y: startY }
    },

    pointerMove(evt: PointerEventType) {
      const t = now(evt)
      const x = readPoint(evt, 'x')
      const y = readPoint(evt, 'y')

      const dx = x - lastX
      const dy = y - lastY

      samples.push({ t, dx, dy })
      trimTo(t)

      if (Math.abs(dx) >= moveEps || Math.abs(dy) >= moveEps) lastActiveT = t

      lastX = x
      lastY = y
      lastT = t

      return { dx, dy }
    },

    pointerUp(evt: PointerEventType) {
      const t = now(evt)
      samples.push({ t, dx: 0, dy: 0 })
      trimTo(t)

      const sinceLastMove = t - lastT
      const idleMs = t - lastActiveT

      const releasedFresh = sinceLastMove <= releaseFreshMs
      const wasStill = idleMs > stillMs

      if (wasStill) return { fx: 0, fy: 0 }

      const { vx: vxRecent, vy: vyRecent } = velocityInWindow(t, recentMs)
      const { dx: dxRecent, dy: dyRecent } = displacementInWindow(t, recentMs)

      const intentX = releasedFresh && (Math.abs(vxRecent) >= flickVel || Math.abs(dxRecent) >= flickDist)
      const intentY = releasedFresh && (Math.abs(vyRecent) >= flickVel || Math.abs(dyRecent) >= flickDist)

      const { vx, vy } = velocityInWindow(t, windowMs)

      let fx = intentX ? vx : 0
      let fy = intentY ? vy : 0

      if (intentX && Math.abs(fx) < minVel) fx = (dxRecent >= 0 ? 1 : -1) * minVel
      if (intentY && Math.abs(fy) < minVel) fy = (dyRecent >= 0 ? 1 : -1) * minVel

      return { fx, fy }
    },

    readPoint,
  }
}