"use client";

import * as React from "react";

const DEFAULT_RIPPLE_COLOR = "currentColor";
const DEFAULT_RIPPLE_DURATION_MS = 550;
const DEFAULT_RIPPLE_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const DEFAULT_RIPPLE_OPACITY = 0.6;
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export type PaginationRippleOptions = {
  enabled?: boolean;
  color?: string;
  duration?: number | string;
  easing?: string;
  opacity?: number;
  className?: string;
};

export type PaginationRippleProp = boolean | PaginationRippleOptions;

export type ResolvedPaginationRippleOptions = {
  enabled: boolean;
  color: string;
  durationCss: string;
  durationMs: number;
  easing: string;
  opacity: number;
  className?: string;
};

type PaginationRippleState = {
  id: number;
  hostKey: string;
  clientX?: number;
  clientY?: number;
  x: number;
  y: number;
  size: number;
};

function normalizeDuration(duration: number | string | undefined) {
  if (typeof duration === "number" && Number.isFinite(duration)) {
    const ms = Math.max(0, duration);
    return { durationCss: `${ms}ms`, durationMs: ms };
  }

  if (typeof duration === "string") {
    const trimmed = duration.trim();
    const match = trimmed.match(/^(-?\d*\.?\d+)(ms|s)?$/i);

    if (trimmed && match) {
      const value = Math.max(0, Number(match[1]));
      const unit = match[2]?.toLowerCase() ?? "ms";
      const ms = unit === "s" ? value * 1000 : value;
      return { durationCss: trimmed, durationMs: ms };
    }

    if (trimmed) {
      return {
        durationCss: trimmed,
        durationMs: DEFAULT_RIPPLE_DURATION_MS,
      };
    }
  }

  return {
    durationCss: `${DEFAULT_RIPPLE_DURATION_MS}ms`,
    durationMs: DEFAULT_RIPPLE_DURATION_MS,
  };
}

function resolvePaginationRipple(
  ripple: PaginationRippleProp | undefined
): ResolvedPaginationRippleOptions {
  if (ripple === false) {
    return {
      enabled: false,
      color: DEFAULT_RIPPLE_COLOR,
      durationCss: `${DEFAULT_RIPPLE_DURATION_MS}ms`,
      durationMs: DEFAULT_RIPPLE_DURATION_MS,
      easing: DEFAULT_RIPPLE_EASING,
      opacity: DEFAULT_RIPPLE_OPACITY,
    };
  }

  const options = typeof ripple === "object" && ripple ? ripple : {};
  const duration = normalizeDuration(options.duration);

  return {
    enabled: options.enabled ?? true,
    color: options.color ?? DEFAULT_RIPPLE_COLOR,
    durationCss: duration.durationCss,
    durationMs: duration.durationMs,
    easing: options.easing ?? DEFAULT_RIPPLE_EASING,
    opacity:
      typeof options.opacity === "number" && Number.isFinite(options.opacity)
        ? Math.max(0, Math.min(options.opacity, 1))
        : DEFAULT_RIPPLE_OPACITY,
    className: options.className,
  };
}

export function PaginationRippleStyles({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <style>
      {`[data-rmg-page-ripple-host="true"]{position:relative;overflow:hidden;}@keyframes rmg-pagination-ripple{to{transform:scale(1);opacity:0;}}`}
    </style>
  );
}

export function renderPaginationRipples(
  ripples: PaginationRippleState[] | undefined,
  options: ResolvedPaginationRippleOptions,
  hostKey: string
) {
  if (!ripples?.length || !options.enabled) return null;

  const hostRipples = ripples.filter((ripple) => ripple.hostKey === hostKey);
  if (!hostRipples.length) return null;

  return (
    <span
      aria-hidden="true"
      data-rmg-page-ripple-layer="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: "inherit",
        pointerEvents: "none",
      }}
    >
      {hostRipples.map((ripple) => (
        <span
          key={ripple.id}
          aria-hidden="true"
          className={options.className}
          data-rmg-page-ripple="true"
          style={{
            position: "absolute",
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            borderRadius: "50%",
            pointerEvents: "none",
            backgroundColor: options.color,
            opacity: options.opacity,
            transform: "scale(0)",
            animation: `rmg-pagination-ripple ${options.durationCss} ${options.easing}`,
          }}
        />
      ))}
    </span>
  );
}

export function usePaginationRipples(ripple: PaginationRippleProp | undefined) {
  const options = React.useMemo(() => resolvePaginationRipple(ripple), [ripple]);
  const [ripples, setRipples] = React.useState<PaginationRippleState[]>([]);
  const hostRefs = React.useRef<Map<string, HTMLElement>>(new Map());
  const nextIdRef = React.useRef(0);
  const timeoutsRef = React.useRef<number[]>([]);

  const removeRipple = React.useCallback((id: number) => {
    setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
  }, []);

  const setRippleHostRef = React.useCallback(
    (hostKey: string, node: HTMLElement | null) => {
      if (node) {
        hostRefs.current.set(hostKey, node);
      } else {
        hostRefs.current.delete(hostKey);
      }
    },
    []
  );

  const createRipple = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, hostKey: string) => {
      if (!options.enabled) return;

      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const hasPointerPosition =
        event.detail > 0 &&
        Number.isFinite(event.clientX) &&
        Number.isFinite(event.clientY);
      const originX = hasPointerPosition ? event.clientX - rect.left : rect.width / 2;
      const originY = hasPointerPosition ? event.clientY - rect.top : rect.height / 2;
      const id = nextIdRef.current;
      nextIdRef.current += 1;

      setRipples((prev) => [
        ...prev,
        {
          id,
          hostKey,
          clientX: hasPointerPosition ? event.clientX : undefined,
          clientY: hasPointerPosition ? event.clientY : undefined,
          size,
          x: originX - size / 2,
          y: originY - size / 2,
        },
      ]);

      const timeout = window.setTimeout(() => {
        removeRipple(id);
      }, options.durationMs + 80);
      timeoutsRef.current.push(timeout);
    },
    [options.durationMs, options.enabled, removeRipple]
  );

  useIsomorphicLayoutEffect(() => {
    if (!ripples.length) return;

    setRipples((prev) => {
      let changed = false;

      const next = prev.map((ripple) => {
        if (
          typeof ripple.clientX !== "number" ||
          typeof ripple.clientY !== "number" ||
          !Number.isFinite(ripple.clientX) ||
          !Number.isFinite(ripple.clientY)
        ) {
          return ripple;
        }

        let nextHostKey = ripple.hostKey;
        let nextHost = hostRefs.current.get(ripple.hostKey) ?? null;

        for (const [hostKey, host] of hostRefs.current) {
          const rect = host.getBoundingClientRect();

          if (
            ripple.clientX >= rect.left &&
            ripple.clientX <= rect.right &&
            ripple.clientY >= rect.top &&
            ripple.clientY <= rect.bottom
          ) {
            nextHostKey = hostKey;
            nextHost = host;
            break;
          }
        }

        if (!nextHost) return ripple;

        const rect = nextHost.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const nextRipple = {
          ...ripple,
          hostKey: nextHostKey,
          size,
          x: ripple.clientX - rect.left - size / 2,
          y: ripple.clientY - rect.top - size / 2,
        };

        if (
          nextRipple.hostKey !== ripple.hostKey ||
          nextRipple.size !== ripple.size ||
          nextRipple.x !== ripple.x ||
          nextRipple.y !== ripple.y
        ) {
          changed = true;
        }

        return nextRipple;
      });

      return changed ? next : prev;
    });
  });

  React.useEffect(() => {
    if (options.enabled) return;
    setRipples([]);
  }, [options.enabled]);

  React.useEffect(
    () => () => {
      timeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
      timeoutsRef.current = [];
    },
    []
  );

  return {
    createRipple,
    options,
    ripples,
    setRippleHostRef,
  };
}
