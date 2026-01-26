import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Gallery } from "../../../packages/react-motion-gallery/src";

const meta: Meta = {
  title: "RMG/Gallery/Slider",
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => {
    const items = [
      { id: 'img-1', kind: "image", src: "https://picsum.photos/seed/1/1600/1200" },
      { id: 'img-2', kind: "image", src: "https://picsum.photos/seed/2/1600/1200" },
      { id: 'img-3', kind: "image", src: "https://picsum.photos/seed/3/1600/1200" },
    ];
    return (
      <Gallery 
        layout="slider"
        fullscreen={{ enabled: true, items: items.map((item) => ({ kind: "image", src: item.src })) }}
        slider={{ 
          size: {
            height: '400px'
          },
          transitions: {
          loading: {
            isLoading: true,
            skeletonCount: 2
          }
        }}}
      >
        {items.map((item) => (
          <div key={item.id}>
            <img src={item.src} alt="" style={{ height: '400px' }} />
          </div>
        ))}
      </Gallery>
    );
  },
};