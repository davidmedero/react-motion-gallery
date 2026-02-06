import { Limit, LimitType } from "./limit"
import { ScrollBodyType } from "./scrollBody"
import { Vector1DType } from "./vector1d"

export type ScrollBoundsType = ReturnType<typeof ScrollBounds>

export function ScrollBounds(
  limit: LimitType,
  location: Vector1DType,
  target: Vector1DType,
  body: ScrollBodyType,
  pov: PercentOfViewType,
  selectDuration: number
) {
  const pullBack = pov.measure(10)
  const edgeTol  = pov.measure(50)
  const fricLim  = Limit(0.5, 1)

  function reached() {
    return limit.reachedAny(target.get()) && limit.reachedAny(location.get())
  }

  return {
    reached,
    constrain(pointerDown: boolean) {
      if (!reached()) return
      const edge = limit.reachedMin(location.get()) ? 'min' : 'max'
      const distToEdge   = Math.abs(limit[edge] - location.get())
      const distToTarget = target.get() - location.get()
      const f = fricLim.constrain(distToEdge / edgeTol)

      target.set(target.get() - distToTarget * f)

      if (!pointerDown && Math.abs(distToTarget) < pullBack) {
        target.set(limit.constrain(target.get()))
        body.useDuration(selectDuration).useBaseFriction()
      }
    },
  }
}

export type PercentOfViewType = ReturnType<typeof PercentOfView>

export function PercentOfView(viewSize: number) {
  return {
    measure(n: number) {
      return (viewSize * n) / 100
    },
  }
}