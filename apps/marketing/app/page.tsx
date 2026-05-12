'use client'

import { CodeBlock } from "@/components/ui/code-block";
import type { JSX } from "react";
import { FsDiagramWithCaptionRight, FsDiagramWithEntriesOverlayBottom, FsDiagramWithThumbs } from "./components/svgDiagrams";

function PageCodeBlock(props: { code: string; language?: string }): JSX.Element {
  const { code, language = "tsx" } = props;

  return <CodeBlock className="rmgGlassCodeBlock max-w-3xl" code={code} language={language} />;
}

export default function Home() {

  return (
    <main className="rmgHome">
      <p className="home-intro">
        <span className="intro-line">
          A composable and deeply customizable gallery system for React with stunning animations, layout primitives, SSR-stable skeletons and rich fullscreen API.
        </span>
      </p>
      <section className="rmgLayouts" aria-labelledby="rmg-layouts-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-layouts-title">
              Four Primary Layouts
            </h2>
            <p className="rmgCard__desc max-w-125">
              These cover the core gallery patterns while sharing responsive controls, loading states, reveal transitions, and fullscreen sync.
            </p>
          </header>

          <div className="rmgLayouts__grid" role="list">
            {/* Slider */}
            <article className="rmgCard" role="listitem">
              <div className="rmgCard__top">
                <h3 className="rmgCard__title">Slider</h3>
                <p className="rmgCard__desc">
                  A complete slider library with a batteries-included API and polished animation engine.
                </p>
              </div>

              <div className="rmgCard__demo rmgDemo rmgDemo--slider" aria-hidden="true">
                <div className="rmgDemo__stage">
                  <div className="rmgDemo__viewport">
                    <div className="rmgDemo__track">
                      <div className="rmgDemo__slide" />
                      <div className="rmgDemo__slide" />
                      <div className="rmgDemo__slide" />
                      <div className="rmgDemo__slide" />
                      <div className="rmgDemo__slide" />
                    </div>
                  </div>

                  <div className="rmgDemo__pager">
                    <span className="rmgDemo__pill" />
                    <span className="rmgDemo__pill" />
                    <span className="rmgDemo__pill" />
                  </div>
                </div>
              </div>
            </article>

            {/* Grid */}
            <article className="rmgCard" role="listitem">
              <div className="rmgCard__top">
                <h3 className="rmgCard__title">Grid</h3>
                <p className="rmgCard__desc">
                  Direct-child CSS Grid layout with auto-fill columns, explicit responsive tracks, and item spans.
                </p>
              </div>

              <div className="rmgCard__demo rmgDemo rmgDemo--grid" aria-hidden="true">
                <div className="rmgDemo__stage">
                  <div className="rmgGridDemo">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div className="rmgGridDemo__cell" key={i} />
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* Masonry */}
            <article className="rmgCard" role="listitem">
              <div className="rmgCard__top">
                <h3 className="rmgCard__title">Masonry</h3>
                <p className="rmgCard__desc">
                  Measured, server-predicted layouts for uneven cards, with balanced, round-robin, horizontal-order placement and responsive spans.
                </p>
              </div>

              <div className="rmgCard__demo rmgDemo rmgDemo--masonry" aria-hidden="true">
                <div className="rmgDemo__stage">
                  <div className="rmgMasonryDemo">
                    <div className="rmgMasonryDemo__col">
                      <div className="rmgMasonryDemo__brick b1" />
                      <div className="rmgMasonryDemo__brick b2" />
                      <div className="rmgMasonryDemo__brick b3" />
                    </div>
                    <div className="rmgMasonryDemo__col">
                      <div className="rmgMasonryDemo__brick b2" />
                      <div className="rmgMasonryDemo__brick b3" />
                      <div className="rmgMasonryDemo__brick b1" />
                    </div>
                    <div className="rmgMasonryDemo__col">
                      <div className="rmgMasonryDemo__brick b3" />
                      <div className="rmgMasonryDemo__brick b1" />
                      <div className="rmgMasonryDemo__brick b2" />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Entries */}
            <article className="rmgCard" role="listitem">
              <div className="rmgCard__top">
                <h3 className="rmgCard__title">Entries</h3>
                <p className="rmgCard__desc">
                  Structured editorial rows where each entry can own text, metadata, and an embedded slider, grid, or masonry gallery.
                </p>
              </div>

              <div className="rmgCard__demo rmgDemo rmgDemo--entries" aria-hidden="true">
                <div className="rmgDemo__stage">
                  <div className="rmgEntriesDemo">
                    <div className="rmgEntryRow">
                      <div className="rmgEntryRow__avatar" />
                      <div className="rmgEntryRow__body">
                        <div className="rmgEntryRow__line l1" />
                        <div className="rmgEntryRow__line l2" />
                        <div className="rmgEntryRow__thumbs">
                          <span className="rmgEntryRow__thumb" />
                          <span className="rmgEntryRow__thumb" />
                          <span className="rmgEntryRow__thumb" />
                        </div>
                      </div>
                    </div>

                    <div className="rmgEntryRow">
                      <div className="rmgEntryRow__avatar" />
                      <div className="rmgEntryRow__body">
                        <div className="rmgEntryRow__line l1" />
                        <div className="rmgEntryRow__line l3" />
                        <div className="rmgEntryRow__thumbs">
                          <span className="rmgEntryRow__thumb" />
                          <span className="rmgEntryRow__thumb" />
                          <span className="rmgEntryRow__thumb" />
                        </div>
                      </div>
                    </div>

                    <div className="rmgEntryRow">
                      <div className="rmgEntryRow__avatar" />
                      <div className="rmgEntryRow__body">
                        <div className="rmgEntryRow__line l2" />
                        <div className="rmgEntryRow__line l3" />
                        <div className="rmgEntryRow__thumbs">
                          <span className="rmgEntryRow__thumb" />
                          <span className="rmgEntryRow__thumb" />
                          <span className="rmgEntryRow__thumb" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="rmgLayouts" aria-labelledby="rmg-fs-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-fs-title">
              Fullscreen Mode
            </h2>
            <p className="rmgCard__desc max-w-140">
              A fullscreen carousel that can run standalone or stay synced with a base layout, featuring composable UI layers and image inspection.
            </p>
          </header>
          <div style={{ marginBottom: '20px' }}></div>
          <section className="space-y-10 text-[rgb(var(--rmg-logo-shadow-rgb))]">
            <h3 className="rmgLayouts__subheader">Content &amp; Navigation Layers</h3>

            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Captions - Slide */}
                <div className="rmgCard">
                  <div className="rmgCard__top">
                    <h4 className="rmgCard__title">Captions - Slide</h4>
                    <p className="rmgCard__desc">
                      Captions that render as part of the fullscreen slide.
                    </p>
                  </div>

                  <div className="w-full max-w-125 mx-auto pt-6">
                    {FsDiagramWithCaptionRight()}
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="rmgCard">
                  <div className="rmgCard__top">
                    <h4 className="rmgCard__title">Thumbnails</h4>
                    <p className="rmgCard__desc">
                      A synced navigation rail that can sit alongside slide or overlay captions.
                    </p>
                  </div>

                  <div className="w-full max-w-125 mx-auto pt-6">
                    {FsDiagramWithThumbs()}
                  </div>
                </div>

                {/* Captions - Overlay */}
                <div className="rmgCard">
                  <div className="rmgCard__top">
                    <h4 className="rmgCard__title">Captions - Overlay</h4>
                    <p className="rmgCard__desc">
                      Viewport-attached caption panels layered over fullscreen content.
                    </p>
                  </div>

                  <div className="w-full max-w-125 mx-auto pt-6">
                    {FsDiagramWithEntriesOverlayBottom()}
                  </div>
                </div>
              </div>
              <p className="font-medium">
                All content and navigation layers support independent placement on any side of the viewport:
              </p>

              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-md">
                <li className="rounded-md bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-3 py-2 text-center text-sm font-medium">Top</li>
                <li className="rounded-md bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-3 py-2 text-center text-sm font-medium">Right</li>
                <li className="rounded-md bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-3 py-2 text-center text-sm font-medium">Bottom</li>
                <li className="rounded-md bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-3 py-2 text-center text-sm font-medium">Left</li>
              </ul>

              <p className="leading-relaxed max-w-3xl">
                Caption <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">width</code> and <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">height</code> accept numeric pixel values, <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">px</code> strings, percentage strings, and responsive maps. Percent widths resolve against the viewport width, while percent heights resolve against the viewport height.
              </p>
            </div>

            <h3 className="rmgLayouts__subheader">Control &amp; Utility Layers</h3>

            <div className="space-y-6 mt-6">
              <h4 className="rmgLayouts__h4">Counter</h4>
              <p className="leading-relaxed max-w-3xl">
                Displays the current index and total count.
              </p>

              <h4 className="rmgLayouts__h4">Prev / Next Arrows</h4>
              <p className="leading-relaxed max-w-3xl">
                You can choose between:
              </p>

              <ul className="list-disc pl-5 space-y-1">
                <li>Default slide <strong>transform</strong></li>
                <li><strong>Crossfade</strong> request</li>
              </ul>

              <p className="leading-relaxed max-w-3xl">
                Transition duration and easing are fully customizable,
                with <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">0ms</code> producing an instant slide change.
              </p>

              <h4 className="rmgLayouts__h4">Close</h4>
                <p className="leading-relaxed max-w-3xl">
                  Closing is context-aware and designed to keep the return animation always on-screen.
                  The close interaction is applied to both the close control and the overlay itself (tap/click the overlay to close). The fullscreen slide can be dragged vertically to close the modal. 
                </p>

                <ul className="list-disc pl-5 space-y-1 max-w-3xl">
                  <li>
                    <strong>Slider:</strong> On close, the base slider instantly snaps to the slide that corresponds to the current
                    fullscreen index (including when the slide/thumb isn&apos;t currently in view), ensuring the closing transform animation
                    lands correctly and preventing fullscreen content from “flying” out of the viewport.
                  </li>
                  <li>
                    <strong>Grid / Masonry:</strong> On close, the page scrolls to center the corresponding thumb in the viewport so the
                    fullscreen-to-thumb transform always resolves cleanly.
                  </li>
                  <li>
                    <strong>Entries:</strong> On close, the page scroll centers the entry that owns the active fullscreen slide,
                    so the fullscreen content returns to the correct context every time.
                  </li>
                </ul>

              <p className="font-medium">With the Control and Utility Layers API, you can:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the built-in components</li>
                <li>Adjust styles and placement</li>
                <li>Or replace them entirely with your own React components</li>
              </ul>

              <h4 className="rmgLayouts__h4">Open & Close Transitions</h4>
                <p className="leading-relaxed max-w-3xl">
                  The opening and closing transitions originate directly from the thumbnail&apos;s visible crop, animating both the <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">clip-path</code> and rendered fullscreen surface in perfect sync to create a seamless, cinematic morph into fullscreen. React Motion Gallery uses a nested clip stack: one clipper for the media crop plus up to two clipping ancestors, preserving thumb, container and viewport masks through the transition. Transitions can be <strong>transform-based</strong> (default) or a <strong>fade</strong> effect.
                  Duration and easing are customizable for both, with <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">0ms</code> producing an instant change.
                </p>
            </div>

            <h3 className="rmgLayouts__subheader">Zoom, Pan, &amp; Pinch</h3>

            <div className="space-y-6 mt-6">
              <h4 className="rmgLayouts__h4">Zoom</h4>
              <p className="leading-relaxed max-w-3xl">
                Designed for a fast, intentional single click/tap interaction. Zooming in/out near image bounds will keep them flushed to the viewport if necessary. Rapidly toggling zoom stays incredibly smooth, and zoom animations remain stable inside loop seams. If a zoom-in is triggered during an active carousel animation or when a slide isn&apos;t centered, the carousel will automatically <strong>animate</strong> the slide towards the center of the viewport.
              </p>
              <p className="leading-relaxed max-w-3xl">
                Clicking prev/next arrows or a thumbnail while zoomed in automatically triggers a zoom-out animation while simultaneously changing slides.
              </p>

              <p className="font-medium">You can tweak:</p>
              <ul className="list-disc pl-5 space-y-1 max-w-3xl">
                <li><strong>clickZoomLevel:</strong> Specifies the target scale used for single-click or tap zoom interactions. A value of 1 represents no zoom. Default value is 2.5.</li>
              </ul>

              <h4 className="rmgLayouts__h4">Pan</h4>
              <p className="leading-relaxed max-w-3xl">
                Uses the same fluid animation engine powering freeScroll drag in the base slider, but configured for both the <strong>x</strong> and <strong>y</strong> axes.
              </p>
              <p className="leading-relaxed max-w-3xl">
                Wheel and touchpad support are built in, and boundary interactions resolve with super smooth spring physics so overscroll and “rubber band” behavior feels natural.
              </p>

              <p className="font-medium">You can tweak:</p>
              <ul className="list-disc pl-5 space-y-1 max-w-3xl">
                <li><strong>panDuration:</strong> Controls the base timing used for pan movement animations. Lower values produce faster, more responsive motion, while higher values feel heavier and more inertial. Default value is 43.</li>
                <li><strong>panFriction:</strong> Controls how quickly pan movement slows and settles after input ends. Lower values feel looser and glide longer, while higher values stop more quickly and feel tighter. Default value is 0.68.</li>
              </ul>

              <h4 className="rmgLayouts__h4">Pinch</h4>
              <p className="leading-relaxed max-w-3xl">
                Driven by tracking two active pointers with a highly native, predictable feel, and stable scaling that stays locked to the user&apos;s intent. If a pinch is triggered during an active carousel animation or when a slide isn&apos;t centered, the carousel will automatically <strong>animate</strong> the slide towards the center of the viewport.
              </p>
              <p className="leading-relaxed max-w-3xl">
                Pinch also includes built-in wheel and touchpad support, so the same high-quality zoom behavior translates across devices and input methods.
              </p>

              <p className="font-medium">You can tweak:</p>
              <ul className="list-disc pl-5 space-y-1 max-w-3xl">
                <li><strong>maxZoomLevel:</strong> Defines the maximum scale that can be reached when zooming via pinch and wheel gestures. Acts as a hard upper bound to prevent over-magnification. Default value is 3.</li>
              </ul>
            </div>

            <h3 className="rmgLayouts__subheader">Rendering Fullscreen Content</h3>
            <div className="space-y-6 mt-6">
              <p className="leading-relaxed max-w-3xl">
                Fullscreen rendering is driven by a dedicated indexed item list, which keeps your base layout and fullscreen experience intentionally <strong>decoupled</strong>.
              </p>

              <p className="leading-relaxed max-w-3xl">
                You can provide a simple list of URLs for image-first galleries, structured image or video items with metadata, or <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">kind: &quot;node&quot;</code> items for arbitrary React markup.
              </p>

              <p className="leading-relaxed max-w-3xl">
                The base layout can render one thing while fullscreen renders its own content for the same position. The only shared contract is the <strong>index</strong>, which keeps navigation, thumbnails, captions, and transitions perfectly aligned.
              </p>

              <p className="leading-relaxed max-w-3xl">
                That index contract also powers the lazy-load handshake. As the base layout observes visible items, <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">GalleryCore</code> publishes the matching index so fullscreen can prewarm the full-resolution image or video before the modal opens. Once fullscreen is open, the fullscreen slider publishes its active index back through the same core, keeping lazy slides, thumbnail rails, captions, overlays, and base media state in sync.
              </p>

              <p className="leading-relaxed max-w-3xl">
                If you want Next.js image optimization in fullscreen, render your
                own <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">Image</code> via{" "}
                <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">fullscreen.renderImage</code>.
                To opt custom renders into the built-in fullscreen spinner and
                decode flow, also enable{" "}
                <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">fullscreen.lazyLoad.images.enabled</code>.
              </p>

              <PageCodeBlock code={`import Image from "next/image";

fullscreen: {
  lazyLoad: {
    images: {
      enabled: true,
    },
  },
  renderImage: ({ item, className, baseStyle }) => (
    <Image
      src={item.src}
      alt={item.alt ?? ""}
      width={item.width ?? 1600}
      height={item.height ?? 1200}
      sizes="100vw"
      className={className}
      style={{
        ...baseStyle,
        position: "static",
        width: "auto",
        height: "auto",
        display: "block",
      }}
    />
  ),
}`} />
            </div>
          </section>
        </div>
      </section>
      <section className="rmgLayouts" aria-labelledby="rmg-sliders-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-sliders-title">
              Sliders
            </h2>
          </header>
          <h3 className="rmgLayouts__subheader">Engine</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              Slider motion runs on a <strong>fixed timestep</strong> with <strong>alpha interpolation</strong>, keeping the simulation stable while rendering smoothly across different refresh rates.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Interaction is powered by a custom <strong>DragTracker</strong> that samples recent movement, carries release velocity into snap resolution, and still treats a true stop as stillness. Flicks feel intentional without making tiny paused gestures accidentally advance.
            </p>

            <p className="leading-relaxed max-w-3xl">
              That release model avoids the common “flick into a wall” feeling: momentum continues through the handoff, then resolves into the final snap instead of abruptly dying on the current slide.
            </p>

            <p className="leading-relaxed max-w-3xl">
              <strong>Looping</strong> is handled by responsive clones plus vector rebasing. Clone counts scale from a minimum buffer to the number of cells visible in the viewport, so the loop seam has enough content to stay covered during fast drags.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Looping automatically disables when there is only one item or the content already fits inside the viewport, avoiding unnecessary clones when the track cannot actually scroll.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Video clones are non-interactive snapshots of the original slide rather than extra live players. Snapshots refresh as playback state changes, so looping video galleries stay visually coherent without running duplicate players.
            </p>
          </div>
          <h3 className="rmgLayouts__subheader !mt-6">Base Slider</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              By default, the Base Slider uses <strong>one cell per slide</strong>. When <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">groupCells</code> is enabled, the slider automatically groups cells based on what is visible inside the slider&apos;s viewport. As the slider&apos;s viewport resizes, slides are rebuilt so they stay accurate across breakpoints and layout changes. When looping is disabled, the final snap target clamps to the maximum scroll position so you never overshoot past the end of the track.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Many layout and presentation props support responsive customization out of the box. Properties like{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">layout.cellsPerSlide</code>,{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">layout.gap</code>, and the standalone{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">Skeleton</code> slider layout accept breakpoint-aware values.
            </p>

            <PageCodeBlock code={`// Using default breakpoint keys (xs / sm / md / lg / xl)
<Slider
  layout={{
    cellsPerSlide: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
    },
  }}
>
  {children}
</Slider>

// Using custom breakpoint values (explicit viewport widths)
<Slider
  layout={{
    cellsPerSlide: {
      0: 1,       // mobile
      640: 2,     // small tablets
      768: 3,     // tablets
      1024: 4,    // desktops
      1280: 5,    // large screens
    },
  }}
>
  {children}
</Slider>`} />

            <p className="leading-relaxed max-w-3xl">
              Any styling hook that accepts a <strong>className</strong> can be driven by your own stylesheets and media queries, including containers, viewports, thumbnail regions, controls, and individual thumbnail items.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Visual effects are first-class rather than plugin-only: <strong>parallax</strong>, <strong>scale</strong>, <strong>fade</strong>, and <strong>crossfade</strong> integrate directly with slider motion.
            </p>

            <p className="leading-relaxed max-w-3xl">
              For UI, you can use the built-in arrows, dots, progress, scrollbar, and ripple — or supply your own renderers and styles.
            </p>

            <p className="leading-relaxed max-w-3xl">
              The Base Slider exposes an imperative handle for advanced surfaces: move to an index, jump instantly, scroll next or previous, read progress, detect visible cells, and access the current root, viewport, container, and slide nodes.
            </p>

            <p className="leading-relaxed max-w-3xl">
              When Slider is used as the primary layout inside <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">GalleryCore</code>, the shared gallery API can manage the item list too, including append, prepend, insert, remove, replace, and set-all operations.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Wheel and trackpad input are handled by the core slider engine. It detects horizontal or vertical intent, preserves momentum, temporarily pauses <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">autoScroll</code>/<code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">autoPlay</code>, and respects scroll limits when <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">loop</code> is disabled.
            </p>

          </div>
          <h3 className="rmgLayouts__subheader !mt-6">Thumbnails Slider</h3>
            <div className="space-y-4 mt-4">
              <p className="leading-relaxed max-w-3xl">
                The Thumbnails Slider is a lightweight companion to the Base Slider. It reuses the same motion primitives, runs <strong>free-scroll by default</strong>, and can switch back to normal snap behavior when you want stricter navigation.
              </p>

              <p className="leading-relaxed max-w-3xl">
                It still supports <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">groupCells</code>, <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">loop</code>, and <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">skipSnaps</code>. Clicking a thumbnail animates the Base Slider to that index, and the active thumbnail can be centered when the strip has room to scroll.
              </p>

              <p className="leading-relaxed max-w-3xl">
                Thumbnails can be placed on <strong>any side</strong> of the gallery — <strong>top</strong>, <strong>right</strong>,{" "}
                <strong>bottom</strong>, or <strong>left</strong> — automatically switching between horizontal and vertical behavior. Width,
                height, container sizing, centering, and per-item styling are all configurable, so it can act like a minimal filmstrip or a
                fully styled navigation rail.
              </p>

              <p className="leading-relaxed max-w-3xl">
                Wheel and trackpad support are built in here too, following the thumbnail strip&apos;s active axis.
              </p>
            </div>
          <h3 className="rmgLayouts__subheader !mt-6">Fullscreen Slider</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              The Fullscreen Slider is a lighter snap-focused slider built for modal viewing. It shares the motion primitives without carrying every Base Slider layout option into fullscreen.
            </p>

            <p className="leading-relaxed max-w-3xl">
              It uses <strong>one fullscreen item per snap</strong>, loops by default when more than one slide exists, and keeps the runtime focused on inspection, navigation, and close behavior.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Horizontal drag is prioritized for slide changes, while vertical drag can become a natural “pull-to-close” gesture, including fade feedback tied to
              distance, plus a smooth snap-back when the close threshold isn&apos;t met.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Videos are treated as first-class slides: dragging doesn&apos;t trigger Plyr controls/events, and players near the active slide are automatically paused to prevent multiple players from running at once.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Fullscreen index changes can use normal scroll motion or crossfade requests, with duration and easing configurable when desired.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Wheel and trackpad input are built in, including the same optional crossfade wheel gesture used by the Base Slider.
            </p>
          </div>
          <h3 className="rmgLayouts__subheader !mt-6">Fullscreen Thumbnails Slider</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              The Fullscreen Thumbnails Slider is a lightweight <strong>wrapper around the Thumbnails Slider</strong>. It reuses the same thumbnail engine, but wires it directly into the
              fullscreen index system so thumbnails always stay in sync with the active fullscreen slide.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Under the hood it creates a dedicated <strong>index channel</strong> that listens to fullscreen events and instantly updates the thumbnail highlight/scroll position. Clicking a thumbnail then calls{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">fsSub.requestSet(idx, &apos;animated&apos;)</code> so fullscreen navigates with the normal snap animation.
            </p>

            <p className="leading-relaxed max-w-3xl">
              It also includes a small visibility layer for UI polish: the strip can fade and translate in or out via{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">visible</code> /{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">invisible</code>, with{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">pointerEvents</code> automatically disabled while hidden so it never blocks the fullscreen content.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Like the base thumbnail strip, it can sit on any side (<strong>top / right / bottom / left</strong>), supports centering for short rows, and exposes styling hooks for spacing, dimensions, and per-thumb className/style.
            </p>
          </div>
        </div>
      </section>
      <section className="rmgLayouts">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title">
              Grid
            </h2>
          </header>

          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              <strong>Grid</strong> is the direct-child layout for ordered gallery items. With no track config it builds an auto-fill grid from{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">minColumnWidth</code>; use{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">columns</code> for responsive equal-width tracks, or{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">templateColumns</code> for custom CSS Grid templates.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Reach for <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">columns</code> when you want a known track count: <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">columns=&#123;12&#125;</code> gives you a familiar 12-track grid for feature spans, while smaller responsive counts work well for simple rows. Use{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">templateColumns</code> for asymmetric columns, sidebar-style compositions, or breakpoint-specific track definitions. When both are present,{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">templateColumns</code> wins over <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">columns</code> and <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">minColumnWidth</code>.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Spans require explicit tracks. Wrap a child in <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">Grid.Item</code> and set <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">span</code> to a number, <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">&quot;full&quot;</code>, or a responsive map. In auto-fill <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">minColumnWidth</code> mode, spans are ignored because the track count is fluid.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Inside <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">GalleryCore</code>, each grid item can open fullscreen. Keep the default{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">fullscreenTrigger=&quot;media&quot;</code> to open from the clicked media node, or switch to{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">fullscreenTrigger=&quot;item&quot;</code> to make the full item shell interactive.
            </p>

            <PageCodeBlock code={`function GridGallery({ images }) {
  const { ref: gridRef, ready: gridReady } = useGridReady();

  return (
    <Skeleton
      ready={gridReady}
      layout={{
        radius: 14,
        layout: {
          kind: "grid",
          count: images.length,
          item: {
            kind: "rect",
            style: { aspectRatio: "4 / 5" },
          },
        },
      }}
      grid={{
        count: images.length,
        minColumnWidth: 220,
        gap: { 0: 10, 900: 18 },
      }}
    >
      <Grid
        ref={gridRef}
        minColumnWidth={220}
        gap={{ 0: 10, 900: 18 }}
        fullscreenTrigger="item"
        lazyLoad={{ enabled: true }}
      >
        {images.map((image) => (
          <img key={image.src} src={image.src} alt={image.alt} />
        ))}
      </Grid>
    </Skeleton>
  );
}`} />
          </div>
</div>
      </section>

      <section className="rmgLayouts">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title">
              Masonry
            </h2>
          </header>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              <strong>Masonry</strong> is built for galleries whose cards resolve to different heights. It renders from a deterministic, server-predicted track model, then measures live items and refines placement as images, videos, text, and responsive spans settle.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Use <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">placement=&quot;balanced&quot;</code> to pack each card into the shortest fitting column group,{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">roundRobin</code> for deterministic column cycling, or{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">horizontalOrder</code> when wide cards should still read in a stronger left-to-right sequence. Live content stays hidden until the current item set has produced a real measurement pass, so visible placement is based on actual card geometry rather than height guesses.
            </p>

            <p className="leading-relaxed max-w-3xl">
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">Masonry.Item</code> carries per-card layout metadata. A card can span multiple tracks, span{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">&quot;full&quot;</code>, change span by breakpoint, and add wrapper class or style overrides while the placement engine clamps wide cards to the active column count.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Pair Masonry with the standalone <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">Skeleton</code> wrapper when you want a loading state. The Skeleton core is Masonry-aware: ratios or explicit heights seed card rhythm, structured slots can override spans and placeholder trees, and the real Masonry layout still owns measurement and readiness.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Masonry also keeps the shared gallery contracts: arbitrary React children, intro reveal, fullscreen triggers from the media node or whole item shell, root and item class hooks, <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">rootRef</code>, and a custom root element via{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">as</code>.
            </p>

            <PageCodeBlock code={`function MasonryGallery({ cards }) {
  const { ref: masonryRef, ready: masonryReady } = useMasonryReady();

  return (
    <Skeleton
      ready={masonryReady}
      layout={{
        ratios: [55, 90, 130, 75],
        radius: 12,
        layout: {
          kind: "masonry",
          item: {
            kind: "rect",
            style: { width: "100%", height: "100%" },
          },
          slots: [{ span: { 0: "full", 1100: 2 } }],
        },
      }}
      masonry={{
        count: cards.length,
        columns: { 0: 1, 700: 2, 1100: 3 },
        gap: { 0: 12, 1100: 20 },
        placement: "balanced",
      }}
    >
      <Masonry
        ref={masonryRef}
        columns={{ 0: 1, 700: 2, 1100: 3 }}
        gap={{ 0: 12, 1100: 20 }}
        placement="balanced"
        lazyLoad={{ enabled: true }}
      >
        {cards.map((card) => (
          <Masonry.Item key={card.id} span={card.featured ? { 0: "full", 1100: 2 } : 1}>
            <img src={card.src} alt={card.alt} />
          </Masonry.Item>
        ))}
      </Masonry>
    </Skeleton>
  );
}`} />
          </div>
</div>
      </section>
      <section className="rmgLayouts">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title">
              Entries
            </h2>
          </header>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              <strong>Entries</strong> is the structured-data surface for record-driven galleries. Instead of rendering anonymous children, you pass records with arbitrary fields plus a{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">media</code> array, then shape the row with{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">render.card</code>, render each media item with{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">render.media</code>, and render fullscreen entry context with{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">render.overlay</code>. That makes it a natural fit for product and customer reviews, editorial feeds, case studies, or any UI where the media belongs to a richer record.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Each entry&apos;s media can be laid out as a slider, grid, or masonry block through{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">renderMediaContainer</code>. Under the hood, the runtime flattens every entry&apos;s media into one fullscreen index space while preserving the entry and local media index for each slide.
            </p>

            <p className="leading-relaxed max-w-3xl">
              That ownership model is what makes fullscreen overlays, scroll-to-entry close behavior, and per-entry slider synchronization work without forcing your base UI into a rigid schema.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Entry loading uses two IntersectionObserver windows. <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">nearMargin</code> mounts the row and starts media work before it reaches the viewport, while <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">viewMargin</code> and <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">threshold</code> mark the actual reveal gate. With <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">waitForDecode</code> enabled, an entry with trackable media stays on its skeleton until every tracked media URL has loaded and decoded; the current entry-level gate tracks image media and falls back at the decode timeout.
            </p>

            <p className="leading-relaxed max-w-3xl">
              The fade-in order follows readiness, not just DOM order. Rows become revealable when their in-view gate and decode gate are both satisfied, then receive the next intro delay slot based on when they actually finished loading. Fast entries can fade in while slower entries keep their skeleton layer visible.
            </p>

            <p className="leading-relaxed max-w-3xl">
              The fullscreen close path uses the same readiness contract. If someone opens fullscreen, navigates to a slide owned by an entry they have not viewed yet, and closes from there, React Motion Gallery resolves the slide back to its owner entry, shows a temporary loading spinner while that entry mounts and decodes, scrolls the row into view, forces the skeleton and content layers into their final revealed state, and only then runs the close animation back to the now-visible media.
            </p>

            <PageCodeBlock code={`const flat = flattenEntries(entries);

<GalleryCore layout="entries" fullscreenItems={flat.flattenedMedia}>
  <Entries
    entries={{
      items: entries,
      mediaLayout: "grid",
      render: {
        card: ({ entry, media }) => (
          <article className="entryCard">
            <h3>{entry.title}</h3>
            <p>{entry.excerpt}</p>
            {media}
          </article>
        ),
        overlay: ({ entry, opacity, style, containerProps }) => (
          <div {...containerProps} style={{ ...style, opacity }}>
            <strong>{entry.title}</strong>
          </div>
        ),
      },
      loading: {
        enabled: true,
        waitForDecode: true,
      },
    }}
    renderMediaContainer={({ mediaNodes }) => (
      <Grid columns={{ 0: 1, 800: 2 }} gap={12}>
        {mediaNodes}
      </Grid>
    )}
  />
</GalleryCore>`} />
          </div>
        </div>
      </section>
      <section className="rmgLayouts" aria-labelledby="rmg-video-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-video-title">
              Video
            </h2>
          </header>

          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              <strong>Video</strong> is the gallery-aware, Plyr-backed primitive you can use standalone, inside one of the four primary layouts (<strong>Slider</strong>, <strong>Grid</strong>, <strong>Masonry</strong>, or <strong>Entries</strong>), or in fullscreen flows. It can build a default MP4 Plyr source from{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">src</code> and{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">poster</code>, accept a full Plyr source, or use a{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">sourceBuilder</code>; player options can be fixed or resolved from{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">{"{ src, index }"}</code>. Plyr mounts lazily by default, uses{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">preload: &quot;none&quot;</code> unless autoplay is enabled, and exposes a replaceable video spinner.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Looping sliders and fullscreen clone/crossfade previews render non-interactive snapshots instead of extra live players. HTML5/MP4 snapshots can refresh from the current frame and control state, while YouTube and Vimeo fall back to poster-backed snapshots. That keeps loop and transition previews visually coherent without duplicating playback, controls, or network work.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Fullscreen coordinates the base and fullscreen players: the base player is suspended while fullscreen is open, offscreen fullscreen players are paused, inactive/lazy video slides can stay static until needed, and drag/post-drag events are guarded around Plyr controls. Fullscreen lazy loading is split between{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">lazyLoad.images</code> and{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">lazyLoad.videos</code>, while standalone{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">Video</code> keeps its own{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">lazyLoad</code> controls.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Video support is optional. If you never render <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">Video</code>, you do not need the <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">plyr</code> or{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">plyr-react</code> peer dependencies.
            </p>

            <PageCodeBlock code={`<div style={{ width: "100%", aspectRatio: "16 / 9" }}>
  <Video
    src="/trailers/lookbook.mp4"
    poster="/trailers/lookbook-poster.jpg"
    options={({ index }) => ({
      controls: ["play", "progress", "mute", "fullscreen"],
      ratio: "16:9",
    })}
    lazyLoad={{
      enabled: true,
      spinner: ({ kind }) => <Spinner label={kind} />,
    }}
  />
</div>`} />
          </div>
        </div>
      </section>
      <section className="rmgLayouts" aria-labelledby="rmg-loading-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-loading-title">
              Skeletons
            </h2>
          </header>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              <strong>Slider</strong>, <strong>Grid</strong>, and <strong>Masonry</strong> now keep loading UI outside the layout runtime. Compose them with <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">Skeleton</code> and the matching readiness hook: <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">useSliderReady</code>, <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">useGridReady</code>, or <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">useMasonryReady</code>. Entries and thumbnails still keep their specialized loading layers because they own row/thumbnail-specific viewport behavior.
            </p>

            <p className="leading-relaxed max-w-3xl">
              During development, <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">Skeleton.force</code> can keep the skeleton layer visible for visual comparison. Pass an object with <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">enabled</code>, <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">showContent</code>, and <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">skeletonOpacity</code> to preview the ready UI underneath a translucent skeleton, making spacing, text bars, and layout drift easy to spot before shipping.
            </p>

            <p className="leading-relaxed max-w-3xl">
              The shared <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">Skeleton.timing</code> controls make skeletons feel intentional instead of flickery. <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">minVisibleMs</code> keeps the loading layer on screen for a minimum amount of time before it can exit, while <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">exitMs</code> controls the fade-out duration and how long the exiting layer remains mounted once real content is ready.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Slider, Grid, and Masonry skeleton layouts use a small composable node DSL with shapes like{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">rect</code>,{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">circle</code>,{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">text</code>,{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">row</code>, and{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">stack</code>. Masonry adds a layout-aware spec on top: ratios or explicit heights seed card rhythm, placement follows the same balanced, round-robin, or horizontal-order model as the real layout, and per-slot overrides can change spans, wrapper styling, heights, ratios, or the placeholder tree itself.
            </p>

            <p className="leading-relaxed max-w-3xl">
              During skeleton development, the browser-measured text workflow can scan a live page in headless Chrome and generate the exact{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">lines</code>,{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">barWidth</code>,{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">lastBarWidth</code>, and text metric values (<code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">barHeight</code>, <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">lineHeight</code>) used by skeleton{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">text</code> nodes. That keeps responsive cards, entries, equal-height sliders, and reflow-sensitive masonry placeholders aligned with the real content instead of hand-guessed bars.
            </p>

            <p className="leading-relaxed max-w-3xl">
              The browser manifest can define the viewport scan range with <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">viewportMin</code> and <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">viewportMax</code>, set the scan height with <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">viewportHeight</code>, and split work across multiple browser pages with <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">viewportWorkers</code>. You can have an AI agent add selectors, write the manifest, run the generator, and wire the generated sidecar with a simple prompt, or run the script yourself to produce the same <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">.skeleton-text.generated.ts</code> module.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Entry loading is intentionally different because rows use two observer windows instead of a single fade-in. <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">nearMargin</code> mounts the row and starts image decode before it reaches the viewport, <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">viewMargin</code> records when the row has actually entered view, and <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">threshold</code>, <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">waitForDecode</code>, and <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">decodeTimeoutMs</code> decide when the skeleton can hand off to content.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Each entry can reserve row height with <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">loading.minHeight</code>, resolve a shared or per-entry structured skeleton from <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">loading.skeleton</code>, override the skeleton with <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">render.skeleton</code>, style the wrapper with <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">loading.skeletonWrap</code>, and tune force/compare states with <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">loading.force</code>.
            </p>

            <PageCodeBlock code={`const { ref: sliderRef, ready: sliderReady } = useSliderReady();

<Skeleton
  ready={sliderReady}
  force={{ enabled: false, showContent: true, skeletonOpacity: 0.45 }}
  timing={{ minVisibleMs: 220, exitMs: 600 }}
  layout={{
    mode: "fit",
    visibleCount: { 0: 1, 900: 3 },
    layout: {
      kind: "slider",
      count: 3,
      item: {
        kind: "stack",
        children: [
          { kind: "rect", style: { aspectRatio: "4 / 5" } },
          {
            kind: "text",
            barHeight: 16,
            lineHeight: 1.35,
            lines: { 0: 2, 900: 1 },
            lastBarWidth: "56%",
            style: { width: "88%" },
          },
        ],
      },
    },
  }}
>
  <Slider ref={sliderRef}>{slides}</Slider>
</Skeleton>

<Entries
  entries={{
    items: entries,
    loading: {
      enabled: true,
      minHeight: 320,
      nearMargin: "700px 0px",
      waitForDecode: true,
    },
  }}
  renderMediaContainer={({ mediaNodes }) => <Grid>{mediaNodes}</Grid>}
/>`} />
          </div>
</div>
      </section>
          <section className="rmgLayouts" aria-labelledby="rmg-loading-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-loading-title">
              Lazy Load
            </h2>
          </header>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              The shared <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">lazyLoad</code> API stays intentionally small: enable it, keep the built-in spinner, or replace that spinner with your own React node or resolver based on{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">{`{ kind, isClone }`}</code>.
            </p>

            <p className="leading-relaxed max-w-3xl">
              That same shape is used by Slider, Grid, Masonry, and Video. Fullscreen splits the configuration into{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">lazyLoad.images</code> and{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">lazyLoad.videos</code> so you can tune image and video behavior independently.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Fullscreen lazy loading runs in two stages. Base viewport visibility preloads the matching fullscreen media early, while fullscreen index changes decide which canonical slide is allowed to mount or apply its source. Images keep decoded media warm after first reveal; videos can be prewarmed from their poster/source and then force-mounted so navigation lands on prepared media instead of a blank fullscreen slide.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Entries does not expose a top-level lazy-load prop because entry rows already have viewport/decode gating. If you want per-item lazy behavior inside an entry, apply{" "}
              <code className="rounded bg-[rgba(var(--rmg-logo-cyan-rgb),0.6)] px-1 py-0.5 text-sm">lazyLoad</code> to the embedded Grid, Masonry, Slider, or Video components you render inside that entry.
            </p>

            <PageCodeBlock code={`<Slider lazyLoad={{ enabled: true, spinner: true }} />

<Grid
  lazyLoad={{
    enabled: true,
    spinner: ({ kind }) => <Spinner label={kind} />,
  }}
/>

<Video lazyLoad={{ enabled: true }} />

useFullscreenController({
  fullscreen: {
    enabled: true,
    lazyLoad: {
      images: { enabled: true },
      videos: { enabled: true, spinner: false },
    },
  },
});`} />
          </div>
        </div>
      </section>
    </main>
  );
}
