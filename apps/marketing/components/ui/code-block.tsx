"use client";

import { Check, Copy, FileCode2 } from "lucide-react";
import { useEffect, useState, type HTMLAttributes, type JSX } from "react";
import { cn } from "@/lib/utils";

type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  filename?: string;
  language?: string;
  copyable?: boolean;
  showLineNumbers?: boolean;
};

export function CodeBlock(props: CodeBlockProps): JSX.Element {
  const {
    code,
    filename,
    language = "tsx",
    copyable = true,
    showLineNumbers = true,
    className,
    ...rest
  } = props;
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (copyState !== "copied") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState("idle");
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  const lines = code.split("\n");
  const label = filename ?? `${language.toUpperCase()} snippet`;
  const buttonLabel =
    copyState === "copied" ? "Copied" : copyState === "error" ? "Retry copy" : "Copy";

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
          <span className="truncate font-medium">{label}</span>
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
      <pre className="overflow-x-auto bg-white px-4 py-4">
        <code className="block min-w-max font-mono text-[13px] leading-6 text-slate-900">
          {lines.map((line, index) => (
            <span
              key={`${index}-${line}`}
              className={cn(
                "block",
                showLineNumbers && "grid grid-cols-[auto_1fr] items-start gap-4"
              )}
            >
              {showLineNumbers ? (
                <span className="select-none text-right text-slate-400">
                  {index + 1}
                </span>
              ) : null}
              <span className="whitespace-pre">{line.length > 0 ? line : " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
