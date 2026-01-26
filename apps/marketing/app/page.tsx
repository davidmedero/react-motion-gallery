import { Gallery } from "../../../packages/react-motion-gallery/src";

export function FsDiagramBasic() {
  return (
    <svg
      viewBox="0 0 960 520"
      width="100%"
      height="auto"
      role="img"
      aria-label="Baseline fullscreen carousel: media, counter, close, and arrows"
    >
      {/* Frame */}
      <rect
        x="10"
        y="10"
        width="940"
        height="500"
        rx="18"
        fill="#ffffff"
        stroke="rgba(11,18,32,0.18)"
        strokeWidth="2"
      />

      {/* Media tile */}
      <rect
        x="110"
        y="70"
        width="740"
        height="380"
        rx="16"
        fill="rgb(79,184,229)"
        opacity="0.9"
      />

      {/* Counter pill (top-left) */}
      <rect x="36" y="28" width="78" height="28" rx="14" fill="rgba(11,18,32,0.88)" />
      <text
        x="75"
        y="47"
        textAnchor="middle"
        fontSize="13"
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      >
        3 / 12
      </text>

      {/* Close button (top-right) */}
      <circle cx="924" cy="42" r="14" fill="rgba(11,18,32,0.88)" />
      <line x1="917" y1="35" x2="931" y2="49" stroke="#ffffff" strokeWidth="2" />
      <line x1="931" y1="35" x2="917" y2="49" stroke="#ffffff" strokeWidth="2" />

      {/* Left arrow */}
      <g opacity="0.9">
        <circle cx="60" cy="245" r="22" fill="rgba(11,18,32,0.10)" stroke="rgba(11,18,32,0.20)" />
        <polygon points="66,233 52,245 66,257" fill="rgba(11,18,32,0.70)" />
      </g>

      {/* Right arrow */}
      <g opacity="0.9">
        <circle cx="900" cy="245" r="22" fill="rgba(11,18,32,0.10)" stroke="rgba(11,18,32,0.20)" />
        <polygon points="894,233 908,245 894,257" fill="rgba(11,18,32,0.70)" />
      </g>

      {/* Subtle inner outline around media (adds “UI” feel) */}
      <rect
        x="110"
        y="70"
        width="740"
        height="380"
        rx="16"
        fill="transparent"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Soft highlight (optional, very subtle) */}
      <ellipse cx="270" cy="150" rx="210" ry="120" fill="rgba(255,255,255,0.16)" />
    </svg>
  );
}

export function FsDiagramWithThumbs() {
  const VB_H = 560;
  const ARROW_CY = VB_H / 2; // true 50% of the whole SVG (280)

  const ARROW_R = 22;
  const TRI_DX = 14; // left/right triangle horizontal offset
  const TRI_DY = 12; // triangle half-height

  return (
    <svg
      viewBox="0 0 960 560"
      width="100%"
      height="auto"
      role="img"
      aria-label="Fullscreen carousel with bottom thumbnails"
    >
      {/* Frame */}
      <rect
        x="10"
        y="10"
        width="940"
        height="540"
        rx="18"
        fill="#ffffff"
        stroke="rgba(11,18,32,0.18)"
        strokeWidth="2"
      />

      {/* Media tile */}
      <rect
        x="110"
        y="70"
        width="740"
        height="350"
        rx="16"
        fill="rgb(79,184,229)"
        opacity="0.9"
      />

      {/* Inner media outline */}
      <rect
        x="110"
        y="70"
        width="740"
        height="350"
        rx="16"
        fill="transparent"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Counter */}
      <rect x="36" y="28" width="78" height="28" rx="14" fill="rgba(11,18,32,0.88)" />
      <text
        x="75"
        y="47"
        textAnchor="middle"
        fontSize="13"
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      >
        3 / 12
      </text>

      {/* Close button */}
      <circle cx="924" cy="42" r="14" fill="rgba(11,18,32,0.88)" />
      <line x1="917" y1="35" x2="931" y2="49" stroke="#ffffff" strokeWidth="2" />
      <line x1="931" y1="35" x2="917" y2="49" stroke="#ffffff" strokeWidth="2" />

      {/* Left arrow (centered at 50% of SVG height) */}
      <g opacity="0.9">
        <circle
          cx="60"
          cy={ARROW_CY}
          r={ARROW_R}
          fill="rgba(11,18,32,0.10)"
          stroke="rgba(11,18,32,0.20)"
        />
        <polygon
          points={`${60 + 6},${ARROW_CY - TRI_DY} ${60 - (TRI_DX - 2)},${ARROW_CY} ${60 + 6},${ARROW_CY + TRI_DY}`}
          fill="rgba(11,18,32,0.70)"
        />
      </g>

      {/* Right arrow (centered at 50% of SVG height) */}
      <g opacity="0.9">
        <circle
          cx="900"
          cy={ARROW_CY}
          r={ARROW_R}
          fill="rgba(11,18,32,0.10)"
          stroke="rgba(11,18,32,0.20)"
        />
        <polygon
          points={`${900 - 6},${ARROW_CY - TRI_DY} ${900 + (TRI_DX - 2)},${ARROW_CY} ${900 - 6},${ARROW_CY + TRI_DY}`}
          fill="rgba(11,18,32,0.70)"
        />
      </g>

      {/* Thumbnails rail */}
      <rect
        x="110"
        y="440"
        width="740"
        height="88"
        rx="14"
        fill="rgba(11,18,32,0.04)"
        stroke="rgba(11,18,32,0.12)"
      />

      {/* Square thumbnails */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect
          key={i}
          x={130 + i * 100}
          y="452"
          width="64"
          height="64"
          rx="10"
          fill={i === 2 ? "rgb(79,184,229)" : "rgba(11,18,32,0.18)"}
          stroke={i === 2 ? "rgba(79,184,229,0.9)" : "rgba(11,18,32,0.18)"}
          strokeWidth="1.5"
        />
      ))}

      {/* Soft highlight (optional, very subtle) */}
      <ellipse cx="270" cy="150" rx="210" ry="120" fill="rgba(255,255,255,0.16)" />
    </svg>
  );
}


export function FsDiagramWithCaptionRight() {
  // Shared fullscreen diagram tokens (match Entries diagram)
  const VB_W = 960;
  const VB_H = 560;

  const FRAME = { x: 10, y: 10, w: 940, h: 540, rx: 18 };

  // Match Entries media height (420) + same top inset (70)
  const MEDIA = { x: 60, y: 70, w: 560, h: 420, rx: 16 };

  // Make caption panel match MEDIA height so content scale feels identical
  const CAPTION = { x: 640, y: 70, w: 260, h: 420, rx: 16 };

  // Center arrows at 50% of the whole SVG height (like FsDiagramWithThumbs)
  const ARROW_CY = VB_H / 2;

  // Arrow + chevron sizing tokens (same idea as FsDiagramWithThumbs)
  const ARROW_R = 20;
  const TRI_DX = 14;
  const TRI_DY = 12;

  // Caption content tuned to a 420px tall panel (roomier like Entries)
  const PAD_X = 28; // inner padding inside caption panel
  const cx = CAPTION.x + PAD_X;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      height="auto"
      role="img"
      aria-label="Fullscreen carousel with right caption panel"
    >
      {/* Frame */}
      <rect
        x={FRAME.x}
        y={FRAME.y}
        width={FRAME.w}
        height={FRAME.h}
        rx={FRAME.rx}
        fill="#ffffff"
        stroke="rgba(11,18,32,0.18)"
        strokeWidth="2"
      />

      {/* Media tile */}
      <rect
        x={MEDIA.x}
        y={MEDIA.y}
        width={MEDIA.w}
        height={MEDIA.h}
        rx={MEDIA.rx}
        fill="rgb(79,184,229)"
        opacity="0.9"
      />

      {/* Media outline */}
      <rect
        x={MEDIA.x}
        y={MEDIA.y}
        width={MEDIA.w}
        height={MEDIA.h}
        rx={MEDIA.rx}
        fill="transparent"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Caption panel (right) */}
      <rect
        x={CAPTION.x}
        y={CAPTION.y}
        width={CAPTION.w}
        height={CAPTION.h}
        rx={CAPTION.rx}
        fill="rgba(11,18,32,0.03)"
        stroke="rgba(11,18,32,0.14)"
      />

      {/* Caption header (slightly larger / roomier) */}
      <rect
        x={cx}
        y={CAPTION.y + 34}
        width={178}
        height={24}
        rx={12}
        fill="rgba(11,18,32,0.14)"
      />

      {/* Caption text (more breathing room) */}
      <rect x={cx} y={CAPTION.y + 82} width={212} height={12} rx={6} fill="rgba(11,18,32,0.18)" />
      <rect x={cx} y={CAPTION.y + 106} width={196} height={12} rx={6} fill="rgba(11,18,32,0.18)" />
      <rect x={cx} y={CAPTION.y + 130} width={174} height={12} rx={6} fill="rgba(11,18,32,0.18)" />

      {/* Caption meta */}
      <rect x={cx} y={CAPTION.y + 170} width={108} height={22} rx={11} fill="rgba(79,184,229,0.35)" />
      <rect x={cx + 116} y={CAPTION.y + 170} width={96} height={22} rx={11} fill="rgba(11,18,32,0.10)" />

      {/* Caption block */}
      <rect x={cx} y={CAPTION.y + 222} width={212} height={12} rx={6} fill="rgba(11,18,32,0.18)" />
      <rect x={cx} y={CAPTION.y + 246} width={212} height={12} rx={6} fill="rgba(11,18,32,0.18)" />
      <rect x={cx} y={CAPTION.y + 270} width={182} height={12} rx={6} fill="rgba(11,18,32,0.18)" />

      {/* Counter (top-left UI rail) */}
      <rect x="36" y="28" width="78" height="28" rx="14" fill="rgba(11,18,32,0.88)" />
      <text
        x="75"
        y="47"
        textAnchor="middle"
        fontSize="13"
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      >
        3 / 12
      </text>

      {/* Close button (top-right UI rail) */}
      <circle cx="924" cy="42" r="14" fill="rgba(11,18,32,0.88)" />
      <line x1="917" y1="35" x2="931" y2="49" stroke="#ffffff" strokeWidth="2" />
      <line x1="931" y1="35" x2="917" y2="49" stroke="#ffffff" strokeWidth="2" />

      {/* Left arrow (centered at 50% of SVG height) */}
      <g opacity="0.9">
        <circle
          cx="60"
          cy={ARROW_CY}
          r={ARROW_R}
          fill="rgba(11,18,32,0.10)"
          stroke="rgba(11,18,32,0.20)"
        />
        <polygon
          points={`${60 + 6},${ARROW_CY - TRI_DY} ${60 - (TRI_DX - 2)},${ARROW_CY} ${60 + 6},${ARROW_CY + TRI_DY}`}
          fill="rgba(11,18,32,0.70)"
        />
      </g>

      {/* Right arrow (centered at 50% of SVG height) */}
      <g opacity="0.9">
        <circle
          cx="900"
          cy={ARROW_CY}
          r={ARROW_R}
          fill="rgba(11,18,32,0.10)"
          stroke="rgba(11,18,32,0.20)"
        />
        <polygon
          points={`${900 - 6},${ARROW_CY - TRI_DY} ${900 + (TRI_DX - 2)},${ARROW_CY} ${900 - 6},${ARROW_CY + TRI_DY}`}
          fill="rgba(11,18,32,0.70)"
        />
      </g>

      {/* Soft highlight */}
      <ellipse cx="220" cy="160" rx="210" ry="120" fill="rgba(255,255,255,0.16)" />
    </svg>
  );
}


export function FsDiagramWithEntriesOverlayBottom() {
  const VB_H = 560;
  const ARROW_CY = VB_H / 2; // true 50% of the whole SVG (280)

  const ARROW_R = 20;
  const TRI_DX = 14;
  const TRI_DY = 12;

  return (
    <svg
      viewBox="0 0 960 560"
      width="100%"
      height="auto"
      role="img"
      aria-label="Fullscreen carousel with bottom entries overlay"
    >
      {/* Frame */}
      <rect
        x="10"
        y="10"
        width="940"
        height="540"
        rx="18"
        fill="#ffffff"
        stroke="rgba(11,18,32,0.18)"
        strokeWidth="2"
      />

      {/* Media tile */}
      <rect
        x="110"
        y="70"
        width="740"
        height="420"
        rx="16"
        fill="rgb(79,184,229)"
        opacity="0.9"
      />

      {/* Media outline */}
      <rect
        x="110"
        y="70"
        width="740"
        height="420"
        rx="16"
        fill="transparent"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Counter (top-left UI rail) */}
      <rect x="36" y="28" width="78" height="28" rx="14" fill="rgba(11,18,32,0.88)" />
      <text
        x="75"
        y="47"
        textAnchor="middle"
        fontSize="13"
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      >
        3 / 12
      </text>

      {/* Close button (top-right UI rail) */}
      <circle cx="924" cy="42" r="14" fill="rgba(11,18,32,0.88)" />
      <line x1="917" y1="35" x2="931" y2="49" stroke="#ffffff" strokeWidth="2" />
      <line x1="931" y1="35" x2="917" y2="49" stroke="#ffffff" strokeWidth="2" />

      {/* Left arrow (centered at 50% of SVG height) */}
      <g opacity="0.9">
        <circle
          cx="60"
          cy={ARROW_CY}
          r={ARROW_R}
          fill="rgba(11,18,32,0.10)"
          stroke="rgba(11,18,32,0.20)"
        />
        <polygon
          points={`${60 + 6},${ARROW_CY - TRI_DY} ${60 - (TRI_DX - 2)},${ARROW_CY} ${60 + 6},${ARROW_CY + TRI_DY}`}
          fill="rgba(11,18,32,0.70)"
        />
      </g>

      {/* Right arrow (centered at 50% of SVG height) */}
      <g opacity="0.9">
        <circle
          cx="900"
          cy={ARROW_CY}
          r={ARROW_R}
          fill="rgba(11,18,32,0.10)"
          stroke="rgba(11,18,32,0.20)"
        />
        <polygon
          points={`${900 - 6},${ARROW_CY - TRI_DY} ${900 + (TRI_DX - 2)},${ARROW_CY} ${900 - 6},${ARROW_CY + TRI_DY}`}
          fill="rgba(11,18,32,0.70)"
        />
      </g>

      {/* Bottom entries overlay (sheet) */}
      <rect
        x="60"
        y="390"
        width="840"
        height="140"
        rx="16"
        fill="rgba(255,255,255,0.82)"
        stroke="rgba(11,18,32,0.14)"
      />

      {/* Overlay grabber */}
      <rect x="440" y="404" width="80" height="8" rx="4" fill="rgba(11,18,32,0.14)" />

      {/* Entry row 1 */}
      <circle cx="92" cy="444" r="16" fill="rgba(11,18,32,0.14)" />
      <rect x="118" y="432" width="260" height="12" rx="6" fill="rgba(11,18,32,0.18)" />
      <rect x="118" y="452" width="200" height="12" rx="6" fill="rgba(11,18,32,0.14)" />

      {/* Soft highlight (optional, very subtle) */}
      <ellipse cx="270" cy="150" rx="210" ry="120" fill="rgba(255,255,255,0.16)" />
    </svg>
  );
}


export function FsDiagramFullConfig() {
  return (
    <svg
      viewBox="0 0 960 600"
      width="100%"
      height="auto"
      role="img"
      aria-label="Fullscreen carousel with bottom thumbnails and right caption panel"
    >
      {/* Frame */}
      <rect
        x="10"
        y="10"
        width="940"
        height="580"
        rx="18"
        fill="#ffffff"
        stroke="rgba(11,18,32,0.18)"
        strokeWidth="2"
      />

      {/* Media tile (left content area) */}
      <rect
        x="60"
        y="70"
        width="560"
        height="400"
        rx="16"
        fill="rgb(79,184,229)"
        opacity="0.9"
      />

      {/* Media outline */}
      <rect
        x="60"
        y="70"
        width="560"
        height="400"
        rx="16"
        fill="transparent"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Caption panel (right) */}
      <rect
        x="640"
        y="70"
        width="260"
        height="400"
        rx="16"
        fill="rgba(11,18,32,0.03)"
        stroke="rgba(11,18,32,0.14)"
      />

      {/* Caption header */}
      <rect x="668" y="96" width="170" height="22" rx="11" fill="rgba(11,18,32,0.14)" />

      {/* Caption lines */}
      <rect x="668" y="132" width="212" height="12" rx="6" fill="rgba(11,18,32,0.18)" />
      <rect x="668" y="156" width="196" height="12" rx="6" fill="rgba(11,18,32,0.18)" />
      <rect x="668" y="180" width="174" height="12" rx="6" fill="rgba(11,18,32,0.18)" />

      {/* Caption meta pills */}
      <rect x="668" y="218" width="92" height="22" rx="11" fill="rgba(79,184,229,0.35)" />
      <rect x="768" y="218" width="88" height="22" rx="11" fill="rgba(11,18,32,0.10)" />

      {/* Caption block */}
      <rect x="668" y="260" width="212" height="12" rx="6" fill="rgba(11,18,32,0.18)" />
      <rect x="668" y="284" width="212" height="12" rx="6" fill="rgba(11,18,32,0.18)" />
      <rect x="668" y="308" width="182" height="12" rx="6" fill="rgba(11,18,32,0.18)" />
      <rect x="668" y="332" width="212" height="12" rx="6" fill="rgba(11,18,32,0.18)" />

      {/* Counter (top-left UI rail) */}
      <rect x="36" y="28" width="78" height="28" rx="14" fill="rgba(11,18,32,0.88)" />
      <text
        x="75"
        y="47"
        textAnchor="middle"
        fontSize="13"
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      >
        3 / 12
      </text>

      {/* Close button (top-right UI rail) */}
      <circle cx="924" cy="42" r="14" fill="rgba(11,18,32,0.88)" />
      <line x1="917" y1="35" x2="931" y2="49" stroke="#ffffff" strokeWidth="2" />
      <line x1="931" y1="35" x2="917" y2="49" stroke="#ffffff" strokeWidth="2" />

      {/* Left arrow (inset, viewport UI rail) */}
      <g opacity="0.9">
        <circle
          cx="64"
          cy="270"
          r="20"
          fill="rgba(11,18,32,0.10)"
          stroke="rgba(11,18,32,0.20)"
        />
        <polygon points="70,258 56,270 70,282" fill="rgba(11,18,32,0.70)" />
      </g>

      {/* Right arrow (inset, viewport UI rail) */}
      <g opacity="0.9">
        <circle
          cx="896"
          cy="270"
          r="20"
          fill="rgba(11,18,32,0.10)"
          stroke="rgba(11,18,32,0.20)"
        />
        <polygon points="890,258 904,270 890,282" fill="rgba(11,18,32,0.70)" />
      </g>

      {/* Bottom thumbnails rail */}
      <rect
        x="60"
        y="490"
        width="840"
        height="86"
        rx="16"
        fill="rgba(11,18,32,0.04)"
        stroke="rgba(11,18,32,0.12)"
      />

      {/* Square thumbnails */}
      {Array.from({ length: 9 }).map((_, i) => (
        <rect
          key={i}
          x={80 + i * 90}
          y="503"
          width="60"
          height="60"
          rx="10"
          fill={i === 2 ? "rgb(79,184,229)" : "rgba(11,18,32,0.18)"}
          stroke={i === 2 ? "rgba(79,184,229,0.95)" : "rgba(11,18,32,0.18)"}
          strokeWidth="1.5"
        />
      ))}

      {/* Soft highlight (optional, very subtle) */}
      <ellipse cx="220" cy="150" rx="210" ry="120" fill="rgba(255,255,255,0.16)" />
    </svg>
  );
}



export default function Home() {

  const items = [
    { id: "img-1", src: "https://picsum.photos/seed/1/900/500" },
    { id: "img-2", src: "https://picsum.photos/seed/2/900/500" },
    { id: "img-3", src: "https://picsum.photos/seed/3/900/500" },
  ];
  return (
    <> 
      <p className="home-intro">
        <span className="intro-line">
          A high-performance image and video gallery library with fluid motion,
          responsive layouts, seamless transitions, and immersive fullscreen
          experiences.
        </span>

        <span className="intro-subline">
          Engineered to be modular, feature-rich, and production-ready — yet
          remarkably easy to use, even for first-time developers.
        </span>
      </p>
      <section className="rmgLayouts" aria-labelledby="rmg-layouts-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-layouts-title">
              Four Primary Layouts
            </h2>
            <p className="rmgCard__desc max-w-[500px]">
              All layouts share fully customizable breakpoints, loading states, intro animations and fullscreen transitions.
            </p>
          </header>

          <div className="rmgLayouts__grid" role="list">
            {/* Slider */}
            <article className="rmgCard" role="listitem">
              <div className="rmgCard__top">
                <h3 className="rmgCard__title">Slider</h3>
                <p className="rmgCard__desc">
                  Powered by a robust animation engine with an extensive API and baked in wheel support.
                </p>
              </div>

              <div className="rmgCard__demo rmgDemo rmgDemo--slider" aria-hidden="true">
                <div className="rmgDemo__stage">
                  <div className="rmgDemo__viewport">
                    <div className="rmgDemo__track">
                      <div className="rmgDemo__slide" />
                      <div className="rmgDemo__slide" />
                      <div className="rmgDemo__slide" />
                      <div className="rmgDemo__slide" />
                      <div className="rmgDemo__slide" />
                    </div>
                  </div>

                  <div className="rmgDemo__pager">
                    <span className="rmgDemo__pill" />
                    <span className="rmgDemo__pill" />
                    <span className="rmgDemo__pill" />
                  </div>
                </div>
              </div>
            </article>

            {/* Grid */}
            <article className="rmgCard" role="listitem">
              <div className="rmgCard__top">
                <h3 className="rmgCard__title">Grid</h3>
                <p className="rmgCard__desc">
                  Simplified CSS-Grid system that resolves columns from breakpoints or minmax.
                </p>
              </div>

              <div className="rmgCard__demo rmgDemo rmgDemo--grid" aria-hidden="true">
                <div className="rmgDemo__stage">
                  <div className="rmgGridDemo">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div className="rmgGridDemo__cell" key={i} />
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* Masonry */}
            <article className="rmgCard" role="listitem">
              <div className="rmgCard__top">
                <h3 className="rmgCard__title">Masonry</h3>
                <p className="rmgCard__desc">
                  JS based Pinterest-style layout with various placement and styling options.
                </p>
              </div>

              <div className="rmgCard__demo rmgDemo rmgDemo--masonry" aria-hidden="true">
                <div className="rmgDemo__stage">
                  <div className="rmgMasonryDemo">
                    <div className="rmgMasonryDemo__col">
                      <div className="rmgMasonryDemo__brick b1" />
                      <div className="rmgMasonryDemo__brick b2" />
                      <div className="rmgMasonryDemo__brick b3" />
                    </div>
                    <div className="rmgMasonryDemo__col">
                      <div className="rmgMasonryDemo__brick b2" />
                      <div className="rmgMasonryDemo__brick b3" />
                      <div className="rmgMasonryDemo__brick b1" />
                    </div>
                    <div className="rmgMasonryDemo__col">
                      <div className="rmgMasonryDemo__brick b3" />
                      <div className="rmgMasonryDemo__brick b1" />
                      <div className="rmgMasonryDemo__brick b2" />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Entries */}
            <article className="rmgCard" role="listitem">
              <div className="rmgCard__top">
                <h3 className="rmgCard__title">Entries</h3>
                <p className="rmgCard__desc">
                  Content blocks with arbitrary markup and embedded media (slider, grid or masonry).
                </p>
              </div>

              <div className="rmgCard__demo rmgDemo rmgDemo--entries" aria-hidden="true">
                <div className="rmgDemo__stage">
                  <div className="rmgEntriesDemo">
                    <div className="rmgEntryRow">
                      <div className="rmgEntryRow__avatar" />
                      <div className="rmgEntryRow__body">
                        <div className="rmgEntryRow__line l1" />
                        <div className="rmgEntryRow__line l2" />
                        <div className="rmgEntryRow__thumbs">
                          <span className="rmgEntryRow__thumb" />
                          <span className="rmgEntryRow__thumb" />
                          <span className="rmgEntryRow__thumb" />
                        </div>
                      </div>
                    </div>

                    <div className="rmgEntryRow">
                      <div className="rmgEntryRow__avatar" />
                      <div className="rmgEntryRow__body">
                        <div className="rmgEntryRow__line l1" />
                        <div className="rmgEntryRow__line l3" />
                        <div className="rmgEntryRow__thumbs">
                          <span className="rmgEntryRow__thumb" />
                          <span className="rmgEntryRow__thumb" />
                          <span className="rmgEntryRow__thumb" />
                        </div>
                      </div>
                    </div>

                    <div className="rmgEntryRow">
                      <div className="rmgEntryRow__avatar" />
                      <div className="rmgEntryRow__body">
                        <div className="rmgEntryRow__line l2" />
                        <div className="rmgEntryRow__line l3" />
                        <div className="rmgEntryRow__thumbs">
                          <span className="rmgEntryRow__thumb" />
                          <span className="rmgEntryRow__thumb" />
                          <span className="rmgEntryRow__thumb" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="rmgLayouts" aria-labelledby="rmg-fs-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-fs-title">
              Fullscreen Mode
            </h2>
            <p className="rmgCard__desc max-w-[560px]">
              A fullscreen carousel featuring transform-based interactions, universal gesture support, composable UI layers, and shared context with the base layout.
            </p>
          </header>
          <div style={{ marginBottom: '20px' }}></div>
          <section className="space-y-10 text-slate-700">
            <h3 className="rmgLayouts__subheader">Content &amp; Navigation Layers</h3>

            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Captions */}
                <div className="rmgCard">
                  <div className="rmgCard__top">
                    <h4 className="rmgCard__title">Captions</h4>
                    <p className="rmgCard__desc">
                      Slide-bound UI regions that participate in slide layout. Can render any type of markup.
                    </p>
                  </div>

                  <div className="w-full max-w-[500px] mx-auto pt-6">
                    {FsDiagramWithCaptionRight()}
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="rmgCard">
                  <div className="rmgCard__top">
                    <h4 className="rmgCard__title">Thumbnails</h4>
                    <p className="rmgCard__desc">
                      Visual navigation and media indexing with full control over placement, sizing, alignment, and styling.
                    </p>
                  </div>

                  <div className="w-full max-w-[500px] mx-auto pt-6">
                    {FsDiagramWithThumbs()}
                  </div>
                </div>

                {/* Entry Overlays */}
                <div className="rmgCard">
                  <div className="rmgCard__top">
                    <h4 className="rmgCard__title">Entry Overlays</h4>
                    <p className="rmgCard__desc">
                      Overlay-based UI regions that sit above the carousel. Can render any type of markup.
                    </p>
                  </div>

                  <div className="w-full max-w-[500px] mx-auto pt-6">
                    {FsDiagramWithEntriesOverlayBottom()}
                  </div>
                </div>
              </div>
              <p className="font-medium">
                All content and navigation layers support independent placement on any side of the viewport:
              </p>

              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-md">
                <li className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm font-medium">Top</li>
                <li className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm font-medium">Right</li>
                <li className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm font-medium">Bottom</li>
                <li className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm font-medium">Left</li>
              </ul>

              <p className="font-medium">
                <span className="font-extrabold">You can mix and match freely,</span>
                <span className="ml-1">and combine them in any configuration.</span>
              </p>
            </div>

            <h4 className="rmgLayouts__h4">Using the Caption Layout as an Entry Surface</h4>

            <div className="space-y-6">
              <p className="leading-relaxed max-w-3xl">
                The captions system can also be used purely as a layout surface,
                even when no caption content is provided.
              </p>

              <p className="font-medium">You can configure caption placement and sizing:</p>

              <pre className="rounded-lg bg-slate-800 text-slate-100 p-4 text-sm overflow-x-auto max-w-3xl">
                <code>{`fullscreenCaptionPlacement?: 'top' | 'right' | 'bottom' | 'left';
fullscreenCaptionWidth?: number;
fullscreenCaptionHeight?: number;`}</code>
              </pre>

              <p className="leading-relaxed max-w-3xl">
                and then manually position an entry overlay inside that caption region,
                effectively reusing the caption block as a structured layout container.
              </p>
            </div>

            <h3 className="rmgLayouts__subheader">Control &amp; Utility Layers</h3>

            <div className="space-y-6 mt-6">
              <h4 className="rmgLayouts__h4">Counter</h4>
              <p className="leading-relaxed max-w-3xl">
                Displays the current index and total count.
              </p>

              <h4 className="rmgLayouts__h4">Prev / Next Arrows</h4>
              <p className="leading-relaxed max-w-3xl">
                You can choose between:
              </p>

              <ul className="list-disc pl-5 space-y-1">
                <li>Default slide <strong>transform</strong></li>
                <li><strong>Fade</strong> transition</li>
              </ul>

              <p className="leading-relaxed max-w-3xl">
                Transition duration and easing are fully customizable,
                with <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">0ms</code> producing an instant slide change.
              </p>

              <h4 className="rmgLayouts__h4">Close</h4>
                <p className="leading-relaxed max-w-3xl">
                  Closing is context-aware and designed to keep the return animation always on-screen.
                  The close interaction is applied to both the close control and the overlay itself (tap/click the overlay to close). The fullscreen slide can be dragged vertically to close the modal. 
                </p>

                <ul className="list-disc pl-5 space-y-1 max-w-3xl">
                  <li>
                    <strong>Slider:</strong> On close, the base slider instantly snaps to the slide that corresponds to the current
                    fullscreen index (including when the slide/thumb isn&apos;t currently in view), ensuring the closing transform animation
                    lands correctly and preventing fullscreen media from “flying” out of the viewport.
                  </li>
                  <li>
                    <strong>Grid / Masonry:</strong> On close, the page scrolls to center the corresponding thumb in the viewport so the
                    fullscreen-to-thumb transform always resolves cleanly.
                  </li>
                  <li>
                    <strong>Entries:</strong> On close, the page scroll centers the owning entry (the entry that contains the media),
                    so the fullscreen media returns to the correct context every time.
                  </li>
                </ul>

              <p className="font-medium">With the Control and Utility Layers API, you can:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the built-in components</li>
                <li>Adjust styles and placement</li>
                <li>Or replace them entirely with your own React components</li>
              </ul>

              <h4 className="rmgLayouts__h4">Open & Close Transitions</h4>
                <p className="leading-relaxed max-w-3xl">
                  The opening and closing transitions originate directly from the thumbnail&apos;s visible crop, animating both the clip-path and the image in perfect sync to create a seamless, cinematic morph into fullscreen. Transitions can be <strong>transform-based</strong> (default) or a <strong>fade</strong> effect.
                  Duration and easing are customizable for both, with <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">0ms</code> producing an instant change.
                </p>
            </div>

            <h3 className="rmgLayouts__subheader">Zoom, Pan, &amp; Pinch</h3>

            <div className="space-y-6 mt-6">
              <h4 className="rmgLayouts__h4">Zoom</h4>
              <p className="leading-relaxed max-w-3xl">
                Designed for a fast, intentional single click/tap interaction. Zooming in/out near image bounds will keep them flushed to the viewport if necessary. Rapidly toggling zoom stays incredibly smooth, and zoom animations remain stable inside loop seams. If a zoom-in is triggered during an active carousel animation or when a slide isn&apos;t centered, the carousel will automatically <strong>animate</strong> the slide towards the center of the viewport.
              </p>
              <p className="leading-relaxed max-w-3xl">
                Clicking prev/next arrows or a thumbnail while zoomed in automatically triggers a zoom-out animation while simultaneously changing slides.
              </p>

              <p className="font-medium">You can tweak:</p>
              <ul className="list-disc pl-5 space-y-1 max-w-3xl">
                <li><strong>clickZoomLevel:</strong> Specifies the target scale used for single-click or tap zoom interactions. A value of 1 represents no zoom. Default value is 2.5.</li>
              </ul>

              <h4 className="rmgLayouts__h4">Pan</h4>
              <p className="leading-relaxed max-w-3xl">
                Uses the same fluid animation engine powering freeScroll drag in the base slider, but configured for both the <strong>x</strong> and <strong>y</strong> axes.
              </p>
              <p className="leading-relaxed max-w-3xl">
                Wheel and touchpad support are built in, and boundary interactions resolve with super smooth spring physics so overscroll and “rubber band” behavior feels natural.
              </p>

              <p className="font-medium">You can tweak:</p>
              <ul className="list-disc pl-5 space-y-1 max-w-3xl">
                <li><strong>panDuration:</strong> Controls the base timing used for pan movement animations. Lower values produce faster, more responsive motion, while higher values feel heavier and more inertial. Default value is 43.</li>
                <li><strong>panFriction:</strong> Controls how quickly pan movement slows and settles after input ends. Lower values feel looser and glide longer, while higher values stop more quickly and feel tighter. Default value is 0.68.</li>
              </ul>

              <h4 className="rmgLayouts__h4">Pinch</h4>
              <p className="leading-relaxed max-w-3xl">
                Driven by tracking two active pointers with a highly native, predictable feel, and stable scaling that stays locked to the user&apos;s intent. If a pinch is triggered during an active carousel animation or when a slide isn&apos;t centered, the carousel will automatically <strong>snap</strong> the slide towards the center of the viewport.
              </p>
              <p className="leading-relaxed max-w-3xl">
                Pinch also includes built-in wheel and touchpad support, so the same high-quality zoom behavior translates across devices and input methods.
              </p>

              <p className="font-medium">You can tweak:</p>
              <ul className="list-disc pl-5 space-y-1 max-w-3xl">
                <li><strong>maxZoomLevel:</strong> Defines the maximum scale that can be reached when zooming via pinch and wheel gestures. Acts as a hard upper bound to prevent over-magnification. Default value is 3.</li>
              </ul>
            </div>

            <h3 className="rmgLayouts__subheader">Rendering Fullscreen Media</h3>
            <div className="space-y-6 mt-6">
              <p className="leading-relaxed max-w-3xl">
                Fullscreen rendering is driven by a dedicated media list, which keeps your base layout and fullscreen experience intentionally <strong>decoupled</strong>.
              </p>

              <p className="leading-relaxed max-w-3xl">
                You can provide a simple list of URLs or supply fully structured media items with metadata.
              </p>

              <p className="leading-relaxed max-w-3xl">
                The base layout can render anything while fullscreen can render the best possible media for zooming. The only shared connection is the <strong>index</strong>, which keeps navigation, thumbnails, and transitions perfectly aligned.
              </p>

              <p className="leading-relaxed max-w-3xl">
                For image optimization, you can add your own <strong>srcset</strong> and <strong>sizes</strong> via the <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">fullscreenRenderImage</code> prop.
              </p>
            </div>
          </section>
        </div>
      </section>
      <section className="rmgLayouts" aria-labelledby="rmg-fs-title">
        <div className="rmgLayouts__inner">
          <header className="rmgLayouts__header">
            <h2 className="rmgLayouts__title" id="rmg-fs-title">
              Sliders
            </h2>
          </header>
          <h3 className="rmgLayouts__subheader">Engine</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              Animations run on a <strong>fixed timestep</strong> with <strong>alpha interpolation</strong>, so motion stays consistent across devices with different refresh rates.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Interaction is powered by a custom <strong>DragTracker</strong> that treats even the tiniest directional velocity as an intentional slide change, giving the slider an effortless feel. At the same time, a stillness guard prevents slide changes when the gesture ends in a true stop.
            </p>

            <p className="leading-relaxed max-w-3xl">
              DragTracker solves a common slider issue where momentum abruptly “hits a wall” or stays on the same slide after a flick. It always maintains continuous velocity across the release phase, allowing momentum to resolve cleanly into the final snap.
            </p>

            <p className="leading-relaxed max-w-3xl">
              <strong>Looping</strong> is powered by a responsive clone + vector rebase system.
            </p>

            <p className="leading-relaxed max-w-3xl">
              The Loop engine solves a common loop artifact where sliders briefly reveal empty gaps at the seam. The engine prevents that in two ways: it enforces a minimum of two clones per side, and it scales the clone count to match how many cells are visible inside the slider&apos;s viewport. The result is a loop that always has enough “buffer” content to fill the viewport, even during fast flicks.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Loop is automatically disabled if the content width is less than or equal to the viewport width or if there is only one item in the slider.
            </p>
          </div>
          <h3 className="rmgLayouts__subheader !mt-6">Base Slider</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              By default, the Base Slider uses <strong>one cell per slide</strong>. When <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">groupCells</code> is enabled, the slider automatically groups cells based on what is visible inside the slider&apos;s viewport. As the slider&apos;s viewport resizes, slides are rebuilt so they stay accurate across breakpoints and layout changes. When looping is disabled, the final snap target clamps to the maximum scroll position so you never overshoot past the end of the track.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Many layout and presentation props support responsive customization out of the box. Properties like{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">cellsPerSlide</code>,{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">gap</code>, and{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">skeletonCount</code> accept breakpoint-aware values. Slider height can also be controlled with explicit media queries via{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">sliderResponsiveHeights</code>, making it easy to define different
              aspect ratios or layouts for mobile, tablet, and desktop.
            </p>

            <pre className="rounded-lg bg-slate-800 text-slate-100 p-4 text-sm overflow-x-auto max-w-3xl">
              <code>{`// Using default breakpoint keys (xs / sm / md / lg / xl)
<Gallery
  cellsPerSlide={{
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  }}
>
  {children}
</Gallery>

// Using custom breakpoint values (explicit viewport widths)
<Gallery
  cellsPerSlide={{
    0: 1,       // mobile
    640: 2,     // small tablets
    768: 3,     // tablets
    1024: 4,    // desktops
    1280: 5,    // large screens
  }}
>
  {children}
</Gallery>`}</code>
</pre>

            <p className="leading-relaxed max-w-3xl">
              In addition, any prop that accepts a <strong>ClassName</strong> can be fully customized through your own stylesheets, giving you complete control over responsive behavior using standard CSS media queries. This includes containers, viewports, thumbnail regions, and individual thumbnail items.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Visual polish is built in — no plugins required. Effects like <strong>parallax</strong>, <strong>scale</strong>, and{" "} <strong>fade</strong> integrate directly with the motion engine.
            </p>

            <p className="leading-relaxed max-w-3xl">
              For UI, you can use the built-in arrows, dots, progress, and ripple — or supply your own renderers and styles.
            </p>

            <p className="leading-relaxed max-w-3xl">
              The Base Slider also exposes a powerful imperative API for advanced experiences: scroll to any index, jump instantly, read progress, detect which cells are in view, and even <strong>append / prepend / insert / remove / replace</strong> slides at runtime. It&apos;s perfect for product galleries, feeds, or any UI that needs to update dynamically without rebuilding the whole component.
            </p>

            <p className="leading-relaxed max-w-3xl">
              React Motion Gallery includes native <strong>wheel and trackpad scrolling</strong> support built directly into the Base Slider.
              Unlike most slider libraries that require an external plugin or adapter, wheel input is handled by the core engine itself.
              Horizontal/Vertical intent is detected automatically, momentum is preserved, and scrolling integrates seamlessly with other gesture interactions.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Trackpad gestures feel natural and responsive, with built-in safeguards to prevent accidental page scrolling while interacting with the slider. Wheel interaction temporarily pauses <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">autoScroll</code>/<code className="rounded bg-slate-100 px-1 py-0.5 text-sm">autoPlay</code> and respects scroll limits when <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">loop</code> is disabled.
            </p>

          </div>
          <h3 className="rmgLayouts__subheader !mt-6">Thumbnails Slider</h3>
            <div className="space-y-4 mt-4">
              <p className="leading-relaxed max-w-3xl">
                The Thumbnails Slider is a purpose-built, lightweight companion to the Base Slider. It reuses the same core motion engine, but strips everything down to what thumbnails actually need — keeping bundle size and runtime overhead low.
              </p>

              <p className="leading-relaxed max-w-3xl">
                It&apos;s <strong>free-scroll by default</strong>.
                Clicking a thumbnail triggers the Base Slider to animate to the selected index, and centers the active thumb when appropriate.
              </p>

              <p className="leading-relaxed max-w-3xl">
                Thumbnails can be placed on <strong>any side</strong> of the gallery — <strong>top</strong>, <strong>right</strong>,{" "}
                <strong>bottom</strong>, or <strong>left</strong> — automatically switching between horizontal and vertical behavior. Width,
                height, container sizing, centering, and per-item styling are all configurable, so it can act like a minimal filmstrip or a
                fully styled navigation rail.
              </p>

              <p className="leading-relaxed max-w-3xl">
                Has built-in wheel/trackpad support.
              </p>
            </div>
          <h3 className="rmgLayouts__subheader !mt-6">Fullscreen Slider</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              The Fullscreen Slider is also a lighter version of the Base Slider and uses the same core motion engine.
            </p>

            <p className="leading-relaxed max-w-3xl">
              It supports{" "}
              <strong>normal snap-only behavior</strong> (one media item per snap) to keep bundle size and runtime overhead low.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Looping is default behavior and it&apos;s only disabled when there is one image/video.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Horizontal drag is prioritized for slide changes, while vertical drag can be used for a natural “pull-to-close” gesture — including fade feedback tied to
              distance, plus a smooth snap-back when the close threshold isn&apos;t met.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Videos are treated as first-class slides: dragging doesn&apos; trigger Plyr controls/events, and media near the active slide is automatically paused to prevent multiple players from running at once.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Optional slide fading can be enabled so index changes can crossfade instead of translating when desired.
            </p>

            <p className="leading-relaxed max-w-3xl">
              The fullscreen slider automatically adopts RTL mode if it&apos;s enabled in the Base Slider.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Has built-in wheel/trackpad support.
              </p>
          </div>
          <h3 className="rmgLayouts__subheader !mt-6">Fullscreen Thumbnails Slider</h3>
          <div className="space-y-4 mt-4">
            <p className="leading-relaxed max-w-3xl">
              The Fullscreen Thumbnails Slider is a lightweight <strong>wrapper around the Thumbnails Slider</strong>. It reuses the
              exact same small, free-scroll thumbnail engine (to avoid duplicating slider logic), but wires it directly into the
              fullscreen index system so thumbnails always stay in sync with the active fullscreen slide.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Under the hood it creates a dedicated <strong>index channel</strong> that listens to fullscreen events and instantly
              updates the thumbnail highlight/scroll position. Clicking a thumbnail then calls{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">fsSub.requestSet(idx, &apos;animated&apos;)</code> so fullscreen
              navigates with the normal snap animation.
            </p>

            <p className="leading-relaxed max-w-3xl">
              It also includes a built-in “polish layer” for UI: the entire strip can be faded and slightly translated in/out via{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">visible</code> /{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">invisible</code>, with{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">pointerEvents</code> automatically disabled while hidden so it
              never blocks the fullscreen media.
            </p>

            <p className="leading-relaxed max-w-3xl">
              Like the base thumbnail strip, it can be positioned on any side (<strong>top / right / bottom / left</strong>), supports
              centering for “short” thumbnail rows, and exposes styling hooks for spacing, dimensions, and per-thumb className/style.
            </p>
          </div>
        </div>
      </section>
      <Gallery 
        fullscreen={{ enabled: false }}
        slider={{ 
          size: {
            height: '500px'
          },
          transitions: {
          loading: {
            isLoading: true,
            skeletonCount: 2
          }
        }}}
      >
        {items.map((item) => (
          <div key={item.id}>
            <img src={item.src} alt="" />
          </div>
        ))}
      </Gallery>
      <div className="mb-100"></div>
    </>
  );
}