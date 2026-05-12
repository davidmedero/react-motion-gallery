import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  BREAKPOINT_MAP,
  parseLengthLike,
  type BreakpointMap,
} from "../../Gallery/shared/responsive";
import {
  getTextSkeletonMetrics,
  resolveResponsiveTextBarHeight,
  resolveResponsiveTextLineHeight,
  type ResponsiveTextBarHeight,
  type ResponsiveTextLineHeight,
} from "../../Gallery/shared/skeleton/text";
import type {
  ResponsiveBarWidthMap,
  ResponsiveBarWidthValue,
  ResponsiveLastBarWidthMap,
  ResponsiveLineMap,
  WidthMode,
  WrapSegment,
} from "./types";
import { SkeletonTextAnalyzerError } from "./types";

const DEFAULT_CHROME_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DEFAULT_VIEWPORT_MIN = 0;
const DEFAULT_VIEWPORT_MAX = 1920;
const DEFAULT_VIEWPORT_HEIGHT = 1600;
const DEFAULT_SETTLE_MS = 120;
const DEFAULT_VIEWPORT_WORKERS = 1;
export const DEFAULT_LINE_WRAP_GUARD_PX = 0;
const DEFAULT_ENTRIES_READY_TIMEOUT_MS = 10000;
const DEFAULT_ENTRIES_ENTRY_SELECTOR = "[data-rmg-entry-owner]";
const DEFAULT_ENTRIES_MOUNTED_ATTRIBUTE = "data-rmg-entry-mounted";
const DEFAULT_ENTRIES_READY_ATTRIBUTE = "data-rmg-entry-ready";
const DEFAULT_ENTRIES_READY_VALUE = "1";

type BrowserRect = {
  top: number;
  left: number;
  right: number;
  width: number;
  height: number;
};

export type BrowserLineSample = {
  viewportWidth: number;
  containerWidthPx: number;
  lineCount: number;
  lineWidthsPx: number[];
  barWidth: ResponsiveBarWidthValue;
  barHeight?: number;
  lineHeight?: number;
};

export type BrowserViewportMetrics = {
  innerWidth: number;
  documentElementClientWidth: number;
  visualViewportWidth: number | null;
  devicePixelRatio: number;
};

export type BrowserPretextLineSample = {
  exportName: string;
  viewportWidth: number;
  viewportMetrics: BrowserViewportMetrics;
  containerWidthPx: number;
  targetRect: {
    width: number;
    height: number;
    left: number;
    top: number;
  };
  text: string;
  computedFont: string;
  canvasFont: string;
  fontSizePx: number;
  lineHeightPx: number;
  letterSpacingPx: number;
  whiteSpace: string;
  wordBreak: string;
  overflowWrap: string;
  domLineCount: number;
  domLineWidthsPx: number[];
  domBarWidth: ResponsiveBarWidthValue;
  pretextLineCount: number | null;
  pretextLineWidthsPx: number[];
  pretextLines: string[];
  pretextError?: string;
};

type BrowserAnalysisTarget = {
  exportName: string;
  selector: string;
  lineWrapGuardPx?: number;
  widthMode?: WidthMode;
};

type BrowserResponsiveBaseStyle = {
  marginTop?: number | string;
  marginBottom?: number | string;
} | Record<
  string,
  {
    marginTop?: number | string;
    marginBottom?: number | string;
  }
>;

type BrowserSliderRole = {
  role: string;
  selector: string;
  barHeight: ResponsiveTextBarHeight;
  lineHeight: ResponsiveTextLineHeight;
  lineWrapGuardPx?: number;
  style?: BrowserResponsiveBaseStyle;
};

type BrowserSliderTrackedRole = {
  role: string;
  exportName: string;
  widthMode?: WidthMode;
};

type BrowserSliderTrackedItem = {
  itemId: string;
  roles: BrowserSliderTrackedRole[];
};

export type BrowserSliderManifest = {
  itemSelector: string;
  canonicalItemIdAttribute: string;
  cloneAttribute?: string;
  cloneValue?: string;
  roles: BrowserSliderRole[];
  trackedItems: BrowserSliderTrackedItem[];
  rowHeightCompensationExportName: string;
};

export type BrowserMasonryManifest = {
  rootSelector?: string;
  anchorSelector?: string;
  itemSelector: string;
  expectedItemCount?: number;
  columns?: Record<string, number>;
};

export type BrowserEntriesManifest = {
  rootSelector?: string;
  anchorSelector?: string;
  entrySelector: string;
  expectedEntryCount?: number;
  mountedAttribute: string;
  mountedValue: string;
  readyAttribute: string;
  readyValue: string;
  timeoutMs?: number;
};

export type BrowserBreakpointStrategy = "lineChanges" | "lineOrBarChanges";
export type BrowserBarWidthUnit = "percent" | "px";
export type BrowserLineMeasurementMethod = "domRange";

export type BrowserSkeletonTextManifest = {
  url: string;
  outputFile?: string;
  moduleExportName?: string;
  chromePath?: string;
  viewportMin?: number;
  viewportMax?: number;
  viewportHeight?: number;
  viewportWorkers?: number;
  settleMs?: number;
  stableGeometryFrames?: number;
  readyExpression?: string;
  lineWrapGuardPx?: number;
  lineMeasurementMethod?: BrowserLineMeasurementMethod;
  includeTextMetrics?: boolean;
  breakpointStrategy?: BrowserBreakpointStrategy;
  barWidthUnit?: BrowserBarWidthUnit;
  targets?: BrowserAnalysisTarget[];
  slider?: BrowserSliderManifest;
  masonry?: BrowserMasonryManifest;
  entries?: BrowserEntriesManifest;
};

export type BrowserTextMeasurement = {
  kind: "text";
  exportName: string;
  value: {
    lines: number | Record<number, number>;
    barWidth?: string | string[] | Record<number, string | string[]>;
    lastBarWidth?: string | Record<number, string>;
    barHeight?: number | Record<number, number>;
    lineHeight?: number | Record<number, number>;
    responsiveBy?: "container";
    segments: WrapSegment[];
  };
};

export type BrowserResponsiveNumberMeasurement = {
  kind: "responsiveNumber";
  exportName: string;
  value: number | Record<number, number>;
};

export type BrowserSkeletonTextMeasurement =
  | BrowserTextMeasurement
  | BrowserResponsiveNumberMeasurement;

export type BrowserResponsiveNumberSample = {
  viewportWidth: number;
  value: number;
};

type BrowserMeasuredRole = {
  containerWidthPx: number;
  lineCount: number;
  lineWidthsPx: number[];
  barHeight?: number;
  lineHeight?: number;
};

type BrowserMeasuredSliderItem = {
  itemId: string;
  isVisible: boolean;
  roles: Record<string, BrowserMeasuredRole>;
};

export type BrowserViewportRange = {
  from: number;
  to: number;
};

export type BrowserViewportWorkerResult = {
  samplesByTarget: Map<string, BrowserLineSample[]>;
  sliderCompensationSamples: BrowserResponsiveNumberSample[];
};

export type BrowserPretextComparisonWorkerResult = {
  samplesByTarget: Map<string, BrowserPretextLineSample[]>;
};

type BrowserViewportProgressReporter = {
  onRangeStart?: (args: {
    range: BrowserViewportRange;
    rangeIndex: number;
    rangeCount: number;
  }) => void;
  onViewportComplete?: (args: {
    viewportWidth: number;
    range: BrowserViewportRange;
    rangeIndex: number;
    rangeCount: number;
  }) => void;
  onRangeComplete?: (args: {
    range: BrowserViewportRange;
    rangeIndex: number;
    rangeCount: number;
  }) => void;
};

type PretextBrowserSourceMap = Record<string, string>;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.max(0, ms));
  });
}

function assertObject(value: unknown, message: string, detail: Record<string, unknown>) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SkeletonTextAnalyzerError("INVALID_INPUT", message, detail);
  }
}

function parseResponsiveMinWidth(
  key: string,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number | null {
  const named = breakpointMap[key];
  if (Number.isFinite(named)) return Math.max(0, named);

  const numeric = Number(key);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, numeric);
}

function isBrowserResponsiveStyleRecord(
  value: unknown,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  return Object.keys(value).some(
    (key) => parseResponsiveMinWidth(key, breakpointMap) != null
  );
}

function resolveBrowserResponsiveBaseStyleAtMinWidth(
  value: BrowserResponsiveBaseStyle | undefined,
  minWidth: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value as { marginTop?: number | string; marginBottom?: number | string } | undefined;
  }

  if (!isBrowserResponsiveStyleRecord(value, breakpointMap)) {
    return value as { marginTop?: number | string; marginBottom?: number | string };
  }

  const base: Record<string, unknown> = {};
  const rules = Object.entries(value)
    .flatMap(([key, raw]) => {
      const responsiveMinWidth = parseResponsiveMinWidth(key, breakpointMap);
      return responsiveMinWidth != null && raw && typeof raw === "object" && !Array.isArray(raw)
        ? [{ minWidth: responsiveMinWidth, value: raw as Record<string, unknown> }]
        : [];
    })
    .sort((left, right) => left.minWidth - right.minWidth);

  for (const [key, raw] of Object.entries(value)) {
    if (parseResponsiveMinWidth(key, breakpointMap) == null) {
      base[key] = raw;
    }
  }

  const resolved = { ...base };
  for (const rule of rules) {
    if (rule.minWidth > minWidth) break;
    Object.assign(resolved, rule.value);
  }

  return resolved as { marginTop?: number | string; marginBottom?: number | string };
}

function isResponsiveMetricValue(
  value: unknown
): value is ResponsiveTextBarHeight | ResponsiveTextLineHeight {
  return (
    typeof value === "number" ||
    (!!value && typeof value === "object" && !Array.isArray(value))
  );
}

function parseBrowserAnalysisTarget(
  target: unknown,
  index: number
): BrowserAnalysisTarget {
  assertObject(
    target,
    "Each browser manifest target must be a JSON object.",
    { index, receivedType: typeof target }
  );

  const request = target as Record<string, unknown>;
  if (typeof request.exportName !== "string" || !request.exportName.trim()) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Each browser manifest target must include a non-empty exportName.",
      { index, exportName: request.exportName }
    );
  }

  if (typeof request.selector !== "string" || !request.selector.trim()) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Each browser manifest target must include a non-empty selector.",
      { index, selector: request.selector }
    );
  }

  if (
    request.widthMode != null &&
    request.widthMode !== "barWidth" &&
    request.widthMode !== "lastBarWidth" &&
    request.widthMode !== "both"
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      'Browser manifest target widthMode must be "barWidth", "lastBarWidth", or "both".',
      { index, widthMode: request.widthMode }
    );
  }

  if (
    request.responsiveBy != null &&
    request.responsiveBy !== "container"
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      'Browser manifest target responsiveBy must be "container".',
      { index, responsiveBy: request.responsiveBy }
    );
  }

  if (
    request.lineWrapGuardPx != null &&
    (!Number.isFinite(request.lineWrapGuardPx as number) ||
      Number(request.lineWrapGuardPx) < 0)
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser manifest target lineWrapGuardPx must be a non-negative number.",
      { index, lineWrapGuardPx: request.lineWrapGuardPx }
    );
  }

  return {
    exportName: request.exportName,
    selector: request.selector,
    lineWrapGuardPx:
      typeof request.lineWrapGuardPx === "number" &&
      Number.isFinite(request.lineWrapGuardPx)
        ? Math.max(0, request.lineWrapGuardPx)
        : undefined,
    widthMode: request.widthMode as WidthMode | undefined,
  };
}

function parseBrowserSliderManifest(value: unknown): BrowserSliderManifest {
  assertObject(value, "Browser manifest slider config must be a JSON object.", {
    receivedType: typeof value,
  });

  const slider = value as Record<string, unknown>;
  if (typeof slider.itemSelector !== "string" || !slider.itemSelector.trim()) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser slider manifest must include a non-empty itemSelector.",
      { itemSelector: slider.itemSelector }
    );
  }

  if (
    typeof slider.canonicalItemIdAttribute !== "string" ||
    !slider.canonicalItemIdAttribute.trim()
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser slider manifest must include a non-empty canonicalItemIdAttribute.",
      { canonicalItemIdAttribute: slider.canonicalItemIdAttribute }
    );
  }

  if (
    typeof slider.rowHeightCompensationExportName !== "string" ||
    !slider.rowHeightCompensationExportName.trim()
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser slider manifest must include a non-empty rowHeightCompensationExportName.",
      { rowHeightCompensationExportName: slider.rowHeightCompensationExportName }
    );
  }

  if (!Array.isArray(slider.roles) || slider.roles.length === 0) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser slider manifest must include a non-empty roles array.",
      { roles: slider.roles }
    );
  }

  if (!Array.isArray(slider.trackedItems) || slider.trackedItems.length === 0) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser slider manifest must include a non-empty trackedItems array.",
      { trackedItems: slider.trackedItems }
    );
  }

  const roles = slider.roles.map((roleValue, roleIndex) => {
    assertObject(
      roleValue,
      "Each browser slider role must be a JSON object.",
      { roleIndex, receivedType: typeof roleValue }
    );

    const role = roleValue as Record<string, unknown>;
    if (typeof role.role !== "string" || !role.role.trim()) {
      throw new SkeletonTextAnalyzerError(
        "INVALID_INPUT",
        "Each browser slider role must include a non-empty role name.",
        { roleIndex, role: role.role }
      );
    }

    if (typeof role.selector !== "string" || !role.selector.trim()) {
      throw new SkeletonTextAnalyzerError(
        "INVALID_INPUT",
        "Each browser slider role must include a non-empty selector.",
        { roleIndex, selector: role.selector }
      );
    }

    if (!isResponsiveMetricValue(role.barHeight)) {
      throw new SkeletonTextAnalyzerError(
        "INVALID_INPUT",
        "Each browser slider role must include a numeric or responsive-object barHeight.",
        { roleIndex, barHeight: role.barHeight }
      );
    }

    if (!isResponsiveMetricValue(role.lineHeight)) {
      throw new SkeletonTextAnalyzerError(
        "INVALID_INPUT",
        "Each browser slider role must include a numeric or responsive-object lineHeight.",
        { roleIndex, lineHeight: role.lineHeight }
      );
    }

    if (role.style != null) {
      assertObject(role.style, "Browser slider role style must be a JSON object.", {
        roleIndex,
        style: role.style,
      });
    }

    if (
      role.lineWrapGuardPx != null &&
      (!Number.isFinite(role.lineWrapGuardPx as number) ||
        Number(role.lineWrapGuardPx) < 0)
    ) {
      throw new SkeletonTextAnalyzerError(
        "INVALID_INPUT",
        "Browser slider role lineWrapGuardPx must be a non-negative number.",
        { roleIndex, lineWrapGuardPx: role.lineWrapGuardPx }
      );
    }

    return {
      role: role.role,
      selector: role.selector,
      barHeight: role.barHeight as ResponsiveTextBarHeight,
      lineHeight: role.lineHeight as ResponsiveTextLineHeight,
      lineWrapGuardPx:
        typeof role.lineWrapGuardPx === "number" &&
        Number.isFinite(role.lineWrapGuardPx)
          ? Math.max(0, role.lineWrapGuardPx)
          : undefined,
      style: role.style as BrowserResponsiveBaseStyle | undefined,
    } satisfies BrowserSliderRole;
  });

  const roleNames = new Set<string>();
  for (const role of roles) {
    if (roleNames.has(role.role)) {
      throw new SkeletonTextAnalyzerError(
        "INVALID_INPUT",
        "Browser slider role names must be unique.",
        { role: role.role }
      );
    }
    roleNames.add(role.role);
  }

  const trackedItems = slider.trackedItems.map((itemValue, itemIndex) => {
    assertObject(
      itemValue,
      "Each browser slider tracked item must be a JSON object.",
      { itemIndex, receivedType: typeof itemValue }
    );

    const item = itemValue as Record<string, unknown>;
    if (typeof item.itemId !== "string" || !item.itemId.trim()) {
      throw new SkeletonTextAnalyzerError(
        "INVALID_INPUT",
        "Each browser slider tracked item must include a non-empty itemId.",
        { itemIndex, itemId: item.itemId }
      );
    }

    if (!Array.isArray(item.roles) || item.roles.length === 0) {
      throw new SkeletonTextAnalyzerError(
        "INVALID_INPUT",
        "Each browser slider tracked item must include a non-empty roles array.",
        { itemIndex, roles: item.roles }
      );
    }

    return {
      itemId: item.itemId,
      roles: item.roles.map((trackedRoleValue, trackedRoleIndex) => {
        assertObject(
          trackedRoleValue,
          "Each browser slider tracked role must be a JSON object.",
          { itemIndex, trackedRoleIndex, receivedType: typeof trackedRoleValue }
        );

        const trackedRole = trackedRoleValue as Record<string, unknown>;
        if (typeof trackedRole.role !== "string" || !trackedRole.role.trim()) {
          throw new SkeletonTextAnalyzerError(
            "INVALID_INPUT",
            "Each browser slider tracked role must include a non-empty role.",
            { itemIndex, trackedRoleIndex, role: trackedRole.role }
          );
        }

        if (!roleNames.has(trackedRole.role)) {
          throw new SkeletonTextAnalyzerError(
            "INVALID_INPUT",
            "Browser slider tracked roles must reference a declared slider role.",
            { itemIndex, trackedRoleIndex, role: trackedRole.role }
          );
        }

        if (
          typeof trackedRole.exportName !== "string" ||
          !trackedRole.exportName.trim()
        ) {
          throw new SkeletonTextAnalyzerError(
            "INVALID_INPUT",
            "Each browser slider tracked role must include a non-empty exportName.",
            { itemIndex, trackedRoleIndex, exportName: trackedRole.exportName }
          );
        }

        if (
          trackedRole.widthMode != null &&
          trackedRole.widthMode !== "barWidth" &&
          trackedRole.widthMode !== "lastBarWidth" &&
          trackedRole.widthMode !== "both"
        ) {
          throw new SkeletonTextAnalyzerError(
            "INVALID_INPUT",
            'Browser slider tracked role widthMode must be "barWidth", "lastBarWidth", or "both".',
            { itemIndex, trackedRoleIndex, widthMode: trackedRole.widthMode }
          );
        }

        return {
          role: trackedRole.role,
          exportName: trackedRole.exportName,
          widthMode: trackedRole.widthMode as WidthMode | undefined,
        } satisfies BrowserSliderTrackedRole;
      }),
    } satisfies BrowserSliderTrackedItem;
  });

  return {
    itemSelector: slider.itemSelector,
    canonicalItemIdAttribute: slider.canonicalItemIdAttribute,
    cloneAttribute:
      typeof slider.cloneAttribute === "string" && slider.cloneAttribute.trim()
        ? slider.cloneAttribute
        : undefined,
    cloneValue:
      typeof slider.cloneValue === "string" && slider.cloneValue.trim()
        ? slider.cloneValue
        : undefined,
    roles,
    trackedItems,
    rowHeightCompensationExportName: slider.rowHeightCompensationExportName,
  };
}

function parseBrowserMasonryManifest(value: unknown): BrowserMasonryManifest {
  assertObject(value, "Browser manifest masonry config must be a JSON object.", {
    receivedType: typeof value,
  });

  const masonry = value as Record<string, unknown>;
  const rootSelector =
    typeof masonry.rootSelector === "string" && masonry.rootSelector.trim()
      ? masonry.rootSelector
      : undefined;
  const anchorSelector =
    typeof masonry.anchorSelector === "string" && masonry.anchorSelector.trim()
      ? masonry.anchorSelector
      : undefined;

  if (!rootSelector && !anchorSelector) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser masonry manifest must include either rootSelector or anchorSelector.",
      {
        rootSelector: masonry.rootSelector,
        anchorSelector: masonry.anchorSelector,
      }
    );
  }

  if (
    masonry.rootSelector != null &&
    (typeof masonry.rootSelector !== "string" || !masonry.rootSelector.trim())
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser masonry manifest rootSelector must be a non-empty string.",
      { rootSelector: masonry.rootSelector }
    );
  }

  if (
    masonry.anchorSelector != null &&
    (typeof masonry.anchorSelector !== "string" || !masonry.anchorSelector.trim())
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser masonry manifest anchorSelector must be a non-empty string.",
      { anchorSelector: masonry.anchorSelector }
    );
  }

  if (
    typeof masonry.itemSelector !== "string" ||
    !masonry.itemSelector.trim()
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser masonry manifest must include a non-empty itemSelector.",
      { itemSelector: masonry.itemSelector }
    );
  }

  if (
    masonry.expectedItemCount != null &&
    (!Number.isFinite(masonry.expectedItemCount as number) ||
      Number(masonry.expectedItemCount) < 1)
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser masonry manifest expectedItemCount must be a positive number.",
      { expectedItemCount: masonry.expectedItemCount }
    );
  }

  let columns: Record<string, number> | undefined;
  if (masonry.columns != null) {
    assertObject(masonry.columns, "Browser masonry manifest columns must be a JSON object.", {
      columns: masonry.columns,
    });

    columns = {};
    for (const [key, rawValue] of Object.entries(
      masonry.columns as Record<string, unknown>
    )) {
      const minWidth = parseResponsiveMinWidth(key);
      const value = Number(rawValue);
      if (minWidth == null || !Number.isFinite(value) || value < 1) {
        throw new SkeletonTextAnalyzerError(
          "INVALID_INPUT",
          "Browser masonry manifest columns must map breakpoints to positive numbers.",
          { key, value: rawValue }
        );
      }

      columns[String(minWidth)] = Math.max(1, Math.trunc(value));
    }

    if (Object.keys(columns).length === 0) {
      throw new SkeletonTextAnalyzerError(
        "INVALID_INPUT",
        "Browser masonry manifest columns must include at least one breakpoint.",
        { columns: masonry.columns }
      );
    }
  }

  return {
    ...(rootSelector ? { rootSelector } : null),
    ...(anchorSelector ? { anchorSelector } : null),
    itemSelector: masonry.itemSelector,
    ...(masonry.expectedItemCount != null
      ? { expectedItemCount: Math.max(1, Math.trunc(Number(masonry.expectedItemCount))) }
      : null),
    ...(columns ? { columns } : null),
  };
}

function parseOptionalNonEmptyString(args: {
  value: unknown;
  fieldName: string;
  message: string;
}): string | undefined {
  if (args.value == null) return undefined;

  if (typeof args.value !== "string" || !args.value.trim()) {
    throw new SkeletonTextAnalyzerError("INVALID_INPUT", args.message, {
      [args.fieldName]: args.value,
    });
  }

  return args.value;
}

function parseBrowserEntriesManifest(value: unknown): BrowserEntriesManifest {
  assertObject(value, "Browser manifest entries config must be a JSON object.", {
    receivedType: typeof value,
  });

  const entries = value as Record<string, unknown>;
  const rootSelector = parseOptionalNonEmptyString({
    value: entries.rootSelector,
    fieldName: "rootSelector",
    message: "Browser entries manifest rootSelector must be a non-empty string.",
  });
  const anchorSelector = parseOptionalNonEmptyString({
    value: entries.anchorSelector,
    fieldName: "anchorSelector",
    message: "Browser entries manifest anchorSelector must be a non-empty string.",
  });
  const entrySelector =
    parseOptionalNonEmptyString({
      value: entries.entrySelector,
      fieldName: "entrySelector",
      message: "Browser entries manifest entrySelector must be a non-empty string.",
    }) ?? DEFAULT_ENTRIES_ENTRY_SELECTOR;
  const mountedAttribute =
    parseOptionalNonEmptyString({
      value: entries.mountedAttribute,
      fieldName: "mountedAttribute",
      message: "Browser entries manifest mountedAttribute must be a non-empty string.",
    }) ?? DEFAULT_ENTRIES_MOUNTED_ATTRIBUTE;
  const mountedValue =
    parseOptionalNonEmptyString({
      value: entries.mountedValue,
      fieldName: "mountedValue",
      message: "Browser entries manifest mountedValue must be a non-empty string.",
    }) ?? DEFAULT_ENTRIES_READY_VALUE;
  const readyAttribute =
    parseOptionalNonEmptyString({
      value: entries.readyAttribute,
      fieldName: "readyAttribute",
      message: "Browser entries manifest readyAttribute must be a non-empty string.",
    }) ?? DEFAULT_ENTRIES_READY_ATTRIBUTE;
  const readyValue =
    parseOptionalNonEmptyString({
      value: entries.readyValue,
      fieldName: "readyValue",
      message: "Browser entries manifest readyValue must be a non-empty string.",
    }) ?? DEFAULT_ENTRIES_READY_VALUE;

  if (
    entries.expectedEntryCount != null &&
    (!Number.isFinite(entries.expectedEntryCount as number) ||
      Number(entries.expectedEntryCount) < 1)
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser entries manifest expectedEntryCount must be a positive number.",
      { expectedEntryCount: entries.expectedEntryCount }
    );
  }

  if (
    entries.timeoutMs != null &&
    (!Number.isFinite(entries.timeoutMs as number) || Number(entries.timeoutMs) < 0)
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser entries manifest timeoutMs must be a non-negative number.",
      { timeoutMs: entries.timeoutMs }
    );
  }

  return {
    ...(rootSelector ? { rootSelector } : null),
    ...(anchorSelector ? { anchorSelector } : null),
    entrySelector,
    ...(entries.expectedEntryCount != null
      ? {
          expectedEntryCount: Math.max(
            1,
            Math.trunc(Number(entries.expectedEntryCount))
          ),
        }
      : null),
    mountedAttribute,
    mountedValue,
    readyAttribute,
    readyValue,
    ...(entries.timeoutMs != null
      ? { timeoutMs: Math.max(0, Number(entries.timeoutMs)) }
      : null),
  };
}

export function parseBrowserSkeletonTextManifest(
  value: unknown
): BrowserSkeletonTextManifest {
  assertObject(value, "Browser manifest must be a JSON object.", {
    receivedType: typeof value,
  });

  const manifest = value as Record<string, unknown>;
  if (typeof manifest.url !== "string" || !manifest.url.trim()) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser manifest must include a non-empty url.",
      { url: manifest.url }
    );
  }

  const hasTargets = Array.isArray(manifest.targets) && manifest.targets.length > 0;
  const hasSlider = manifest.slider != null;
  const hasMasonry = manifest.masonry != null;
  const hasEntries = manifest.entries != null;

  if (!hasTargets && !hasSlider) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser manifest must include a non-empty targets array or a slider config for text measurement.",
      { targets: manifest.targets, slider: manifest.slider, entries: manifest.entries }
    );
  }

  if (
    manifest.barWidthUnit != null &&
    manifest.barWidthUnit !== "percent" &&
    manifest.barWidthUnit !== "px"
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      'Browser manifest barWidthUnit must be "percent" or "px".',
      { barWidthUnit: manifest.barWidthUnit }
    );
  }

  if (
    manifest.responsiveBy != null &&
    manifest.responsiveBy !== "container"
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      'Browser manifest responsiveBy must be "container".',
      { responsiveBy: manifest.responsiveBy }
    );
  }

  if (
    manifest.viewportWorkers != null &&
    (!Number.isFinite(manifest.viewportWorkers as number) ||
      Number(manifest.viewportWorkers) < 1)
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser manifest viewportWorkers must be a positive number.",
      { viewportWorkers: manifest.viewportWorkers }
    );
  }

  if (
    manifest.stableGeometryFrames != null &&
    (!Number.isFinite(manifest.stableGeometryFrames as number) ||
      Number(manifest.stableGeometryFrames) < 1)
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser manifest stableGeometryFrames must be a positive number.",
      { stableGeometryFrames: manifest.stableGeometryFrames }
    );
  }

  if (
    manifest.readyExpression != null &&
    (typeof manifest.readyExpression !== "string" ||
      !manifest.readyExpression.trim())
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser manifest readyExpression must be a non-empty string.",
      { readyExpression: manifest.readyExpression }
    );
  }

  if (
    manifest.lineWrapGuardPx != null &&
    (!Number.isFinite(manifest.lineWrapGuardPx as number) ||
      Number(manifest.lineWrapGuardPx) < 0)
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser manifest lineWrapGuardPx must be a non-negative number.",
      { lineWrapGuardPx: manifest.lineWrapGuardPx }
    );
  }

  if (
    manifest.lineMeasurementMethod != null &&
    manifest.lineMeasurementMethod !== "domRange"
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      'Browser manifest lineMeasurementMethod must be "domRange".',
      { lineMeasurementMethod: manifest.lineMeasurementMethod }
    );
  }

  if (
    manifest.includeTextMetrics != null &&
    typeof manifest.includeTextMetrics !== "boolean"
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser manifest includeTextMetrics must be a boolean.",
      { includeTextMetrics: manifest.includeTextMetrics }
    );
  }

  const targets = hasTargets
    ? (manifest.targets as unknown[]).map((target, index) =>
        parseBrowserAnalysisTarget(target, index)
      )
    : undefined;
  const slider = hasSlider ? parseBrowserSliderManifest(manifest.slider) : undefined;
  const masonry = hasMasonry
    ? parseBrowserMasonryManifest(manifest.masonry)
    : undefined;
  const entries = hasEntries
    ? parseBrowserEntriesManifest(manifest.entries)
    : undefined;

  const exportNames = new Set<string>();
  for (const target of targets ?? []) {
    if (exportNames.has(target.exportName)) {
      throw new SkeletonTextAnalyzerError(
        "INVALID_INPUT",
        "Browser manifest export names must be unique.",
        { exportName: target.exportName }
      );
    }
    exportNames.add(target.exportName);
  }

  if (slider) {
    for (const trackedItem of slider.trackedItems) {
      for (const role of trackedItem.roles) {
        if (exportNames.has(role.exportName)) {
          throw new SkeletonTextAnalyzerError(
            "INVALID_INPUT",
            "Browser manifest export names must be unique across targets and slider tracked roles.",
            { exportName: role.exportName }
          );
        }
        exportNames.add(role.exportName);
      }
    }

    if (exportNames.has(slider.rowHeightCompensationExportName)) {
      throw new SkeletonTextAnalyzerError(
        "INVALID_INPUT",
        "Browser manifest export names must be unique across text and slider compensation exports.",
        { exportName: slider.rowHeightCompensationExportName }
      );
    }
  }

  return {
    url: manifest.url,
    outputFile:
      typeof manifest.outputFile === "string" && manifest.outputFile.trim()
        ? manifest.outputFile
        : undefined,
    moduleExportName:
      typeof manifest.moduleExportName === "string" && manifest.moduleExportName.trim()
        ? manifest.moduleExportName
        : undefined,
    chromePath:
      typeof manifest.chromePath === "string" && manifest.chromePath.trim()
        ? manifest.chromePath
        : undefined,
    viewportMin:
      typeof manifest.viewportMin === "number" && Number.isFinite(manifest.viewportMin)
        ? manifest.viewportMin
        : undefined,
    viewportMax:
      typeof manifest.viewportMax === "number" && Number.isFinite(manifest.viewportMax)
        ? manifest.viewportMax
        : undefined,
    viewportHeight:
      typeof manifest.viewportHeight === "number" &&
      Number.isFinite(manifest.viewportHeight)
        ? manifest.viewportHeight
        : undefined,
    viewportWorkers:
      typeof manifest.viewportWorkers === "number" &&
      Number.isFinite(manifest.viewportWorkers)
        ? Math.max(1, Math.trunc(manifest.viewportWorkers))
        : undefined,
    settleMs:
      typeof manifest.settleMs === "number" && Number.isFinite(manifest.settleMs)
        ? Math.max(0, manifest.settleMs)
        : undefined,
    stableGeometryFrames:
      typeof manifest.stableGeometryFrames === "number" &&
      Number.isFinite(manifest.stableGeometryFrames)
        ? Math.max(1, Math.trunc(manifest.stableGeometryFrames))
        : undefined,
    readyExpression:
      typeof manifest.readyExpression === "string" &&
      manifest.readyExpression.trim()
        ? manifest.readyExpression.trim()
        : undefined,
    lineWrapGuardPx:
      typeof manifest.lineWrapGuardPx === "number" &&
      Number.isFinite(manifest.lineWrapGuardPx)
        ? Math.max(0, manifest.lineWrapGuardPx)
        : undefined,
    lineMeasurementMethod:
      manifest.lineMeasurementMethod === "domRange" ? "domRange" : undefined,
    includeTextMetrics:
      typeof manifest.includeTextMetrics === "boolean"
        ? manifest.includeTextMetrics
        : undefined,
    breakpointStrategy:
      manifest.breakpointStrategy === "lineOrBarChanges"
        ? "lineOrBarChanges"
        : manifest.breakpointStrategy === "lineChanges"
          ? "lineChanges"
          : undefined,
    barWidthUnit:
      manifest.barWidthUnit === "px"
        ? "px"
        : manifest.barWidthUnit === "percent"
          ? "percent"
          : undefined,
    targets,
    slider,
    masonry,
    entries,
  };
}

function sameBarWidthValue(
  left: ResponsiveBarWidthValue,
  right: ResponsiveBarWidthValue
): boolean {
  if (typeof left === "string" || typeof right === "string") {
    return left === right;
  }

  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function sortResponsiveMap<T>(map: Record<number, T>): Record<number, T> {
  const out: Record<number, T> = {};
  for (const key of Object.keys(map)
    .map(Number)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)) {
    out[key] = map[key]!;
  }
  return out;
}

function resolveResponsiveValueAtViewport<T>(
  map: Record<number, T>,
  viewportWidth: number
): T {
  const breakpoints = Object.keys(map)
    .map(Number)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  let resolved = map[breakpoints[0] ?? 0]!;
  for (const breakpoint of breakpoints) {
    if (viewportWidth >= breakpoint) {
      resolved = map[breakpoint]!;
    } else {
      break;
    }
  }

  return resolved;
}

function normalizeLineOutput(
  lines: ResponsiveLineMap
): number | Record<number, number> {
  const values = Object.values(lines);
  return values.every((value) => value === values[0]) ? values[0] ?? 1 : lines;
}

function normalizeBarWidthOutput(
  barWidth: ResponsiveBarWidthMap
): string | string[] | Record<number, string | string[]> {
  const entries = Object.entries(barWidth);
  if (!entries.length) return "100%";

  const [, firstValue] = entries[0]!;
  const isUniform = entries.every(([, value]) => sameBarWidthValue(value, firstValue));
  return isUniform ? firstValue : barWidth;
}

function projectLastBarWidthValue(value: ResponsiveBarWidthValue): string {
  return typeof value === "string" ? value : value[value.length - 1] ?? "100%";
}

function normalizeLastBarWidthOutput(
  value: ResponsiveLastBarWidthMap
): string | Record<number, string> {
  const entries = Object.entries(value);
  if (!entries.length) return "100%";

  const [, firstValue] = entries[0]!;
  const isUniform = entries.every(([, current]) => current === firstValue);
  return isUniform ? firstValue : value;
}

function uniqueSorted(values: Iterable<number>): number[] {
  return Array.from(new Set(values))
    .filter((value) => Number.isFinite(value) && value >= 0)
    .sort((a, b) => a - b);
}

export function buildViewportRanges(args: {
  viewportMin: number;
  viewportMax: number;
  workerCount: number;
}): BrowserViewportRange[] {
  const viewportCount = Math.max(0, args.viewportMax - args.viewportMin + 1);
  if (viewportCount === 0) return [];
  const requestedWorkerCount = Number.isFinite(args.workerCount)
    ? args.workerCount
    : 1;

  const workerCount = Math.max(
    1,
    Math.min(viewportCount, Math.trunc(requestedWorkerCount))
  );
  const baseRangeSize = Math.floor(viewportCount / workerCount);
  const extra = viewportCount % workerCount;
  const ranges: BrowserViewportRange[] = [];
  let from = args.viewportMin;

  for (let index = 0; index < workerCount; index += 1) {
    const size = baseRangeSize + (index < extra ? 1 : 0);
    const to = from + size - 1;
    ranges.push({ from, to });
    from = to + 1;
  }

  return ranges;
}

function projectLastBarWidthMap(barWidth: ResponsiveBarWidthMap): ResponsiveLastBarWidthMap {
  const out: ResponsiveLastBarWidthMap = {};
  for (const [key, value] of Object.entries(barWidth)) {
    out[Number(key)] = projectLastBarWidthValue(value);
  }
  return sortResponsiveMap(out);
}

function roundResponsiveNumberValue(value: number): number {
  return Math.max(0, Math.round(value * 1000) / 1000);
}

function normalizeResponsiveNumberOutput(
  value: Record<number, number>
): number | Record<number, number> {
  const entries = Object.entries(value);
  if (!entries.length) return 0;

  const [, firstValue] = entries[0]!;
  const isUniform = entries.every(([, current]) => current === firstValue);
  return isUniform ? firstValue : value;
}

function roundTextMetricValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value * 1000) / 1000);
}

function roundPercent(value: number): string {
  const percent = Math.max(1, Math.min(100, Math.round(value)));
  return percent >= 99 ? "100%" : `${percent}%`;
}

function roundPx(value: number): string {
  return `${Math.max(1, Math.round(value))}px`;
}

function roundContainerBreakpoint(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value * 1000) / 1000);
}

function responsiveSampleKey(sample: BrowserLineSample): number {
  return roundContainerBreakpoint(sample.containerWidthPx);
}

function sortSamplesByContainerWidth(samples: BrowserLineSample[]): BrowserLineSample[] {
  return [...samples].sort((left, right) => {
    const byWidth = left.containerWidthPx - right.containerWidthPx;
    return byWidth || left.viewportWidth - right.viewportWidth;
  });
}

export function groupClientRectsIntoLineWidths(rects: BrowserRect[]): number[] {
  const sorted = [...rects]
    .filter((rect) => rect.width > 0 && rect.height > 0)
    .sort((a, b) => (a.top === b.top ? a.left - b.left : a.top - b.top));

  const lines: Array<{ top: number; left: number; right: number }> = [];

  for (const rect of sorted) {
    const rectMidpoint = rect.top + rect.height / 2;
    const tolerance = Math.max(1, Math.min(3, rect.height / 3));
    const existing = lines.find(
      (line) => Math.abs(line.top - rectMidpoint) <= tolerance
    );
    if (existing) {
      existing.left = Math.min(existing.left, rect.left);
      existing.right = Math.max(existing.right, rect.right);
      continue;
    }

    lines.push({
      top: rectMidpoint,
      left: rect.left,
      right: rect.right,
    });
  }

  return lines.map((line) => Math.max(0, line.right - line.left));
}

export function toBrowserBarWidthValue(args: {
  lineWidthsPx: number[];
  containerWidthPx: number;
  unit?: BrowserBarWidthUnit;
}): ResponsiveBarWidthValue {
  const unit = args.unit ?? "percent";
  const values =
    unit === "px"
      ? args.lineWidthsPx.map((width) => roundPx(width))
      : args.lineWidthsPx.map((width) =>
          roundPercent((width / Math.max(1, args.containerWidthPx)) * 100)
        );

  if (values.length <= 1) {
    return values[0] ?? (unit === "px" ? roundPx(args.containerWidthPx) : "100%");
  }

  return values;
}

export function buildBrowserResponsiveResult(args: {
  exportName: string;
  widthMode?: WidthMode;
  breakpointStrategy?: BrowserBreakpointStrategy;
  includeTextMetrics?: boolean;
  samples: BrowserLineSample[];
}): BrowserTextMeasurement {
  const widthMode = args.widthMode ?? "barWidth";
  const breakpointStrategy = args.breakpointStrategy ?? "lineChanges";
  const samples = sortSamplesByContainerWidth(args.samples);
  const lineBreakpoints = new Set<number>([0]);
  const barBreakpoints =
    breakpointStrategy === "lineOrBarChanges" ? new Set<number>([0]) : new Set<number>();
  const segments: WrapSegment[] = [];

  const firstSample = samples[0];
  if (!firstSample) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser measurement produced no samples.",
      { exportName: args.exportName }
    );
  }

  const firstKey = responsiveSampleKey(firstSample);
  const hasTextMetrics =
    args.includeTextMetrics === true &&
    firstSample.barHeight != null &&
    firstSample.lineHeight != null;
  let previousSample = firstSample;
  let previousSampleKey = firstKey;
  let segmentStart = firstKey;
  let segmentStartWidthPx = firstSample.containerWidthPx;
  const linesMinimal: ResponsiveLineMap = { [firstKey]: firstSample.lineCount };
  const barMinimal: ResponsiveBarWidthMap = { [firstKey]: firstSample.barWidth };
  const textMetricBreakpoints = hasTextMetrics
    ? new Set<number>([0])
    : new Set<number>();
  const barHeightMinimal: Record<number, number> = hasTextMetrics
    ? { [firstKey]: roundTextMetricValue(firstSample.barHeight!) }
    : {};
  const lineHeightMinimal: Record<number, number> = hasTextMetrics
    ? { [firstKey]: roundTextMetricValue(firstSample.lineHeight!) }
    : {};

  for (let index = 1; index < samples.length; index += 1) {
    const sample = samples[index]!;
    const sampleKey = responsiveSampleKey(sample);

    if (sample.lineCount !== previousSample.lineCount) {
      lineBreakpoints.add(sampleKey);
      linesMinimal[sampleKey] = sample.lineCount;
      barMinimal[sampleKey] = sample.barWidth;
      if (breakpointStrategy === "lineOrBarChanges") {
        barBreakpoints.add(sampleKey);
      }
      segments.push({
        fromViewport: segmentStart,
        toViewport: previousSampleKey,
        fromWidthPx: segmentStartWidthPx,
        toWidthPx: previousSample.containerWidthPx,
        lineCount: previousSample.lineCount,
      });
      segmentStart = sampleKey;
      segmentStartWidthPx = sample.containerWidthPx;
    }

    if (
      hasTextMetrics &&
      sample.barHeight != null &&
      sample.lineHeight != null
    ) {
      const roundedBarHeight = roundTextMetricValue(sample.barHeight);
      const roundedLineHeight = roundTextMetricValue(sample.lineHeight);
      const previousBarHeight =
        barHeightMinimal[previousSampleKey] ??
        roundTextMetricValue(previousSample.barHeight ?? 0);
      const previousLineHeight =
        lineHeightMinimal[previousSampleKey] ??
        roundTextMetricValue(previousSample.lineHeight ?? 0);

      if (
        roundedBarHeight !== previousBarHeight ||
        roundedLineHeight !== previousLineHeight
      ) {
        textMetricBreakpoints.add(sampleKey);
        barHeightMinimal[sampleKey] = roundedBarHeight;
        lineHeightMinimal[sampleKey] = roundedLineHeight;
      }
    }

    if (
      breakpointStrategy === "lineOrBarChanges" &&
      !sameBarWidthValue(sample.barWidth, previousSample.barWidth)
    ) {
      barBreakpoints.add(sampleKey);
      barMinimal[sampleKey] = sample.barWidth;
    }

    previousSample = sample;
    previousSampleKey = sampleKey;
  }

  segments.push({
    fromViewport: segmentStart,
    toViewport: previousSampleKey,
    fromWidthPx: segmentStartWidthPx,
    toWidthPx: previousSample.containerWidthPx,
    lineCount: previousSample.lineCount,
  });

  const alignedBreakpoints = uniqueSorted([
    ...lineBreakpoints,
    ...(widthMode === "barWidth" || widthMode === "both" || widthMode === "lastBarWidth"
      ? [...barBreakpoints]
      : []),
    ...textMetricBreakpoints,
  ]);
  const alignedLines: ResponsiveLineMap = {};
  const alignedBarWidth: ResponsiveBarWidthMap = {};
  const alignedBarHeight: Record<number, number> = {};
  const alignedLineHeight: Record<number, number> = {};

  for (const breakpoint of alignedBreakpoints) {
    alignedLines[breakpoint] = resolveResponsiveValueAtViewport(
      linesMinimal,
      breakpoint
    );
    alignedBarWidth[breakpoint] = resolveResponsiveValueAtViewport(
      barMinimal,
      breakpoint
    );
    if (hasTextMetrics) {
      alignedBarHeight[breakpoint] = resolveResponsiveValueAtViewport(
        barHeightMinimal,
        breakpoint
      );
      alignedLineHeight[breakpoint] = resolveResponsiveValueAtViewport(
        lineHeightMinimal,
        breakpoint
      );
    }
  }

  const value: BrowserTextMeasurement["value"] = {
    lines: normalizeLineOutput(sortResponsiveMap(alignedLines)),
    responsiveBy: "container",
    segments,
  };

  if (widthMode === "barWidth" || widthMode === "both") {
    value.barWidth = normalizeBarWidthOutput(sortResponsiveMap(alignedBarWidth));
  }

  if (widthMode === "lastBarWidth" || widthMode === "both") {
    value.lastBarWidth = normalizeLastBarWidthOutput(
      projectLastBarWidthMap(sortResponsiveMap(alignedBarWidth))
    );
  }

  if (hasTextMetrics) {
    value.barHeight = normalizeResponsiveNumberOutput(
      sortResponsiveMap(alignedBarHeight)
    );
    value.lineHeight = normalizeResponsiveNumberOutput(
      sortResponsiveMap(alignedLineHeight)
    );
  }

  return {
    kind: "text",
    exportName: args.exportName,
    value,
  };
}

export function buildBrowserResponsiveNumberResult(args: {
  exportName: string;
  samples: BrowserResponsiveNumberSample[];
}): BrowserResponsiveNumberMeasurement {
  const firstSample = args.samples[0];
  if (!firstSample) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_INPUT",
      "Browser measurement produced no numeric samples.",
      { exportName: args.exportName }
    );
  }

  const breakpoints = new Set<number>([0]);
  const minimal: Record<number, number> = {
    [firstSample.viewportWidth]: roundResponsiveNumberValue(firstSample.value),
  };
  let previous = minimal[firstSample.viewportWidth]!;

  for (let index = 1; index < args.samples.length; index += 1) {
    const sample = args.samples[index]!;
    const rounded = roundResponsiveNumberValue(sample.value);
    if (rounded !== previous) {
      breakpoints.add(sample.viewportWidth);
      minimal[sample.viewportWidth] = rounded;
      previous = rounded;
    }
  }

  const aligned: Record<number, number> = {};
  for (const breakpoint of uniqueSorted(breakpoints)) {
    aligned[breakpoint] = resolveResponsiveValueAtViewport(minimal, breakpoint);
  }

  return {
    kind: "responsiveNumber",
    exportName: args.exportName,
    value: normalizeResponsiveNumberOutput(sortResponsiveMap(aligned)),
  };
}

class ChromeCdpClient {
  private readonly ws: WebSocket;
  private readonly pending = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  }>();
  private readonly listeners = new Map<string, Array<(params: any, sessionId?: string) => void>>();
  private nextId = 1;

  private constructor(ws: WebSocket) {
    this.ws = ws;
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as {
        id?: number;
        method?: string;
        params?: unknown;
        result?: unknown;
        error?: { message?: string };
        sessionId?: string;
      };

      if (message.id != null) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) {
          pending.reject(
            new SkeletonTextAnalyzerError(
              "BROWSER_PROTOCOL_ERROR",
              message.error.message || "Chrome DevTools Protocol error.",
              { message }
            )
          );
          return;
        }
        pending.resolve(message.result);
        return;
      }

      if (message.method) {
        const handlers = this.listeners.get(message.method) ?? [];
        for (const handler of handlers) {
          handler(message.params, message.sessionId);
        }
      }
    });
  }

  static async connect(wsUrl: string) {
    const ws = new WebSocket(wsUrl);
    await new Promise<void>((resolve, reject) => {
      ws.addEventListener("open", () => resolve(), { once: true });
      ws.addEventListener(
        "error",
        (event) => reject(event),
        { once: true }
      );
    });
    return new ChromeCdpClient(ws);
  }

  async close() {
    if (this.ws.readyState === WebSocket.CLOSED) return;

    await new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timeout);
        resolve();
      };
      const timeout = setTimeout(done, 500);

      this.ws.addEventListener("close", done, { once: true });
      this.ws.addEventListener("error", done, { once: true });

      if (this.ws.readyState === WebSocket.CLOSING) {
        return;
      }

      try {
        this.ws.close();
      } catch {
        done();
      }
    });
  }

  on(method: string, handler: (params: any, sessionId?: string) => void) {
    const handlers = this.listeners.get(method) ?? [];
    handlers.push(handler);
    this.listeners.set(method, handlers);
    return () => {
      const next = (this.listeners.get(method) ?? []).filter(
        (entry) => entry !== handler
      );
      this.listeners.set(method, next);
    };
  }

  waitFor(method: string, sessionId?: string) {
    return new Promise<unknown>((resolve) => {
      const dispose = this.on(method, (params, incomingSessionId) => {
        if (sessionId && incomingSessionId !== sessionId) {
          return;
        }
        dispose();
        resolve(params);
      });
    });
  }

  send<T = unknown>(
    method: string,
    params: Record<string, unknown> = {},
    sessionId?: string
  ): Promise<T> {
    const id = this.nextId++;
    const payload = sessionId
      ? { id, method, params, sessionId }
      : { id, method, params };

    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }
}

async function launchChrome(chromePath: string) {
  const userDataDir = await mkdtemp(join(tmpdir(), "rmg-skel-browser-"));

  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-features=CalculateNativeWinOcclusion,PaintHolding",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ];

  const child = spawn(chromePath, args, {
    stdio: ["ignore", "pipe", "pipe"],
  });

  const wsUrl = await new Promise<string>((resolve, reject) => {
    let launchOutput = "";
    const onData = (chunk: Buffer) => {
      const value = chunk.toString("utf8");
      launchOutput = `${launchOutput}${value}`.slice(-4000);
      const match = value.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match?.[1]) {
        cleanup();
        resolve(match[1]);
      }
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
      cleanup();
      reject(
        new SkeletonTextAnalyzerError(
          "BROWSER_LAUNCH_FAILED",
          "Chrome exited before exposing a DevTools websocket endpoint.",
          {
            code,
            signal,
            output: launchOutput.trim() || undefined,
            userDataDir,
          }
        )
      );
    };

    const cleanup = () => {
      child.stdout.off("data", onData);
      child.stderr.off("data", onData);
      child.off("error", onError);
      child.off("exit", onExit);
    };

    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.once("error", onError);
    child.once("exit", onExit);
  });

  return {
    child,
    userDataDir,
    wsUrl,
  };
}

async function launchChromeWithRetry(chromePath: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await launchChrome(chromePath);
    } catch (error) {
      if (
        !(error instanceof SkeletonTextAnalyzerError) ||
        error.code !== "BROWSER_LAUNCH_FAILED" ||
        attempt === 2
      ) {
        throw error;
      }

      await wait(450 * (attempt + 1));
    }
  }

  throw new SkeletonTextAnalyzerError(
    "BROWSER_LAUNCH_FAILED",
    "Chrome did not expose a DevTools websocket endpoint.",
    {}
  );
}

async function stopChrome(launched: Awaited<ReturnType<typeof launchChrome>>) {
  const childDone =
    launched.child.exitCode != null || launched.child.signalCode != null;

  if (!childDone) {
    launched.child.kill("SIGTERM");
    await Promise.race([
      once(launched.child, "exit"),
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]).catch(() => undefined);
  }

  if (launched.child.exitCode == null && launched.child.signalCode == null) {
    launched.child.kill("SIGKILL");
    await once(launched.child, "exit").catch(() => undefined);
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await rm(launched.userDataDir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 120 * (attempt + 1)));
    }
  }
}

function createTextMeasurementDomHelpers() {
  return `
    function normalizeLineWrapGuardPx(value) {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
    }

    function groupClientRectsIntoLineWidths(rects) {
      const sorted = rects
        .filter((rect) => rect.width > 0 && rect.height > 0)
        .sort((a, b) => (a.top === b.top ? a.left - b.left : a.top - b.top));
      const lines = [];

      for (const rect of sorted) {
        const rectMidpoint = rect.top + rect.height / 2;
        const tolerance = Math.max(1, Math.min(3, rect.height / 3));
        const existing = lines.find(
          (line) => Math.abs(line.top - rectMidpoint) <= tolerance
        );
        if (existing) {
          existing.left = Math.min(existing.left, rect.left);
          existing.right = Math.max(existing.right, rect.right);
          continue;
        }
        lines.push({ top: rectMidpoint, left: rect.left, right: rect.right });
      }

      return lines.map((line) => Math.max(0, line.right - line.left));
    }

    function collectTextNodeClientRects(element) {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            return node.nodeValue && node.nodeValue.trim()
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          },
        }
      );
      const rects = [];
      const range = document.createRange();

      while (walker.nextNode()) {
        range.selectNodeContents(walker.currentNode);
        for (const rect of Array.from(range.getClientRects())) {
          rects.push({
            top: rect.top,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height,
          });
        }
      }

      range.detach?.();
      return rects;
    }

    function measureElementLineWidths(element) {
      return groupClientRectsIntoLineWidths(collectTextNodeClientRects(element));
    }

    function parseCssPx(value, fallback) {
      if (typeof value !== "string") return fallback;
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }

    function measureNormalLineHeightPx(style, fontSizePx) {
      const probe = document.createElement("span");
      probe.textContent = "A\\nA";
      probe.style.position = "fixed";
      probe.style.insetInlineStart = "-10000px";
      probe.style.insetBlockStart = "0";
      probe.style.visibility = "hidden";
      probe.style.pointerEvents = "none";
      probe.style.display = "block";
      probe.style.width = "max-content";
      probe.style.whiteSpace = "pre";
      probe.style.fontFamily = style.fontFamily;
      probe.style.fontFeatureSettings = style.fontFeatureSettings;
      probe.style.fontKerning = style.fontKerning;
      probe.style.fontOpticalSizing = style.fontOpticalSizing;
      probe.style.fontSize = style.fontSize;
      probe.style.fontStretch = style.fontStretch;
      probe.style.fontStyle = style.fontStyle;
      probe.style.fontVariant = style.fontVariant;
      probe.style.fontVariationSettings = style.fontVariationSettings;
      probe.style.fontWeight = style.fontWeight;
      probe.style.letterSpacing = style.letterSpacing;
      probe.style.lineHeight = "normal";

      document.body.appendChild(probe);
      try {
        const height = probe.getBoundingClientRect().height;
        return height > 0 ? height / 2 : fontSizePx * 1.2;
      } finally {
        probe.remove();
      }
    }

    function resolveUsedLineHeightPx(style, fontSizePx) {
      return style.lineHeight === "normal"
        ? measureNormalLineHeightPx(style, fontSizePx)
        : parseCssPx(style.lineHeight, fontSizePx * 1.2);
    }

    function measureTextSkeletonMetrics(element) {
      const style = getComputedStyle(element);
      const fontSizePx = parseCssPx(style.fontSize, 16);
      const barHeight = Math.max(0, fontSizePx);
      const lineHeightPx = resolveUsedLineHeightPx(style, fontSizePx);
      const lineHeight =
        barHeight > 0 ? Math.max(0, lineHeightPx / barHeight) : 1;

      return {
        barHeight,
        lineHeight,
        lineHeightPx,
      };
    }

    function measureGuardedTextLines(element, rawLineWrapGuardPx) {
      const lineWidthsPx = measureElementLineWidths(element);
      const containerWidthPx = element.getBoundingClientRect().width;
      const lineWrapGuardPx = normalizeLineWrapGuardPx(rawLineWrapGuardPx);

      if (
        lineWrapGuardPx <= 0 ||
        lineWidthsPx.length === 0 ||
        containerWidthPx <= lineWrapGuardPx
      ) {
        return {
          containerWidthPx,
          lineWidthsPx,
        };
      }

      const clone = element.cloneNode(true);
      const computedStyle = getComputedStyle(element);
      clone.style.position = "fixed";
      clone.style.insetInlineStart = "-10000px";
      clone.style.insetBlockStart = "0";
      clone.style.visibility = "hidden";
      clone.style.pointerEvents = "none";
      clone.style.boxSizing = computedStyle.boxSizing;
      clone.style.width = Math.max(0, containerWidthPx - lineWrapGuardPx) + "px";
      clone.style.minWidth = "0";
      clone.style.maxWidth = "none";
      clone.style.display =
        computedStyle.display === "inline" ? "block" : computedStyle.display;

      const parent = element.parentElement || document.body;
      parent.appendChild(clone);
      try {
        const guardedLineWidthsPx = measureElementLineWidths(clone);
        return {
          containerWidthPx,
          lineWidthsPx:
            guardedLineWidthsPx.length > lineWidthsPx.length
              ? guardedLineWidthsPx
              : lineWidthsPx,
        };
      } finally {
        clone.remove();
      }
    }

    function measureTextLines(element, rawLineWrapGuardPx) {
      return measureGuardedTextLines(element, rawLineWrapGuardPx);
    }
  `;
}

function createMeasurementExpression(
  targets: BrowserAnalysisTarget[],
  lineWrapGuardPx: number,
  includeTextMetrics: boolean
) {
  const normalizedLineWrapGuardPx = Number.isFinite(lineWrapGuardPx)
    ? Math.max(0, lineWrapGuardPx)
    : 0;

  return `(() => {
    const targets = ${JSON.stringify(targets)};
    const defaultLineWrapGuardPx = ${normalizedLineWrapGuardPx};
    const includeTextMetrics = ${includeTextMetrics ? "true" : "false"};
    ${createTextMeasurementDomHelpers()}

    return targets.map((target) => {
      const element = document.querySelector(target.selector);
      if (!element) {
        return {
          exportName: target.exportName,
          error: \`Selector not found: \${target.selector}\`,
        };
      }

      const { containerWidthPx, lineWidthsPx } = measureTextLines(
        element,
        target.lineWrapGuardPx ?? defaultLineWrapGuardPx
      );
      const textMetrics = includeTextMetrics
        ? measureTextSkeletonMetrics(element)
        : null;

      return {
        exportName: target.exportName,
        containerWidthPx,
        lineWidthsPx,
        lineCount: Math.max(1, lineWidthsPx.length),
        ...(textMetrics
          ? {
              barHeight: textMetrics.barHeight,
              lineHeight: textMetrics.lineHeight,
              lineHeightPx: textMetrics.lineHeightPx,
            }
          : null),
      };
    });
  })()`;
}

const requireFromHere = createRequire(import.meta.url);
const PRETEXT_DIST_FILES = [
  "generated/bidi-data.js",
  "analysis.js",
  "measurement.js",
  "line-break.js",
  "line-text.js",
  "bidi.js",
  "layout.js",
] as const;

let pretextBrowserSourceCache: Promise<PretextBrowserSourceMap> | null = null;

async function readPretextBrowserSources(): Promise<PretextBrowserSourceMap> {
  if (!pretextBrowserSourceCache) {
    pretextBrowserSourceCache = (async () => {
      let packageJsonPath: string;
      try {
        packageJsonPath = requireFromHere.resolve("@chenglou/pretext/package.json");
      } catch (error) {
        throw new SkeletonTextAnalyzerError(
          "INVALID_INPUT",
          "Pretext comparison requires @chenglou/pretext to be installed.",
          {
            packageName: "@chenglou/pretext",
            error: error instanceof Error ? error.message : String(error),
          }
        );
      }

      const distDir = join(dirname(packageJsonPath), "dist");
      const entries = await Promise.all(
        PRETEXT_DIST_FILES.map(async (fileName) => [
          fileName,
          await readFile(join(distDir, fileName), "utf8"),
        ] as const)
      );

      return Object.fromEntries(entries);
    })();
  }

  return pretextBrowserSourceCache;
}

function createPretextModuleLoaderExpression(sources: PretextBrowserSourceMap) {
  return `
    async function loadRmgPretextLayoutModule() {
      if (window.__rmgPretextLayoutModule) {
        return window.__rmgPretextLayoutModule;
      }

      const sources = ${JSON.stringify(sources)};
      const urls = {};
      const makeModule = (name, replacements) => {
        let source = sources[name];
        for (const [specifier, replacementUrl] of Object.entries(replacements || {})) {
          source = source
            .split(JSON.stringify(specifier))
            .join(JSON.stringify(replacementUrl))
            .split("'" + specifier + "'")
            .join(JSON.stringify(replacementUrl));
        }
        urls[name] = URL.createObjectURL(
          new Blob([source], { type: "text/javascript" })
        );
      };

      makeModule("generated/bidi-data.js");
      makeModule("analysis.js");
      makeModule("measurement.js", { "./analysis.js": urls["analysis.js"] });
      makeModule("line-break.js", { "./measurement.js": urls["measurement.js"] });
      makeModule("line-text.js");
      makeModule("bidi.js", {
        "./generated/bidi-data.js": urls["generated/bidi-data.js"],
      });
      makeModule("layout.js", {
        "./bidi.js": urls["bidi.js"],
        "./analysis.js": urls["analysis.js"],
        "./measurement.js": urls["measurement.js"],
        "./line-break.js": urls["line-break.js"],
        "./line-text.js": urls["line-text.js"],
      });

      window.__rmgPretextLayoutModule = await import(urls["layout.js"]);
      return window.__rmgPretextLayoutModule;
    }
  `;
}

function createPretextComparisonExpression(args: {
  targets: BrowserAnalysisTarget[];
  lineWrapGuardPx: number;
  sources: PretextBrowserSourceMap;
}) {
  const normalizedLineWrapGuardPx = Number.isFinite(args.lineWrapGuardPx)
    ? Math.max(0, args.lineWrapGuardPx)
    : 0;

  return `(async () => {
    const targets = ${JSON.stringify(args.targets)};
    const defaultLineWrapGuardPx = ${normalizedLineWrapGuardPx};
    ${createTextMeasurementDomHelpers()}
    ${createPretextModuleLoaderExpression(args.sources)}

    function parseCssPx(value, fallback) {
      if (typeof value !== "string") return fallback;
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }

    function resolveCanvasFont(style) {
      const pieces = [
        style.fontStyle && style.fontStyle !== "normal" ? style.fontStyle : "",
        style.fontVariant && style.fontVariant !== "normal" ? style.fontVariant : "",
        style.fontWeight && style.fontWeight !== "normal" ? style.fontWeight : "",
        style.fontSize,
        style.fontFamily,
      ].filter(Boolean);
      return pieces.join(" ");
    }

    function resolveLetterSpacing(style) {
      return style.letterSpacing === "normal"
        ? 0
        : parseCssPx(style.letterSpacing, 0);
    }

    function resolveLineHeight(style, fontSizePx) {
      return style.lineHeight === "normal"
        ? fontSizePx * 1.2
        : parseCssPx(style.lineHeight, fontSizePx * 1.2);
    }

    function resolvePretextWhiteSpace(style) {
      return style.whiteSpace === "pre-wrap" ? "pre-wrap" : "normal";
    }

    function resolvePretextWordBreak(style) {
      return style.wordBreak === "keep-all" ? "keep-all" : "normal";
    }

    const pretext = await loadRmgPretextLayoutModule();
    const viewportMetrics = {
      innerWidth: window.innerWidth,
      documentElementClientWidth: document.documentElement.clientWidth,
      visualViewportWidth: window.visualViewport?.width ?? null,
      devicePixelRatio: window.devicePixelRatio,
    };

    return targets.map((target) => {
      const element = document.querySelector(target.selector);
      if (!element) {
        return {
          exportName: target.exportName,
          error: \`Selector not found: \${target.selector}\`,
        };
      }

      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const fontSizePx = parseCssPx(style.fontSize, 16);
      const lineHeightPx = resolveLineHeight(style, fontSizePx);
      const letterSpacingPx = resolveLetterSpacing(style);
      const canvasFont = resolveCanvasFont(style);
      const measured = measureGuardedTextLines(
        element,
        target.lineWrapGuardPx ?? defaultLineWrapGuardPx
      );
      const text = element.textContent || "";

      let pretextLineCount = null;
      let pretextLineWidthsPx = [];
      let pretextLines = [];
      let pretextError;

      try {
        const prepared = pretext.prepareWithSegments(text, canvasFont, {
          whiteSpace: resolvePretextWhiteSpace(style),
          wordBreak: resolvePretextWordBreak(style),
          letterSpacing: letterSpacingPx,
        });
        const layout = pretext.layoutWithLines(
          prepared,
          measured.containerWidthPx,
          lineHeightPx
        );
        pretextLineCount = layout.lineCount;
        pretextLineWidthsPx = layout.lines.map((line) => line.width);
        pretextLines = layout.lines.map((line) => line.text);
      } catch (error) {
        pretextError = error && typeof error.message === "string"
          ? error.message
          : String(error);
      }

      return {
        exportName: target.exportName,
        viewportMetrics,
        containerWidthPx: measured.containerWidthPx,
        targetRect: {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top,
        },
        text,
        computedFont: style.font,
        canvasFont,
        fontSizePx,
        lineHeightPx,
        letterSpacingPx,
        whiteSpace: style.whiteSpace,
        wordBreak: style.wordBreak,
        overflowWrap: style.overflowWrap,
        domLineCount: Math.max(1, measured.lineWidthsPx.length),
        domLineWidthsPx: measured.lineWidthsPx,
        pretextLineCount,
        pretextLineWidthsPx,
        pretextLines,
        ...(pretextError ? { pretextError } : null),
      };
    });
  })()`;
}

function createSliderMeasurementExpression(
  slider: BrowserSliderManifest,
  lineWrapGuardPx: number,
  includeTextMetrics: boolean
) {
  const normalizedLineWrapGuardPx = Number.isFinite(lineWrapGuardPx)
    ? Math.max(0, lineWrapGuardPx)
    : 0;

  return `(() => {
    const config = ${JSON.stringify(slider)};
    const defaultLineWrapGuardPx = ${normalizedLineWrapGuardPx};
    const includeTextMetrics = ${includeTextMetrics ? "true" : "false"};
    ${createTextMeasurementDomHelpers()}

    const cloneAttribute = config.cloneAttribute || "data-rmg-clone";
    const cloneValue = config.cloneValue || "true";
    const elements = Array.from(document.querySelectorAll(config.itemSelector));
    const canonical = elements.filter((element) => {
      const slide = element.closest("[data-rmg-slide='true']");
      if (!slide) return true;
      return slide.getAttribute(cloneAttribute) !== cloneValue;
    });

    const seenIds = new Set();
    return canonical.map((element) => {
      const itemId = element.getAttribute(config.canonicalItemIdAttribute);
      if (!itemId) {
        return {
          error: \`Missing canonical item id attribute \${config.canonicalItemIdAttribute} for selector \${config.itemSelector}\`,
        };
      }

      if (seenIds.has(itemId)) {
        return {
          itemId,
          error: \`Duplicate canonical item id: \${itemId}\`,
        };
      }
      seenIds.add(itemId);

      const slide = element.closest("[data-rmg-slide='true']");
      const viewport = slide?.closest("[data-rmg-part='viewport']");
      const slideRect = slide?.getBoundingClientRect();
      const viewportRect = viewport?.getBoundingClientRect();
      const isVisible =
        slideRect && viewportRect
          ? slideRect.right > viewportRect.left + 0.5 &&
            slideRect.left < viewportRect.right - 0.5
          : true;

      const roles = {};
      for (const role of config.roles) {
        const roleElement = element.querySelector(role.selector);
        if (!roleElement) {
          return {
            itemId,
            error: \`Role selector not found for \${itemId}: \${role.selector}\`,
          };
        }

        const { containerWidthPx, lineWidthsPx } =
          measureTextLines(
            roleElement,
            role.lineWrapGuardPx ?? defaultLineWrapGuardPx
          );
        const textMetrics = includeTextMetrics
          ? measureTextSkeletonMetrics(roleElement)
          : null;

        roles[role.role] = {
          containerWidthPx,
          lineWidthsPx,
          lineCount: Math.max(1, lineWidthsPx.length),
          ...(textMetrics
            ? {
                barHeight: textMetrics.barHeight,
                lineHeight: textMetrics.lineHeight,
                lineHeightPx: textMetrics.lineHeightPx,
              }
            : null),
        };
      }

      return {
        itemId,
        isVisible,
        roles,
      };
    });
  })()`;
}

function resolveResponsiveRoleMarginBlock(
  style: BrowserResponsiveBaseStyle | undefined,
  viewportWidth: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
) {
  const resolved = resolveBrowserResponsiveBaseStyleAtMinWidth(
    style,
    viewportWidth,
    breakpointMap
  );

  return (
    parseLengthLike(resolved?.marginTop as number | string | undefined, 0, 0) +
    parseLengthLike(resolved?.marginBottom as number | string | undefined, 0, 0)
  );
}

function resolveMeasuredRoleTotalHeight(args: {
  role: BrowserSliderRole;
  lineCount: number;
  viewportWidth: number;
  measuredMetrics?: {
    barHeight?: number;
    lineHeight?: number;
  };
  breakpointMap?: BreakpointMap;
}) {
  const breakpointMap = args.breakpointMap ?? BREAKPOINT_MAP;
  const measuredBarHeight = args.measuredMetrics?.barHeight;
  const measuredLineHeight = args.measuredMetrics?.lineHeight;
  const barHeight =
    measuredBarHeight != null && Number.isFinite(measuredBarHeight)
      ? measuredBarHeight
      : resolveResponsiveTextBarHeight(
          args.role.barHeight,
          typeof args.role.barHeight === "number" ? args.role.barHeight : 0,
          args.viewportWidth,
          breakpointMap
        );
  const lineHeight =
    measuredLineHeight != null && Number.isFinite(measuredLineHeight)
      ? measuredLineHeight
      : resolveResponsiveTextLineHeight(
          args.role.lineHeight,
          typeof args.role.lineHeight === "number" ? args.role.lineHeight : 1,
          args.viewportWidth,
          breakpointMap
        );
  const metrics = getTextSkeletonMetrics({
    barHeight,
    lineHeight,
    lines: args.lineCount,
  });

  return (
    metrics.totalHeight +
    resolveResponsiveRoleMarginBlock(args.role.style, args.viewportWidth, breakpointMap)
  );
}

function buildSliderMeasurementTargets(slider: BrowserSliderManifest): BrowserAnalysisTarget[] {
  return slider.trackedItems.flatMap((trackedItem) =>
    trackedItem.roles.map((trackedRole) => {
      const role = slider.roles.find((entry) => entry.role === trackedRole.role);
      if (!role) {
        throw new SkeletonTextAnalyzerError(
          "INVALID_INPUT",
          "Browser slider tracked role references an unknown role.",
          {
            itemId: trackedItem.itemId,
            role: trackedRole.role,
          }
        );
      }

      return {
        exportName: trackedRole.exportName,
        selector: `${slider.itemSelector}[${slider.canonicalItemIdAttribute}="${trackedItem.itemId}"] ${role.selector}`,
        widthMode: trackedRole.widthMode,
      } satisfies BrowserAnalysisTarget;
    })
  );
}

async function waitForDocumentFontsReady(
  client: ChromeCdpClient,
  sessionId: string,
  timeoutMs: number
) {
  await client.send(
    "Runtime.evaluate",
    {
      expression: `new Promise((resolve) => {
        const fonts = document.fonts?.ready;
        const timeout = window.setTimeout(() => resolve(false), ${Math.max(0, timeoutMs)});
        const done = (value) => {
          window.clearTimeout(timeout);
          resolve(value);
        };

        if (fonts && typeof fonts.then === "function") {
          fonts.then(() => done(true), () => done(false));
          return;
        }

        done(true);
      })`,
      returnByValue: true,
      awaitPromise: true,
    },
    sessionId
  );
}

async function waitForSelectors(
  client: ChromeCdpClient,
  sessionId: string,
  targets: BrowserAnalysisTarget[],
  timeoutMs: number
) {
  await client.send(
    "Runtime.evaluate",
    {
      expression: `new Promise((resolve, reject) => {
        const selectors = ${JSON.stringify(targets.map((target) => target.selector))};
        const startedAt = Date.now();

        const check = () => {
          if (selectors.every((selector) => document.querySelector(selector))) {
            resolve(true);
            return;
          }

          if (Date.now() - startedAt >= ${Math.max(0, timeoutMs)}) {
            reject(new Error("Timed out waiting for browser skeleton text selectors."));
            return;
          }

          window.setTimeout(() => {
            check().catch(reject);
          }, 50);
        };

        check();
      })`,
      returnByValue: true,
      awaitPromise: true,
    },
    sessionId
  );
}

async function waitForTargetTextStylesReady(
  client: ChromeCdpClient,
  sessionId: string,
  targets: BrowserAnalysisTarget[],
  timeoutMs: number
) {
  if (targets.length === 0) return;

  await client.send(
    "Runtime.evaluate",
    {
      expression: `new Promise((resolve, reject) => {
        const selectors = ${JSON.stringify(targets.map((target) => target.selector))};
        const startedAt = Date.now();

        const isBrowserDefaultTextStyle = (style) => {
          const fontFamily = String(style.fontFamily || "").toLowerCase();
          return (
            style.lineHeight === "normal" ||
            /(^|,\\s*)times( new roman)?(,|$)/i.test(fontFamily)
          ) && style.fontSize === "16px";
        };

        const check = () => {
          const elements = selectors.map((selector) => document.querySelector(selector));
          if (
            elements.every((element) => {
              if (!element) return false;
              return !isBrowserDefaultTextStyle(getComputedStyle(element));
            })
          ) {
            requestAnimationFrame(() => resolve(true));
            return;
          }

          if (Date.now() - startedAt >= ${Math.max(0, timeoutMs)}) {
            reject(new Error("Timed out waiting for browser skeleton text styles."));
            return;
          }

          window.setTimeout(check, 20);
        };

        check();
      })`,
      returnByValue: true,
      awaitPromise: true,
    },
    sessionId
  );
}

function createEntriesReadinessDomHelpers() {
  return `
    function resolveEntriesRoot(config) {
      if (!config) return null;

      if (config.rootSelector) {
        return document.querySelector(config.rootSelector);
      }

      if (config.anchorSelector) {
        const anchor = document.querySelector(config.anchorSelector);
        const entry = anchor?.closest?.(config.entrySelector) ?? null;
        if (entry?.parentElement) return entry.parentElement;
      }

      return document;
    }

    function collectEntryRows(config) {
      const root = resolveEntriesRoot(config);
      if (!root) return null;

      return {
        root,
        rows: Array.from(root.querySelectorAll(config.entrySelector)),
      };
    }

    function getEntryContentElement(row) {
      return Array.from(row.children).find(
        (child) => !child.hasAttribute("data-rmg-entry-skeleton")
      ) || null;
    }

    function getEntrySkeletonElement(row) {
      return Array.from(row.children).find(
        (child) => child.hasAttribute("data-rmg-entry-skeleton")
      ) || null;
    }

    function entryAttributeMatches(row, attribute, expectedValue) {
      if (!attribute) return true;
      return row.getAttribute(attribute) === String(expectedValue ?? "1");
    }

    function entryRowReadyForMeasurement(row, config) {
      if (!entryAttributeMatches(row, config.mountedAttribute, config.mountedValue)) {
        return false;
      }

      if (!entryAttributeMatches(row, config.readyAttribute, config.readyValue)) {
        return false;
      }

      const rect = row.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;

      const content = getEntryContentElement(row);
      if (!content) return false;

      const contentRect = content.getBoundingClientRect();
      return contentRect.width > 0 && contentRect.height > 0;
    }

    function entriesReadinessSnapshot(config) {
      if (!config) {
        return { ready: true, reason: "no-config", root: null, rows: [] };
      }

      const collected = collectEntryRows(config);
      if (!collected) {
        return { ready: false, reason: "root-missing", root: null, rows: [] };
      }

      const rows = collected.rows;
      if (
        config.expectedEntryCount != null &&
        rows.length !== config.expectedEntryCount
      ) {
        return {
          ready: false,
          reason: "entry-count",
          root: collected.root,
          rows,
        };
      }

      if (!rows.length) {
        return {
          ready: false,
          reason: "entry-empty",
          root: collected.root,
          rows,
        };
      }

      const ready = rows.every((row) => entryRowReadyForMeasurement(row, config));
      return {
        ready,
        reason: ready ? "ready" : "entry-loading",
        root: collected.root,
        rows,
      };
    }

    function waitForEntriesAnimationFrames(frameCount) {
      return new Promise((resolve) => {
        let remaining = Math.max(1, Math.trunc(Number(frameCount) || 1));
        const tick = () => {
          remaining -= 1;
          if (remaining <= 0) {
            resolve(true);
            return;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }

    async function prewarmEntriesForMeasurement(config) {
      const collected = collectEntryRows(config);
      if (!collected || !collected.rows.length) return false;

      const originalX = window.scrollX;
      const originalY = window.scrollY;

      for (const row of collected.rows) {
        if (entryRowReadyForMeasurement(row, config)) continue;

        for (let attempt = 0; attempt < 20; attempt += 1) {
          row.scrollIntoView({
            block: "center",
            inline: "nearest",
          });
          await waitForEntriesAnimationFrames(2);

          if (entryRowReadyForMeasurement(row, config)) break;
        }
      }

      window.scrollTo(originalX, originalY);
      for (let attempt = 0; attempt < 20; attempt += 1) {
        await waitForEntriesAnimationFrames(2);

        const snapshot = entriesReadinessSnapshot(config);
        if (snapshot.ready) break;
      }
      return true;
    }
  `;
}

function createStableTargetGeometryExpression(args: {
  manifest: BrowserSkeletonTextManifest;
  lineWrapGuardPx: number;
  stableFrames: number;
  timeoutMs: number;
}) {
  const normalizedLineWrapGuardPx = Number.isFinite(args.lineWrapGuardPx)
    ? Math.max(0, args.lineWrapGuardPx)
    : 0;

  return `new Promise((resolve, reject) => {
    const targets = ${JSON.stringify(args.manifest.targets ?? [])};
    const slider = ${JSON.stringify(args.manifest.slider ?? null)};
    const masonry = ${JSON.stringify(args.manifest.masonry ?? null)};
    const entries = ${JSON.stringify(args.manifest.entries ?? null)};
    const defaultLineWrapGuardPx = ${normalizedLineWrapGuardPx};
    const stableFramesRequired = ${Math.max(1, Math.trunc(args.stableFrames))};
    const timeoutMs = ${Math.max(0, args.timeoutMs)};
    const startedAt = performance.now();
    let lastSignature = "";
    let stableFrames = 0;

    ${createTextMeasurementDomHelpers()}
    ${createEntriesReadinessDomHelpers()}

    function roundForSignature(value) {
      return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : "x";
    }

    function measuredTextSignature(element, rawLineWrapGuardPx) {
      const rect = element.getBoundingClientRect();
      const measured = measureTextLines(
        element,
        rawLineWrapGuardPx
      );
      return [
        roundForSignature(rect.left),
        roundForSignature(rect.top),
        roundForSignature(rect.width),
        roundForSignature(rect.height),
        roundForSignature(measured.containerWidthPx),
        measured.lineWidthsPx.map(roundForSignature).join(","),
      ].join(":");
    }

    function resolveResponsiveNumberValue(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
      }

      const rules = Object.entries(value)
        .map(([key, raw]) => {
          const minWidth = Number(key);
          const ruleValue = Number(raw);
          if (!Number.isFinite(minWidth) || !Number.isFinite(ruleValue)) {
            return null;
          }
          return { minWidth, value: ruleValue };
        })
        .filter(Boolean)
        .sort((left, right) => left.minWidth - right.minWidth);

      if (!rules.length) return null;

      let resolved = rules[0].value;
      for (const rule of rules) {
        if (window.innerWidth >= rule.minWidth) {
          resolved = rule.value;
        } else {
          break;
        }
      }

      return resolved;
    }

    function resolveMasonryRoot() {
      if (!masonry) return null;

      if (masonry.rootSelector) {
        return document.querySelector(masonry.rootSelector);
      }

      const anchor = masonry.anchorSelector
        ? document.querySelector(masonry.anchorSelector)
        : null;
      const item = anchor?.closest?.(masonry.itemSelector) ?? null;
      return item?.parentElement ?? null;
    }

    function masonrySignature() {
      if (!masonry) return "";

      const root = resolveMasonryRoot();
      if (!root) return null;

      const rootRect = root.getBoundingClientRect();
      if (rootRect.width <= 0 || rootRect.height <= 0) return null;

      const style = getComputedStyle(root);
      const computedColumns = Number(style.getPropertyValue("--rmg-cols"));
      const expectedColumns = resolveResponsiveNumberValue(masonry.columns);
      if (
        expectedColumns != null &&
        (!Number.isFinite(computedColumns) ||
          Math.trunc(computedColumns) !== Math.trunc(expectedColumns))
      ) {
        return null;
      }

      const items = Array.from(root.querySelectorAll(masonry.itemSelector));
      if (
        masonry.expectedItemCount != null &&
        items.length !== masonry.expectedItemCount
      ) {
        return null;
      }
      if (!items.length) return null;

      const itemParts = [];
      let maxBottom = 0;

      for (const item of items) {
        const rect = item.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;
        maxBottom = Math.max(maxBottom, rect.bottom - rootRect.top);
        itemParts.push([
          item.getAttribute("data-rmg-idx") ?? "",
          roundForSignature(rect.left - rootRect.left),
          roundForSignature(rect.top - rootRect.top),
          roundForSignature(rect.width),
          roundForSignature(rect.height),
        ].join(":"));
      }

      if (Math.abs(rootRect.height - maxBottom) > 1) {
        return null;
      }

      return [
        "masonry",
        roundForSignature(rootRect.left),
        roundForSignature(rootRect.top),
        roundForSignature(rootRect.width),
        roundForSignature(rootRect.height),
        Math.trunc(computedColumns),
        style.getPropertyValue("--rmg-gap").trim(),
        itemParts.join(","),
      ].join("=");
    }

    function resolveEntriesBounds(root, rows) {
      if (
        root &&
        root.nodeType === 1 &&
        typeof root.getBoundingClientRect === "function"
      ) {
        return root.getBoundingClientRect();
      }

      let left = Infinity;
      let top = Infinity;
      let right = -Infinity;
      let bottom = -Infinity;

      for (const row of rows) {
        const rect = row.getBoundingClientRect();
        left = Math.min(left, rect.left);
        top = Math.min(top, rect.top);
        right = Math.max(right, rect.right);
        bottom = Math.max(bottom, rect.bottom);
      }

      if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
      return {
        left,
        top,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
      };
    }

    function entriesSignature() {
      if (!entries) return "";

      const snapshot = entriesReadinessSnapshot(entries);
      if (!snapshot.ready) return null;

      const rootRect = resolveEntriesBounds(snapshot.root, snapshot.rows);
      if (!rootRect || rootRect.width <= 0 || rootRect.height <= 0) return null;

      const rootStyle =
        snapshot.root && snapshot.root.nodeType === 1
          ? getComputedStyle(snapshot.root)
          : null;
      const rowParts = [];

      for (const row of snapshot.rows) {
        const rowRect = row.getBoundingClientRect();
        if (rowRect.width <= 0 || rowRect.height <= 0) return null;

        const content = getEntryContentElement(row);
        if (!content) return null;

        const contentRect = content.getBoundingClientRect();
        if (contentRect.width <= 0 || contentRect.height <= 0) return null;

        const skeleton = getEntrySkeletonElement(row);
        const skeletonRect = skeleton?.getBoundingClientRect?.() ?? null;

        rowParts.push([
          row.getAttribute("data-rmg-entry-owner") ?? "",
          row.getAttribute(entries.mountedAttribute) ?? "",
          row.getAttribute(entries.readyAttribute) ?? "",
          roundForSignature(rowRect.left - rootRect.left),
          roundForSignature(rowRect.top - rootRect.top),
          roundForSignature(rowRect.width),
          roundForSignature(rowRect.height),
          roundForSignature(contentRect.left - rootRect.left),
          roundForSignature(contentRect.top - rootRect.top),
          roundForSignature(contentRect.width),
          roundForSignature(contentRect.height),
          skeletonRect ? roundForSignature(skeletonRect.height) : "x",
        ].join(":"));
      }

      return [
        "entries",
        roundForSignature(rootRect.left),
        roundForSignature(rootRect.top),
        roundForSignature(rootRect.width),
        roundForSignature(rootRect.height),
        rootStyle?.rowGap ?? "",
        rowParts.join(","),
      ].join("=");
    }

    function collectSignature() {
      const parts = [];

      for (const target of targets) {
        const element = document.querySelector(target.selector);
        if (!element) return null;
        parts.push([
          "target",
          target.exportName,
          measuredTextSignature(
            element,
            target.lineWrapGuardPx ?? defaultLineWrapGuardPx
          ),
        ].join("="));
      }

      if (slider) {
        const cloneAttribute = slider.cloneAttribute || "data-rmg-clone";
        const cloneValue = slider.cloneValue || "true";
        const elements = Array.from(document.querySelectorAll(slider.itemSelector));
        const canonical = elements.filter((element) => {
          const slide = element.closest("[data-rmg-slide='true']");
          if (!slide) return true;
          return slide.getAttribute(cloneAttribute) !== cloneValue;
        });

        for (const element of canonical) {
          const itemId = element.getAttribute(slider.canonicalItemIdAttribute);
          if (!itemId) return null;

          for (const role of slider.roles) {
            const roleElement = element.querySelector(role.selector);
            if (!roleElement) return null;
            parts.push([
              "slider",
              itemId,
              role.role,
              measuredTextSignature(
                roleElement,
                role.lineWrapGuardPx ?? defaultLineWrapGuardPx
              ),
            ].join("="));
          }
        }
      }

      const masonryPart = masonrySignature();
      if (masonryPart == null) return null;
      if (masonryPart) parts.push(masonryPart);

      const entriesPart = entriesSignature();
      if (entriesPart == null) return null;
      if (entriesPart) parts.push(entriesPart);

      return parts.join("|");
    }

    function tick() {
      const signature = collectSignature();
      if (signature && signature === lastSignature) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
        lastSignature = signature || "";
      }

      if (signature && stableFrames >= stableFramesRequired) {
        resolve(true);
        return;
      }

      if (performance.now() - startedAt >= timeoutMs) {
        reject(new Error("Timed out waiting for stable browser skeleton text geometry."));
        return;
      }

      window.setTimeout(tick, 16);
    }

    window.setTimeout(tick, 16);
  })`;
}

async function waitForStableTargetGeometry(args: {
  client: ChromeCdpClient;
  sessionId: string;
  manifest: BrowserSkeletonTextManifest;
  lineWrapGuardPx: number;
  timeoutMs: number;
}) {
  await args.client.send(
    "Runtime.evaluate",
    {
      expression: createStableTargetGeometryExpression({
        manifest: args.manifest,
        lineWrapGuardPx: args.lineWrapGuardPx,
        stableFrames: args.manifest.stableGeometryFrames ?? 3,
        timeoutMs: args.timeoutMs,
      }),
      returnByValue: true,
      awaitPromise: true,
    },
    args.sessionId
  );
}

async function waitForReadyExpression(args: {
  client: ChromeCdpClient;
  sessionId: string;
  expression: string | undefined;
  timeoutMs: number;
}) {
  if (!args.expression) return;

  await args.client.send(
    "Runtime.evaluate",
    {
      expression: `new Promise((resolve, reject) => {
        const readyExpression = ${JSON.stringify(args.expression)};
        const timeoutMs = ${Math.max(0, args.timeoutMs)};
        const startedAt = performance.now();
        const evaluateReady = () => {
          try {
            return Boolean(Function('"use strict"; return (' + readyExpression + ');')());
          } catch {
            return false;
          }
        };

        const tick = () => {
          if (evaluateReady()) {
            resolve(true);
            return;
          }

          if (performance.now() - startedAt >= timeoutMs) {
            reject(new Error("Timed out waiting for browser skeleton text readyExpression."));
            return;
          }

          window.setTimeout(tick, 25);
        };

        tick();
      })`,
      returnByValue: true,
      awaitPromise: true,
    },
    args.sessionId
  );
}

async function waitForMeasurementPageReady(args: {
  client: ChromeCdpClient;
  sessionId: string;
  manifest: BrowserSkeletonTextManifest;
  settleMs: number;
  lineWrapGuardPx: number;
}) {
  const timeoutMs = Math.max(
    3000,
    args.settleMs * 20,
    args.manifest.entries
      ? args.manifest.entries.timeoutMs ?? DEFAULT_ENTRIES_READY_TIMEOUT_MS
      : 0
  );
  const textTargets = [
    ...(args.manifest.targets ?? []),
    ...(args.manifest.slider
      ? buildSliderMeasurementTargets(args.manifest.slider)
      : []),
  ];

  if (args.manifest.entries) {
    await waitForEntries(
      args.client,
      args.sessionId,
      args.manifest.entries,
      timeoutMs
    );
  }

  if (args.manifest.targets?.length) {
    await waitForSelectors(
      args.client,
      args.sessionId,
      args.manifest.targets,
      timeoutMs
    );
  }

  if (args.manifest.slider) {
    await waitForSliderItems(
      args.client,
      args.sessionId,
      args.manifest.slider,
      timeoutMs
    );
  }

  await waitForTargetTextStylesReady(
    args.client,
    args.sessionId,
    textTargets,
    timeoutMs
  );

  await waitForDocumentFontsReady(args.client, args.sessionId, timeoutMs);

  if (args.settleMs > 0) {
    await wait(args.settleMs);
  }

  await waitForReadyExpression({
    client: args.client,
    sessionId: args.sessionId,
    expression: args.manifest.readyExpression,
    timeoutMs,
  });

  await waitForStableTargetGeometry({
    client: args.client,
    sessionId: args.sessionId,
    manifest: args.manifest,
    lineWrapGuardPx: args.lineWrapGuardPx,
    timeoutMs,
  });
}

async function waitForEntries(
  client: ChromeCdpClient,
  sessionId: string,
  entries: BrowserEntriesManifest,
  timeoutMs: number
) {
  await client.send(
    "Runtime.evaluate",
    {
      expression: `new Promise((resolve, reject) => {
        const config = ${JSON.stringify(entries)};
        const startedAt = Date.now();
        let prewarmed = false;
        ${createEntriesReadinessDomHelpers()}

        const check = async () => {
          if (!prewarmed) {
            const collected = collectEntryRows(config);
            if (collected && collected.rows.length) {
              prewarmed = true;
              await prewarmEntriesForMeasurement(config);
            }
          }

          const snapshot = entriesReadinessSnapshot(config);
          if (snapshot.ready) {
            requestAnimationFrame(() => resolve(true));
            return;
          }

          if (Date.now() - startedAt >= ${Math.max(0, timeoutMs)}) {
            reject(new Error(
              "Timed out waiting for browser entries skeleton text readiness: " +
                snapshot.reason
            ));
            return;
          }

          window.setTimeout(() => {
            check().catch(reject);
          }, 50);
        };

        check().catch(reject);
      })`,
      returnByValue: true,
      awaitPromise: true,
    },
    sessionId
  );
}

async function waitForSliderItems(
  client: ChromeCdpClient,
  sessionId: string,
  slider: BrowserSliderManifest,
  timeoutMs: number
) {
  await client.send(
    "Runtime.evaluate",
    {
      expression: `new Promise((resolve, reject) => {
        const config = ${JSON.stringify(slider)};
        const startedAt = Date.now();
        const cloneAttribute = config.cloneAttribute || "data-rmg-clone";
        const cloneValue = config.cloneValue || "true";
        const trackedIds = config.trackedItems.map((item) => item.itemId);

        const check = () => {
          const items = Array.from(document.querySelectorAll(config.itemSelector)).filter((element) => {
            const slide = element.closest("[data-rmg-slide='true']");
            if (!slide) return true;
            return slide.getAttribute(cloneAttribute) !== cloneValue;
          });

          if (items.length > 0) {
            const ids = new Set();
            const ready = items.every((element) => {
              const itemId = element.getAttribute(config.canonicalItemIdAttribute);
              if (!itemId) return false;
              ids.add(itemId);
              return config.roles.every((role) => !!element.querySelector(role.selector));
            });

            if (ready && trackedIds.every((id) => ids.has(id))) {
              resolve(true);
              return;
            }
          }

          if (Date.now() - startedAt >= ${Math.max(0, timeoutMs)}) {
            reject(new Error("Timed out waiting for browser slider skeleton text items."));
            return;
          }

          window.setTimeout(check, 50);
        };

        check();
      })`,
      returnByValue: true,
      awaitPromise: true,
    },
    sessionId
  );
}

async function createViewportMeasurementSession(args: {
  client: ChromeCdpClient;
  manifest: BrowserSkeletonTextManifest;
  viewportHeight: number;
  viewportWidth: number;
  settleMs: number;
  lineWrapGuardPx: number;
}): Promise<{ sessionId: string; targetId: string }> {
  const target = await args.client.send<{ targetId: string }>("Target.createTarget", {
    url: "about:blank",
  });
  const attached = await args.client.send<{ sessionId: string }>(
    "Target.attachToTarget",
    {
      targetId: target.targetId,
      flatten: true,
    }
  );
  const sessionId = attached.sessionId;

  await args.client.send("Page.enable", {}, sessionId);
  await args.client.send("Runtime.enable", {}, sessionId);
  await args.client.send(
    "Emulation.setDeviceMetricsOverride",
    {
      width: Math.max(1, args.viewportWidth),
      height: Math.max(1, args.viewportHeight),
      deviceScaleFactor: 1,
      mobile: false,
    },
    sessionId
  );

  const documentReady = args.client.waitFor("Page.domContentEventFired", sessionId);
  await args.client.send("Page.navigate", { url: args.manifest.url }, sessionId);
  await documentReady;
  await waitForMeasurementPageReady({
    client: args.client,
    sessionId,
    manifest: args.manifest,
    settleMs: args.settleMs,
    lineWrapGuardPx: args.lineWrapGuardPx,
  });

  return {
    sessionId,
    targetId: target.targetId,
  };
}

async function measureTextTargetsAtViewport(args: {
  client: ChromeCdpClient;
  sessionId: string;
  manifest: BrowserSkeletonTextManifest;
  viewportWidth: number;
  settleMs: number;
  lineWrapGuardPx: number;
  samplesByTarget: Map<string, BrowserLineSample[]>;
}) {
  const targets = args.manifest.targets;
  if (!targets?.length) return;

  let evaluation = await args.client.send<{
    result?: { value?: Array<Record<string, unknown>> };
  }>(
    "Runtime.evaluate",
    {
      expression: createMeasurementExpression(
        targets,
        args.lineWrapGuardPx,
        args.manifest.includeTextMetrics === true
      ),
      returnByValue: true,
      awaitPromise: true,
    },
    args.sessionId
  );

  let measurements = evaluation.result?.value;
  if (!Array.isArray(measurements)) {
    throw new SkeletonTextAnalyzerError(
      "BROWSER_MEASURE_FAILED",
      "Browser measurement did not return a target array.",
      { viewportWidth: args.viewportWidth, evaluation }
    );
  }

  if (
    measurements.length === 0 ||
    measurements.some((measurement) => typeof measurement.error === "string")
  ) {
    await waitForSelectors(
      args.client,
      args.sessionId,
      targets,
      Math.max(2000, args.settleMs * 12)
    );

    evaluation = await args.client.send<{
      result?: { value?: Array<Record<string, unknown>> };
    }>(
      "Runtime.evaluate",
      {
        expression: createMeasurementExpression(
          targets,
          args.lineWrapGuardPx,
          args.manifest.includeTextMetrics === true
        ),
        returnByValue: true,
        awaitPromise: true,
      },
      args.sessionId
    );

    measurements = evaluation.result?.value;
    if (!Array.isArray(measurements)) {
      throw new SkeletonTextAnalyzerError(
        "BROWSER_MEASURE_FAILED",
        "Browser measurement did not return a target array.",
        { viewportWidth: args.viewportWidth, evaluation }
      );
    }
  }

  for (const measurement of measurements) {
    const exportName = String(measurement.exportName ?? "");
    if (!exportName) continue;

    if (typeof measurement.error === "string") {
      throw new SkeletonTextAnalyzerError(
        "BROWSER_SELECTOR_NOT_FOUND",
        measurement.error,
        {
          exportName,
          viewportWidth: args.viewportWidth,
          url: args.manifest.url,
        }
      );
    }

    const containerWidthPx = Number(measurement.containerWidthPx);
    const lineCount = Number(measurement.lineCount);
    const lineWidthsPx = Array.isArray(measurement.lineWidthsPx)
      ? measurement.lineWidthsPx.map((value) => Number(value))
      : [];

    const targetSamples = args.samplesByTarget.get(exportName);
    if (!targetSamples) continue;

    targetSamples.push({
      viewportWidth: args.viewportWidth,
      containerWidthPx,
      lineCount: Math.max(1, lineCount),
      lineWidthsPx,
      barWidth: toBrowserBarWidthValue({
        lineWidthsPx,
        containerWidthPx,
        unit: args.manifest.barWidthUnit,
      }),
      ...(args.manifest.includeTextMetrics === true
        ? {
            barHeight: roundTextMetricValue(Number(measurement.barHeight)),
            lineHeight: roundTextMetricValue(Number(measurement.lineHeight)),
          }
        : null),
    });
  }
}

async function measurePretextTargetsAtViewport(args: {
  client: ChromeCdpClient;
  sessionId: string;
  manifest: BrowserSkeletonTextManifest;
  viewportWidth: number;
  settleMs: number;
  lineWrapGuardPx: number;
  sources: PretextBrowserSourceMap;
  textTargetConfigs: BrowserAnalysisTarget[];
  samplesByTarget: Map<string, BrowserPretextLineSample[]>;
}) {
  const targets = args.textTargetConfigs;
  if (!targets.length) return;

  let evaluation = await args.client.send<{
    result?: { value?: Array<Record<string, unknown>> };
  }>(
    "Runtime.evaluate",
    {
      expression: createPretextComparisonExpression({
        targets,
        lineWrapGuardPx: args.lineWrapGuardPx,
        sources: args.sources,
      }),
      returnByValue: true,
      awaitPromise: true,
    },
    args.sessionId
  );

  let measurements = evaluation.result?.value;
  if (!Array.isArray(measurements)) {
    throw new SkeletonTextAnalyzerError(
      "BROWSER_MEASURE_FAILED",
      "Browser Pretext comparison did not return a target array.",
      { viewportWidth: args.viewportWidth, evaluation }
    );
  }

  if (measurements.some((measurement) => typeof measurement.error === "string")) {
    await waitForSelectors(
      args.client,
      args.sessionId,
      targets,
      Math.max(2000, args.settleMs * 12)
    );

    evaluation = await args.client.send<{
      result?: { value?: Array<Record<string, unknown>> };
    }>(
      "Runtime.evaluate",
      {
        expression: createPretextComparisonExpression({
          targets,
          lineWrapGuardPx: args.lineWrapGuardPx,
          sources: args.sources,
        }),
        returnByValue: true,
        awaitPromise: true,
      },
      args.sessionId
    );

    measurements = evaluation.result?.value;
    if (!Array.isArray(measurements)) {
      throw new SkeletonTextAnalyzerError(
        "BROWSER_MEASURE_FAILED",
        "Browser Pretext comparison did not return a target array.",
        { viewportWidth: args.viewportWidth, evaluation }
      );
    }
  }

  for (const measurement of measurements) {
    const exportName = String(measurement.exportName ?? "");
    if (!exportName) continue;

    if (typeof measurement.error === "string") {
      throw new SkeletonTextAnalyzerError(
        "BROWSER_SELECTOR_NOT_FOUND",
        measurement.error,
        {
          exportName,
          viewportWidth: args.viewportWidth,
          url: args.manifest.url,
        }
      );
    }

    const containerWidthPx = Number(measurement.containerWidthPx);
    const domLineWidthsPx = Array.isArray(measurement.domLineWidthsPx)
      ? measurement.domLineWidthsPx.map((value) => Number(value))
      : [];
    const pretextLineWidthsPx = Array.isArray(measurement.pretextLineWidthsPx)
      ? measurement.pretextLineWidthsPx.map((value) => Number(value))
      : [];
    const pretextLineCount =
      measurement.pretextLineCount == null
        ? null
        : Number(measurement.pretextLineCount);
    const viewportMetrics = measurement.viewportMetrics as
      | BrowserViewportMetrics
      | undefined;
    const targetRect = measurement.targetRect as
      | BrowserPretextLineSample["targetRect"]
      | undefined;

    const targetSamples = args.samplesByTarget.get(exportName);
    if (!targetSamples) continue;

    targetSamples.push({
      exportName,
      viewportWidth: args.viewportWidth,
      viewportMetrics: {
        innerWidth: Number(viewportMetrics?.innerWidth ?? args.viewportWidth),
        documentElementClientWidth: Number(
          viewportMetrics?.documentElementClientWidth ?? args.viewportWidth
        ),
        visualViewportWidth:
          viewportMetrics?.visualViewportWidth == null
            ? null
            : Number(viewportMetrics.visualViewportWidth),
        devicePixelRatio: Number(viewportMetrics?.devicePixelRatio ?? 1),
      },
      containerWidthPx,
      targetRect: {
        width: Number(targetRect?.width ?? containerWidthPx),
        height: Number(targetRect?.height ?? 0),
        left: Number(targetRect?.left ?? 0),
        top: Number(targetRect?.top ?? 0),
      },
      text: String(measurement.text ?? ""),
      computedFont: String(measurement.computedFont ?? ""),
      canvasFont: String(measurement.canvasFont ?? ""),
      fontSizePx: Number(measurement.fontSizePx ?? 0),
      lineHeightPx: Number(measurement.lineHeightPx ?? 0),
      letterSpacingPx: Number(measurement.letterSpacingPx ?? 0),
      whiteSpace: String(measurement.whiteSpace ?? ""),
      wordBreak: String(measurement.wordBreak ?? ""),
      overflowWrap: String(measurement.overflowWrap ?? ""),
      domLineCount: Math.max(1, Number(measurement.domLineCount ?? 1)),
      domLineWidthsPx,
      domBarWidth: toBrowserBarWidthValue({
        lineWidthsPx: domLineWidthsPx,
        containerWidthPx,
        unit: args.manifest.barWidthUnit,
      }),
      pretextLineCount:
        pretextLineCount == null || !Number.isFinite(pretextLineCount)
          ? null
          : Math.max(1, pretextLineCount),
      pretextLineWidthsPx,
      pretextLines: Array.isArray(measurement.pretextLines)
        ? measurement.pretextLines.map((line) => String(line))
        : [],
      ...(typeof measurement.pretextError === "string"
        ? { pretextError: measurement.pretextError }
        : null),
    });
  }
}

async function measureSliderAtViewport(args: {
  client: ChromeCdpClient;
  sessionId: string;
  manifest: BrowserSkeletonTextManifest;
  viewportWidth: number;
  settleMs: number;
  lineWrapGuardPx: number;
  samplesByTarget: Map<string, BrowserLineSample[]>;
  sliderCompensationSamples: BrowserResponsiveNumberSample[];
}) {
  const slider = args.manifest.slider;
  if (!slider) return;

  const evaluateSliderMeasurements = async () =>
    args.client.send<{
      result?: { value?: Array<Record<string, unknown>> };
    }>(
      "Runtime.evaluate",
      {
        expression: createSliderMeasurementExpression(
          slider,
          args.lineWrapGuardPx,
          args.manifest.includeTextMetrics === true
        ),
        returnByValue: true,
        awaitPromise: true,
      },
      args.sessionId
    );

  const hasAllTrackedItems = (value: Array<Record<string, unknown>>) => {
    if (value.length === 0) return false;

    const ids = new Set<string>();
    for (const measurement of value) {
      if (typeof measurement.error === "string") return false;
      const itemId = String(measurement.itemId ?? "");
      if (itemId) ids.add(itemId);
    }

    return slider.trackedItems.every((trackedItem) => ids.has(trackedItem.itemId));
  };

  let evaluation = await evaluateSliderMeasurements();

  let measurements = evaluation.result?.value;
  if (!Array.isArray(measurements)) {
    throw new SkeletonTextAnalyzerError(
      "BROWSER_MEASURE_FAILED",
      "Browser slider measurement did not return an item array.",
      { viewportWidth: args.viewportWidth, evaluation }
    );
  }

  if (!hasAllTrackedItems(measurements)) {
    await waitForSliderItems(
      args.client,
      args.sessionId,
      slider,
      Math.max(2000, args.settleMs * 12)
    );

    await wait(args.settleMs);

    evaluation = await evaluateSliderMeasurements();

    measurements = evaluation.result?.value;
    if (!Array.isArray(measurements)) {
      throw new SkeletonTextAnalyzerError(
        "BROWSER_MEASURE_FAILED",
        "Browser slider measurement did not return an item array.",
        { viewportWidth: args.viewportWidth, evaluation }
      );
    }
  }

  const measuredItems = new Map<string, BrowserMeasuredSliderItem>();
  for (const measurement of measurements) {
    if (typeof measurement.error === "string") {
      throw new SkeletonTextAnalyzerError(
        "BROWSER_SELECTOR_NOT_FOUND",
        measurement.error,
        {
          itemId: measurement.itemId,
          viewportWidth: args.viewportWidth,
          url: args.manifest.url,
        }
      );
    }

    const itemId = String(measurement.itemId ?? "");
    if (!itemId) {
      throw new SkeletonTextAnalyzerError(
        "BROWSER_MEASURE_FAILED",
        "Browser slider measurement did not return an item id.",
        { viewportWidth: args.viewportWidth, measurement }
      );
    }

    const rawRoles =
      measurement.roles && typeof measurement.roles === "object"
        ? (measurement.roles as Record<string, Record<string, unknown>>)
        : null;
    if (!rawRoles) {
      throw new SkeletonTextAnalyzerError(
        "BROWSER_MEASURE_FAILED",
        "Browser slider measurement did not return item roles.",
        { viewportWidth: args.viewportWidth, itemId, measurement }
      );
    }

    const roles: BrowserMeasuredSliderItem["roles"] = {};
    for (const role of slider.roles) {
      const rawRole = rawRoles[role.role];
      if (!rawRole) {
        throw new SkeletonTextAnalyzerError(
          "BROWSER_MEASURE_FAILED",
          "Browser slider measurement did not return a declared role.",
          { viewportWidth: args.viewportWidth, itemId, role: role.role }
        );
      }

      roles[role.role] = {
        containerWidthPx: Number(rawRole.containerWidthPx),
        lineCount: Math.max(1, Number(rawRole.lineCount)),
        lineWidthsPx: Array.isArray(rawRole.lineWidthsPx)
          ? rawRole.lineWidthsPx.map((value) => Number(value))
          : [],
        ...(args.manifest.includeTextMetrics === true
          ? {
              barHeight: roundTextMetricValue(Number(rawRole.barHeight)),
              lineHeight: roundTextMetricValue(Number(rawRole.lineHeight)),
            }
          : null),
      };
    }

    measuredItems.set(itemId, {
      itemId,
      isVisible: measurement.isVisible === true,
      roles,
    });
  }

  for (const trackedItem of slider.trackedItems) {
    const measuredItem = measuredItems.get(trackedItem.itemId);
    if (!measuredItem) {
      throw new SkeletonTextAnalyzerError(
        "BROWSER_SELECTOR_NOT_FOUND",
        "Browser slider measurement did not return a tracked canonical item.",
        {
          itemId: trackedItem.itemId,
          viewportWidth: args.viewportWidth,
          url: args.manifest.url,
          receivedItemIds: Array.from(measuredItems.keys()),
        }
      );
    }

    for (const trackedRole of trackedItem.roles) {
      const measuredRole = measuredItem.roles[trackedRole.role];
      if (!measuredRole) {
        throw new SkeletonTextAnalyzerError(
          "BROWSER_SELECTOR_NOT_FOUND",
          "Browser slider measurement did not return a tracked role.",
          {
            itemId: trackedItem.itemId,
            role: trackedRole.role,
            viewportWidth: args.viewportWidth,
            url: args.manifest.url,
          }
        );
      }

      const targetSamples = args.samplesByTarget.get(trackedRole.exportName);
      if (!targetSamples) continue;

      targetSamples.push({
        viewportWidth: args.viewportWidth,
        containerWidthPx: measuredRole.containerWidthPx,
        lineCount: measuredRole.lineCount,
        lineWidthsPx: measuredRole.lineWidthsPx,
        barWidth: toBrowserBarWidthValue({
          lineWidthsPx: measuredRole.lineWidthsPx,
          containerWidthPx: measuredRole.containerWidthPx,
          unit: args.manifest.barWidthUnit,
        }),
        ...(args.manifest.includeTextMetrics === true
          ? {
              barHeight: measuredRole.barHeight,
              lineHeight: measuredRole.lineHeight,
            }
          : null),
      });
    }
  }

  const maxCanonicalTotalHeight = Math.max(
    ...Array.from(measuredItems.values()).map((item) =>
      slider.roles.reduce((sum, role) => {
        const measuredRole = item.roles[role.role]!;
        return (
          sum +
          resolveMeasuredRoleTotalHeight({
            role,
            lineCount: measuredRole.lineCount,
            viewportWidth: args.viewportWidth,
            measuredMetrics: measuredRole,
          })
        );
      }, 0)
    ),
    0
  );
  const maxTrackedVisibleTotalHeight = Math.max(
    ...slider.trackedItems.map((trackedItem) => {
      const measuredItem = measuredItems.get(trackedItem.itemId);
      if (!measuredItem?.isVisible) return 0;

      return trackedItem.roles.reduce((sum, trackedRole) => {
        const roleConfig = slider.roles.find(
          (role) => role.role === trackedRole.role
        );
        const measuredRole = measuredItem.roles[trackedRole.role];
        if (!roleConfig || !measuredRole) return sum;

        return (
          sum +
          resolveMeasuredRoleTotalHeight({
            role: roleConfig,
            lineCount: measuredRole.lineCount,
            viewportWidth: args.viewportWidth,
            measuredMetrics: measuredRole,
          })
        );
      }, 0);
    }),
    0
  );

  args.sliderCompensationSamples.push({
    viewportWidth: args.viewportWidth,
    value: Math.max(0, maxCanonicalTotalHeight - maxTrackedVisibleTotalHeight),
  });
}

async function measureViewportRange(args: {
  client: ChromeCdpClient;
  manifest: BrowserSkeletonTextManifest;
  range: BrowserViewportRange;
  rangeIndex: number;
  rangeCount: number;
  viewportHeight: number;
  settleMs: number;
  lineWrapGuardPx: number;
  textTargetConfigs: BrowserAnalysisTarget[];
  progress?: BrowserViewportProgressReporter;
}): Promise<BrowserViewportWorkerResult> {
  const samplesByTarget = new Map<string, BrowserLineSample[]>();
  for (const targetConfig of args.textTargetConfigs) {
    samplesByTarget.set(targetConfig.exportName, []);
  }
  const sliderCompensationSamples: BrowserResponsiveNumberSample[] = [];

  args.progress?.onRangeStart?.({
    range: args.range,
    rangeIndex: args.rangeIndex,
    rangeCount: args.rangeCount,
  });

  for (
    let viewportWidth = args.range.from;
    viewportWidth <= args.range.to;
    viewportWidth += 1
  ) {
    const session = await createViewportMeasurementSession({
      client: args.client,
      manifest: args.manifest,
      viewportHeight: args.viewportHeight,
      viewportWidth,
      settleMs: args.settleMs,
      lineWrapGuardPx: args.lineWrapGuardPx,
    });

    try {
      await measureTextTargetsAtViewport({
        client: args.client,
        sessionId: session.sessionId,
        manifest: args.manifest,
        viewportWidth,
        settleMs: args.settleMs,
        lineWrapGuardPx: args.lineWrapGuardPx,
        samplesByTarget,
      });
      await measureSliderAtViewport({
        client: args.client,
        sessionId: session.sessionId,
        manifest: args.manifest,
        viewportWidth,
        settleMs: args.settleMs,
        lineWrapGuardPx: args.lineWrapGuardPx,
        samplesByTarget,
        sliderCompensationSamples,
      });
      args.progress?.onViewportComplete?.({
        viewportWidth,
        range: args.range,
        rangeIndex: args.rangeIndex,
        rangeCount: args.rangeCount,
      });
    } finally {
      await args.client
        .send("Target.closeTarget", { targetId: session.targetId })
        .catch(() => undefined);
    }
  }

  args.progress?.onRangeComplete?.({
    range: args.range,
    rangeIndex: args.rangeIndex,
    rangeCount: args.rangeCount,
  });

  return {
    samplesByTarget,
    sliderCompensationSamples,
  };
}

async function measurePretextViewportRange(args: {
  client: ChromeCdpClient;
  manifest: BrowserSkeletonTextManifest;
  range: BrowserViewportRange;
  viewportHeight: number;
  settleMs: number;
  lineWrapGuardPx: number;
  sources: PretextBrowserSourceMap;
  textTargetConfigs: BrowserAnalysisTarget[];
}): Promise<BrowserPretextComparisonWorkerResult> {
  const samplesByTarget = new Map<string, BrowserPretextLineSample[]>();
  for (const targetConfig of args.textTargetConfigs) {
    samplesByTarget.set(targetConfig.exportName, []);
  }

  for (
    let viewportWidth = args.range.from;
    viewportWidth <= args.range.to;
    viewportWidth += 1
  ) {
    const session = await createViewportMeasurementSession({
      client: args.client,
      manifest: args.manifest,
      viewportHeight: args.viewportHeight,
      viewportWidth,
      settleMs: args.settleMs,
      lineWrapGuardPx: args.lineWrapGuardPx,
    });

    try {
      await measurePretextTargetsAtViewport({
        client: args.client,
        sessionId: session.sessionId,
        manifest: args.manifest,
        viewportWidth,
        settleMs: args.settleMs,
        lineWrapGuardPx: args.lineWrapGuardPx,
        sources: args.sources,
        textTargetConfigs: args.textTargetConfigs,
        samplesByTarget,
      });
    } finally {
      await args.client
        .send("Target.closeTarget", { targetId: session.targetId })
        .catch(() => undefined);
    }
  }

  return {
    samplesByTarget,
  };
}

async function measureViewportRangeInChrome(args: {
  chromePath: string;
  manifest: BrowserSkeletonTextManifest;
  range: BrowserViewportRange;
  rangeIndex: number;
  rangeCount: number;
  viewportHeight: number;
  settleMs: number;
  lineWrapGuardPx: number;
  textTargetConfigs: BrowserAnalysisTarget[];
  progress?: BrowserViewportProgressReporter;
}): Promise<BrowserViewportWorkerResult> {
  const launched = await launchChromeWithRetry(args.chromePath);
  let client: ChromeCdpClient | null = null;

  try {
    client = await ChromeCdpClient.connect(launched.wsUrl);
    return await measureViewportRange({
      client,
      manifest: args.manifest,
      range: args.range,
      rangeIndex: args.rangeIndex,
      rangeCount: args.rangeCount,
      viewportHeight: args.viewportHeight,
      settleMs: args.settleMs,
      lineWrapGuardPx: args.lineWrapGuardPx,
      textTargetConfigs: args.textTargetConfigs,
      progress: args.progress,
    });
  } finally {
    await client?.close().catch(() => undefined);
    await stopChrome(launched);
  }
}

async function measurePretextViewportRangeInChrome(args: {
  chromePath: string;
  manifest: BrowserSkeletonTextManifest;
  range: BrowserViewportRange;
  viewportHeight: number;
  settleMs: number;
  lineWrapGuardPx: number;
  sources: PretextBrowserSourceMap;
  textTargetConfigs: BrowserAnalysisTarget[];
}): Promise<BrowserPretextComparisonWorkerResult> {
  const launched = await launchChrome(args.chromePath);
  let client: ChromeCdpClient | null = null;

  try {
    client = await ChromeCdpClient.connect(launched.wsUrl);
    return await measurePretextViewportRange({
      client,
      manifest: args.manifest,
      range: args.range,
      viewportHeight: args.viewportHeight,
      settleMs: args.settleMs,
      lineWrapGuardPx: args.lineWrapGuardPx,
      sources: args.sources,
      textTargetConfigs: args.textTargetConfigs,
    });
  } finally {
    await client?.close().catch(() => undefined);
    await stopChrome(launched);
  }
}

function mergeViewportWorkerResults(args: {
  textTargetConfigs: BrowserAnalysisTarget[];
  workerResults: BrowserViewportWorkerResult[];
}) {
  const samplesByTarget = new Map<string, BrowserLineSample[]>();
  for (const targetConfig of args.textTargetConfigs) {
    samplesByTarget.set(targetConfig.exportName, []);
  }
  const sliderCompensationSamples: BrowserResponsiveNumberSample[] = [];

  for (const workerResult of args.workerResults) {
    for (const targetConfig of args.textTargetConfigs) {
      samplesByTarget
        .get(targetConfig.exportName)
        ?.push(...(workerResult.samplesByTarget.get(targetConfig.exportName) ?? []));
    }
    sliderCompensationSamples.push(...workerResult.sliderCompensationSamples);
  }

  for (const samples of samplesByTarget.values()) {
    samples.sort((left, right) => left.viewportWidth - right.viewportWidth);
  }
  sliderCompensationSamples.sort(
    (left, right) => left.viewportWidth - right.viewportWidth
  );

  return {
    samplesByTarget,
    sliderCompensationSamples,
  };
}

function mergePretextViewportWorkerResults(args: {
  textTargetConfigs: BrowserAnalysisTarget[];
  workerResults: BrowserPretextComparisonWorkerResult[];
}): BrowserPretextComparisonWorkerResult {
  const samplesByTarget = new Map<string, BrowserPretextLineSample[]>();
  for (const targetConfig of args.textTargetConfigs) {
    samplesByTarget.set(targetConfig.exportName, []);
  }

  for (const workerResult of args.workerResults) {
    for (const targetConfig of args.textTargetConfigs) {
      samplesByTarget
        .get(targetConfig.exportName)
        ?.push(...(workerResult.samplesByTarget.get(targetConfig.exportName) ?? []));
    }
  }

  for (const samples of samplesByTarget.values()) {
    samples.sort((left, right) => left.viewportWidth - right.viewportWidth);
  }

  return {
    samplesByTarget,
  };
}

function formatProgressDuration(ms: number) {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

function createBrowserMeasurementProgressReporter(args: {
  viewportMin: number;
  viewportMax: number;
  viewportWorkerCount: number;
  viewportRanges: BrowserViewportRange[];
  targetCount: number;
  url: string;
}): BrowserViewportProgressReporter {
  const totalViewports = Math.max(0, args.viewportMax - args.viewportMin + 1);
  const startedAt = Date.now();
  let completedViewports = 0;
  let nextLogCount = Math.min(25, totalViewports);

  const log = (message: string) => {
    console.error(`[skeleton-text browser] ${message}`);
  };

  log(
    `starting DOM range analysis ${args.viewportMin}..${args.viewportMax} ` +
      `(${totalViewports} viewports, ${args.targetCount} targets, ` +
      `${args.viewportRanges.length}/${args.viewportWorkerCount} workers) ${args.url}`
  );

  return {
    onRangeStart({ range, rangeIndex, rangeCount }) {
      log(
        `worker ${rangeIndex + 1}/${rangeCount} measuring ${range.from}..${range.to}`
      );
    },
    onViewportComplete({ viewportWidth }) {
      completedViewports += 1;
      if (
        completedViewports < nextLogCount &&
        completedViewports !== totalViewports
      ) {
        return;
      }

      const elapsedMs = Date.now() - startedAt;
      const percent =
        totalViewports <= 0 || completedViewports >= totalViewports
          ? 100
          : Math.min(
              99,
              Math.floor((completedViewports / totalViewports) * 100)
            );
      log(
        `progress ${completedViewports}/${totalViewports} (${percent}%) ` +
          `latest=${viewportWidth}px elapsed=${formatProgressDuration(elapsedMs)}`
      );
      nextLogCount += 25;
    },
    onRangeComplete({ range, rangeIndex, rangeCount }) {
      log(
        `worker ${rangeIndex + 1}/${rangeCount} finished ${range.from}..${range.to}`
      );
    },
  };
}

export async function measureBrowserSkeletonTextSamples(
  manifest: BrowserSkeletonTextManifest
): Promise<BrowserViewportWorkerResult> {
  const viewportMin = manifest.viewportMin ?? DEFAULT_VIEWPORT_MIN;
  const viewportMax = manifest.viewportMax ?? DEFAULT_VIEWPORT_MAX;
  const viewportHeight = manifest.viewportHeight ?? DEFAULT_VIEWPORT_HEIGHT;
  const settleMs = Math.max(0, manifest.settleMs ?? DEFAULT_SETTLE_MS);
  const lineWrapGuardPx =
    manifest.lineWrapGuardPx ?? DEFAULT_LINE_WRAP_GUARD_PX;
  const chromePath = manifest.chromePath ?? DEFAULT_CHROME_PATH;
  const textTargetConfigs = [
    ...(manifest.targets ?? []),
    ...(manifest.slider ? buildSliderMeasurementTargets(manifest.slider) : []),
  ];
  const viewportWorkerCount =
    manifest.viewportWorkers ?? DEFAULT_VIEWPORT_WORKERS;
  const viewportRanges = buildViewportRanges({
    viewportMin,
    viewportMax,
    workerCount: viewportWorkerCount,
  });
  const progress = createBrowserMeasurementProgressReporter({
    viewportMin,
    viewportMax,
    viewportWorkerCount,
    viewportRanges,
    targetCount: textTargetConfigs.length,
    url: manifest.url,
  });
  const launched = await launchChromeWithRetry(chromePath);
  let client: ChromeCdpClient | null = null;
  let workerResults: BrowserViewportWorkerResult[];

  try {
    client = await ChromeCdpClient.connect(launched.wsUrl);
    workerResults = await Promise.all(
      viewportRanges.map(async (range, rangeIndex) => {
        if (rangeIndex > 0) {
          await wait(Math.min(2000, rangeIndex * 120));
        }

        return measureViewportRange({
          client: client!,
          manifest,
          range,
          rangeIndex,
          rangeCount: viewportRanges.length,
          viewportHeight,
          settleMs,
          lineWrapGuardPx,
          textTargetConfigs,
          progress,
        });
      })
    );
  } finally {
    await client?.close().catch(() => undefined);
    await stopChrome(launched);
  }

  const result = mergeViewportWorkerResults({
    textTargetConfigs,
    workerResults,
  });
  console.error("[skeleton-text browser] complete");
  return result;
}

export async function measureBrowserSkeletonTextPretextComparisonSamples(
  manifest: BrowserSkeletonTextManifest
): Promise<BrowserPretextComparisonWorkerResult> {
  const viewportMin = manifest.viewportMin ?? DEFAULT_VIEWPORT_MIN;
  const viewportMax = manifest.viewportMax ?? DEFAULT_VIEWPORT_MAX;
  const viewportHeight = manifest.viewportHeight ?? DEFAULT_VIEWPORT_HEIGHT;
  const settleMs = Math.max(0, manifest.settleMs ?? DEFAULT_SETTLE_MS);
  const lineWrapGuardPx =
    manifest.lineWrapGuardPx ?? DEFAULT_LINE_WRAP_GUARD_PX;
  const chromePath = manifest.chromePath ?? DEFAULT_CHROME_PATH;
  const textTargetConfigs = [
    ...(manifest.targets ?? []),
    ...(manifest.slider ? buildSliderMeasurementTargets(manifest.slider) : []),
  ];
  const viewportWorkerCount =
    manifest.viewportWorkers ?? DEFAULT_VIEWPORT_WORKERS;
  const viewportRanges = buildViewportRanges({
    viewportMin,
    viewportMax,
    workerCount: viewportWorkerCount,
  });
  const sources = await readPretextBrowserSources();
  const workerResults = await Promise.all(
    viewportRanges.map((range) =>
      measurePretextViewportRangeInChrome({
        chromePath,
        manifest,
        range,
        viewportHeight,
        settleMs,
        lineWrapGuardPx,
        sources,
        textTargetConfigs,
      })
    )
  );
  return mergePretextViewportWorkerResults({
    textTargetConfigs,
    workerResults,
  });
}

export async function measureBrowserSkeletonTextManifest(
  manifest: BrowserSkeletonTextManifest
): Promise<BrowserSkeletonTextMeasurement[]> {
  const textTargetConfigs = [
    ...(manifest.targets ?? []),
    ...(manifest.slider ? buildSliderMeasurementTargets(manifest.slider) : []),
  ];
  const { samplesByTarget, sliderCompensationSamples } =
    await measureBrowserSkeletonTextSamples(manifest);

  const results: BrowserSkeletonTextMeasurement[] = textTargetConfigs.map((targetConfig) =>
    buildBrowserResponsiveResult({
      exportName: targetConfig.exportName,
      widthMode: targetConfig.widthMode,
      breakpointStrategy: manifest.breakpointStrategy,
      includeTextMetrics: manifest.includeTextMetrics === true,
      samples: samplesByTarget.get(targetConfig.exportName) ?? [],
    })
  );

  if (manifest.slider) {
    results.push(
      buildBrowserResponsiveNumberResult({
        exportName: manifest.slider.rowHeightCompensationExportName,
        samples: sliderCompensationSamples,
      })
    );
  }

  return results;
}
