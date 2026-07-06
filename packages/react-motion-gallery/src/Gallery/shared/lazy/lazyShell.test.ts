import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import {
  normalizeLazyLoad,
  resolveLazySpinnerAnchor,
  resolveLazySpinnerNode,
  resolveLazySpinnerStyle,
} from "./LazyItemHost";
import {
  LAZY_ATTR,
  LAZY_HOST_ATTR,
  LAZY_LOADED_ATTR,
  LAZY_SPINNER_FADE_MS,
  RMG_BLANK,
  hydrateLazyImageShell,
  markLazyImageShell,
  restoreLazyImageShell,
  revealLazyImageShell,
} from "./lazyShell";

class FakeStyle {
  opacity = "";
  transition = "";
  visibility = "";
  pointerEvents = "";
  backgroundImage = "";

  setProperty(name: string, value: string) {
    (this as any)[toCamelCase(name)] = value;
  }

  removeProperty(name: string) {
    (this as any)[toCamelCase(name)] = "";
  }

  getPropertyValue(name: string) {
    return (this as any)[toCamelCase(name)] ?? "";
  }
}

class FakeElement {
  tagName: string;
  parentElement: FakeElement | null = null;
  children: FakeElement[] = [];
  style = new FakeStyle();
  protected attrs = new Map<string, string>();

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  appendChild(child: FakeElement) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  setAttribute(name: string, value: string) {
    this.attrs.set(name, value);
  }

  getAttribute(name: string) {
    return this.attrs.get(name) ?? null;
  }

  hasAttribute(name: string) {
    return this.attrs.has(name);
  }

  removeAttribute(name: string) {
    this.attrs.delete(name);
  }

  querySelector<T extends FakeElement = FakeElement>(selector: string): T | null {
    return this.querySelectorAll<T>(selector)[0] ?? null;
  }

  querySelectorAll<T extends FakeElement = FakeElement>(selector: string): T[] {
    const results: T[] = [];

    const visit = (node: FakeElement) => {
      for (const child of node.children) {
        if (matchesSelector(child, selector)) {
          results.push(child as T);
        }
        visit(child);
      }
    };

    visit(this);
    return results;
  }

  closest(selectorList: string) {
    let node: FakeElement | null = this;
    const selectors = selectorList.split(",").map((part) => part.trim()).filter(Boolean);

    while (node) {
      if (selectors.some((selector) => matchesSelector(node as FakeElement, selector))) {
        return node;
      }
      node = node.parentElement;
    }

    return null;
  }
}

class FakeImageElement extends FakeElement {
  complete = true;
  naturalWidth = 1;
  currentSrc = "";
  decode = vi.fn(async () => {});
  private _src = "";

  constructor(src: string) {
    super("img");
    this.src = src;
  }

  override setAttribute(name: string, value: string) {
    super.setAttribute(name, value);
    if (name === "src") {
      this._src = value;
      if (value && value !== RMG_BLANK) {
        this.currentSrc = value;
      }
    }
  }

  override removeAttribute(name: string) {
    super.removeAttribute(name);
    if (name === "src") {
      this._src = "";
    }
  }

  set src(value: string) {
    this.setAttribute("src", value);
  }

  get src() {
    return this._src;
  }
}

const previousHTMLElement = (globalThis as any).HTMLElement;
const previousHTMLImageElement = (globalThis as any).HTMLImageElement;

function toCamelCase(name: string) {
  return name.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());
}

function matchesSelector(node: FakeElement, selector: string) {
  if (selector === "img") return node.tagName === "IMG";
  if (selector === "img[src]") {
    return node.tagName === "IMG" && node.hasAttribute("src");
  }
  if (selector === "video") return node.tagName === "VIDEO";
  if (selector === "iframe") return node.tagName === "IFRAME";
  if (selector === ".plyr") {
    const className = node.getAttribute("class") ?? "";
    return className.split(/\s+/).includes("plyr");
  }

  const attrMatch = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
  if (!attrMatch) return false;

  const [, attrName, attrValue] = attrMatch;
  if (!node.hasAttribute(attrName)) return false;
  if (attrValue == null) return true;
  return node.getAttribute(attrName) === attrValue;
}

function createLazyHost(src = "https://example.com/gallery.jpg") {
  const host = new FakeElement("div");
  const content = new FakeElement("article");
  const img = new FakeImageElement(src);
  const spinner = new FakeElement("div");

  spinner.setAttribute("data-rmg-spinner", "");
  content.appendChild(img);
  host.appendChild(content);
  host.appendChild(spinner);

  return { host, img, spinner, src };
}

describe("lazy shell helpers", () => {
  beforeAll(() => {
    (globalThis as any).HTMLElement = FakeElement;
    (globalThis as any).HTMLImageElement = FakeImageElement;
  });

  afterAll(() => {
    (globalThis as any).HTMLElement = previousHTMLElement;
    (globalThis as any).HTMLImageElement = previousHTMLImageElement;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("blanks image src and stashes the real URL on mark", () => {
    const { host, img, src } = createLazyHost();

    markLazyImageShell(host as unknown as HTMLElement);

    expect(host.hasAttribute(LAZY_HOST_ATTR)).toBe(true);
    expect(img.getAttribute(LAZY_ATTR)).toBe(src);
    expect(img.src).toBe(RMG_BLANK);
    expect(img.style.opacity).toBe("0");
  });

  test("reveals a marked image after decode while spinner fades out", async () => {
    vi.useFakeTimers();
    const { host, img, spinner, src } = createLazyHost();

    markLazyImageShell(host as unknown as HTMLElement);
    const revealPromise = revealLazyImageShell(host as unknown as HTMLElement);

    await vi.advanceTimersByTimeAsync(0);
    await revealPromise;

    expect(img.decode).toHaveBeenCalledTimes(1);
    expect(img.src).toBe(src);
    expect(img.getAttribute(LAZY_ATTR)).toBeNull();
    expect(img.style.opacity).toBe("1");
    expect(host.getAttribute(LAZY_LOADED_ATTR)).toBe("true");
    expect(spinner.style.getPropertyValue("visibility")).toBe("visible");
    expect(spinner.style.getPropertyValue("opacity")).toBe("0");

    await vi.advanceTimersByTimeAsync(LAZY_SPINNER_FADE_MS);
    expect(spinner.style.getPropertyValue("visibility")).toBe("hidden");
  });

  test("hydrates an already revealed shell immediately", () => {
    const { host, img, src } = createLazyHost();
    const onRevealed = vi.fn();

    markLazyImageShell(host as unknown as HTMLElement);
    hydrateLazyImageShell(host as unknown as HTMLElement, { onRevealed });

    expect(img.src).toBe(src);
    expect(img.getAttribute(LAZY_ATTR)).toBeNull();
    expect(host.getAttribute(LAZY_LOADED_ATTR)).toBe("true");
    expect(onRevealed).toHaveBeenCalledTimes(1);
  });

  test("hydrates pending targets on a shell that is already marked loaded", async () => {
    const { host, img, src } = createLazyHost();
    const onRevealed = vi.fn();

    markLazyImageShell(host as unknown as HTMLElement);
    hydrateLazyImageShell(host as unknown as HTMLElement);
    img.setAttribute(LAZY_ATTR, src);
    img.src = RMG_BLANK;
    img.style.opacity = "0";

    await revealLazyImageShell(host as unknown as HTMLElement, { onRevealed });

    expect(img.src).toBe(src);
    expect(img.getAttribute(LAZY_ATTR)).toBeNull();
    expect(img.style.opacity).toBe("1");
    expect(host.getAttribute(LAZY_LOADED_ATTR)).toBe("true");
    expect(onRevealed).toHaveBeenCalledTimes(1);
  });

  test("restores an unrevealed shell back to its original src", () => {
    const { host, img, src } = createLazyHost();

    markLazyImageShell(host as unknown as HTMLElement);
    restoreLazyImageShell(host as unknown as HTMLElement);

    expect(img.src).toBe(src);
    expect(img.getAttribute(LAZY_ATTR)).toBeNull();
    expect(host.hasAttribute(LAZY_HOST_ATTR)).toBe(false);
    expect(host.hasAttribute(LAZY_LOADED_ATTR)).toBe(false);
  });

  test("remarking a restored shell hides the pending image again", () => {
    const { host, img, src } = createLazyHost();

    markLazyImageShell(host as unknown as HTMLElement);
    restoreLazyImageShell(host as unknown as HTMLElement);
    markLazyImageShell(host as unknown as HTMLElement);

    expect(img.getAttribute(LAZY_ATTR)).toBe(src);
    expect(img.src).toBe(RMG_BLANK);
    expect(img.style.opacity).toBe("0");
  });

  test("does not render a spinner when lazy loading is disabled", () => {
    const lazy = normalizeLazyLoad({ enabled: false, spinner: true });
    const resolved = resolveLazySpinnerNode({ lazy, kind: "image", isClone: false });

    expect(resolved.render).toBe(false);
  });

  test("supports masonry-style remount hydration from a persistent revealed set", () => {
    const revealedIndices = new Set<number>([3]);
    const { host, img, src } = createLazyHost();

    if (revealedIndices.has(3)) {
      hydrateLazyImageShell(host as unknown as HTMLElement);
    } else {
      markLazyImageShell(host as unknown as HTMLElement);
    }

    expect(img.src).toBe(src);
    expect(img.getAttribute(LAZY_ATTR)).toBeNull();
    expect(host.getAttribute(LAZY_LOADED_ATTR)).toBe("true");
  });

  test("anchors the default spinner to the primary image center", () => {
    expect(
      resolveLazySpinnerAnchor({
        hostRect: {
          left: 20,
          top: 40,
          width: 260,
          height: 360,
        },
        imageRect: {
          left: 36,
          top: 64,
          width: 208,
          height: 280,
        },
      })
    ).toEqual({
      top: "164px",
      left: "120px",
    });
  });

  test("falls back to host centering when image bounds are unavailable", () => {
    expect(
      resolveLazySpinnerAnchor({
        hostRect: {
          left: 20,
          top: 40,
          width: 260,
          height: 360,
        },
        imageRect: {
          left: 36,
          top: 64,
          width: 0,
          height: 280,
        },
      })
    ).toBeNull();
    expect(
      resolveLazySpinnerAnchor({
        hostRect: {
          left: 20,
          top: 40,
          width: 260,
          height: 360,
        },
        imageRect: null,
      })
    ).toBeNull();
  });

  test("merges measured image anchors into the built-in spinner style only", () => {
    expect(
      resolveLazySpinnerStyle({
        isCustom: false,
        anchor: {
          top: "164px",
          left: "120px",
        },
        spinnerStyle: {
          width: 52,
          height: 52,
        },
      })
    ).toEqual({
      top: "164px",
      left: "120px",
      width: 52,
      height: 52,
    });

    const customStyle = {
      width: 52,
      height: 52,
    };

    expect(
      resolveLazySpinnerStyle({
        isCustom: true,
        anchor: {
          top: "164px",
          left: "120px",
        },
        spinnerStyle: customStyle,
      })
    ).toBe(customStyle);
  });
});
