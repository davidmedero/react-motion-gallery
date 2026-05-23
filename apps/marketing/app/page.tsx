import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "react-motion-gallery/reveal";
import { JsonLd, buildHomeJsonLd } from "@/lib/seo/structured-data";
// import { HomeShowcase } from "./HomeShowcase";
// import { SafariReloadScrollRestorationGuard } from "./components/SafariReloadScrollRestorationGuard";
import { HomeIntroVisual } from "./HomeIntroVisual";
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
              <Reveal
                as="span"
                className="home-intro__version"
                transform={{ y: -12, scale: 0.98 }}
                durationMs={{
                  opacity: 1200,
                  transform: 720
                }}
              >
                v{packageJson.version}
              </Reveal>
              <h1 id="home-intro-title">
                <Reveal
                  as="span"
                  className="home-intro__titleReveal"
                  transform={{ y: 18, scale: 0.98 }}
                  delayMs={70}
                  durationMs={{
                    opacity: 1000,
                    transform: 660
                  }}
                >
                  <span className="home-intro__titleText">
                    React <br className="home-intro__titleBreak" />
                    Motion <br className="home-intro__titleBreak" />
                    Gallery
                  </span>
                </Reveal>
              </h1>
              <Reveal
                as="p"
                className="home-intro__lede"
                transform={{ y: 16 }}
                delayMs={140}
              >
                A motion-first gallery and lightbox system for React, with a complete carousel library, grid and masonry layouts, reveal animations, structured entries for record-based media collections, fullscreen carousel with captions, overlays and thumbnails, SSR-stable skeletons, first-class video surfaces and smooth zoom and pan gestures.
              </Reveal>
              <Reveal
                as="p"
                className="home-intro__license"
                transform={{ y: 12 }}
                rootMargin="0px"
                delayMs={210}
              >
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
              </Reveal>
            </div>

            <HomeIntroVisual />
          </div>

          <div className="home-intro__cards" role="list">
            {HOME_SURFACE_LINKS.map((card, index) => {
              const Icon = card.Icon;

              return (
                <Reveal
                  as="div"
                  className="home-intro-cardReveal"
                  key={card.title}
                  role="listitem"
                  staggerIndex={index}
                  transform={{ y: 18, scale: 0.97 }}
                  durationMs={{
                    opacity: 1000,
                    transform: 660
                  }}
                >
                  <Link
                    className="home-intro-card"
                    data-tone={card.tone}
                    href={card.href}
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
                </Reveal>
              );
            })}
          </div>
        </section>
        <Reveal
          as="section"
          className="home-mcp-callout"
          aria-label="MCP server for AI agents"
          transform={{ y: 20, scale: 0.98 }}
          durationMs={{
            opacity: 1000,
            transform: 660
          }}
        >
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
        </Reveal>
        {/* <HomeShowcase skeletonCacheSnapshots={skeletonCacheSnapshots} /> */}
      </main>
    </>
  );
}
