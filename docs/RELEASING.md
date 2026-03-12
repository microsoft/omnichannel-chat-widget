# Releasing omnichannel-chat-widget Packages

This monorepo contains two npm packages. Both use **GitHub Actions OIDC trusted publishing** — no npm tokens or secrets are needed.

## Dev Versions (Automatic)

Every push to `main` automatically publishes dev versions for **both** packages:

```
@microsoft/omnichannel-chat-widget@1.8.4-main.abc1234
@microsoft/omnichannel-chat-components@1.1.17-main.abc1234
```

- **npm tag**: `main` (not `latest`)
- **Install**: `npm install @microsoft/omnichannel-chat-widget@main`
- **Triggered by**: Any merge/push to the `main` branch

## Release Versions (Manual — Tag Push)

Each package has its own tag prefix:

| Package | Tag prefix | Example |
|---------|-----------|---------|
| `@microsoft/omnichannel-chat-widget` | `w-v` | `w-v1.9.0` |
| `@microsoft/omnichannel-chat-components` | `c-v` | `c-v1.2.0` |

### Releasing chat-widget

1. **Update the version** in `chat-widget/package.json`

2. **Update the changelog** in `CHANGE_LOG.md` (under the `# Chat-Widget` section)

3. **Commit and push** to main:
   ```bash
   git add chat-widget/package.json CHANGE_LOG.md
   git commit -m "Bump chat-widget to 1.9.0"
   git push
   ```

4. **Create and push a tag**:
   ```bash
   git tag w-v1.9.0
   git push origin w-v1.9.0
   ```

### Releasing chat-components

1. **Update the version** in `chat-components/package.json`

2. **Update the changelog** in `CHANGE_LOG.md` (under the `# Chat-Components` section)

3. **Commit and push** to main:
   ```bash
   git add chat-components/package.json CHANGE_LOG.md
   git commit -m "Bump chat-components to 1.2.0"
   git push
   ```

4. **Create and push a tag**:
   ```bash
   git tag c-v1.2.0
   git push origin c-v1.2.0
   ```

## Verifying a Publish

```bash
# Check latest release versions
npm view @microsoft/omnichannel-chat-widget version
npm view @microsoft/omnichannel-chat-components version

# Check all dist-tags
npm view @microsoft/omnichannel-chat-widget dist-tags
npm view @microsoft/omnichannel-chat-components dist-tags

# Check dev versions
npm view @microsoft/omnichannel-chat-widget@main version
npm view @microsoft/omnichannel-chat-components@main version
```

## Tag Format Summary

| Tag pattern | Package | npm dist-tag |
|-------------|---------|--------------|
| `w-v*` (e.g. `w-v1.9.0`) | `@microsoft/omnichannel-chat-widget` | `latest` |
| `c-v*` (e.g. `c-v1.2.0`) | `@microsoft/omnichannel-chat-components` | `latest` |
| Push to `main` | Both packages | `main` |

## Hotfix Versions

For urgent fixes that need to ship against an older release (not `main`), use a hotfix branch:

1. **Create a hotfix branch** from the target commit:
   ```bash
   git checkout -b hotfix/<name> <base-commit-sha>
   ```

2. **Set the version** in `chat-widget/package.json` using prerelease format:
   ```
   "version": "1.8.4-hotfix.<name>.1"
   ```

3. **Update dependencies** (e.g., a hotfix SDK version) in `chat-widget/package.json`.

4. **Commit and push** the hotfix branch to the upstream repo:
   ```bash
   git push upstream hotfix/<name>
   ```

5. The `npm-release.yml` workflow triggers on `hotfix/**` branches. On hotfix branches, `version-from-git` is **skipped** — the version in `package.json` is used as-is.

6. **Verify the publish**:
   ```bash
   npm view @microsoft/omnichannel-chat-widget@1.8.4-hotfix.<name>.1
   ```

### Hotfix Version Naming Convention

```
<base-version>-hotfix.<descriptor>.<iteration>
```

- `base-version`: The version the hotfix is based on (e.g., `1.8.4`)
- `descriptor`: Short kebab-case name for the fix (e.g., `enau`)
- `iteration`: Increment if multiple attempts are needed (start at `1`)

Example: `1.8.4-hotfix.enau.1`

## Important Notes

- **Burned versions**: If a publish fails, that version number is consumed by npm. You must bump to the next version.
- **Trusted publisher**: Configured on npmjs.com for both packages to trust `microsoft/omnichannel-chat-widget` → `npm-release.yml`.
- **Provenance**: All publishes include a signed provenance statement verifiable on npmjs.com.
- **Independent releases**: The two packages are versioned and released independently. Tagging `w-v*` only publishes chat-widget, `c-v*` only publishes chat-components.
