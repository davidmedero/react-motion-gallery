import {
  BREAKPOINT_MAP,
  resolveNumberFromResponsive,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../shared/responsiveNumber";

export type SliderResponsiveGroupCells = boolean | ResponsiveNumber | undefined;

export function resolveResponsiveSliderGroupCells(
  value: SliderResponsiveGroupCells,
  viewportWidth: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): boolean | number {
  if (value === true) return true;
  if (value == null || value === false) return false;

  const raw = resolveNumberFromResponsive(value, 0, viewportWidth, breakpointMap);
  if (!Number.isFinite(raw) || raw <= 0) return false;

  const count = Math.trunc(raw);
  return count > 1 ? count : false;
}
