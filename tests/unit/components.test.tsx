// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Collaborations } from "@/components/project/Collaborations";
import { FeatureList } from "@/components/project/FeatureList";
import { MediaFigure } from "@/components/project/MediaFigure";
import { SourceNote } from "@/components/project/SourceNote";
import { TeamCredit } from "@/components/project/TeamCredit";
import { TerminalBlock } from "@/components/project/TerminalBlock";
import { FlowDiagram } from "@/components/diagrams/FlowDiagram";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import type { Collaboration, Media, Person } from "@/content/schema";

afterEach(cleanup);

type Shot = Extract<Media, { kind: "screenshot" }>;
const shot = (over: Partial<Shot> = {}): Shot => ({
  kind: "screenshot",
  src: "/media/demo/menu",
  widths: [640, 1280, 1440],
  width: 1440,
  height: 900,
  alt: "Main menu with five modes",
  caption: "The main menu.",
  demoData: false,
  ...over,
});
const people: Person[] = [
  { id: "samuel", title: "Founder", responsibilities: ["Product vision"], attribution: { status: "public", name: "Samuel Suchard" } },
  { id: "cof", title: "Co-founder", responsibilities: ["Leads UI/UX", "Product innovation"], attribution: { status: "pending" } },
];

describe("FeatureList", () => {
  it("puts planned items under 'Planned · not built yet' and partial items under Built, tagged", () => {
    render(
      <FeatureList
        features={[
          { text: "Snapshots", state: "implemented" },
          { text: "Live sign-in", state: "partial" },
          { text: "Encryption", state: "planned" },
        ]}
      />,
    );
    const built = screen.getByRole("list", { name: "Built" });
    const planned = screen.getByRole("list", { name: "Planned · not built yet" });
    expect(within(built).getByText("Snapshots")).toBeTruthy();
    expect(within(built).getByText("Live sign-in").closest("li")!.textContent).toContain("Partial");
    expect(within(planned).getByText("Encryption")).toBeTruthy();
    expect(within(built).queryByText("Encryption")).toBeNull();
  });

  it("omits the planned group when nothing is planned", () => {
    render(<FeatureList features={[{ text: "Snapshots", state: "implemented" }]} />);
    expect(screen.queryByRole("list", { name: "Planned · not built yet" })).toBeNull();
  });
});

describe("TeamCredit", () => {
  it("shows a pending person's title and responsibilities but no name", () => {
    const { container } = render(
      <TeamCredit
        people={people}
        team={{
          mode: "collaborative",
          members: [
            { personId: "samuel", role: "Founder" },
            { personId: "cof", role: "Co-founder" },
          ],
        }}
      />,
    );
    expect(container.textContent).toContain("Samuel Suchard");
    expect(container.textContent).toContain("Co-founder");
    expect(container.textContent).toContain("Leads UI/UX");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});

describe("SourceNote", () => {
  it("says 'Source not public' for private and local-only projects", () => {
    for (const visibility of ["private", "local-only"] as const) {
      const { container } = render(<SourceNote source={{ visibility }} links={[]} />);
      expect(container.textContent).toBe("Source not public");
      expect(container.querySelector("a")).toBeNull();
      cleanup();
    }
  });

  it("links to the repository for a public project", () => {
    render(<SourceNote source={{ visibility: "public" }} links={[{ kind: "github", url: "https://github.com/srsuchard/agentsafe", label: "Source on GitHub", verifiedOn: "2026-11-24" }]} />);
    const link = screen.getByRole("link", { name: /Source on GitHub/ });
    expect(link.getAttribute("href")).toBe("https://github.com/srsuchard/agentsafe");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});

describe("ResponsiveImage", () => {
  it("lists exactly the widths that exist, with intrinsic size and lazy loading", () => {
    render(<ResponsiveImage media={shot()} sizes="100vw" />);
    const img = screen.getByRole("img", { name: "Main menu with five modes" });
    expect(img.getAttribute("srcset")).toBe("/media/demo/menu-640.webp 640w, /media/demo/menu-1280.webp 1280w, /media/demo/menu-1440.webp 1440w");
    expect(img.getAttribute("width")).toBe("1440");
    expect(img.getAttribute("height")).toBe("900");
    expect(img.getAttribute("loading")).toBe("lazy");
  });

  it("loads eagerly when marked as priority", () => {
    render(<ResponsiveImage media={shot()} sizes="100vw" priority />);
    expect(screen.getByRole("img").getAttribute("loading")).toBe("eager");
  });
});

describe("MediaFigure", () => {
  it("shows a 'Demo data' badge only for demo screenshots", () => {
    const { container } = render(<MediaFigure media={shot({ demoData: true })} sizes="100vw" />);
    expect(container.textContent).toContain("Demo data");
    cleanup();
    const plain = render(<MediaFigure media={shot()} sizes="100vw" />);
    expect(plain.container.textContent).not.toContain("Demo data");
  });

  it("links the image to its largest file", () => {
    render(<MediaFigure media={shot()} sizes="100vw" />);
    expect(screen.getByRole("link").getAttribute("href")).toBe("/media/demo/menu-1440.webp");
  });
});

describe("TerminalBlock", () => {
  const t = (provenance: "captured" | "readme"): Extract<Media, { kind: "terminal" }> => ({
    kind: "terminal",
    title: "agentsafe demo",
    text: "$ agentsafe init\nInitialized",
    caption: "A run.",
    provenance,
    capturedOn: "2026-11-24",
  });

  it("states where the output came from", () => {
    const { container } = render(<TerminalBlock media={t("captured")} />);
    expect(container.textContent).toContain("Captured output · 24 Nov 2026");
    cleanup();
    expect(render(<TerminalBlock media={t("readme")} />).container.textContent).toContain("From the project README");
  });

  it("renders output in a focusable, labelled region", () => {
    render(<TerminalBlock media={t("captured")} />);
    const region = screen.getByRole("region", { name: "agentsafe demo: terminal output" });
    expect(region.tagName).toBe("PRE");
    expect(region.getAttribute("tabindex")).toBe("0");
    expect(region.textContent).toBe("$ agentsafe init\nInitialized");
  });
});

describe("FlowDiagram", () => {
  it("renders steps as an ordered list with built/planned labels", () => {
    render(
      <FlowDiagram
        title="Engine"
        steps={[
          { label: "Rule engine", detail: "Pure", state: "built" },
          { label: "Adapters", detail: "Read-only", state: "planned" },
        ]}
      />,
    );
    const list = screen.getByRole("list", { name: "Engine" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[1]!.textContent).toContain("Planned");
  });
});

describe("Collaborations", () => {
  it("renders nothing when the list is empty", () => {
    const { container } = render(<Collaborations items={[]} people={people} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders an approved collaboration with its credits and approval scope", () => {
    const ps: Person[] = [people[0]!, { ...people[1]!, attribution: { status: "public", name: "Pat Example" } }];
    const c: Collaboration = {
      id: "c1",
      title: "Vault interface study",
      summary: "Interface explorations.",
      personIds: ["samuel", "cof"],
      media: [],
      links: [],
      approval: { approvedBy: "cof", approvedOn: "2026-12-01", scope: "Title, summary and screenshots" },
    };
    render(<Collaborations items={[c]} people={ps} />);
    expect(screen.getByRole("heading", { name: "Collaborators & selected work" })).toBeTruthy();
    expect(screen.getByText("Vault interface study")).toBeTruthy();
    expect(document.body.textContent).toContain("Pat Example");
  });
});
