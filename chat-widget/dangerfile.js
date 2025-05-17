import { fail } from "danger";

// check if CHANGE_LOG.md is modified, not added
// eslint-disable-next-line no-undef
const hasChangelog = danger.git.modified_files.includes("CHANGE_LOG.md");

// right now just checking for changelog, we could add more checks later
if (!hasChangelog) {
    fail("Please add a changelog entry for your changes.");
}