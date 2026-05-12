import { readFile } from "node:fs/promises";
import path from "node:path";
import type { JSX, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/ui/code-block";
import styles from "./docs.module.css";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "The React Motion Gallery README, with package entry points and API reference.",
  alternates: { canonical: "/docs" },
};

const PACKAGE_README_RELATIVE_PATH = "packages/react-motion-gallery/README.md";
const PACKAGE_GITHUB_BASE_URL =
  "https://github.com/davidmedero/react-motion-gallery/blob/main/packages/react-motion-gallery";

type EntryPoint = {
  category: string;
  entry: string;
  imports: string;
  description: string;
};

const entryPoints: EntryPoint[] = [
  {
    category: "Styles",
    entry: "react-motion-gallery/styles.css",
    imports: "compiled stylesheet",
    description: "Required styles for gallery primitives and controls.",
  },
  {
    category: "Utilities",
    entry: "react-motion-gallery/media",
    imports: "toMediaItems",
    description: "Media normalization helpers.",
  },
  {
    category: "Utilities",
    entry: "react-motion-gallery/responsive",
    imports: "BREAKPOINT_MAP",
    description: "Shared breakpoint aliases for public responsive props.",
  },
  {
    category: "Core",
    entry: "react-motion-gallery/core",
    imports: "GalleryCore, GalleryCoreProvider, useGalleryCore",
    description: "Fullscreen state, shared gallery context, and layout ownership.",
  },
  {
    category: "Layout",
    entry: "react-motion-gallery/slider",
    imports: "Slider, createSliderIndexChannel",
    description: "Ergonomic slider with a small core and lazy extended behavior.",
  },
  {
    category: "Layout",
    entry: "react-motion-gallery/slider/ready",
    imports: "useSliderReady",
    description: "Slider readiness hook for stable skeleton and content reveal timing.",
  },
  {
    category: "Layout",
    entry: "react-motion-gallery/grid",
    imports: "Grid, Grid.Item",
    description: "Direct-child CSS Grid layouts with responsive tracks and item spans.",
  },
  {
    category: "Layout",
    entry: "react-motion-gallery/grid/ready",
    imports: "useGridReady",
    description: "Grid readiness hook for stable Skeleton wrapper handoff.",
  },
  {
    category: "Layout",
    entry: "react-motion-gallery/masonry",
    imports: "Masonry, Masonry.Item",
    description: "Measured uneven layouts with balanced or source-order placement.",
  },
  {
    category: "Layout",
    entry: "react-motion-gallery/masonry/ready",
    imports: "useMasonryReady",
    description: "Masonry readiness hook for measured Skeleton wrapper handoff.",
  },
  {
    category: "Data",
    entry: "react-motion-gallery/entries",
    imports: "Entries, flattenEntries, entry media container helpers",
    description: "Structured editorial entries with coordinated text and media.",
  },
  {
    category: "Loading",
    entry: "react-motion-gallery/skeleton/base",
    imports: "Skeleton",
    description: "Standalone and wrapper skeletons that can mirror final layouts.",
  },
  {
    category: "Fullscreen",
    entry: "react-motion-gallery/fullscreen",
    imports: "useFullscreenController",
    description: "Small fullscreen controller hook. Add fullscreenSlider for the runtime.",
  },
  {
    category: "Fullscreen",
    entry: "react-motion-gallery/fullscreen/slider",
    imports: "fullscreenSlider",
    description: "Fullscreen slider runtime plugin.",
  },
  {
    category: "Fullscreen",
    entry: "react-motion-gallery/fullscreen/controls",
    imports: "fullscreenControls",
    description: "Option plugin for fullscreen close, arrows, and counter behavior.",
  },
  {
    category: "Fullscreen",
    entry: "react-motion-gallery/fullscreen/captions",
    imports: "fullscreenCaptions",
    description: "Fullscreen caption runtime plugin.",
  },
  {
    category: "Fullscreen",
    entry: "react-motion-gallery/fullscreen/zoom-pan",
    imports: "fullscreenZoomPan",
    description: "Fullscreen click zoom, pan, and pinch runtime plugin.",
  },
  {
    category: "Fullscreen",
    entry: "react-motion-gallery/fullscreen/video",
    imports: "fullscreenVideo",
    description: "Fullscreen Plyr video runtime plugin.",
  },
  {
    category: "Fullscreen",
    entry: "react-motion-gallery/fullscreen/lazy-load",
    imports: "fullscreenLazyLoad",
    description: "Fullscreen media lazy-load runtime plugin.",
  },
  {
    category: "Fullscreen",
    entry: "react-motion-gallery/fullscreen/crossfade",
    imports: "fullscreenCrossfade",
    description: "Fullscreen crossfade navigation option plugin.",
  },
  {
    category: "Fullscreen",
    entry: "react-motion-gallery/fullscreen/thumbnails",
    imports: "fullscreenThumbnails",
    description: "Option plugin for fullscreen thumbnail bridge behavior.",
  },
  {
    category: "Navigation",
    entry: "react-motion-gallery/thumbnails",
    imports: "ThumbnailSlider and thumbnail sync helpers",
    description: "Synced thumbnail rails for base sliders and gallery navigation.",
  },
  {
    category: "Navigation",
    entry: "react-motion-gallery/fullscreenThumbnails",
    imports: "FullscreenThumbnailSlider",
    description: "Thumbnail strips that connect directly to fullscreen state.",
  },
  {
    category: "Media",
    entry: "react-motion-gallery/video",
    imports: "Video",
    description: "Gallery-ready video rendering for HTML5, YouTube, and Vimeo.",
  },
  {
    category: "Media",
    entry: "react-motion-gallery/zoomPan",
    imports: "ZoomPanImage",
    description: "A clipped image zoom surface with drag, wheel, and pinch gestures.",
  },
];

const entryPointTabs = [
  {
    id: "root",
    label: "Root",
    language: "tsx",
    filename: "root-imports.ts",
    code: [
      'import "react-motion-gallery/styles.css";',
      'import {',
      "  BREAKPOINT_MAP,",
      "  Entries,",
      "  FullscreenThumbnailSlider,",
      "  GalleryCore,",
      "  Grid,",
      "  Masonry,",
      "  Slider,",
      "  ThumbnailSlider,",
      "  Video,",
      "  ZoomPanImage,",
      "  createSliderIndexChannel,",
      "  createThumbnailSyncBridge,",
      "  flattenEntries,",
      "  toMediaItems,",
      "  useFullscreenController,",
      "  useGalleryCore,",
      "  useGridReady,",
      "  useMasonryReady,",
      "  useSliderReady,",
      '} from "react-motion-gallery";',
    ].join("\n"),
  },
  {
    id: "styles",
    label: "Styles",
    language: "tsx",
    filename: "styles-import.ts",
    code: 'import "react-motion-gallery/styles.css";',
  },
  {
    id: "media",
    label: "Media",
    language: "tsx",
    filename: "media-imports.ts",
    code: [
      'import { toMediaItems } from "react-motion-gallery/media";',
      "",
      'import type { MediaItem } from "react-motion-gallery/media";',
    ].join("\n"),
  },
  {
    id: "responsive",
    label: "Responsive",
    language: "tsx",
    filename: "responsive-imports.ts",
    code: 'import { BREAKPOINT_MAP } from "react-motion-gallery/responsive";',
  },
  {
    id: "core",
    label: "Core",
    language: "tsx",
    filename: "core-imports.ts",
    code: 'import { GalleryCore, GalleryCoreProvider, useGalleryCore } from "react-motion-gallery/core";',
  },
  {
    id: "slider",
    label: "Slider",
    language: "tsx",
    filename: "slider-imports.ts",
    code: [
      'import "react-motion-gallery/styles.css";',
      'import SliderDefault, { Slider, createSliderIndexChannel } from "react-motion-gallery/slider";',
      'import { useSliderReady } from "react-motion-gallery/slider/ready";',
    ].join("\n"),
  },
  {
    id: "grid",
    label: "Grid",
    language: "tsx",
    filename: "grid-imports.ts",
    code: [
      'import "react-motion-gallery/styles.css";',
      'import GridDefault, { Grid } from "react-motion-gallery/grid";',
      'import { useGridReady } from "react-motion-gallery/grid/ready";',
    ].join("\n"),
  },
  {
    id: "masonry",
    label: "Masonry",
    language: "tsx",
    filename: "masonry-imports.ts",
    code: [
      'import "react-motion-gallery/styles.css";',
      'import MasonryDefault, { Masonry } from "react-motion-gallery/masonry";',
      'import { useMasonryReady } from "react-motion-gallery/masonry/ready";',
    ].join("\n"),
  },
  {
    id: "entries",
    label: "Entries",
    language: "tsx",
    filename: "entries-imports.ts",
    code: [
      'import "react-motion-gallery/styles.css";',
      'import EntriesDefault, {',
      "  Entries,",
      "  EntryList,",
      "  createEntriesGridMedia,",
      "  createEntriesMasonryMedia,",
      "  createEntriesSliderMedia,",
      "  flattenEntries,",
      "  nodeFromMediaDefault,",
      "  resolveEntryLoadingVisualState,",
      "  useEntryDecodeReady,",
      "  useEntryInView,",
      "  useNormalizedEntriesIntro,",
      "  useNormalizedEntriesLoading,",
      '} from "react-motion-gallery/entries";',
    ].join("\n"),
  },
  {
    id: "skeleton",
    label: "Skeleton",
    language: "tsx",
    filename: "skeleton-imports.ts",
    code: [
      'import "react-motion-gallery/styles.css";',
      'import SkeletonDefault, { Skeleton } from "react-motion-gallery/skeleton/base";',
      "",
      'import type { SkeletonNode } from "react-motion-gallery/skeleton/base";',
    ].join("\n"),
  },
  {
    id: "fullscreen",
    label: "Fullscreen",
    language: "tsx",
    filename: "fullscreen-imports.ts",
    code: [
      'import "react-motion-gallery/styles.css";',
      'import { useFullscreenController } from "react-motion-gallery/fullscreen";',
      'import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";',
    ].join("\n"),
  },
  {
    id: "thumbnails",
    label: "Thumbnails",
    language: "tsx",
    filename: "thumbnails-imports.ts",
    code: [
      'import "react-motion-gallery/styles.css";',
      'import ThumbnailSliderDefault, {',
      "  ThumbnailSlider,",
      "  createThumbnailSyncBridge,",
      '} from "react-motion-gallery/thumbnails";',
    ].join("\n"),
  },
  {
    id: "fullscreen-thumbnails",
    label: "Fullscreen Thumbs",
    language: "tsx",
    filename: "fullscreen-thumbnails-imports.ts",
    code: [
      'import "react-motion-gallery/styles.css";',
      'import FullscreenThumbnailSliderDefault, {',
      "  FullscreenThumbnailSlider,",
      '} from "react-motion-gallery/fullscreenThumbnails";',
    ].join("\n"),
  },
  {
    id: "video",
    label: "Video",
    language: "tsx",
    filename: "video-imports.ts",
    code: [
      'import "react-motion-gallery/styles.css";',
      'import VideoDefault, { Video } from "react-motion-gallery/video";',
    ].join("\n"),
  },
  {
    id: "zoom-pan",
    label: "ZoomPan",
    language: "tsx",
    filename: "zoom-pan-imports.ts",
    code: [
      'import "react-motion-gallery/styles.css";',
      'import ZoomPanImageDefault, { ZoomPanImage } from "react-motion-gallery/zoomPan";',
    ].join("\n"),
  },
];

type MarkdownBlock =
  | { type: "heading"; depth: number; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; language: string; code: string }
  | { type: "table"; rows: string[][] }
  | { type: "rule" };

type ReadmeContent = {
  title: string;
  introBlocks: MarkdownBlock[];
  bodyBlocks: MarkdownBlock[];
};

type TocItem = {
  id: string;
  label: string;
};

async function readPackageReadme(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), PACKAGE_README_RELATIVE_PATH),
    path.join(process.cwd(), "..", "..", PACKAGE_README_RELATIVE_PATH),
  ];

  for (const candidate of candidates) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      continue;
    }
  }

  throw new Error(`Unable to read ${PACKAGE_README_RELATIVE_PATH}`);
}

function removeEntryPointTable(markdown: string): string {
  const lines = markdown.split(/\r\n|\r|\n/);
  const startIndex = lines.findIndex((line) =>
    line.startsWith("The package root exports the primary public components")
  );

  if (startIndex < 0) {
    return markdown;
  }

  let endIndex = startIndex + 1;

  while (endIndex < lines.length) {
    while (endIndex < lines.length && lines[endIndex].trim() === "") {
      endIndex += 1;
    }

    if (lines[endIndex]?.trim().startsWith("|")) {
      break;
    }

    if (lines[endIndex]?.startsWith("## ")) {
      break;
    }

    while (endIndex < lines.length && lines[endIndex].trim() !== "") {
      endIndex += 1;
    }
  }

  while (endIndex < lines.length && lines[endIndex].trim().startsWith("|")) {
    endIndex += 1;
  }

  while (endIndex < lines.length && lines[endIndex].trim() === "") {
    endIndex += 1;
  }

  return [...lines.slice(0, startIndex), ...lines.slice(endIndex)].join("\n");
}

function splitReadme(markdown: string): ReadmeContent {
  const cleanedMarkdown = removeEntryPointTable(markdown.trim());
  const lines = cleanedMarkdown.split(/\r\n|\r|\n/);
  const titleLine = lines[0] ?? "# React Motion Gallery";
  const title = titleLine.replace(/^#\s+/, "").trim();
  const firstSectionIndex = lines.findIndex(
    (line, index) => index > 0 && line.startsWith("## ")
  );
  const introMarkdown = lines
    .slice(1, firstSectionIndex > 0 ? firstSectionIndex : lines.length)
    .join("\n")
    .trim();
  const bodyMarkdown =
    firstSectionIndex > 0 ? lines.slice(firstSectionIndex).join("\n").trim() : "";

  return {
    title,
    introBlocks: parseMarkdown(introMarkdown),
    bodyBlocks: parseMarkdown(bodyMarkdown),
  };
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = markdown.split(/\r\n|\r|\n/);
  const slugCounts = new Map<string, number>();
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();

    if (trimmed === "" || trimmed.startsWith("<!--")) {
      index += 1;
      continue;
    }

    const fenceMatch = line.match(/^```([\w-]*)\s*$/);
    if (fenceMatch) {
      const language = fenceMatch[1] || "tsx";
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index]?.startsWith("```")) {
        codeLines.push(lines[index] ?? "");
        index += 1;
      }

      blocks.push({
        type: "code",
        language,
        code: codeLines.join("\n"),
      });
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const text = headingMatch[2].trim();
      const baseId = slugify(text);
      const currentCount = slugCounts.get(baseId) ?? 0;
      slugCounts.set(baseId, currentCount + 1);
      blocks.push({
        type: "heading",
        depth: headingMatch[1].length,
        text,
        id: currentCount === 0 ? baseId : `${baseId}-${currentCount + 1}`,
      });
      index += 1;
      continue;
    }

    if (trimmed === "---") {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      const tableLines: string[] = [];

      while (index < lines.length && lines[index]?.trim().startsWith("|")) {
        tableLines.push(lines[index] ?? "");
        index += 1;
      }

      const rows = tableLines
        .filter((tableLine, rowIndex) => rowIndex !== 1)
        .map(parseTableRow);

      blocks.push({ type: "table", rows });
      continue;
    }

    const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      const ordered = /\d+\./.test(listMatch[2]);
      const items: string[] = [];

      while (index < lines.length) {
        const itemMatch = lines[index]?.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);

        if (!itemMatch || /\d+\./.test(itemMatch[2]) !== ordered) {
          break;
        }

        items.push(itemMatch[3].trim());
        index += 1;
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length && !isBlockStart(lines, index)) {
      paragraphLines.push(lines[index] ?? "");
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.map((paragraphLine) => paragraphLine.trim()).join(" "),
    });
  }

  return blocks;
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index] ?? "";
  const trimmed = line.trim();

  return (
    trimmed === "" ||
    trimmed === "---" ||
    trimmed.startsWith("<!--") ||
    line.startsWith("```") ||
    /^#{1,6}\s+/.test(line) ||
    /^(\s*)([-*]|\d+\.)\s+/.test(line) ||
    isTableStart(lines, index)
  );
}

function isTableStart(lines: string[], index: number): boolean {
  const current = lines[index]?.trim() ?? "";
  const next = lines[index + 1]?.trim() ?? "";

  return current.startsWith("|") && /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(next);
}

function parseTableRow(row: string): string[] {
  const normalizedRow = row.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let cell = "";
  let codeTickCount = 0;
  let escaped = false;

  for (let index = 0; index < normalizedRow.length; index += 1) {
    const character = normalizedRow[index];

    if (escaped) {
      cell += character;
      escaped = false;
      continue;
    }

    if (character === "\\") {
      escaped = true;
      continue;
    }

    if (character === "`") {
      let tickCount = 1;

      while (normalizedRow[index + tickCount] === "`") {
        tickCount += 1;
      }

      cell += "`".repeat(tickCount);
      index += tickCount - 1;

      if (codeTickCount === 0) {
        codeTickCount = tickCount;
      } else if (codeTickCount === tickCount) {
        codeTickCount = 0;
      }

      continue;
    }

    if (character === "|" && codeTickCount === 0) {
      cells.push(cell.trim());
      cell = "";
      continue;
    }

    cell += character;
  }

  cells.push(cell.trim());
  return cells;
}

function slugify(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function resolveReadmeHref(href: string): string {
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("#") ||
    href.startsWith("/")
  ) {
    return href;
  }

  if (href.startsWith("./")) {
    return `${PACKAGE_GITHUB_BASE_URL}/${href.slice(2)}`;
  }

  return href;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const normalizedText = text.replace(/\\\|/g, "|");
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < normalizedText.length) {
    if (normalizedText.startsWith("**", index)) {
      const closeIndex = normalizedText.indexOf("**", index + 2);

      if (closeIndex > index) {
        nodes.push(
          <strong key={`${keyPrefix}-strong-${index}`}>
            {renderInline(normalizedText.slice(index + 2, closeIndex), `${keyPrefix}-${index}`)}
          </strong>
        );
        index = closeIndex + 2;
        continue;
      }
    }

    if (normalizedText[index] === "`") {
      const closeIndex = normalizedText.indexOf("`", index + 1);

      if (closeIndex > index) {
        nodes.push(
          <code key={`${keyPrefix}-code-${index}`}>
            {normalizedText.slice(index + 1, closeIndex)}
          </code>
        );
        index = closeIndex + 1;
        continue;
      }
    }

    if (normalizedText[index] === "[") {
      const labelEndIndex = normalizedText.indexOf("]", index + 1);
      const urlStartIndex = labelEndIndex >= 0 ? normalizedText.indexOf("(", labelEndIndex) : -1;
      const urlEndIndex = urlStartIndex >= 0 ? normalizedText.indexOf(")", urlStartIndex) : -1;

      if (
        labelEndIndex > index &&
        urlStartIndex === labelEndIndex + 1 &&
        urlEndIndex > urlStartIndex
      ) {
        const label = normalizedText.slice(index + 1, labelEndIndex);
        const href = resolveReadmeHref(normalizedText.slice(urlStartIndex + 1, urlEndIndex));
        const children = renderInline(label, `${keyPrefix}-link-${index}`);

        nodes.push(
          href.startsWith("/") || href.startsWith("#") ? (
            <Link href={href} key={`${keyPrefix}-link-${index}`}>
              {children}
            </Link>
          ) : (
            <a
              href={href}
              key={`${keyPrefix}-link-${index}`}
              rel="noreferrer"
              target="_blank"
            >
              {children}
            </a>
          )
        );
        index = urlEndIndex + 1;
        continue;
      }
    }

    const nextSpecialIndex = findNextSpecialIndex(normalizedText, index + 1);
    const endIndex = nextSpecialIndex < 0 ? normalizedText.length : nextSpecialIndex;
    nodes.push(normalizedText.slice(index, endIndex));
    index = endIndex;
  }

  return nodes;
}

function findNextSpecialIndex(text: string, startIndex: number): number {
  const candidates = ["`", "[", "**"]
    .map((token) => text.indexOf(token, startIndex))
    .filter((candidate) => candidate >= 0);

  return candidates.length > 0 ? Math.min(...candidates) : -1;
}

function buildTableOfContents(blocks: MarkdownBlock[]): TocItem[] {
  return [
    { id: "entry-points", label: "Entry points" },
    ...blocks.flatMap((block) =>
      block.type === "heading" && block.depth === 2
        ? [{ id: block.id, label: block.text.replace(/`/g, "") }]
        : []
    ),
  ];
}

function DocsCodeBlock(props: {
  code: string;
  filename?: string;
  language?: string;
  tabs?: Array<{
    id: string;
    label: string;
    code: string;
    filename?: string;
    language?: string;
  }>;
}): JSX.Element {
  return (
    <CodeBlock
      className={`${styles.codeBlock} rmgGlassCodeBlock`}
      code={props.code}
      copyable
      disableAnimations
      filename={props.filename}
      language={props.language ?? "tsx"}
      tabs={props.tabs}
    />
  );
}

function MarkdownBlocks(props: { blocks: MarkdownBlock[] }): JSX.Element {
  return (
    <>
      {props.blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const HeadingTag = `h${Math.min(block.depth, 4)}` as keyof JSX.IntrinsicElements;

            return (
              <HeadingTag id={block.id} key={`${block.id}-${index}`}>
                {renderInline(block.text, `${block.id}-${index}`)}
              </HeadingTag>
            );
          }
          case "paragraph":
            return <p key={`p-${index}`}>{renderInline(block.text, `p-${index}`)}</p>;
          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";

            return (
              <ListTag key={`list-${index}`}>
                {block.items.map((item, itemIndex) => (
                  <li key={`${index}-${itemIndex}`}>
                    {renderInline(item, `li-${index}-${itemIndex}`)}
                  </li>
                ))}
              </ListTag>
            );
          }
          case "code":
            return (
              <DocsCodeBlock
                code={block.code}
                key={`code-${index}`}
                language={block.language}
              />
            );
          case "table":
            return <MarkdownTable key={`table-${index}`} rows={block.rows} />;
          case "rule":
            return <hr key={`rule-${index}`} />;
          default:
            return null;
        }
      })}
    </>
  );
}

function MarkdownTable(props: { rows: string[][] }): JSX.Element | null {
  const [headerRow, ...bodyRows] = props.rows;

  if (!headerRow) {
    return null;
  }

  const isPropTable =
    headerRow.length === 4 &&
    headerRow[0] === "Option" &&
    headerRow[1] === "Type" &&
    headerRow[2] === "Default" &&
    headerRow[3] === "Notes";
  const tableClassName = isPropTable
    ? `${styles.tableWrap} ${styles.markdownTableWrap} ${styles.propTableWrap}`
    : `${styles.tableWrap} ${styles.markdownTableWrap}`;

  return (
    <div className={tableClassName}>
      <table>
        <thead>
          <tr>
            {headerRow.map((cell, index) => (
              <th key={`head-${index}`} scope="col">
                {renderInline(cell, `head-${index}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`cell-${rowIndex}-${cellIndex}`}>
                  {renderInline(cell, `cell-${rowIndex}-${cellIndex}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EntryPointsTable(): JSX.Element {
  return (
    <div className={`${styles.tableWrap} ${styles.entryTableWrap}`}>
      <table>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Entry point</th>
            <th scope="col">Main surface</th>
            <th scope="col">Use when</th>
          </tr>
        </thead>
        <tbody>
          {entryPoints.map((entryPoint) => (
            <tr key={entryPoint.entry}>
              <td>
                <span className={styles.entryBadge}>{entryPoint.category}</span>
              </td>
              <td>
                <code>{entryPoint.entry}</code>
              </td>
              <td>{entryPoint.imports}</td>
              <td>{entryPoint.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EntryPointsSection(): JSX.Element {
  return (
    <section className={styles.entrySection} id="entry-points">
      <div className={styles.entryHeader}>
        <p className={styles.kicker}>Entry points</p>
        <h2>Choose the import path that matches the surface you are shipping.</h2>
        <p>
          Use the root export when one module needs several gallery surfaces.
          Prefer subpaths for routes or components that only need one surface,
          like <code>react-motion-gallery/media</code> or{" "}
          <code>react-motion-gallery/slider</code>.
        </p>
        <p>
          Subpaths give bundlers a smaller graph than the root. Less JS to
          transfer, parse, evaluate, and hydrate can improve first loads, cache
          misses, slower devices, and perceived speed.
        </p>
      </div>

      <DocsCodeBlock code={entryPointTabs[0].code} tabs={entryPointTabs} />
      <EntryPointsTable />
    </section>
  );
}

export default async function DocsPage(): Promise<JSX.Element> {
  const readmeMarkdown = await readPackageReadme();
  const readme = splitReadme(readmeMarkdown);
  const tocItems = buildTableOfContents(readme.bodyBlocks);

  return (
    <main className={styles.docsPage}>
      <div className={styles.docsShell}>
        <aside className={styles.toc} aria-label="README sections">
          <p>README</p>
          <nav>
            {tocItems.map((item) => (
              <Link href={`#${item.id}`} key={item.id}>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <article className={styles.readmeArticle}>
          <EntryPointsSection />

          <div className={styles.markdown}>
            <MarkdownBlocks blocks={readme.bodyBlocks} />
          </div>
        </article>
      </div>
    </main>
  );
}
