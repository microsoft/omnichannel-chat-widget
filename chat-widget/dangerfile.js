import { fail } from "danger";

// check if CHANGE_LOG.md is modified, not added
// eslint-disable-next-line no-undef
const hasChangelog = danger.git.modified_files.includes("CHANGE_LOG.md");
// eslint-disable-next-line no-undef
const isEngineeringEnhancement = (danger.github.pr.title).includes("[eng]");

console.log("hasChangelog", hasChangelog);
console.log("isEngineeringEnhancement", isEngineeringEnhancement);
// eslint-disable-next-line no-undef
console.log("modified_files", danger?.github?.pr?.title);

// right now just checking for changelog, we could add more checks later
if (!hasChangelog && !isEngineeringEnhancement) {
    fail("Please add a changelog entry for your changes.");
}