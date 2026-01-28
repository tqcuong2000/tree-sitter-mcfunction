import os
import subprocess
import re
import sys

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
    file_name = f"{test_name}.yaml"
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
        print(f"Error: Source file '{source_path}' not found.")
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
        parsed_output = result.stdout + result.stderr
        if result.returncode != 0:
            print(f"Warning: tree-sitter parse returned exit code {result.returncode}")
    except Exception as e:
        print("Error executing subprocess:")
        print(str(e))
        return

    # 6. Transform output (remove ranges)
    # Filter out stats lines
    lines = parsed_output.splitlines()
    clean_lines = [line for line in lines if not ("Parse:" in line and "ms" in line)]
    clean_output = strip_ranges("\n".join(clean_lines))

    # 7. Create directory if not exists
    os.makedirs(group_dir, exist_ok=True)

    # 8. Write to YAML file
    # We construct the yaml manually to ensure format control
    # Indentation is important for YAML
    
    # Indent command content with 2 spaces
    indented_command = "\n".join(["  " + line for line in command_content.splitlines()])
    
    # Indent expected content with 2 spaces
    indented_expected = "\n".join(["  " + line for line in clean_output.strip().splitlines()])

    yaml_content = f"""command:
{indented_command}

expected:
{indented_expected}
"""

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(yaml_content)

    print(f"Test case created successfully at '{file_path}'")

if __name__ == "__main__":
    main()
