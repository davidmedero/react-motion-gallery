import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OwalaAmazonReviewsSection } from "@/content/owala-amazon-reviews/OwalaAmazonReviewsSection";

const OWALA_RELOAD_SCROLL_RESTORATION_GUARD = String.raw`
(function () {
  var storagePrefix = "rmg:owala-reload-scroll:";
  var restoreFrame = null;
  var storeFrame = null;
  var releaseTimer = null;
  var target = getNavigationType() === "reload" ? readTarget() : null;
  var cancelled = false;
  var startedAt = now();

  if (target && window.history && "scrollRestoration" in window.history) {
    try {
      window.history.scrollRestoration = "manual";
    } catch (error) {}
  }

  function now() {
    return window.performance && window.performance.now
      ? window.performance.now()
      : Date.now();
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
    return storagePrefix + window.location.pathname + window.location.search;
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
      if (!parsed) {
        return null;
      }

      var y = Math.max(0, Number(parsed.y) || 0);
      var x = Math.max(0, Number(parsed.x) || 0);
      var savedMax = Math.max(0, Number(parsed.max) || 0);
      var bottomGap = Number(parsed.bottomGap);
      var bottom = savedMax > 8 &&
        (parsed.bottom === true ||
          (Number.isFinite(bottomGap) && bottomGap <= 8));

      if (y <= 0 && !bottom) {
        return null;
      }

      return {
        x: x,
        y: y,
        bottom: bottom
      };
    } catch (error) {
      return null;
    }
  }

  function storeScrollPosition() {
    try {
      var maxY = maxScrollY();
      var bottomGap = Math.max(0, maxY - (window.scrollY || 0));
      window.sessionStorage.setItem(
        buildStorageKey(),
        JSON.stringify({
          x: window.scrollX || 0,
          y: window.scrollY || 0,
          max: maxY,
          bottomGap: bottomGap,
          bottom: maxY > 8 && bottomGap <= 8,
          viewportHeight: window.innerHeight,
          time: Date.now()
        })
      );
    } catch (error) {}
  }

  function scheduleStoreScrollPosition() {
    if (storeFrame !== null) {
      return;
    }

    storeFrame = window.requestAnimationFrame(function () {
      storeFrame = null;
      storeScrollPosition();
    });
  }

  function releaseScrollRestoration() {
    if (releaseTimer !== null) {
      window.clearTimeout(releaseTimer);
      releaseTimer = null;
    }

    if (restoreFrame !== null) {
      window.cancelAnimationFrame(restoreFrame);
      restoreFrame = null;
    }

    try {
      if (window.history && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    } catch (error) {}
  }

  function cancelRestore() {
    cancelled = true;
    releaseScrollRestoration();
  }

  function restoreScrollPosition(allowClamp) {
    if (!target || cancelled) {
      return false;
    }

    var availableMaxY = maxScrollY();
    if (!target.bottom && !allowClamp && availableMaxY + 1 < target.y) {
      return false;
    }

    var nextY = target.bottom ? availableMaxY : Math.min(target.y, availableMaxY);
    window.scrollTo(target.x, nextY);

    return Math.abs((window.scrollY || 0) - nextY) <= 1;
  }

  function restoreUntilSettled() {
    restoreScrollPosition(true);

    if (!target || cancelled) {
      return;
    }

    var duration = target.bottom ? 2800 : 900;
    if (now() - startedAt < duration) {
      restoreFrame = window.requestAnimationFrame(restoreUntilSettled);
    }
  }

  function restoreWhenReady() {
    restoreScrollPosition(false);
  }

  storeScrollPosition();

  window.addEventListener("pagehide", storeScrollPosition);
  window.addEventListener("beforeunload", storeScrollPosition);
  window.addEventListener("scroll", scheduleStoreScrollPosition, { passive: true });
  window.addEventListener("resize", scheduleStoreScrollPosition);

  if (!target) {
    return;
  }

  window.addEventListener("wheel", cancelRestore, { passive: true, once: true });
  window.addEventListener("touchstart", cancelRestore, { passive: true, once: true });
  window.addEventListener("keydown", cancelRestore, { once: true });
  window.addEventListener("mousedown", cancelRestore, { once: true });

  document.addEventListener("readystatechange", restoreWhenReady);
  window.addEventListener("DOMContentLoaded", restoreWhenReady);
  window.addEventListener("load", function () {
    restoreScrollPosition(true);
  });

  [0, 16, 32, 64, 100, 160, 240, 360, 520, 760, 1040, 1400].forEach(function (delay) {
    window.setTimeout(restoreWhenReady, delay);
  });

  restoreUntilSettled();
  releaseTimer = window.setTimeout(releaseScrollRestoration, 3000);
})();
`;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owala Amazon Reviews Section",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OwalaAmazonReviewsDevPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <>
      <script
        id="owala-reload-scroll-restoration"
        dangerouslySetInnerHTML={{
          __html: OWALA_RELOAD_SCROLL_RESTORATION_GUARD,
        }}
      />
      <OwalaAmazonReviewsSection />
    </>
  );
}
