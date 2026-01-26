export type WindowType = Window & typeof globalThis
export type AxisKey = 'x' | 'y'
export type PointerEventType = PointerEvent | MouseEvent | TouchEvent

export function isMouseEvent(evt: PointerEventType, ownerWindow: WindowType): evt is MouseEvent {
  return typeof ownerWindow.MouseEvent !== 'undefined' && evt instanceof ownerWindow.MouseEvent
}