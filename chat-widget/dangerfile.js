import { fail } from "danger";

// check if CHANGE_LOG.md is modified, not added
// eslint-disable-next-line no-undef
const hasChangelog = danger.git.modified_files.includes("CHANGE_LOG.md");
// eslint-disable-next-line no-undef
const isEngineeringEnhancement = (danger.github.pr.title).includes("[eng]");



// eslint-disable-next-line no-undef


// right now just checking for changelog, we could add more checks later
if (!hasChangelog && !isEngineeringEnhancement) {
    printErrorMessage("Please add a changelog entry for your changes.", "CHANGE_LOG_VALIDATION");
}

function printErrorMessage(message , rule) {
    console.log(`********  ERROR : ${rule}  ***************`);
    console.log(message);
    fail(message);
}
