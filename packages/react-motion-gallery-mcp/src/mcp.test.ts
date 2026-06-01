import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, test } from "vitest";

import { createRmgMcpServer } from "./mcp.js";
import {
  buildRenderReceipt,
  normalizeRenderProbeRequest,
  RMG_MARKER_SELECTORS,
  type RenderReceipt,
  type RenderReceiptProbe,
} from "./renderReceipt.js";

function markerCounts() {
  return Object.fromEntries(
    Object.keys(RMG_MARKER_SELECTORS).map((key) => [key, 0])
  ) as RenderReceipt["observed"]["rmgMarkerCounts"];
}

const fakeProbe: RenderReceiptProbe = async (args) => {
  const request = normalizeRenderProbeRequest(args);
  const selectorSummaries = Object.fromEntries(
    request.selectors.map((selector) => [
      selector,
      {
        selector,
        count: 1,
        visibleCount: 1,
        rects: [{ top: 10, left: 20, width: 300, height: 24 }],
        dataAttributes: {},
      },
    ])
  );

  return buildRenderReceipt({
    request,
    targetId: "fake-target",
    receiptId: "rmg-render-fake",
    createdAt: "2026-05-25T12:00:00.000Z",
    ttlMs: 60_000,
    observed: {
      finalUrl: request.url,
      title: "Fake page",
      readyState: "complete",
      viewport: {
        innerWidth: request.viewport.width,
        innerHeight: request.viewport.height,
        documentElementClientWidth: request.viewport.width,
        documentElementClientHeight: request.viewport.height,
        visualViewportWidth: request.viewport.width,
        visualViewportHeight: request.viewport.height,
        devicePixelRatio: request.viewport.deviceScaleFactor,
      },
      selectorSummaries,
      rmgMarkerCounts: markerCounts(),
      stability: {
        stable: true,
        stableFrames: request.stableGeometryFrames,
        requiredFrames: request.stableGeometryFrames,
        framesObserved: request.stableGeometryFrames + 1,
        timedOut: false,
        timeoutMs: request.timeoutMs,
      },
    },
  });
};

async function withMcpClient<T>(
  callback: (client: Client) => Promise<T>,
  options: Parameters<typeof createRmgMcpServer>[0] = {}
) {
  const server = createRmgMcpServer(options);
  const client = new Client({
    name: "rmg-mcp-test-client",
    version: "0.0.0",
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  try {
    return await callback(client);
  } finally {
    await client.close();
    await server.close();
  }
}

function textPayload(result: Awaited<ReturnType<Client["callTool"]>>) {
  const content = result.content as Array<{ type: string; text?: string }>;
  return JSON.parse(content[0]?.type === "text" ? content[0].text ?? "{}" : "{}");
}

function textContent(result: Awaited<ReturnType<Client["callTool"]>>) {
  const content = result.content as Array<{ type: string; text?: string }>;
  return content[0]?.type === "text" ? content[0].text ?? "" : "";
}

function resourceText(content: { text: string } | { blob: string } | undefined) {
  return content && "text" in content ? content.text : "";
}

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "rmg-mcp-render-"));
}

describe("mcp server", () => {
  test("lists tools/resources and answers a recommendation call", async () => {
    await withMcpClient(async (client) => {
      const tools = await client.listTools();
      expect(tools.tools.map((tool) => tool.name)).toEqual(
        expect.arrayContaining([
          "classify_gallery_workflow",
          "probe_render_context",
          "recommend_pattern",
          "get_demo",
          "write_gallery_files",
          "scaffold_skeleton_text",
        ])
      );

      const resources = await client.listResources();
      expect(resources.resources.map((resource) => resource.uri)).toEqual(
        expect.arrayContaining([
          "rmg://context/agent-brief",
          "rmg://catalog/components",
          "rmg://catalog/demos",
          "rmg://docs",
          "rmg://docs/skeleton-text-authoring",
          "rmg://guides/layout-selection",
          "rmg://guides/loading-fidelity",
          "rmg://guides/browser-measured-skeletons",
          "rmg://guides/skeleton-cache",
        ])
      );

      const prompts = await client.listPrompts();
      expect(prompts.prompts.map((prompt) => prompt.name)).toEqual(
        expect.arrayContaining([
          "build_layout_only",
          "build_layout_with_skeleton",
          "build_layout_with_measured_text_skeleton",
          "retrofit_skeleton_loading",
        ])
      );

      const result = await client.callTool({
        name: "recommend_pattern",
        arguments: {
          goal: "responsive slider with fullscreen thumbnails",
          layout: "slider",
        },
      });

      expect(textPayload(result)).toMatchObject({
        goal: "responsive slider with fullscreen thumbnails",
        workflow: {
          mode: "layoutOnly",
        },
      });

      const docsIndex = await client.readResource({ uri: "rmg://docs" });
      const docsContent = docsIndex.contents[0];
      expect(docsContent?.mimeType).toBe("application/json");
      expect(JSON.parse(resourceText(docsContent) || "{}").docs.map((doc: { id: string }) => doc.id)).toEqual(
        expect.arrayContaining([
          "readme",
          "skeleton-text-authoring",
          "entries-data-plugins",
          "grid-masonry-data-plugins",
          "skeleton-text-codex-prompt",
        ])
      );

      const entriesDataDoc = await client.readResource({
        uri: "rmg://docs/entries-data-plugins",
      });
      expect(resourceText(entriesDataDoc.contents[0])).toContain("Entries Data Plugins");

      const gridMasonryDataDoc = await client.readResource({
        uri: "rmg://docs/grid-masonry-data-plugins",
      });
      expect(resourceText(gridMasonryDataDoc.contents[0])).toContain(
        "Grid And Masonry Data Plugins"
      );

      const skeletonDoc = await client.readResource({
        uri: "rmg://docs/skeleton-text-codex-prompt",
      });
      expect(resourceText(skeletonDoc.contents[0])).toContain("Workflow Decision Prompt");

      const cacheGuide = await client.readResource({
        uri: "rmg://guides/skeleton-cache",
      });
      expect(resourceText(cacheGuide.contents[0])).toContain("Skeleton Cookie Snapshot Cache");
      expect(resourceText(cacheGuide.contents[0])).toContain("SkeletonCacheProvider");
    });
  });

  test("probes render context and stores a receipt for scaffold apply", async () => {
    await withMcpClient(
      async (client) => {
        const projectRoot = tempRoot();
        const probeResult = await client.callTool({
          name: "probe_render_context",
          arguments: {
            url: "http://127.0.0.1:3000/pricing?skeletonMeasure=content",
            viewport: { width: 1024, height: 1800 },
            selectors: ["[data-skeleton-text-id='pricingCardTitle']"],
          },
        });
        const receipt = textPayload(probeResult);

        expect(receipt.receiptId).toBe("rmg-render-fake");
        expect(receipt.tab.lifecycle).toBe("created-and-closed");

        const scaffoldResult = await client.callTool({
          name: "scaffold_skeleton_text",
          arguments: {
            projectRoot,
            manifestPath: "pricing.skeleton-text.browser.manifest.json",
            url: "http://127.0.0.1:3000/pricing?skeletonMeasure=content",
            outputFile: "pricing.skeleton-text.generated.ts",
            moduleExportName: "pricingSkeletonText",
            targets: [
              {
                exportName: "pricingCardTitle",
                selector: "[data-skeleton-text-id='pricingCardTitle']",
              },
            ],
            renderReceiptId: receipt.receiptId,
            apply: true,
          },
        });
        const scaffold = textPayload(scaffoldResult);

        expect(scaffold.applied).toBe(true);
        expect(scaffold.receiptStatus).toBe("valid");
        expect(scaffold.renderStateHash).toBe(receipt.stateHash);
      },
      {
        probeRenderContext: fakeProbe,
        now: () => Date.parse("2026-05-25T12:00:01.000Z"),
      }
    );
  });

  test("dry-run skeleton scaffolds suggest the exact render probe call when receipt is missing", async () => {
    await withMcpClient(async (client) => {
      const result = await client.callTool({
        name: "scaffold_skeleton_text",
        arguments: {
          projectRoot: tempRoot(),
          manifestPath: "pricing.skeleton-text.browser.manifest.json",
          url: "http://127.0.0.1:3000/pricing?skeletonMeasure=content",
          outputFile: "pricing.skeleton-text.generated.ts",
          moduleExportName: "pricingSkeletonText",
          targets: [
            {
              exportName: "pricingCardTitle",
              selector: "[data-skeleton-text-id='pricingCardTitle']",
            },
          ],
        },
      });
      const payload = textPayload(result);

      expect(payload.applied).toBe(false);
      expect(payload.receiptStatus).toBe("missing");
      expect(payload.suggestedProbeRenderContextCall).toMatchObject({
        name: "probe_render_context",
        arguments: {
          url: "http://127.0.0.1:3000/pricing?skeletonMeasure=content",
          viewport: { width: 1024, height: 1800 },
          selectors: ["[data-skeleton-text-id='pricingCardTitle']"],
        },
      });
    });
  });

  test("apply skeleton scaffolds reject missing and mismatched receipts", async () => {
    await withMcpClient(
      async (client) => {
        const projectRoot = tempRoot();
        const missingReceiptResult = await client.callTool({
          name: "scaffold_skeleton_text",
          arguments: {
            projectRoot,
            manifestPath: "pricing.skeleton-text.browser.manifest.json",
            url: "http://127.0.0.1:3000/pricing?skeletonMeasure=content",
            outputFile: "pricing.skeleton-text.generated.ts",
            moduleExportName: "pricingSkeletonText",
            targets: [
              {
                exportName: "pricingCardTitle",
                selector: "[data-skeleton-text-id='pricingCardTitle']",
              },
            ],
            apply: true,
          },
        });

        expect(missingReceiptResult.isError).toBe(true);
        expect(textContent(missingReceiptResult)).toContain("RENDER_RECEIPT_MISSING");

        const probeResult = await client.callTool({
          name: "probe_render_context",
          arguments: {
            url: "http://127.0.0.1:3000/other",
            viewport: { width: 1024, height: 1800 },
            selectors: ["[data-skeleton-text-id='pricingCardTitle']"],
          },
        });
        const receipt = textPayload(probeResult);

        const mismatchedReceiptResult = await client.callTool({
          name: "scaffold_skeleton_text",
          arguments: {
            projectRoot,
            manifestPath: "pricing.skeleton-text.browser.manifest.json",
            url: "http://127.0.0.1:3000/pricing?skeletonMeasure=content",
            outputFile: "pricing.skeleton-text.generated.ts",
            moduleExportName: "pricingSkeletonText",
            targets: [
              {
                exportName: "pricingCardTitle",
                selector: "[data-skeleton-text-id='pricingCardTitle']",
              },
            ],
            renderReceiptId: receipt.receiptId,
            apply: true,
          },
        });

        expect(mismatchedReceiptResult.isError).toBe(true);
        expect(textContent(mismatchedReceiptResult)).toContain("RENDER_RECEIPT_URL_MISMATCH");
      },
      {
        probeRenderContext: fakeProbe,
        now: () => Date.parse("2026-05-25T12:00:01.000Z"),
      }
    );
  });
});
