# Claude Code Instructions

## Change Log

After making any code changes, always update `CHANGE_LOG.md` at the repo root.

The change log has two sections:
- **Chat-Widget** (`# Chat-Widget`): For changes under `chat-widget/src/`, `chat-widget/stories/`, `chat-widget/.storybook/`, `chat-widget/package.json`, and related build/config files.
- **Chat-Components** (`# Chat-Components`): For changes under `chat-components/`.

Add entries under the `## [Unreleased]` heading of the appropriate section, using the correct subsection:
- `### Added` — new features or capabilities
- `### Changed` — changes to existing functionality, dependency uptakes
- `### Fixed` — bug fixes
- `### Security` — security-related fixes

Keep entries concise (one line each). Prefix with a category tag in brackets when relevant (e.g., `[A11Y]`, `[Persistent Chat History]`).
