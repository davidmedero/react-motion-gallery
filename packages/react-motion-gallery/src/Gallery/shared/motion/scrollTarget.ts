import { Limit } from "./limit"
import { Vector1DType } from "./vector1d"

export type BaseTarget = {
  distance: number
  index: number
}

export type ScrollTargetType = {
  byIndex: (target: number, direction: number) => BaseTarget
  byDistance: (force: number, snap: boolean) => BaseTarget
  shortcut: (target: number, direction: number) => number
}

export function ScrollTarget(
  loop: boolean,
  scrollSnaps: number[],
  contentSize: number,
  limit: ReturnType<typeof Limit>,
  targetVector: Vector1DType
): ScrollTargetType {
  const { reachedAny, removeOffset, constrain } = limit

  function minDistance(distances: number[]): number {
    return distances
      .concat()
      .sort((a, b) => Math.abs(a) - Math.abs(b))[0]
  }

  function shortcut(target: number, direction: number): number {
    const targets = [target, target + contentSize, target - contentSize]

    if (!loop) return target
    if (!direction) return minDistance(targets)

    const dir = Math.sign(direction)
    const matchingTargets = targets.filter((t) => Math.sign(t) === dir)

    if (matchingTargets.length) return minDistance(matchingTargets)
    return arrayLast(targets) - contentSize
  }

  function findTargetSnap(target: number): BaseTarget {
    const distance = loop ? removeOffset(target) : constrain(target)
    const ascDiffsToSnaps = scrollSnaps
      .map((snap, index) => ({
        diff: shortcut(snap - distance, 0),
        index,
      }))
      .sort((d1, d2) => Math.abs(d1.diff) - Math.abs(d2.diff))

    const { index } = ascDiffsToSnaps[0]
    return { index, distance }
  }

  function byIndex(index: number, direction: number): BaseTarget {
    const diffToSnap = scrollSnaps[index] - targetVector.get()
    const distance = shortcut(diffToSnap, direction)
    return { index, distance }
  }

  function byDistance(distance: number, snap: boolean): BaseTarget {
    const target = targetVector.get() + distance
    const { index, distance: targetSnapDistance } = findTargetSnap(target)
    const reachedBound = !loop && reachedAny(target)

    if (!snap || reachedBound) return { index, distance }

    const diffToSnap = scrollSnaps[index] - targetSnapDistance
    const snapDistance = distance + shortcut(diffToSnap, 0)

    return { index, distance: snapDistance }
  }

  return { byDistance, byIndex, shortcut }
}

const mathAbs = Math.abs

export const mathSign = (n: number) => (n === 0 ? 0 : n > 0 ? 1 : -1)

export function deltaAbs(valueB: number, valueA: number): number {
  return mathAbs(valueB - valueA)
}

export function factorAbs(valueB: number, valueA: number): number {
  if (valueB === 0 || valueA === 0) return 0
  if (mathAbs(valueB) <= mathAbs(valueA)) return 0
  const diff = deltaAbs(mathAbs(valueB), mathAbs(valueA))
  return mathAbs(diff / valueB)
}

export function arrayLast<Type>(array: Type[]): Type {
  return array[arrayLastIndex(array)]
}

export function arrayLastIndex<Type>(array: Type[]): number {
  return Math.max(0, array.length - 1)
}