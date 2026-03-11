'use client'

import { FsDiagramWithCaptionRight, FsDiagramWithEntriesOverlayBottom, FsDiagramWithThumbs } from "./components/svgDiagrams";

export default function Home() {

  return (
    <> 
      <p className="home-intro">
        <span className="intro-line">
          A high-performance gallery library with fluid motion,
          responsive layouts, seamless transitions, and immersive fullscreen experiences.
        </span>

        <span className="intro-subline">
          Engineered to be modular, feature-rich, and production-ready — yet remarkably easy to use.
        </span>
      </p>
      <section className="rmgLayouts" aria-labelledby="rmg-layouts-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-layouts-title">
              Four Primary Layouts
            </h2>
            <p className="rmgCard__desc max-w-125">
              All layouts share fully customizable breakpoints, loading states, intro animations and fullscreen transitions.
            </p>
          </header>

          <div className="rmgLayouts__grid" role="list">
            {/* Slider */}
            <article className="rmgCard" role="listitem">
              <div className="rmgCard__top">
                <h3 className="rmgCard__title">Slider</h3>
                <p className="rmgCard__desc">
                  Powered by a robust animation engine with an extensive API and baked in wheel support.
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
                  Simplified CSS-Grid system that resolves columns from breakpoints or minmax.
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
                  JS based Pinterest-style layout with various placement and styling options.
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
                  Content blocks for arbitrary markup and embedded media (slider, grid or masonry).
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
              A fullscreen carousel featuring composable UI layers and shared context with the base layout.
            </p>
          </header>
          <div style={{ marginBottom: '20px' }}></div>
          <section className="space-y-10 text-slate-700">
            <h3 className="rmgLayouts__subheader">Content &amp; Navigation Layers</h3>

            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Captions */}
                <div className="rmgCard">
                  <div className="rmgCard__top">
                    <h4 className="rmgCard__title">Captions</h4>
                    <p className="rmgCard__desc">
                      Slide-bound UI regions that participate in slide layout.
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
                      Visual navigation and media indexing with full control over placement, sizing, alignment, and styling.
                    </p>
                  </div>

                  <div className="w-full max-w-125 mx-auto pt-6">
                    {FsDiagramWithThumbs()}
                  </div>
                </div>

                {/* Entry Overlays */}
                <div className="rmgCard">
                  <div className="rmgCard__top">
                    <h4 className="rmgCard__title">Entry Overlays</h4>
                    <p className="rmgCard__desc">
                      Overlay-based UI regions that sit above the carousel.
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
                <li className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm font-medium">Top</li>
                <li className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm font-medium">Right</li>
                <li className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm font-medium">Bottom</li>
                <li className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm font-medium">Left</li>
              </ul>

              <p className="font-medium">
                <span className="font-extrabold">You can mix and match freely,</span>
                <span className="ml-1">and combine them in any configuration.</span>
              </p>
            </div>

            <h4 className="rmgLayouts__h4">Using the Caption Layout as an Entry Surface</h4>

            <div className="space-y-6">
              <p className="leading-relaxed max-w-3xl">
                The captions system can also be used purely as a layout surface,
                even when no caption content is provided.
              </p>

              <p className="font-medium">You can configure caption placement and sizing:</p>

              <pre className="rounded-lg bg-slate-800 text-slate-100 p-4 text-sm overflow-x-auto max-w-3xl">
                <code>{`fullscreenCaptionPlacement?: 'top' | 'right' | 'bottom' | 'left';
fullscreenCaptionWidth?: number;
fullscreenCaptionHeight?: number;`}</code>
              </pre>

              <p className="leading-relaxed max-w-3xl">
                and then manually position an entry overlay inside that caption region,
                effectively reusing the caption block as a structured layout container.
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
                <li><strong>Fade</strong> transition</li>
              </ul>

              <p className="leading-relaxed max-w-3xl">
                Transition duration and easing are fully customizable,
                with <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">0ms</code> producing an instant slide change.
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
                    lands correctly and preventing fullscreen media from “flying” out of the viewport.
                  </li>
                  <li>
                    <strong>Grid / Masonry:</strong> On close, the page scrolls to center the corresponding thumb in the viewport so the
                    fullscreen-to-thumb transform always resolves cleanly.
                  </li>
                  <li>
                    <strong>Entries:</strong> On close, the page scroll centers the owning entry (the entry that contains the media),
                    so the fullscreen media returns to the correct context every time.
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
                  The opening and closing transitions originate directly from the thumbnail&apos;s visible crop, animating both the clip-path and the image in perfect sync to create a seamless, cinematic morph into fullscreen. Transitions can be <strong>transform-based</strong> (default) or a <strong>fade</strong> effect.
                  Duration and easing are customizable for both, with <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">0ms</code> producing an instant change.
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

            <h3 className="rmgLayouts__subheader">Rendering Fullscreen Media</h3>
            <div className="space-y-6 mt-6">
              <p className="leading-relaxed max-w-3xl">
                Fullscreen rendering is driven by a dedicated media list, which keeps your base layout and fullscreen experience intentionally <strong>decoupled</strong>.
              </p>

              <p className="leading-relaxed max-w-3xl">
                You can provide a simple list of URLs or supply fully structured media items with metadata.
              </p>

              <p className="leading-relaxed max-w-3xl">
                The base layout can render anything while fullscreen can render the best possible media for zooming. The only shared connection is the <strong>index</strong>, which keeps navigation, thumbnails, and transitions perfectly aligned.
              </p>

              <p className="leading-relaxed max-w-3xl">
                If you want Next.js image optimization in fullscreen, render your
                own <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">Image</code> via{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">fullscreen.renderImage</code>.
                To opt custom renders into the built-in fullscreen spinner and
                decode flow, also enable{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">fullscreen.lazyLoad.images.enabled</code>.
              </p>

              <pre className="rounded-lg bg-slate-800 text-slate-100 p-4 text-sm overflow-x-auto max-w-3xl">
                <code>{`import Image from "next/image";

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
}`}</code>
              </pre>
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
              Animations run on a <strong>fixed timestep</strong> with <strong>alpha interpolation</strong>, so motion stays consistent across devices with different refresh rates.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Interaction is powered by a custom <strong>DragTracker</strong> that treats even the tiniest directional velocity as an intentional slide change, giving the slider an effortless feel. At the same time, a stillness guard prevents slide changes when the gesture ends in a true stop.
            </p>

            <p className="leading-relaxed max-w-3xl">
              DragTracker solves a common slider issue where momentum abruptly “hits a wall” or stays on the same slide after a flick. It always maintains continuous velocity across the release phase, allowing momentum to resolve cleanly into the final snap.
            </p>

            <p className="leading-relaxed max-w-3xl">
              <strong>Looping</strong> is powered by a responsive clone + vector rebase system.
            </p>

            <p className="leading-relaxed max-w-3xl">
              The Loop engine solves a common loop artifact where sliders briefly reveal empty gaps at the seam. The engine prevents that in two ways: it enforces a minimum of two clones per side, and it scales the clone count to match how many cells are visible inside the slider&apos;s viewport. The result is a loop that always has enough “buffer” content to fill the viewport, even during fast flicks.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Video slide clones are non-interactive snapshots of their original slides rather than second live players. Each snapshot is refreshed from the original player whenever it becomes ready or changes media state, including play, pause, seek, end, and media load events.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Loop is automatically disabled if the content width is less than or equal to the viewport width or if there is only one item in the slider.
            </p>
          </div>
          <h3 className="rmgLayouts__subheader !mt-6">Base Slider</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              By default, the Base Slider uses <strong>one cell per slide</strong>. When <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">groupCells</code> is enabled, the slider automatically groups cells based on what is visible inside the slider&apos;s viewport. As the slider&apos;s viewport resizes, slides are rebuilt so they stay accurate across breakpoints and layout changes. When looping is disabled, the final snap target clamps to the maximum scroll position so you never overshoot past the end of the track.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Many layout and presentation props support responsive customization out of the box. Properties like{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">cellsPerSlide</code>,{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">gap</code>, and{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">skeletonCount</code> accept breakpoint-aware values.
            </p>

            <pre className="rounded-lg bg-slate-800 text-slate-100 p-4 text-sm overflow-x-auto max-w-3xl">
              <code>{`// Using default breakpoint keys (xs / sm / md / lg / xl)
<Gallery
  cellsPerSlide={{
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  }}
>
  {children}
</Gallery>

// Using custom breakpoint values (explicit viewport widths)
<Gallery
  cellsPerSlide={{
    0: 1,       // mobile
    640: 2,     // small tablets
    768: 3,     // tablets
    1024: 4,    // desktops
    1280: 5,    // large screens
  }}
>
  {children}
</Gallery>`}</code>
</pre>

            <p className="leading-relaxed max-w-3xl">
              In addition, any prop that accepts a <strong>ClassName</strong> can be fully customized through your own stylesheets, giving you complete control over responsive behavior using standard CSS media queries. This includes containers, viewports, thumbnail regions, and individual thumbnail items.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Visual polish is built in — no plugins required. Effects like <strong>parallax</strong>, <strong>scale</strong>, and{" "} <strong>fade</strong> integrate directly with the motion engine.
            </p>

            <p className="leading-relaxed max-w-3xl">
              For UI, you can use the built-in arrows, dots, progress, and ripple — or supply your own renderers and styles.
            </p>

            <p className="leading-relaxed max-w-3xl">
              The Base Slider also exposes a powerful imperative API for advanced experiences: scroll to any index, jump instantly, read progress, detect which cells are in view, and even <strong>append / prepend / insert / remove / replace</strong> slides at runtime. It&apos;s perfect for product galleries, feeds, or any UI that needs to update dynamically without rebuilding the whole component.
            </p>

            <p className="leading-relaxed max-w-3xl">
              React Motion Gallery includes native <strong>wheel and trackpad scrolling</strong> support built directly into the Base Slider.
              Unlike most slider libraries that require an external plugin or adapter, wheel input is handled by the core engine itself.
              Horizontal/Vertical intent is detected automatically, momentum is preserved, and scrolling integrates seamlessly with other gesture interactions.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Trackpad gestures feel natural and responsive, with built-in safeguards to prevent accidental page scrolling while interacting with the slider. Wheel interaction temporarily pauses <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">autoScroll</code>/<code className="rounded bg-slate-100 px-1 py-0.5 text-sm">autoPlay</code> and respects scroll limits when <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">loop</code> is disabled.
            </p>

          </div>
          <h3 className="rmgLayouts__subheader !mt-6">Thumbnails Slider</h3>
            <div className="space-y-4 mt-4">
              <p className="leading-relaxed max-w-3xl">
                The Thumbnails Slider is a purpose-built, lightweight companion to the Base Slider. It reuses the same core motion engine and is <strong>free-scroll by default</strong>. Free-scroll can be disabled for normal snap behavior.
              </p>

              <p className="leading-relaxed max-w-3xl">
                Even though it&apos;s light, thumbnails slider still offers options for groupCells, loop and skipSnaps.
                Clicking a thumbnail triggers the Base Slider to animate to the selected index, and centers the active thumb when appropriate.
              </p>

              <p className="leading-relaxed max-w-3xl">
                Thumbnails can be placed on <strong>any side</strong> of the gallery — <strong>top</strong>, <strong>right</strong>,{" "}
                <strong>bottom</strong>, or <strong>left</strong> — automatically switching between horizontal and vertical behavior. Width,
                height, container sizing, centering, and per-item styling are all configurable, so it can act like a minimal filmstrip or a
                fully styled navigation rail.
              </p>

              <p className="leading-relaxed max-w-3xl">
                Has built-in wheel/trackpad support.
              </p>
            </div>
          <h3 className="rmgLayouts__subheader !mt-6">Fullscreen Slider</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              The Fullscreen Slider is also a lighter version of the Base Slider and uses the same core motion engine.
            </p>

            <p className="leading-relaxed max-w-3xl">
              It supports{" "}
              <strong>normal snap-only behavior</strong> (one media item per snap) to keep bundle size and runtime overhead low.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Looping is default behavior and it&apos;s only disabled when there is one slide.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Horizontal drag is prioritized for slide changes, while vertical drag can be used for a natural “pull-to-close” gesture — including fade feedback tied to
              distance, plus a smooth snap-back when the close threshold isn&apos;t met.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Videos are treated as first-class slides: dragging doesn&apos; trigger Plyr controls/events, and media near the active slide is automatically paused to prevent multiple players from running at once.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Optional slide fading can be enabled so index changes can crossfade instead of translating when desired.
            </p>

            <p className="leading-relaxed max-w-3xl">
              The fullscreen slider automatically adopts RTL mode if it&apos;s enabled in the Base Slider.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Has built-in wheel/trackpad support.
              </p>
          </div>
          <h3 className="rmgLayouts__subheader !mt-6">Fullscreen Thumbnails Slider</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              The Fullscreen Thumbnails Slider is a lightweight <strong>wrapper around the Thumbnails Slider</strong>. It reuses the exact same small, thumbnail engine (to avoid duplicating slider logic), but wires it directly into the
              fullscreen index system so thumbnails always stay in sync with the active fullscreen slide.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Under the hood it creates a dedicated <strong>index channel</strong> that listens to fullscreen events and instantly updates the thumbnail highlight/scroll position. Clicking a thumbnail then calls{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">fsSub.requestSet(idx, &apos;animated&apos;)</code> so fullscreen navigates with the normal snap animation.
            </p>

            <p className="leading-relaxed max-w-3xl">
              It also includes a built-in “polish layer” for UI: the entire strip can be faded and slightly translated in/out via{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">visible</code> /{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">invisible</code>, with{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">pointerEvents</code> automatically disabled while hidden so it never blocks the fullscreen media.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Like the base thumbnail strip, it can be positioned on any side (<strong>top / right / bottom / left</strong>), supports centering for “short” thumbnail rows, and exposes styling hooks for spacing, dimensions, and per-thumb className/style.
            </p>
          </div>
        </div>
      </section>
      <section className="rmgLayouts" aria-labelledby="rmg-layout-details-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-layout-details-title">
              Grid, Masonry, and Entries
            </h2>
            <p className="rmgCard__desc max-w-140">
              Three non-slider surfaces cover clean grids, waterfall layouts, and structured editorial feeds while still plugging into the same fullscreen and transition system.
            </p>
          </header>

          <h3 className="rmgLayouts__subheader">Grid</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              <strong>Grid</strong> is the simplest direct-child layout. Render your items in order, let the component auto-fit with{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">minColumnWidth</code>, or lock in explicit column counts per breakpoint with{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">columns</code>.
            </p>

            <p className="leading-relaxed max-w-3xl">
              It stays very close to native CSS Grid behavior, which makes it ideal for product walls, image boards, lookbooks, and any gallery where consistent rows matter more than scroll physics.
            </p>

            <p className="leading-relaxed max-w-3xl">
              When Grid is used inside <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">GalleryCore</code>, every item can still open fullscreen. You can decide whether the trigger should come from the clicked media node or the full item shell via{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">fullscreenTrigger=&quot;media&quot; | &quot;item&quot;</code>.
            </p>

            <pre className="rounded-lg bg-slate-800 text-slate-100 p-4 text-sm overflow-x-auto max-w-3xl">
              <code>{`<Grid
  minColumnWidth={220}
  gap={{ 0: 10, 900: 18 }}
  fullscreenTrigger="item"
  lazyLoad={{ enabled: true }}
  loading={{
    enabled: true,
    skeleton: {
      radius: 14,
      layout: {
        kind: "grid",
        count: 6,
        item: {
          kind: "rect",
          style: { aspectRatio: "4 / 5" },
        },
      },
    },
  }}
>
  {images.map((image) => (
    <img key={image.src} src={image.src} alt={image.alt} />
  ))}
</Grid>`}</code>
            </pre>
          </div>

          <h3 className="rmgLayouts__subheader !mt-6">Masonry</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              <strong>Masonry</strong> is the waterfall layout for uneven media. It uses measured item heights rather than pure CSS columns, so it can keep columns balanced as images settle and aspect ratios vary.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Use <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">placement=&quot;balanced&quot;</code> when you want visually even columns, or switch to{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">roundRobin</code> when preserving a simple left-to-right distribution matters more than balance.{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">estimatedItemHeight</code> gives the layout a better first guess before measurements settle.
            </p>

            <p className="leading-relaxed max-w-3xl">
              The component also exposes root, column, and item class hooks, a custom root element via{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">as</code>, and the same lazy-load, loading, intro, and fullscreen integration used by the other layouts.
            </p>

            <pre className="rounded-lg bg-slate-800 text-slate-100 p-4 text-sm overflow-x-auto max-w-3xl">
              <code>{`<Masonry
  columns={{ 0: 1, 700: 2, 1100: 3 }}
  gap={{ 0: 12, 1100: 20 }}
  placement="balanced"
  estimatedItemHeight={280}
  lazyLoad={{ enabled: true }}
  loading={{
    enabled: true,
    skeleton: {
      ratios: [55, 90, 130, 75],
      radius: 12,
    },
  }}
>
  {cards.map((card) => (
    <img key={card.id} src={card.src} alt={card.alt} />
  ))}
</Masonry>`}</code>
            </pre>
          </div>

          <h3 className="rmgLayouts__subheader !mt-6">Entries</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              <strong>Entries</strong> is the structured-data surface. Instead of rendering anonymous children, you pass records with arbitrary fields plus a{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">media</code> array, then decide how each entry should render through{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">render.card</code>,{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">render.media</code>, and{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">render.overlay</code>.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Each entry&apos;s media can be laid out as a slider, grid, or masonry block through{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">renderMediaContainer</code>. Under the hood, the runtime flattens entry media into one fullscreen index space while still preserving which entry owns each slide.
            </p>

            <p className="leading-relaxed max-w-3xl">
              That ownership model is what makes fullscreen overlays, close-to-origin scrolling, and per-entry slider synchronization all work without forcing your base UI into a rigid schema.
            </p>

            <pre className="rounded-lg bg-slate-800 text-slate-100 p-4 text-sm overflow-x-auto max-w-3xl">
              <code>{`const flat = flattenEntries(entries);

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
</GalleryCore>`}</code>
            </pre>
          </div>
        </div>
      </section>
      <section className="rmgLayouts" aria-labelledby="rmg-video-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-video-title">
              Video
            </h2>
            <p className="rmgCard__desc max-w-140">
              Video is treated as a first-class gallery primitive, not a bolted-on iframe or an afterthought inside image-only sliders.
            </p>
          </header>

          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              <strong>Video</strong> is a Plyr-backed component that can live inside <strong>Slider</strong>, <strong>Grid</strong>, <strong>Masonry</strong>, <strong>Entries</strong>, and fullscreen flows. You can pass a direct Plyr source, build one from{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">src</code>, or resolve player options per index.
            </p>

            <p className="leading-relaxed max-w-3xl">
              In looping sliders, cloned video slides are rendered as synchronized snapshots instead of duplicate live players. That keeps the seam visually continuous while avoiding multiple active players fighting over controls, playback state, or network work.
            </p>

            <p className="leading-relaxed max-w-3xl">
              In fullscreen, nearby inactive players are automatically paused, drag gestures are guarded so they do not leak into Plyr controls, and image/video lazy-loading can be configured independently.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Video support is optional. If you never render <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">Video</code>, you do not need the <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">plyr</code> or{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">plyr-react</code> peer dependencies at all.
            </p>

            <pre className="rounded-lg bg-slate-800 text-slate-100 p-4 text-sm overflow-x-auto max-w-3xl">
              <code>{`<div style={{ width: "100%", aspectRatio: "16 / 9" }}>
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
</div>`}</code>
            </pre>
          </div>
        </div>
      </section>
      <section className="rmgLayouts" aria-labelledby="rmg-loading-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-loading-title">
              Loading, Skeletons, and Lazy Media
            </h2>
            <p className="rmgCard__desc max-w-140">
              The library does not treat loading as one generic spinner. Each surface has a loading model that matches how that layout actually appears on screen.
            </p>
          </header>

          <h3 className="rmgLayouts__subheader">Skeleton Layers</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              <strong>Slider</strong>, <strong>Grid</strong>, <strong>Masonry</strong>, <strong>entries</strong>, and <strong>thumbnails</strong> each expose a dedicated loading layer. You can replace the whole thing with{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">renderLoading</code>, or use the built-in skeleton systems to describe placeholders that actually resemble your finished UI.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Slider and Grid skeletons use a small composable node DSL with shapes like{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">rect</code>,{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">circle</code>,{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">text</code>,{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">row</code>, and{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">stack</code>. Masonry uses a purpose-built skeleton spec based on ratios, explicit heights, placement mode, border radius, and shimmer settings so the placeholder already reads like a masonry wall.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Entry loading is intentionally different. Entry rows can reserve a minimum height, resolve a different skeleton per entry, preload before they enter view, and wait for image decode before revealing the real content. That makes feed-like UIs feel much more deliberate than a simple fade-in-on-load.
            </p>

            <pre className="rounded-lg bg-slate-800 text-slate-100 p-4 text-sm overflow-x-auto max-w-3xl">
              <code>{`<Slider
  transitions={{
    loading: {
      enabled: true,
      skeletonCount: { 0: 1, 900: 3 },
      skeleton: {
        mode: "fit",
        layout: {
          kind: "slider",
          count: 3,
          item: {
            kind: "stack",
            children: [
              { kind: "rect", style: { aspectRatio: "4 / 5" } },
              { kind: "text", fontSize: 16, lineHeight: 24, lines: 2 },
            ],
          },
        },
      },
    },
  }}
/>

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
/>`}</code>
            </pre>
          </div>

          <h3 className="rmgLayouts__subheader !mt-6">Shared Lazy Loading</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              The shared <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">lazyLoad</code> API stays intentionally small: enable it, keep the built-in spinner, or replace that spinner with your own React node or resolver based on{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">{`{ kind, isClone }`}</code>.
            </p>

            <p className="leading-relaxed max-w-3xl">
              That same shape is used by Slider, Grid, Masonry, and Video. Fullscreen splits the configuration into{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">lazyLoad.images</code> and{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">lazyLoad.videos</code> so you can tune each media type independently.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Entries does not expose a top-level lazy media prop because entry rows already have viewport/decode gating. If you want per-media lazy behavior inside an entry, apply{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">lazyLoad</code> to the embedded Grid, Masonry, Slider, or Video components you render inside that entry.
            </p>

            <pre className="rounded-lg bg-slate-800 text-slate-100 p-4 text-sm overflow-x-auto max-w-3xl">
              <code>{`<Slider lazyLoad={{ enabled: true, spinner: true }} />

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
});`}</code>
            </pre>
          </div>
        </div>
      </section>
    </>
  );
}
