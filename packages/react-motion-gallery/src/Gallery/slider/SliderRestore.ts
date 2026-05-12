import {
  normalizeResponsiveToMinWidthRules,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../shared/responsive";

export type SliderLoadingRestoreOptions = {
  enabled?: boolean;
  key?: string;
  ttlMs?: number;
};

export type SliderRestoreState = {
  version: 1;
  index: number;
  heightPx?: number;
  viewportWidth: number;
  slideCount: number;
  skeletonSlotCount: number;
  timestamp: number;
  scrollY: number;
  scrollMax: number;
  wasAtBottom: boolean;
};

export type SliderRestoreRuntimeOptions = {
  enabled: boolean;
  storageKeyId: string;
  ttlMs: number;
  slideCount: number;
  skeletonSlotCount: number;
  controlled?: boolean;
};

export type SliderRestoreVisibleSlot = {
  slot: number;
  order: number;
};

export const DEFAULT_SLIDER_RESTORE_TTL_MS = 5 * 60 * 1000;
export const SLIDER_RESTORE_VIEWPORT_TOLERANCE_PX = 2;

const STORAGE_PREFIX = "rmg:slider-restore";
const NAVIGATION_TYPES = new Set(["reload", "back_forward"]);

function mod(value: number, length: number) {
  return ((value % length) + length) % length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function nowMs() {
  return Date.now();
}

export function normalizeSliderRestoreOptions(
  restore: SliderLoadingRestoreOptions | undefined,
  scopeId: string
): SliderRestoreRuntimeOptions | null {
  if (restore?.enabled !== true) return null;

  const ttlMs =
    typeof restore.ttlMs === "number" && Number.isFinite(restore.ttlMs)
      ? Math.max(0, restore.ttlMs)
      : DEFAULT_SLIDER_RESTORE_TTL_MS;

  return {
    enabled: true,
    storageKeyId:
      typeof restore.key === "string" && restore.key.trim()
        ? restore.key.trim()
        : scopeId,
    ttlMs,
    slideCount: 0,
    skeletonSlotCount: 0,
  };
}

export function getSliderRestoreStorageKey(
  storageKeyId: string,
  loc: Pick<Location, "pathname" | "search"> | undefined =
    typeof window !== "undefined" ? window.location : undefined
) {
  const path = loc ? `${loc.pathname}${loc.search}` : "";
  return `${STORAGE_PREFIX}:${storageKeyId}:${path}`;
}

export function getSliderRestoreNavigationType(win: Window = window): string | null {
  const entries = win.performance?.getEntriesByType?.("navigation") ?? [];
  const nav = entries[0] as PerformanceNavigationTiming | undefined;
  if (nav?.type) return nav.type;

  const legacy = (win.performance as
    | (Performance & {
        navigation?: {
          type: number;
          TYPE_RELOAD: number;
          TYPE_BACK_FORWARD: number;
        };
      })
    | undefined)?.navigation;
  if (!legacy) return null;
  if (legacy.type === legacy.TYPE_RELOAD) return "reload";
  if (legacy.type === legacy.TYPE_BACK_FORWARD) return "back_forward";
  return null;
}

export function isSliderRestoreNavigation(win: Window = window) {
  const type = getSliderRestoreNavigationType(win);
  return !!type && NAVIGATION_TYPES.has(type);
}

export function parseSliderRestoreState(raw: string | null | undefined): SliderRestoreState | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) return null;
  if (parsed.version !== 1) return null;

  const index = Number(parsed.index);
  const viewportWidth = Number(parsed.viewportWidth);
  const slideCount = Number(parsed.slideCount);
  const skeletonSlotCount = Number(parsed.skeletonSlotCount);
  const timestamp = Number(parsed.timestamp);
  const scrollY = Number(parsed.scrollY);
  const scrollMax = Number(parsed.scrollMax);
  const heightPx =
    parsed.heightPx == null ? undefined : Number(parsed.heightPx);

  if (!Number.isInteger(index) || index < 0) return null;
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) return null;
  if (!Number.isInteger(slideCount) || slideCount <= 0) return null;
  if (!Number.isInteger(skeletonSlotCount) || skeletonSlotCount <= 0) return null;
  if (!Number.isFinite(timestamp) || timestamp <= 0) return null;
  if (heightPx != null && (!Number.isFinite(heightPx) || heightPx <= 0)) return null;

  return {
    version: 1,
    index,
    heightPx,
    viewportWidth,
    slideCount,
    skeletonSlotCount,
    timestamp,
    scrollY: Number.isFinite(scrollY) ? Math.max(0, scrollY) : 0,
    scrollMax: Number.isFinite(scrollMax) ? Math.max(0, scrollMax) : 0,
    wasAtBottom: parsed.wasAtBottom === true,
  };
}

export function validateSliderRestoreState(
  state: SliderRestoreState | null,
  args: {
    ttlMs: number;
    now?: number;
    viewportWidth: number;
    slideCount: number;
    skeletonSlotCount: number;
    viewportTolerancePx?: number;
  }
) {
  if (!state) return null;

  const ttlMs = Math.max(0, args.ttlMs);
  const age = (args.now ?? nowMs()) - state.timestamp;
  if (ttlMs > 0 && (age < 0 || age > ttlMs)) return null;
  if (state.slideCount !== args.slideCount) return null;
  if (state.skeletonSlotCount !== args.skeletonSlotCount) return null;
  if (state.index < 0 || state.index >= args.slideCount) return null;

  const tolerance = args.viewportTolerancePx ?? SLIDER_RESTORE_VIEWPORT_TOLERANCE_PX;
  if (Math.abs(state.viewportWidth - args.viewportWidth) > tolerance) return null;

  return state;
}

export function readSliderRestoreStateFromWindow(
  runtime: SliderRestoreRuntimeOptions | null | undefined,
  win: Window = window
) {
  if (!runtime?.enabled || runtime.controlled) return null;
  if (!isSliderRestoreNavigation(win)) return null;

  try {
    const raw = win.sessionStorage.getItem(
      getSliderRestoreStorageKey(runtime.storageKeyId, win.location)
    );
    return validateSliderRestoreState(parseSliderRestoreState(raw), {
      ttlMs: runtime.ttlMs,
      viewportWidth: win.innerWidth || win.document.documentElement.clientWidth || 0,
      slideCount: runtime.slideCount,
      skeletonSlotCount: runtime.skeletonSlotCount,
    });
  } catch {
    return null;
  }
}

export function writeSliderRestoreStateToWindow(
  runtime: SliderRestoreRuntimeOptions | null | undefined,
  state: Pick<SliderRestoreState, "index" | "slideCount" | "skeletonSlotCount"> &
    Partial<SliderRestoreState>,
  win: Window = window
) {
  if (!runtime?.enabled || runtime.controlled) return;

  try {
    const doc = win.document.documentElement;
    const body = win.document.body;
    const scrollHeight = Math.max(
      doc?.scrollHeight ?? 0,
      body?.scrollHeight ?? 0
    );
    const viewportHeight = win.innerHeight || doc?.clientHeight || 0;
    const scrollMax = Math.max(0, scrollHeight - viewportHeight);
    const scrollY = Math.max(0, win.scrollY || win.pageYOffset || 0);
    const wasAtBottom = scrollMax > 0 && scrollMax - scrollY <= 4;

    const next: SliderRestoreState = {
      version: 1,
      index: Math.max(0, Math.floor(state.index)),
      heightPx: state.heightPx,
      viewportWidth: win.innerWidth || doc?.clientWidth || 0,
      slideCount: state.slideCount,
      skeletonSlotCount: state.skeletonSlotCount,
      timestamp: nowMs(),
      scrollY,
      scrollMax,
      wasAtBottom,
    };

    win.sessionStorage.setItem(
      getSliderRestoreStorageKey(runtime.storageKeyId, win.location),
      JSON.stringify(next)
    );
  } catch {
    // Session storage can be unavailable in private contexts.
  }
}

export function getSliderRestoreVisibleSlots(args: {
  activeIndex: number;
  visibleCount: number;
  slotCount: number;
  loop: boolean;
  activeSlotOffset: number;
}): SliderRestoreVisibleSlot[] {
  const slotCount = Math.max(0, Math.floor(args.slotCount));
  const visibleCount = Math.min(
    slotCount,
    Math.max(0, Math.floor(args.visibleCount))
  );
  if (slotCount <= 0 || visibleCount <= 0) return [];

  const activeIndex = Math.min(
    Math.max(0, Math.floor(args.activeIndex)),
    Math.max(0, slotCount - 1)
  );
  const activeSlotOffset = Math.min(
    Math.max(0, Math.floor(args.activeSlotOffset)),
    Math.max(0, visibleCount - 1)
  );

  const start = args.loop
    ? activeIndex
    : Math.min(
        Math.max(0, activeIndex - activeSlotOffset),
        Math.max(0, slotCount - visibleCount)
      );

  const out: SliderRestoreVisibleSlot[] = [];
  const seen = new Set<number>();

  for (let order = 0; order < visibleCount; order += 1) {
    const raw = start + order;
    const slot = args.loop ? mod(raw, slotCount) : raw;
    if (slot < 0 || slot >= slotCount || seen.has(slot)) continue;
    seen.add(slot);
    out.push({ slot: slot + 1, order });
  }

  return out;
}

function jsonForScript(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function buildSliderRestoreScriptSource(cfg: {
  scopeId: string;
  storageKeyId: string;
  ttlMs: number;
  slideCount: number;
  skeletonSlotCount: number;
  maxSlots: number;
  loop: boolean;
  activeSlotOffset: number;
  countRules: ReturnType<typeof normalizeResponsiveToMinWidthRules>;
  dotStyles: Array<{
    activeStyle?: Record<string, unknown>;
    inactiveStyle?: Record<string, unknown>;
  }>;
  viewportTolerancePx: number;
}) {
  return `(function(){try{
var cfg=${jsonForScript(cfg)};
var nav=(performance.getEntriesByType&&performance.getEntriesByType("navigation")[0]||{}).type;
if(!nav&&performance.navigation){nav=performance.navigation.type===performance.navigation.TYPE_RELOAD?"reload":performance.navigation.type===performance.navigation.TYPE_BACK_FORWARD?"back_forward":"";}
if(nav!=="reload"&&nav!=="back_forward")return;
var key="${STORAGE_PREFIX}:"+cfg.storageKeyId+":"+location.pathname+location.search;
var raw=sessionStorage.getItem(key);
if(!raw)return;
var state=JSON.parse(raw);
var width=innerWidth||document.documentElement.clientWidth||0;
if(!state||state.version!==1)return;
var age=Date.now()-state.timestamp;
if(cfg.ttlMs>0&&(age<0||age>cfg.ttlMs))return;
if(state.slideCount!==cfg.slideCount||state.skeletonSlotCount!==cfg.skeletonSlotCount)return;
if(state.index<0||state.index>=cfg.slideCount)return;
if(Math.abs(state.viewportWidth-width)>cfg.viewportTolerancePx)return;
var count=cfg.countRules[0]?cfg.countRules[0].count:1;
for(var i=0;i<cfg.countRules.length;i++){if(width>=cfg.countRules[i].minWidth)count=cfg.countRules[i].count;}
count=Math.max(1,Math.min(cfg.skeletonSlotCount,Math.floor(count)));
var esc=window.CSS&&CSS.escape?CSS.escape:function(value){return String(value).replace(/["\\\\]/g,"\\\\$&");};
var cssName=function(prop){return String(prop).replace(/[A-Z]/g,function(ch){return "-"+ch.toLowerCase();});};
var cssDecls=function(obj){var out="";for(var prop in obj){if(!Object.prototype.hasOwnProperty.call(obj,prop))continue;var value=obj[prop];if(value==null)continue;var name=String(prop).indexOf("--")===0?String(prop):cssName(prop);out+=name+":"+String(value)+"!important;";}return out;};
var rootSel='[data-rmg-scope="'+esc(cfg.scopeId)+'"]';
var shellSel=rootSel+' > [data-rmg-scope-shell="true"]';
var css=rootSel+' [data-rmg-skel-slot]{display:none!important;order:0!important;}';
var active=Math.max(0,Math.min(cfg.slideCount-1,Math.floor(state.index)));
var activeOffset=Math.max(0,Math.min(count-1,Math.floor(cfg.activeSlotOffset)));
var start=cfg.loop?active:Math.min(Math.max(0,active-activeOffset),Math.max(0,cfg.skeletonSlotCount-count));
for(var order=0;order<count;order++){var slot=cfg.loop?((start+order)%cfg.skeletonSlotCount+cfg.skeletonSlotCount)%cfg.skeletonSlotCount:start+order;if(slot<0||slot>=cfg.skeletonSlotCount)continue;css+=rootSel+' [data-rmg-skel-slot="'+(slot+1)+'"]{display:block!important;order:'+order+'!important;}';}
if(Number.isFinite(state.heightPx)&&state.heightPx>0){var h=Math.round((state.heightPx+Number.EPSILON)*1000)/1000;css+=shellSel+'{--rmg-slider-initial-height:'+h+'px!important;--rmg-slider-row-height:'+h+'px!important;}';}
for(var d=0;d<cfg.dotStyles.length;d++){var dotStyle=cfg.dotStyles[d]||{};var inactiveDecls=cssDecls(dotStyle.inactiveStyle||{});var activeDecls=cssDecls(dotStyle.activeStyle||{});if(inactiveDecls)css+=rootSel+' [data-rmg-skel-slider-dots] [data-rmg-skel-slider-dot]{'+inactiveDecls+'}';if(activeDecls)css+=rootSel+' [data-rmg-skel-slider-dots] [data-rmg-skel-slider-dot="'+active+'"]{'+activeDecls+'}';}
var style=document.createElement("style");
style.setAttribute("data-rmg-slider-restore-style",cfg.scopeId);
style.textContent=css;
document.head.appendChild(style);
if(state.wasAtBottom){var keep=function(){var doc=document.documentElement;var body=document.body;var max=Math.max(0,Math.max(doc.scrollHeight,body?body.scrollHeight:0)-(innerHeight||doc.clientHeight||0));scrollTo(scrollX||0,max);};requestAnimationFrame(keep);setTimeout(keep,50);addEventListener("load",function(){requestAnimationFrame(keep);setTimeout(keep,120);},{once:true});}
}catch(e){}})();`;
}

export function buildSliderRestoreScript(args: {
  scopeId: string;
  storageKeyId: string;
  ttlMs: number;
  slideCount: number;
  skeletonSlotCount: number;
  maxSlots: number;
  loop: boolean;
  activeSlotOffset: number;
  responsiveCount: ResponsiveNumber | undefined;
  fallbackCount: number;
  breakpointMap: BreakpointMap;
  dotStyles?: Array<{
    activeStyle?: Record<string, unknown>;
    inactiveStyle?: Record<string, unknown>;
  }>;
}) {
  if (args.slideCount <= 0 || args.skeletonSlotCount <= 0) return "";

  const countRules = normalizeResponsiveToMinWidthRules(
    args.responsiveCount,
    args.fallbackCount,
    args.breakpointMap
  );
  const cfg = {
    scopeId: args.scopeId,
    storageKeyId: args.storageKeyId,
    ttlMs: args.ttlMs,
    slideCount: args.slideCount,
    skeletonSlotCount: args.skeletonSlotCount,
    maxSlots: args.maxSlots,
    loop: args.loop,
    activeSlotOffset: args.activeSlotOffset,
    countRules,
    dotStyles: args.dotStyles ?? [],
    viewportTolerancePx: SLIDER_RESTORE_VIEWPORT_TOLERANCE_PX,
  };

  return buildSliderRestoreScriptSource(cfg);
}
