#!/bin/bash

OUTPUT_FILE="combined_code.txt"

# Empty the output file if it already exists
> "$OUTPUT_FILE"

# Find all relevant code files and append them
# You can add or remove extensions in the name flags below
find . -maxdepth 1 -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.py" -o -name "*.md" \) | while read -r file; do
    # Remove the leading './' from the file path for cleaner reading
    clean_name="${file#./}"
    
    echo "========================================" >> "$OUTPUT_FILE"
    echo "File: $clean_name" >> "$OUTPUT_FILE"
    echo "========================================" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo -e "\n\n" >> "$OUTPUT_FILE"
done

echo "Success! All code has been written to $OUTPUT_FILE"
