# Beads Workflow Context

> **Context Recovery**: Run `bd prime` after compaction, clear, or new session

# 🚨 SESSION CLOSE PROTOCOL 🚨

Before saying "done" or "complete": `bd close <id1> <id2> ...` (close completed issues).

## Core Rules
- **Default**: Use beads for ALL task tracking (`bd create`, `bd ready`, `bd close`)
- **Prohibited**: Do NOT use TodoWrite, TaskCreate, or markdown files for task tracking
- **Workflow**: Create beads issue BEFORE writing code, mark in_progress when starting
- **Memory**: Use `bd remember "insight"` for persistent knowledge; search with `bd memories <keyword>`. Do NOT use MEMORY.md files.
- Git authority: no git operations in this context (stealth mode)
- Session management: check `bd ready` for available work

## Essential Commands
- `bd ready` · `bd show <id>` · `bd list --status=open|in_progress`
- `bd update <id> --claim` · `bd close <id> [--reason="..."]`
- `bd create --title="..." --description="why + what" --type=task|bug|feature --priority=0-4 [--parent=<id>]` (priority is a number, never "high")
- `bd dep add <issue> <depends-on>` · `bd blocked`
- Never `bd edit` (opens $EDITOR and blocks the agent)
