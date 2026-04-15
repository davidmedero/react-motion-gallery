import { Children, isValidElement, type ReactElement, type ReactNode } from "react";

const MAX_SIGNATURE_DEPTH = 5;

function getElementTypeLabel(type: ReactElement["type"]): string {
  if (typeof type === "string") return type;
  if (typeof type === "function") {
    const fnType = type as {
      displayName?: string;
      name?: string;
    };
    return fnType.displayName || fnType.name || "anonymous";
  }
  if (typeof type === "symbol") return String(type);

  if (type && typeof type === "object") {
    const maybeType = type as {
      displayName?: string;
      render?: ReactElement["type"];
      type?: ReactElement["type"];
      $$typeof?: symbol;
    };

    if (typeof maybeType.displayName === "string" && maybeType.displayName.length > 0) {
      return maybeType.displayName;
    }

    if (maybeType.render) return getElementTypeLabel(maybeType.render);
    if (maybeType.type) return getElementTypeLabel(maybeType.type);
    if (maybeType.$$typeof) return maybeType.$$typeof.toString();
  }

  return "unknown";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function serializeNode(node: unknown, depth = 0): string {
  if (depth > MAX_SIGNATURE_DEPTH) return "[depth]";
  if (node == null) return String(node);

  switch (typeof node) {
    case "string":
      return JSON.stringify(node);
    case "number":
    case "bigint":
    case "boolean":
      return String(node);
    case "undefined":
      return "undefined";
    case "function":
      return `[fn:${node.name || "anonymous"}]`;
    case "symbol":
      return node.toString();
    default:
      break;
  }

  if (Array.isArray(node)) {
    return `[${node.map((item) => serializeNode(item, depth + 1)).join(",")}]`;
  }

  if (isValidElement(node)) {
    const props = (node.props ?? {}) as Record<string, unknown> & {
      children?: ReactNode;
    };
    const typeLabel = getElementTypeLabel(node.type);
    const propEntries = Object.entries(props)
      .filter(([key]) => key !== "children")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${serializeNode(value, depth + 1)}`)
      .join(",");
    const childSignature = serializeNode(props.children, depth + 1);

    return `<${typeLabel} key=${String(node.key ?? "")} props={${propEntries}} children=${childSignature}>`;
  }

  if (isPlainObject(node)) {
    return `{${Object.entries(node)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${serializeNode(value, depth + 1)}`)
      .join(",")}}`;
  }

  const ctorName =
    (node as {
      constructor?: { name?: string };
    }).constructor?.name ?? "object";

  return `[obj:${ctorName}]`;
}

export function computeSliderChildrenKey(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => serializeNode(child))
    .join("|");
}
