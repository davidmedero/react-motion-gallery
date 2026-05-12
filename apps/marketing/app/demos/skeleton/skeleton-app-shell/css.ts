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

.appFrame {
  min-height: 520px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 22px;
  background: #f8fafc;
}

.appHeader {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: #ffffff;
}

.brandCluster {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  gap: 12px;
  align-items: center;
}

.brandMark {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(var(--rmg-logo-cyan-rgb), 0.26);
  color: #0f172a;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.brandCopy {
  max-width: 260px;
  min-width: 0;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 7px;
}

.brandCopy strong,
.brandCopy span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brandCopy strong {
  width: 74%;
  color: #0f172a;
  font-size: 14px;
  line-height: 1.25;
}

.brandCopy span {
  width: 46%;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.25;
}

.avatarGroup {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.avatarGroup span {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #e2e8f0;
}

.avatarGroup span:nth-child(2) {
  background: rgba(var(--rmg-logo-blue-rgb), 0.28);
}

.avatarGroup span:nth-child(3) {
  background: rgba(var(--rmg-logo-magenta-rgb), 0.22);
}

.appBody {
  min-height: 0;
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
}

.sidebar {
  flex: 0 0 220px;
  min-width: 190px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #f1f5f9;
}

.sidebarLabel {
  width: 42%;
  margin: 0;
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.35;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.navList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.navItem {
  min-width: 0;
  display: flex;
  gap: 10px;
  align-items: center;
  color: #334155;
  text-decoration: none;
}

.navIcon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #e2e8f0;
}

.navText {
  width: var(--nav-width, 64%);
  min-width: 0;
  overflow: hidden;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mainPanel {
  flex: 1 1 420px;
  min-width: 0;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metricGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.metricCard {
  flex: 1 1 150px;
  min-width: 0;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 11px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: #ffffff;
}

.metricLabel {
  width: var(--label-width, 48%);
  overflow: hidden;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.metricValue {
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 12px;
  background: #e2e8f0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
}

.detailGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: stretch;
}

.chartCard {
  flex: 2 1 330px;
  min-width: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: #ffffff;
}

.chartHeader {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.chartHeader h3 {
  flex: 1 1 auto;
  width: 42%;
  margin: 0;
  overflow: hidden;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chartHeader span {
  width: 86px;
  height: 28px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(var(--rmg-logo-cyan-rgb), 0.16);
  color: var(--rmg-logo-magenta);
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.chartPanel {
  height: 210px;
  display: flex;
  gap: 10px;
  align-items: flex-end;
  padding: 16px;
  border-radius: 16px;
  background: rgba(var(--rmg-logo-cyan-rgb), 0.14);
}

.chartPanel span {
  flex: 1 1 0;
  border-radius: 999px 999px 8px 8px;
  background: rgba(var(--rmg-logo-magenta-rgb), 0.36);
}

.chartPanel span:nth-child(1) {
  height: 44%;
}

.chartPanel span:nth-child(2) {
  height: 62%;
}

.chartPanel span:nth-child(3) {
  height: 48%;
}

.chartPanel span:nth-child(4) {
  height: 78%;
}

.chartPanel span:nth-child(5) {
  height: 58%;
}

.activityCard {
  flex: 1 1 220px;
  min-width: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: #ffffff;
}

.activityRow {
  min-width: 0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.activityIcon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  background: #e2e8f0;
}

.activityCopy {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.38;
}

.activityCopy span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activityCopy span:first-child {
  width: 100%;
}

.activityCopy span:nth-child(2) {
  width: var(--activity-line-width, 68%);
  color: #64748b;
}
`;
