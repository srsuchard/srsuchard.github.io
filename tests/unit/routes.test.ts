import { describe, expect, it } from "vitest";
import { staticRoutes } from "@/content/index";

describe("staticRoutes", () => {
  it("includes the home route", () => {
    expect(staticRoutes()).toContain("/");
  });

  it("uses trailing-slash paths only, matching trailingSlash: true", () => {
    for (const route of staticRoutes()) {
      expect(route.startsWith("/"), route).toBe(true);
      expect(route.endsWith("/"), route).toBe(true);
    }
  });

  it("has no duplicates", () => {
    const routes = staticRoutes();
    expect(new Set(routes).size).toBe(routes.length);
  });
});
