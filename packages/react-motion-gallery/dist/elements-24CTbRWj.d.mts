type ArrowRenderArgs = {
    ref: React.RefObject<HTMLDivElement | null>;
    onClick: () => void;
    hidden: boolean;
    disabled: boolean;
    createRipple: (el: HTMLElement) => void;
    className?: string;
};
type DotsRenderArgs = {
    ref: React.RefObject<HTMLDivElement | null>;
    count: number;
    activeIndex: number;
    hidden: boolean;
    goTo: (index: number) => void;
    getDotRef: (index: number) => (el: HTMLDivElement | null) => void;
    createRipple: (el: HTMLElement) => void;
    classNameContainer?: string;
    classNameDot?: string;
};
type ProgressRenderArgs = {
    ref: React.Ref<HTMLDivElement>;
    innerRef?: React.Ref<HTMLDivElement>;
    hidden: boolean;
    progress: number;
    axis: 'x' | 'y';
    className?: string;
    style?: React.CSSProperties;
    innerClassName?: string;
    innerStyle?: React.CSSProperties;
};
type ScrollbarRenderArgs = {
    ref: React.RefObject<HTMLInputElement | null>;
    hidden: boolean;
    value: number;
    axis: 'x' | 'y';
    min: number;
    max: number;
    step: number;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    style?: React.CSSProperties;
};

type ElementStyle = {
    className?: string;
    style?: React.CSSProperties;
};

export type { ArrowRenderArgs as A, DotsRenderArgs as D, ElementStyle as E, ProgressRenderArgs as P, ScrollbarRenderArgs as S };
