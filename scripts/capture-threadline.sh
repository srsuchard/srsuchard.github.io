#!/usr/bin/env bash
# Prints Threadline's simulated scenario report from a temporary clone (never the original repo).
#   PORTFOLIO_SOURCES_DIR=... bash scripts/capture-threadline.sh > threadline.txt
set -euo pipefail
SRC="${PORTFOLIO_SOURCES_DIR:?Set PORTFOLIO_SOURCES_DIR}/threadline"
WORK="$(cd "$(mktemp -d "${TMPDIR:-/tmp}/threadline-capture.XXXXXX")" && pwd -P)"
trap 'rm -rf "$WORK"' EXIT
git clone -q --local "$SRC" "$WORK/threadline"
cd "$WORK/threadline"
npm ci --no-audit --no-fund >/dev/null 2>&1
echo "# threadline @ $(git rev-parse --short HEAD): npm run scenarios (all data simulated)"
npm run --silent scenarios
