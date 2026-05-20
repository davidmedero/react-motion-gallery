import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { JsonLd, buildHomeJsonLd } from "@/lib/seo/structured-data";
// import { HomeShowcase } from "./HomeShowcase";
// import { SafariReloadScrollRestorationGuard } from "./components/SafariReloadScrollRestorationGuard";
import { HOME_SURFACE_LINKS } from "./home-surface-links";
// import { readSkeletonCacheSnapshots } from "./skeleton-cache-server";
import packageJson from "../../../packages/react-motion-gallery/package.json";

export default async function Home() {
  // const skeletonCacheSnapshots = await readSkeletonCacheSnapshots();

  return (
    <>
      <JsonLd id="home-json-ld" data={buildHomeJsonLd(HOME_SURFACE_LINKS)} />
      {/* <SafariReloadScrollRestorationGuard /> */}
      <main className="rmgHome">
        <section className="home-intro" aria-labelledby="home-intro-title">
          <div className="home-intro__hero">
            <div className="home-intro__copy">
              <span className="home-intro__version">v{packageJson.version}</span>
              <h1 id="home-intro-title">
                <span className="home-intro__titleText">
                  React <br className="home-intro__titleBreak" />
                  Motion <br className="home-intro__titleBreak" />
                  Gallery
                </span>
              </h1>
              <p className="home-intro__lede">
                A motion-first gallery and lightbox system for React, with a complete carousel library, grid and masonry layouts, structured entries for record-based media collections, fullscreen carousel with captions, overlays and thumbnails, SSR-stable skeletons, first-class video surfaces and smooth zoom and pan gestures.
              </p>
              <p className="home-intro__license">
                Free for non-commercial use, source visible on{" "}
                <a
                  href="https://github.com/davidmedero/react-motion-gallery/tree/main/packages/react-motion-gallery"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="React Motion Gallery source on GitHub"
                  className="githubLink"
                >
                  Github
                </a>.{" "}
              </p>
            </div>

            <div className="home-intro__visual" aria-hidden>
              <Image
                className="home-intro__visualImage"
                src="https://cdn.react-motion-gallery.com/nav/rmg-icon-v5.png"
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 70vw, (max-width: 920px) 34vw, 360px"
              />
            </div>
          </div>

          <div className="home-intro__cards" role="list">
            {HOME_SURFACE_LINKS.map((card) => {
              const Icon = card.Icon;

              return (
                <Link
                  className="home-intro-card"
                  data-tone={card.tone}
                  href={card.href}
                  key={card.title}
                  role="listitem"
                >
                  <span className="home-intro-card__icon" aria-hidden>
                    <Icon size={21} strokeWidth={2.1} />
                  </span>
                  <span className="home-intro-card__content">
                    <strong>{card.title}</strong>
                    <span>{card.description}</span>
                  </span>
                  <ArrowUpRight
                    className="home-intro-card__arrow"
                    size={17}
                    strokeWidth={2.2}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </div>
        </section>
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
        {/* <HomeShowcase skeletonCacheSnapshots={skeletonCacheSnapshots} /> */}
      </main>
    </>
  );
}
