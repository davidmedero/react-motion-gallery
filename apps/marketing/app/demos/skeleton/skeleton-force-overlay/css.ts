export const css = String.raw`.shell {
  width: 100%;
}

.stage {
  display: grid;
  width: 100%;
}

.skeleton {
  width: 100%;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
}

.panelHeader {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
}

.headerCopy {
  flex: 1 1 220px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.headerCopy h2,
.headerCopy p {
  margin: 0;
}

.headerCopy h2 {
  color: #0f172a;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.headerCopy p {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
}

.headerActions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.headerActions button {
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: #0f172a;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.headerActions button:first-child {
  width: 72px;
}

.headerActions button:last-child {
  position: relative;
  width: 44px;
  background: #e2e8f0;
}

.headerActions button:last-child::before {
  position: absolute;
  inset: 9px 13px;
  border-radius: 999px;
  background: #64748b;
  content: "";
}

.summaryGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.summaryCard {
  flex: 1 1 150px;
  min-width: 0;
  min-height: 92px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: space-between;
  border-radius: 14px;
}

.summaryCard span {
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
}

.summaryCard strong {
  color: #0f172a;
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timelineRow {
  min-width: 0;
  padding: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  border-radius: 14px;
  background: #f8fafc;
}

.timelineIcon {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: rgba(var(--rmg-logo-cyan-rgb), 0.24);
}

.timelineRow p {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timelineRow strong,
.timelineRow p span {
  overflow: hidden;
  white-space: normal;
}

.timelineRow strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
}

.timelineRow p span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
}
`;
