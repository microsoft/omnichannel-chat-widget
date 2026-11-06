---
mode: agent
description: Prepare an official npm package release through a pull request
---

Prepare the requested package release with the procedure in `docs/RELEASING.md`.

Read these files before you make changes:

- `docs/RELEASING.md`
- `.github/workflows/npm-release.yml`
- `<package>/package.json`
- `CHANGE_LOG.md`
- `<package>/README.md`

Use the current upstream `main` branch as the release base.

For a Chat Components release:

1. Change only `chat-components` and the shared release files.
2. Set a stable version in `chat-components/package.json`.
3. Make sure that the version does not exist on npm.
4. Finalize the matching section under `# Chat-Components` in `CHANGE_LOG.md`.
5. Leave a new, empty `## [Unreleased]` section.
6. Update all public documentation that names the version or release process.
7. Run every component command in `docs/RELEASING.md`.
8. Open a pull request against `main`.

Do not use `workflow_dispatch` or `npm publish` for an official release.

For a Chat Widget release:

1. Search for an open pull request for the requested version.
2. Do not duplicate version, changelog, migration, or package changes from that pull request.
3. If no release pull request exists, prepare the widget changes in a new pull request.
4. Run every widget command in `docs/RELEASING.md`.
5. Use the merged release pull request commit for the official tag.

Do not create the official tag before the pull request merges.

After merge, use the correct annotated tag on the exact merge commit:

- Use `c-v<version>` for Chat Components.
- Use `w-v<version>` for Chat Widget.

Do not push that tag until the requester explicitly authorizes the release.

After the tag workflow succeeds, make sure that npm and GitHub contain identical tarballs.
