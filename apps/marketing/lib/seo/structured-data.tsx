import type { BillingPlan } from "@/lib/billing/plans";
import {
  DEMO_METADATA,
  DEMO_CATEGORY_BY_ID,
  getDemoDescription,
  getDemoPath,
  getDemoTitle,
  type DemoCatalogEntry,
} from "@/app/demos/demo-catalog";
import packageJson from "../../../../packages/react-motion-gallery/package.json";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue | undefined };
export type JsonLdNode = { [key: string]: JsonValue | undefined };

export const SITE_NAME = "React Motion Gallery";
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://react-motion-gallery.com"
).replace(/\/$/, "");
export const SITE_DESCRIPTION =
  "Gallery + lightbox React library with carousels, grid, masonry, fullscreen, video, zoom/pan/pinch, skeletons, and reveal animations.";
export const LOGO_URL = "https://cdn.react-motion-gallery.com/nav/rmg-logo-v6.png";
export const ICON_URL = "https://cdn.react-motion-gallery.com/nav/rmg-tab-icon.png";
export const OG_IMAGE_URL =
  "https://firebasestorage.googleapis.com/v0/b/reac-motion-gallery-blog.firebasestorage.app/o/social-card-rmg.jpg?alt=media&token=41bab79d-d6c6-41e6-92f5-f80e5fbdbf71";
export const PACKAGE_SOURCE_URL =
  "https://github.com/davidmedero/react-motion-gallery/tree/main/packages/react-motion-gallery";
export const PACKAGE_LICENSE_URL =
  "https://github.com/davidmedero/react-motion-gallery/blob/main/packages/react-motion-gallery/LICENSE.md";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SOFTWARE_ID = `${SITE_URL}/#software`;

type HomeFeatureLink = {
  title: string;
  description: string;
  href: string;
};

type EntryPoint = {
  category: string;
  entry: string;
  imports: string;
  description: string;
};

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function entityId(path: string, fragment: string): string {
  return `${absoluteUrl(path)}#${fragment}`;
}

export function serializeJsonLd(data: JsonLdNode): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd(props: { data: JsonLdNode; id?: string }) {
  const { data, id } = props;

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

function graph(nodes: JsonLdNode[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
    },
    sameAs: [PACKAGE_SOURCE_URL],
  };
}

function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

function softwareNode(): JsonLdNode {
  return {
    "@type": "SoftwareSourceCode",
    "@id": SOFTWARE_ID,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: ICON_URL,
    codeRepository: PACKAGE_SOURCE_URL,
    license: PACKAGE_LICENSE_URL,
    programmingLanguage: ["TypeScript", "JavaScript", "CSS"],
    runtimePlatform: "React",
    softwareVersion: packageJson.version,
    creator: { "@id": ORGANIZATION_ID },
  };
}

function breadcrumbNode(
  path: string,
  items: Array<{ name: string; path: string }>
): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    "@id": entityId(path, "breadcrumb"),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function pageNode(props: {
  type?: string;
  path: string;
  name: string;
  description: string;
  mainEntityId?: string;
  aboutSoftware?: boolean;
}): JsonLdNode {
  return {
    "@type": props.type ?? "WebPage",
    "@id": entityId(props.path, "webpage"),
    url: absoluteUrl(props.path),
    name: props.name,
    description: props.description,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    about: props.aboutSoftware ? { "@id": SOFTWARE_ID } : undefined,
    mainEntity: props.mainEntityId ? { "@id": props.mainEntityId } : undefined,
  };
}

function baseNodes(): JsonLdNode[] {
  return [organizationNode(), websiteNode(), softwareNode()];
}

export function buildHomeJsonLd(features: readonly HomeFeatureLink[]): JsonLdNode {
  const featureListId = entityId("/", "features");

  return graph([
    ...baseNodes(),
    {
      "@type": "ItemList",
      "@id": featureListId,
      name: "React Motion Gallery feature demos",
      itemListElement: features.map((feature, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: feature.title,
        description: feature.description,
        url: absoluteUrl(feature.href),
      })),
    },
    pageNode({
      path: "/",
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      mainEntityId: SOFTWARE_ID,
      aboutSoftware: true,
    }),
  ]);
}

export function buildDocsJsonLd(entryPoints: readonly EntryPoint[]): JsonLdNode {
  const path = "/docs";
  const articleId = entityId(path, "article");
  const entryPointListId = entityId(path, "entry-points");
  const description =
    "The React Motion Gallery README, with package entry points and API reference.";

  return graph([
    ...baseNodes(),
    breadcrumbNode(path, [
      { name: "Home", path: "/" },
      { name: "Docs", path },
    ]),
    {
      "@type": "ItemList",
      "@id": entryPointListId,
      name: "React Motion Gallery package entry points",
      itemListElement: entryPoints.map((entryPoint, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: entryPoint.entry,
          description: entryPoint.description,
          programmingLanguage: entryPoint.imports,
          genre: entryPoint.category,
        },
      })),
    },
    {
      "@type": "TechArticle",
      "@id": articleId,
      headline: "React Motion Gallery Docs",
      name: "React Motion Gallery Docs",
      description,
      url: absoluteUrl(path),
      author: { "@id": ORGANIZATION_ID },
      publisher: { "@id": ORGANIZATION_ID },
      about: { "@id": SOFTWARE_ID },
      hasPart: { "@id": entryPointListId },
    },
    pageNode({
      path,
      name: "React Motion Gallery Docs",
      description,
      mainEntityId: articleId,
      aboutSoftware: true,
    }),
  ]);
}

function priceToNumber(price: string): number {
  return Number(price.replace(/[^0-9.]/g, ""));
}

export function buildLicenseJsonLd(plans: readonly BillingPlan[]): JsonLdNode {
  const path = "/license";
  const productId = entityId(path, "commercial-license");
  const description =
    "Commercial license options for React Motion Gallery, including single-project and unlimited commercial plans.";

  return graph([
    ...baseNodes(),
    breadcrumbNode(path, [
      { name: "Home", path: "/" },
      { name: "License", path },
    ]),
    {
      "@type": "Product",
      "@id": productId,
      name: "React Motion Gallery Commercial License",
      description,
      image: ICON_URL,
      brand: { "@id": ORGANIZATION_ID },
      isRelatedTo: { "@id": SOFTWARE_ID },
      offers: plans.flatMap((plan) =>
        plan.billing.map((option) => ({
          "@type": "Offer",
          name: `${plan.name} - ${option.label}`,
          description: `${plan.description} ${option.detail}`,
          category: plan.licenseScope,
          price: priceToNumber(option.price),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: absoluteUrl(path),
        }))
      ),
    },
    pageNode({
      type: "WebPage",
      path,
      name: "React Motion Gallery Commercial Licenses",
      description,
      mainEntityId: productId,
      aboutSoftware: true,
    }),
  ]);
}

function demosItemListNode(path: string): JsonLdNode {
  return {
    "@type": "ItemList",
    "@id": entityId(path, "demo-list"),
    name: "React Motion Gallery demos",
    itemListElement: DEMO_METADATA.map((demo, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(getDemoPath(demo.id)),
      name: getDemoTitle(demo),
      description: getDemoDescription(demo),
    })),
  };
}

function selectedDemoNode(demo: DemoCatalogEntry): JsonLdNode {
  const path = getDemoPath(demo.id);
  const category = DEMO_CATEGORY_BY_ID.get(demo.categoryId);

  return {
    "@type": "SoftwareSourceCode",
    "@id": entityId(path, "demo-source"),
    name: getDemoTitle(demo),
    description: getDemoDescription(demo),
    url: absoluteUrl(path),
    codeRepository: PACKAGE_SOURCE_URL,
    programmingLanguage: ["TypeScript", "CSS"],
    runtimePlatform: "React",
    keywords: demo.tags.join(", "),
    isPartOf: { "@id": SOFTWARE_ID },
    about: category
      ? {
          "@type": "DefinedTerm",
          name: category.label,
          description: category.description,
        }
      : undefined,
  };
}

export function buildDemosJsonLd(selectedDemo?: DemoCatalogEntry | null): JsonLdNode {
  const path = selectedDemo ? getDemoPath(selectedDemo.id) : "/demos";
  const description = selectedDemo
    ? getDemoDescription(selectedDemo)
    : "Editable React Motion Gallery demo slots with a sticky sidebar for browsing planned layouts and patterns.";
  const pageName = selectedDemo ? getDemoTitle(selectedDemo) : "React Motion Gallery Demos";
  const itemList = demosItemListNode(path);
  const selectedDemoSource = selectedDemo ? selectedDemoNode(selectedDemo) : null;

  return graph([
    ...baseNodes(),
    breadcrumbNode(
      path,
      selectedDemo
        ? [
            { name: "Home", path: "/" },
            { name: "Demos", path: "/demos" },
            { name: getDemoTitle(selectedDemo), path },
          ]
        : [
            { name: "Home", path: "/" },
            { name: "Demos", path },
          ]
    ),
    itemList,
    ...(selectedDemoSource ? [selectedDemoSource] : []),
    pageNode({
      type: "CollectionPage",
      path,
      name: pageName,
      description,
      mainEntityId: selectedDemoSource
        ? String(selectedDemoSource["@id"])
        : String(itemList["@id"]),
      aboutSoftware: true,
    }),
  ]);
}
