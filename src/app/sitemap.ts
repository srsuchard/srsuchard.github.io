import type { MetadataRoute } from "next";
import { staticRoutes } from "@/content/index";
import { siteUrl } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes().map((route) => ({ url: `${siteUrl()}${route}` }));
}
