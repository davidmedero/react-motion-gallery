import type { EntriesPlugin, EntriesPluginKind } from "../types";

export function createEntriesPlugin<Kind extends EntriesPluginKind>(
  kind: Kind,
  options: EntriesPlugin<Kind>["options"]
): EntriesPlugin<Kind> {
  return {
    __rmgEntriesPlugin: true,
    kind,
    options,
  };
}

export function isEntriesPlugin(value: unknown): value is EntriesPlugin {
  return (
    typeof value === "object" &&
    value != null &&
    (value as EntriesPlugin).__rmgEntriesPlugin === true
  );
}
