import { I as IndexMode } from './types-tb9Qf2Mj.mjs';

type IndexListener = () => void;
type IndexEvent = {
    type: "set";
    index: number;
    mode: IndexMode;
} | {
    type: "bump";
    delta: number;
    mode: IndexMode;
};
type EventListener = (ev: IndexEvent) => void;
type BasePointerDownListener = () => void;
type SliderIndexChannel = ReturnType<typeof createSliderIndexChannel>;
declare function createSliderIndexChannel(initialIndex?: number, initialMode?: IndexMode): {
    get(): {
        index: number;
        mode: IndexMode;
    };
    set(next: number, m?: IndexMode, opts?: {
        silent?: boolean;
    }): void;
    bump(delta: number, m?: IndexMode, opts?: {
        silent?: boolean;
    }): void;
    subscribe(fn: IndexListener): () => void;
    onEvent(fn: EventListener): () => void;
    onBasePointerDown(fn: BasePointerDownListener): () => void;
    emitBasePointerDown: () => void;
};

export { type SliderIndexChannel as S, createSliderIndexChannel as c };
