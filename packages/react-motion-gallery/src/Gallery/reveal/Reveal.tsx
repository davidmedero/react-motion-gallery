"use client";

import * as React from "react";

import { usePrefersReducedMotion } from "../shared/hooks/usePrefersReducedMotion";
import styles from "./Reveal.module.css";

export type RevealVariant = "fade" | "transform";
export type RevealLength = number | string;
export type RevealAngle = number | string;
export type RevealMotionChannel = "opacity" | "transform";
export type RevealChannelOptions<T> = Partial<Record<RevealMotionChannel, T>>;
export type RevealDuration = number | RevealChannelOptions<number>;
export type RevealEasing = string | RevealChannelOptions<string>;

export type RevealTransformObject = {
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

export type RevealTransform = RevealTransformObject | string;

export type RevealOptions = {
  variant?: RevealVariant;
  transform?: RevealTransform;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  durationMs?: RevealDuration;
  delayMs?: number;
  staggerIndex?: number;
  staggerMs?: number;
  easing?: RevealEasing;
  disabled?: boolean;
  onReveal?: () => void;
};

export type UseRevealResult<T extends HTMLElement = HTMLElement> = {
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

type RevealState = {
  owned: boolean;
  revealed: boolean;
  inView: boolean;
  initializing: boolean;
};

type RevealOwnProps<E extends React.ElementType> = RevealOptions & {
  as?: E;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export type RevealProps<E extends React.ElementType = "div"> =
  RevealOwnProps<E> &
    Omit<
      React.ComponentPropsWithoutRef<E>,
      keyof RevealOwnProps<E> | "as" | "style" | "className"
    >;

const DEFAULT_TRANSFORM: RevealTransform = { y: 14 };
const DEFAULT_EASING = "cubic-bezier(0.2, 0.7, 0.2, 1)";
const DEFAULT_ROOT_MARGIN = "0px 0px -8% 0px";
const DEFAULT_THRESHOLD = 0.12;
const DEFAULT_DURATION_MS = 520;
const DEFAULT_STAGGER_MS = 70;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function cssLength(value: RevealLength | undefined, fallback = "0px") {
  if (value == null) return fallback;
  return typeof value === "number" ? `${value}px` : value;
}

function cssAngle(value: RevealAngle | undefined) {
  if (value == null) return null;
  return typeof value === "number" ? `${value}deg` : value;
}

function clampThreshold(value: number | undefined) {
  if (!Number.isFinite(value)) return DEFAULT_THRESHOLD;
  return Math.min(1, Math.max(0, Number(value)));
}

function resolveDelayMs(options: RevealOptions) {
  const delayMs = options.delayMs ?? 0;
  const staggerIndex = options.staggerIndex ?? 0;
  const staggerMs = options.staggerMs ?? DEFAULT_STAGGER_MS;
  return Math.max(0, delayMs + Math.max(0, staggerIndex) * Math.max(0, staggerMs));
}

function resolveDurationMs(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : fallback;
}

function resolveRevealDurationMs(
  duration: RevealDuration | undefined,
  channel: RevealMotionChannel
) {
  if (typeof duration === "number") {
    return resolveDurationMs(duration, DEFAULT_DURATION_MS);
  }

  return resolveDurationMs(duration?.[channel], DEFAULT_DURATION_MS);
}

function resolveRevealEasing(
  easing: RevealEasing | undefined,
  channel: RevealMotionChannel
) {
  if (typeof easing === "string") return easing;
  return easing?.[channel] ?? DEFAULT_EASING;
}

export function resolveRevealTransform(transform: RevealTransform = DEFAULT_TRANSFORM) {
  if (typeof transform === "string") return transform || "none";

  const parts: string[] = [];
  const x = cssLength(transform.x);
  const y = cssLength(transform.y);
  const z = cssLength(transform.z);
  const hasTranslate = transform.x != null || transform.y != null || transform.z != null;
  const scaleX = transform.scaleX ?? transform.scale ?? 1;
  const scaleY = transform.scaleY ?? transform.scale ?? 1;
  const hasScale =
    transform.scale != null || transform.scaleX != null || transform.scaleY != null;
  const rotate = cssAngle(transform.rotate);
  const rotateX = cssAngle(transform.rotateX);
  const rotateY = cssAngle(transform.rotateY);
  const skewX = cssAngle(transform.skewX);
  const skewY = cssAngle(transform.skewY);

  if (transform.perspective != null) {
    parts.push(`perspective(${cssLength(transform.perspective)})`);
  }

  if (hasTranslate) {
    parts.push(`translate3d(${x}, ${y}, ${z})`);
  }

  if (hasScale) {
    parts.push(`scale3d(${scaleX}, ${scaleY}, 1)`);
  }

  if (rotate) parts.push(`rotate(${rotate})`);
  if (rotateX) parts.push(`rotateX(${rotateX})`);
  if (rotateY) parts.push(`rotateY(${rotateY})`);
  if (skewX) parts.push(`skewX(${skewX})`);
  if (skewY) parts.push(`skewY(${skewY})`);
  if (transform.raw) parts.push(transform.raw);

  return parts.length ? parts.join(" ") : "none";
}

function getViewportRect() {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

  return {
    top: 0,
    left: 0,
    right: viewportWidth,
    bottom: viewportHeight,
    width: viewportWidth,
    height: viewportHeight,
  };
}

function resolveMarginValue(raw: string | undefined, size: number) {
  if (!raw) return 0;
  if (raw.endsWith("%")) return (size * parseFloat(raw)) / 100;
  return parseFloat(raw) || 0;
}

function expandRootMargin(rootMargin: string, rootRect: { width: number; height: number }) {
  const tokens = rootMargin.trim().split(/\s+/).filter(Boolean);
  const [top, right = top, bottom = top, left = right] = [
    tokens[0] ?? "0px",
    tokens[1],
    tokens[2],
    tokens[3],
  ];

  return {
    top: resolveMarginValue(top, rootRect.height),
    right: resolveMarginValue(right, rootRect.width),
    bottom: resolveMarginValue(bottom, rootRect.height),
    left: resolveMarginValue(left, rootRect.width),
  };
}

function approximateIntersectionRatio(el: HTMLElement, rootMargin: string) {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return 0;

  const rawRootRect = getViewportRect();
  const margin = expandRootMargin(rootMargin, rawRootRect);
  const rootRect = {
    top: rawRootRect.top - margin.top,
    left: rawRootRect.left - margin.left,
    right: rawRootRect.right + margin.right,
    bottom: rawRootRect.bottom + margin.bottom,
  };
  const visibleWidth = Math.max(
    0,
    Math.min(rect.right, rootRect.right) - Math.max(rect.left, rootRect.left)
  );
  const visibleHeight = Math.max(
    0,
    Math.min(rect.bottom, rootRect.bottom) - Math.max(rect.top, rootRect.top)
  );

  return (visibleWidth * visibleHeight) / (rect.width * rect.height);
}

function isVisibleEnough(ratio: number, threshold: number) {
  return threshold <= 0 ? ratio > 0 : ratio >= threshold;
}

function buildRevealStyle(
  options: RevealOptions,
  prefersReducedMotion: boolean,
  restingTransform?: string
) {
  const variant = options.variant ?? "transform";
  const opacityDuration = resolveRevealDurationMs(options.durationMs, "opacity");
  const transformDuration = resolveRevealDurationMs(options.durationMs, "transform");
  const opacityEasing = resolveRevealEasing(options.easing, "opacity");
  const transformEasing = resolveRevealEasing(options.easing, "transform");
  const delayMs = prefersReducedMotion || options.disabled ? 0 : resolveDelayMs(options);
  const transform =
    variant === "transform"
      ? resolveRevealTransform(options.transform ?? DEFAULT_TRANSFORM)
      : "none";

  return {
    ["--rmg-reveal-opacity-duration" as any]: `${opacityDuration}ms`,
    ["--rmg-reveal-transform-duration" as any]: `${transformDuration}ms`,
    ["--rmg-reveal-delay" as any]: `${delayMs}ms`,
    ["--rmg-reveal-opacity-easing" as any]: opacityEasing,
    ["--rmg-reveal-transform-easing" as any]: transformEasing,
    ["--rmg-reveal-from-transform" as any]: transform,
    ["--rmg-reveal-to-transform" as any]: restingTransform || "none",
  } as React.CSSProperties;
}

function scheduleAfterPaint(callback: () => void) {
  if (
    typeof window !== "undefined" &&
    typeof window.requestAnimationFrame === "function"
  ) {
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(callback);
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }

  const timer = window.setTimeout(callback, 0);
  return () => window.clearTimeout(timer);
}

export function useReveal<T extends HTMLElement = HTMLElement>(
  options: RevealOptions = {}
): UseRevealResult<T> {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [node, setNode] = React.useState<T | null>(null);
  const [state, setState] = React.useState<RevealState>({
    owned: false,
    revealed: false,
    inView: false,
    initializing: false,
  });
  const revealedRef = React.useRef(false);
  const onRevealRef = React.useRef(options.onReveal);

  React.useEffect(() => {
    onRevealRef.current = options.onReveal;
  }, [options.onReveal]);

  const ref = React.useCallback((nextNode: T | null) => {
    setNode(nextNode);
  }, []);

  const variant = options.variant ?? "transform";
  const once = options.once ?? true;
  const threshold = clampThreshold(options.threshold);
  const rootMargin = options.rootMargin ?? DEFAULT_ROOT_MARGIN;
  const disabled = options.disabled === true;

  useIsomorphicLayoutEffect(() => {
    if (!node) return;

    let cancelled = false;
    let pendingInitialReveal = false;
    let latestVisible = false;
    let cancelScheduledReveal: (() => void) | undefined;
    let observer: IntersectionObserver | undefined;

    const commitVisibility = (visible: boolean) => {
      if (cancelled) return;

      const nextRevealed = disabled || prefersReducedMotion || once
        ? revealedRef.current || visible || disabled || prefersReducedMotion
        : visible;
      const shouldReport = !disabled && nextRevealed && !revealedRef.current;
      revealedRef.current = nextRevealed;

      setState({
        owned: true,
        inView: visible || disabled || prefersReducedMotion,
        revealed: nextRevealed,
        initializing: false,
      });

      if (shouldReport) onRevealRef.current?.();
    };

    const takeOwnershipHidden = (visible: boolean) => {
      if (cancelled) return;

      setState({
        owned: true,
        inView: visible,
        revealed: revealedRef.current,
        initializing: !revealedRef.current,
      });
    };

    if (disabled || prefersReducedMotion) {
      commitVisibility(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      commitVisibility(true);
      return;
    }

    const initialRatio = approximateIntersectionRatio(node, rootMargin);
    const initiallyVisible = isVisibleEnough(initialRatio, threshold);
    latestVisible = initiallyVisible;

    if (initiallyVisible && !revealedRef.current) {
      pendingInitialReveal = true;
      takeOwnershipHidden(true);
      cancelScheduledReveal = scheduleAfterPaint(() => {
        pendingInitialReveal = false;
        commitVisibility(latestVisible);
        if (once && latestVisible) observer?.disconnect();
      });
    } else if (!revealedRef.current) {
      takeOwnershipHidden(initiallyVisible);
    } else {
      commitVisibility(initiallyVisible);
    }

    if (once && initiallyVisible) {
      return () => {
        cancelled = true;
        cancelScheduledReveal?.();
      };
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        const visible =
          entry.isIntersecting && isVisibleEnough(entry.intersectionRatio, threshold);
        latestVisible = visible;

        if (pendingInitialReveal) {
          if (!visible) {
            pendingInitialReveal = false;
            cancelScheduledReveal?.();
            commitVisibility(false);
          }
          return;
        }

        commitVisibility(visible);
        if (once && visible) observer?.disconnect();
      },
      { rootMargin, threshold }
    );

    observer.observe(node);

    return () => {
      cancelled = true;
      cancelScheduledReveal?.();
      observer?.disconnect();
    };
  }, [disabled, node, once, prefersReducedMotion, rootMargin, threshold]);

  return {
    ref,
    revealed: state.revealed,
    inView: state.inView,
    revealProps: {
      className: styles.reveal,
      style: buildRevealStyle(options, prefersReducedMotion),
      "data-rmg-reveal": "true",
      "data-rmg-reveal-owned": state.owned ? "true" : "false",
      "data-rmg-reveal-state": state.revealed ? "revealed" : "hidden",
      "data-rmg-reveal-variant": variant,
      ...(state.initializing ? { "data-rmg-reveal-initializing": "true" as const } : null),
      ...(prefersReducedMotion ? { "data-rmg-reveal-reduced": "true" as const } : null),
      ...(disabled ? { "data-rmg-reveal-disabled": "true" as const } : null),
    },
  };
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(value);
      } else {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}

const RevealInner = React.forwardRef(function RevealInner<
  E extends React.ElementType = "div"
>(props: RevealProps<E>, forwardedRef: React.ForwardedRef<HTMLElement>) {
  const {
    as,
    children,
    className,
    style,
    variant,
    transform,
    once,
    threshold,
    rootMargin,
    durationMs,
    delayMs,
    staggerIndex,
    staggerMs,
    easing,
    disabled,
    onReveal,
    ...rest
  } = props;
  const reveal = useReveal({
    variant,
    transform,
    once,
    threshold,
    rootMargin,
    durationMs,
    delayMs,
    staggerIndex,
    staggerMs,
    easing,
    disabled,
    onReveal,
  });
  const Component = as ?? "div";
  const { transform: restingTransform, ...restingStyle } = style ?? {};
  const revealStyle = buildRevealStyle(
    {
      variant,
      transform,
      durationMs,
      delayMs,
      staggerIndex,
      staggerMs,
      easing,
      disabled,
    },
    reveal.revealProps["data-rmg-reveal-reduced"] === "true",
    typeof restingTransform === "string" ? restingTransform : undefined
  );

  return (
    <Component
      {...rest}
      {...reveal.revealProps}
      ref={mergeRefs(reveal.ref, forwardedRef)}
      className={cx(reveal.revealProps.className, className)}
      style={{
        ...restingStyle,
        ...revealStyle,
      }}
    >
      {children}
    </Component>
  );
});

export const Reveal = RevealInner as <E extends React.ElementType = "div">(
  props: RevealProps<E> & {
    ref?: React.Ref<HTMLElement>;
  }
) => React.ReactElement | null;

export default Reveal;
