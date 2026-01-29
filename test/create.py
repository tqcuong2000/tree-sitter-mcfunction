import os
import subprocess
import re
import sys
from test_utils import TestCase

def strip_ranges(text):
    return re.sub(r"\s*\[\d+, \d+\]\s*-\s*\[\d+, \d+\]", "", text)

def main():
    # 1. Ask for test case group
    group_name = input("Enter test case group name (e.g. arguments): ").strip()
    if not group_name:
        print("Group name cannot be empty.")
        return

    # 2. Ask for test case name
    test_name = input("Enter test case name (e.g. my_test): ").strip()
    if not test_name:
        print("Test name cannot be empty.")
        return

    # Construct paths
    group_dir = os.path.join("test", f"tc-{group_name}")
    file_name = f"{test_name}.md"
    file_path = os.path.join(group_dir, file_name)

    # 3. Check for existing file
    if os.path.exists(file_path):
        confirm = input(f"File '{file_path}' already exists. Overwrite? (y/N): ").strip().lower()
        if confirm != 'y':
            print("Aborted.")
            return

    # 4. Read content from test/test.mcfunction
    source_path = "test/test.mcfunction"
    if not os.path.exists(source_path):
        # Try to create it if it doesn't exist to be helpful
        print(f"Error: Source file '{source_path}' not found.")
        print(f"Please create '{source_path}' and put your mcfunction command there.")
        return

    with open(source_path, "r", encoding="utf-8") as f:
        command_content = f.read().strip()
    
    if not command_content:
        print(f"Error: Source file '{source_path}' is empty.")
        return

    # 5. Parse using tree-sitter to get expected output
    try:
        result = subprocess.run(
            ["npx", "tree-sitter", "parse", source_path],
            capture_output=True,
            text=True,
            shell=True,
            check=False
        )
        parsed_output = result.stdout
        if result.stderr:
            parsed_output += "\n" + result.stderr
            
        if result.returncode != 0:
            print(f"Warning: tree-sitter parse returned exit code {result.returncode}")
    except Exception as e:
        print("Error executing subprocess:")
        print(str(e))
        return

    # 6. Transform output (remove ranges and stats)
    # Filter out stats lines
    lines = parsed_output.splitlines()
    clean_lines = [line for line in lines if not ("Parse:" in line and "ms" in line)]
    clean_output = strip_ranges("\n".join(clean_lines)).strip()

    # 7. Create directory if not exists
    os.makedirs(group_dir, exist_ok=True)

    # 8. Create and Save TestCase
    tc = TestCase(
        file_path=file_path,
        name=f"{test_name}.yaml", # Keeping the old naming convention for the title if desired, or just use test_name
        command=command_content,
        expected_output=clean_output,
        status="PASS"
    )
    
    tc.save()

    print(f"Test case created successfully at '{file_path}'")

if __name__ == "__main__":
    main()
