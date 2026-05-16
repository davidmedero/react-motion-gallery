import Link from "next/link";
import { HomeShowcase } from "./HomeShowcase";

export default function Home() {
  return (
    <main className="rmgHome">
      <p className="home-intro">
        <span className="intro-line">
          A motion-first gallery and lightbox system for React, with composable layouts, SSR-stable skeletons, and a flexible fullscreen API.
        </span>
        <span className="intro-subline">
          Free for non-commercial use,{" "}
          <a
            href="https://github.com/davidmedero/react-motion-gallery/tree/main/packages/react-motion-gallery"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="githubLink"
          >
            source-visible
          </a>{" "}
          and commercially licensed for production work.
        </span>
      </p>
      <section className="home-mcp-callout" aria-label="MCP server for AI agents">
        <div className="home-mcp-callout__inner">
          <div className="home-mcp-callout__copy">
            <span className="home-mcp-callout__eyebrow">
              <span className="home-mcp-callout__new">NEW</span>
              MCP server for AI agents
            </span>
            <span className="home-mcp-callout__text">
              Connect Codex, Claude, Cursor, or any MCP client to inspect docs, choose gallery patterns, scaffold components, and generate browser-measured skeleton text.
            </span>
          </div>
          <Link className="home-mcp-callout__link" href="/docs#mcp-server">
            Read the workflow
          </Link>
        </div>
      </section>
      <HomeShowcase />
    </main>
  );
}
