import subprocess
import re
import os
from test_utils import TestCaseManager

def strip_ranges(text):
    # Removes patterns like [0, 0] - [1, 5]
    return re.sub(r"\s*\[\d+, \d+\]\s*-\s*\[\d+, \d+\]", "", text)

def update_test_expected(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} does not exist.")
        return

    # 1. Load the test case
    tc = TestCaseManager.load(file_path)
    print(f"Loaded: {tc.file_path}")
    print(f"Command: {tc.command}")

    # 2. Run the command using tree-sitter parse
    # Create a temporary file to parse
    temp_file = "temp_parse.mcfunction"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(tc.command)

    try:
        result = subprocess.run(
            ["npx", "tree-sitter", "parse", temp_file],
            capture_output=True,
            text=True,
            shell=True
        )
        
        # Output is usually in stdout, but errors might be in stderr
        raw_output = result.stdout
        if result.stderr:
            raw_output += "\n" + result.stderr

        # 3. Process the result: remove ranges
        clean_output = strip_ranges(raw_output).strip()
        
        # 4. Update the test case
        tc.expected_output = clean_output
        tc.actual_output = "" # Clear actual output when updating expected
        tc.status = "PASS" 
        
        # 5. Save the test case
        tc.save()
        print(f"Successfully updated expected output for {file_path}")

    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

if __name__ == "__main__":
    import glob
    
    # Path to search for markdown test files
    search_path = os.path.join("test", "tc-*", "**", "*.md")
    test_files = glob.glob(search_path, recursive=True)
    
    print(f"Found {len(test_files)} test files to update.")
    
    for file_path in test_files:
        try:
            update_test_expected(file_path)
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    print("\nAll files processed.")
