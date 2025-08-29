#!/usr/bin/env bash
set -euo pipefail

# Techcorp_ai start script
# Usage examples:
#   ./run.sh                     # default
#   ./run.sh --docs ./external-docs
#   TECHCORP_DOCS_PATH=/path/to/docs ./run.sh

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Prefer project venv if present
if [[ -x "$ROOT_DIR/rag-project/venv/bin/python" ]]; then
  VENV_DIR="$ROOT_DIR/rag-project/venv"
  USE_EXISTING_VENV=1
else
  VENV_DIR="$ROOT_DIR/.venv"
fi
REQ_FILE="$ROOT_DIR/rag-project/requirements.txt"
DOCS_ARG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --docs)
      DOCS_ARG="$2"; shift 2 ;;
    --no-install)
      SKIP_INSTALL=1; shift ;;
    *)
      echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

# Ensure Python 3
if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 not found. Please install Python 3." >&2
  exit 1
fi

# Create venv if missing and not using existing one
if [[ -z "${USE_EXISTING_VENV:-}" && ! -d "$VENV_DIR" ]]; then
  echo "[setup] Creating virtualenv at $VENV_DIR"
  python3 -m venv "$VENV_DIR"
fi

# Install dependencies unless skipped
if [[ -z "${SKIP_INSTALL:-}" && -z "${USE_EXISTING_VENV:-}" ]]; then
  if [[ -f "$REQ_FILE" ]]; then
    echo "[setup] Installing dependencies from $REQ_FILE"
    pip install -r "$REQ_FILE"
  else
    echo "[warn] Requirements file not found at $REQ_FILE; skipping installs"
  fi
fi

# Apply docs path override if provided
if [[ -n "$DOCS_ARG" ]]; then
  export TECHCORP_DOCS_PATH="$DOCS_ARG"
fi

echo "[run] Using venv: $VENV_DIR"
echo "[run] TECHCORP_DOCS_PATH=${TECHCORP_DOCS_PATH:-<default>}"

cd "$ROOT_DIR/rag-assistant"
exec "$VENV_DIR/bin/python" app.py


