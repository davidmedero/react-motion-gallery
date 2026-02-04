import { Gallery_default } from './chunk-SAZMF4ZD.mjs';
import * as React from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

// src/Gallery/entries/defaults.ts
var DEFAULT_ENTRIES = {
  mediaLayout: "slider"
};
function useEntryInView(len, opts) {
  const nearMargin = opts?.nearMargin ?? "700px 0px";
  const viewMargin = opts?.viewMargin ?? "0px 0px";
  const nearThreshold = opts?.threshold ?? 0.01;
  const everThreshold = 0;
  const root = opts?.root ?? null;
  const [nearView, setNearView] = React.useState(
    () => Array.from({ length: len }, () => false)
  );
  const [everInView, setEverInView] = React.useState(
    () => Array.from({ length: len }, () => false)
  );
  const nearIORef = React.useRef(null);
  const viewIORef = React.useRef(null);
  const nodeToIndexRef = React.useRef(/* @__PURE__ */ new Map());
  const indexToNodeRef = React.useRef([]);
  React.useEffect(() => {
    indexToNodeRef.current = Array.from({ length: len }, () => null);
    setNearView(Array.from({ length: len }, () => false));
    setEverInView(Array.from({ length: len }, () => false));
    nodeToIndexRef.current.clear();
    nearIORef.current?.disconnect();
    viewIORef.current?.disconnect();
    nearIORef.current = null;
    viewIORef.current = null;
  }, [len]);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    nearIORef.current?.disconnect();
    viewIORef.current?.disconnect();
    nearIORef.current = new IntersectionObserver(
      (entries) => {
        setNearView((prev) => {
          let next = prev;
          let changed = false;
          for (const e of entries) {
            const idx = nodeToIndexRef.current.get(e.target);
            if (idx == null || idx < 0 || idx >= len) continue;
            const isNow = !!e.isIntersecting;
            if (isNow !== prev[idx]) {
              if (!changed) {
                next = prev.slice();
                changed = true;
              }
              next[idx] = isNow;
            }
          }
          return changed ? next : prev;
        });
      },
      { root, rootMargin: nearMargin, threshold: nearThreshold }
    );
    viewIORef.current = new IntersectionObserver(
      (entries) => {
        setEverInView((prev) => {
          let next = prev;
          let changed = false;
          for (const e of entries) {
            const idx = nodeToIndexRef.current.get(e.target);
            if (idx == null || idx < 0 || idx >= len) continue;
            if (e.isIntersecting && !prev[idx]) {
              if (!changed) {
                next = prev.slice();
                changed = true;
              }
              next[idx] = true;
            }
          }
          return changed ? next : prev;
        });
      },
      { root, rootMargin: viewMargin, threshold: everThreshold }
    );
    for (const [node] of nodeToIndexRef.current) {
      nearIORef.current.observe(node);
      viewIORef.current.observe(node);
    }
    return () => {
      nearIORef.current?.disconnect();
      viewIORef.current?.disconnect();
      nearIORef.current = null;
      viewIORef.current = null;
    };
  }, [root, nearMargin, viewMargin, nearThreshold, everThreshold, len]);
  const setEntryRef = React.useCallback(
    (index) => (node) => {
      const prevNode = indexToNodeRef.current[index] ?? null;
      if (prevNode && prevNode !== node) {
        nodeToIndexRef.current.delete(prevNode);
        nearIORef.current?.unobserve(prevNode);
        viewIORef.current?.unobserve(prevNode);
      }
      indexToNodeRef.current[index] = node;
      if (!node) return;
      nodeToIndexRef.current.set(node, index);
      nearIORef.current?.observe(node);
      viewIORef.current?.observe(node);
    },
    []
  );
  return { nearView, everInView, setEntryRef };
}
function safeEntriesKey(entries) {
  const list = entries ?? [];
  let key = `${list.length}|`;
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    key += (e?.key ?? e?.id ?? `i${i}`) + "|";
  }
  return key;
}
function decodeImageUrl(url, signal) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    const finish = () => resolve();
    if (signal?.aborted) return finish();
    signal?.addEventListener("abort", finish, { once: true });
    const hasDecode = typeof img.decode === "function";
    if (hasDecode) {
      img.decode().catch(() => {
      }).finally(finish);
      return;
    }
    if (img.complete) return finish();
    img.onload = finish;
    img.onerror = finish;
  });
}
function useEntryDecodeReady(enabled, entries, inView, opts) {
  const timeoutMs = opts?.timeoutMs ?? 8e3;
  const entriesKey = React.useMemo(() => safeEntriesKey(entries), [entries]);
  const entryImageUrls = React.useMemo(() => {
    const list = entries ?? [];
    return list.map(
      (entry) => (entry.media ?? []).filter((m) => m?.kind === "image" && typeof m?.src === "string").map((m) => m.src)
    );
  }, [entries]);
  const [decodedReady, setDecodedReady] = React.useState([]);
  const startedRef = React.useRef([]);
  const controllersRef = React.useRef(/* @__PURE__ */ new Map());
  const initKeyRef = React.useRef("");
  React.useEffect(() => {
    if (!enabled) return;
    const len = entries?.length ?? 0;
    if (initKeyRef.current !== entriesKey) {
      initKeyRef.current = entriesKey;
      setDecodedReady(
        Array.from({ length: len }, (_, i) => (entryImageUrls[i]?.length ?? 0) === 0)
      );
      startedRef.current = Array.from({ length: len }, () => false);
      for (const [, ac] of controllersRef.current) ac.abort();
      controllersRef.current.clear();
    }
  }, [enabled, entriesKey, entries, entryImageUrls]);
  React.useEffect(() => {
    if (!enabled) return;
    const len = entries?.length ?? 0;
    if (!len) return;
    for (let entryIndex = 0; entryIndex < len; entryIndex++) {
      const shouldStart = !!inView[entryIndex];
      const alreadyReady = decodedReady[entryIndex] ?? false;
      const alreadyStarted = startedRef.current[entryIndex] ?? false;
      if (!shouldStart || alreadyReady || alreadyStarted) continue;
      startedRef.current[entryIndex] = true;
      const urls = entryImageUrls[entryIndex] ?? [];
      if (!urls.length) {
        setDecodedReady((prev) => {
          if (prev[entryIndex]) return prev;
          const next = prev.slice();
          next[entryIndex] = true;
          return next;
        });
        continue;
      }
      const ac = new AbortController();
      controllersRef.current.set(entryIndex, ac);
      (async () => {
        for (const url of urls) {
          if (ac.signal.aborted) return;
          await Promise.race([
            decodeImageUrl(url, ac.signal),
            new Promise((resolve) => {
              const t = window.setTimeout(resolve, timeoutMs);
              ac.signal.addEventListener(
                "abort",
                () => {
                  window.clearTimeout(t);
                  resolve();
                },
                { once: true }
              );
            })
          ]);
        }
        if (ac.signal.aborted) return;
        setDecodedReady((prev) => {
          if (!prev || entryIndex < 0 || entryIndex >= prev.length) return prev;
          if (prev[entryIndex]) return prev;
          const next = prev.slice();
          next[entryIndex] = true;
          return next;
        });
      })();
    }
  }, [enabled, entries, entryImageUrls, inView, decodedReady, timeoutMs]);
  React.useEffect(() => {
    return () => {
      for (const [, ac] of controllersRef.current) ac.abort();
      controllersRef.current.clear();
    };
  }, []);
  return { decodedReady, entriesKey };
}
function useNormalizedEntriesLoading(entries) {
  return React.useMemo(() => {
    const src = entries.loading ?? {};
    return {
      isLoading: src.isLoading,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading
    };
  }, [entries.loading]);
}
function useNormalizedEntriesIntro(entries) {
  return React.useMemo(() => {
    const src = entries.intro ?? {};
    return {
      renderIntro: src.renderIntro,
      staggerMs: src.staggerMs ?? 200,
      transform: src.transform ?? "translateY(30px) scale(0.99)",
      durationMs: src.durationMs ?? 700,
      easing: src.easing ?? "cubic-bezier(.2,.7,.2,1)",
      staggerLimit: Math.max(0, (src.staggerLimit ?? 6) | 0)
    };
  }, [entries.intro]);
}
function EntrySkeletonCard() {
  return /* @__PURE__ */ jsxs("article", { className: Gallery_default.entrySkeletonCard, children: [
    /* @__PURE__ */ jsxs("div", { className: Gallery_default.entrySkeletonHeader, children: [
      /* @__PURE__ */ jsx("div", { className: `${Gallery_default.entrySkeletonAvatar} ${Gallery_default.entrySkeletonShimmer}` }),
      /* @__PURE__ */ jsxs("div", { className: Gallery_default.entrySkeletonLines, children: [
        /* @__PURE__ */ jsx("div", { className: `${Gallery_default.entrySkeletonLineShort} ${Gallery_default.entrySkeletonShimmer}` }),
        /* @__PURE__ */ jsx("div", { className: `${Gallery_default.entrySkeletonLineLong} ${Gallery_default.entrySkeletonShimmer}` })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: Gallery_default.entrySkeletonBody, children: [
      /* @__PURE__ */ jsx("div", { className: `${Gallery_default.entrySkeletonLineLong} ${Gallery_default.entrySkeletonShimmer}` }),
      /* @__PURE__ */ jsx("div", { className: `${Gallery_default.entrySkeletonLineMedium} ${Gallery_default.entrySkeletonShimmer}` })
    ] }),
    /* @__PURE__ */ jsx("div", { className: `${Gallery_default.entrySkeletonMedia} ${Gallery_default.entrySkeletonShimmer}` })
  ] });
}
function EntryList({
  enabled,
  entries,
  fsEnabled,
  openFullscreenAt,
  entryFlatIndexRef,
  nodeFromMedia,
  isClickRef,
  renderMediaContainer,
  registerExpandableImg
}) {
  const items = entries.items ?? [];
  const len = items.length;
  const { nearView, everInView, setEntryRef } = useEntryInView(len, {
    root: null,
    nearMargin: "700px 0px",
    viewMargin: "0px 0px",
    threshold: 0.01
  });
  const { decodedReady } = useEntryDecodeReady(enabled, items, nearView, {
    timeoutMs: 8e3
  });
  const loadingN = useNormalizedEntriesLoading(entries);
  const introN = useNormalizedEntriesIntro(entries);
  const showGlobalLoading = enabled && (loadingN.isLoading === true || len === 0);
  const entryRows = !len ? null : items.map((entry, entryIndex) => {
    const isNear = nearView[entryIndex] ?? false;
    const hasEver = everInView[entryIndex] ?? false;
    const isDecoded = decodedReady[entryIndex] ?? false;
    const shouldMountContent = hasEver || isNear;
    const reveal = hasEver && isDecoded;
    const showSkeleton = !reveal;
    let contentNode = null;
    if (shouldMountContent) {
      const mediaArray = entry.media ?? [];
      const flatIndexByEntry = entryFlatIndexRef.current;
      const mediaNodes = mediaArray.map((media, mediaIndex) => {
        const globalIndex = flatIndexByEntry?.[entryIndex]?.[mediaIndex] ?? 0;
        const rawContent = typeof entries.render?.media === "function" ? entries.render.media({ entry, entryIndex, media, mediaIndex }) : nodeFromMedia(media);
        const reg = (node) => {
          registerExpandableImg?.(globalIndex, node);
        };
        const handleClick = (e) => {
          e.preventDefault();
          if (!fsEnabled) return;
          if (entries.mediaLayout === "slider" && isClickRef && !isClickRef.current) return;
          openFullscreenAt(globalIndex, e.currentTarget);
        };
        if (React.isValidElement(rawContent)) {
          const original = rawContent;
          const origOnClick = original.props?.onClick;
          const origRef = original.ref;
          const mergedOnClick = (e) => {
            if (typeof origOnClick === "function") origOnClick(e);
            if (e.defaultPrevented) return;
            handleClick(e);
          };
          if (typeof original.type === "string") {
            const mergedRef = (node) => {
              if (typeof origRef === "function") origRef(node);
              else if (origRef && typeof origRef === "object") origRef.current = node;
              reg(node);
            };
            return React.cloneElement(original, {
              key: `${entryIndex}-${mediaIndex}`,
              onClick: mergedOnClick,
              ref: mergedRef
            });
          }
          return /* @__PURE__ */ jsx(
            "span",
            {
              ref: reg,
              style: { display: "contents" },
              children: React.cloneElement(original, {
                onClick: mergedOnClick
              })
            },
            `${entryIndex}-${mediaIndex}`
          );
        }
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: Gallery_default.entryMediaButton,
            onClick: handleClick,
            ref: reg,
            children: rawContent
          },
          `${entryIndex}-${mediaIndex}`
        );
      });
      const mediaContainer = renderMediaContainer({ entryIndex, mediaNodes });
      contentNode = typeof entries.render?.card === "function" ? entries.render.card({ entry, entryIndex, media: mediaContainer }) : mediaContainer;
    }
    const limit = introN.staggerLimit;
    const delayIndex = limit > 0 && entryIndex < limit ? entryIndex : 0;
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref: setEntryRef(entryIndex),
        "data-rmg-entry-ready": reveal ? "1" : "0",
        className: Gallery_default.entryRow,
        "data-rmg-entry-owner": entryIndex,
        style: { ["--rmg-entry-intro-index"]: delayIndex },
        children: [
          /* @__PURE__ */ jsx("div", { className: Gallery_default.entrySkeletonWrap, "aria-hidden": showSkeleton ? void 0 : true, children: /* @__PURE__ */ jsx(EntrySkeletonCard, {}) }),
          shouldMountContent ? /* @__PURE__ */ jsx("div", { className: Gallery_default.entryInner, children: contentNode }) : null
        ]
      },
      entry.key ?? entry.id ?? entryIndex
    );
  });
  const containerProps = {
    className: [Gallery_default.entryList].filter(Boolean).join(" "),
    style: {
      ["--rmg-entry-intro-stagger"]: `${introN.staggerMs}ms`,
      ["--rmg-entry-intro-transform"]: introN.transform,
      ["--rmg-entry-intro-duration"]: `${introN.durationMs}ms`,
      ["--rmg-entry-intro-easing"]: introN.easing
    },
    "aria-busy": showGlobalLoading ? true : void 0
  };
  const inner = /* @__PURE__ */ jsx("div", { ...containerProps, children: entryRows });
  return introN.renderIntro ? introN.renderIntro({ active: !showGlobalLoading, containerProps }, inner) : inner;
}

export { DEFAULT_ENTRIES, EntryList, useEntryDecodeReady, useEntryInView, useNormalizedEntriesIntro, useNormalizedEntriesLoading };
//# sourceMappingURL=chunk-7KJKS6NB.mjs.map
//# sourceMappingURL=chunk-7KJKS6NB.mjs.map