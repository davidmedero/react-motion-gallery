"use client";

import { Check, Copy, FileCode2 } from "lucide-react";
import { highlight } from "sugar-high";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type JSX,
} from "react";
import { cn } from "@/lib/utils";

type CodeBlockTab = {
  id: string;
  label: string;
  code: string;
  filename?: string;
  language?: string;
};

type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  filename?: string;
  language?: string;
  copyable?: boolean;
  showLineNumbers?: boolean;
  tabs?: CodeBlockTab[];
  defaultTabId?: string;
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
    className,
    ...rest
  } = props;
  const codePanelId = useId();
  const resolvedTabs = useMemo(() => {
    if (tabs && tabs.length > 0) {
      return tabs;
    }

    return [
      {
        id: language,
        label: language.toUpperCase(),
        code,
        filename,
        language,
      },
    ];
  }, [code, filename, language, tabs]);
  const resolvedDefaultTabId =
    resolvedTabs.find((tab) => tab.id === defaultTabId)?.id ?? resolvedTabs[0]?.id ?? language;
  const [activeTabId, setActiveTabId] = useState(resolvedDefaultTabId);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const codeElementRef = useRef<HTMLElement | null>(null);
  const activeTab =
    resolvedTabs.find((tab) => tab.id === activeTabId) ?? resolvedTabs[0] ?? null;
  const activeCode = activeTab?.code ?? code;
  const activeLanguage = activeTab?.language ?? language;
  const activeFilename = activeTab?.filename ?? filename;
  const activeTabTriggerId = activeTab ? `${codePanelId}-${activeTab.id}-tab` : undefined;
  const highlightedCode = highlight(activeCode);

  useEffect(() => {
    setActiveTabId(resolvedDefaultTabId);
  }, [resolvedDefaultTabId]);

  useEffect(() => {
    if (copyState !== "copied") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState("idle");
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  useEffect(() => {
    setCopyState("idle");
  }, [activeCode, activeTabId]);

  async function handleCopy() {
    const visibleCode = codeElementRef.current?.textContent ?? activeCode;

    try {
      await navigator.clipboard.writeText(visibleCode);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  const label = activeFilename ?? `${activeLanguage.toUpperCase()} snippet`;
  const buttonLabel =
    copyState === "copied" ? "Copied" : copyState === "error" ? "Retry copy" : "Copy";
  const hasTabs = resolvedTabs.length > 1;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm",
        className
      )}
      {...rest}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
          <FileCode2 className="size-4 shrink-0" />
          {hasTabs ? (
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-xs"
                role="tablist"
                aria-label="Code example languages"
              >
                {resolvedTabs.map((tab) => {
                  const isActive = tab.id === activeTab?.id;

                  return (
                    <button
                      key={tab.id}
                      id={`${codePanelId}-${tab.id}-tab`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={codePanelId}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                        isActive
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      )}
                      onClick={() => setActiveTabId(tab.id)}
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
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            onClick={() => {
              void handleCopy();
            }}
            aria-label={`${buttonLabel} code`}
          >
            {copyState === "copied" ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {buttonLabel}
          </button>
        ) : null}
      </div>
      <pre
        id={codePanelId}
        role="tabpanel"
        aria-labelledby={activeTabTriggerId}
        className="overflow-x-auto bg-slate-50 px-4 py-3"
      >
        <code
          ref={codeElementRef}
          className={cn(
            "rmg-code-block block min-w-max font-mono text-[13px] leading-5 text-slate-900",
            showLineNumbers ? "rmg-code-block--line-numbers" : "rmg-code-block--plain"
          )}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
}
