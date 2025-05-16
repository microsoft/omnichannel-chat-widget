const hasChangelog = danger.git.modified_files.includes("CHANGE_LOG.md")

if (!hasChangelog) {
  error("Please add a changelog entry for your changes.")
}