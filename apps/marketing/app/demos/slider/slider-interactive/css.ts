export const css = String.raw`.shell {
  display: grid;
  gap: 10px;
}

.sliderFrame {
  padding: 12px;
  border: 1px solid #dbe4f0;
  border-radius: 20px;
  background:
    radial-gradient(circle at top left, rgba(253, 230, 138, 0.18), transparent 34%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.98));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

.metaBar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.metaPill {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  background: #fff;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.controlGrid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.controlCard {
  display: grid;
  gap: 8px;
  padding: 10px;
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.05);
}

.controlForm {
  display: grid;
  gap: 8px;
}

.fieldRow {
  display: grid;
  gap: 8px;
  grid-template-columns: 82px minmax(0, 1fr) auto;
}

.fieldRowCompact {
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr) auto;
}

.textInput,
.numberInput,
.selectInput {
  width: 100%;
  min-width: 0;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #fff;
  color: #0f172a;
  font: inherit;
  font-size: 0.9rem;
  padding: 10px 12px;
}

.textInput:focus,
.numberInput:focus,
.selectInput:focus {
  outline: 2px solid rgba(13, 148, 136, 0.18);
  border-color: #0f766e;
}

.numberInput:disabled {
  background: #f8fafc;
  color: #94a3b8;
}

.actionButton {
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f766e, #155e75);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  min-height: 40px;
  padding: 0 14px;
  white-space: nowrap;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
  box-shadow: 0 8px 18px rgba(13, 148, 136, 0.18);
}

.actionButton:hover {
  transform: translateY(-1px);
  box-shadow: 0 11px 22px rgba(13, 148, 136, 0.2);
}

.actionButton:active {
  transform: translateY(0);
}

.slideCard {
  width: 100%;
  overflow: hidden;
  border: 1px solid #dbe4f0;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.slideImage {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.slideMeta {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
}

.slideEyebrow {
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.slideTitle {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.2;
}

@media (max-width: 1100px) {
  .controlGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .controlGrid {
    grid-template-columns: 1fr;
  }

  .fieldRow,
  .fieldRowCompact {
    grid-template-columns: 1fr;
  }

  .actionButton {
    width: 100%;
  }
}`;
