export type AXSpec = {
  main: 'x' | 'y';
  cross: 'x' | 'y';
  sizeKey: 'width' | 'height';
  clientKey: 'clientWidth' | 'clientHeight';
  startKey: 'left' | 'top';
  endKey: 'right' | 'bottom';
  translate: (n: number) => string;
  place: (n: number) => string;
  wheelDelta: (e: WheelEvent) => number;
};

type AxisKey = 'x' | 'y'

export function Axis(isHorizontal: boolean): {
  scroll: AxisKey; cross: AxisKey; measureSize: (rect: DOMRect) => number;
} {
  const scroll: AxisKey = isHorizontal ? 'x' : 'y'
  const cross:  AxisKey = isHorizontal ? 'y' : 'x'
  return {
    scroll, cross,
    measureSize(rect: DOMRect) { return isHorizontal ? rect.width : rect.height },
  }
}
export type AxisType = ReturnType<typeof Axis>

export function FullscreenAxis() {
  return {
    scroll: 'x' as const,
    cross: 'y' as const,
    direction(n: number) {
      return n
    },
    measureSize(rect: DOMRect) {
      return rect.width
    }
  }
}
export type FullscreenAxisType = ReturnType<typeof FullscreenAxis>

export type FullscreenAxisLike = {
  scroll: 'x' | 'y'
  cross: 'x' | 'y'
  direction: (n: number) => number
  measureSize?: (rect: DOMRect) => number
}

export function PanAxis() {
  return {
    scroll: 'x' as const,
    cross: 'y' as const,
    direction(n: number) {
      return n
    },
  }
}
export type PanAxisType = ReturnType<typeof PanAxis>