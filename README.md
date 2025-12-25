# wip-cli

CLI utility for sharing git branches with full history via archives. Allows exporting feature branches as compressed archives with metadata, sending them via Telegram, and importing them back with complete commit history.

## Installation

```bash
npm install
npm run build
```

For global installation:

```bash
npm link
```

## Configuration

Create a `.wiprc` file in the user's home directory (`~/.wiprc`).

### Configuration Parameters

- `archive_name` — archive file name (default: `wip-archive.tar.gz`)
- `base_branch` — base branch for work (default: `main`)
- `telegram_bot_token` — Telegram bot token for sending archives
- `telegram_chat_id` — chat ID for sending archives

**Note:** Archives are automatically stored in `.git/wip-archives/` directory to avoid accidental commits.

### Example `.wiprc`

```
archive_name=wip-archive.tar.gz
base_branch=main
telegram_bot_token=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
telegram_chat_id=-1001234567890
```

## Commands

### `wip export [--msg <message>]`

Creates an archive containing git bundle with full commit history and metadata, sends it via Telegram.

**What it does:**

1. Detects current feature branch (cannot export from base branch)
2. Creates git bundle containing the entire feature branch history
3. Generates metadata.json with branch info and timestamp
4. Compresses bundle and metadata into tar.gz archive
5. **Stores archive in `.git/wip-archives/` directory** (safe from accidental commits)
6. Sends archive via Telegram (if configured)

**Example:**
```bash
git checkout -b feature/new-feature
# make some commits
git commit -m "Add feature"
git commit -m "Fix bug"

wip export --msg "Please review new feature"
# Archive created at: .git/wip-archives/wip-archive.tar.gz
```

### `wip import <archive-path> [--force] [--stash]`

Imports archive and creates/overwrites feature branch with full commit history.

**What it does:**

1. Extracts archive to temporary directory
2. Reads and validates metadata
3. Verifies git bundle integrity
4. Handles local changes (stashes or requires --force)
5. Removes existing feature branch if it exists
6. Imports bundle with full branch history and switches to feature branch
7. Cleans up temporary files

**Options:**
- `--stash`: Automatically stash local changes before import
- `--force`: Force import even with uncommitted local changes

**Example:**
```bash
# Import from default location (.git/wip-archives/wip-archive.tar.gz)
wip import

# Import specific archive
wip import /path/to/custom-archive.tar.gz

# Handle local changes
wip import --stash    # Stash local changes
wip import --force    # Force overwrite local changes
```

## Key Differences from Traditional Git Workflow

**✅ Full commit history preserved** - No WIP commits, all your commits remain intact
**✅ Clean exports** - No auto-staging, no forced commits
**✅ Safe imports** - Handles local changes intelligently
**✅ Cross-platform** - Works on Windows, macOS, Linux
**✅ Archive-based** - Single file contains everything needed

## Archive Structure

```
archive.tar.gz
├── bundle.gitbundle    # Git bundle with full commit history
└── metadata.json       # Branch info, commit range, timestamp
```

## Workflow Summary

**Author:**
```bash
git checkout -b feature/branch
# Work normally, make commits
git commit -m "Feature implementation"
git commit -m "Tests added"

wip export --msg "Ready for review"
# Archive created and sent via Telegram
```

**Reviewer:**
```bash
wip import wip-archive.tar.gz
# Full branch with history imported
git log --oneline  # See all commits
# Review, test, provide feedback
```

## Requirements

- Git repository
- Node.js
- For Telegram sending: configured `telegram_bot_token` and `telegram_chat_id`

## Development

```bash
# Build
npm run build

# Development with watch
npm run dev

# Run
npm start
```

## Project Structure

```
src/
├── commands/      # CLI commands (export, import)
├── config/        # Reading configuration from ~/.wiprc
├── logger/        # Logger
├── types/         # TypeScript types
├── utils/         # Utilities (git, telegram, archive)
└── index.ts       # Entry point with commander.js
```
