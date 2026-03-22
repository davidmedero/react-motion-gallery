'use client';

import * as React from 'react';
import { ProgressRenderArgs } from '../../shared/types/controls';
import type { BaseLimit } from '../../shared/motion/baseLimit';

export type BuildProgressNodeArgs = {
  AX: { main: 'x' | 'y'; clientKey: string };
  wrap: boolean;
  offsetLocationRef: React.RefObject<{ get: () => number } | null>;
  scrollLimitRef: React.RefObject<BaseLimit | null>;
  lastProgressRef: React.MutableRefObject<number>;
  progressHolderRef: React.RefObject<HTMLDivElement | null>;
  progressInnerRef: React.RefObject<HTMLDivElement | null>;
  showProgress?: boolean;
  renderProgress?: (args: ProgressRenderArgs) => React.ReactNode;
  progressClassName?: string;
  progressStyle?: React.CSSProperties;
  progressInnerClassName?: string;
  progressInnerStyle?: React.CSSProperties;
};

export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function setProgressDom(args: {
  AX: { main: 'x' | 'y' };
  lastProgressRef: React.MutableRefObject<number>;
  progressHolderRef: React.RefObject<HTMLDivElement | null>;
  progressInnerRef: React.RefObject<HTMLDivElement | null>;
  p: number;
}) {
  const { AX, lastProgressRef, progressHolderRef, progressInnerRef, p } = args;

  const v = clamp01(p);
  lastProgressRef.current = v;

  const holder = progressHolderRef.current;
  const inner = progressInnerRef.current;

  if (holder) {
    holder.style.setProperty('--rmg-progress', String(v));
    holder.setAttribute('data-rmg-progress', String(v));
    holder.setAttribute('aria-valuenow', String(Math.round(v * 100)));
  }

  if (inner && AX.main === 'x') {
    inner.style.width = `${v * 100}%`;
  } else if (inner && AX.main === 'y') {
    inner.style.height = `${v * 100}%`;
  }
}

export function updateProgressInFrame(args: {
  AX: { main: 'x' | 'y'; clientKey: string };
  wrap: boolean;
  offsetLocationRef: React.RefObject<{ get: () => number } | null>;
  scrollLimitRef: React.RefObject<BaseLimit | null>;
  lastProgressRef: React.MutableRefObject<number>;
  progressHolderRef: React.RefObject<HTMLDivElement | null>;
  progressInnerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const {
    AX,
    wrap,
    offsetLocationRef,
    scrollLimitRef,
    lastProgressRef,
    progressHolderRef,
    progressInnerRef,
  } = args;

  const p = readScrollProgressValue({ wrap, offsetLocationRef, scrollLimitRef });
  setProgressDom({ AX, lastProgressRef, progressHolderRef, progressInnerRef, p });
}

export function readScrollProgressValue(args: {
  wrap: boolean;
  offsetLocationRef: React.RefObject<{ get: () => number } | null>;
  scrollLimitRef: React.RefObject<BaseLimit | null>;
}) {
  const { wrap, offsetLocationRef, scrollLimitRef } = args;

  const limit = scrollLimitRef.current;
  if (!limit) return 0;

  const span = limit.max - limit.min;
  if (span <= 0) return 1;

  const current = offsetLocationRef.current?.get() ?? limit.max;
  const bounded = wrap ? limit.removeOffset(current) : limit.constrain(current);

  return clamp01((limit.max - bounded) / span);
}

export function DefaultProgress({
  ref,
  innerRef,
  hidden,
  progress,
  axis,
  className,
  style,
  innerClassName,
  innerStyle,
}: ProgressRenderArgs) {
  if (hidden) return null;

  const isY = axis === 'y';

  return (
    <div
      ref={ref as any}
      className={className}
      style={{
        position: 'absolute',
        left: isY ? 6 : '50%',
        top: isY ? '50%' : undefined,
        bottom: isY ? undefined : 6,
        transform: isY ? 'translateY(-50%)' : 'translateX(-50%)',
        width: isY ? 4 : '60%',
        height: isY ? '60%' : 4,
        background: 'rgba(0,0,0,0.3)',
        borderRadius: 9999,
        overflow: 'hidden',
        zIndex: 10,
        pointerEvents: 'none',
        ['--rmg-progress' as any]: progress,
        ...(style || {}),
      }}
      aria-hidden
      data-rmg-progress={String(progress)}
    >
      <div
        ref={innerRef as any}
        className={innerClassName}
        style={{
          width: isY ? '100%' : 'calc(var(--rmg-progress, 0) * 100%)',
          height: isY ? 'calc(var(--rmg-progress, 0) * 100%)' : '100%',
          background: 'rgb(80,163,255)',
          transition: 'none',
          ...(innerStyle || {}),
        }}
      />
    </div>
  );
}

export function buildProgressNode(args: BuildProgressNodeArgs) {
  const {
    AX,
    wrap,
    offsetLocationRef,
    scrollLimitRef,
    lastProgressRef,
    progressHolderRef,
    progressInnerRef,
    showProgress,
    renderProgress,
    progressClassName,
    progressStyle,
    progressInnerClassName,
    progressInnerStyle,
  } = args;

  const progressHiddenAuto = false;
  const progressHidden = !(showProgress ?? false) || progressHiddenAuto;

  const node = (renderProgress ?? DefaultProgress)({
    ref: progressHolderRef,
    innerRef: progressInnerRef,
    hidden: progressHidden,
    progress: lastProgressRef.current,
    axis: AX.main,
    className: progressClassName,
    style: progressStyle,
    innerClassName: progressInnerClassName,
    innerStyle: progressInnerStyle,
  } as any);

  const api = {
    progressHidden,
    progressNode: node,
    setProgressDom: (p: number) =>
      setProgressDom({ AX, lastProgressRef, progressHolderRef, progressInnerRef, p }),
    updateProgressInFrame: () =>
      updateProgressInFrame({
        AX,
        wrap,
        offsetLocationRef,
        scrollLimitRef,
        lastProgressRef,
        progressHolderRef,
        progressInnerRef,
      }),
  };

  return api;
}
