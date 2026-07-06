"use client";

import * as React from "react";
import type {
  CrossFade,
  SliderCrossfadeCoreApi,
  SliderCrossfadeRuntime,
  SliderPluginRuntimeProps,
} from "../types";
import {
  clamp01,
  resolveSliderCrossfadeDragTarget,
  resolveSliderWheelCrossfadeOptions,
  resolveSliderWheelCrossfadeProgress,
  resolveSliderWheelCrossfadeTarget,
  shouldCompleteSliderDragCrossfade,
  shouldCompleteSliderWheelCrossfade,
  shouldStartSliderControlsCrossfade,
  shouldTreatSliderWheelAsSameSession,
} from "../crossfade";
import { createSliderPlugin } from "./create";

function cloneViewportSnapshot(viewport: HTMLDivElement | null) {
  if (!viewport) return null;

  const clone = viewport.cloneNode(true) as HTMLDivElement;
  clone.removeAttribute("data-rmg-part");
  clone.setAttribute("aria-hidden", "true");
  clone.style.position = "absolute";
  clone.style.inset = "0";
  clone.style.width = "100%";
  clone.style.height = "100%";
  clone.style.margin = "0";
  clone.style.pointerEvents = "none";
  clone
    .querySelectorAll('[data-rmg-slider-crossfade-layer="true"]')
    .forEach((node) => node.remove());
  clone.querySelectorAll<HTMLElement>("[id]").forEach((node) => {
    node.removeAttribute("id");
  });
  return clone;
}

function CrossfadeRuntime({
  host,
  options,
}: SliderPluginRuntimeProps & { options: CrossFade }) {
  const layerRef = React.useRef<HTMLDivElement | null>(null);
  const sourceRef = React.useRef<HTMLDivElement | null>(null);
  const targetRef = React.useRef<HTMLDivElement | null>(null);
  const hostRef = React.useRef(host);
  const optionsRef = React.useRef(options);
  const coreRef = React.useRef<SliderCrossfadeCoreApi | null>(null);
  const busyRef = React.useRef(false);
  const seqRef = React.useRef(0);
  const raf1Ref = React.useRef<number | null>(null);
  const raf2Ref = React.useRef<number | null>(null);
  const timeoutRef = React.useRef<number | null>(null);
  const committedTrackIndexRef = React.useRef<number | null>(null);
  const committedTrackLocationRef = React.useRef<number | null>(null);
  const wheelStateRef = React.useRef<{
    sourceIndex: number;
    targetIndex: number;
    delta: number;
    progress: number;
    direction: 1 | -1;
  } | null>(null);
  const wheelSessionRef = React.useRef<{
    direction: 1 | -1;
    lastEventTs: number;
  } | null>(null);
  const dragStateRef = React.useRef<{
    sourceIndex: number;
    targetIndex: number;
    progress: number;
    delta: number;
  } | null>(null);

  hostRef.current = host;
  optionsRef.current = options;
  coreRef.current = host.handle?._getCrossfadeCore?.() ?? null;

  const getDuration = React.useCallback(() => {
    const durationMs = optionsRef.current.durationMs;
    return typeof durationMs === "number" && Number.isFinite(durationMs)
      ? Math.max(0, durationMs)
      : 360;
  }, []);

  const getEasing = React.useCallback(() => {
    const easing = optionsRef.current.easing;
    return typeof easing === "string" && easing.trim()
      ? easing
      : "cubic-bezier(.4,0,.22,1)";
  }, []);

  const getWheelOptions = React.useCallback(() => {
    const opts = optionsRef.current;
    const controls = opts.controls !== false;
    return resolveSliderWheelCrossfadeOptions({
      controls,
      wheel: opts.wheel,
      sharedDurationMs: getDuration(),
    });
  }, [getDuration]);

  const clearPending = React.useCallback(() => {
    if (raf1Ref.current != null) {
      cancelAnimationFrame(raf1Ref.current);
      raf1Ref.current = null;
    }
    if (raf2Ref.current != null) {
      cancelAnimationFrame(raf2Ref.current);
      raf2Ref.current = null;
    }
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearSnapshots = React.useCallback(() => {
    sourceRef.current?.replaceChildren();
    targetRef.current?.replaceChildren();

    if (layerRef.current) {
      layerRef.current.style.opacity = "0";
      layerRef.current.style.visibility = "hidden";
    }
  }, []);

  const finish = React.useCallback(() => {
    clearPending();

    const committedLocation = committedTrackLocationRef.current;
    const committedIndex = committedTrackIndexRef.current;
    committedTrackLocationRef.current = null;
    committedTrackIndexRef.current = null;

    if (committedLocation != null) {
      coreRef.current?.renderTrackAtLocation(committedLocation, { syncVirtual: true });
    } else if (committedIndex != null) {
      coreRef.current?.jumpTrackToIndexInstant(committedIndex);
    }

    busyRef.current = false;
    dragStateRef.current = null;
    wheelStateRef.current = null;
    clearSnapshots();
  }, [clearPending, clearSnapshots]);

  const setProgress = React.useCallback((progress: number, transition = "none") => {
    const clamped = clamp01(progress);

    if (layerRef.current) {
      layerRef.current.style.opacity = "1";
      layerRef.current.style.visibility = "visible";
    }

    if (sourceRef.current) {
      sourceRef.current.style.transition = transition;
      sourceRef.current.style.opacity = String(1 - clamped);
    }

    if (targetRef.current) {
      targetRef.current.style.transition = transition;
      targetRef.current.style.opacity = String(clamped);
    }
  }, []);

  const captureViewportSnapshotForIndex = React.useCallback((index: number) => {
    const api = coreRef.current;
    if (!api) return null;

    const state = api.readMotionState();
    api.renderTrackAtLocation(api.getSnapLocationForIndex(index), {
      syncVirtual: true,
    });
    const snapshot = cloneViewportSnapshot(api.getViewportNode());
    api.restoreMotionState(state, { syncVirtual: true });
    return snapshot;
  }, []);

  const prepareSourceSnapshot = React.useCallback(() => {
    if (!sourceRef.current || !targetRef.current) return false;

    const sourceSnapshot = cloneViewportSnapshot(coreRef.current?.getViewportNode() ?? null);
    if (!sourceSnapshot) return false;

    sourceRef.current.replaceChildren(sourceSnapshot);
    targetRef.current.replaceChildren();
    setProgress(0, "none");
    return true;
  }, [setProgress]);

  const prepareSnapshots = React.useCallback(
    (targetIndex: number) => {
      const api = coreRef.current;
      if (!api || !sourceRef.current || !targetRef.current) return false;

      const sourceSnapshot = cloneViewportSnapshot(api.getViewportNode());
      const targetSnapshot = captureViewportSnapshotForIndex(targetIndex);
      if (!sourceSnapshot || !targetSnapshot) return false;

      sourceRef.current.replaceChildren(sourceSnapshot);
      targetRef.current.replaceChildren(targetSnapshot);
      setProgress(0, "none");
      return true;
    },
    [captureViewportSnapshotForIndex, setProgress]
  );

  const normalizeIndex = React.useCallback((requested: number, length: number) => {
    if (hostRef.current.loop) return ((requested % length) + length) % length;
    return Math.max(0, Math.min(length - 1, requested));
  }, []);

  const clearWheelSession = React.useCallback(() => {
    wheelSessionRef.current = null;
  }, []);

  const shouldAbsorbWheelSession = React.useCallback(
    (direction: 1 | -1, now: number) => {
      const session = wheelSessionRef.current;
      if (!session) return false;

      const sameSession = shouldTreatSliderWheelAsSameSession({
        now,
        direction,
        sessionDirection: session.direction,
        lastEventTs: session.lastEventTs,
        sessionGapMs: getWheelOptions().sessionGapMs,
      });

      if (!sameSession) {
        clearWheelSession();
        return false;
      }

      session.lastEventTs = now;
      return true;
    },
    [clearWheelSession, getWheelOptions]
  );

  const armWheelSession = React.useCallback((direction: 1 | -1, now: number) => {
    wheelSessionRef.current = { direction, lastEventTs: now };
  }, []);

  const canUseDrag = React.useCallback(() => {
    const api = coreRef.current;
    return (
      optionsRef.current.drag === true &&
      hostRef.current.freeScroll !== true &&
      !!api &&
      api.getSlideCount() > 1
    );
  }, []);

  const canUseWheel = React.useCallback(() => {
    const api = coreRef.current;
    return (
      getWheelOptions().enabled === true &&
      hostRef.current.freeScroll !== true &&
      !!api &&
      api.getSlideCount() > 1
    );
  }, [getWheelOptions]);

  const completeWheel = React.useCallback(
    (
      state: NonNullable<typeof wheelStateRef.current>,
      now: number
    ) => {
      const id = ++seqRef.current;
      const wheel = getWheelOptions();

      wheelStateRef.current = null;
      armWheelSession(state.direction, now);
      busyRef.current = true;
      coreRef.current?.commitIndexOnly(
        state.targetIndex,
        "animated",
        state.sourceIndex
      );
      committedTrackIndexRef.current = state.targetIndex;

      setProgress(1, `opacity ${wheel.durationMs}ms ${getEasing()}`);

      timeoutRef.current = window.setTimeout(() => {
        if (seqRef.current !== id) return;
        finish();
      }, wheel.durationMs + 48);
    },
    [armWheelSession, finish, getEasing, getWheelOptions, setProgress]
  );

  const runtime = React.useMemo<SliderCrossfadeRuntime>(
    () => ({
      isBusy: () => busyRef.current,
      finish,
      canUseDrag,
      beginDrag: () => {
        finish();
        const api = coreRef.current;
        if (!api) return;
        api.jumpTrackToIndexInstant(api.getIndex());
      },
      updateDrag: (delta: number) => {
        const api = coreRef.current;
        if (!api) return false;

        const len = api.getSlideCount();
        if (!len) return false;

        const sourceIndex = normalizeIndex(api.getIndex(), len);
        const targetIndex = resolveSliderCrossfadeDragTarget({
          currentIndex: sourceIndex,
          delta,
          slideCount: len,
          wrap: hostRef.current.loop,
        });

        if (targetIndex === sourceIndex) {
          dragStateRef.current = null;
          finish();
          return false;
        }

        const current = dragStateRef.current;
        const needsSnapshots =
          !current ||
          current.sourceIndex !== sourceIndex ||
          current.targetIndex !== targetIndex;

        if (needsSnapshots) {
          finish();
          if (!prepareSnapshots(targetIndex)) return false;
        }

        const progress = clamp01(Math.abs(delta) / Math.max(1, api.getViewportMainSize()));
        busyRef.current = true;
        dragStateRef.current = {
          sourceIndex,
          targetIndex,
          progress,
          delta,
        };
        setProgress(progress, "none");
        return true;
      },
      settleDrag: (force: number) => {
        const state = dragStateRef.current;
        if (!state) {
          finish();
          return false;
        }

        const shouldAdvance = shouldCompleteSliderDragCrossfade({
          progress: state.progress,
          force,
          delta: state.delta,
        });
        const duration = getDuration();
        const id = ++seqRef.current;
        busyRef.current = true;

        if (!shouldAdvance) {
          committedTrackIndexRef.current = null;
          setProgress(0, `opacity ${duration}ms ${getEasing()}`);
          timeoutRef.current = window.setTimeout(() => {
            if (seqRef.current !== id) return;
            finish();
          }, duration + 48);
          return false;
        }

        coreRef.current?.commitIndexOnly(
          state.targetIndex,
          "animated",
          state.sourceIndex
        );
        committedTrackIndexRef.current = state.targetIndex;
        setProgress(1, `opacity ${duration}ms ${getEasing()}`);
        timeoutRef.current = window.setTimeout(() => {
          if (seqRef.current !== id) return;
          finish();
        }, duration + 48);
        return true;
      },
      canUseWheel,
      updateWheel: (signedWheelDelta: number, now: number) => {
        const api = coreRef.current;
        if (!api || !Number.isFinite(signedWheelDelta)) return false;

        const wheelDirection = (signedWheelDelta > 0 ? 1 : -1) as 1 | -1;
        if (shouldAbsorbWheelSession(wheelDirection, now)) return true;

        const len = api.getSlideCount();
        if (!len) return false;

        const sourceIndex = normalizeIndex(api.getIndex(), len);
        const wheel = getWheelOptions();
        const virtualDelta = signedWheelDelta * wheel.sensitivity;
        const existing = wheelStateRef.current;
        const accumulatedDelta =
          existing && existing.sourceIndex === sourceIndex
            ? existing.delta + virtualDelta
            : virtualDelta;
        const targetDirection = (accumulatedDelta > 0 ? 1 : -1) as 1 | -1;
        const targetIndex = resolveSliderWheelCrossfadeTarget({
          currentIndex: sourceIndex,
          delta: accumulatedDelta,
          slideCount: len,
          wrap: hostRef.current.loop,
        });

        if (targetIndex === sourceIndex) {
          if (Math.abs(accumulatedDelta) < 0.5) {
            finish();
            return true;
          }

          return false;
        }

        const needsSnapshots =
          !existing ||
          existing.sourceIndex !== sourceIndex ||
          existing.targetIndex !== targetIndex;

        if (needsSnapshots) {
          finish();
          if (!prepareSnapshots(targetIndex)) return false;
        } else if (busyRef.current && !wheelStateRef.current) {
          finish();
        }

        const progress = resolveSliderWheelCrossfadeProgress({
          delta: accumulatedDelta,
          distance: Math.max(1, api.getViewportMainSize()),
        });
        const nextState = {
          sourceIndex,
          targetIndex,
          delta: accumulatedDelta,
          progress,
          direction: targetDirection,
        };

        busyRef.current = true;
        wheelStateRef.current = nextState;
        setProgress(progress, "none");

        if (
          shouldCompleteSliderWheelCrossfade({
            progress,
            threshold: wheel.commitThreshold,
          })
        ) {
          completeWheel(nextState, now);
        }

        return true;
      },
      clearWheelSession,
      startUi: (
        requested: number,
        uiOptions?: { durationMs?: number; easing?: string }
      ) => {
        const api = coreRef.current;
        if (!api || optionsRef.current.controls === false) return false;

        const len = api.getSlideCount();
        if (!len) return false;

        const nextIndex = normalizeIndex(requested, len);
        const fromIndex = normalizeIndex(api.getIndex(), len);

        if (busyRef.current) finish();

        if (
          !shouldStartSliderControlsCrossfade({
            enabled: true,
            busy: busyRef.current,
            fromIndex,
            toIndex: nextIndex,
          })
        ) {
          return false;
        }

        const duration = uiOptions?.durationMs ?? getDuration();
        const easing = uiOptions?.easing ?? getEasing();

        finish();
        if (!prepareSnapshots(nextIndex)) return false;

        const id = ++seqRef.current;
        busyRef.current = true;
        api.jumpToIndexInstant(nextIndex, "animated");

        raf1Ref.current = requestAnimationFrame(() => {
          raf1Ref.current = null;
          if (seqRef.current !== id) return;

          raf2Ref.current = requestAnimationFrame(() => {
            raf2Ref.current = null;
            if (seqRef.current !== id) return;

            setProgress(1, `opacity ${duration}ms ${easing}`);

            timeoutRef.current = window.setTimeout(() => {
              if (seqRef.current !== id) return;
              finish();
            }, duration + 48);
          });
        });

        return true;
      },
      startProgressUi: (
        target: {
          index: number;
          location: number;
          sourceIndex?: number;
        },
        uiOptions?: { durationMs?: number; easing?: string }
      ) => {
        const api = coreRef.current;
        if (!api || optionsRef.current.controls === false) return false;

        const len = api.getSlideCount();
        if (!len || !Number.isFinite(target.location)) return false;

        const nextIndex = normalizeIndex(target.index, len);
        const fromIndex = normalizeIndex(target.sourceIndex ?? api.getIndex(), len);
        const motionState = api.readMotionState();

        if (
          nextIndex === fromIndex &&
          Math.abs(target.location - motionState.offset) < 0.5
        ) {
          return false;
        }

        const duration = uiOptions?.durationMs ?? getDuration();
        const easing = uiOptions?.easing ?? getEasing();

        finish();
        if (!prepareSourceSnapshot()) return false;

        const id = ++seqRef.current;
        busyRef.current = true;
        committedTrackIndexRef.current = null;
        committedTrackLocationRef.current = target.location;

        api.renderTrackAtLocation(target.location, { syncVirtual: true });
        api.commitIndexOnly(nextIndex, "animated", fromIndex);

        raf1Ref.current = requestAnimationFrame(() => {
          raf1Ref.current = null;
          if (seqRef.current !== id) return;

          raf2Ref.current = requestAnimationFrame(() => {
            raf2Ref.current = null;
            if (seqRef.current !== id) return;

            setProgress(1, `opacity ${duration}ms ${easing}`);

            timeoutRef.current = window.setTimeout(() => {
              if (seqRef.current !== id) return;
              finish();
            }, duration + 48);
          });
        });

        return true;
      },
    }),
    [
      canUseDrag,
      canUseWheel,
      clearWheelSession,
      completeWheel,
      finish,
      getDuration,
      getEasing,
      getWheelOptions,
      normalizeIndex,
      prepareSourceSnapshot,
      prepareSnapshots,
      setProgress,
      shouldAbsorbWheelSession,
    ]
  );

  React.useEffect(() => {
    const unregister = host.handle?._registerCrossfadeRuntime?.(runtime);
    return () => unregister?.();
  }, [host.handle, runtime]);

  React.useEffect(
    () => () => {
      finish();
      clearWheelSession();
    },
    [clearWheelSession, finish]
  );

  return (
    <div
      ref={layerRef}
      data-rmg-slider-crossfade-layer="true"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity: 0,
        visibility: "hidden",
      }}
    >
      <div
        ref={sourceRef}
        data-rmg-slider-crossfade-slide="source"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 1,
          willChange: "opacity",
        }}
      />
      <div
        ref={targetRef}
        data-rmg-slider-crossfade-slide="target"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          willChange: "opacity",
        }}
      />
    </div>
  );
}

export function sliderCrossfade(_options: CrossFade = {}) {
  return createSliderPlugin("crossfade", {
    options: _options,
    Runtime: CrossfadeRuntime as React.ComponentType<any>,
  });
}

export type { CrossFade };
