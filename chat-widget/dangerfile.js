// check if CHANGE_LOG.md is modified
const hasChangelog = danger.git.modified_files.includes("CHANGE_LOG.md")

// right now just checking for changelog, we could add more checks later
if (!hasChangelog) {


  
  error("Please add a changelog entry for your changes.");
}