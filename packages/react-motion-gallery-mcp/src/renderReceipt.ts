import { spawn, type ChildProcessByStdio } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Readable } from "node:stream";

import WebSocket from "ws";

const DEFAULT_CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DEFAULT_TTL_MS = 5 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_SETTLE_MS = 120;
const DEFAULT_STABLE_GEOMETRY_FRAMES = 3;

export const RMG_MARKER_SELECTORS = {
  skeletonText: "[data-skeleton-text-id]",
  sliderScope: "[data-rmg-slider-core-scope]",
  galleryIndex: "[data-rmg-idx]",
  entryOwner: "[data-rmg-entry-owner]",
  fullscreenTrigger: "[data-rmg-fullscreen-trigger]",
  zoomPanRoot: "[data-rmg-zoom-pan-root]",
};

export type RenderReceiptViewportRequest = {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  mobile?: boolean;
};

export type RenderReceiptProbeArgs = {
  url: string;
  viewport: RenderReceiptViewportRequest;
  selectors?: string[];
  readyExpression?: string;
  settleMs?: number;
  stableGeometryFrames?: number;
  timeoutMs?: number;
  ttlMs?: number;
  chromePath?: string;
};

export type RenderReceiptProbeRequest = {
  url: string;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor: number;
    mobile: boolean;
  };
  selectors: string[];
  readyExpression?: string;
  settleMs: number;
  stableGeometryFrames: number;
  timeoutMs: number;
};

export type RenderReceiptWarning = {
  code: string;
  message: string;
  detail?: Record<string, unknown>;
};

export type RenderReceiptRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type RenderReceiptDataAttributeSummary = {
  count: number;
  valueCount: number;
  valuesHash: string | null;
};

export type RenderReceiptSelectorSummary = {
  selector: string;
  count: number;
  visibleCount: number;
  rects: RenderReceiptRect[];
  dataAttributes: Record<string, RenderReceiptDataAttributeSummary>;
};

export type RenderReceiptViewportMetrics = {
  innerWidth: number;
  innerHeight: number;
  documentElementClientWidth: number;
  documentElementClientHeight: number;
  visualViewportWidth: number | null;
  visualViewportHeight: number | null;
  devicePixelRatio: number;
};

export type RenderReceiptStability = {
  stable: boolean;
  stableFrames: number;
  requiredFrames: number;
  framesObserved: number;
  timedOut: boolean;
  timeoutMs: number;
};

export type RenderReceipt = {
  receiptId: string;
  stateHash: string;
  createdAt: string;
  ttlMs: number;
  request: RenderReceiptProbeRequest;
  tab: {
    targetId: string;
    type: "page";
    lifecycle: "created-and-closed";
  };
  observed: {
    finalUrl: string;
    title: string;
    readyState: string;
    viewport: RenderReceiptViewportMetrics;
    selectorSummaries: Record<string, RenderReceiptSelectorSummary>;
    rmgMarkerCounts: Record<keyof typeof RMG_MARKER_SELECTORS, number>;
    stability: RenderReceiptStability;
  };
  warnings: RenderReceiptWarning[];
};

export type RequiredRenderContext = {
  url: string;
  viewportMin: number;
  viewportMax: number;
  viewportHeight: number;
  selectors: string[];
};

export type RenderReceiptValidationIssue = {
  code: string;
  message: string;
  detail?: Record<string, unknown>;
};

export type RenderReceiptValidationResult =
  | {
      status: "valid";
      receipt: RenderReceipt;
      issues: [];
    }
  | {
      status: "missing" | "expired" | "mismatch";
      receipt?: RenderReceipt;
      issues: RenderReceiptValidationIssue[];
    };

export class RenderReceiptError extends Error {
  readonly code: string;
  readonly detail: Record<string, unknown>;

  constructor(code: string, message: string, detail: Record<string, unknown> = {}) {
    super(message);
    this.name = "RenderReceiptError";
    this.code = code;
    this.detail = detail;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      detail: this.detail,
    };
  }
}

export class RenderReceiptValidationError extends Error {
  readonly code: string;
  readonly issues: RenderReceiptValidationIssue[];

  constructor(code: string, issues: RenderReceiptValidationIssue[]) {
    super(`${code}: ${issues.map((issue) => `${issue.code}: ${issue.message}`).join("; ")}`);
    this.name = "RenderReceiptValidationError";
    this.code = code;
    this.issues = issues;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      issues: this.issues,
    };
  }
}

export class RenderReceiptStore {
  private readonly receipts = new Map<string, RenderReceipt>();

  put(receipt: RenderReceipt) {
    this.receipts.set(receipt.receiptId, receipt);
    return receipt;
  }

  get(receiptId: string | undefined) {
    return receiptId ? this.receipts.get(receiptId) ?? null : null;
  }

  validate(args: {
    receiptId?: string;
    required: RequiredRenderContext;
    now?: number;
  }): RenderReceiptValidationResult {
    const receipt = this.get(args.receiptId);
    return validateRenderReceipt({
      receipt,
      receiptId: args.receiptId,
      required: args.required,
      now: args.now,
    });
  }
}

export type RenderReceiptProbe = (args: RenderReceiptProbeArgs) => Promise<RenderReceipt>;

type LaunchedChrome = {
  child: ChildProcessByStdio<null, Readable, Readable>;
  userDataDir: string;
  wsUrl: string;
};

class ChromeCdpClient {
  private readonly ws: WebSocket;
  private readonly pending = new Map<
    number,
    {
      resolve: (value: unknown) => void;
      reject: (error: unknown) => void;
    }
  >();
  private readonly listeners = new Map<string, Array<(params: any, sessionId?: string) => void>>();
  private nextId = 1;

  private constructor(ws: WebSocket) {
    this.ws = ws;
    this.ws.on("message", (data) => {
      const message = JSON.parse(String(data)) as {
        id?: number;
        method?: string;
        params?: unknown;
        result?: unknown;
        error?: { message?: string };
        sessionId?: string;
      };

      if (message.id != null) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) {
          pending.reject(
            new RenderReceiptError(
              "BROWSER_PROTOCOL_ERROR",
              message.error.message || "Chrome DevTools Protocol error.",
              { message }
            )
          );
          return;
        }
        pending.resolve(message.result);
        return;
      }

      if (message.method) {
        const handlers = this.listeners.get(message.method) ?? [];
        for (const handler of handlers) {
          handler(message.params, message.sessionId);
        }
      }
    });
  }

  static async connect(wsUrl: string) {
    const ws = new WebSocket(wsUrl);
    await new Promise<void>((resolve, reject) => {
      ws.once("open", () => resolve());
      ws.once("error", reject);
    });
    return new ChromeCdpClient(ws);
  }

  async close() {
    if (this.ws.readyState === WebSocket.CLOSED) return;

    await new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timeout);
        resolve();
      };
      const timeout = setTimeout(done, 500);

      this.ws.once("close", done);
      this.ws.once("error", done);

      if (this.ws.readyState === WebSocket.CLOSING) return;

      try {
        this.ws.close();
      } catch {
        done();
      }
    });
  }

  on(method: string, handler: (params: any, sessionId?: string) => void) {
    const handlers = this.listeners.get(method) ?? [];
    handlers.push(handler);
    this.listeners.set(method, handlers);
    return () => {
      this.listeners.set(
        method,
        (this.listeners.get(method) ?? []).filter((entry) => entry !== handler)
      );
    };
  }

  waitFor(method: string, sessionId?: string) {
    return new Promise<unknown>((resolve) => {
      const dispose = this.on(method, (params, incomingSessionId) => {
        if (sessionId && incomingSessionId !== sessionId) return;
        dispose();
        resolve(params);
      });
    });
  }

  send<T = unknown>(
    method: string,
    params: Record<string, unknown> = {},
    sessionId?: string
  ): Promise<T> {
    const id = this.nextId++;
    const payload = sessionId ? { id, method, params, sessionId } : { id, method, params };

    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }
}

export function normalizeRenderProbeRequest(args: RenderReceiptProbeArgs): RenderReceiptProbeRequest {
  return {
    url: canonicalizeUrl(args.url),
    viewport: {
      width: positiveInteger(args.viewport.width, "viewport.width"),
      height: positiveInteger(args.viewport.height, "viewport.height"),
      deviceScaleFactor:
        args.viewport.deviceScaleFactor != null
          ? positiveNumber(args.viewport.deviceScaleFactor, "viewport.deviceScaleFactor")
          : 1,
      mobile: args.viewport.mobile === true,
    },
    selectors: uniqueStrings(args.selectors ?? []),
    readyExpression: cleanOptionalString(args.readyExpression),
    settleMs: nonNegativeNumber(args.settleMs ?? DEFAULT_SETTLE_MS, "settleMs"),
    stableGeometryFrames: positiveInteger(
      args.stableGeometryFrames ?? DEFAULT_STABLE_GEOMETRY_FRAMES,
      "stableGeometryFrames"
    ),
    timeoutMs: positiveInteger(args.timeoutMs ?? DEFAULT_TIMEOUT_MS, "timeoutMs"),
  };
}

export async function probeRenderContext(args: RenderReceiptProbeArgs): Promise<RenderReceipt> {
  const request = normalizeRenderProbeRequest(args);
  const chromePath = args.chromePath ?? process.env.RMG_CHROME_PATH ?? DEFAULT_CHROME_PATH;
  const ttlMs = positiveInteger(args.ttlMs ?? DEFAULT_TTL_MS, "ttlMs");
  const launched = await launchChrome(chromePath);
  let client: ChromeCdpClient | null = null;
  let targetId: string | null = null;

  try {
    client = await ChromeCdpClient.connect(launched.wsUrl);
    const target = await createPageTarget({ client, request });
    targetId = target.targetId;

    const readiness = await waitForReadyExpression({
      client,
      sessionId: target.sessionId,
      expression: request.readyExpression,
      timeoutMs: request.timeoutMs,
    });

    await wait(request.settleMs);

    const stability = await waitForStableGeometry({
      client,
      sessionId: target.sessionId,
      request,
    });

    const observed = await collectObservedState({
      client,
      sessionId: target.sessionId,
      request,
      stability,
    });
    const warnings = buildWarnings({ request, observed, readiness });

    await client.send("Target.closeTarget", { targetId: target.targetId }).catch(() => undefined);
    targetId = null;

    return buildRenderReceipt({
      request,
      observed,
      targetId: target.targetId,
      ttlMs,
      warnings,
    });
  } finally {
    if (client && targetId) {
      await client.send("Target.closeTarget", { targetId }).catch(() => undefined);
    }
    await client?.close().catch(() => undefined);
    await stopChrome(launched);
  }
}

export function buildRenderReceipt(args: {
  request: RenderReceiptProbeRequest;
  observed: RenderReceipt["observed"];
  targetId: string;
  ttlMs?: number;
  warnings?: RenderReceiptWarning[];
  receiptId?: string;
  createdAt?: string;
}): RenderReceipt {
  const receipt = {
    receiptId: args.receiptId ?? `rmg-render-${randomUUID()}`,
    stateHash: "",
    createdAt: args.createdAt ?? new Date().toISOString(),
    ttlMs: args.ttlMs ?? DEFAULT_TTL_MS,
    request: args.request,
    tab: {
      targetId: args.targetId,
      type: "page" as const,
      lifecycle: "created-and-closed" as const,
    },
    observed: args.observed,
    warnings: args.warnings ?? [],
  };

  return {
    ...receipt,
    stateHash: hashRenderReceiptState(receipt),
  };
}

export function hashRenderReceiptState(
  value: Pick<RenderReceipt, "request" | "observed">
): string {
  return sha256(
    stableJson({
      finalUrl: canonicalizeUrl(value.observed.finalUrl),
      viewport: value.observed.viewport,
      selectorSummaries: value.observed.selectorSummaries,
      rmgMarkerCounts: value.observed.rmgMarkerCounts,
    })
  );
}

export function validateRenderReceipt(args: {
  receipt: RenderReceipt | null;
  receiptId?: string;
  required: RequiredRenderContext;
  now?: number;
}): RenderReceiptValidationResult {
  if (!args.receipt) {
    return {
      status: "missing",
      issues: [
        {
          code: "RENDER_RECEIPT_MISSING",
          message: "A fresh render receipt is required before applying browser-measured skeleton scaffolding.",
          detail: { receiptId: args.receiptId },
        },
      ],
    };
  }

  const receipt = args.receipt;
  const issues: RenderReceiptValidationIssue[] = [];
  const now = args.now ?? Date.now();
  const createdAtMs = Date.parse(receipt.createdAt);

  if (!Number.isFinite(createdAtMs) || now - createdAtMs > receipt.ttlMs) {
    issues.push({
      code: "RENDER_RECEIPT_EXPIRED",
      message: "The render receipt is stale. Probe the page again before applying.",
      detail: { createdAt: receipt.createdAt, ttlMs: receipt.ttlMs },
    });
  }

  const requiredUrl = canonicalizeUrl(args.required.url);
  if (receipt.request.url !== requiredUrl || canonicalizeUrl(receipt.observed.finalUrl) !== requiredUrl) {
    issues.push({
      code: "RENDER_RECEIPT_URL_MISMATCH",
      message: "The render receipt URL does not match the skeleton manifest URL.",
      detail: {
        expected: requiredUrl,
        requested: receipt.request.url,
        observed: receipt.observed.finalUrl,
      },
    });
  }

  const width = receipt.observed.viewport.innerWidth;
  if (width < args.required.viewportMin || width > args.required.viewportMax) {
    issues.push({
      code: "RENDER_RECEIPT_VIEWPORT_WIDTH_MISMATCH",
      message: "The render receipt viewport width is outside the skeleton manifest range.",
      detail: {
        expectedMin: args.required.viewportMin,
        expectedMax: args.required.viewportMax,
        observed: width,
      },
    });
  }

  const height = receipt.observed.viewport.innerHeight;
  if (height !== args.required.viewportHeight) {
    issues.push({
      code: "RENDER_RECEIPT_VIEWPORT_HEIGHT_MISMATCH",
      message: "The render receipt viewport height does not match the skeleton manifest height.",
      detail: { expected: args.required.viewportHeight, observed: height },
    });
  }

  if (!receipt.observed.stability.stable) {
    issues.push({
      code: "RENDER_RECEIPT_UNSTABLE",
      message: "The render receipt did not observe stable rendered geometry.",
      detail: receipt.observed.stability,
    });
  }

  const missingSelectors = uniqueStrings(args.required.selectors).filter((selector) => {
    const summary = receipt.observed.selectorSummaries[selector];
    return !summary || summary.count < 1;
  });

  if (missingSelectors.length > 0) {
    issues.push({
      code: "RENDER_RECEIPT_MISSING_SELECTORS",
      message: "The render receipt did not observe every skeleton measurement selector.",
      detail: { selectors: missingSelectors },
    });
  }

  if (issues.length > 0) {
    return {
      status: issues.some((issue) => issue.code === "RENDER_RECEIPT_EXPIRED")
        ? "expired"
        : "mismatch",
      receipt,
      issues,
    };
  }

  return {
    status: "valid",
    receipt,
    issues: [],
  };
}

export function buildRenderReceiptValidationError(result: RenderReceiptValidationResult) {
  if (result.status === "valid") {
    throw new Error("Cannot build a render receipt validation error for a valid receipt.");
  }

  return new RenderReceiptValidationError(
    result.status === "missing" ? "RENDER_RECEIPT_MISSING" : "RENDER_RECEIPT_INVALID",
    result.issues
  );
}

export function renderReceiptErrorPayload(error: unknown) {
  if (error instanceof RenderReceiptValidationError || error instanceof RenderReceiptError) {
    return error.toJSON();
  }

  if (error instanceof Error) {
    return {
      code: "UNEXPECTED_RENDER_RECEIPT_ERROR",
      message: error.message,
      detail: {},
    };
  }

  return {
    code: "UNEXPECTED_RENDER_RECEIPT_ERROR",
    message: "An unexpected non-Error value was thrown.",
    detail: { error },
  };
}

export function buildSkeletonRenderProbeRequest(args: {
  url: string;
  viewportMin?: number;
  viewportMax?: number;
  viewportHeight?: number;
  settleMs?: number;
  stableGeometryFrames?: number;
  readyExpression?: string;
  targets?: Array<{ selector: string }>;
  slider?: {
    itemSelector: string;
    roles: Array<{ selector: string }>;
  };
  masonry?: {
    rootSelector?: string;
    anchorSelector?: string;
    itemSelector: string;
  };
  entries?: {
    rootSelector?: string;
    anchorSelector?: string;
    entrySelector?: string;
  };
}) {
  const viewportMin = args.viewportMin ?? 320;
  const viewportMax = args.viewportMax ?? 1600;
  const width = Math.min(viewportMax, Math.max(viewportMin, 1024));

  return {
    url: args.url,
    viewport: {
      width,
      height: args.viewportHeight ?? 1800,
    },
    selectors: collectSkeletonRenderSelectors(args),
    ...(args.readyExpression ? { readyExpression: args.readyExpression } : null),
    settleMs: args.settleMs ?? DEFAULT_SETTLE_MS,
    stableGeometryFrames: args.stableGeometryFrames ?? DEFAULT_STABLE_GEOMETRY_FRAMES,
  };
}

export function buildSkeletonRenderReceiptRequirement(args: Parameters<typeof buildSkeletonRenderProbeRequest>[0]): RequiredRenderContext {
  return {
    url: args.url,
    viewportMin: args.viewportMin ?? 320,
    viewportMax: args.viewportMax ?? 1600,
    viewportHeight: args.viewportHeight ?? 1800,
    selectors: collectSkeletonRenderSelectors(args),
  };
}

export function collectSkeletonRenderSelectors(args: {
  targets?: Array<{ selector: string }>;
  slider?: {
    itemSelector: string;
    roles: Array<{ selector: string }>;
  };
  masonry?: {
    rootSelector?: string;
    anchorSelector?: string;
    itemSelector: string;
  };
  entries?: {
    rootSelector?: string;
    anchorSelector?: string;
    entrySelector?: string;
  };
}) {
  return uniqueStrings([
    ...(args.targets ?? []).map((target) => target.selector),
    ...(args.slider ? [args.slider.itemSelector, ...args.slider.roles.map((role) => role.selector)] : []),
    ...(args.masonry
      ? [args.masonry.rootSelector, args.masonry.anchorSelector, args.masonry.itemSelector]
      : []),
    ...(args.entries
      ? [args.entries.rootSelector, args.entries.anchorSelector, args.entries.entrySelector]
      : []),
  ]);
}

function buildWarnings(args: {
  request: RenderReceiptProbeRequest;
  observed: RenderReceipt["observed"];
  readiness: { satisfied: boolean; timedOut: boolean; error?: string };
}) {
  const warnings: RenderReceiptWarning[] = [];

  if (canonicalizeUrl(args.observed.finalUrl) !== args.request.url) {
    warnings.push({
      code: "url-mismatch",
      message: "The probed page ended on a different URL than requested.",
      detail: { requested: args.request.url, observed: args.observed.finalUrl },
    });
  }

  if (args.readiness.timedOut) {
    warnings.push({
      code: "ready-expression-timeout",
      message: "The readyExpression did not become truthy before timeout.",
      detail: { readyExpression: args.request.readyExpression, error: args.readiness.error },
    });
  }

  if (!args.observed.stability.stable) {
    warnings.push({
      code: "unstable-render-state",
      message: "The probed page did not reach stable geometry before timeout.",
      detail: args.observed.stability,
    });
  }

  const missingSelectors = Object.values(args.observed.selectorSummaries)
    .filter((summary) => summary.count === 0)
    .map((summary) => summary.selector);

  if (missingSelectors.length > 0) {
    warnings.push({
      code: "missing-selectors",
      message: "One or more requested selectors did not match the rendered page.",
      detail: { selectors: missingSelectors },
    });
  }

  return warnings;
}

async function createPageTarget(args: {
  client: ChromeCdpClient;
  request: RenderReceiptProbeRequest;
}): Promise<{ sessionId: string; targetId: string }> {
  const target = await args.client.send<{ targetId: string }>("Target.createTarget", {
    url: "about:blank",
  });
  const attached = await args.client.send<{ sessionId: string }>("Target.attachToTarget", {
    targetId: target.targetId,
    flatten: true,
  });
  const sessionId = attached.sessionId;

  await args.client.send("Page.enable", {}, sessionId);
  await args.client.send("Runtime.enable", {}, sessionId);
  await args.client.send(
    "Emulation.setDeviceMetricsOverride",
    {
      width: args.request.viewport.width,
      height: args.request.viewport.height,
      deviceScaleFactor: args.request.viewport.deviceScaleFactor,
      mobile: args.request.viewport.mobile,
    },
    sessionId
  );

  const documentReady = withTimeout(
    args.client.waitFor("Page.domContentEventFired", sessionId),
    args.request.timeoutMs,
    () =>
      new RenderReceiptError("BROWSER_NAVIGATION_TIMEOUT", "Timed out waiting for page DOMContentLoaded.", {
        url: args.request.url,
        timeoutMs: args.request.timeoutMs,
      })
  );
  const navigation = await args.client.send<{ errorText?: string }>(
    "Page.navigate",
    { url: args.request.url },
    sessionId
  );

  if (navigation.errorText) {
    throw new RenderReceiptError("BROWSER_NAVIGATION_FAILED", navigation.errorText, {
      url: args.request.url,
    });
  }

  await documentReady;
  return { sessionId, targetId: target.targetId };
}

async function waitForReadyExpression(args: {
  client: ChromeCdpClient;
  sessionId: string;
  expression: string | undefined;
  timeoutMs: number;
}) {
  if (!args.expression) {
    return { satisfied: true, timedOut: false };
  }

  const evaluation = await args.client.send<{
    result?: { value?: { satisfied: boolean; timedOut: boolean; error?: string } };
  }>(
    "Runtime.evaluate",
    {
      expression: `new Promise((resolve) => {
        const readyExpression = ${JSON.stringify(args.expression)};
        const timeoutMs = ${Math.max(0, args.timeoutMs)};
        const startedAt = performance.now();
        const evaluateReady = () => {
          try {
            return { value: Boolean(Function('"use strict"; return (' + readyExpression + ');')()) };
          } catch (error) {
            return { value: false, error: error instanceof Error ? error.message : String(error) };
          }
        };

        const tick = () => {
          const result = evaluateReady();
          if (result.value) {
            resolve({ satisfied: true, timedOut: false });
            return;
          }

          if (performance.now() - startedAt >= timeoutMs) {
            resolve({ satisfied: false, timedOut: true, error: result.error });
            return;
          }

          window.setTimeout(tick, 25);
        };

        tick();
      })`,
      returnByValue: true,
      awaitPromise: true,
    },
    args.sessionId
  );

  return evaluation.result?.value ?? { satisfied: false, timedOut: true };
}

async function waitForStableGeometry(args: {
  client: ChromeCdpClient;
  sessionId: string;
  request: RenderReceiptProbeRequest;
}): Promise<RenderReceiptStability> {
  const evaluation = await args.client.send<{
    result?: { value?: RenderReceiptStability };
  }>(
    "Runtime.evaluate",
    {
      expression: createStableGeometryExpression(args.request),
      returnByValue: true,
      awaitPromise: true,
    },
    args.sessionId
  );

  return (
    evaluation.result?.value ?? {
      stable: false,
      stableFrames: 0,
      requiredFrames: args.request.stableGeometryFrames,
      framesObserved: 0,
      timedOut: true,
      timeoutMs: args.request.timeoutMs,
    }
  );
}

async function collectObservedState(args: {
  client: ChromeCdpClient;
  sessionId: string;
  request: RenderReceiptProbeRequest;
  stability: RenderReceiptStability;
}): Promise<RenderReceipt["observed"]> {
  const evaluation = await args.client.send<{
    result?: { value?: Omit<RenderReceipt["observed"], "stability"> };
  }>(
    "Runtime.evaluate",
    {
      expression: createObservedStateExpression(args.request.selectors),
      returnByValue: true,
      awaitPromise: true,
    },
    args.sessionId
  );

  const observed = evaluation.result?.value;
  if (!observed) {
    throw new RenderReceiptError(
      "BROWSER_RECEIPT_FAILED",
      "Browser probing did not return rendered page state."
    );
  }

  return {
    ...observed,
    stability: args.stability,
  };
}

function createStableGeometryExpression(request: RenderReceiptProbeRequest) {
  return `new Promise((resolve) => {
    const selectors = ${JSON.stringify(request.selectors)};
    const markerSelectors = ${JSON.stringify(RMG_MARKER_SELECTORS)};
    const requiredFrames = ${Math.max(1, request.stableGeometryFrames)};
    const timeoutMs = ${Math.max(1, request.timeoutMs)};
    const startedAt = performance.now();
    let lastSignature = "";
    let stableFrames = 0;
    let framesObserved = 0;

    ${browserDomSummaryHelpers()}

    function collectSignature() {
      return JSON.stringify({
        url: location.href,
        readyState: document.readyState,
        viewport: readViewportMetrics(),
        selectors: selectors.map((selector) => summarizeSelector(selector)),
        rmgMarkerCounts: summarizeMarkerCounts(markerSelectors),
        documentSize: {
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight
        }
      });
    }

    function tick() {
      const signature = collectSignature();
      framesObserved += 1;

      if (document.readyState !== "loading" && signature === lastSignature) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
        lastSignature = signature;
      }

      if (stableFrames >= requiredFrames) {
        resolve({
          stable: true,
          stableFrames,
          requiredFrames,
          framesObserved,
          timedOut: false,
          timeoutMs
        });
        return;
      }

      if (performance.now() - startedAt >= timeoutMs) {
        resolve({
          stable: false,
          stableFrames,
          requiredFrames,
          framesObserved,
          timedOut: true,
          timeoutMs
        });
        return;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  })`;
}

function createObservedStateExpression(selectors: string[]) {
  return `(() => {
    const selectors = ${JSON.stringify(selectors)};
    const markerSelectors = ${JSON.stringify(RMG_MARKER_SELECTORS)};

    ${browserDomSummaryHelpers()}

    const selectorSummaries = {};
    for (const selector of selectors) {
      selectorSummaries[selector] = summarizeSelector(selector);
    }

    return {
      finalUrl: location.href,
      title: document.title,
      readyState: document.readyState,
      viewport: readViewportMetrics(),
      selectorSummaries,
      rmgMarkerCounts: summarizeMarkerCounts(markerSelectors)
    };
  })()`;
}

function browserDomSummaryHelpers() {
  return `
    function round(value) {
      return Math.round(Number(value || 0) * 100) / 100;
    }

    function hashString(value) {
      let hash = 2166136261;
      for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(16).padStart(8, "0");
    }

    function readViewportMetrics() {
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        documentElementClientWidth: document.documentElement.clientWidth,
        documentElementClientHeight: document.documentElement.clientHeight,
        visualViewportWidth: window.visualViewport ? window.visualViewport.width : null,
        visualViewportHeight: window.visualViewport ? window.visualViewport.height : null,
        devicePixelRatio: window.devicePixelRatio
      };
    }

    function summarizeDataAttributes(elements) {
      const valuesByName = new Map();
      for (const element of elements) {
        for (const attr of Array.from(element.attributes || [])) {
          if (!/^data-(rmg|skeleton)/.test(attr.name)) continue;
          const values = valuesByName.get(attr.name) || [];
          values.push(String(attr.value || ""));
          valuesByName.set(attr.name, values);
        }
      }

      const out = {};
      for (const [name, values] of valuesByName.entries()) {
        const uniqueValues = Array.from(new Set(values)).sort();
        out[name] = {
          count: values.length,
          valueCount: uniqueValues.length,
          valuesHash: uniqueValues.length > 0 ? hashString(uniqueValues.join("\\u001f")) : null
        };
      }
      return out;
    }

    function summarizeSelector(selector) {
      let elements = [];
      try {
        elements = Array.from(document.querySelectorAll(selector));
      } catch {
        elements = [];
      }

      const rects = [];
      let visibleCount = 0;
      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        const visible = rect.width > 0 && rect.height > 0;
        if (visible) {
          visibleCount += 1;
          if (rects.length < 20) {
            rects.push({
              top: round(rect.top),
              left: round(rect.left),
              width: round(rect.width),
              height: round(rect.height)
            });
          }
        }
      }

      return {
        selector,
        count: elements.length,
        visibleCount,
        rects,
        dataAttributes: summarizeDataAttributes(elements)
      };
    }

    function summarizeMarkerCounts(markerSelectors) {
      const out = {};
      for (const [name, selector] of Object.entries(markerSelectors)) {
        try {
          out[name] = document.querySelectorAll(selector).length;
        } catch {
          out[name] = 0;
        }
      }
      return out;
    }
  `;
}

async function launchChrome(chromePath: string): Promise<LaunchedChrome> {
  const userDataDir = await mkdtemp(join(tmpdir(), "rmg-mcp-render-"));
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-features=CalculateNativeWinOcclusion,PaintHolding",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ];

  const child = spawn(chromePath, args, {
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    const wsUrl = await withTimeout(
      new Promise<string>((resolve, reject) => {
        let launchOutput = "";
        const onData = (chunk: Buffer) => {
          const value = chunk.toString("utf8");
          launchOutput = `${launchOutput}${value}`.slice(-4000);
          const match = value.match(/DevTools listening on (ws:\/\/[^\s]+)/);
          if (match?.[1]) {
            cleanup();
            resolve(match[1]);
          }
        };
        const onError = (error: Error) => {
          cleanup();
          reject(error);
        };
        const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
          cleanup();
          reject(
            new RenderReceiptError(
              "BROWSER_LAUNCH_FAILED",
              "Chrome exited before exposing a DevTools websocket endpoint.",
              { code, signal, output: launchOutput.trim() || undefined, userDataDir }
            )
          );
        };
        const cleanup = () => {
          child.stdout.off("data", onData);
          child.stderr.off("data", onData);
          child.off("error", onError);
          child.off("exit", onExit);
        };

        child.stdout.on("data", onData);
        child.stderr.on("data", onData);
        child.once("error", onError);
        child.once("exit", onExit);
      }),
      DEFAULT_TIMEOUT_MS,
      () =>
        new RenderReceiptError(
          "BROWSER_LAUNCH_TIMEOUT",
          "Timed out waiting for Chrome to expose a DevTools websocket endpoint.",
          { chromePath, userDataDir }
        )
    );

    return { child, userDataDir, wsUrl };
  } catch (error) {
    await stopChrome({ child, userDataDir, wsUrl: "" }).catch(() => undefined);
    throw error;
  }
}

async function stopChrome(launched: LaunchedChrome) {
  const isExited = () => launched.child.exitCode != null || launched.child.signalCode != null;

  if (!isExited()) {
    launched.child.kill("SIGTERM");
    const exited = await Promise.race([
      new Promise<boolean>((resolve) => launched.child.once("exit", () => resolve(true))),
      wait(500).then(() => false),
    ]);

    if (!exited && !isExited()) {
      launched.child.kill("SIGKILL");
      await Promise.race([
        new Promise<void>((resolve) => launched.child.once("exit", () => resolve())),
        wait(500),
      ]);
    }
  }
  await rm(launched.userDataDir, { recursive: true, force: true }).catch(() => undefined);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, createError: () => Error) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(createError()), Math.max(1, timeoutMs));
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.max(0, ms));
  });
}

export function canonicalizeUrl(value: string) {
  try {
    return new URL(value).href;
  } catch {
    return value.trim();
  }
}

function positiveInteger(value: number, name: string) {
  if (!Number.isFinite(value) || value < 1) {
    throw new RenderReceiptError("INVALID_RENDER_RECEIPT_INPUT", `${name} must be a positive integer.`, {
      [name]: value,
    });
  }
  return Math.trunc(value);
}

function positiveNumber(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RenderReceiptError("INVALID_RENDER_RECEIPT_INPUT", `${name} must be a positive number.`, {
      [name]: value,
    });
  }
  return value;
}

function nonNegativeNumber(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RenderReceiptError("INVALID_RENDER_RECEIPT_INPUT", `${name} must be a non-negative number.`, {
      [name]: value,
    });
  }
  return value;
}

function cleanOptionalString(value: string | undefined) {
  return value && value.trim() ? value.trim() : undefined;
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))
  );
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableJson(entry)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableJson(entryValue)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}
