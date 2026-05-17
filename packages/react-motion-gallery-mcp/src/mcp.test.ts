import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, test } from "vitest";

import { createRmgMcpServer } from "./mcp.js";

describe("mcp server", () => {
  test("lists tools/resources and answers a recommendation call", async () => {
    const server = createRmgMcpServer();
    const client = new Client({
      name: "rmg-mcp-test-client",
      version: "0.0.0",
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    try {
      const tools = await client.listTools();
      expect(tools.tools.map((tool) => tool.name)).toEqual(
        expect.arrayContaining([
          "classify_gallery_workflow",
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
      const content = result.content as Array<{ type: string; text?: string }>;

      expect(content[0]?.type).toBe("text");
      expect(JSON.parse(content[0]?.type === "text" ? content[0].text ?? "{}" : "{}")).toMatchObject({
        goal: "responsive slider with fullscreen thumbnails",
        workflow: {
          mode: "layoutOnly",
        },
      });

      const docsIndex = await client.readResource({ uri: "rmg://docs" });
      const docsContent = docsIndex.contents[0];
      expect(docsContent?.mimeType).toBe("application/json");
      expect(JSON.parse(docsContent?.text ?? "{}").docs.map((doc: { id: string }) => doc.id)).toEqual(
        expect.arrayContaining(["readme", "skeleton-text-authoring", "skeleton-text-codex-prompt"])
      );

      const skeletonDoc = await client.readResource({
        uri: "rmg://docs/skeleton-text-codex-prompt",
      });
      expect(skeletonDoc.contents[0]?.text).toContain("Workflow Decision Prompt");

      const cacheGuide = await client.readResource({
        uri: "rmg://guides/skeleton-cache",
      });
      expect(cacheGuide.contents[0]?.text).toContain("Skeleton Cookie Snapshot Cache");
      expect(cacheGuide.contents[0]?.text).toContain("SkeletonCacheProvider");
    } finally {
      await client.close();
      await server.close();
    }
  });
});
