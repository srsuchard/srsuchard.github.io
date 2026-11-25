import type { Person } from "./schema";

// Hearth's co-founder is credited by role only until he consents to public attribution.
// To publish his name later, change his attribution to { status: "public", name: "…" }.
export const people: Person[] = [
  {
    id: "samuel",
    title: "Founder",
    responsibilities: ["Product vision", "Technical direction", "Early development foundation"],
    attribution: { status: "public", name: "Samuel Suchard" },
  },
  {
    id: "hearth-cofounder",
    title: "Co-founder",
    responsibilities: ["Leads UI/UX", "Product innovation"],
    attribution: { status: "pending" },
  },
];
