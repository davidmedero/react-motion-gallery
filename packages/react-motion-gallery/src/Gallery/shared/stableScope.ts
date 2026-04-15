export function stableSerializeScopeValue(value: unknown): string {
  if (value == null) return "null";

  const valueType = typeof value;
  if (valueType === "number" || valueType === "boolean") return String(value);
  if (valueType === "string") return JSON.stringify(value);

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerializeScopeValue(entry)).join(",")}]`;
  }

  if (valueType === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    return `{${entries
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerializeScopeValue(entry)}`)
      .join(",")}}`;
  }

  return JSON.stringify(String(value));
}

export function hashScopeSeed(seed: string) {
  let hash = 5381;

  for (let index = 0; index < seed.length; index++) {
    hash = (hash * 33) ^ seed.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

export function buildStableScopeId(prefix: string, value: unknown) {
  return `${prefix}${hashScopeSeed(stableSerializeScopeValue(value))}`;
}
