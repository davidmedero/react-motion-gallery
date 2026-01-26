export type Vector1DType = {
  get: () => number
  set: (n: number) => void
  add: (n: number) => void
}

export function Vector1D(initial: number): Vector1DType {
  let v = initial
  return {
    get: () => v,
    set: (n) => {
      v = n
    },
    add: (n) => {
      v += n
    },
  }
}