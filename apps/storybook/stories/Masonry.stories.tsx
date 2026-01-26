import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Gallery } from "../../../packages/react-motion-gallery/src";

const meta: Meta = {
  title: "RMG/Gallery/Masonry",
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => {
    const count = 18;

    const items = React.useMemo(() => {
      const heights = [900, 1600, 600, 1300, 800, 1200];
      const widths = [1600, 900, 1300, 600, 1200, 800];
      return Array.from({ length: count }).map((_, i) => {
        const h = heights[i % heights.length];
        const w = widths[i % widths.length];
        const src = `https://picsum.photos/seed/rmg-${i + 1}/${w}/${h}`;
        return { kind: "image" as const, src, alt: `Picsum ${i + 1}` };
      });
    }, []);

    return (
      <div style={{ padding: 16 }}>
        <style>{`
          .sbWrap { 
            max-width: 1100px;
            margin: 0 auto;
          }

          /* clip box: fixed height ensures vertical cropping */
          .sbClip {
            width: 100%;
            height: var(--sb-h, 220px);
            overflow: hidden;
            border-radius: 14px;
            background: rgba(0,0,0,0.06);
          }

          /* image fills box */
          .sbClip > img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
          }
        `}</style>

        <div className="sbWrap">
          <Gallery
            layout="masonry"
            masonry={{
              columns: { xs: 2, md: 3, lg: 4 },
              gap: 10,
              placement: "balanced",
            }}
            fullscreen={{ items }}
          >
            {items.map((it, i) => {
              const heights = [280, 320, 240, 440, 310, 500];

              return (
                <div
                  key={i}
                  className="sbClip"
                  style={{
                    ["--sb-h" as any]: `${heights[i % heights.length]}px`
                  }}
                >
                  <img src={it.src} alt={it.alt} loading="lazy" />
                </div>
              );
            })}
          </Gallery>
        </div>
      </div>
    );
  },
};