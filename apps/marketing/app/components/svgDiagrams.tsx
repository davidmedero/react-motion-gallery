const surfaceFill = "rgba(255, 255, 255, 0.92)";
const surfaceFillStrong = "rgba(255, 255, 255, 0.98)";
const softNeutralFill = "rgba(226, 232, 240, 0.9)";
const softNeutralStroke = "rgba(203, 213, 225, 1)";
const neutralGlyph = "rgba(100, 116, 139, 0.82)";

export function FsDiagramBasic() {
  return (
    <svg
      viewBox="0 0 960 520"
      width="100%"
      role="img"
      aria-label="Baseline fullscreen carousel: media, counter, close, and arrows"
      style={{ height: "auto", width: "auto" }}
    >
      {/* Frame */}
      <rect
        x="10"
        y="10"
        width="940"
        height="500"
        rx="18"
        fill={surfaceFillStrong}
        stroke={softNeutralStroke}
        strokeWidth="2"
      />

      {/* Media tile */}
      <rect
        x="110"
        y="70"
        width="740"
        height="380"
        rx="16"
        fill="rgba(var(--rmg-logo-cyan-rgb),0.6)"
        opacity="0.9"
      />

      {/* Counter pill (top-left) */}
      <rect x="36" y="28" width="78" height="28" rx="14" fill={surfaceFill} stroke={softNeutralStroke}  />
      <text
        x="75"
        y="47"
        textAnchor="middle"
        fontSize="13"
        fill={neutralGlyph}
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      >
        3 / 12
      </text>

      {/* Close button (top-right) */}
      <circle cx="924" cy="42" r="14" fill={surfaceFill} stroke={softNeutralStroke}  />
      <line x1="917" y1="35" x2="931" y2="49" stroke={neutralGlyph} strokeWidth="2" />
      <line x1="931" y1="35" x2="917" y2="49" stroke={neutralGlyph} strokeWidth="2" />

      {/* Left arrow */}
      <g opacity="0.9">
        <circle cx="60" cy="245" r="22" fill={surfaceFill} stroke={softNeutralStroke}  />
        <polygon points="66,233 52,245 66,257" fill={neutralGlyph} />
      </g>

      {/* Right arrow */}
      <g opacity="0.9">
        <circle cx="900" cy="245" r="22" fill={surfaceFill} stroke={softNeutralStroke}  />
        <polygon points="894,233 908,245 894,257" fill={neutralGlyph} />
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
  const THUMB_COUNT = 7;
  const THUMB_SIZE = 64;
  const THUMBNAIL_RAIL = { x: 110, y: 440, w: 740, h: 88, rx: 14 };
  const THUMB_PAD_X = 26;
  const THUMB_GAP =
    (THUMBNAIL_RAIL.w - THUMB_PAD_X * 2 - THUMB_COUNT * THUMB_SIZE) /
    (THUMB_COUNT - 1);
  const THUMB_Y = THUMBNAIL_RAIL.y + (THUMBNAIL_RAIL.h - THUMB_SIZE) / 2;

  return (
    <svg
      viewBox="0 0 960 560"
      width="100%"
      role="img"
      aria-label="Fullscreen carousel with bottom thumbnails"
      style={{ height: "auto", width: "auto" }}
    >
      {/* Frame */}
      <rect
        x="10"
        y="10"
        width="940"
        height="540"
        rx="18"
        fill={surfaceFillStrong}
        stroke={softNeutralStroke}
        strokeWidth="2"
        
      />

      {/* Media tile */}
      <rect
        x="110"
        y="70"
        width="740"
        height="350"
        rx="16"
        fill="rgba(var(--rmg-logo-cyan-rgb),0.6)"
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
      <rect x="36" y="28" width="78" height="28" rx="14" fill={surfaceFill} stroke={softNeutralStroke}  />
      <text
        x="75"
        y="47"
        textAnchor="middle"
        fontSize="13"
        fill={neutralGlyph}
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      >
        3 / 12
      </text>

      {/* Close button */}
      <circle cx="924" cy="42" r="14" fill={surfaceFill} stroke={softNeutralStroke}  />
      <line x1="917" y1="35" x2="931" y2="49" stroke={neutralGlyph} strokeWidth="2" />
      <line x1="931" y1="35" x2="917" y2="49" stroke={neutralGlyph} strokeWidth="2" />

      {/* Left arrow (centered at 50% of SVG height) */}
      <g opacity="0.9">
        <circle
          cx="60"
          cy={ARROW_CY}
          r={ARROW_R}
          fill={surfaceFill}
          stroke={softNeutralStroke}
          
        />
        <polygon
          points={`${60 + 6},${ARROW_CY - TRI_DY} ${60 - (TRI_DX - 2)},${ARROW_CY} ${60 + 6},${ARROW_CY + TRI_DY}`}
          fill={neutralGlyph}
        />
      </g>

      {/* Right arrow (centered at 50% of SVG height) */}
      <g opacity="0.9">
        <circle
          cx="900"
          cy={ARROW_CY}
          r={ARROW_R}
          fill={surfaceFill}
          stroke={softNeutralStroke}
          
        />
        <polygon
          points={`${900 - 6},${ARROW_CY - TRI_DY} ${900 + (TRI_DX - 2)},${ARROW_CY} ${900 - 6},${ARROW_CY + TRI_DY}`}
          fill={neutralGlyph}
        />
      </g>

      {/* Thumbnails rail */}
      <rect
        x={THUMBNAIL_RAIL.x}
        y={THUMBNAIL_RAIL.y}
        width={THUMBNAIL_RAIL.w}
        height={THUMBNAIL_RAIL.h}
        rx={THUMBNAIL_RAIL.rx}
        fill={surfaceFill}
        stroke={softNeutralStroke}
        strokeWidth={2}
      />

      {/* Square thumbnails */}
      {Array.from({ length: THUMB_COUNT }).map((_, i) => (
        <rect
          key={i}
          x={THUMBNAIL_RAIL.x + THUMB_PAD_X + i * (THUMB_SIZE + THUMB_GAP)}
          y={THUMB_Y}
          width={THUMB_SIZE}
          height={THUMB_SIZE}
          rx="10"
          fill={i === 2 ? "rgba(var(--rmg-logo-cyan-rgb),0.6)" : softNeutralFill}
          stroke={i === 2 ? "rgba(var(--rmg-logo-cyan-rgb),0.6)" : softNeutralStroke}
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
      role="img"
      aria-label="Fullscreen carousel with right caption panel"
      style={{ height: "auto", width: "auto" }}
    >
      {/* Frame */}
      <rect
        x={FRAME.x}
        y={FRAME.y}
        width={FRAME.w}
        height={FRAME.h}
        rx={FRAME.rx}
        fill={surfaceFillStrong}
        stroke={softNeutralStroke}
        strokeWidth="2"
        
      />

      {/* Media tile */}
      <rect
        x={MEDIA.x}
        y={MEDIA.y}
        width={MEDIA.w}
        height={MEDIA.h}
        rx={MEDIA.rx}
        fill="rgba(var(--rmg-logo-cyan-rgb),0.6)"
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
        fill={surfaceFill}
        stroke={softNeutralStroke}
        strokeWidth={2}
      />

      {/* Caption header (slightly larger / roomier) */}
      <rect
        x={cx}
        y={CAPTION.y + 34}
        width={178}
        height={24}
        rx={12}
        fill={softNeutralFill}
      />

      {/* Caption text (more breathing room) */}
      <rect x={cx} y={CAPTION.y + 82} width={212} height={12} rx={6} fill={softNeutralFill} />
      <rect x={cx} y={CAPTION.y + 106} width={196} height={12} rx={6} fill={softNeutralFill} />
      <rect x={cx} y={CAPTION.y + 130} width={174} height={12} rx={6} fill={softNeutralFill} />

      {/* Caption meta */}
      <rect x={cx} y={CAPTION.y + 170} width={108} height={22} rx={11} fill="rgba(var(--rmg-logo-cyan-rgb),0.6)" />
      <rect x={cx + 116} y={CAPTION.y + 170} width={96} height={22} rx={11} fill={softNeutralFill} />

      {/* Caption block */}
      <rect x={cx} y={CAPTION.y + 222} width={212} height={12} rx={6} fill={softNeutralFill} />
      <rect x={cx} y={CAPTION.y + 246} width={212} height={12} rx={6} fill={softNeutralFill} />
      <rect x={cx} y={CAPTION.y + 270} width={182} height={12} rx={6} fill={softNeutralFill} />

      {/* Counter (top-left UI rail) */}
      <rect x="36" y="28" width="78" height="28" rx="14" fill={surfaceFill} stroke={softNeutralStroke}  />
      <text
        x="75"
        y="47"
        textAnchor="middle"
        fontSize="13"
        fill={neutralGlyph}
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      >
        3 / 12
      </text>

      {/* Close button (top-right UI rail) */}
      <circle cx="924" cy="42" r="14" fill={surfaceFill} stroke={softNeutralStroke}  />
      <line x1="917" y1="35" x2="931" y2="49" stroke={neutralGlyph} strokeWidth="2" />
      <line x1="931" y1="35" x2="917" y2="49" stroke={neutralGlyph} strokeWidth="2" />

      {/* Left arrow (centered at 50% of SVG height) */}
      <g opacity="0.9">
        <circle
          cx="60"
          cy={ARROW_CY}
          r={ARROW_R}
          fill={surfaceFill}
          stroke={softNeutralStroke}
          
        />
        <polygon
          points={`${60 + 6},${ARROW_CY - TRI_DY} ${60 - (TRI_DX - 2)},${ARROW_CY} ${60 + 6},${ARROW_CY + TRI_DY}`}
          fill={neutralGlyph}
        />
      </g>

      {/* Right arrow (centered at 50% of SVG height) */}
      <g opacity="0.9">
        <circle
          cx="900"
          cy={ARROW_CY}
          r={ARROW_R}
          fill={surfaceFill}
          stroke={softNeutralStroke}
          
        />
        <polygon
          points={`${900 - 6},${ARROW_CY - TRI_DY} ${900 + (TRI_DX - 2)},${ARROW_CY} ${900 - 6},${ARROW_CY + TRI_DY}`}
          fill={neutralGlyph}
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
      role="img"
      aria-label="Fullscreen carousel with bottom entries overlay"
      style={{ height: "auto", width: "auto" }}
    >
      {/* Frame */}
      <rect
        x="10"
        y="10"
        width="940"
        height="540"
        rx="18"
        fill={surfaceFillStrong}
        stroke={softNeutralStroke}
        strokeWidth="2"
        
      />

      {/* Media tile */}
      <rect
        x="110"
        y="70"
        width="740"
        height="420"
        rx="16"
        fill="rgba(var(--rmg-logo-cyan-rgb),0.6)"
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
      <rect x="36" y="28" width="78" height="28" rx="14" fill={surfaceFill} stroke={softNeutralStroke}  />
      <text
        x="75"
        y="47"
        textAnchor="middle"
        fontSize="13"
        fill={neutralGlyph}
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      >
        3 / 12
      </text>

      {/* Close button (top-right UI rail) */}
      <circle cx="924" cy="42" r="14" fill={surfaceFill} stroke={softNeutralStroke}  />
      <line x1="917" y1="35" x2="931" y2="49" stroke={neutralGlyph} strokeWidth="2" />
      <line x1="931" y1="35" x2="917" y2="49" stroke={neutralGlyph} strokeWidth="2" />

      {/* Left arrow (centered at 50% of SVG height) */}
      <g opacity="0.9">
        <circle
          cx="60"
          cy={ARROW_CY}
          r={ARROW_R}
          fill={surfaceFill}
          stroke={softNeutralStroke}
          
        />
        <polygon
          points={`${60 + 6},${ARROW_CY - TRI_DY} ${60 - (TRI_DX - 2)},${ARROW_CY} ${60 + 6},${ARROW_CY + TRI_DY}`}
          fill={neutralGlyph}
        />
      </g>

      {/* Right arrow (centered at 50% of SVG height) */}
      <g opacity="0.9">
        <circle
          cx="900"
          cy={ARROW_CY}
          r={ARROW_R}
          fill={surfaceFill}
          stroke={softNeutralStroke}
          
        />
        <polygon
          points={`${900 - 6},${ARROW_CY - TRI_DY} ${900 + (TRI_DX - 2)},${ARROW_CY} ${900 - 6},${ARROW_CY + TRI_DY}`}
          fill={neutralGlyph}
        />
      </g>

      {/* Bottom entries overlay (sheet) */}
      <rect
        x="60"
        y="390"
        width="840"
        height="140"
        rx="16"
        fill={surfaceFillStrong}
        stroke={softNeutralStroke}
        strokeWidth={2}
      />

      {/* Overlay grabber */}
      <rect x="440" y="404" width="80" height="8" rx="4" fill={softNeutralFill} />

      {/* Entry row 1 */}
      <circle cx="92" cy="444" r="16" fill={softNeutralFill} />
      <rect x="118" y="432" width="260" height="12" rx="6" fill={softNeutralFill} />
      <rect x="118" y="452" width="200" height="12" rx="6" fill={softNeutralFill} />

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
      role="img"
      aria-label="Fullscreen carousel with bottom thumbnails and right caption panel"
      style={{ height: "auto", width: "auto" }}
    >
      {/* Frame */}
      <rect
        x="10"
        y="10"
        width="940"
        height="580"
        rx="18"
        fill={surfaceFillStrong}
        stroke={softNeutralStroke}
        strokeWidth="2"
        
      />

      {/* Media tile (left content area) */}
      <rect
        x="60"
        y="70"
        width="560"
        height="400"
        rx="16"
        fill="rgba(var(--rmg-logo-cyan-rgb),0.6)"
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
        fill={surfaceFill}
        stroke={softNeutralStroke}
        strokeWidth="2"
      />

      {/* Caption header */}
      <rect x="668" y="96" width="170" height="22" rx="11" fill={softNeutralFill} />

      {/* Caption lines */}
      <rect x="668" y="132" width="212" height="12" rx="6" fill={softNeutralFill} />
      <rect x="668" y="156" width="196" height="12" rx="6" fill={softNeutralFill} />
      <rect x="668" y="180" width="174" height="12" rx="6" fill={softNeutralFill} />

      {/* Caption meta pills */}
      <rect x="668" y="218" width="92" height="22" rx="11" fill="rgba(var(--rmg-logo-cyan-rgb),0.6)" />
      <rect x="768" y="218" width="88" height="22" rx="11" fill={softNeutralFill} />

      {/* Caption block */}
      <rect x="668" y="260" width="212" height="12" rx="6" fill={softNeutralFill} />
      <rect x="668" y="284" width="212" height="12" rx="6" fill={softNeutralFill} />
      <rect x="668" y="308" width="182" height="12" rx="6" fill={softNeutralFill} />
      <rect x="668" y="332" width="212" height="12" rx="6" fill={softNeutralFill} />

      {/* Counter (top-left UI rail) */}
      <rect x="36" y="28" width="78" height="28" rx="14" fill={surfaceFill} stroke={softNeutralStroke}  />
      <text
        x="75"
        y="47"
        textAnchor="middle"
        fontSize="13"
        fill={neutralGlyph}
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      >
        3 / 12
      </text>

      {/* Close button (top-right UI rail) */}
      <circle cx="924" cy="42" r="14" fill={surfaceFill} stroke={softNeutralStroke}  />
      <line x1="917" y1="35" x2="931" y2="49" stroke={neutralGlyph} strokeWidth="2" />
      <line x1="931" y1="35" x2="917" y2="49" stroke={neutralGlyph} strokeWidth="2" />

      {/* Left arrow (inset, viewport UI rail) */}
      <g opacity="0.9">
        <circle
          cx="64"
          cy="270"
          r="20"
          fill={surfaceFill}
          stroke={softNeutralStroke}
          
        />
        <polygon points="70,258 56,270 70,282" fill={neutralGlyph} />
      </g>

      {/* Right arrow (inset, viewport UI rail) */}
      <g opacity="0.9">
        <circle
          cx="896"
          cy="270"
          r="20"
          fill={surfaceFill}
          stroke={softNeutralStroke}
          
        />
        <polygon points="890,258 904,270 890,282" fill={neutralGlyph} />
      </g>

      {/* Bottom thumbnails rail */}
      <rect
        x="60"
        y="490"
        width="840"
        height="86"
        rx="16"
        fill={surfaceFill}
        stroke={softNeutralStroke}
        strokeWidth={2}
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
          fill={i === 2 ? "rgba(var(--rmg-logo-cyan-rgb),0.6)" : softNeutralFill}
          stroke={i === 2 ? "rgba(var(--rmg-logo-cyan-rgb),0.6)" : softNeutralStroke}
          strokeWidth="1.5"
        />
      ))}

      {/* Soft highlight (optional, very subtle) */}
      <ellipse cx="220" cy="150" rx="210" ry="120" fill="rgba(255,255,255,0.16)" />
    </svg>
  );
}
