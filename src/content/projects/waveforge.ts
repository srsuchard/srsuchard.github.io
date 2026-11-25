import { shot } from "../media";
import type { Project } from "../schema";

const demo = { demoData: true };

export const waveforge: Project = {
  slug: "waveforge",
  name: "WaveForge",
  tagline: "Surf-specific training on land: a personalised four-week plan, a full-screen workout player and progress tracking.",
  summary:
    "A local-first web app built with Next.js. It builds a four-week training block from your experience, goals, schedule and equipment, runs each workout with timers and rep counters, and keeps everything in the browser with no accounts or backend.",
  tier: "standard",
  category: "app",
  origin: "current",
  status: { label: "Runs locally", detail: "No public deployment (checked 24 Nov 2026)", asOf: "2026-11-24" },
  team: { mode: "solo", members: [{ personId: "samuel", role: "Designed and built" }] },
  source: { visibility: "private" },
  links: [],
  stack: ["nextjs", "react", "typescript", "tailwind", "zustand", "zod", "vitest", "playwright"],
  platforms: ["Web, desktop and mobile"],
  features: [
    { text: "Six-step onboarding that builds a four-week block: base, build, peak and a lighter week", state: "implemented" },
    { text: "A full-screen workout player with countdowns, a rep counter, and rest and side-switch timers", state: "implemented" },
    { text: "A pop-up lab with technique checkpoints, drills by level and a practice log", state: "implemented" },
    { text: "An exercise library with search, filters and favourites (75 exercises in the current build)", state: "implemented" },
    { text: "Custom workouts, a surf session log and progress charts", state: "implemented" },
    { text: "JSON export and import, and clearly labelled demo data", state: "implemented" },
    { text: "Brand colours and tokens generated from one source file, with contrast adjusted to meet WCAG AA", state: "implemented" },
  ],
  limitations: ["Data lives in one browser's local storage, so nothing syncs between devices.", "No accounts or backend, by design."],
  media: [
    shot("/media/waveforge/today", "Today screen with the day's Surf strength session, a Start workout button and the week at a glance", "Today: the next session and the week at a glance.", demo),
    shot("/media/waveforge/plan", "Four-week plan with the week's sessions listed by day", "The four-week plan.", demo),
    shot("/media/waveforge/player", "Workout player showing Wall slides, a large rep counter and a Done set button", "The full-screen workout player.", demo),
    shot("/media/waveforge/progress", "Progress screen with weekly training charts and a notice that the charts include demo data", "Progress, built from logged workouts and sessions.", demo),
    shot("/media/waveforge/library", "Exercise library with category, level and equipment filters", "The exercise library.", demo),
    shot("/media/waveforge/today-mobile", "Today screen on a phone, with bottom navigation", "Today on a phone.", demo),
    shot("/media/waveforge/player-mobile", "Workout player on a phone", "The workout player on a phone.", demo),
  ],
  verifiedFrom: [
    "SurfTrainer/README.md (WaveForge): What's in the app, Brand, Architecture decisions",
    "SurfTrainer/package.json",
    "Running build @ 1c8a30a, 24 Nov 2026: library shows 75 exercises (README still says 66)",
    "No deployment config, no URL in README, no project under the srsuchards-projects Vercel team (24 Nov 2026)",
  ],
};
