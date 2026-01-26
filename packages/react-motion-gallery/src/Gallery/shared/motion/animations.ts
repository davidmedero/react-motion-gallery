import { WindowType } from "../input/pointerTypes"
import { EventStore } from "./eventStore"

export type AnimationsType = {
  start: () => void
  stop: () => void
  init: () => void
  destroy: () => void
  resetBlend: () => void
}

export function Animations(doc: Document, win: WindowType, update: () => void, render: (a: number) => void): AnimationsType {
  const fixed = 1000 / 60
  const visible = EventStore()
  let last: number | null = null
  let acc = 0
  let animId = 0
  function reset() {
    last = null
    acc = 0
  }
  function animate(ts: number) {
    if (!animId) return
    if (last == null) {
      last = ts
      update()
      update()
    }
    const dt = ts - (last as number)
    last = ts
    acc += dt
    while (acc >= fixed) {
      update()
      acc -= fixed
    }
    const alpha = acc / fixed
    render(alpha)
    if (animId) animId = win.requestAnimationFrame(animate)
  }
  return {
    init() {
      visible.add(doc, 'visibilitychange', () => {
        if (doc.hidden) reset()
      })
    },
    destroy() {
      this.stop()
      visible.clear()
    },
    start() {
      if (animId) return
      animId = win.requestAnimationFrame(animate)
    },
    stop() {
      win.cancelAnimationFrame(animId)
      animId = 0
      reset()
    },
    resetBlend() {
      reset()
    },
  }
}