#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createRmgMcpServer } from "./mcp.js";

const server = createRmgMcpServer();
const transport = new StdioServerTransport();

await server.connect(transport);
