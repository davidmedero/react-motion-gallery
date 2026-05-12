import type { SkeletonNode } from "../../Gallery/shared/skeleton/layout";
import { SkeletonTextAnalyzerError } from "./types";

export type TextNodePath = {
  targetNode: Extract<SkeletonNode, { kind: "text" }>;
  childIndexes: number[];
  textNodeCount: number;
};

function isTextNode(
  node: SkeletonNode
): node is Extract<SkeletonNode, { kind: "text" }> {
  return node.kind === "text";
}

export function resolveTextNodePath(
  root: SkeletonNode,
  textNodeIndex: number
): TextNodePath {
  if (!Number.isInteger(textNodeIndex) || textNodeIndex < 0) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_TEXT_NODE_INDEX",
      "textNodeIndex must be a non-negative integer.",
      { textNodeIndex }
    );
  }

  let seen = 0;
  let found: TextNodePath | null = null;

  const visit = (node: SkeletonNode, path: number[]) => {
    if (isTextNode(node)) {
      if (seen === textNodeIndex && !found) {
        found = {
          targetNode: node,
          childIndexes: path,
          textNodeCount: 0,
        };
      }
      seen += 1;
    }

    if (node.kind === "stack" || node.kind === "row" || node.kind === "col") {
      for (let index = 0; index < node.children.length; index += 1) {
        visit(node.children[index]!, [...path, index]);
      }
    }
  };

  visit(root, []);

  if (!found) {
    throw new SkeletonTextAnalyzerError(
      "TEXT_NODE_NOT_FOUND",
      "No text node exists at the requested textNodeIndex.",
      { textNodeIndex, availableTextNodes: seen }
    );
  }

  return {
    ...found,
    textNodeCount: seen,
  };
}
