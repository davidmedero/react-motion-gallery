export function DefaultChevronIcon({ side }: { side: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" width="100%" height="100%" focusable="false" aria-hidden="true" style={{ display: "block" }}>
      <polygon
        points="4.586,3.414 9.172,8 4.586,12.586 6,14 12,8 6,2"
        fill="white"
        stroke="#4f4f4f"
        strokeWidth="0.5"
      />
    </svg>
  );
}