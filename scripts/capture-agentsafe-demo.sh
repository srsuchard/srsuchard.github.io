#!/usr/bin/env bash
# Runs the AgentSafe README "Five-minute safe demo" from a fresh clone of the PUBLIC repository,
# in throwaway directories, and prints each command (prefixed "$ ") followed by its real output.
#
#   bash scripts/capture-agentsafe-demo.sh > transcript.txt
#
# Temporary paths are rewritten to ~/demo so no local path is published.
set -euo pipefail

PY="${PYTHON:-python3}"
WORK="$(cd "$(mktemp -d "${TMPDIR:-/tmp}/agentsafe-capture.XXXXXX")" && pwd -P)" # resolved (macOS: /tmp -> /private/tmp)
trap 'rm -rf "$WORK"' EXIT

git clone -q https://github.com/srsuchard/agentsafe.git "$WORK/agentsafe" >&2
"$PY" -m venv "$WORK/venv" >&2
"$WORK/venv/bin/pip" install -q "$WORK/agentsafe" >&2
export PATH="$WORK/venv/bin:$PATH"
COMMIT="$(git -C "$WORK/agentsafe" rev-parse --short HEAD)"

DEMO="$WORK/demo"
mkdir -p "$DEMO/project"
export AGENTSAFE_HOME="$DEMO/agentsafe-home"
cd "$DEMO/project"
git init -q
printf 'def add(a, b):\n    return a + b\n' > calc.py
printf 'API_KEY=example\n' > .env
printf '.env\n' > .gitignore

run() { # print the command, then run it, merging stderr; keep going on non-zero exit (verify returns 1 by design)
  printf '$'
  local a
  for a in "$@"; do case "$a" in *" "*) printf ' "%s"' "$a" ;; *) printf ' %s' "$a" ;; esac; done
  printf '\n'

  set +e
  "$@" 2>&1
  local code=$?
  set -e
  [ "$code" -ne 0 ] && printf '[exit %s]\n' "$code"
  return 0
}

{
  echo "# agentsafe $(agentsafe --version | awk '{print $2}') from github.com/srsuchard/agentsafe @ $COMMIT"
  run agentsafe init
  run agentsafe snapshot -m "before agent run"
  SNAP="$(agentsafe history | awk 'NR==2 {print $1}')"
  echo
  echo "# play the AI agent: break calc.py and add generated.py"
  printf 'def add(a, b):\n    return a - b\n' > calc.py
  printf 'print("generated")\n' > generated.py
  run agentsafe diff "$SNAP"
  run agentsafe restore "$SNAP" --dry-run
  echo
  run agentsafe restore "$SNAP" --overwrite-conflicts --yes
  run agentsafe verify "$SNAP"
  run cat calc.py
  run agentsafe history
  echo
  echo "# what AgentSafe does not protect: the Git-ignored .env was never captured"
  rm .env
  run agentsafe verify "$SNAP"
} | sed -e "s#$DEMO#~/demo#g" -e "s#$WORK#~/agentsafe-work#g"
