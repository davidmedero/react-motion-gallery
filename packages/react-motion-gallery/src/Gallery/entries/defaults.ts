import type { EntriesOptions } from "./types";

export const DEFAULT_ENTRIES: Required<Pick<EntriesOptions, "layout" | "mediaLayout">> = {
  layout: "list",
  mediaLayout: "slider",
};
