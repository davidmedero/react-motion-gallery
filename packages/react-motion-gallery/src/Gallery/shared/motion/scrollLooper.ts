import { Limit, LimitType } from "./limit"
import { Vector1DType } from "./vector1d"

export function ScrollLooper(
  contentSize: number,
  limit: LimitType,
  location: Vector1DType,
  vectors: Vector1DType[]
) {
  const jointSafety = 0.1
  const min = limit.min + jointSafety
  const max = limit.max + jointSafety
  const l = Limit(min, max)

  function shouldLoop(direction: number) {
    if (direction === 1)  return l.reachedMax(location.get())
    if (direction === -1) return l.reachedMin(location.get())
    return false
  }

  return {
    loop(direction: number) {
      if (!shouldLoop(direction)) return 0
      const shift = contentSize * (direction * -1)
      vectors.forEach(v => v.add(shift))
      return shift
    }
  }
}
