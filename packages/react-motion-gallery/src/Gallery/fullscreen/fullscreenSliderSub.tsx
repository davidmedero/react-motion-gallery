export type JumpMode = 'instant' | 'animated';
export type FSRequest =
  | { type: 'requestSet'; index: number; mode?: JumpMode }
  | { type: 'requestNext' }
  | { type: 'requestPrev' }
  | { type: 'center' };

export type FSEvent =
  | { type: 'internalIndex'; index: number }
  | { type: 'mounted' }
  | { type: 'unmounted' };

export type FullscreenSliderSub = {
  get: () => number;
  requestSet: (index: number, mode?: JumpMode) => void;
  requestPrev: () => void;
  requestNext: () => void;
  requestCenter: () => void;
  onEvent: (fn: (evt: FSEvent) => void) => () => void;
  onRequest: (fn: (req: FSRequest) => void) => () => void;
  setLocalIndex: (index: number) => void;
  destroy: () => void;
};

export function createFullscreenSliderSub(initialIndex = 0): FullscreenSliderSub {
  let curIndex = initialIndex;

  const reqSubs = new Set<(r: FSRequest) => void>();
  const evtSubs = new Set<(e: FSEvent) => void>();

  const api: FullscreenSliderSub = {
    get: () => curIndex,

    requestSet(index, mode) {
      reqSubs.forEach((fn) => fn({ type: 'requestSet', index, mode }));
    },
    requestPrev() {
      reqSubs.forEach((fn) => fn({ type: 'requestPrev' }));
    },
    requestNext() {
      reqSubs.forEach((fn) => fn({ type: 'requestNext' }));
    },
    requestCenter() {
      reqSubs.forEach((fn) => fn({ type: 'center' }));
    },

    onEvent(fn) {
      evtSubs.add(fn);
      return () => evtSubs.delete(fn);
    },
    onRequest(fn) {
      reqSubs.add(fn);
      return () => reqSubs.delete(fn);
    },

    setLocalIndex(index) {
      curIndex = index;
      evtSubs.forEach((fn) => fn({ type: 'internalIndex', index }));
    },

    destroy() {
      reqSubs.clear();
      evtSubs.clear();
    },
  };

  queueMicrotask(() => {
    evtSubs.forEach((fn) => fn({ type: 'mounted' }));
  });

  return api;
}