import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Gallery } from "../../../packages/react-motion-gallery/src";

const meta: Meta = {
  title: "RMG/Gallery/Entries",
};
export default meta;

type Story = StoryObj;

export const Entries_GridMedia_WithFsOverlay: Story = {
  render: () => {
    const entries = [
      {
        id: "entry-1",
        title: "Entry 1",
        media: [
          { kind: "image", src: "https://picsum.photos/seed/e1-1/1400/1100", alt: "" },
          { kind: "image", src: "https://picsum.photos/seed/e1-2/1400/1100", alt: "" },
          { kind: "image", src: "https://picsum.photos/seed/e1-3/1400/1100", alt: "" },
        ],
      },
      {
        id: "entry-2",
        title: "Entry 2",
        media: [
          { kind: "image", src: "https://picsum.photos/seed/e2-1/1400/1100", alt: "" },
          { kind: "image", src: "https://picsum.photos/seed/e2-2/1400/1100", alt: "" },
        ],
      },
      {
        id: "entry-3",
        title: "Entry 3",
        media: [
          { kind: "image", src: "https://picsum.photos/seed/e3-1/1400/1100", alt: "" },
          { kind: "image", src: "https://picsum.photos/seed/e3-2/1400/1100", alt: "" },
          { kind: "image", src: "https://picsum.photos/seed/e3-3/1400/1100", alt: "" },
          { kind: "image", src: "https://picsum.photos/seed/e3-4/1400/1100", alt: "" },
        ],
      },
    ] as any[];

    return (
      <div style={{ padding: 16, background: "#f6f7f9", minHeight: "100vh" }}>
        <Gallery
          layout="entries"
          fullscreen={{ enabled: true }}
          grid={{
            columns: 3,
            gap: 10
          }}
          entries={{
            items: entries,
            mediaLayout: "grid",
            render: {
              card: ({ entry, media }: any) => {
                return (
                  <article
                    style={{
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 16,
                      background: "#fff",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ fontWeight: 700 }}>{entry.title ?? entry.id}</div>
                      <div style={{ opacity: 0.6, fontSize: 12 }}>
                        {(entry.media?.length ?? 0)} media
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>{media}</div>
                  </article>
                );
              },

              overlay: ({ entry, entryIndex, mediaIndex, opacity, style }: any) => {
                const title = entry?.title ?? entry?.id ?? `Entry ${entryIndex + 1}`;

                return (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      zIndex: 9999,
                      ...style,
                      opacity,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 16,
                        top: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 10px",
                          borderRadius: 999,
                          color: "#fff",
                          fontSize: 12,
                          lineHeight: 1,
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{title}</span>
                        <span style={{ opacity: 0.8 }}>•</span>
                        <span style={{ opacity: 0.95 }}>
                          {typeof mediaIndex === "number" ? `Media ${mediaIndex + 1}` : "Media"}
                        </span>
                      </div>

                      <div
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          background: "rgba(0,0,0,0.35)",
                          color: "#fff",
                          maxWidth: 320,
                          fontSize: 13,
                          lineHeight: 1.3,
                          backdropFilter: "blur(6px)",
                          WebkitBackdropFilter: "blur(6px)",
                        }}
                      >
                        This is <b>entries.render.overlay</b> in fullscreen.
                        <div style={{ marginTop: 6, opacity: 0.9 }}>
                          entryIndex={entryIndex}, mediaIndex={String(mediaIndex)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              },
            },
          }}
        />
      </div>
    );
  },
};
