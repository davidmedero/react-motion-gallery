'use client';

import * as React from 'react';
import { ProgressRenderArgs } from '../../shared/types/controls';

export type BuildProgressNodeArgs = {
  AX: { main: 'x' | 'y'; clientKey: string };
  slider: React.RefObject<HTMLElement | null>;
  sliderWidth: React.RefObject<number>;
  wrap: boolean;
  offsetLocationRef: React.RefObject<{ get: () => number } | null>;
  lastProgressRef: React.RefObject<number>;
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
  slider: React.RefObject<HTMLElement | null>;
  sliderWidth: React.RefObject<number>;
  wrap: boolean;
  offsetLocationRef: React.RefObject<{ get: () => number } | null>;
  lastProgressRef: React.MutableRefObject<number>;
  progressHolderRef: React.RefObject<HTMLDivElement | null>;
  progressInnerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const {
    AX,
    slider,
    sliderWidth,
    wrap,
    offsetLocationRef,
    lastProgressRef,
    progressHolderRef,
    progressInnerRef,
  } = args;

  const track = slider.current;
  const content = sliderWidth.current || 0;

  if (!track) {
    setProgressDom({ AX, lastProgressRef, progressHolderRef, progressInnerRef, p: 0 });
    return;
  }

  const cw = (track as any)[AX.clientKey] as number;

  if (!wrap) {
    const max = Math.max(0, content - cw);
    if (max <= 0) {
      setProgressDom({ AX, lastProgressRef, progressHolderRef, progressInnerRef, p: 1 });
      return;
    }
    const loc = -(offsetLocationRef.current?.get() ?? 0);
    setProgressDom({ AX, lastProgressRef, progressHolderRef, progressInnerRef, p: Math.min(1, Math.max(0, loc / max)) });
  } else {
    const W = sliderWidth.current || 0;
    if (W <= 0) {
      setProgressDom({ AX, lastProgressRef, progressHolderRef, progressInnerRef, p: 0 });
      return;
    }
    const world = ((-(offsetLocationRef.current?.get() ?? 0) % W) + W) % W;
    setProgressDom({
      AX,
      lastProgressRef,
      progressHolderRef,
      progressInnerRef,
      p: Math.round(world) === Math.round(W) ? 0 : world / W,
    });
  }
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
    slider,
    sliderWidth,
    wrap,
    offsetLocationRef,
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
        slider,
        sliderWidth,
        wrap,
        offsetLocationRef,
        lastProgressRef,
        progressHolderRef,
        progressInnerRef,
      }),
  };

  return api;
}