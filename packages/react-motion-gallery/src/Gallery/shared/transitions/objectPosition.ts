export function parseObjectPosition(op: string | null): { x: number; y: number } {
    if (!op) return { x: 0.5, y: 0.5 }
    const mapKW = (kw: string, isX: boolean) => {
      const lower = kw.toLowerCase()
      if (isX) {
        if (lower === 'left') return 0
        if (lower === 'center') return 0.5
        if (lower === 'right') return 1
      } else {
        if (lower === 'top') return 0
        if (lower === 'center') return 0.5
        if (lower === 'bottom') return 1
      }
      return NaN
    }
    const parts = op.trim().split(/\s+/)
    let xf = 0.5, yf = 0.5
    if (parts.length >= 1) {
      const p0 = parts[0]
      if (p0.endsWith('%')) xf = Math.min(1, Math.max(0, parseFloat(p0) / 100))
      else {
        const m0 = mapKW(p0, true)
        if (!Number.isNaN(m0)) xf = m0
      }
    }
    if (parts.length >= 2) {
      const p1 = parts[1]
      if (p1.endsWith('%')) yf = Math.min(1, Math.max(0, parseFloat(p1) / 100))
      else {
        const m1 = mapKW(p1, false)
        if (!Number.isNaN(m1)) yf = m1
      }
    }
    return { x: xf, y: yf }
  }