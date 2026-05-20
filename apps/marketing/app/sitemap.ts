import type { MetadataRoute } from "next";
import { DEMO_METADATA, getDemoPath } from "./demos/demo-catalog";
import { absoluteUrl } from "@/lib/seo/structured-data";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/docs"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/license"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/demos"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...DEMO_METADATA.map((demo) => ({
      url: absoluteUrl(getDemoPath(demo.id)),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
