/* eslint-disable @next/next/no-img-element */
'use client'

import { ChevronDown } from "lucide-react";
import {
  startTransition,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Entries,
  FullscreenThumbnailSlider,
  GalleryCore,
  Grid,
  Masonry,
  Slider,
  ThumbnailSlider,
  createSliderIndexChannel,
  flattenEntries,
  useFullscreenController,
  type EntriesOptions,
  type MediaItem,
} from "react-motion-gallery";
import styles from "./demos.module.css";

type StorySlide = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  copy: string;
};

type GridStory = {
  src: string;
  alt: string;
  title: string;
  label: string;
  copy: string;
};

type MasonryStory = {
  src: string;
  alt: string;
  title: string;
  label: string;
  height: number;
};

type DemoCategory = {
  id: string;
  label: string;
  description: string;
  demoIds: string[];
};

type DemoDefinition = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  focus: string;
  tags: string[];
  categoryId: string;
  Component: () => ReactElement;
};

function picsum(seed: string, width: number, height: number) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

function makeImage(
  seed: string,
  width: number,
  height: number,
  alt: string,
  caption?: ReactNode
): MediaItem {
  return {
    kind: "image",
    src: picsum(seed, width, height),
    alt,
    caption,
    width,
    height,
  };
}

const HERO_SLIDES: StorySlide[] = [
  {
    src: picsum("rmg-slider-atelier", 1600, 1100),
    alt: "Studio table with carefully arranged tools",
    eyebrow: "Studio Motion",
    title: "Atelier Sequence",
    copy: "A two-up slider with scaled inactive cells and a long-form editorial rhythm.",
  },
  {
    src: picsum("rmg-slider-loom", 1600, 1100),
    alt: "Textured fabric in warm afternoon light",
    eyebrow: "Surface Library",
    title: "Material Study",
    copy: "Responsive grouping keeps the layout dense on desktop without collapsing on mobile.",
  },
  {
    src: picsum("rmg-slider-forms", 1600, 1100),
    alt: "Sculptural objects stacked on neutral plinths",
    eyebrow: "Prototype 03",
    title: "Object Progression",
    copy: "The built-in progress bar makes longer carousels readable without adding visual clutter.",
  },
  {
    src: picsum("rmg-slider-archive", 1600, 1100),
    alt: "Open archival spreads across a wide table",
    eyebrow: "Archive Cut",
    title: "Reference Boards",
    copy: "Every slide stays full-bleed while the surrounding frame handles the composition.",
  },
];

const LOOKBOOK_ITEMS: GridStory[] = [
  {
    src: picsum("rmg-grid-1", 1200, 1440),
    alt: "Minimal living room with soft linen textures",
    title: "Quiet Layering",
    label: "Lookbook",
    copy: "Auto-fit columns for calm, consistent rows.",
  },
  {
    src: picsum("rmg-grid-2", 1200, 1440),
    alt: "Tailored coat hanging beside a metal chair",
    title: "Outerwear Edit",
    label: "Retail",
    copy: "Great for product walls and seasonal collections.",
  },
  {
    src: picsum("rmg-grid-3", 1200, 1440),
    alt: "Polished stone samples arranged in a fan",
    title: "Material Palette",
    label: "Spec",
    copy: "Responsive gaps keep the cadence sharp across breakpoints.",
  },
  {
    src: picsum("rmg-grid-4", 1200, 1440),
    alt: "Desk vignette with notebooks and camera gear",
    title: "Travel Desk",
    label: "Editorial",
    copy: "Use item or media fullscreen triggers when needed.",
  },
  {
    src: picsum("rmg-grid-5", 1200, 1440),
    alt: "Ceramic vessels on matte shelving",
    title: "Gallery Shelf",
    label: "Showcase",
    copy: "Simple grid behavior with gallery-specific polish.",
  },
  {
    src: picsum("rmg-grid-6", 1200, 1440),
    alt: "Muted fashion still life in side light",
    title: "Studio Notes",
    label: "Campaign",
    copy: "Ideal when row consistency matters more than scroll physics.",
  },
];

const MASONRY_ITEMS: MasonryStory[] = [
  {
    src: picsum("rmg-masonry-1", 1200, 1800),
    alt: "Architectural staircase with repeating shadows",
    title: "Lightwell",
    label: "Architecture",
    height: 360,
  },
  {
    src: picsum("rmg-masonry-2", 1200, 1380),
    alt: "Close crop of a woven textile hanging",
    title: "Textile Field",
    label: "Material",
    height: 290,
  },
  {
    src: picsum("rmg-masonry-3", 1200, 2100),
    alt: "Large format sketch pinned to a wall",
    title: "Pinned Draft",
    label: "Process",
    height: 420,
  },
  {
    src: picsum("rmg-masonry-4", 1200, 1650),
    alt: "Monochrome dining set against stone walls",
    title: "Dining Room",
    label: "Interior",
    height: 330,
  },
  {
    src: picsum("rmg-masonry-5", 1200, 1350),
    alt: "Books and notes scattered across a wooden bench",
    title: "Open Notes",
    label: "Research",
    height: 280,
  },
  {
    src: picsum("rmg-masonry-6", 1200, 1980),
    alt: "Tall portrait with deep blue styling",
    title: "Blue Study",
    label: "Portrait",
    height: 390,
  },
];

const THUMBNAIL_STORIES: StorySlide[] = [
  {
    src: picsum("rmg-thumb-1", 1600, 1100),
    alt: "Neutral-toned living area with sculptural seating",
    eyebrow: "Direction",
    title: "Lobby Mood",
    copy: "A shared index channel keeps the hero carousel and thumb rail locked together.",
  },
  {
    src: picsum("rmg-thumb-2", 1600, 1100),
    alt: "Brutalist hallway with striped light",
    eyebrow: "Sequence",
    title: "Corridor Study",
    copy: "Clicking a thumb animates the base slider and centers the active rail item.",
  },
  {
    src: picsum("rmg-thumb-3", 1600, 1100),
    alt: "Editorial still life with books and glassware",
    eyebrow: "Selection",
    title: "Prop Table",
    copy: "The companion rail is lightweight but still supports arrows, looping, and free-scroll.",
  },
  {
    src: picsum("rmg-thumb-4", 1600, 1100),
    alt: "Softly lit workspace with samples and sketches",
    eyebrow: "Indexing",
    title: "Sample Review",
    copy: "It works as a classic filmstrip or a larger navigation shelf depending on your sizing.",
  },
];

const FULLSCREEN_STORIES: StorySlide[] = [
  {
    src: picsum("rmg-fullscreen-1", 1800, 1200),
    alt: "Interior with large windows and warm wood tones",
    eyebrow: "Open State",
    title: "Window Bay",
    copy: "Open any slide to inspect the fullscreen caption column and synced thumbnail strip.",
  },
  {
    src: picsum("rmg-fullscreen-2", 1800, 1200),
    alt: "Editorial set with layered fabrics",
    eyebrow: "Caption Layer",
    title: "Textile Fold",
    copy: "Caption placement can shift sides while fullscreen thumbnails remain independently positioned.",
  },
  {
    src: picsum("rmg-fullscreen-3", 1800, 1200),
    alt: "Monochrome kitchen island with reflected light",
    eyebrow: "Shared Context",
    title: "Stone Kitchen",
    copy: "The fullscreen runtime stays decoupled from the base layout but shares the same index origin.",
  },
  {
    src: picsum("rmg-fullscreen-4", 1800, 1200),
    alt: "Tall gallery room with art and shadows",
    eyebrow: "Navigation Rail",
    title: "Gallery Room",
    copy: "The fullscreen thumbnail wrapper reuses the small base thumbnail engine instead of duplicating slider logic.",
  },
];

const EDITORIAL_ENTRIES: NonNullable<EntriesOptions["items"]> = [
  {
    id: "entry-atelier",
    category: "Field Note",
    title: "Atelier Walkthrough",
    excerpt:
      "Entries lets you keep narrative copy, metadata, and media tied together without flattening the UI into anonymous cards.",
    media: [
      makeImage("rmg-entry-1a", 1400, 1000, "Drafting tools and a sketchbook"),
      makeImage("rmg-entry-1b", 1400, 1000, "Close-up of stone samples on a desk"),
    ],
  },
  {
    id: "entry-hotel",
    category: "Site Visit",
    title: "Hotel Lobby Refresh",
    excerpt:
      "Each entry can choose its own media container, while fullscreen still understands which entry owns each slide.",
    media: [
      makeImage("rmg-entry-2a", 1400, 1000, "Lounge seating beneath a pendant fixture"),
      makeImage("rmg-entry-2b", 1400, 1000, "Warm-toned materials board against concrete"),
      makeImage("rmg-entry-2c", 1400, 1000, "Reception desk with layered stone textures"),
    ],
  },
];

const FULLSCREEN_ITEMS: MediaItem[] = FULLSCREEN_STORIES.map((slide) => ({
  kind: "image",
  src: slide.src,
  alt: slide.alt,
  width: 1800,
  height: 1200,
  caption: (
    <div className={styles.fullscreenCaption}>
      <span className={styles.fullscreenCaptionEyebrow}>{slide.eyebrow}</span>
      <strong className={styles.fullscreenCaptionTitle}>{slide.title}</strong>
      <p className={styles.fullscreenCaptionCopy}>{slide.copy}</p>
    </div>
  ),
}));

const DEMO_CATEGORIES: DemoCategory[] = [
  {
    id: "layouts",
    label: "Primary Layouts",
    description: "Core gallery surfaces for ordered, gridded, or editorial content.",
    demoIds: [
      "slider-spotlight",
      "grid-lookbook",
      "masonry-editorial",
      "entries-journal",
    ],
  },
  {
    id: "navigation",
    label: "Navigation Layers",
    description: "Synced rails and fullscreen navigation patterns.",
    demoIds: ["thumb-rail", "fullscreen-studio"],
  },
  {
    id: "states",
    label: "Loading States",
    description: "Built-in skeletons and layout-aware placeholders.",
    demoIds: ["loading-blueprint"],
  },
];

function SliderSpotlightDemo() {
  return (
    <Slider
      layout={{ gap: 16 }}
    >
      {HERO_SLIDES.map((slide) => (
        <figure key={slide.src} className={styles.mediaFigure}>
          <img src={slide.src} alt={slide.alt} className={styles.mediaImage} />
          <div className={styles.mediaShade} />
          <figcaption className={styles.mediaCaption}>
            <span className={styles.mediaEyebrow}>{slide.eyebrow}</span>
            <strong className={styles.mediaTitle}>{slide.title}</strong>
            <p className={styles.mediaBody}>{slide.copy}</p>
          </figcaption>
        </figure>
      ))}
    </Slider>
  );
}

function GridLookbookDemo() {
  return (
    <Grid
      columns={{ 0: 1, 760: 2, 1180: 3 }}
      gap={{ 0: 12, 1180: 18 }}
      intro={{
        staggerMs: 55,
        transform: "translateY(16px) scale(0.985)",
        durationMs: 380,
      }}
    >
      {LOOKBOOK_ITEMS.map((item) => (
        <article key={item.src} className={styles.gridCard}>
          <img src={item.src} alt={item.alt} className={styles.gridImage} />
          <div className={styles.gridCopy}>
            <span className={styles.gridBadge}>{item.label}</span>
            <strong className={styles.gridTitle}>{item.title}</strong>
            <p className={styles.gridBody}>{item.copy}</p>
          </div>
        </article>
      ))}
    </Grid>
  );
}

function MasonryEditorialDemo() {
  return (
    <Masonry
      columns={{ 0: 1, 820: 2, 1200: 3 }}
      gap={{ 0: 12, 1200: 18 }}
      placement="balanced"
      estimatedItemHeight={340}
    >
      {MASONRY_ITEMS.map((item) => (
        <figure key={item.src} className={styles.masonryFigure}>
          <img
            src={item.src}
            alt={item.alt}
            className={styles.masonryImage}
            style={{ height: item.height }}
          />
          <figcaption className={styles.masonryInfo}>
            <span className={styles.masonryLabel}>{item.label}</span>
            <strong className={styles.masonryTitle}>{item.title}</strong>
          </figcaption>
        </figure>
      ))}
    </Masonry>
  );
}

function EntriesFullscreenRuntime({ count }: { count: number }) {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
      effects: {
        introFade: true,
        slideFade: true,
        slideFadeDuration: 180,
      },
      controls: {
        counter: { enabled: true },
      },
    },
    sliderObject: {
      align: "start",
      direction: { dir: "ltr" },
    },
    cellsStateLength: count,
  });

  return <>{fullscreenNode}</>;
}

function EntriesJournalDemo() {
  const flat = flattenEntries(EDITORIAL_ENTRIES);

  return (
    <GalleryCore layout="entries" fullscreenItems={flat.flattenedMedia}>
      <Entries
        entries={{
          items: EDITORIAL_ENTRIES,
          mediaLayout: "grid",
          render: {
            card: ({ entry, media }) => (
              <article className={styles.entryCard}>
                <div className={styles.entryMeta}>
                  <span className={styles.entryLabel}>{entry.category}</span>
                  <h3 className={styles.entryTitle}>{entry.title}</h3>
                </div>
                <p className={styles.entryCopy}>{entry.excerpt}</p>
                {media}
              </article>
            ),
            media: ({ media, mediaIndex }) =>
              media.kind === "image" ? (
                <figure key={`${media.src}-${mediaIndex}`} className={styles.entryMedia}>
                  <img
                    src={media.src}
                    alt={media.alt ?? ""}
                    className={styles.entryMediaImage}
                  />
                </figure>
              ) : null,
            overlay: ({ entry, opacity, style, containerProps }) => (
              <div
                {...containerProps}
                className={[containerProps.className, styles.entryOverlay]
                  .filter(Boolean)
                  .join(" ")}
                style={{ ...style, opacity }}
              >
                <span>{entry.category}</span>
                <strong>{entry.title}</strong>
              </div>
            ),
          },
        }}
        fullscreen={{ enabled: true }}
        renderMediaContainer={({ mediaNodes }) => (
          <Grid columns={{ 0: 1, 780: 2 }} gap={{ 0: 10, 780: 12 }}>
            {mediaNodes}
          </Grid>
        )}
      />
      <EntriesFullscreenRuntime count={flat.flattenedMedia.length} />
    </GalleryCore>
  );
}

function ThumbRailDemo() {
  const [channel] = useState(() => createSliderIndexChannel());

  return (
    <div className={styles.syncStack}>
      <Slider
        indexChannel={channel}
        layout={{ gap: 14, cellsPerSlide: 1 }}
        scroll={{ loop: true }}
        effects={{ scale: { enabled: true, amount: 0.06 } }}
      >
        {THUMBNAIL_STORIES.map((slide) => (
          <figure key={slide.src} className={styles.mediaFigure}>
            <img src={slide.src} alt={slide.alt} className={styles.mediaImage} />
            <div className={styles.mediaShade} />
            <figcaption className={styles.mediaCaption}>
              <span className={styles.mediaEyebrow}>{slide.eyebrow}</span>
              <strong className={styles.mediaTitle}>{slide.title}</strong>
              <p className={styles.mediaBody}>{slide.copy}</p>
            </figcaption>
          </figure>
        ))}
      </Slider>

      <ThumbnailSlider
        indexChannel={channel}
        options={{
          layout: {
            position: "bottom",
            gap: 10,
            center: true,
            thumbnail: { width: 112, height: 72 },
          },
          scroll: {
            freeScroll: true,
            loop: true,
            centerActiveThumb: true,
          },
          controls: {
            enabled: true,
          },
        }}
      >
        {THUMBNAIL_STORIES.map((slide, index) => (
          <img
            key={`${slide.src}-${index}`}
            src={slide.src}
            alt={slide.alt}
            className={styles.thumbnailImage}
          />
        ))}
      </ThumbnailSlider>
    </div>
  );
}

function FullscreenStudioRuntime() {
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController({
    fullscreen: {
      enabled: true,
      effects: {
        introFade: true,
        slideFade: true,
        slideFadeDuration: 180,
      },
      controls: {
        counter: { enabled: true },
      },
      caption: {
        placement: "right",
        width: 300,
        breakpoint: 1080,
        render: ({ item }) => (item.kind === "image" ? item.caption : null),
      },
    },
    sliderObject: {
      align: "start",
      direction: { dir: "ltr" },
    },
    cellsStateLength: FULLSCREEN_ITEMS.length,
  });

  return (
    <>
      {fullscreenNode}
      <FullscreenThumbnailSlider
        bridge={fullscreenThumbnailBridge}
        items={FULLSCREEN_STORIES.map((slide) => ({
          thumbSrc: slide.src,
          alt: slide.alt,
        }))}
        position="bottom"
        thumbnailHeight={62}
        gap={10}
        thumbnailsCenter
        centerActiveThumb
        showArrows
      />
    </>
  );
}

function FullscreenStudioDemo() {
  return (
    <GalleryCore layout="slider" fullscreenItems={FULLSCREEN_ITEMS}>
      <Slider
        layout={{ gap: 16, cellsPerSlide: 1 }}
        controls={{ progress: { enabled: true } }}
        effects={{ scale: { enabled: true, amount: 0.04 } }}
      >
        {FULLSCREEN_STORIES.map((slide) => (
          <figure key={slide.src} className={styles.mediaFigure}>
            <img src={slide.src} alt={slide.alt} className={styles.mediaImage} />
            <div className={styles.mediaShade} />
            <figcaption className={styles.mediaCaption}>
              <span className={styles.mediaEyebrow}>{slide.eyebrow}</span>
              <strong className={styles.mediaTitle}>{slide.title}</strong>
              <p className={styles.mediaBody}>{slide.copy}</p>
            </figcaption>
          </figure>
        ))}
      </Slider>
      <FullscreenStudioRuntime />
    </GalleryCore>
  );
}

function LoadingBlueprintDemo() {
  return (
    <div className={styles.loadingStack}>
      <Grid
        columns={{ 0: 1, 760: 2, 1180: 3 }}
        gap={{ 0: 12, 1180: 16 }}
        loading={{
          enabled: true,
          force: true,
          skeleton: {
            radius: 18,
            backgroundColor: "#eff4fa",
            layout: {
              kind: "grid",
              count: 6,
              item: {
                kind: "stack",
                style: { gap: 12 },
                children: [
                  {
                    kind: "rect",
                    style: { aspectRatio: "4 / 5", borderRadius: 18 },
                  },
                  {
                    kind: "text",
                    fontSize: 15,
                    lineHeight: 22,
                    lines: 2,
                  },
                ],
              },
            },
          },
        }}
      >
        {LOOKBOOK_ITEMS.map((item) => (
          <article key={item.src} className={styles.gridCard}>
            <img src={item.src} alt={item.alt} className={styles.gridImage} />
            <div className={styles.gridCopy}>
              <span className={styles.gridBadge}>{item.label}</span>
              <strong className={styles.gridTitle}>{item.title}</strong>
              <p className={styles.gridBody}>{item.copy}</p>
            </div>
          </article>
        ))}
      </Grid>
      <p className={styles.loadingNote}>
        The loading layer is forced in this demo so you can inspect the built-in grid
        skeleton without waiting on artificial timers.
      </p>
    </div>
  );
}

const DEMOS: DemoDefinition[] = [
  {
    id: "slider-spotlight",
    title: "Slider Spotlight",
    eyebrow: "Base Slider",
    summary:
      "A polished two-up carousel showing grouped slides, progress feedback, and scale-based motion.",
    focus:
      "Use this when you need a hero gallery that feels editorial instead of purely utilitarian.",
    tags: ["slider", "responsive", "scale effect"],
    categoryId: "layouts",
    Component: SliderSpotlightDemo,
  },
  {
    id: "grid-lookbook",
    title: "Grid Lookbook",
    eyebrow: "Grid",
    summary:
      "A clean retail-style wall built with explicit responsive columns and subtle intro staging.",
    focus:
      "Grid is the most direct surface when your content needs stable rows and minimal motion overhead.",
    tags: ["grid", "lookbook", "intro"],
    categoryId: "layouts",
    Component: GridLookbookDemo,
  },
  {
    id: "masonry-editorial",
    title: "Masonry Editorial",
    eyebrow: "Masonry",
    summary:
      "A waterfall layout for uneven media heights with balanced placement across three columns.",
    focus:
      "Choose this when visual rhythm matters more than preserving row alignment.",
    tags: ["masonry", "balanced", "editorial"],
    categoryId: "layouts",
    Component: MasonryEditorialDemo,
  },
  {
    id: "entries-journal",
    title: "Entries Journal",
    eyebrow: "Entries",
    summary:
      "Structured entry cards with per-entry media blocks and fullscreen overlays that still know their owner.",
    focus:
      "Entries is the right tool for feeds, case studies, or any gallery that mixes copy with media.",
    tags: ["entries", "overlay", "fullscreen"],
    categoryId: "layouts",
    Component: EntriesJournalDemo,
  },
  {
    id: "thumb-rail",
    title: "Thumbnail Rail",
    eyebrow: "Slider + Thumbnails",
    summary:
      "A base carousel synced to a lightweight thumbnail strip via a shared index channel.",
    focus:
      "This is the pattern to reach for when users need direct visual navigation instead of just arrows and dots.",
    tags: ["thumbnails", "sync", "navigation"],
    categoryId: "navigation",
    Component: ThumbRailDemo,
  },
  {
    id: "fullscreen-studio",
    title: "Fullscreen Studio",
    eyebrow: "Fullscreen + Thumbnails",
    summary:
      "A fullscreen flow with a caption column and a separate thumbnail rail mounted into the overlay.",
    focus:
      "It demonstrates how the fullscreen runtime stays decoupled while still sharing origin, index, and navigation context.",
    tags: ["fullscreen", "caption", "thumbnail bridge"],
    categoryId: "navigation",
    Component: FullscreenStudioDemo,
  },
  {
    id: "loading-blueprint",
    title: "Loading Blueprint",
    eyebrow: "Skeleton Layer",
    summary:
      "A forced loading state that shows the grid skeleton system shaped to the final layout.",
    focus:
      "Use the loading API when placeholders should read like real UI instead of generic grey boxes.",
    tags: ["loading", "skeleton", "grid"],
    categoryId: "states",
    Component: LoadingBlueprintDemo,
  },
];

const DEFAULT_DEMO_ID = DEMOS[0].id;

export default function DemosPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedDemoId = searchParams.get("demo");
  const selectedDemo =
    DEMOS.find((demo) => demo.id === requestedDemoId) ?? DEMOS[0];
  const selectedCategory =
    DEMO_CATEGORIES.find((category) => category.id === selectedDemo.categoryId) ??
    DEMO_CATEGORIES[0];

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const SelectedDemoComponent = selectedDemo.Component;

  function toggleCategory(categoryId: string) {
    if (categoryId === selectedCategory.id) {
      return;
    }

    setExpandedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId])
  }

  function selectDemo(demo: DemoDefinition) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (demo.id === DEFAULT_DEMO_ID) {
      nextParams.delete("demo");
    } else {
      nextParams.set("demo", demo.id);
    }

    const query = nextParams.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <span className={styles.heroEyebrow}>Interactive Demo Library</span>
          <h1 className={styles.heroTitle}>Pick one gallery pattern at a time.</h1>
          <p className={styles.heroCopy}>
            The left rail keeps the catalog browsable without dumping every variation on
            the page at once. Choose a category, pick a demo, and the main stage swaps
            to that configuration only.
          </p>
        </header>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <div className={styles.sidebarIntro}>
                <span className={styles.sidebarKicker}>Browse</span>
                <strong className={styles.sidebarTitle}>
                  {DEMOS.length} focused demos
                </strong>
                <p className={styles.sidebarCopy}>
                  Categories stay collapsible, but the active one opens automatically.
                </p>
              </div>

              {DEMO_CATEGORIES.map((category) => {
                 const isOpen =
                  category.id === selectedCategory.id ||
                  expandedCategories.includes(category.id);

                return (
                  <section key={category.id} className={styles.category}>
                    <button
                      type="button"
                      className={styles.categoryToggle}
                      onClick={() => toggleCategory(category.id)}
                      aria-expanded={isOpen}
                    >
                      <span className={styles.categoryToggleCopy}>
                        <strong className={styles.categoryLabel}>{category.label}</strong>
                        <span className={styles.categoryDescription}>
                          {category.description}
                        </span>
                      </span>
                      <ChevronDown
                        className={`${styles.categoryChevron} ${
                          isOpen ? styles.categoryChevronOpen : ""
                        }`}
                        strokeWidth={1.7}
                      />
                    </button>

                    {isOpen ? (
                      <div className={styles.demoList}>
                        {category.demoIds.map((demoId) => {
                          const demo = DEMOS.find((entry) => entry.id === demoId);

                          if (!demo) {
                            return null;
                          }

                          const isActive = demo.id === selectedDemo.id;

                          return (
                            <button
                              key={demo.id}
                              type="button"
                              className={`${styles.demoLink} ${
                                isActive ? styles.demoLinkActive : ""
                              }`}
                              onClick={() => selectDemo(demo)}
                              aria-current={isActive ? "page" : undefined}
                            >
                              <span className={styles.demoLinkEyebrow}>
                                {demo.eyebrow}
                              </span>
                              <strong className={styles.demoLinkTitle}>
                                {demo.title}
                              </strong>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          </aside>

          <main className={styles.main}>
            <section className={styles.demoCard}>
              <div className={styles.demoHeader}>
                <span className={styles.demoCategory}>{selectedCategory.label}</span>
                <h2 className={styles.demoTitle}>{selectedDemo.title}</h2>
                <p className={styles.demoSummary}>{selectedDemo.summary}</p>
                <div className={styles.tagRow}>
                  {selectedDemo.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.demoCanvas}>
                <SelectedDemoComponent />
              </div>

              <div className={styles.demoFooter}>
                <span className={styles.demoFooterLabel}>Why this demo</span>
                <p className={styles.demoFooterCopy}>{selectedDemo.focus}</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
