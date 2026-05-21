import * as React from 'react';

type RevealVariant = "fade" | "transform";
type RevealLength = number | string;
type RevealAngle = number | string;
type RevealTransformObject = {
    x?: RevealLength;
    y?: RevealLength;
    z?: RevealLength;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    rotate?: RevealAngle;
    rotateX?: RevealAngle;
    rotateY?: RevealAngle;
    skewX?: RevealAngle;
    skewY?: RevealAngle;
    perspective?: RevealLength;
    raw?: string;
};
type RevealTransform = RevealTransformObject | string;
type RevealOptions = {
    variant?: RevealVariant;
    transform?: RevealTransform;
    once?: boolean;
    threshold?: number;
    rootMargin?: string;
    durationMs?: number;
    opacityDurationMs?: number;
    transformDurationMs?: number;
    delayMs?: number;
    staggerIndex?: number;
    staggerMs?: number;
    easing?: string;
    disabled?: boolean;
    onReveal?: () => void;
};
type UseRevealResult<T extends HTMLElement = HTMLElement> = {
    ref: React.RefCallback<T>;
    revealed: boolean;
    inView: boolean;
    revealProps: {
        className: string;
        style: React.CSSProperties;
        "data-rmg-reveal": string;
        "data-rmg-reveal-owned": "true" | "false";
        "data-rmg-reveal-state": "hidden" | "revealed";
        "data-rmg-reveal-variant": RevealVariant;
        "data-rmg-reveal-initializing"?: "true";
        "data-rmg-reveal-reduced"?: "true";
        "data-rmg-reveal-disabled"?: "true";
    };
};
type RevealOwnProps<E extends React.ElementType> = RevealOptions & {
    as?: E;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};
type RevealProps<E extends React.ElementType = "div"> = RevealOwnProps<E> & Omit<React.ComponentPropsWithoutRef<E>, keyof RevealOwnProps<E> | "as" | "style" | "className">;
declare function resolveRevealTransform(transform?: RevealTransform): string;
declare function useReveal<T extends HTMLElement = HTMLElement>(options?: RevealOptions): UseRevealResult<T>;
declare const Reveal: <E extends React.ElementType = "div">(props: RevealProps<E> & {
    ref?: React.Ref<HTMLElement>;
}) => React.ReactElement | null;

export { Reveal, type RevealAngle, type RevealLength, type RevealOptions, type RevealProps, type RevealTransform, type RevealTransformObject, type RevealVariant, type UseRevealResult, Reveal as default, resolveRevealTransform, useReveal };
