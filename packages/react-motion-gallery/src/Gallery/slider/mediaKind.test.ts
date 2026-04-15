import * as React from "react";
import { describe, expect, test } from "vitest";

import { Video } from "../video/index";
import {
  collectImageSrcsFromReactNode,
  collectPredecodeImageUrls,
  detectKindFromChild,
} from "./mediaKind";

function WrappedImage(props: { src: string }) {
  return React.createElement("img", { src: props.src, alt: "" });
}

function WrappedVideo(props: {
  src: string;
  poster: string;
  children?: React.ReactNode;
}) {
  return React.createElement("div", null, props.children);
}

describe("slider media-kind predecode helpers", () => {
  test("keeps wrapped image src props eligible for predecode", () => {
    const node = React.createElement(WrappedImage, {
      src: "https://example.com/image-a.jpg",
    });

    expect(detectKindFromChild(node)).toBe("image");
    expect(collectImageSrcsFromReactNode(node)).toEqual([
      "https://example.com/image-a.jpg",
    ]);
  });

  test("skips a wrapped video src while still traversing nested children", () => {
    const node = React.createElement(
      WrappedVideo,
      {
        src: "https://vimeo.com/145140004",
        poster: "https://i.vimeocdn.com/video/poster-a.jpg",
      },
      React.createElement("img", {
        src: "https://example.com/nested-image.jpg",
        alt: "",
      })
    );

    expect(detectKindFromChild(node)).toBe("video");
    expect(collectImageSrcsFromReactNode(node)).toEqual([
      "https://example.com/nested-image.jpg",
    ]);
  });

  test("skips direct Video children backed by Vimeo sources", () => {
    const node = React.createElement(Video, {
      src: "https://vimeo.com/113314928",
      poster: "https://i.vimeocdn.com/video/poster-b.jpg",
      source: {
        type: "video" as const,
        poster: "https://i.vimeocdn.com/video/poster-b.jpg",
        sources: [
          {
            src: "https://vimeo.com/113314928",
            provider: "vimeo" as const,
          },
        ],
      },
      alt: "Video 2",
    });

    expect(detectKindFromChild(node)).toBe("video");
    expect(collectImageSrcsFromReactNode(node)).toEqual([]);
  });

  test("predecodes only image urls from mixed content and dedupes them", () => {
    const node = React.createElement(
      React.Fragment,
      null,
      React.createElement(WrappedImage, {
        src: "https://example.com/shared-image.jpg",
      }),
      React.createElement("img", {
        src: "https://example.com/shared-image.jpg",
        alt: "",
      }),
      React.createElement("img", {
        src: "https://example.com/second-image.jpg",
        alt: "",
      }),
      React.createElement(WrappedVideo, {
        src: "https://vimeo.com/172833424",
        poster: "https://i.vimeocdn.com/video/poster-c.jpg",
      }),
      React.createElement(Video, {
        src: "https://vimeo.com/130632032",
        poster: "https://i.vimeocdn.com/video/poster-d.jpg",
        source: {
          type: "video" as const,
          poster: "https://i.vimeocdn.com/video/poster-d.jpg",
          sources: [
            {
              src: "https://vimeo.com/130632032",
              provider: "vimeo" as const,
            },
          ],
        },
      })
    );

    expect(collectPredecodeImageUrls(node, false)).toEqual([
      "https://example.com/shared-image.jpg",
      "https://example.com/second-image.jpg",
    ]);
  });

  test("bypasses predecode collection when slider lazy-load is enabled", () => {
    const node = React.createElement(WrappedImage, {
      src: "https://example.com/image-b.jpg",
    });

    expect(collectPredecodeImageUrls(node, true)).toBeUndefined();
  });
});
