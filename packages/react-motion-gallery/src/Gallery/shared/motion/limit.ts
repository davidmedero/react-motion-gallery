export type LimitType = ReturnType<typeof Limit>

export function Limit(min: number, max: number) {
  const span = max - min || 1

  return {
    min,
    max,
    reachedMin(n: number) { return n < min },
    reachedMax(n: number) { return n > max },
    constrain(n: number)  { return Math.max(min, Math.min(max, n)) },

    reachedAny(n: number) {
      return n < min || n > max
    },
    removeOffset(n: number) {
      let x = n
      while (x < min) x += span
      while (x > max) x -= span
      return x
    },
  }
}