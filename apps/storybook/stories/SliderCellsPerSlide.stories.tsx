/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Slider } from "../../../packages/react-motion-gallery/src/Gallery/slider";

const RMG_BLANK =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const WIDTHS = [980, 940, 740, 700, 520] as const;

function buildSlideSrc(index: number) {
  const palettes = [
    ["#0f172a", "#0ea5e9"],
    ["#1d4ed8", "#22c55e"],
    ["#7c3aed", "#f97316"],
    ["#be123c", "#facc15"],
    ["#0f766e", "#60a5fa"],
    ["#9a3412", "#fb7185"],
  ] as const;
  const [c1, c2] = palettes[index % palettes.length];
  const label = `Slide ${index + 1}`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1600" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${c1}" />
          <stop offset="100%" stop-color="${c2}" />
        </linearGradient>
      </defs>
      <rect width="1000" height="1600" fill="url(#g)" />
      <circle cx="760" cy="300" r="180" fill="rgba(255,255,255,0.18)" />
      <circle cx="220" cy="1220" r="220" fill="rgba(255,255,255,0.12)" />
      <text x="80" y="1360" fill="#ffffff" font-size="112" font-family="Arial, sans-serif" font-weight="700">
        ${label}
      </text>
      <text x="80" y="1460" fill="rgba(255,255,255,0.78)" font-size="40" font-family="Arial, sans-serif">
        cellsPerSlide lazy resize regression
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const ITEMS = Array.from({ length: 16 }, (_, i) => buildSlideSrc(i));

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={`Slide ${i + 1}`}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        borderRadius: 12,
      }}
    />
  );
}

function isVisibleWithin(slideRect: DOMRect, stageRect: DOMRect) {
  return (
    slideRect.right > stageRect.left &&
    slideRect.left < stageRect.right &&
    slideRect.bottom > stageRect.top &&
    slideRect.top < stageRect.bottom
  );
}

async function expectVisibleOriginalImagesLoaded(canvasElement: HTMLElement) {
  await waitFor(() => {
    const stage = canvasElement.querySelector<HTMLElement>('[data-testid="slider-stage"]');
    expect(stage).not.toBeNull();

    const stageRect = stage!.getBoundingClientRect();
    const visibleSlides = Array.from(
      stage!.querySelectorAll<HTMLElement>('[data-rmg-slide="true"][data-rmg-clone="false"]')
    ).filter((slide) => isVisibleWithin(slide.getBoundingClientRect(), stageRect));

    expect(visibleSlides.length).toBeGreaterThan(0);

    visibleSlides.forEach((slide) => {
      const img = slide.querySelector<HTMLImageElement>("img");
      expect(img).not.toBeNull();
      expect(img!.getAttribute("src")).not.toBe(RMG_BLANK);
      expect(getComputedStyle(img!).opacity).not.toBe("0");
      expect(slide.getAttribute("data-rmg-lazyloaded")).toBe("true");
    });
  });
}

function Demo() {
  const [width, setWidth] = React.useState<number>(WIDTHS[0]);

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <h3 style={{ margin: "0 0 12px" }}>Slider keeps lazy images visible while resizing</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Resize the container across and within `cellsPerSlide` breakpoints. Visible slides should
        never fall back to the blank lazy placeholder.
      </p>

      <div
        role="group"
        aria-label="Slider width presets"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}
      >
        {WIDTHS.map((value) => {
          const active = value === width;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setWidth(value)}
              aria-pressed={active}
              style={{
                border: "1px solid #0f172a",
                borderRadius: 999,
                background: active ? "#0f172a" : "#ffffff",
                color: active ? "#ffffff" : "#0f172a",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 12px",
              }}
            >
              {value}px
            </button>
          );
        })}
      </div>

      <div
        data-testid="slider-stage"
        style={{
          width: `${width}px`,
          maxWidth: "100%",
        }}
      >
        <Slider
          scroll={{ freeScroll: true }}
          lazyLoad={{ enabled: true }}
          layout={{
            cellsPerSlide: { 0: 2, 600: 3, 900: 4 },
            gap: 12,
          }}
          transitions={{
            loading: {
              skeletonCount: { 0: 2, 600: 3, 900: 4 },
              skeleton: {
                layout: {
                  kind: "slider",
                  style: { gap: 12 },
                  item: {
                    kind: "col",
                    children: [
                      {
                        kind: "rect",
                        style: {
                          width: "100%",
                          aspectRatio: 1000 / 1600,
                          borderRadius: 12,
                        },
                      },
                    ],
                  },
                },
              },
            },
          }}
        >
          {ITEMS.map((src, i) => (
            <Slide key={src} src={src} i={i} />
          ))}
        </Slider>
      </div>
    </div>
  );
}

const meta: Meta<typeof Demo> = {
  title: "RMG/Tests/Slider cellsPerSlide lazy resize",
  component: Demo,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ResizeKeepsVisibleImages: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectVisibleOriginalImagesLoaded(canvasElement);

    for (const label of ["940px", "740px", "700px", "520px", "980px"]) {
      await userEvent.click(canvas.getByRole("button", { name: label }));
      await expectVisibleOriginalImagesLoaded(canvasElement);
    }
  },
};
