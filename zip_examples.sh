#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR"
OUTPUT_DIR="$SCRIPT_DIR/zip_output"

mkdir -p "$OUTPUT_DIR"

find "$EXAMPLES_DIR" -maxdepth 3 -name "*.toml" | while read -r toml_file; do
    project_dir=$(dirname "$toml_file")
    project_name=$(basename "$project_dir")

    if [[ "$project_dir" == *"bofs_project"* ]]; then
        parent_name=$(basename "$(dirname "$project_dir")")
        project_name="${parent_name}_bofs_project"
    fi

    zip_name="${project_name}.zip"
    zip_path="$OUTPUT_DIR/$zip_name"

    echo "Zipping: $project_dir -> $zip_path"

    (cd "$project_dir" && zip -r "$zip_path" . -x "*.log" "cached_results.json" "*.db" -x "*/cached_results.json" -x "*/.*")

    echo "Created: $zip_path"
done

echo ""
echo "Done! Created $(ls -1 "$OUTPUT_DIR"/*.zip 2>/dev/null | wc -l) zip files in $OUTPUT_DIR/"