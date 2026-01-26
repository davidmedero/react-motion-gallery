import { usePanAnimation } from "./usePanAnimation";
import { usePanDrag } from "./usePanDrag";
import type { PanRuntimeDeps } from "./types";

export function usePanRuntime(deps: PanRuntimeDeps) {
  usePanAnimation(deps);
  return usePanDrag(deps);
}