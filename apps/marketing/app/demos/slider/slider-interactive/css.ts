export const css = String.raw`.shell {
  display: grid;
  gap: 10px;
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
  border-radius: 12px;
  background: #fff;
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
  background-color: #67bee5;;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  min-height: 40px;
  padding: 0 14px;
  white-space: nowrap;
  transition: background-color 160ms ease;
}

.actionButton:hover {
  background-color: #54a3c7;
}

.slideCard {
  width: 100%;
  overflow: hidden;
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  background: #fff;
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
}
`;
