import { IndexMode } from "../api/types";

type IndexListener = () => void;

export type IndexEvent =
  | { type: "set"; index: number; mode: IndexMode }
  | { type: "bump"; delta: number; mode: IndexMode };

type EventListener = (ev: IndexEvent) => void;

type BasePointerDownListener = () => void;

export type SliderIndexChannel = ReturnType<typeof createSliderIndexChannel>;

export function createSliderIndexChannel(
  initialIndex = 0,
  initialMode: IndexMode = "animated"
) {
  let index = initialIndex;
  let mode: IndexMode = initialMode;
  let lastEvent: IndexEvent = { type: "set", index: initialIndex, mode: initialMode };

  const subs = new Set<IndexListener>();
  const evtSubs = new Set<EventListener>();

  const baseDownSubs = new Set<BasePointerDownListener>();

  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const ev = lastEvent;
      evtSubs.forEach((fn) => fn(ev));
      subs.forEach((fn) => fn());
    });
  };

  const emitBasePointerDown = () => {
    baseDownSubs.forEach((fn) => fn());
  };

  return {
    get() {
      return { index, mode };
    },

    set(next: number, m: IndexMode = "animated", opts?: { silent?: boolean }) {
      index = next;
      mode = m;
      lastEvent = { type: "set", index, mode: m };
      if (!opts?.silent) schedule();
    },

    bump(delta: number, m: IndexMode = "animated", opts?: { silent?: boolean }) {
      lastEvent = { type: "bump", delta: delta | 0, mode: m };
      if (!opts?.silent) schedule();
    },

    subscribe(fn: IndexListener): () => void {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },

    onEvent(fn: EventListener): () => void {
      evtSubs.add(fn);
      return () => {
        evtSubs.delete(fn);
      };
    },

    onBasePointerDown(fn: BasePointerDownListener): () => void {
      baseDownSubs.add(fn);
      return () => {
        baseDownSubs.delete(fn);
      };
    },

    emitBasePointerDown,
  };
}

export default createSliderIndexChannel;