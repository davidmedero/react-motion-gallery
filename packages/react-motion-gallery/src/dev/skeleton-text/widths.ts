import type { BreakpointMap } from "../../Gallery/shared/responsive";
import type {
  SkeletonBaseStyle,
  SkeletonContainerStyleResponsive,
  SkeletonNode,
  SkeletonWrapStyle,
} from "../../Gallery/shared/skeleton/layout";
import {
  collectResponsiveStyleBreakpoints,
  resolveResponsiveBaseStyleAtMinWidth,
  resolveResponsiveContainerStyleAtMinWidth,
} from "./responsiveStyles";
import { SkeletonTextAnalyzerError } from "./types";

type ContainerNode = Extract<SkeletonNode, { kind: "stack" | "row" | "col" }>;
type LeafNode = Exclude<SkeletonNode, ContainerNode | Extract<SkeletonNode, { kind: "media" }>>;
type RowNode = ContainerNode & { kind: "row" };

function isLeafNode(node: SkeletonNode): node is LeafNode {
  return (
    node.kind === "text" ||
    node.kind === "rect" ||
    node.kind === "square" ||
    node.kind === "circle"
  );
}

function isContainerNode(node: SkeletonNode): node is ContainerNode {
  return node.kind === "stack" || node.kind === "row" || node.kind === "col";
}

function isUnsupportedLengthSyntax(value: string): boolean {
  return /(?:calc|clamp|min|max|var)\s*\(/i.test(value);
}

export function parseSupportedLength(
  value: number | string | undefined,
  referenceWidth: number,
  detailPath: string
): number | null {
  if (value == null) return null;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new SkeletonTextAnalyzerError(
        "UNSUPPORTED_LENGTH",
        "Encountered a non-finite numeric length while resolving text width.",
        { detailPath, value }
      );
    }
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (isUnsupportedLengthSyntax(trimmed)) {
    throw new SkeletonTextAnalyzerError(
      "UNSUPPORTED_LENGTH",
      "Only numeric, px, and % lengths are supported by the development text analyzer.",
      { detailPath, value: trimmed }
    );
  }

  const match = trimmed.match(/^(-?\d*\.?\d+)(px|%)?$/i);
  if (!match) {
    throw new SkeletonTextAnalyzerError(
      "UNSUPPORTED_LENGTH",
      "Only numeric, px, and % lengths are supported by the development text analyzer.",
      { detailPath, value: trimmed }
    );
  }

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return null;

  return match[2] === "%"
    ? referenceWidth * (amount / 100)
    : amount;
}

function parseBoxShorthand(
  value: number | string | undefined,
  referenceWidth: number,
  detailPath: string
): [number, number, number, number] {
  if (value == null) return [0, 0, 0, 0];
  if (typeof value === "number") return [value, value, value, value];

  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return [0, 0, 0, 0];

  const top = parseSupportedLength(parts[0], referenceWidth, `${detailPath}.top`) ?? 0;
  const right =
    parseSupportedLength(parts[1] ?? parts[0], referenceWidth, `${detailPath}.right`) ?? 0;
  const bottom =
    parseSupportedLength(parts[2] ?? parts[0], referenceWidth, `${detailPath}.bottom`) ?? 0;
  const left =
    parseSupportedLength(
      parts[3] ?? parts[1] ?? parts[0],
      referenceWidth,
      `${detailPath}.left`
    ) ?? 0;

  return [top, right, bottom, left];
}

function parseInlinePadding(
  value: number | string | undefined,
  referenceWidth: number,
  detailPath: string
): number {
  const [, right, , left] = parseBoxShorthand(value, referenceWidth, detailPath);
  return right + left;
}

function parseBorderInline(
  value: string | number | undefined,
  referenceWidth: number,
  detailPath: string
): number {
  if (!value) return 0;
  if (typeof value === "number") return value;
  const widthToken = value.trim().split(/\s+/)[0];
  return parseSupportedLength(widthToken, referenceWidth, detailPath) ?? 0;
}

function clampWidth(width: number, detailPath: string): number {
  if (!Number.isFinite(width)) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_WIDTH",
      "Resolved a non-finite width while analyzing a skeleton text node.",
      { detailPath, width }
    );
  }

  if (width <= 0) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_WIDTH",
      "Resolved a non-positive width while analyzing a skeleton text node.",
      { detailPath, width }
    );
  }

  return width;
}

function applyWidthConstraints(
  style: Pick<SkeletonBaseStyle, "width" | "maxWidth"> | undefined,
  availableWidth: number,
  detailPath: string
): number {
  const resolvedWidth =
    parseSupportedLength(style?.width, availableWidth, `${detailPath}.width`) ?? availableWidth;
  const resolvedMaxWidth = parseSupportedLength(
    style?.maxWidth,
    availableWidth,
    `${detailPath}.maxWidth`
  );

  return clampWidth(
    resolvedMaxWidth == null ? resolvedWidth : Math.min(resolvedWidth, resolvedMaxWidth),
    detailPath
  );
}

function resolveNodeStyleWidth(
  node: SkeletonNode,
  availableWidth: number,
  viewportWidth: number,
  breakpointMap: BreakpointMap,
  detailPath: string
): number | null {
  if (isLeafNode(node)) {
    const style = resolveResponsiveBaseStyleAtMinWidth(node.style, viewportWidth, breakpointMap);
    if (!style?.width && !style?.maxWidth) return null;
    return applyWidthConstraints(style, availableWidth, detailPath);
  }

  if (isContainerNode(node) || node.kind === "media") {
    const style = resolveResponsiveContainerStyleAtMinWidth(
      node.style,
      viewportWidth,
      breakpointMap
    );
    if (!style?.width && !style?.maxWidth) return null;
    return applyWidthConstraints(style, availableWidth, detailPath);
  }

  return null;
}

function resolveNodeContentWidth(
  node: SkeletonNode,
  availableWidth: number,
  viewportWidth: number,
  breakpointMap: BreakpointMap,
  detailPath: string
): number {
  if (isLeafNode(node)) {
    const style = resolveResponsiveBaseStyleAtMinWidth(node.style, viewportWidth, breakpointMap);
    return applyWidthConstraints(style, availableWidth, detailPath);
  }

  const style = resolveResponsiveContainerStyleAtMinWidth(
    node.style,
    viewportWidth,
    breakpointMap
  );
  const outerWidth = applyWidthConstraints(style, availableWidth, detailPath);
  const inlinePadding = parseInlinePadding(style?.padding, outerWidth, `${detailPath}.padding`);
  return clampWidth(Math.max(1, outerWidth - inlinePadding), detailPath);
}

export function resolveResponsiveContainerContentWidth(args: {
  style: SkeletonContainerStyleResponsive | undefined;
  availableWidth: number;
  viewportWidth: number;
  breakpointMap: BreakpointMap;
  detailPath: string;
}): number {
  const style = resolveResponsiveContainerStyleAtMinWidth(
    args.style,
    args.viewportWidth,
    args.breakpointMap
  );
  const outerWidth = applyWidthConstraints(style, args.availableWidth, args.detailPath);
  const inlinePadding = parseInlinePadding(
    style?.padding,
    outerWidth,
    `${args.detailPath}.padding`
  );

  return clampWidth(Math.max(1, outerWidth - inlinePadding), args.detailPath);
}

function collectFixedSiblingWidths(
  node: RowNode,
  targetChildIndex: number,
  availableWidth: number,
  viewportWidth: number,
  breakpointMap: BreakpointMap,
  detailPath: string
): { fixedWidth: number; flexibleSiblings: number; targetWidth: number | null } {
  let fixedWidth = 0;
  let flexibleSiblings = 0;
  let targetWidth: number | null = null;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index]!;
    const childWidth = resolveNodeStyleWidth(
      child,
      availableWidth,
      viewportWidth,
      breakpointMap,
      `${detailPath}.children[${index}]`
    );

    if (childWidth == null) {
      flexibleSiblings += 1;
      continue;
    }

    if (index === targetChildIndex) {
      targetWidth = childWidth;
      continue;
    }

    fixedWidth += childWidth;
  }

  return { fixedWidth, flexibleSiblings, targetWidth };
}

function resolveChildAvailableWidth(
  parent: ContainerNode,
  targetChildIndex: number,
  availableWidth: number,
  viewportWidth: number,
  breakpointMap: BreakpointMap,
  detailPath: string
): number {
  const contentWidth = resolveNodeContentWidth(
    parent,
    availableWidth,
    viewportWidth,
    breakpointMap,
    detailPath
  );

  if (parent.kind !== "row") {
    return contentWidth;
  }

  const rowParent = parent as RowNode;
  const style = resolveResponsiveContainerStyleAtMinWidth(
    parent.style,
    viewportWidth,
    breakpointMap
  );
  const gap = parseSupportedLength(style?.gap, contentWidth, `${detailPath}.gap`) ?? 0;
  const totalGap = gap * Math.max(0, rowParent.children.length - 1);
  const { fixedWidth, flexibleSiblings, targetWidth } = collectFixedSiblingWidths(
    rowParent,
    targetChildIndex,
    contentWidth,
    viewportWidth,
    breakpointMap,
    detailPath
  );

  if (targetWidth != null) {
    return targetWidth;
  }

  const remainingWidth = Math.max(1, contentWidth - totalGap - fixedWidth);
  const targetFlexCount = Math.max(1, flexibleSiblings);
  return clampWidth(remainingWidth / targetFlexCount, detailPath);
}

export function resolveWrapContentWidth(
  outerWidth: number,
  wrapStyle: SkeletonWrapStyle | undefined,
  viewportWidth: number,
  breakpointMap: BreakpointMap,
  detailPath: string
): number {
  const style = wrapStyle
    ? (resolveResponsiveBaseStyleAtMinWidth(
        wrapStyle,
        viewportWidth,
        breakpointMap
      ) as SkeletonWrapStyle | undefined)
    : undefined;
  const constrainedOuter = applyWidthConstraints(style, outerWidth, detailPath);
  const inlinePadding = parseInlinePadding(style?.padding, constrainedOuter, `${detailPath}.padding`);
  const inlineBorder = parseBorderInline(style?.border, constrainedOuter, `${detailPath}.border`) * 2;

  return clampWidth(
    Math.max(1, constrainedOuter - inlinePadding - inlineBorder),
    detailPath
  );
}

export function resolveTextNodeWidthFromPath(args: {
  root: SkeletonNode;
  childIndexes: number[];
  availableWidth: number;
  viewportWidth: number;
  breakpointMap: BreakpointMap;
}): number {
  const { root, childIndexes, availableWidth, viewportWidth, breakpointMap } = args;

  const visit = (
    node: SkeletonNode,
    remainingPath: number[],
    width: number,
    detailPath: string
  ): number => {
    if (!remainingPath.length) {
      if (node.kind !== "text") {
        throw new SkeletonTextAnalyzerError(
          "TEXT_NODE_NOT_FOUND",
          "Resolved path does not point to a text node.",
          { detailPath }
        );
      }

      return resolveNodeContentWidth(
        node,
        width,
        viewportWidth,
        breakpointMap,
        detailPath
      );
    }

    if (!isContainerNode(node)) {
      throw new SkeletonTextAnalyzerError(
        "TEXT_NODE_NOT_FOUND",
        "Text node path stepped through a non-container node.",
        { detailPath, kind: node.kind }
      );
    }

    const [nextIndex, ...rest] = remainingPath;
    const child = node.children[nextIndex];

    if (!child) {
      throw new SkeletonTextAnalyzerError(
        "TEXT_NODE_NOT_FOUND",
        "Text node path references a missing child.",
        { detailPath, nextIndex }
      );
    }

    const childWidth = resolveChildAvailableWidth(
      node,
      nextIndex,
      width,
      viewportWidth,
      breakpointMap,
      detailPath
    );

    return visit(child, rest, childWidth, `${detailPath}.children[${nextIndex}]`);
  };

  return visit(root, childIndexes, availableWidth, "itemNode");
}

function collectNodeStyleBreakpoints(
  node: SkeletonNode,
  out: Set<number>,
  breakpointMap: BreakpointMap
) {
  if (isLeafNode(node)) {
    collectResponsiveStyleBreakpoints(node.style, out, breakpointMap);
    return;
  }

  if (isContainerNode(node) || node.kind === "media") {
    collectResponsiveStyleBreakpoints(node.style, out, breakpointMap);
  }
}

export function collectTextPathBreakpoints(args: {
  root: SkeletonNode;
  childIndexes: number[];
  wrapStyle?: SkeletonWrapStyle;
  breakpointMap: BreakpointMap;
  out?: Set<number>;
}): number[] {
  const out = args.out ?? new Set<number>([0]);
  collectResponsiveStyleBreakpoints(args.wrapStyle, out, args.breakpointMap);

  let node: SkeletonNode = args.root;
  collectNodeStyleBreakpoints(node, out, args.breakpointMap);

  for (const childIndex of args.childIndexes) {
    if (node.kind === "row") {
      for (const child of node.children) {
        collectNodeStyleBreakpoints(child, out, args.breakpointMap);
      }
    }

    if (!isContainerNode(node)) {
      break;
    }

    node = node.children[childIndex]!;
    collectNodeStyleBreakpoints(node, out, args.breakpointMap);
  }

  return Array.from(out).sort((a, b) => a - b);
}
