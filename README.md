# wip-cli

CLI utility for working with WIP commits and git bundles. Allows exporting current work to a bundle, sending it to Telegram, importing it back, and managing WIP commits.

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

- `bundle_dir` — directory for storing bundles (default: `.git/.wip/`)
- `bundle_name` — bundle file name (default: `wip.bundle`)
- `base_branch` — base branch for work (default: `main`)
- `telegram_bot_token` — Telegram bot token for sending bundles
- `telegram_chat_id` — chat ID for sending bundles

### Example `.wiprc`

```
bundle_dir=.git/.wip
bundle_name=wip.bundle
base_branch=main
telegram_bot_token=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
telegram_chat_id=-1001234567890
```

## Commands

### `wip export [--msg <message>]`

Creates a WIP commit, bundle of the current branch, and sends it to Telegram.

**Workflow:**

1. Detects repository and current branch
2. If the last commit is WIP, removes it (`git reset --soft HEAD~1`)
3. Stages all changes (`git add .`)
4. Creates a WIP commit (`git commit -m "WIP"`)
5. Creates a bundle of the current branch only (`git bundle create <bundle_path> HEAD`)
6. Sends bundle to Telegram (if configured)
7. Outputs bundle path

**Example:**

```bash
wip export
wip export --msg "Work in progress: feature X"
```

### `wip import [bundle-path]`

Imports a bundle, creates or overwrites a local WIP branch, shows uncommitted changes.

**Workflow:**

1. Determines bundle path:
   - If an argument is provided — uses it
   - Otherwise `bundle_dir/bundle_name` from configuration
2. Verifies bundle (`git bundle verify`)
3. Updates base branch (`git pull origin <base_branch>`)
4. Determines working branch:
   - Current branch if it's not the base branch
   - Otherwise `wip`
5. If branch exists — overwrites it from base branch
6. If not — creates from bundle (`git fetch <bundle_path> +HEAD:<branch>`)
7. Switches to working branch
8. If the first commit is WIP, removes it (`git reset --soft HEAD~1`)
9. Outputs list of changed files

**Example:**

```bash
wip import
wip import /path/to/custom.bundle
```

### `wip clean`

Removes WIP commit after review, leaving changes uncommitted.

**Workflow:**

1. Checks current branch
2. If the last commit is WIP, removes it (`git reset --soft HEAD~1`)
3. Outputs status (`git status`)

If the last commit is not WIP — returns an error.

**Example:**

```bash
wip clean
```

## Branch Behavior

- Author works in a feature branch
- Export creates a WIP commit and bundle of the same branch
- Import creates or overwrites a local temporary branch from bundle
- All changes always remain uncommitted for review

## Import and Overwrite

- Old branch state is not preserved during import
- New bundle always replaces the branch
- Goal: no "traces" of temporary work

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
├── commands/      # CLI commands (export, import, clean)
├── config/        # Reading configuration from ~/.wiprc
├── logger/        # Logger
├── types/         # TypeScript types
├── utils/         # Utilities (git, telegram)
└── index.ts       # Entry point with commander.js
```
