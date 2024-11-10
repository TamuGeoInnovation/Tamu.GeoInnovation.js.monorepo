#!/bin/bash

# Define the directory containing the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Environment variable defining the location of the files to process
# Use SCRIPt_DIR as default value
FILES_DIR="${FILES_DIR:-$SCRIPT_DIR}"

# Function to replace placeholders in a file
replace_placeholders() {
  local file="$1"
  echo "Processing file: $file"

  # Read the content of the file
  content=$(<"$file")

  # Get the file extension
  extension="${file##*.}"

  # Check if the file is a .html or .js file
  if [ "$extension" == "html" ] || [ "$extension" == "js" ]; then
    # Get all unique placeholder patterns in the file
    placeholders=$(echo "$content" | grep -oE '___[A-Za-z0-9_]+___' | sort -u)

    # Iterate through placeholders and replace them
    for placeholder in $placeholders; do
      var_name=$(echo "$placeholder" | sed 's/___\(.*\)___/\1/')
      var_value="${!var_name}"
      if [ -n "$var_value" ]; then
        content=$(echo "$content" | sed "s#$(printf '%s' "$placeholder" | sed 's/[\.*^$/]/\\&/g')#$var_value#g")
      fi
    done

    # Write the updated content back to the file
    printf '%s' "$content" >"$file"
  else
    echo "Skipping non-.html and non-.js file: $file"
  fi
}

# Iterate through files and substitute tokens
for file in "$FILES_DIR"/*; do
  if [ -f "$file" ]; then
    replace_placeholders "$file"
  fi
done
