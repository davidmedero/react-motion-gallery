export const css = String.raw`.shell {
  --product-demo-ink: rgb(var(--rmg-logo-shadow-rgb));
  --product-demo-muted: rgba(var(--rmg-logo-shadow-rgb), 0.66);
  --product-demo-line: rgba(var(--rmg-logo-blue-rgb), 0.22);
  --product-demo-line-strong: rgba(var(--rmg-logo-blue-rgb), 0.38);
  --product-demo-surface: #ffffff;
  --product-demo-accent: rgb(var(--rmg-logo-blue-rgb));
  --product-demo-accent-deep: #2458a8;
  --product-demo-cyan: rgb(var(--rmg-logo-cyan-rgb));
  display: grid;
  gap: 18px;
  width: 100%;
}
.toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border: 1px solid var(--product-demo-line);
  border-radius: 8px;
  background:
    linear-gradient(
      135deg,
      rgba(var(--rmg-logo-cyan-rgb), 0.12),
      rgba(var(--rmg-logo-blue-rgb), 0.08)
    ),
    var(--product-demo-surface);
}
.status {
  display: flex;
  justify-content: flex-start;
  color: var(--product-demo-muted);
  font-size: 0.86rem;
}
.status button {
  min-height: 34px;
  border: 1px solid var(--product-demo-line-strong);
  border-radius: 7px;
  background: #ffffff;
  color: var(--product-demo-accent-deep);
  font: inherit;
  font-weight: 700;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  overflow-anchor: none;
}
.error {
  margin: 0;
  padding: 14px;
  border: 1px solid #f2b8a0;
  border-radius: 8px;
  background: #fff4ef;
  color: #953516;
}
.productRoot {
  align-items: stretch;
}
.productRoot :global([data-rmg-idx])::before {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: 8px;
  box-shadow:
    0 14px 30px rgba(var(--rmg-logo-shadow-rgb), 0.07),
    0 8px 22px rgba(var(--rmg-logo-cyan-rgb), 0.09);
  pointer-events: none;
}
.productRoot .card,
.productRoot :global([data-rmg-grid-skel-scope] > div),
.productRoot :global([data-rmg-grid-skel-scope] [data-rmg-grid-item-key] > div) {
  box-shadow: none;
}
.productRoot :global([data-rmg-grid-skel-scope] > div),
.productRoot :global([data-rmg-grid-skel-scope] [data-rmg-grid-item-key] > div) {
  contain: paint;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.98),
      rgba(var(--rmg-logo-cyan-rgb), 0.035)
    ),
    var(--product-demo-surface);
}
.card {
  --product-image-aspect-ratio: 1 / 1;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  border: 1px solid var(--product-demo-line);
  border-radius: 8px;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.98),
      rgba(var(--rmg-logo-cyan-rgb), 0.035)
    ),
    var(--product-demo-surface);
  box-shadow:
    0 14px 30px rgba(var(--rmg-logo-shadow-rgb), 0.07),
    0 8px 22px rgba(var(--rmg-logo-cyan-rgb), 0.09);
}
.gridCard {
  min-height: 480px;
}
.imageFrame {
  position: relative;
  flex: 0 0 auto;
  aspect-ratio: var(--product-image-aspect-ratio);
  overflow: hidden;
  background: #f6f8f8;
}
.image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}
.copy {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  min-height: 194px;
  padding: 14px 14px 22px;
}
.category {
  color: var(--product-demo-accent-deep);
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.2;
  text-transform: capitalize;
}
.card h3 {
  margin: 0;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--product-demo-ink);
  font-size: 1rem;
  line-height: 1.25;
}
.rating {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  align-items: center;
  color: var(--product-demo-muted);
  font-size: 0.88rem;
  line-height: 1.2;
}
.ratingStars {
  color: var(--product-demo-cyan);
  font-size: 1rem;
}
.ratingStar {
  flex: 0 0 auto;
}
.ratingLabel {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--product-demo-muted);
  font-weight: 700;
}
.price {
  color: var(--product-demo-ink);
  font-size: 1.14rem;
  font-weight: 800;
  line-height: 1.1;
}
.stockBadge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 26px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 9px;
  border: 1px solid var(--product-demo-line);
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}
.stockDot {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: currentColor;
}
.stockLow {
  border-color: rgba(var(--rmg-logo-lavender-rgb), 0.36);
  background: rgba(var(--rmg-logo-lavender-rgb), 0.1);
  color: #5f4788;
}
.stockMedium {
  border-color: rgba(var(--rmg-logo-blue-rgb), 0.36);
  background: rgba(var(--rmg-logo-blue-rgb), 0.1);
  color: #35568f;
}
.stockHigh {
  border-color: rgba(var(--rmg-logo-cyan-rgb), 0.42);
  background: rgba(var(--rmg-logo-cyan-rgb), 0.12);
  color: #116a91;
}
.actionButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 28px);
  min-height: 40px;
  margin: auto 14px 14px;
  padding: 0 14px;
  border: 1px solid rgba(var(--rmg-logo-blue-rgb), 0.62);
  border-radius: 8px;
  border-color: rgba(var(--rmg-logo-blue-rgb), 0.72);
  background: var(--rmg-logo-sky);
  box-shadow: 0 10px 20px rgba(var(--rmg-logo-blue-rgb), 0.2);
  color: #ffffff;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;
}
.actionButton:hover {
  border-color: rgba(var(--rmg-logo-cyan-rgb), 0.72);
  background: color-mix(
    in srgb,
    var(--rmg-logo-sky) 88%,
    var(--rmg-logo-shadow)
  );
  box-shadow: 0 12px 24px rgba(var(--rmg-logo-blue-rgb), 0.24);
}
.actionButton:focus-visible {
  outline: 3px solid rgba(var(--rmg-logo-cyan-rgb), 0.26);
  outline-offset: 2px;
}
.pageButtons {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  align-items: center;
  gap: 10px;
  overflow: visible;
}
.pageButtons [data-rmg-page-items="true"] {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}
.pageButtons [data-rmg-page-items="true"] button,
.pageButtons [data-rmg-page-items="true"] a {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 38px;
  padding: 0 10px;
  border: 1px solid rgba(23, 33, 38, 0.16);
  border-radius: 8px;
  color: #24394d;
  border-color: rgba(var(--rmg-logo-blue-rgb), 0.28);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 8px 18px rgba(var(--rmg-logo-cyan-rgb), 0.08);
  font: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
.pageButtons [data-rmg-page-items="true"] button[data-rmg-page-control],
.pageButtons [data-rmg-page-items="true"] a[data-rmg-page-control] {
  min-width: 76px;
}
.pageButtons [data-rmg-items-per-page="true"] {
  position: relative;
  z-index: 2;
  justify-self: start;
  min-height: 44px;
  display: inline-grid;
  grid-template-columns: auto minmax(78px, auto);
  align-items: center;
  gap: 9px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 4px 5px 4px 12px;
  border: 1px solid rgba(var(--rmg-logo-blue-rgb), 0.24);
  border-radius: 8px;
  background:
    linear-gradient(180deg, #ffffff, rgba(var(--rmg-logo-cyan-rgb), 0.055)),
    #ffffff;
  box-shadow:
    0 8px 18px rgba(var(--rmg-logo-cyan-rgb), 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.84);
  color: #516068;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1;
}
.pageButtons [data-rmg-items-per-page="true"] > span {
  min-height: auto;
  padding: 0;
  color: inherit;
  white-space: nowrap;
}
.pageButtons [data-rmg-items-per-page-trigger="true"] {
  appearance: none;
  min-height: 34px;
  display: inline-grid;
  grid-template-columns: minmax(24px, 1fr) 12px;
  align-items: center;
  gap: 9px;
  box-sizing: border-box;
  padding: 0 10px 0 12px;
  border: 0;
  border-radius: 6px;
  background:
    radial-gradient(
      circle at 15% 0%,
      rgba(255, 255, 255, 0.9),
      transparent 38%
    ),
    linear-gradient(
      180deg,
      rgba(var(--rmg-logo-cyan-rgb), 0.18),
      rgba(var(--rmg-logo-cyan-rgb), 0.1)
    );
  box-shadow:
    inset 0 -2px 0 rgba(var(--rmg-logo-blue-rgb), 0.44),
    0 5px 14px rgba(var(--rmg-logo-blue-rgb), 0.09);
  color: #24394d;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    box-shadow 160ms ease,
    color 160ms ease;
}
.pageButtons [data-rmg-items-per-page-trigger="true"]::after {
  content: "";
  width: 7px;
  height: 7px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg) translateY(-2px);
  transform-origin: 50% 50%;
  transition: transform 180ms cubic-bezier(0.2, 0.7, 0.2, 1);
}
.pageButtons
  [data-rmg-items-per-page-trigger="true"][data-state="open"]::after {
  transform: rotate(225deg) translate(-1px, -1px);
}
.pageButtons [data-rmg-items-per-page-trigger="true"]:hover:not(:disabled) {
  background:
    radial-gradient(
      circle at 15% 0%,
      rgba(255, 255, 255, 0.95),
      transparent 38%
    ),
    linear-gradient(
      180deg,
      rgba(var(--rmg-logo-cyan-rgb), 0.24),
      rgba(var(--rmg-logo-cyan-rgb), 0.14)
    );
  box-shadow:
    inset 0 -2px 0 rgba(var(--rmg-logo-blue-rgb), 0.62),
    0 7px 16px rgba(var(--rmg-logo-blue-rgb), 0.12);
}
.pageButtons [data-rmg-items-per-page-trigger="true"]:focus-visible {
  outline: 3px solid rgba(var(--rmg-logo-cyan-rgb), 0.24);
  outline-offset: 2px;
}
.pageButtons [data-rmg-items-per-page-trigger="true"]:disabled {
  background: #eef1f2;
  box-shadow: none;
  color: #8e9aa1;
  cursor: not-allowed;
}
.pageButtons [data-rmg-items-per-page-value="true"] {
  min-width: 0;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pageButtons [data-rmg-items-per-page-menu="true"] {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  min-width: 96px;
  width: max-content;
  max-width: min(180px, calc(100vw - 32px));
  box-sizing: border-box;
  padding: 5px;
  border: 1px solid rgba(var(--rmg-logo-blue-rgb), 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow:
    0 18px 36px rgba(var(--rmg-logo-shadow-rgb), 0.13),
    0 7px 18px rgba(var(--rmg-logo-cyan-rgb), 0.12);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-5px) scale(0.96);
  transform-origin: top right;
  visibility: hidden;
  transition:
    opacity 170ms ease,
    transform 170ms cubic-bezier(0.2, 0.7, 0.2, 1),
    visibility 0s linear 170ms;
}
.pageButtons [data-rmg-items-per-page-menu="true"][data-state="open"] {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0) scale(1);
  visibility: visible;
  transition:
    opacity 170ms ease,
    transform 170ms cubic-bezier(0.2, 0.7, 0.2, 1),
    visibility 0s;
}
.pageButtons [data-rmg-items-per-page-option="true"] {
  position: relative;
  width: 100%;
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  padding: 0 32px 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #24394d;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 800;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}
.pageButtons [data-rmg-items-per-page-option="true"]:hover,
.pageButtons [data-rmg-items-per-page-option="true"][data-active="true"] {
  background: rgba(var(--rmg-logo-cyan-rgb), 0.15);
  color: #2458a8;
}
.pageButtons [data-rmg-items-per-page-option="true"][data-selected="true"] {
  background: rgba(var(--rmg-logo-blue-rgb), 0.11);
  color: #2458a8;
}
.pageButtons
  [data-rmg-items-per-page-option="true"][data-selected="true"]::after {
  content: "";
  position: absolute;
  right: 12px;
  width: 6px;
  height: 10px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg) translateY(-1px);
}
.pageButtons [data-rmg-page-items="true"] button:hover:not(:disabled),
.pageButtons [data-rmg-page-items="true"] a:hover:not([aria-disabled="true"]) {
  border-color: rgba(var(--rmg-logo-cyan-rgb), 0.7);
  background: rgba(var(--rmg-logo-cyan-rgb), 0.14);
}
.pageButtons [data-rmg-page-items="true"] button:disabled,
.pageButtons [data-rmg-page-items="true"] a[aria-disabled="true"] {
  color: #8e9aa1;
  border-color: rgba(23, 33, 38, 0.12);
  background: #eef1f2;
  box-shadow: none;
}
.pageButtons [data-rmg-page-items="true"] button[data-selected="true"],
.pageButtons [data-rmg-page-items="true"] a[data-selected="true"],
.pageButtons [data-rmg-page-items="true"] button:hover[data-selected="true"],
.pageButtons [data-rmg-page-items="true"] a:hover[data-selected="true"] {
  color: #fff;
  border-color: rgba(var(--rmg-logo-blue-rgb), 0.72);
  background: linear-gradient(
    135deg,
    var(--rmg-logo-cyan),
    var(--rmg-logo-blue)
  );
  box-shadow: 0 10px 22px rgba(var(--rmg-logo-blue-rgb), 0.22);
}
.pageButtons [data-rmg-page-break="true"] {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
  color: #71808a;
  font-weight: 700;
}
@media (max-width: 760px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
  .virtualizationMeter {
    align-items: flex-start;
    flex-direction: column;
  }
  .status,
  .pageButtons {
    justify-content: flex-start;
  }
  .primaryButton {
    justify-self: start;
  }
}
`;
