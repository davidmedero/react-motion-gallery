import * as React from "react";

type EntryLike = {
  key?: string;
  id?: string;
  media?: Array<{ kind?: string; src?: string }>;
};

type DecodePriority = "all" | "first";

type UseEntryDecodeReadyOptions = {
  timeoutMs?: number;
  priority?: DecodePriority;
};

function safeEntriesKey(entries: EntryLike[] | undefined) {
  const list = entries ?? [];
  let key = `${list.length}|`;
  for (let i = 0; i < list.length; i++) {
    const e = list[i] as any;
    const mediaKey = (e?.media ?? [])
      .map((media: any) => `${media?.kind ?? ""}:${media?.src ?? ""}`)
      .join(",");
    key += `${e?.key ?? e?.id ?? `i${i}`}[${mediaKey}]|`;
  }
  return key;
}

function decodeImageUrl(url: string, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      signal?.removeEventListener("abort", finish);
      img.onload = null;
      img.onerror = null;
      resolve();
    };

    if (signal?.aborted) return finish();
    signal?.addEventListener("abort", finish, { once: true });

    img.decoding = "async";
    img.src = url;

    const hasDecode = typeof (img as any).decode === "function";
    if (hasDecode) {
      (img as any).decode().catch(() => {}).finally(finish);
      return;
    }

    if (img.complete) return finish();
    img.onload = finish;
    img.onerror = finish;
  });
}

export function useEntryDecodeReady(
  enabled: boolean,
  entries: EntryLike[] | undefined,
  inView: boolean[],
  opts?: UseEntryDecodeReadyOptions
) {
  const timeoutMs = opts?.timeoutMs ?? 8000;
  const priority = opts?.priority ?? "all";

  const entriesKey = React.useMemo(() => safeEntriesKey(entries), [entries]);

  const entryImageUrls = React.useMemo(() => {
    const list = entries ?? [];
    return list.map((entry) =>
      (entry.media ?? [])
        .filter((m: any) => m?.kind === "image" && typeof m?.src === "string")
        .map((m: any) => m.src as string)
    );
  }, [entries]);

  const entryPriorityImageUrls = React.useMemo(
    () =>
      entryImageUrls.map((urls) =>
        priority === "first" ? urls.slice(0, 1) : urls
      ),
    [entryImageUrls, priority]
  );

  const [decodedReady, setDecodedReady] = React.useState<boolean[]>([]);
  const startedRef = React.useRef<boolean[]>([]);
  const controllersRef = React.useRef<Map<number, AbortController>>(new Map());
  const initKeyRef = React.useRef<string>("");
  const decodedReadyForRender = React.useMemo(() => {
    if (!enabled || initKeyRef.current === entriesKey) return decodedReady;

    const len = entries?.length ?? 0;
    return Array.from(
      { length: len },
      (_, index) => (entryPriorityImageUrls[index]?.length ?? 0) === 0
    );
  }, [decodedReady, enabled, entries?.length, entriesKey, entryPriorityImageUrls]);

  React.useEffect(() => {
    if (!enabled) return;

    const len = entries?.length ?? 0;

    if (initKeyRef.current !== entriesKey) {
      initKeyRef.current = entriesKey;

      setDecodedReady(
        Array.from(
          { length: len },
          (_, i) => (entryPriorityImageUrls[i]?.length ?? 0) === 0
        )
      );

      startedRef.current = Array.from({ length: len }, () => false);

      for (const [, ac] of controllersRef.current) ac.abort();
      controllersRef.current.clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, entriesKey, entries, entryPriorityImageUrls]);

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

      const priorityUrls = entryPriorityImageUrls[entryIndex] ?? [];
      const allUrls = entryImageUrls[entryIndex] ?? [];
      if (!priorityUrls.length) {
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

      const decodeUrls = async (urls: string[]) => {
        for (const url of urls) {
          if (ac.signal.aborted) return;

          await Promise.race([
            decodeImageUrl(url, ac.signal),
            new Promise<void>((resolve) => {
              const t = window.setTimeout(resolve, timeoutMs);
              ac.signal.addEventListener(
                "abort",
                () => {
                  window.clearTimeout(t);
                  resolve();
                },
                { once: true }
              );
            }),
          ]);
        }
      };

      (async () => {
        await decodeUrls(priorityUrls);

        if (ac.signal.aborted) return;

        setDecodedReady((prev) => {
          if (!prev || entryIndex < 0 || entryIndex >= prev.length) return prev;
          if (prev[entryIndex]) return prev;
          const next = prev.slice();
          next[entryIndex] = true;
          return next;
        });

        const remainingUrls =
          priorityUrls.length >= allUrls.length
            ? []
            : allUrls.slice(priorityUrls.length);
        if (remainingUrls.length) {
          await decodeUrls(remainingUrls);
        }
      })();
    }
  }, [
    enabled,
    entries,
    entryImageUrls,
    entryPriorityImageUrls,
    inView,
    decodedReady,
    timeoutMs,
  ]);

  React.useEffect(() => {
    return () => {
      for (const [, ac] of controllersRef.current) ac.abort();
      controllersRef.current.clear();
    };
  }, []);

  return { decodedReady: decodedReadyForRender, entriesKey };
}
