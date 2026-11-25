import { shot } from "../media";
import type { Project } from "../schema";

export const projectstrike: Project = {
  slug: "projectstrike",
  name: "ProjectStrike",
  tagline: "A browser arena shooter with a server-authoritative online mode, ranked play and LAN matches, plus a separate Unity port.",
  summary:
    "An arena first-person shooter that runs in the browser, built with Three.js and TypeScript. Every model, texture and sound is generated in code at runtime. It started as a single-player game against AI bots and grew an authoritative multiplayer server, ranked play and LAN matches. A separate Unity project is recreating it.",
  tier: "case-study",
  category: "game",
  origin: "current",
  status: { label: "Runs locally", detail: "Web version runs locally; not deployed", asOf: "2026-11-24" },
  team: { mode: "solo", members: [{ personId: "samuel", role: "Designed and built" }] },
  source: { visibility: "private" },
  links: [],
  stack: ["typescript", "threejs", "vite", "webaudio", "colyseus", "websockets", "postgres", "supabase", "nodejs", "vitest", "playwright", "unity", "csharp"],
  platforms: ["Desktop browsers with WebGL2", "Unity 6 (port)"],
  features: [],
  limitations: [],
  media: [shot("/media/projectstrike/menu", "Main menu listing Play Duel, Free-for-All, Practice Range, Online Duel and LAN Match, with arena and difficulty choices", "The web version's main menu.")],
  variants: [
    {
      id: "web",
      name: "Web version",
      status: { label: "Runs locally", detail: "Not deployed; online, ranked and LAN play run on your own machine or network", asOf: "2026-11-24" },
      stack: ["typescript", "threejs", "vite", "webaudio", "colyseus", "websockets", "postgres", "supabase", "nodejs", "vitest", "playwright"],
      features: [
        { text: "Three modes against AI bots: a best-of-five duel, a free-for-all against three bots, and a practice range", state: "implemented" },
        { text: "Five weapons, each with its own fire rate, damage falloff, headshot multiplier, spread, bloom and recoil; hitscan shots that walls block", state: "implemented" },
        { text: "A kinematic character controller with swept collision, Quake-style acceleration, air strafing, coyote time and jump buffering", state: "implemented" },
        { text: "Bot AI: a waypoint graph generated from each map, A* pathfinding, line-of-sight perception and three difficulty levels", state: "implemented" },
        { text: "Models, textures and sound generated in code (Three.js and the Web Audio API), with no external assets", state: "implemented" },
        { text: "Online duels on an authoritative Colyseus server, with client-side prediction, reconciliation, interpolation and lag compensation", state: "implemented" },
        { text: "Private room codes, quick match, and a 20-second window to reconnect after a dropped connection", state: "implemented" },
        { text: "Ranked play: accounts, server-side Elo ratings with placement matches, divisions, match history and leaderboards on PostgreSQL", state: "implemented" },
        { text: "Host-authoritative LAN matches for up to eight fighters, including server-side bots", state: "implemented" },
        { text: "Supabase Auth sign-in for ranked play: token verification is tested locally, not yet against a live Supabase project", state: "partial" },
      ],
      limitations: [
        "Not deployed. Online, ranked and LAN play run on your own machine or network.",
        "The matchmaking queue lives in memory, so ranked play supports a single server instance.",
        "Anti-cheat is baseline: server authority, input validation and rate limits. There is no aimbot or wallhack detection.",
        "LAN play gives the host a latency advantage, has no host migration, and its traffic is unencrypted.",
      ],
      media: [
        shot("/media/projectstrike/duel", "First-person view firing a rifle in a duel, with the round timer and score at the top", "A duel against the bot AXIOM."),
        shot("/media/projectstrike/skybase", "Bright floating facility above the clouds, seen down a long lane toward a central building", "The Skybase map."),
        shot("/media/projectstrike/practice-range", "Practice range with targets at several distances and a stats panel showing shots, hits and accuracy", "The practice range, with live accuracy stats."),
        shot("/media/projectstrike/ffa-scoreboard", "Free-for-all scoreboard listing four fighters with kills and deaths", "Free-for-all against three bots."),
        shot("/media/projectstrike/online-round-won", "Online duel showing a ROUND WON banner after a headshot elimination", "An online duel between two browser windows."),
        shot(
          "/media/projectstrike/ranked-leaderboard",
          "Ranked leaderboard with two players, their divisions, ratings, wins and win rates",
          "The ranked leaderboard, using two local test accounts. The banner marks them as development accounts.",
        ),
        shot("/media/projectstrike/lan-ffa", "LAN free-for-all match in progress, with the leader shown at the top", "A LAN free-for-all."),
      ],
    },
    {
      id: "unity",
      name: "Unity port",
      status: { label: "Milestone 1", detail: "Playable prototype plus a visual recreation of the web version", asOf: "2026-11-24" },
      stack: ["unity", "csharp"],
      features: [
        { text: "The three maps, menu, HUD, weapon models, effects and sounds recreated from the web version", state: "implemented" },
        { text: "First-person movement and all five weapons, in Arena Training and the Practice Range", state: "implemented" },
        { text: "Settings for sensitivity, field of view, crosshair, graphics quality and volume, saved between sessions", state: "implemented" },
        { text: "Bot AI", state: "planned" },
        { text: "Duel and free-for-all rules", state: "planned" },
        { text: "Aiming down sights", state: "planned" },
        { text: "Online and LAN multiplayer", state: "planned" },
      ],
      limitations: ["Training bots move but don't fight back yet.", "The web version remains the reference until the port reaches feature parity."],
      media: [
        shot(
          "/media/projectstrike/unity-menu",
          "Unity main menu where Play Duel, Free-for-All and Online & LAN are marked not yet in Unity",
          "The Unity menu marks the modes that aren't ported yet.",
        ),
        shot("/media/projectstrike/web-neonyard", "Neon Yard map in the web version at the start of a round", "Original (web)"),
        shot("/media/projectstrike/unity-neonyard", "Neon Yard map recreated in Unity, with training bots", "Unity port"),
        shot("/media/projectstrike/unity-testarena-before", "Early Unity test arena with flat colours and placeholder targets", "Unity Milestone 1, before the visual pass"),
        shot("/media/projectstrike/unity-testarena-after", "The same Unity test arena after the visual pass, with lighting and the game's HUD", "After the visual pass"),
      ],
    },
  ],
  sections: [
    {
      id: "netcode",
      heading: "Netcode: the server decides",
      body: [
        "In online play, clients send only their inputs: buttons and view angles for each fixed 1/60-second step. The server re-simulates every input with the same movement and weapon code the client uses for prediction, so it decides movement, fire rate, ammo, reloads, hits, damage, eliminations, rounds and scores. Messages that claim a hit, health or a score are ignored.",
        "The client predicts its own movement and reconciles with the server. Other fighters are shown 100 ms in the past and interpolated, and lag compensation rewinds them when a shot is checked.",
      ],
      media: [{ kind: "diagram", diagram: "strike-netcode", caption: "Clients send inputs; the server simulates with the shared code and sends back the state." }],
    },
    {
      id: "ranked",
      heading: "Ranked play",
      body: [
        "Ratings use standard Elo. The K-factor is 48 during the first five placement matches, 32 once established and 24 from 1800 up. When both players share a K-factor the exchange is exactly zero-sum, ratings are clamped to 0–4000, and only the match result counts, never eliminations. Divisions from Bronze to Grandmaster are always derived from the stored rating.",
        "Identity, ratings and results come only from a verified token and the database; anything a client claims is ignored. Ranked play is designed to sign in with Supabase Auth in production, with the game server verifying each token itself. That path has been tested locally against the real Postgres engine, but not against a live Supabase project.",
      ],
    },
    {
      id: "bots",
      heading: "Bot AI",
      body: [
        "Each map's walkable surfaces become a waypoint graph, and every edge is checked by simulating a walk over the collision geometry before A* uses it. Bots see you only with line of sight to your head or chest inside their field of view, so they can't see or shoot through walls.",
        "They roam, hunt and engage, choose a weapon by range, and aim with a limited turn speed, a reaction delay and an error that settles over time. They use the same weapon code as the player, so they respect fire rates, magazines and reloads.",
      ],
    },
    {
      id: "lan",
      heading: "LAN matches and their trade-offs",
      body: [
        "For LAN play the host computer runs the same authoritative server. Players gather in a lobby, the host starts a duel or a free-for-all, and the server can add bots that run the same AI and combat code as offline play.",
        "The trade-offs are stated plainly: the host's own inputs arrive with almost no delay, there is no host migration, every client receives every fighter's position, and traffic is unencrypted. That's acceptable among friends on a local network, not for public play.",
      ],
    },
    {
      id: "testing",
      heading: "Testing",
      body: [
        "Unit tests cover weapons, ammo and reloads, round flow, free-for-all scoring and respawns, collision and movement. The online duel rules live in one class that is unit-tested without any networking. An end-to-end script starts the game, opens Chrome through Playwright and plays it with real keyboard and mouse input; a debug hook, available only on the development server or with ?debug in the URL, makes aiming deterministic.",
      ],
    },
    {
      id: "unity-port",
      heading: "The Unity port",
      body: [
        "A separate Unity 6 project (URP and the Input System) is recreating the game. Movement, weapon state and health are kept in plain classes, separate from the engine components. The web version stays the reference until the port reaches feature parity.",
      ],
    },
  ],
  verifiedFrom: [
    "ProjectStrike/README.md#Features, #Architecture, #Testing, #Known limitations",
    "ProjectStrike/README.md#V2 Netcode design, #V3 How it works and Limitations, #V3.1 How it works and Limitations",
    "ProjectStrike/package.json (dependencies)",
    "ProjectStrike-Unity/README.md (status, menu, project layout)",
    "Screenshots inspected 2026-11-24; LAN lobby excluded because it shows an IP address",
  ],
};
