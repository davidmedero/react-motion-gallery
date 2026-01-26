export type BaseLimit = {
  min: number
  max: number
  reachedAny: (n: number) => boolean
  constrain: (n: number) => number
  removeOffset: (n: number) => number
}

export function createBaseLimit(min: number, max: number): BaseLimit {
  const range = max - min || 1

  function constrain(n: number) {
    return Math.max(min, Math.min(max, n))
  }

  function reachedAny(n: number) {
    return n < min || n > max
  }

  function removeOffset(n: number) {
    let x = n
    while (x < min) x += range
    while (x > max) x -= range
    return x
  }

  return { min, max, constrain, reachedAny, removeOffset }
}