import { afterEach, describe, expect, test, vi } from "vitest";

import {
  LAZY_SPINNER_FADE_MS,
  hideSpinnerEl,
  showSpinnerEl,
} from "../shared/lazy/lazyShell";

function createSpinnerEl() {
  const styles = new Map<string, string>();
  const attrs = new Map<string, string>();

  return {
    style: {
      setProperty(name: string, value: string) {
        styles.set(name, value);
      },
      getPropertyValue(name: string) {
        return styles.get(name) ?? "";
      },
    },
    setAttribute(name: string, value: string) {
      attrs.set(name, value);
    },
    getAttribute(name: string) {
      return attrs.get(name) ?? null;
    },
    removeAttribute(name: string) {
      attrs.delete(name);
    },
  } as unknown as HTMLElement;
}

describe("slider lazy spinner helpers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("waits for the configured exit duration before finalizing hide", () => {
    vi.useFakeTimers();
    const spinnerEl = createSpinnerEl();
    const onHidden = vi.fn();

    hideSpinnerEl(spinnerEl, onHidden);

    expect(spinnerEl.style.getPropertyValue("opacity")).toBe("0");
    expect(spinnerEl.style.getPropertyValue("visibility")).toBe("");
    expect(onHidden).not.toHaveBeenCalled();

    vi.advanceTimersByTime(LAZY_SPINNER_FADE_MS - 1);
    expect(onHidden).not.toHaveBeenCalled();
    expect(spinnerEl.style.getPropertyValue("visibility")).toBe("");

    vi.advanceTimersByTime(1);
    expect(spinnerEl.style.getPropertyValue("visibility")).toBe("hidden");
    expect(onHidden).toHaveBeenCalledTimes(1);
  });

  test("cancels a stale hide when the spinner is shown again", () => {
    vi.useFakeTimers();
    const spinnerEl = createSpinnerEl();
    const onHidden = vi.fn();

    hideSpinnerEl(spinnerEl, onHidden);
    showSpinnerEl(spinnerEl);

    expect(spinnerEl.getAttribute("data-rmg-spinner-hide-timer")).toBeNull();
    expect(spinnerEl.style.getPropertyValue("opacity")).toBe("1");
    expect(spinnerEl.style.getPropertyValue("visibility")).toBe("visible");

    vi.advanceTimersByTime(LAZY_SPINNER_FADE_MS);
    expect(onHidden).not.toHaveBeenCalled();
    expect(spinnerEl.style.getPropertyValue("visibility")).toBe("visible");
  });

  test("only the latest hide callback can finalize the spinner", () => {
    vi.useFakeTimers();
    const spinnerEl = createSpinnerEl();
    const firstHidden = vi.fn();
    const secondHidden = vi.fn();

    hideSpinnerEl(spinnerEl, firstHidden);
    vi.advanceTimersByTime(LAZY_SPINNER_FADE_MS / 2);
    hideSpinnerEl(spinnerEl, secondHidden);

    vi.advanceTimersByTime(LAZY_SPINNER_FADE_MS / 2);
    expect(firstHidden).not.toHaveBeenCalled();
    expect(secondHidden).not.toHaveBeenCalled();

    vi.advanceTimersByTime(LAZY_SPINNER_FADE_MS / 2);
    expect(firstHidden).not.toHaveBeenCalled();
    expect(secondHidden).toHaveBeenCalledTimes(1);
    expect(spinnerEl.style.getPropertyValue("visibility")).toBe("hidden");
  });

  test("resolves immediately when no spinner element exists", () => {
    vi.useFakeTimers();
    const onHidden = vi.fn();

    hideSpinnerEl(null, onHidden);

    expect(onHidden).toHaveBeenCalledTimes(1);
  });
});
