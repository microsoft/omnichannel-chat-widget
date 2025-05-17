const hasChangelog = danger.git.modified_files.includes("CHANGE_LOG.md")

if (!hasChangelog) {
  warn("Please add a changelog entry for your changes.")
}