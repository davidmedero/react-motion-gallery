import { headers } from "next/headers";

const SAFARI_RELOAD_SCROLL_RESTORATION_GUARD = String.raw`
(function () {
  if (!window.history || !("scrollRestoration" in window.history)) {
    return;
  }

  var isReload = getNavigationType() === "reload";
  var target = isReload ? readTarget() : null;
  var restored = false;
  var fallbackTimer = null;
  var releaseTimer = null;

  if (target) {
    try {
      window.history.scrollRestoration = "manual";
    } catch (error) {}

    releaseTimer = window.setTimeout(releaseScrollRestoration, 1200);
  }

  function getNavigationType() {
    try {
      var entries = window.performance &&
        window.performance.getEntriesByType &&
        window.performance.getEntriesByType("navigation");
      if (entries && entries[0] && entries[0].type) {
        return entries[0].type;
      }
    } catch (error) {}

    try {
      return window.performance &&
        window.performance.navigation &&
        window.performance.navigation.type === 1
        ? "reload"
        : "navigate";
    } catch (error) {}

    return "navigate";
  }

  function buildStorageKey() {
    return "rmg:safari-reload-scroll:" + window.location.pathname + window.location.search;
  }

  function maxScrollY() {
    var doc = document.documentElement;
    var scroller = document.scrollingElement || doc;
    return Math.max(0, Number((scroller && scroller.scrollHeight) || 0) - window.innerHeight);
  }

  function readTarget() {
    try {
      var raw = window.sessionStorage.getItem(buildStorageKey());
      var parsed = raw ? JSON.parse(raw) : null;
      var y = parsed ? Number(parsed.y) : 0;

      if (!Number.isFinite(y) || y <= 0) {
        return null;
      }

      return {
        x: Math.max(0, Number(parsed.x) || 0),
        y: Math.max(0, y)
      };
    } catch (error) {
      return null;
    }
  }

  function storeScrollPosition() {
    try {
      window.sessionStorage.setItem(
        // This script survives Next client-side navigation, so do not close
        // over the first page's URL.
        buildStorageKey(),
        JSON.stringify({
          x: window.scrollX || 0,
          y: window.scrollY || 0
        })
      );
    } catch (error) {}
  }

  function restoreScrollPosition(allowClamp) {
    if (!target || restored) {
      return;
    }

    var availableMaxY = maxScrollY();
    if (!allowClamp && availableMaxY + 1 < target.y) {
      return;
    }

    window.scrollTo(target.x, Math.min(target.y, availableMaxY));
    restored = true;

    if (fallbackTimer !== null) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  }

  function releaseScrollRestoration() {
    if (releaseTimer !== null) {
      window.clearTimeout(releaseTimer);
      releaseTimer = null;
    }

    try {
      window.history.scrollRestoration = "auto";
    } catch (error) {}
  }

  function restoreWhenReady() {
    restoreScrollPosition(false);
  }

  storeScrollPosition();
  restoreWhenReady();

  document.addEventListener("readystatechange", restoreWhenReady);
  window.addEventListener("DOMContentLoaded", restoreWhenReady);
  window.addEventListener("load", function () {
    restoreScrollPosition(true);
  });
  window.addEventListener("pagehide", storeScrollPosition);
  window.addEventListener("beforeunload", storeScrollPosition);
  window.addEventListener("scroll", storeScrollPosition, { passive: true });

  [0, 16, 32, 64, 100, 160, 240, 360].forEach(function (delay) {
    window.setTimeout(restoreWhenReady, delay);
  });

  fallbackTimer = window.setTimeout(function () {
    restoreScrollPosition(true);
  }, 700);

  window.requestAnimationFrame(function () {
    restoreWhenReady();
    window.requestAnimationFrame(restoreWhenReady);
  });
})();
`;

function isSafariUserAgent(userAgent: string) {
  return (
    /Safari\//.test(userAgent) &&
    !/(Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Android)/.test(userAgent)
  );
}

export async function SafariReloadScrollRestorationGuard() {
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") ?? "";

  if (!isSafariUserAgent(userAgent)) {
    return null;
  }

  return (
    <script
      id="safari-reload-scroll-restoration"
      dangerouslySetInnerHTML={{ __html: SAFARI_RELOAD_SCROLL_RESTORATION_GUARD }}
    />
  );
}
