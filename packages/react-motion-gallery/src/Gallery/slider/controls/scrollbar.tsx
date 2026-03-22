'use client';

import * as React from 'react';
import { ScrollbarRenderArgs } from '../../shared/types/controls';
import type { BaseLimit } from '../../shared/motion/baseLimit';
import { clamp01, readScrollProgressValue } from './progress';

const RANGE_MIN = 0;
const RANGE_MAX = 1;
const RANGE_STEP = 0.001;

export type BuildScrollbarNodeArgs = {
  AX: { main: 'x' | 'y' };
  wrap: boolean;
  offsetLocationRef: React.RefObject<{ get: () => number } | null>;
  scrollLimitRef: React.RefObject<BaseLimit | null>;
  lastProgressRef: React.MutableRefObject<number>;
  scrollbarRef: React.RefObject<HTMLInputElement | null>;
  showScrollbar?: boolean;
  renderScrollbar?: (args: ScrollbarRenderArgs) => React.ReactNode;
  scrollbarClassName?: string;
  scrollbarStyle?: React.CSSProperties;
  onScrollBarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  styles: Record<string, string>;
};

export function setScrollBarDom(args: {
  scrollbarRef: React.RefObject<HTMLInputElement | null>;
  p: number;
}) {
  const { scrollbarRef, p } = args;
  const input = scrollbarRef.current;
  if (!input) return;

  const value = clamp01(p);
  const valueStr = String(value);

  input.value = valueStr;
  input.style.setProperty('--rmg-scrollbar-progress', valueStr);
  input.setAttribute('data-rmg-scrollbar-progress', valueStr);
  input.setAttribute('aria-valuenow', String(Math.round(value * 100)));
}

export function updateScrollBarInFrame(args: {
  wrap: boolean;
  offsetLocationRef: React.RefObject<{ get: () => number } | null>;
  scrollLimitRef: React.RefObject<BaseLimit | null>;
  lastProgressRef: React.MutableRefObject<number>;
  scrollbarRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { wrap, offsetLocationRef, scrollLimitRef, lastProgressRef, scrollbarRef } = args;
  const p = readScrollProgressValue({ wrap, offsetLocationRef, scrollLimitRef });
  lastProgressRef.current = p;
  setScrollBarDom({ scrollbarRef, p });
}

export function DefaultScrollBar({
  ref,
  hidden,
  value,
  axis,
  min,
  max,
  step,
  onChange,
  className,
  style,
}: ScrollbarRenderArgs) {
  if (hidden) return null;

  const isY = axis === 'y';

  return (
    <input
      ref={ref}
      className={className}
      style={{
        position: 'absolute',
        left: isY ? 10 : '50%',
        top: isY ? '50%' : undefined,
        bottom: isY ? undefined : 10,
        transform: isY ? 'translateY(-50%) rotate(-90deg)' : 'translateX(-50%)',
        width: isY ? '60%' : 'min(60%, 28rem)',
        zIndex: 10,
        ...style,
      }}
      onChange={onChange}
      onInput={(event) => onChange(event as unknown as React.ChangeEvent<HTMLInputElement>)}
      type="range"
      min={String(min)}
      max={String(max)}
      step={String(step)}
      defaultValue={String(value)}
      aria-label="Slider scroll position"
      data-rmg-scrollbar="true"
    />
  );
}

export function buildScrollbarNode(args: BuildScrollbarNodeArgs) {
  const {
    AX,
    wrap,
    offsetLocationRef,
    scrollLimitRef,
    lastProgressRef,
    scrollbarRef,
    showScrollbar,
    renderScrollbar,
    scrollbarClassName,
    scrollbarStyle,
    onScrollBarChange,
    styles,
  } = args;

  const limit = scrollLimitRef.current;
  const hiddenAuto = !limit || Math.abs(limit.max - limit.min) <= 0.001;
  const hidden = !(showScrollbar ?? false) || hiddenAuto;

  const node = (renderScrollbar ?? DefaultScrollBar)({
    ref: scrollbarRef,
    hidden,
    value: lastProgressRef.current,
    axis: AX.main,
    min: RANGE_MIN,
    max: RANGE_MAX,
    step: RANGE_STEP,
    onChange: onScrollBarChange,
    className: [styles.scrollbar, isYClassName(AX.main, styles), scrollbarClassName ?? '']
      .filter(Boolean)
      .join(' '),
    style: scrollbarStyle,
  } as ScrollbarRenderArgs);

  return {
    scrollbarHidden: hidden,
    scrollbarNode: node,
    setScrollBarDom: (p: number) => setScrollBarDom({ scrollbarRef, p }),
    updateScrollBarInFrame: () =>
      updateScrollBarInFrame({
        wrap,
        offsetLocationRef,
        scrollLimitRef,
        lastProgressRef,
        scrollbarRef,
      }),
  };
}

function isYClassName(axis: 'x' | 'y', styles: Record<string, string>) {
  return axis === 'y' ? styles.scrollbarY : '';
}
