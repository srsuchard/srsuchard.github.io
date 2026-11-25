import type { NextConfig } from "next";

// Static export for GitHub Pages (user site served at the root, so no basePath).
// Not available in this mode: headers(), redirects(), rewrites(), proxy, route handlers,
// server actions and default image optimisation. See node_modules/next/dist/docs/01-app/02-guides/static-exports.md.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
