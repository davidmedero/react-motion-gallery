import { describe, expect, test } from "vitest";

import {
  buildRenderReceipt,
  hashRenderReceiptState,
  normalizeRenderProbeRequest,
  RMG_MARKER_SELECTORS,
  validateRenderReceipt,
  type RenderReceipt,
} from "./renderReceipt.js";

const createdAt = "2026-05-25T12:00:00.000Z";
const now = Date.parse(createdAt) + 1000;

function markerCounts() {
  return Object.fromEntries(
    Object.keys(RMG_MARKER_SELECTORS).map((key) => [key, 0])
  ) as RenderReceipt["observed"]["rmgMarkerCounts"];
}

function receipt(overrides: Partial<RenderReceipt["observed"]> = {}) {
  const request = normalizeRenderProbeRequest({
    url: "http://127.0.0.1:3000/gallery",
    viewport: { width: 1024, height: 1800 },
    selectors: ["[data-skeleton-text-id='title']"],
  });

  return buildRenderReceipt({
    request,
    targetId: "target-one",
    receiptId: "rmg-render-test",
    createdAt,
    ttlMs: 60_000,
    observed: {
      finalUrl: request.url,
      title: "Gallery",
      readyState: "complete",
      viewport: {
        innerWidth: 1024,
        innerHeight: 1800,
        documentElementClientWidth: 1024,
        documentElementClientHeight: 1800,
        visualViewportWidth: 1024,
        visualViewportHeight: 1800,
        devicePixelRatio: 1,
      },
      selectorSummaries: {
        "[data-skeleton-text-id='title']": {
          selector: "[data-skeleton-text-id='title']",
          count: 1,
          visibleCount: 1,
          rects: [{ top: 12, left: 24, width: 320, height: 30 }],
          dataAttributes: {
            "data-skeleton-text-id": {
              count: 1,
              valueCount: 1,
              valuesHash: "abc123",
            },
          },
        },
      },
      rmgMarkerCounts: markerCounts(),
      stability: {
        stable: true,
        stableFrames: 3,
        requiredFrames: 3,
        framesObserved: 4,
        timedOut: false,
        timeoutMs: 10_000,
      },
      ...overrides,
    },
  });
}

describe("render receipts", () => {
  test("hashes stable render state without timestamp or tab identity", () => {
    const first = receipt();
    const second = {
      ...receipt(),
      receiptId: "rmg-render-other",
      createdAt: "2026-05-25T13:00:00.000Z",
      tab: {
        ...first.tab,
        targetId: "target-two",
      },
    };

    expect(hashRenderReceiptState(first)).toBe(hashRenderReceiptState(second));
  });

  test("changes state hash when observed geometry changes", () => {
    const first = receipt();
    const second = receipt({
      selectorSummaries: {
        "[data-skeleton-text-id='title']": {
          ...first.observed.selectorSummaries["[data-skeleton-text-id='title']"]!,
          rects: [{ top: 18, left: 24, width: 320, height: 30 }],
        },
      },
    });

    expect(first.stateHash).not.toBe(second.stateHash);
  });

  test("validates fresh matching receipts", () => {
    const result = validateRenderReceipt({
      receipt: receipt(),
      required: {
        url: "http://127.0.0.1:3000/gallery",
        viewportMin: 320,
        viewportMax: 1600,
        viewportHeight: 1800,
        selectors: ["[data-skeleton-text-id='title']"],
      },
      now,
    });

    expect(result.status).toBe("valid");
  });

  test("rejects expired receipts", () => {
    const result = validateRenderReceipt({
      receipt: receipt(),
      required: {
        url: "http://127.0.0.1:3000/gallery",
        viewportMin: 320,
        viewportMax: 1600,
        viewportHeight: 1800,
        selectors: ["[data-skeleton-text-id='title']"],
      },
      now: Date.parse(createdAt) + 120_000,
    });

    expect(result.status).toBe("expired");
    expect(result.issues.map((issue) => issue.code)).toContain("RENDER_RECEIPT_EXPIRED");
  });

  test("rejects URL, viewport, stability, and selector mismatches", () => {
    const result = validateRenderReceipt({
      receipt: receipt({
        finalUrl: "http://127.0.0.1:3000/other",
        viewport: {
          ...receipt().observed.viewport,
          innerWidth: 240,
          innerHeight: 900,
        },
        selectorSummaries: {},
        stability: {
          stable: false,
          stableFrames: 0,
          requiredFrames: 3,
          framesObserved: 10,
          timedOut: true,
          timeoutMs: 10_000,
        },
      }),
      required: {
        url: "http://127.0.0.1:3000/gallery",
        viewportMin: 320,
        viewportMax: 1600,
        viewportHeight: 1800,
        selectors: ["[data-skeleton-text-id='title']"],
      },
      now,
    });

    expect(result.status).toBe("mismatch");
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "RENDER_RECEIPT_URL_MISMATCH",
        "RENDER_RECEIPT_VIEWPORT_WIDTH_MISMATCH",
        "RENDER_RECEIPT_VIEWPORT_HEIGHT_MISMATCH",
        "RENDER_RECEIPT_UNSTABLE",
        "RENDER_RECEIPT_MISSING_SELECTORS",
      ])
    );
  });
});
