import { GridOptions } from "./types";

export const DEFAULT_GRID: Required<Pick<GridOptions, "minColumnWidth" | "gap">> = {
  minColumnWidth: 160,
  gap: 8,
};