// Content registry. Task 7 fills it with verified data; until then only the home route exists.

/** Every exported route, as served with `trailingSlash: true`. Used by the sitemap and export tests. */
export function staticRoutes(): string[] {
  return ["/"];
}
