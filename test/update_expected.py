import subprocess
import re
import os
import sys
from test_utils import TestCaseManager

def strip_ranges(text):
    # Removes patterns like [0, 0] - [1, 5]
    return re.sub(r"\s*\[\d+, \d+\]\s*-\s*\[\d+, \d+\]", "", text)

def update_test_expected(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} does not exist.")
        sys.exit(1)

    if not os.path.isfile(file_path):
        print(f"Error: {file_path} is not a file.")
        sys.exit(1)

    # 1. Load the test case
    tc = TestCaseManager.load(file_path)
    print(f"Loaded: {tc.file_path}")
    print(f"Command: {tc.command}")

    # 2. Run the command using tree-sitter parse
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
        
        raw_output = result.stdout
        if result.stderr:
            raw_output += "\n" + result.stderr

        # 3. Process the result: remove ranges and performance stats
        clean_output = strip_ranges(raw_output).strip()
        clean_output = "\n".join([line for line in clean_output.splitlines() 
                                 if not ("Parse:" in line and "ms" in line)])
        
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
    # 1. Ask for test case group
    group_name = input("Enter test case group name (e.g. arguments): ").strip()
    if not group_name:
        print("Error: Group name cannot be empty.")
        sys.exit(1)

    # 2. Ask for test case name
    test_name = input("Enter test case name (e.g. my_test): ").strip()
    if not test_name:
        print("Error: Test name cannot be empty.")
        sys.exit(1)

    # Construct path
    if not test_name.endswith(".md"):
        test_name += ".md"
    
    target_path = os.path.join("test", f"tc-{group_name}", test_name)
    
    update_test_expected(target_path)
    sys.exit(0)
