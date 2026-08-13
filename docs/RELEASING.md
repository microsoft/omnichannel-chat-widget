# Releasing the npm packages

This repository contains two independent npm packages:

| Package | Official tag | Official npm tag | GitHub Release |
| --- | --- | --- | --- |
| `@microsoft/omnichannel-chat-components` | `c-v<version>` | `latest` | Yes, starting with `c-v1.2.0` |
| `@microsoft/omnichannel-chat-widget` | `w-v<version>` | `latest` | Yes, starting with `w-v2.0.0` |

The `.github/workflows/npm-release.yml` workflow uses npm trusted publishing. It does not use an npm token.

## Publishing behavior

| Event | Package | Version | npm tag |
| --- | --- | --- | --- |
| Push to `main` | Both packages | `<base>-main.<commit>` | `latest` |
| Push of `c-v<version>` | Chat Components | Exact package version | `latest` |
| Push of `w-v<version>` | Chat Widget | Exact package version | `latest` |
| Push to `hotfix/**` | Chat Widget | Version in `package.json` | `hotfix` |

The `latest` npm tag can point to a `main` prerelease after a merge. Production applications must pin an exact stable version.

Do not use `workflow_dispatch` or `npm publish` for an official release.

## Official Chat Components release

Use this procedure for `@microsoft/omnichannel-chat-components`.

### 1. Prepare the release pull request

1. Create a branch from the current `main` branch.
2. Set `chat-components/package.json` to the stable release version.
3. Do not use a version that contains a prerelease suffix.
4. Add an empty `## [Unreleased]` section under `# Chat-Components` in `CHANGE_LOG.md`.
5. Change the prior component `Unreleased` section to `## [<version>] - YYYY-MM-DD`.
6. Use no more than one `Added`, `Changed`, `Fixed`, or `Security` section.
7. Update `chat-components/README.md` and the release information in the root `README.md`.
8. Update this document when the release process changes.

Make sure that the version does not exist on npm:

```bash
VERSION="1.2.0"
npm view "@microsoft/omnichannel-chat-components@$VERSION" version
```

An npm `E404` response means that the version is available. Any returned version is already published and cannot be reused.

Run these commands from `chat-components`:

```bash
yarn install --frozen-lockfile
yarn build
yarn test:unit
yarn test:cjs
yarn build-storybook
yarn test:visual --forceExit
```

Open a pull request against `main`. Do not create the release tag before the pull request merges.

### 2. Review the merged commit

After the pull request merges, get its merge commit:

```bash
git fetch upstream main
git log upstream/main --oneline -n 10
git show "replace-with-full-merge-commit-sha"
```

Make sure that the merge commit contains the approved version, changelog, workflow, and documentation.

### 3. Create the official tag

Create an annotated tag on the exact merge commit:

```bash
VERSION="1.2.0"
MERGE_COMMIT="replace-with-full-merge-commit-sha"
git tag -a "c-v$VERSION" "$MERGE_COMMIT" -m "Release chat-components $VERSION"
git push upstream "c-v$VERSION"
```

Do not tag the moving `main` branch name. Do not create a lightweight tag.

The workflow rejects these tags:

- A tag that does not equal `c-v${chat-components/package.json version}`.
- A tag for a package version that contains `-`.
- A tag from a fork.

### 4. Workflow result

The tag starts the `publish-chat-components` job. This job performs these actions:

1. Installs the locked dependencies.
2. Builds the package.
3. Runs the unit and CommonJS package tests.
4. Runs `npm pack --json` one time.
5. Stores the exact tarball as a workflow artifact.
6. Publishes that tarball to npm with provenance.
7. Sets the npm tag to `latest`.

After npm succeeds, the `create-chat-components-github-release` job performs these actions:

1. Downloads the same tarball artifact.
2. Reads only the matching version under `# Chat-Components` in `CHANGE_LOG.md`.
3. Uses GitHub-generated notes only when that changelog section is empty.
4. Creates the GitHub Release for the `c-v<version>` tag.
5. Attaches the exact npm tarball to the GitHub Release.

### 5. Make sure that the release is correct

Run these commands:

```bash
VERSION="1.2.0"
npm view "@microsoft/omnichannel-chat-components@$VERSION" version
npm view @microsoft/omnichannel-chat-components dist-tags --json
npm view "@microsoft/omnichannel-chat-components@$VERSION" dist.integrity
gh release view "c-v$VERSION" --repo microsoft/omnichannel-chat-widget
```

Download both copies of the package:

```bash
VERSION="1.2.0"
mkdir -p verification/github verification/npm
gh release download "c-v$VERSION" --repo microsoft/omnichannel-chat-widget --dir verification/github
npm pack "@microsoft/omnichannel-chat-components@$VERSION" --pack-destination verification/npm
sha256sum verification/github/*.tgz verification/npm/*.tgz
```

The two SHA-256 values must match. The npm package page must also show the provenance statement.

Remove the `verification` directory after the comparison.

## Official Chat Widget release

Use this procedure for `@microsoft/omnichannel-chat-widget`.

If a release pull request already exists, do not create a second version or changelog change. Add only nonconflicting automation changes.

### 1. Prepare the release pull request

1. Create a branch from the current `main` branch.
2. Set `chat-widget/package.json` to the stable release version.
3. Do not use a version that contains a prerelease suffix.
4. Add an empty `## [Unreleased]` section under `# Chat-Widget` in `CHANGE_LOG.md`.
5. Change the prior widget `Unreleased` section to `## [<version>] - YYYY-MM-DD`.
6. Use no more than one `Added`, `Changed`, `Fixed`, or `Security` section.
7. Update `chat-widget/README.md` and the release information in the root `README.md`.
8. Update migration documentation for every breaking release.

Make sure that the version does not exist on npm:

```bash
VERSION="2.0.0"
npm view "@microsoft/omnichannel-chat-widget@$VERSION" version
```

Run the commands that the pull-request workflow defines. At minimum, run these commands from `chat-widget`:

```bash
yarn install --frozen-lockfile
yarn build
yarn test:unit
if node -e 'process.exit(require("./package.json").scripts["test:cjs"] ? 0 : 1)'; then
  yarn test:cjs
fi
yarn build-storybook
yarn test:visual --forceExit
```

Open a pull request against `main`. Do not create the release tag before the pull request merges.

### 2. Create the official tag

After merge, review the exact merge commit. Then create an annotated tag on that commit:

```bash
VERSION="2.0.0"
MERGE_COMMIT="replace-with-full-merge-commit-sha"
git tag -a "w-v$VERSION" "$MERGE_COMMIT" -m "Release chat-widget $VERSION"
git push upstream "w-v$VERSION"
```

The workflow rejects a mismatched tag or a prerelease package version.

### 3. Workflow result

The `publish-chat-widget` job builds and tests the package. It packs one tarball and publishes that tarball to npm.

The `create-chat-widget-github-release` job downloads the same tarball. It reads notes only from the matching `# Chat-Widget` changelog section.

The job creates the GitHub Release and attaches the npm tarball.

### 4. Make sure that the release is correct

Run these commands:

```bash
VERSION="2.0.0"
npm view "@microsoft/omnichannel-chat-widget@$VERSION" version
npm view @microsoft/omnichannel-chat-widget dist-tags --json
npm view "@microsoft/omnichannel-chat-widget@$VERSION" dist.integrity
gh release view "w-v$VERSION" --repo microsoft/omnichannel-chat-widget
```

Download both copies of the package:

```bash
VERSION="2.0.0"
mkdir -p verification/github verification/npm
gh release download "w-v$VERSION" --repo microsoft/omnichannel-chat-widget --dir verification/github
npm pack "@microsoft/omnichannel-chat-widget@$VERSION" --pack-destination verification/npm
sha256sum verification/github/*.tgz verification/npm/*.tgz
```

The two SHA-256 values must match. Remove the `verification` directory after the comparison.

## Failure recovery

If a test or build fails, correct the error in a new pull request. Then create a new tag after that pull request merges.

If npm succeeds and the GitHub Release fails, rerun only the failed jobs. The rerun uses the stored tarball.

If npm contains the version, do not publish it again. Increment the package version and prepare a new release.

Do not force-move an official tag. Ask the repository owners before you delete an invalid remote tag.

## Instructions for release agents

Use this file as the source for the release procedure. Read the workflow and package files before you change them.

Prepare the release through a pull request. Do not create or push the official tag until the pull request merges.

If another release pull request exists, do not duplicate its package version, changelog, or migration changes.

After merge, stop before the tag push unless the requester explicitly authorizes the release.

Never use a manual npm publish as a substitute for the official tag workflow.
