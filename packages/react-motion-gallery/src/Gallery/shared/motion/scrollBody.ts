import type { Vector1DType } from './vector1d'

export type ScrollBodyType = ReturnType<typeof ScrollBody>

export function ScrollBody(
  location: Vector1DType,
  offsetLocation: Vector1DType,
  previousLocation: Vector1DType,
  target: Vector1DType,
  baseDuration: number,
  baseFriction: number
) {
  let vel = 0
  let dir = 0
  let duration = baseDuration
  let friction = baseFriction
  let raw = location.get()
  let rawPrev = 0
  const mathAbs = Math.abs
  return {
    sync() { raw = location.get(); rawPrev = raw; return this },
    resetVelocity() { vel = 0; return this },
    useDuration(n: number) { duration = n; return this },
    useFriction(n: number) { friction = n; return this },
    useBaseDuration() { return this.useDuration(baseDuration) },
    useBaseFriction() { return this.useFriction(baseFriction) },
    duration() { return duration },
    frictionFactor() { return friction },
    direction() { return dir },
    velocity() { return vel },
    seek() {
      const curLoc = location.get()
      const curTgt = target.get()
      const disp = curTgt - curLoc
      const instant = !duration
      let d = 0
      if (instant) {
        vel = 0
        previousLocation.set(curTgt)
        location.set(curTgt)
        d = disp
      } else {
        previousLocation.set(curLoc)
        vel += disp / duration
        vel *= friction
        raw += vel
        location.add(vel)
        d = raw - rawPrev
      }
      dir = Math.sign(d)
      rawPrev = raw
      return this
    },
    settled() {
      const diff = target.get() - offsetLocation.get()
      return mathAbs(diff) < 0.001
    },
  }
}