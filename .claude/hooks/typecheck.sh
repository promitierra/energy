#!/usr/bin/env bash
# PostToolUse hook: type-check after edits to .ts/.tsx files.
f=$(jq -r '.tool_input.file_path // empty')
case "$f" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac
cd "$CLAUDE_PROJECT_DIR" || exit 0
out=$(npx tsc --noEmit 2>&1) || { echo "$out" | head -40 >&2; exit 2; }
