export const css = String.raw`.shell {
  width: 100%;
  display: grid;
  gap: 14px;
  color: #0f172a;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.badge,
.resetButton {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 850;
  line-height: 1;
}

.badge {
  padding: 0 12px;
  background: rgba(8, 145, 178, 0.12);
  color: #155e75;
}

.resetButton {
  padding: 0 13px;
  border: 0;
  background: #0f172a;
  color: #ffffff;
  cursor: pointer;
}

.stage {
  display: grid;
  gap: 14px;
}

.header {
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(8, 145, 178, 0.12), rgba(255, 255, 255, 0.88)),
    #ffffff;
}

.header span {
  color: #0891b2;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0;
  text-transform: uppercase;
}

.header h2,
.header p,
.summaryCard p,
.timelineItem p {
  margin: 0;
}

.header h2 {
  max-width: 620px;
  font-size: 28px;
  line-height: 1.08;
  letter-spacing: 0;
}

.header p {
  max-width: 640px;
  color: #475569;
  font-size: 14px;
  line-height: 1.45;
}

.summaryGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.summaryCard {
  min-width: 0;
  display: grid;
  gap: 8px;
  min-height: 142px;
  padding: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.summaryCard span {
  width: fit-content;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(8, 145, 178, 0.11);
  color: #155e75;
  font-size: 11px;
  font-weight: 850;
}

.summaryCard[data-tone="green"] span {
  background: rgba(22, 163, 74, 0.12);
  color: #166534;
}

.summaryCard[data-tone="magenta"] span {
  background: rgba(219, 39, 119, 0.11);
  color: #9d174d;
}

.summaryCard strong {
  font-size: 24px;
  line-height: 1.05;
}

.summaryCard p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.4;
}

.timeline {
  display: grid;
  gap: 8px;
}

.timelineItem {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: #f8fafc;
}

.timelineItem span {
  color: #0891b2;
  font-size: 12px;
  font-weight: 900;
}

.timelineItem p {
  color: #334155;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.35;
}

@media (max-width: 720px) {
  .summaryGrid {
    grid-template-columns: 1fr;
  }

  .header h2 {
    font-size: 24px;
  }
}
`;
