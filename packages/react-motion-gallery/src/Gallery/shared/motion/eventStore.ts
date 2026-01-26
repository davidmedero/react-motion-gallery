/* eslint-disable @typescript-eslint/no-explicit-any */
export function EventStore() {
  const listeners: Array<() => void> = []
  return {
    add<T extends EventTarget>(
      t: T,
      type: string,
      fn: EventListenerOrEventListenerObject,
      opts?: AddEventListenerOptions | boolean
    ) {
      t.addEventListener(type, fn as any, opts as any)
      listeners.push(() => t.removeEventListener(type, fn as any, opts as any))
      return this
    },
    clear() {
      while (listeners.length) listeners.pop()?.()
    },
  }
}