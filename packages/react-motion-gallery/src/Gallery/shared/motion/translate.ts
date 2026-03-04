import { AXSpec } from "../types/axis";

export function Translate(container: HTMLElement, AX: AXSpec) {
  let prev = NaN;
  function write(n: number) {
    if (n === prev) return;
    container.style.transform = AX.translate(n);
    prev = n;
  }
  return {
    to(target: number) { write(target); },
    get() { return prev; },
    resetCache() { prev = NaN; },
  };
}

export function TranslateFullscreen(container: HTMLElement) {
  let prevX = NaN
  let prevY = NaN
  let lockY = false
  let lockedY = 0
  let suspended = false

  function write(nx: number, ny: number) {
    if (nx === prevX && ny === prevY) return
    container.style.transform = `translate3d(${nx}px, ${ny}px, 0)`
    prevX = nx
    prevY = ny
  }

  return {
    to(targetX: number, targetY = 0) {
      if (suspended) return
      const nx = targetX
      const ny = lockY ? lockedY : targetY
      write(nx, ny)
    },
    lockY(value?: number) {
      lockY = true
      lockedY = Math.round((value ?? prevY) || 0)
      write(prevX || 0, lockedY)
    },
    unlockY() { lockY = false },
    suspend(on = true) { suspended = on },
    get() { return { x: prevX, y: prevY } },
    resetCache() { prevX = NaN; prevY = NaN }
  }
}