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
        expect.arrayContaining(["recommend_pattern", "get_demo", "write_gallery_files"])
      );

      const resources = await client.listResources();
      expect(resources.resources.map((resource) => resource.uri)).toEqual(
        expect.arrayContaining(["rmg://catalog/components", "rmg://catalog/demos"])
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
      });
    } finally {
      await client.close();
      await server.close();
    }
  });
});
