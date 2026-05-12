import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { auditProject, resolveInsideRoot, writeGalleryFiles } from "./project.js";

describe("project helpers", () => {
  test("defaults file writing to a dry run", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "rmg-mcp-"));
    const result = writeGalleryFiles({
      projectRoot: root,
      componentPath: "src/Gallery.tsx",
      cssPath: "src/Gallery.module.css",
      tsx: "export function Gallery() { return null; }",
      css: ".root {}",
    });

    expect(result.applied).toBe(false);
    expect(fs.existsSync(path.join(root, "src", "Gallery.tsx"))).toBe(false);
    expect(result.files).toHaveLength(2);
  });

  test("writes files only when apply is true", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "rmg-mcp-"));
    writeGalleryFiles({
      projectRoot: root,
      componentPath: "src/Gallery.tsx",
      cssPath: "src/Gallery.module.css",
      tsx: "export function Gallery() { return null; }",
      css: ".root {}",
      apply: true,
    });

    expect(fs.readFileSync(path.join(root, "src", "Gallery.tsx"), "utf8")).toContain("Gallery");
    expect(fs.readFileSync(path.join(root, "src", "Gallery.module.css"), "utf8")).toContain(".root");
  });

  test("blocks path traversal outside the project root", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "rmg-mcp-"));

    expect(() => resolveInsideRoot(root, "../outside.tsx")).toThrow(/outside projectRoot/);
  });

  test("audits install, stylesheet, video peers, and Next client component issues", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "rmg-mcp-"));
    fs.mkdirSync(path.join(root, "app"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({
        dependencies: {
          next: "16.0.0",
          react: "19.0.0",
          "react-motion-gallery": "2.0.0",
        },
      })
    );
    fs.writeFileSync(
      path.join(root, "app", "gallery.tsx"),
      'import { Video } from "react-motion-gallery/video";\nexport function Gallery(){ return <Video src="video.mp4" />; }\n'
    );

    const audit = auditProject(root);

    expect(audit.project.kind).toBe("next");
    expect(audit.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining(["missing-rmg-styles", "missing-video-peers", "next-use-client"])
    );
  });
});
