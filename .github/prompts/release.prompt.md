---
mode: 'agent'
description: 'Create a new Release of the Omnichannel Chat Widget'
---

Your goals is to create a new release of the Omnichannel Chat Widget and ensure that all necessary actions are performed for the successfull release of new omnichannel chat widget version.
Release is created by the .github/workflows/chat-widget-release.yml file which is setted up as a github action.

The workflow should perform the following steps:
    Prompt the user to input the new prerelease version (e.g. 1.8.2-0).
    Create and checkout a new branch named bump-<prerelease version>.
    In package.json, update the current version by removing the prerelease tag (e.g., 1.11.5-0 → 1.11.5).
    Update CHANGELOG.md:
    Replace the [Unreleased] section with the new version and current date.
    Add a new section at the top for the new version.
    Commit the changes with the message: Release version - <version from package.json>.
    Confirm with the user that the changes are correct and ask for permission to proceed.
    Create a new Git tag with the release version (e.g., w-v1.11.5) and push it to the repository.
    Update package.json to the new prerelease version (e.g., 1.11.6-0).
    Add a new [Unreleased] section in CHANGELOG.md for the new prerelease version.
    Commit the changes with the message: Bump version to <new prerelease version>.
    Push the new branch to the remote repository.

For reference, you can follow the changes in the commit "910ae7185a9481297fcb4c7986f16cdf5992356f" which contains a detailed steps of the release process.