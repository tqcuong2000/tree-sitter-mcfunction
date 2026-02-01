import os
import sys
import argparse
from test_utils import TestCase

def main():
    parser = argparse.ArgumentParser(description="Create a new test case for tree-sitter-mcfunction.")
    parser.add_argument("--file", help="Path to a file containing the mcfunction command.")
    args = parser.parse_args()

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

    # Construct paths
    group_dir = os.path.join("test", f"tc-{group_name}")
    file_name = f"{test_name}.md"
    file_path = os.path.join(group_dir, file_name)

    # 3. Check for existing file
    if os.path.exists(file_path):
        confirm = input(f"File '{file_path}' already exists. Overwrite? (y/N): ").strip().lower()
        if confirm != 'y':
            print("Aborted.")
            sys.exit(0)

    # 4. Read command content
    if args.file:
        if not os.path.exists(args.file):
            print(f"Error: File '{args.file}' not found.")
            sys.exit(1)
        with open(args.file, "r", encoding="utf-8") as f:
            command_content = f.read().strip()
    else:
        print("Enter mcfunction command.")
        print("To finish: Enter a single '.' on a new line or press Ctrl+Z (Windows) then Enter.")
        lines = []
        while True:
            try:
                line = input()
                if line.strip() == ".":
                    break
                lines.append(line)
            except EOFError:
                break
        command_content = "\n".join(lines).strip()

    if not command_content:
        print("Error: Command content cannot be empty.")
        sys.exit(1)

    # 5. Create directory if not exists
    os.makedirs(group_dir, exist_ok=True)

    # 6. Create and Save TestCase (Expected output is empty)
    tc = TestCase(
        file_path=file_path,
        name=f"{test_name}.md",
        command=command_content,
        expected_output="",
        status="SKIP"
    )
    
    tc.save()

    print(f"Test case created successfully at '{file_path}'")
    print("\nIMPORTANT: The 'Expected output' is currently empty.")
    print(f"To generate it, run: python test/update_expected.py")

if __name__ == "__main__":
    main()
