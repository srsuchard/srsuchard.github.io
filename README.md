# srsuchard.github.io

Source for Samuel Suchard's portfolio site. It's a statically exported Next.js app built for GitHub Pages.

> This branch is a work in progress. The live site at https://srsuchard.github.io is still served from `main`.

## Requirements

- Node.js 26 (see `.nvmrc`)
- pnpm 12

## Commands

```sh
pnpm install
pnpm dev          # local development server
pnpm check        # typecheck, lint, unit tests
pnpm test:build   # static export to out/, then checks on the exported files
pnpm preview      # serve out/ the way GitHub Pages does, at http://127.0.0.1:3200
pnpm test:e2e     # build, then Playwright tests against the preview server
```

Copy `.env.example` to `.env.local` and fill it in before running the checks.

## Deployment

`.github/workflows/pages.yml` builds and checks every pull request. On `main`, it runs the same checks, then deploys `out/` to GitHub Pages. The `PORTFOLIO_BLOCKED_NAMES` Actions secret must be set, or the checks fail.
