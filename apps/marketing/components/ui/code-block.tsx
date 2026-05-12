"use client";

import { Check, Copy, FileCode2 } from "lucide-react";
import { highlight } from "sugar-high";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type JSX,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

type CodeBlockTab = {
  id: string;
  label: string;
  code: string;
  filename?: string;
  language?: string;
};

type CopyState =
  | { status: "idle" }
  | { status: "copied" | "error"; key: string };

type RenderedCodeLayer = {
  id: string;
  highlightedCode: string;
  lineCount: number;
};

const CODE_BLOCK_TAB_BUTTON_BASE_CLASS =
  "relative z-10 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 cursor-pointer hover:bg-slate-100";
const CODE_BLOCK_TAB_BUTTON_ACTIVE_CLASS = "text-slate-900";
const CODE_BLOCK_TAB_BUTTON_INACTIVE_CLASS =
  "text-slate-500";
const CODE_BLOCK_HEIGHT_TRANSITION_MS = 360;
const CODE_BLOCK_CROSSFADE_TRANSITION_MS = 220;
const CODE_EXAMPLE_LEADING_BOILERPLATE_PATTERN =
  /^(?:(?:\s*\/\*\s*eslint-disable[\s\S]*?\*\/[ \t]*(?:\r?\n|$))|(?:\s*\/\/\s*eslint-disable[^\r\n]*(?:\r?\n|$))|(?:\s*["']use client["'];?[ \t]*(?:\r?\n|$)))+/;

function getCodeLineCount(code: string): number {
  return Math.max(1, code.split(/\r\n|\r|\n/).length);
}

function stripCodeExampleBoilerplate(code: string): string {
  const strippedCode = code.replace(CODE_EXAMPLE_LEADING_BOILERPLATE_PATTERN, "");

  if (strippedCode === code) {
    return code;
  }

  return strippedCode.replace(/^(?:[ \t]*\r?\n)+/, "");
}

type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  filename?: string;
  language?: string;
  copyable?: boolean;
  showLineNumbers?: boolean;
  tabs?: CodeBlockTab[];
  defaultTabId?: string;
  disableAnimations?: boolean;
};

export function CodeBlock(props: CodeBlockProps): JSX.Element {
  const {
    code,
    filename,
    language = "tsx",
    copyable = true,
    showLineNumbers = true,
    tabs,
    defaultTabId,
    disableAnimations = false,
    className,
    ...rest
  } = props;
  const codePanelId = useId();
  const resolvedTabs = useMemo(() => {
    if (tabs && tabs.length > 0) {
      return tabs.map((tab) => ({
        ...tab,
        code: stripCodeExampleBoilerplate(tab.code),
      }));
    }

    return [
      {
        id: language,
        label: language.toUpperCase(),
        code: stripCodeExampleBoilerplate(code),
        filename,
        language,
      },
    ];
  }, [code, filename, language, tabs]);
  const resolvedDefaultTabId =
    resolvedTabs.find((tab) => tab.id === defaultTabId)?.id ?? resolvedTabs[0]?.id ?? language;
  const [requestedActiveTabId, setRequestedActiveTabId] = useState(
    resolvedDefaultTabId
  );
  const [copyState, setCopyState] = useState<CopyState>({ status: "idle" });
  const [outgoingCodeLayer, setOutgoingCodeLayer] =
    useState<RenderedCodeLayer | null>(null);
  const codePanelRef = useRef<HTMLPreElement | null>(null);
  const codeElementRef = useRef<HTMLElement | null>(null);
  const codeLayersRef = useRef<HTMLDivElement | null>(null);
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const tabIndicatorRef = useRef<HTMLSpanElement | null>(null);
  const tabButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const codeTransitionTimeoutRef = useRef<number | null>(null);
  const activeTabId = resolvedTabs.some((tab) => tab.id === requestedActiveTabId)
    ? requestedActiveTabId
    : resolvedDefaultTabId;
  const activeTab =
    resolvedTabs.find((tab) => tab.id === activeTabId) ?? resolvedTabs[0] ?? null;
  const activeTabIndex = activeTab
    ? resolvedTabs.findIndex((tab) => tab.id === activeTab.id)
    : -1;
  const activeCode = activeTab?.code ?? code;
  const activeLanguage = activeTab?.language ?? language;
  const activeFilename = activeTab?.filename ?? filename;
  const activeCopyKey = `${activeTabId}:${activeCode}`;
  const activeLineCount = useMemo(() => getCodeLineCount(activeCode), [activeCode]);
  const visibleCopyState =
    copyState.status !== "idle" && copyState.key === activeCopyKey
      ? copyState.status
      : "idle";
  const activeTabTriggerId = activeTab ? `${codePanelId}-${activeTab.id}-tab` : undefined;
  const highlightedCode = useMemo(() => highlight(activeCode), [activeCode]);
  const shouldAnimate = !disableAnimations;
  const renderedCodeLayer = useMemo<RenderedCodeLayer>(
    () => ({
      id: activeTabId,
      highlightedCode,
      lineCount: activeLineCount,
    }),
    [activeLineCount, activeTabId, highlightedCode]
  );
  const previousRenderedCodeLayerRef = useRef(renderedCodeLayer);

  function measureCodePanelHeight(
    codePanel: HTMLPreElement | null,
    codeElement: HTMLElement | null,
    fallbackLineCount: number
  ): number | null {
    if (!codePanel || !codeElement) {
      return null;
    }

    const panelStyle = window.getComputedStyle(codePanel);
    const codeStyle = window.getComputedStyle(codeElement);
    const lineHeight = Number.parseFloat(codeStyle.lineHeight);
    const codePaddingTop = Number.parseFloat(codeStyle.paddingTop);
    const codePaddingBottom = Number.parseFloat(codeStyle.paddingBottom);
    const panelPaddingTop = Number.parseFloat(panelStyle.paddingTop);
    const panelPaddingBottom = Number.parseFloat(panelStyle.paddingBottom);
    const panelBorderTop = Number.parseFloat(panelStyle.borderTopWidth);
    const panelBorderBottom = Number.parseFloat(panelStyle.borderBottomWidth);
    const resolvedLineHeight = Number.isFinite(lineHeight) ? lineHeight : 20;

    return Math.ceil(
      fallbackLineCount * resolvedLineHeight +
        (Number.isFinite(codePaddingTop) ? codePaddingTop : 0) +
        (Number.isFinite(codePaddingBottom) ? codePaddingBottom : 0) +
        (Number.isFinite(panelPaddingTop) ? panelPaddingTop : 0) +
        (Number.isFinite(panelPaddingBottom) ? panelPaddingBottom : 0) +
        (Number.isFinite(panelBorderTop) ? panelBorderTop : 0) +
        (Number.isFinite(panelBorderBottom) ? panelBorderBottom : 0)
    );
  }

  useEffect(() => {
    if (copyState.status !== "copied") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState({ status: "idle" });
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  useEffect(() => {
    return () => {
      if (codeTransitionTimeoutRef.current !== null) {
        window.clearTimeout(codeTransitionTimeoutRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    const tabIndicator = tabIndicatorRef.current;

    if (tabIndicator === null) {
      return;
    }

    const tabIndicatorElement: HTMLSpanElement = tabIndicator;

    if (activeTabIndex < 0 || resolvedTabs.length <= 1) {
      tabIndicatorElement.style.opacity = "0";
      return;
    }

    function updateTabIndicator() {
      const activeButton = tabButtonRefs.current[activeTabIndex] ?? null;

      if (!activeButton) {
        tabIndicatorElement.style.opacity = "0";
        return;
      }

      tabIndicatorElement.style.opacity = "1";
      tabIndicatorElement.style.width = `${activeButton.offsetWidth}px`;
      tabIndicatorElement.style.transform = `translate3d(${activeButton.offsetLeft}px, 0, 0)`;
    }

    const frameId = window.requestAnimationFrame(updateTabIndicator);
    window.addEventListener("resize", updateTabIndicator);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateTabIndicator);
    };
  }, [activeTabIndex, resolvedTabs.length, shouldAnimate]);

  useLayoutEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    const codePanel = codePanelRef.current;
    const previousRenderedCodeLayer = previousRenderedCodeLayerRef.current;

    if (previousRenderedCodeLayer.id === renderedCodeLayer.id) {
      return;
    }

    if (codeTransitionTimeoutRef.current !== null) {
      window.clearTimeout(codeTransitionTimeoutRef.current);
    }

    setOutgoingCodeLayer(previousRenderedCodeLayer);
    if (codePanel) {
      const startHeight = codePanel.offsetHeight;
      const nextHeight =
        measureCodePanelHeight(codePanel, codeElementRef.current, renderedCodeLayer.lineCount) ??
        startHeight;

      codePanel.style.height = `${startHeight}px`;
      void codePanel.offsetHeight;
      codePanel.style.height = `${nextHeight}px`;
    }

    codeTransitionTimeoutRef.current = window.setTimeout(() => {
      setOutgoingCodeLayer(null);
      if (codePanelRef.current) {
        codePanelRef.current.style.height = "";
      }
      codeTransitionTimeoutRef.current = null;
    }, Math.max(CODE_BLOCK_HEIGHT_TRANSITION_MS, CODE_BLOCK_CROSSFADE_TRANSITION_MS));
  }, [renderedCodeLayer, shouldAnimate]);

  useEffect(() => {
    previousRenderedCodeLayerRef.current = renderedCodeLayer;
  }, [renderedCodeLayer]);

  async function handleCopy() {
    const visibleCode = codeElementRef.current?.textContent ?? activeCode;

    try {
      await navigator.clipboard.writeText(visibleCode);
      setCopyState({ status: "copied", key: activeCopyKey });
    } catch {
      setCopyState({ status: "error", key: activeCopyKey });
    }
  }

  const label = activeFilename ?? `${activeLanguage.toUpperCase()} snippet`;
  const buttonLabel =
    visibleCopyState === "copied"
      ? "Copied"
      : visibleCopyState === "error"
        ? "Retry copy"
        : "Copy";
  const hasTabs = resolvedTabs.length > 1;
  const codeBlockTransitionStyle = {
    "--rmg-code-block-height-duration": shouldAnimate
      ? `${CODE_BLOCK_HEIGHT_TRANSITION_MS}ms`
      : "0ms",
    "--rmg-code-block-crossfade-duration": shouldAnimate
      ? `${CODE_BLOCK_CROSSFADE_TRANSITION_MS}ms`
      : "0ms",
  } as CSSProperties;

  function prepareCodeTransition() {
    const codePanel = codePanelRef.current;
    const currentHeight = measureCodePanelHeight(
      codePanel,
      codeElementRef.current,
      renderedCodeLayer.lineCount
    );

    if (!codePanel || currentHeight === null) {
      return;
    }

    codePanel.style.height = `${currentHeight}px`;
  }

  function requestActiveTab(nextTabId: string) {
    if (nextTabId === activeTabId) {
      return;
    }

    if (shouldAnimate) {
      prepareCodeTransition();
    }

    setRequestedActiveTabId(nextTabId);
  }

  function handleTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!hasTabs) {
      return;
    }

    const currentIndex = activeTabIndex >= 0 ? activeTabIndex : 0;
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = Math.min(resolvedTabs.length - 1, currentIndex + 1);
        break;
      case "ArrowLeft":
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = resolvedTabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();

    const nextTab = resolvedTabs[nextIndex];
    if (!nextTab) {
      return;
    }

    requestActiveTab(nextTab.id);
    tabButtonRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm",
        className
      )}
      {...rest}
    >
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-slate-600">
          <FileCode2 className="size-4 shrink-0" />
          {hasTabs ? (
            <div className="min-w-0 mr-[8px]">
              <div
                ref={tabListRef}
                className={cn(
                  "relative flex max-w-full items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
                  shouldAnimate
                    ? "overflow-x-auto overflow-y-hidden"
                    : "flex-wrap overflow-visible"
                )}
                role="tablist"
                aria-label="Code example files"
                aria-orientation="horizontal"
                onKeyDown={handleTabListKeyDown}
              >
                {shouldAnimate ? (
                  <span
                    ref={tabIndicatorRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-1 left-0 rounded-lg border border-black/5 bg-[#fffdf8] opacity-0 shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-[transform,width,opacity] duration-200 ease-[cubic-bezier(.4,0,.22,1)]"
                  />
                ) : null}
                {resolvedTabs.map((tab, index) => {
                  const isActive = tab.id === activeTab?.id;

                  return (
                    <button
                      key={tab.id}
                      id={`${codePanelId}-${tab.id}-tab`}
                      ref={(node) => {
                        tabButtonRefs.current[index] = node;
                      }}
                      type="button"
                      role="tab"
                      tabIndex={isActive ? 0 : -1}
                      aria-selected={isActive}
                      aria-controls={codePanelId}
                      title={tab.label}
                      data-state={isActive ? "active" : "inactive"}
                      className={cn(
                        CODE_BLOCK_TAB_BUTTON_BASE_CLASS,
                        isActive
                          ? CODE_BLOCK_TAB_BUTTON_ACTIVE_CLASS
                          : CODE_BLOCK_TAB_BUTTON_INACTIVE_CLASS
                      )}
                      onClick={() => {
                        requestActiveTab(tab.id);
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <span className="truncate font-medium">{label}</span>
          )}
        </div>
        {copyable ? (
          <button
            type="button"
            className="inline-flex shrink-0 self-start items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 sm:self-auto cursor-pointer"
            onClick={() => {
              void handleCopy();
            }}
            aria-label={`${buttonLabel} code`}
          >
            {visibleCopyState === "copied" ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {buttonLabel}
          </button>
        ) : null}
      </div>
      <pre
        ref={codePanelRef}
        id={codePanelId}
        role="tabpanel"
        aria-labelledby={activeTabTriggerId}
        className="rmg-code-block__panel overflow-x-auto overflow-y-hidden bg-slate-50 px-4 py-3"
        style={codeBlockTransitionStyle}
      >
        <div
          ref={codeLayersRef}
          className="rmg-code-block__layers"
        >
          {shouldAnimate && outgoingCodeLayer ? (
            <code
              aria-hidden="true"
              className={cn(
                "rmg-code-block rmg-code-block__layer rmg-code-block__layer--exit block min-w-max font-mono text-[13px] leading-5 text-slate-900",
                showLineNumbers ? "rmg-code-block--line-numbers" : "rmg-code-block--plain"
              )}
              dangerouslySetInnerHTML={{ __html: outgoingCodeLayer.highlightedCode }}
            />
          ) : null}
          <code
            ref={codeElementRef}
            className={cn(
              "rmg-code-block block min-w-max font-mono text-[13px] leading-5 text-slate-900",
              shouldAnimate && outgoingCodeLayer
                ? "rmg-code-block__layer rmg-code-block__layer--enter"
                : null,
              showLineNumbers ? "rmg-code-block--line-numbers" : "rmg-code-block--plain"
            )}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </div>
      </pre>
    </div>
  );
}
