import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Gallery } from "../../../packages/react-motion-gallery/src";

const meta: Meta = {
  title: "RMG/Gallery/Grid",
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => {

    const items = React.useMemo(() => {
      return Array.from({ length: 12 }).map((_, i) => {
        const src = `https://picsum.photos/seed/grid-${i}/1200/1200`;
        return { kind: "image" as const, src, alt: `Picsum ${i}` };
      });
    }, []);

    return (
      <Gallery
        layout="grid"
        fullscreen={{ items }}
        grid={{
          columns: { 0: 1, 500: 2, 768: 3, 1024: 4, 1280: 5 },
          gap: 12,
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <img
              src={`https://picsum.photos/seed/grid-${i}/1200/1200`}
              alt=""
            />
          </div>
        ))}
      </Gallery>
    );
  },
};