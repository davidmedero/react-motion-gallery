'use client';

import {
  DEMO_CANVAS_SHELL_CSS_VARS,
  DEMO_CANVAS_SHELL_RESPONSIVE_CSS,
} from "@/lib/demo-canvas-shell";
import { CodeBlock } from "@/components/ui/code-block";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type SimpleBarCore from "simplebar-core";
import SimpleBar from "simplebar-react";
import { getDemoPath, getDemoTitle } from "./demo-catalog";
import {
  memo,
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import type { JSX } from "react";
import styles from "./demos.module.css";
import { generatedCodeTabsByDemoId } from "./generated-code-tabs";
import { SliderDefaultDemo } from "./slider/slider-default/Component";
import { source as sliderDefaultSource } from "./slider/slider-default/source";
import { css as sliderDefaultCss } from "./slider/slider-default/css";
import { SliderLoopDemo } from "./slider/slider-loop/Component";
import { source as sliderLoopSource } from "./slider/slider-loop/source";
import { css as sliderLoopCss } from "./slider/slider-loop/css";
import { SliderVideoHtml5Demo } from "./slider/slider-video-html5/Component";
import { source as sliderVideoHtml5Source } from "./slider/slider-video-html5/source";
import { css as sliderVideoHtml5Css } from "./slider/slider-video-html5/css";
import { SliderVideoHtml5LoopDemo } from "./slider/slider-video-html5-loop/Component";
import { source as sliderVideoHtml5LoopSource } from "./slider/slider-video-html5-loop/source";
import { css as sliderVideoHtml5LoopCss } from "./slider/slider-video-html5-loop/css";
import { SliderVideoYoutubeDemo } from "./slider/slider-video-youtube/Component";
import { source as sliderVideoYoutubeSource } from "./slider/slider-video-youtube/source";
import { css as sliderVideoYoutubeCss } from "./slider/slider-video-youtube/css";
import { SliderVideoYoutubeLoopDemo } from "./slider/slider-video-youtube-loop/Component";
import { source as sliderVideoYoutubeLoopSource } from "./slider/slider-video-youtube-loop/source";
import { css as sliderVideoYoutubeLoopCss } from "./slider/slider-video-youtube-loop/css";
import { SliderVideoVimeoDemo } from "./slider/slider-video-vimeo/Component";
import { source as sliderVideoVimeoSource } from "./slider/slider-video-vimeo/source";
import { css as sliderVideoVimeoCss } from "./slider/slider-video-vimeo/css";
import { SliderVideoVimeoLoopDemo } from "./slider/slider-video-vimeo-loop/Component";
import { source as sliderVideoVimeoLoopSource } from "./slider/slider-video-vimeo-loop/source";
import { css as sliderVideoVimeoLoopCss } from "./slider/slider-video-vimeo-loop/css";
import { SliderRightToLeftDemo } from "./slider/slider-right-to-left/Component";
import { source as sliderRightToLeftSource } from "./slider/slider-right-to-left/source";
import { css as sliderRightToLeftCss } from "./slider/slider-right-to-left/css";
import { SliderGroupCellsDemo } from "./slider/slider-group-cells/Component";
import { source as sliderGroupCellsSource } from "./slider/slider-group-cells/source";
import { css as sliderGroupCellsCss } from "./slider/slider-group-cells/css";
import { SliderFreeScrollDemo } from "./slider/slider-free-scroll/Component";
import { source as sliderFreeScrollSource } from "./slider/slider-free-scroll/source";
import { css as sliderFreeScrollCss } from "./slider/slider-free-scroll/css";
import { SliderSkipSnapsDemo } from "./slider/slider-skip-snaps/Component";
import { source as sliderSkipSnapsSource } from "./slider/slider-skip-snaps/source";
import { css as sliderSkipSnapsCss } from "./slider/slider-skip-snaps/css";
import { SliderStrictSnapsDemo } from "./slider/slider-strict-snaps/Component";
import { source as sliderStrictSnapsSource } from "./slider/slider-strict-snaps/source";
import { css as sliderStrictSnapsCss } from "./slider/slider-strict-snaps/css";
import { SliderCenterAlignDemo } from "./slider/slider-center-align/Component";
import { source as sliderCenterAlignSource } from "./slider/slider-center-align/source";
import { css as sliderCenterAlignCss } from "./slider/slider-center-align/css";
import { SliderVariableWidthsDemo } from "./slider/slider-variable-widths/Component";
import { source as sliderVariableWidthsSource } from "./slider/slider-variable-widths/source";
import { css as sliderVariableWidthsCss } from "./slider/slider-variable-widths/css";
import { SliderYAxisDemo } from "./slider/slider-y-axis/Component";
import { source as sliderYAxisSource } from "./slider/slider-y-axis/source";
import { css as sliderYAxisCss } from "./slider/slider-y-axis/css";
import { SliderCellsPerSlideDemo } from "./slider/slider-cells-per-slide/Component";
import { source as sliderCellsPerSlideSource } from "./slider/slider-cells-per-slide/source";
import { css as sliderCellsPerSlideCss } from "./slider/slider-cells-per-slide/css";
import { SliderThumbnailsDemo } from "./slider/slider-thumbnails/Component";
import { source as sliderThumbnailsSource } from "./slider/slider-thumbnails/source";
import { css as sliderThumbnailsCss } from "./slider/slider-thumbnails/css";
import { SliderLazyLoadDemo } from "./slider/slider-lazy-load/Component";
import { source as sliderLazyLoadSource } from "./slider/slider-lazy-load/source";
import { css as sliderLazyLoadCss } from "./slider/slider-lazy-load/css";
import { SliderAutoScrollDemo } from "./slider/slider-auto-scroll/Component";
import { source as sliderAutoScrollSource } from "./slider/slider-auto-scroll/source";
import { css as sliderAutoScrollCss } from "./slider/slider-auto-scroll/css";
import { SliderAutoPlayDemo } from "./slider/slider-auto-play/Component";
import { source as sliderAutoPlaySource } from "./slider/slider-auto-play/source";
import { css as sliderAutoPlayCss } from "./slider/slider-auto-play/css";
import { SliderAutoHeightDemo } from "./slider/slider-auto-height/Component";
import { source as sliderAutoHeightSource } from "./slider/slider-auto-height/source";
import { css as sliderAutoHeightCss } from "./slider/slider-auto-height/css";
import { SliderParallaxDemo } from "./slider/slider-parallax/Component";
import { source as sliderParallaxSource } from "./slider/slider-parallax/source";
import { css as sliderParallaxCss } from "./slider/slider-parallax/css";
import { SliderScaleDemo } from "./slider/slider-scale/Component";
import { source as sliderScaleSource } from "./slider/slider-scale/source";
import { css as sliderScaleCss } from "./slider/slider-scale/css";
import { SliderFadeDemo } from "./slider/slider-fade/Component";
import { source as sliderFadeSource } from "./slider/slider-fade/source";
import { css as sliderFadeCss } from "./slider/slider-fade/css";
import { SliderCrossfadeDemo } from "./slider/slider-crossfade/Component";
import { source as sliderCrossfadeSource } from "./slider/slider-crossfade/source";
import { css as sliderCrossfadeCss } from "./slider/slider-crossfade/css";
import { SliderCardsDemo } from "./slider/slider-cards/Component";
import { source as sliderCardsSource } from "./slider/slider-cards/source";
import { css as sliderCardsCss } from "./slider/slider-cards/css";
import { SliderInteractiveDemo } from "./slider/slider-interactive/Component";
import { source as sliderInteractiveSource } from "./slider/slider-interactive/source";
import { css as sliderInteractiveCss } from "./slider/slider-interactive/css";
import { GridColumnsDemo } from "./grid/grid-columns/Component";
import { source as gridColumnsSource } from "./grid/grid-columns/source";
import { css as gridColumnsCss } from "./grid/grid-columns/css";
import { GridTemplateColumnsDemo } from "./grid/grid-template-columns/Component";
import { source as gridTemplateColumnsSource } from "./grid/grid-template-columns/source";
import { css as gridTemplateColumnsCss } from "./grid/grid-template-columns/css";
import { GridMinColumnWidthDemo } from "./grid/grid-min-column-width/Component";
import { source as gridMinColumnWidthSource } from "./grid/grid-min-column-width/source";
import { css as gridMinColumnWidthCss } from "./grid/grid-min-column-width/css";
import { GridLazyLoadDemo } from "./grid/grid-lazy-load/Component";
import { source as gridLazyLoadSource } from "./grid/grid-lazy-load/source";
import { css as gridLazyLoadCss } from "./grid/grid-lazy-load/css";
import { GridVideoHtml5Demo } from "./grid/grid-video-html5/Component";
import { source as gridVideoHtml5Source } from "./grid/grid-video-html5/source";
import { css as gridVideoHtml5Css } from "./grid/grid-video-html5/css";
import { GridVideoYoutubeDemo } from "./grid/grid-video-youtube/Component";
import { source as gridVideoYoutubeSource } from "./grid/grid-video-youtube/source";
import { css as gridVideoYoutubeCss } from "./grid/grid-video-youtube/css";
import { GridVideoVimeoDemo } from "./grid/grid-video-vimeo/Component";
import { source as gridVideoVimeoSource } from "./grid/grid-video-vimeo/source";
import { css as gridVideoVimeoCss } from "./grid/grid-video-vimeo/css";
import { MasonryBalancedDemo } from "./masonry/masonry-balanced/Component";
import { source as masonryBalancedSource } from "./masonry/masonry-balanced/source";
import { css as masonryBalancedCss } from "./masonry/masonry-balanced/css";
import { MasonrySpansDemo } from "./masonry/masonry-spans/Component";
import { source as masonrySpansSource } from "./masonry/masonry-spans/source";
import { css as masonrySpansCss } from "./masonry/masonry-spans/css";
import { MasonryHorizontalOrderDemo } from "./masonry/masonry-horizontal-order/Component";
import { source as masonryHorizontalOrderSource } from "./masonry/masonry-horizontal-order/source";
import { css as masonryHorizontalOrderCss } from "./masonry/masonry-horizontal-order/css";
import type { SkeletonCacheSnapshot } from "react-motion-gallery/skeleton/cache";
import { SkeletonCacheProvider } from "react-motion-gallery/skeleton/cache/provider";
import { MasonryRoundRobinDemo } from "./masonry/masonry-round-robin/Component";
import { source as masonryRoundRobinSource } from "./masonry/masonry-round-robin/source";
import { css as masonryRoundRobinCss } from "./masonry/masonry-round-robin/css";
import { MasonryLazyLoadDemo } from "./masonry/masonry-lazy-load/Component";
import { source as masonryLazyLoadSource } from "./masonry/masonry-lazy-load/source";
import { css as masonryLazyLoadCss } from "./masonry/masonry-lazy-load/css";
import { MasonryVideoHtml5Demo } from "./masonry/masonry-video-html5/Component";
import { source as masonryVideoHtml5Source } from "./masonry/masonry-video-html5/source";
import { css as masonryVideoHtml5Css } from "./masonry/masonry-video-html5/css";
import { MasonryVideoYoutubeDemo } from "./masonry/masonry-video-youtube/Component";
import { source as masonryVideoYoutubeSource } from "./masonry/masonry-video-youtube/source";
import { css as masonryVideoYoutubeCss } from "./masonry/masonry-video-youtube/css";
import { MasonryVideoVimeoDemo } from "./masonry/masonry-video-vimeo/Component";
import { source as masonryVideoVimeoSource } from "./masonry/masonry-video-vimeo/source";
import { css as masonryVideoVimeoCss } from "./masonry/masonry-video-vimeo/css";
import { EntriesSliderDemo } from "./entries/entries-slider/Component";
import { source as entriesSliderSource } from "./entries/entries-slider/source";
import { css as entriesSliderCss } from "./entries/entries-slider/css";
import { EntriesSliderHtml5Demo } from "./entries/entries-slider-html5/Component";
import { source as entriesSliderHtml5Source } from "./entries/entries-slider-html5/source";
import { css as entriesSliderHtml5Css } from "./entries/entries-slider-html5/css";
import { EntriesGridDemo } from "./entries/entries-grid/Component";
import { source as entriesGridSource } from "./entries/entries-grid/source";
import { css as entriesGridCss } from "./entries/entries-grid/css";
import { EntriesMasonryDemo } from "./entries/entries-masonry/Component";
import { source as entriesMasonrySource } from "./entries/entries-masonry/source";
import { css as entriesMasonryCss } from "./entries/entries-masonry/css";
import { FullscreenSlideBoundCaptionDemo } from "./fullscreen/fullscreen-slide-bound-caption/Component";
import { source as fullscreenSlideBoundCaptionSource } from "./fullscreen/fullscreen-slide-bound-caption/source";
import { css as fullscreenSlideBoundCaptionCss } from "./fullscreen/fullscreen-slide-bound-caption/css";
import { FullscreenThumbnailsDemo } from "./fullscreen/fullscreen-thumbnails/Component";
import { source as fullscreenThumbnailsSource } from "./fullscreen/fullscreen-thumbnails/source";
import { css as fullscreenThumbnailsCss } from "./fullscreen/fullscreen-thumbnails/css";
import { FullscreenCaptionThumbnailsDemo } from "./fullscreen/fullscreen-caption-thumbnails/Component";
import { source as fullscreenCaptionThumbnailsSource } from "./fullscreen/fullscreen-caption-thumbnails/source";
import { css as fullscreenCaptionThumbnailsCss } from "./fullscreen/fullscreen-caption-thumbnails/css";
import { FullscreenFadeEffectsDemo } from "./fullscreen/fullscreen-fade-effects/Component";
import { source as fullscreenFadeEffectsSource } from "./fullscreen/fullscreen-fade-effects/source";
import { css as fullscreenFadeEffectsCss } from "./fullscreen/fullscreen-fade-effects/css";
import { FullscreenViewportOverlayCaptionDemo } from "./fullscreen/fullscreen-viewport-overlay-caption/Component";
import { source as fullscreenViewportOverlayCaptionSource } from "./fullscreen/fullscreen-viewport-overlay-caption/source";
import { css as fullscreenViewportOverlayCaptionCss } from "./fullscreen/fullscreen-viewport-overlay-caption/css";
import { FullscreenViewportOverlayCaptionSizedDemo } from "./fullscreen/fullscreen-viewport-overlay-caption-sized/Component";
import { source as fullscreenViewportOverlayCaptionSizedSource } from "./fullscreen/fullscreen-viewport-overlay-caption-sized/source";
import { css as fullscreenViewportOverlayCaptionSizedCss } from "./fullscreen/fullscreen-viewport-overlay-caption-sized/css";
import { FullscreenLazyLoadDemo } from "./fullscreen/fullscreen-lazy-load/Component";
import { source as fullscreenLazyLoadSource } from "./fullscreen/fullscreen-lazy-load/source";
import { css as fullscreenLazyLoadCss } from "./fullscreen/fullscreen-lazy-load/css";
import { FullscreenLayoutAgnosticDemo } from "./fullscreen/fullscreen-layout-agnostic/Component";
import { source as fullscreenLayoutAgnosticSource } from "./fullscreen/fullscreen-layout-agnostic/source";
import { css as fullscreenLayoutAgnosticCss } from "./fullscreen/fullscreen-layout-agnostic/css";
import { SkeletonFlexCardsDemo } from "./skeleton/skeleton-flex-cards/Component";
import { source as skeletonFlexCardsSource } from "./skeleton/skeleton-flex-cards/source";
import { css as skeletonFlexCardsCss } from "./skeleton/skeleton-flex-cards/css";
import { SkeletonAppShellDemo } from "./skeleton/skeleton-app-shell/Component";
import { source as skeletonAppShellSource } from "./skeleton/skeleton-app-shell/source";
import { css as skeletonAppShellCss } from "./skeleton/skeleton-app-shell/css";
import { SkeletonResponsiveTextDemo } from "./skeleton/skeleton-responsive-text/Component";
import { source as skeletonResponsiveTextSource } from "./skeleton/skeleton-responsive-text/source";
import { css as skeletonResponsiveTextCss } from "./skeleton/skeleton-responsive-text/css";
import { SkeletonForceOverlayDemo } from "./skeleton/skeleton-force-overlay/Component";
import { source as skeletonForceOverlaySource } from "./skeleton/skeleton-force-overlay/source";
import { css as skeletonForceOverlayCss } from "./skeleton/skeleton-force-overlay/css";
import { RevealSectionsDemo } from "./reveal/reveal-sections/Component";
import { source as revealSectionsSource } from "./reveal/reveal-sections/source";
import { css as revealSectionsCss } from "./reveal/reveal-sections/css";
import { ZoomPanStandaloneDemo } from "./zoom-pan/standalone/Component";
import { source as zoomPanStandaloneSource } from "./zoom-pan/standalone/source";
import { css as zoomPanStandaloneCss } from "./zoom-pan/standalone/css";
import { ZoomPanSliderDemo } from "./zoom-pan/slider/Component";
import { source as zoomPanSliderSource } from "./zoom-pan/slider/source";
import { css as zoomPanSliderCss } from "./zoom-pan/slider/css";
import { ZoomPanGridDemo } from "./zoom-pan/grid/Component";
import { source as zoomPanGridSource } from "./zoom-pan/grid/source";
import { css as zoomPanGridCss } from "./zoom-pan/grid/css";
import { ZoomPanMasonryDemo } from "./zoom-pan/masonry/Component";
import { source as zoomPanMasonrySource } from "./zoom-pan/masonry/source";
import { css as zoomPanMasonryCss } from "./zoom-pan/masonry/css";

type DemoRuntimeProps = Record<string, never>;

type DemoComponent = (props: DemoRuntimeProps) => ReactElement | null;
type DemoCategoryId =
  | "slider"
  | "grid"
  | "masonry"
  | "entries"
  | "zoom-pan"
  | "fullscreen"
  | "skeleton"
  | "reveal";

type DemoNavItem =
  | {
      type: "demo";
      demoId: string;
    }
  | {
      type: "group";
      id: string;
      label: string;
      demoIds: string[];
    };

type DemoCategory = {
  id: DemoCategoryId;
  label: string;
  description: string;
  items: DemoNavItem[];
};

type DemoDefinition = {
  id: string;
  title: string;
  eyebrow: string;
  tags: string[];
  categoryId: DemoCategoryId;
  Component: DemoComponent;
  source: string;
  css: string;
  sourceFilename?: string;
  cssFilename?: string;
  extraCodeTabs?: DemoCodeFileTab[];
};

type DemoCodeFileTab = {
  id: string;
  label: string;
  code: string;
  filename?: string;
  language?: string;
};

type SidebarExpansionState = {
  expandedCategories: DemoCategoryId[];
  syncedDemoId: string;
};

type DemoCanvasTab = "preview" | "code";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const SIMPLEBAR_SCROLLBAR_INTRO_MS = 320;

function toPascalCase(value: string) {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

function resolveExpandedCategories(
  sidebarExpansion: SidebarExpansionState,
  selectedDemoId: string,
  selectedCategoryId: DemoCategoryId
) {
  if (
    sidebarExpansion.syncedDemoId === selectedDemoId ||
    sidebarExpansion.expandedCategories.includes(selectedCategoryId)
  ) {
    return sidebarExpansion.expandedCategories;
  }

  return [...sidebarExpansion.expandedCategories, selectedCategoryId];
}

function normalizeDemoSource(code: string) {
  return code
    .replaceAll("\\`", "`")
    .replaceAll("\\${", "${");
}

function basename(path: string) {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

const DemoCodeBlock = memo(function DemoCodeBlock(props: {
  demo: DemoDefinition;
  typescriptCode: string;
}): JSX.Element {
  const { demo, typescriptCode } = props;
  const normalizedTypescriptCode = normalizeDemoSource(typescriptCode);
  const normalizedCssCode = normalizeDemoSource(demo.css);
  const generatedCodeTabs = generatedCodeTabsByDemoId[demo.id] ?? [];
  const normalizedExtraTabs = [
    ...generatedCodeTabs,
    ...(demo.extraCodeTabs ?? []),
  ].map((tab) => ({
    ...tab,
    code: normalizeDemoSource(tab.code),
  }));
  const sourceFilename = demo.sourceFilename ?? `${demo.title}.tsx`;
  const cssFilename = demo.cssFilename ?? `${demo.title}.css`;

  return (
    <CodeBlock
      className={styles.codeBlock}
      code={normalizedTypescriptCode}
      disableAnimations
      tabs={[
        {
          id: "typescript",
          label: basename(sourceFilename),
          code: normalizedTypescriptCode,
          filename: sourceFilename,
          language: "tsx",
        },
        ...normalizedExtraTabs,
        {
          id: "css",
          label: basename(cssFilename),
          code: normalizedCssCode,
          filename: cssFilename,
          language: "css",
        },
      ]}
      defaultTabId="typescript"
      aria-label={`${demo.title} code example`}
    />
  );
});

const SelectedDemoPane = memo(function SelectedDemoPane(props: {
  selectedCategoryLabel: string;
  selectedDemo: DemoDefinition;
  selectedDemoCanvasClassName: string;
  selectedDemoSource: string;
}): JSX.Element {
  const {
    selectedCategoryLabel,
    selectedDemo,
    selectedDemoCanvasClassName,
    selectedDemoSource,
  } = props;
  const [displayedTab, setDisplayedTab] = useState<DemoCanvasTab>("preview");
  const SelectedDemoComponent = selectedDemo.Component;
  const isDisplayingPreviewTab = displayedTab === "preview";

  return (
    <section className={styles.demoCard}>
      <div className={styles.demoHeader}>
        <span className={styles.demoCategory}>{selectedCategoryLabel}</span>
        <h2 className={styles.demoTitle}>{selectedDemo.title}</h2>
        <div className={styles.tagRow}>
          Add-ons: <span></span>
          {selectedDemo.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.demoCanvasTabs}>
        <div
          className={styles.demoCanvasTabList}
          aria-label={`${selectedDemo.title} demo view`}
          data-active-tab={displayedTab}
        >
          <span aria-hidden="true" className={styles.demoCanvasTabIndicator} />
          <button
            type="button"
            className={styles.demoCanvasTab}
            data-tab="preview"
            aria-pressed={isDisplayingPreviewTab}
            onClick={() => setDisplayedTab("preview")}
          >
            Preview
          </button>
          <button
            type="button"
            className={styles.demoCanvasTab}
            data-tab="code"
            aria-pressed={!isDisplayingPreviewTab}
            onClick={() => setDisplayedTab("code")}
          >
            Code
          </button>
        </div>

        <div className={styles.demoCanvasPanel}>
          {isDisplayingPreviewTab ? (
            <div
              className={`${cx(styles.demoCanvas, selectedDemoCanvasClassName)} shadow-sm`}
            >
              <SelectedDemoComponent />
            </div>
          ) : (
            <DemoCodeBlock
              key={selectedDemo.id}
              demo={selectedDemo}
              typescriptCode={selectedDemoSource}
            />
          )}
        </div>
      </div>
    </section>
  );
});

const SidebarScrollRegion = memo(function SidebarScrollRegion(props: {
  children: ReactNode;
}): JSX.Element {
  const { children } = props;
  const hasMounted = useHasMounted();
  const simpleBarRef = useRef<SimpleBarCore | null>(null);
  const [scrollbarIntroPlayed, setScrollbarIntroPlayed] = useState(false);
  const isCompactSidebar = useMediaQuery("(max-width: 767px)");
  const shouldUseSimpleBar = hasMounted && !isCompactSidebar;

  useEffect(() => {
    if (!shouldUseSimpleBar || scrollbarIntroPlayed) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setScrollbarIntroPlayed(true);
    }, SIMPLEBAR_SCROLLBAR_INTRO_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [scrollbarIntroPlayed, shouldUseSimpleBar]);

  useLayoutEffect(() => {
    if (!shouldUseSimpleBar) {
      return;
    }

    if (simpleBarRef.current === null) {
      return;
    }

    const simpleBarInstance = simpleBarRef.current;
    let frameId: number | null = null;

    function recalculate() {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        simpleBarInstance.recalculate();
      });
    }

    function handleResize() {
      recalculate();
    }

    window.addEventListener("resize", handleResize);
    recalculate();

    return () => {
      window.removeEventListener("resize", handleResize);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [shouldUseSimpleBar]);

  if (shouldUseSimpleBar) {
    return (
      <SimpleBar
        ref={simpleBarRef}
        className={cx(
          styles.sidebarNavScrollArea,
          !scrollbarIntroPlayed && styles.sidebarNavScrollAreaIntro
        )}
        autoHide={false}
        forceVisible="y"
      >
        {children}
      </SimpleBar>
    );
  }

  return (
    <div
      className={cx(
        styles.sidebarNavScrollArea,
        styles.sidebarNavScrollAreaNative
      )}
    >
      {children}
    </div>
  );
});

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

function subscribeToHydration(): () => void {
  return () => {};
}

function useHasMounted(): boolean {
  return useSyncExternalStore(subscribeToHydration, () => true, () => false);
}

function AnimatedCategoryPanel(props: {
  id: string;
  isOpen: boolean;
  children: ReactNode;
}): JSX.Element {
  const { id, isOpen, children } = props;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);
  const isOpenRef = useRef(isOpen);
  const [initialInlineStyle] = useState<ComponentProps<"div">["style"]>(() => ({
    height: isOpen ? "auto" : "0px",
  }));

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;

    if (!panel || !content) {
      return;
    }

    isOpenRef.current = isOpen;

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const currentHeight = panel.getBoundingClientRect().height;
    const nextHeight = content.getBoundingClientRect().height;
    panel.style.setProperty(
      "--category-panel-duration",
      isOpen ? "260ms" : "260ms"
    );
    panel.style.setProperty(
      "--category-panel-easing",
      isOpen ? "cubic-bezier(0.4, 0, 0.2, 1)" : "cubic-bezier(0.22, 1, 0.36, 1)"
    );

    if (isFirstRenderRef.current) {
      panel.style.height = isOpen ? "auto" : "0px";
      isFirstRenderRef.current = false;
      return;
    }

    if (Math.abs(currentHeight - nextHeight) < 1 && isOpen) {
      panel.style.height = "auto";
      return;
    }

    panel.style.height = `${currentHeight}px`;
    void panel.offsetHeight;

    frameRef.current = window.requestAnimationFrame(() => {
      panel.style.height = isOpen ? `${nextHeight}px` : "0px";
    });

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isOpen]);

  return (
    <div
      id={id}
      ref={panelRef}
      className={styles.categoryPanel}
      style={initialInlineStyle}
      aria-hidden={!isOpen}
      inert={!isOpen}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget || event.propertyName !== "height") {
          return;
        }

        event.currentTarget.style.height = isOpenRef.current ? "auto" : "0px";
      }}
    >
      <div ref={contentRef} className={styles.categoryPanelContent}>
        {children}
      </div>
    </div>
  );
}

const DEMOS: DemoDefinition[] = [
  {
    id: "slider-default",
    title: "Default",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderDefaultDemo,
    source: sliderDefaultSource,
    css: sliderDefaultCss,
  },
  {
    id: "slider-loop",
    title: "Loop",
    eyebrow: "Slider",
    tags: ["center", "initialIndex", "fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderLoopDemo,
    source: sliderLoopSource,
    css: sliderLoopCss,
  },
  {
    id: "slider-video-html5",
    title: "HTML5",
    eyebrow: "Slider Video",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVideoHtml5Demo,
    source: sliderVideoHtml5Source,
    css: sliderVideoHtml5Css,
  },
  {
    id: "slider-video-html5-loop",
    title: "HTML5 + Loop",
    eyebrow: "Slider Video",
    tags: ["center","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVideoHtml5LoopDemo,
    source: sliderVideoHtml5LoopSource,
    css: sliderVideoHtml5LoopCss,
  },
  {
    id: "slider-video-youtube",
    title: "Youtube",
    eyebrow: "Slider Video",
    tags: ["scroll-bar","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVideoYoutubeDemo,
    source: sliderVideoYoutubeSource,
    css: sliderVideoYoutubeCss,
  },
  {
    id: "slider-video-youtube-loop",
    title: "Youtube + Loop",
    eyebrow: "Slider Video",
    tags: ["scroll-bar","center","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVideoYoutubeLoopDemo,
    source: sliderVideoYoutubeLoopSource,
    css: sliderVideoYoutubeLoopCss,
  },
  {
    id: "slider-video-vimeo",
    title: "Vimeo",
    eyebrow: "Slider Video",
    tags: ["scroll-bar","fulscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVideoVimeoDemo,
    source: sliderVideoVimeoSource,
    css: sliderVideoVimeoCss,
  },
  {
    id: "slider-video-vimeo-loop",
    title: "Vimeo + Loop",
    eyebrow: "Slider Video",
    tags: ["scroll-bar","center","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVideoVimeoLoopDemo,
    source: sliderVideoVimeoLoopSource,
    css: sliderVideoVimeoLoopCss,
  },
  {
    id: "slider-right-to-left",
    title: "Right To Left",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderRightToLeftDemo,
    source: sliderRightToLeftSource,
    css: sliderRightToLeftCss,
  },
  {
    id: "slider-group-cells",
    title: "Group Cells",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderGroupCellsDemo,
    source: sliderGroupCellsSource,
    css: sliderGroupCellsCss,
  },
  {
    id: "slider-free-scroll",
    title: "Free Scroll",
    eyebrow: "Slider",
    tags: ["group-cells","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderFreeScrollDemo,
    source: sliderFreeScrollSource,
    css: sliderFreeScrollCss,
  },
  {
    id: "slider-skip-snaps",
    title: "Skip Snaps",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderSkipSnapsDemo,
    source: sliderSkipSnapsSource,
    css: sliderSkipSnapsCss,
  },
  {
    id: "slider-strict-snaps",
    title: "Strict Snaps",
    eyebrow: "Slider",
    tags: ["loop","align-center","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderStrictSnapsDemo,
    source: sliderStrictSnapsSource,
    css: sliderStrictSnapsCss,
  },
  {
    id: "slider-center-align",
    title: "Center Align",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderCenterAlignDemo,
    source: sliderCenterAlignSource,
    css: sliderCenterAlignCss,
  },
  {
    id: "slider-variable-widths",
    title: "Variable Widths",
    eyebrow: "Slider",
    tags: ["center", "contain-scroll", "fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVariableWidthsDemo,
    source: sliderVariableWidthsSource,
    css: sliderVariableWidthsCss,
  },
  {
    id: "slider-y-axis",
    title: "Y Axis",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderYAxisDemo,
    source: sliderYAxisSource,
    css: sliderYAxisCss,
  },
  {
    id: "slider-cells-per-slide",
    title: "Cells Per Slide",
    eyebrow: "Slider",
    tags: ["group-cells","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderCellsPerSlideDemo,
    source: sliderCellsPerSlideSource,
    css: sliderCellsPerSlideCss,
  },
  {
    id: "slider-thumbnails",
    title: "Thumbnails",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton","fullscreen-thumbnails"],
    categoryId: "slider",
    Component: SliderThumbnailsDemo,
    source: sliderThumbnailsSource,
    css: sliderThumbnailsCss,
  },
  {
    id: "slider-lazy-load",
    title: "Lazy Load",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton","fullscreen-lazy-load"],
    categoryId: "slider",
    Component: SliderLazyLoadDemo,
    source: sliderLazyLoadSource,
    css: sliderLazyLoadCss,
  },
  {
    id: "slider-auto-scroll",
    title: "Auto Scroll",
    eyebrow: "Slider",
    tags: ["progress","center","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderAutoScrollDemo,
    source: sliderAutoScrollSource,
    css: sliderAutoScrollCss,
  },
  {
    id: "slider-auto-play",
    title: "Auto Play",
    eyebrow: "Slider",
    tags: ["center","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderAutoPlayDemo,
    source: sliderAutoPlaySource,
    css: sliderAutoPlayCss,
  },
  {
    id: "slider-auto-height",
    title: "Auto Height",
    eyebrow: "Slider",
    tags: ["center","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderAutoHeightDemo,
    source: sliderAutoHeightSource,
    css: sliderAutoHeightCss,
  },
  {
    id: "slider-parallax",
    title: "Parallax",
    eyebrow: "Slider",
    tags: ["free-scroll","center","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderParallaxDemo,
    source: sliderParallaxSource,
    css: sliderParallaxCss,
  },
  {
    id: "slider-scale",
    title: "Scale",
    eyebrow: "Slider",
    tags: ["center","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderScaleDemo,
    source: sliderScaleSource,
    css: sliderScaleCss,
  },
  {
    id: "slider-fade",
    title: "Fade",
    eyebrow: "Slider",
    tags: ["center","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderFadeDemo,
    source: sliderFadeSource,
    css: sliderFadeCss,
  },
  {
    id: "slider-crossfade",
    title: "Crossfade",
    eyebrow: "Slider",
    tags: ["center","loop","drag","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderCrossfadeDemo,
    source: sliderCrossfadeSource,
    css: sliderCrossfadeCss,
  },
  {
    id: "slider-cards",
    title: "Cards",
    eyebrow: "Slider",
    tags: ["cells-per-slide","group-cells","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderCardsDemo,
    source: sliderCardsSource,
    css: sliderCardsCss,
  },
  {
    id: "slider-interactive",
    title: "Interactive",
    eyebrow: "Slider API",
    tags: ["gallery-api","append","prepend","insert","remove","replace","set-items"],
    categoryId: "slider",
    Component: SliderInteractiveDemo,
    source: sliderInteractiveSource,
    css: sliderInteractiveCss,
  },
  {
    id: "grid-columns",
    title: "Spans",
    eyebrow: "Grid",
    tags: ["fullscreen","responsive","skeleton","span","grid.item"],
    categoryId: "grid",
    Component: GridColumnsDemo,
    source: gridColumnsSource,
    css: gridColumnsCss,
  },
  {
    id: "grid-template-columns",
    title: "Template Columns",
    eyebrow: "Grid",
    tags: ["fullscreen","skeleton","template-columns","span"],
    categoryId: "grid",
    Component: GridTemplateColumnsDemo,
    source: gridTemplateColumnsSource,
    css: gridTemplateColumnsCss,
  },
  {
    id: "grid-min-column-width",
    title: "Min Column Width",
    eyebrow: "Grid",
    tags: ["fullscreen","skeleton"],
    categoryId: "grid",
    Component: GridMinColumnWidthDemo,
    source: gridMinColumnWidthSource,
    css: gridMinColumnWidthCss,
  },
  {
    id: "grid-lazy-load",
    title: "Lazy Load",
    eyebrow: "Grid",
    tags: ["fullscreen","skeleton","fullscreen-lazy-load"],
    categoryId: "grid",
    Component: GridLazyLoadDemo,
    source: gridLazyLoadSource,
    css: gridLazyLoadCss,
  },
  {
    id: "grid-video-html5",
    title: "HTML5",
    eyebrow: "Grid Video",
    tags: ["fullscreen","skeleton"],
    categoryId: "grid",
    Component: GridVideoHtml5Demo,
    source: gridVideoHtml5Source,
    css: gridVideoHtml5Css,
    sourceFilename: "Component.tsx",
    cssFilename: "grid-video-html5-demo.module.css",
  },
  {
    id: "grid-video-youtube",
    title: "Youtube",
    eyebrow: "Grid Video",
    tags: ["fullscreen","skeleton"],
    categoryId: "grid",
    Component: GridVideoYoutubeDemo,
    source: gridVideoYoutubeSource,
    css: gridVideoYoutubeCss,
  },
  {
    id: "grid-video-vimeo",
    title: "Vimeo",
    eyebrow: "Grid Video",
    tags: ["fullscreen","skeleton"],
    categoryId: "grid",
    Component: GridVideoVimeoDemo,
    source: gridVideoVimeoSource,
    css: gridVideoVimeoCss,
  },
  {
    id: "masonry-balanced",
    title: "Balanced",
    eyebrow: "Masonry",
    tags: ["balanced","video","fullscreen","skeleton","text","itemWrapStyle"],
    categoryId: "masonry",
    Component: MasonryBalancedDemo,
    source: masonryBalancedSource,
    css: masonryBalancedCss,
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-balanced-demo.module.css",
  },
  {
    id: "masonry-spans",
    title: "Spans",
    eyebrow: "Masonry",
    tags: ["balanced","span","video","fullscreen","skeleton","masonry.item"],
    categoryId: "masonry",
    Component: MasonrySpansDemo,
    source: masonrySpansSource,
    css: masonrySpansCss,
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-spans-demo.module.css",
  },
  {
    id: "masonry-horizontal-order",
    title: "Horizontal Order",
    eyebrow: "Masonry",
    tags: ["horizontal-order","span","video","fullscreen","skeleton"],
    categoryId: "masonry",
    Component: MasonryHorizontalOrderDemo,
    source: masonryHorizontalOrderSource,
    css: masonryHorizontalOrderCss,
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-horizontal-order-demo.module.css",
  },
  {
    id: "masonry-round-robin",
    title: "Round Robin",
    eyebrow: "Masonry",
    tags: ["round-robin","video","fullscreen","skeleton"],
    categoryId: "masonry",
    Component: MasonryRoundRobinDemo,
    source: masonryRoundRobinSource,
    css: masonryRoundRobinCss,
  },
  {
    id: "masonry-lazy-load",
    title: "Lazy Load",
    eyebrow: "Masonry",
    tags: ["video","fullscreen","skeleton","fullscreen-lazy-load"],
    categoryId: "masonry",
    Component: MasonryLazyLoadDemo,
    source: masonryLazyLoadSource,
    css: masonryLazyLoadCss,
  },
  {
    id: "masonry-video-html5",
    title: "HTML5",
    eyebrow: "Masonry Video",
    tags: ["html5","video","fullscreen","skeleton"],
    categoryId: "masonry",
    Component: MasonryVideoHtml5Demo,
    source: masonryVideoHtml5Source,
    css: masonryVideoHtml5Css,
  },
  {
    id: "masonry-video-youtube",
    title: "Youtube",
    eyebrow: "Masonry Video",
    tags: ["youtube","video","fullscreen","skeleton"],
    categoryId: "masonry",
    Component: MasonryVideoYoutubeDemo,
    source: masonryVideoYoutubeSource,
    css: masonryVideoYoutubeCss,
  },
  {
    id: "masonry-video-vimeo",
    title: "Vimeo",
    eyebrow: "Masonry Video",
    tags: ["vimeo","video","fullscreen","skeleton"],
    categoryId: "masonry",
    Component: MasonryVideoVimeoDemo,
    source: masonryVideoVimeoSource,
    css: masonryVideoVimeoCss,
  },
  {
    id: "entries-slider",
    title: "Slider",
    eyebrow: "Entries",
    tags: ["slider","fullscreen"],
    categoryId: "entries",
    Component: EntriesSliderDemo,
    source: entriesSliderSource,
    css: entriesSliderCss,
  },
  {
    id: "entries-slider-html5",
    title: "Slider + HTML5",
    eyebrow: "Entries",
    tags: ["slider","html5","video","fullscreen"],
    categoryId: "entries",
    Component: EntriesSliderHtml5Demo,
    source: entriesSliderHtml5Source,
    css: entriesSliderHtml5Css,
    sourceFilename: "Component.tsx",
    cssFilename: "entries-slider-html5-demo.module.css",
  },
  {
    id: "entries-grid",
    title: "Grid",
    eyebrow: "Entries",
    tags: ["grid","fullscreen"],
    categoryId: "entries",
    Component: EntriesGridDemo,
    source: entriesGridSource,
    css: entriesGridCss,
  },
  {
    id: "entries-masonry",
    title: "Masonry",
    eyebrow: "Entries",
    tags: ["masonry","fullscreen"],
    categoryId: "entries",
    Component: EntriesMasonryDemo,
    source: entriesMasonrySource,
    css: entriesMasonryCss,
  },
  {
    id: "fullscreen-layout-agnostic",
    title: "Standalone",
    eyebrow: "Fullscreen",
    tags: ["openFullscreenAt","api","scale","custom-markup"],
    categoryId: "fullscreen",
    Component: FullscreenLayoutAgnosticDemo,
    source: fullscreenLayoutAgnosticSource,
    css: fullscreenLayoutAgnosticCss,
  },
  {
    id: "fullscreen-slide-bound-caption",
    title: "Slide Caption",
    eyebrow: "Fullscreen",
    tags: ["captions","slide","responsive"],
    categoryId: "fullscreen",
    Component: FullscreenSlideBoundCaptionDemo,
    source: fullscreenSlideBoundCaptionSource,
    css: fullscreenSlideBoundCaptionCss,
  },
  {
    id: "fullscreen-thumbnails",
    title: "Thumbnails",
    eyebrow: "Fullscreen",
    tags: ["thumbnails","navigation","sync"],
    categoryId: "fullscreen",
    Component: FullscreenThumbnailsDemo,
    source: fullscreenThumbnailsSource,
    css: fullscreenThumbnailsCss,
  },
  {
    id: "fullscreen-caption-thumbnails",
    title: "Caption + Thumbnails",
    eyebrow: "Fullscreen",
    tags: ["captions","overlay","thumbnails","responsive"],
    categoryId: "fullscreen",
    Component: FullscreenCaptionThumbnailsDemo,
    source: fullscreenCaptionThumbnailsSource,
    css: fullscreenCaptionThumbnailsCss,
    sourceFilename: "CaptionThumbnails.tsx",
    cssFilename: "caption-thumbnails-demo.module.css",
  },
  {
    id: "fullscreen-fade-effects",
    title: "Fade Effects",
    eyebrow: "Fullscreen",
    tags: ["intro-fade","slide-fade","thumbnails"],
    categoryId: "fullscreen",
    Component: FullscreenFadeEffectsDemo,
    source: fullscreenFadeEffectsSource,
    css: fullscreenFadeEffectsCss,
  },
  {
    id: "fullscreen-viewport-overlay-caption",
    title: "Overlay Caption",
    eyebrow: "Fullscreen",
    tags: ["overlay","captions","viewport"],
    categoryId: "fullscreen",
    Component: FullscreenViewportOverlayCaptionDemo,
    source: fullscreenViewportOverlayCaptionSource,
    css: fullscreenViewportOverlayCaptionCss,
  },
  {
    id: "fullscreen-viewport-overlay-caption-sized",
    title: "Overlay Caption (Sized)",
    eyebrow: "Fullscreen",
    tags: ["overlay","captions","responsive"],
    categoryId: "fullscreen",
    Component: FullscreenViewportOverlayCaptionSizedDemo,
    source: fullscreenViewportOverlayCaptionSizedSource,
    css: fullscreenViewportOverlayCaptionSizedCss,
  },
  {
    id: "fullscreen-lazy-load",
    title: "Lazy Load",
    eyebrow: "Fullscreen",
    tags: ["lazy-load","media"],
    categoryId: "fullscreen",
    Component: FullscreenLazyLoadDemo,
    source: fullscreenLazyLoadSource,
    css: fullscreenLazyLoadCss,
  },
  {
    id: "skeleton-flex-cards",
    title: "Flex Cards",
    eyebrow: "Skeleton",
    tags: ["standalone","flex","text","responsive"],
    categoryId: "skeleton",
    Component: SkeletonFlexCardsDemo,
    source: skeletonFlexCardsSource,
    css: skeletonFlexCardsCss,
    sourceFilename: "Component.tsx",
    cssFilename: "skeleton-flex-cards-demo.module.css",
  },
  {
    id: "skeleton-app-shell",
    title: "App Shell",
    eyebrow: "Skeleton",
    tags: ["standalone","flex","dashboard","nested"],
    categoryId: "skeleton",
    Component: SkeletonAppShellDemo,
    source: skeletonAppShellSource,
    css: skeletonAppShellCss,
    sourceFilename: "Component.tsx",
    cssFilename: "skeleton-app-shell-demo.module.css",
  },
  {
    id: "skeleton-responsive-text",
    title: "Responsive Text",
    eyebrow: "Skeleton",
    tags: ["standalone","text","container-query","responsive"],
    categoryId: "skeleton",
    Component: SkeletonResponsiveTextDemo,
    source: skeletonResponsiveTextSource,
    css: skeletonResponsiveTextCss,
    sourceFilename: "Component.tsx",
    cssFilename: "skeleton-responsive-text-demo.module.css",
  },
  {
    id: "skeleton-force-overlay",
    title: "Force Overlay",
    eyebrow: "Skeleton",
    tags: ["standalone","force","compare","opacity"],
    categoryId: "skeleton",
    Component: SkeletonForceOverlayDemo,
    source: skeletonForceOverlaySource,
    css: skeletonForceOverlayCss,
    sourceFilename: "Component.tsx",
    cssFilename: "skeleton-force-overlay-demo.module.css",
  },
  {
    id: "reveal-sections",
    title: "Sections",
    eyebrow: "Reveal",
    tags: ["standalone","fade","transform","stagger"],
    categoryId: "reveal",
    Component: RevealSectionsDemo,
    source: revealSectionsSource,
    css: revealSectionsCss,
    sourceFilename: "Component.tsx",
    cssFilename: "reveal-sections-demo.module.css",
  },
  {
    id: "zoom-pan-standalone",
    title: "Standalone",
    eyebrow: "Zoom + Pan",
    tags: ["zoom-pan","image","standalone","crop"],
    categoryId: "zoom-pan",
    Component: ZoomPanStandaloneDemo,
    source: zoomPanStandaloneSource,
    css: zoomPanStandaloneCss,
  },
  {
    id: "zoom-pan-slider",
    title: "Slider",
    eyebrow: "Zoom + Pan",
    tags: ["zoom-pan","slider","images"],
    categoryId: "zoom-pan",
    Component: ZoomPanSliderDemo,
    source: zoomPanSliderSource,
    css: zoomPanSliderCss,
  },
  {
    id: "zoom-pan-grid",
    title: "Grid",
    eyebrow: "Zoom + Pan",
    tags: ["zoom-pan","grid","images"],
    categoryId: "zoom-pan",
    Component: ZoomPanGridDemo,
    source: zoomPanGridSource,
    css: zoomPanGridCss,
  },
  {
    id: "zoom-pan-masonry",
    title: "Masonry",
    eyebrow: "Zoom + Pan",
    tags: ["zoom-pan","masonry","images"],
    categoryId: "zoom-pan",
    Component: ZoomPanMasonryDemo,
    source: zoomPanMasonrySource,
    css: zoomPanMasonryCss,
  },
];

const DEMO_BY_ID = new Map(DEMOS.map((demo) => [demo.id, demo]));

const DEMO_CATEGORIES: DemoCategory[] = [
  {
    "id": "slider",
    "label": "Slider",
    "description": "A motion-first slider primitive where drag, wheel, and fullscreen handoffs feel continuous.",
    "items": [
      {
        "type": "demo",
        "demoId": "slider-default"
      },
      {
        "type": "demo",
        "demoId": "slider-loop"
      },
      {
        "type": "group",
        "id": "slider-video",
        "label": "Video",
        "demoIds": [
          "slider-video-html5",
          "slider-video-html5-loop",
          "slider-video-youtube",
          "slider-video-youtube-loop",
          "slider-video-vimeo",
          "slider-video-vimeo-loop"
        ]
      },
      {
        "type": "demo",
        "demoId": "slider-right-to-left"
      },
      {
        "type": "demo",
        "demoId": "slider-group-cells"
      },
      {
        "type": "demo",
        "demoId": "slider-free-scroll"
      },
      {
        "type": "demo",
        "demoId": "slider-skip-snaps"
      },
      {
        "type": "demo",
        "demoId": "slider-strict-snaps"
      },
      {
        "type": "demo",
        "demoId": "slider-center-align"
      },
      {
        "type": "demo",
        "demoId": "slider-variable-widths"
      },
      {
        "type": "demo",
        "demoId": "slider-y-axis"
      },
      {
        "type": "demo",
        "demoId": "slider-cells-per-slide"
      },
      {
        "type": "demo",
        "demoId": "slider-thumbnails"
      },
      {
        "type": "demo",
        "demoId": "slider-lazy-load"
      },
      {
        "type": "demo",
        "demoId": "slider-auto-scroll"
      },
      {
        "type": "demo",
        "demoId": "slider-auto-play"
      },
      {
        "type": "demo",
        "demoId": "slider-auto-height"
      },
      {
        "type": "demo",
        "demoId": "slider-parallax"
      },
      {
        "type": "demo",
        "demoId": "slider-scale"
      },
      {
        "type": "demo",
        "demoId": "slider-fade"
      },
      {
        "type": "demo",
        "demoId": "slider-crossfade"
      },
      {
        "type": "demo",
        "demoId": "slider-cards"
      },
      {
        "type": "demo",
        "demoId": "slider-interactive"
      }
    ]
  },
  {
    "id": "grid",
    "label": "Grid",
    "description": "Predictable media grids with responsive spans and fullscreen handoffs built into the layout.",
    "items": [
      {
        "type": "demo",
        "demoId": "grid-columns"
      },
      {
        "type": "demo",
        "demoId": "grid-template-columns"
      },
      {
        "type": "demo",
        "demoId": "grid-min-column-width"
      },
      {
        "type": "demo",
        "demoId": "grid-lazy-load"
      },
      {
        "type": "group",
        "id": "grid-video",
        "label": "Video",
        "demoIds": [
          "grid-video-html5",
          "grid-video-youtube",
          "grid-video-vimeo"
        ]
      }
    ]
  },
  {
    "id": "masonry",
    "label": "Masonry",
    "description": "Server-predicted masonry layouts that keep height and placement stable through hydration, then refine with live measurements.",
    "items": [
      {
        "type": "demo",
        "demoId": "masonry-balanced"
      },
      {
        "type": "demo",
        "demoId": "masonry-spans"
      },
      {
        "type": "demo",
        "demoId": "masonry-horizontal-order"
      },
      {
        "type": "demo",
        "demoId": "masonry-round-robin"
      },
      {
        "type": "demo",
        "demoId": "masonry-lazy-load"
      },
      {
        "type": "group",
        "id": "masonry-video",
        "label": "Video",
        "demoIds": [
          "masonry-video-html5",
          "masonry-video-youtube",
          "masonry-video-vimeo"
        ]
      }
    ]
  },
  {
    "id": "entries",
    "label": "Entries",
    "description": "Structured editorial rows whose text, metadata, and media blocks can render as sliders, grids, or masonry galleries.",
    "items": [
      {
        "type": "demo",
        "demoId": "entries-slider"
      },
      {
        "type": "demo",
        "demoId": "entries-slider-html5"
      },
      {
        "type": "demo",
        "demoId": "entries-grid"
      },
      {
        "type": "demo",
        "demoId": "entries-masonry"
      }
    ]
  },
  {
    "id": "zoom-pan",
    "label": "Zoom + Pan",
    "description": "Standalone zoomable image primitives for cropped cards, heroes, and editorial media without any fullscreen controller.",
    "items": [
      {
        "type": "demo",
        "demoId": "zoom-pan-standalone"
      },
      {
        "type": "demo",
        "demoId": "zoom-pan-slider"
      },
      {
        "type": "demo",
        "demoId": "zoom-pan-grid"
      },
      {
        "type": "demo",
        "demoId": "zoom-pan-masonry"
      }
    ]
  },
  {
    "id": "fullscreen",
    "label": "Fullscreen",
    "description": "Fullscreen controller demos for standalone triggers, slide-bound captions, viewport overlays, thumbnail rails, and lazy media loading.",
    "items": [
      {
        "type": "demo",
        "demoId": "fullscreen-layout-agnostic"
      },
      {
        "type": "demo",
        "demoId": "fullscreen-slide-bound-caption"
      },
      {
        "type": "demo",
        "demoId": "fullscreen-viewport-overlay-caption"
      },
      {
        "type": "demo",
        "demoId": "fullscreen-viewport-overlay-caption-sized"
      },
      {
        "type": "demo",
        "demoId": "fullscreen-thumbnails"
      },
      {
        "type": "demo",
        "demoId": "fullscreen-caption-thumbnails"
      },
      {
        "type": "demo",
        "demoId": "fullscreen-fade-effects"
      },
      {
        "type": "demo",
        "demoId": "fullscreen-lazy-load"
      }
    ]
  },
  {
    "id": "skeleton",
    "label": "Skeleton",
    "description": "Standalone skeleton primitives for real readiness, app shells, responsive media, and forced compare overlays without importing a gallery layout.",
    "items": [
      {
        "type": "demo",
        "demoId": "skeleton-flex-cards"
      },
      {
        "type": "demo",
        "demoId": "skeleton-app-shell"
      },
      {
        "type": "demo",
        "demoId": "skeleton-responsive-text"
      },
      {
        "type": "demo",
        "demoId": "skeleton-force-overlay"
      }
    ]
  },
  {
    "id": "reveal",
    "label": "Reveal",
    "description": "Standalone section reveals for app and marketing UI without implying loading state.",
    "items": [
      {
        "type": "demo",
        "demoId": "reveal-sections"
      }
    ]
  }
];

function toDemoCanvasClassName(demoId: string) {
  return `demoCanvas${toPascalCase(demoId)}`;
}

function DemosPageContent(props: {
  searchParamsString: string;
  onSearchParamsStringChange?: (nextSearchParamsString: string) => void;
}) {
  const {
    searchParamsString,
    onSearchParamsStringChange,
  } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = new URLSearchParams(searchParamsString);
  const fallbackDemo = DEMOS[0];
  const fallbackCategory = DEMO_CATEGORIES[0];
  const requestedDemoId = searchParams.get("demo");
  const requestedDemo = DEMO_BY_ID.get(requestedDemoId ?? "");
  const selectedDemo = requestedDemo ?? fallbackDemo;
  const selectedCategory =
    DEMO_CATEGORIES.find((category) => category.id === selectedDemo?.categoryId) ??
    fallbackCategory;
  const [sidebarExpansion, setSidebarExpansion] = useState<SidebarExpansionState>(() => ({
    expandedCategories: selectedCategory ? [selectedCategory.id] : [],
    syncedDemoId: selectedDemo?.id ?? "",
  }));

  if (!fallbackDemo || !fallbackCategory || !selectedDemo || !selectedCategory) {
    return null;
  }

  const expandedCategories = resolveExpandedCategories(
    sidebarExpansion,
    selectedDemo.id,
    selectedCategory.id
  );
  const selectedDemoCanvasClassName = styles[toDemoCanvasClassName(selectedDemo.id)];
  const selectedDemoSource = selectedDemo.source;
  const pageHeading = requestedDemo
    ? getDemoTitle(requestedDemo)
    : "React Motion Gallery demos";

  function toggleCategory(categoryId: DemoCategoryId) {
    setSidebarExpansion((current) => {
      const currentExpandedCategories = resolveExpandedCategories(
        current,
        selectedDemo.id,
        selectedCategory.id
      );

      return {
        syncedDemoId: selectedDemo.id,
        expandedCategories: currentExpandedCategories.includes(categoryId)
          ? currentExpandedCategories.filter((id) => id !== categoryId)
          : [...currentExpandedCategories, categoryId],
      };
    });
  }

  function selectDemo(demo: DemoDefinition) {
    const nextParams = new URLSearchParams(searchParams.toString());

    nextParams.set("demo", demo.id);

    const query = nextParams.toString();
    onSearchParamsStringChange?.(query);

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  const sidebarNavigation = (
    <nav className={styles.sidebarNav} aria-label="Demo navigation">
      {DEMO_CATEGORIES.map((category) => {
        const isOpen = expandedCategories.includes(category.id);
        const categoryPanelId = `demo-category-panel-${category.id}`;

        return (
          <section key={category.id} className={styles.category}>
            <button
              type="button"
              className={styles.categoryToggle}
              onClick={() => toggleCategory(category.id)}
              aria-expanded={isOpen}
              aria-controls={categoryPanelId}
            >
              <span className={styles.categoryToggleCopy}>
                <strong className={styles.categoryLabel}>{category.label}</strong>
              </span>
              <ChevronDown
                className={cx(
                  styles.categoryChevron,
                  isOpen && styles.categoryChevronOpen
                )}
                strokeWidth={1.7}
              />
            </button>

            <AnimatedCategoryPanel id={categoryPanelId} isOpen={isOpen}>
              <div className={styles.demoList}>
                {category.items.map((item) => {
                  if (item.type === "demo") {
                    const demo = DEMO_BY_ID.get(item.demoId);

                    if (!demo) {
                      return null;
                    }

                    const isActive = demo.id === selectedDemo.id;

                    return (
                      <Link
                        key={demo.id}
                        href={getDemoPath(demo.id)}
                        scroll={false}
                        className={cx(
                          styles.demoLink,
                          isActive && styles.demoLinkActive
                        )}
                        onClick={(event) => {
                          event.preventDefault();
                          selectDemo(demo);
                        }}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <strong className={styles.demoLinkTitle}>{demo.title}</strong>
                      </Link>
                    );
                  }

                  return (
                    <div key={item.id} className={styles.demoGroup}>
                      <span className={styles.demoGroupLabel}>{item.label}</span>
                      <div className={styles.demoGroupList}>
                        {item.demoIds.map((demoId) => {
                          const demo = DEMO_BY_ID.get(demoId);

                          if (!demo) {
                            return null;
                          }

                          const isActive = demo.id === selectedDemo.id;

                          return (
                            <Link
                              key={demo.id}
                              href={getDemoPath(demo.id)}
                              scroll={false}
                              className={cx(
                                styles.demoLink,
                                isActive && styles.demoLinkActive
                              )}
                              onClick={(event) => {
                                event.preventDefault();
                                selectDemo(demo);
                              }}
                              aria-current={isActive ? "page" : undefined}
                            >
                              <strong className={styles.demoLinkTitle}>
                                {demo.title}
                              </strong>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedCategoryPanel>
          </section>
        );
      })}
    </nav>
  );

  return (
    <div
      className={styles.page}
      data-demo-canvas-shell=""
      style={DEMO_CANVAS_SHELL_CSS_VARS}
    >
      <style dangerouslySetInnerHTML={{ __html: DEMO_CANVAS_SHELL_RESPONSIVE_CSS }} />
      <div className={styles.shell}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <div className={styles.sidebarIntro}>
                <span className={styles.sidebarKicker}>Browse</span>
                <strong className={styles.sidebarTitle}>{DEMOS.length} demos</strong>
                <p className={styles.sidebarCopy}>
                  Resize or refresh the page while viewing a demo to see layouts reflow and skeletons fade out.
                </p>
              </div>

              <SidebarScrollRegion>{sidebarNavigation}</SidebarScrollRegion>
            </div>
          </aside>

          <main className={styles.main}>
            <h1 className={styles.visuallyHidden}>{pageHeading}</h1>
            <SelectedDemoPane
              key={selectedDemo.id}
              selectedCategoryLabel={selectedCategory.label}
              selectedDemo={selectedDemo}
              selectedDemoCanvasClassName={selectedDemoCanvasClassName}
              selectedDemoSource={selectedDemoSource}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DemosPageClient(props: {
  initialSearchParamsString: string;
  skeletonCacheSnapshots?: Record<string, SkeletonCacheSnapshot | null | undefined>;
}) {
  const { initialSearchParamsString, skeletonCacheSnapshots } = props;
  const [searchParamsString, setSearchParamsString] = useState(
    initialSearchParamsString
  );

  useEffect(() => {
    setSearchParamsString(initialSearchParamsString);
  }, [initialSearchParamsString]);

  useEffect(() => {
    function syncSearchParamsFromLocation() {
      setSearchParamsString(window.location.search.replace(/^\?/, ""));
    }

    window.addEventListener("popstate", syncSearchParamsFromLocation);

    return () => {
      window.removeEventListener("popstate", syncSearchParamsFromLocation);
    };
  }, []);

  return (
    <SkeletonCacheProvider snapshots={skeletonCacheSnapshots}>
      <DemosPageContent
        searchParamsString={searchParamsString}
        onSearchParamsStringChange={setSearchParamsString}
      />
    </SkeletonCacheProvider>
  );
}
