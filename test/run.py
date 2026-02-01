import os
import glob
import subprocess
import re
import argparse
import sys
from test_utils import TestCaseManager

import difflib

def strip_ranges(text):
    """Removes patterns like [0, 0] - [1, 5]"""
    return re.sub(r"\s*\[\d+, \d+\]\s*-\s*\[\d+, \d+\]", "", text)

def run_tests(specific_tc=None):
    if specific_tc:
        if not os.path.exists(specific_tc):
            print(f"Error: Test case file '{specific_tc}' not found.")
            sys.exit(1)
        if not os.path.isfile(specific_tc):
            print(f"Error: '{specific_tc}' is not a file.")
            sys.exit(1)
        test_files = [specific_tc]
    else:
        # 1. Look for test/tc-**/**.md files
        search_path = os.path.join("test", "tc-*", "**", "*.md")
        test_files = glob.glob(search_path, recursive=True)
    
    if not test_files:
        print("No test cases found.")
        return 0

    results = {"PASS": 0, "FAIL": 0, "SKIP": 0}
    failed_tests = []
    skipped_tests = []

    if specific_tc:
        print(f"Running single test: {specific_tc}")
    else:
        print(f"Running {len(test_files)} tests...")

    for file_path in test_files:
        try:
            # 2. Load the test case
            tc = TestCaseManager.load(file_path)
            
            # Use a temp file to parse
            temp_file = f"temp_test_run_{os.getpid()}.mcfunction"
            with open(temp_file, "w", encoding="utf-8") as f:
                f.write(tc.command)

            # 3. Run the command and store result
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
                
                # Process the result (remove node ranges)
                clean_actual = strip_ranges(raw_output).strip()
                
                # Filter out tree-sitter performance stats if they exist
                clean_actual = "\n".join([line for line in clean_actual.splitlines() 
                                         if not ("Parse:" in line and "ms" in line)])
                
                # Store in actual output
                tc.actual_output = clean_actual.strip()
                
                # 4. Compare with expected output
                # Use strict comparison
                expected_clean = tc.expected_output.strip()
                actual_clean = tc.actual_output
                
                if not expected_clean:
                    tc.status = "SKIP"
                    tc.different = ""
                    skipped_tests.append(file_path)
                elif actual_clean == expected_clean:
                    tc.status = "PASS"
                    tc.different = ""
                else:
                    tc.status = "FAIL"
                    # Generate a diff
                    diff = difflib.unified_diff(
                        expected_clean.splitlines(keepends=True),
                        actual_clean.splitlines(keepends=True),
                        fromfile="Expected",
                        tofile="Actual",
                        lineterm=""
                    )
                    tc.different = "".join(diff)
                    failed_tests.append(file_path)
                
                # Update results count
                results[tc.status] += 1
                
                # Save the updated test case
                tc.save()
                
                if specific_tc:
                    print(f"Status: {tc.status}")
                    if tc.status == "FAIL":
                        print("\nDiff (Actual vs Expected):")
                        print("-" * 20)
                        print(tc.different)
                        print("-" * 20)
                
            finally:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    # Summary Output
    if not specific_tc:
        print("\n" + "="*30)
        print("TEST SUMMARY")
        print("="*30)
        print(f"TOTAL: {len(test_files)}")
        print(f"PASS:  {results['PASS']}")
        print(f"FAIL:  {results['FAIL']}")
        print(f"SKIP:  {results['SKIP']}")
        print("="*30)

        if skipped_tests:
            print("\nSKIPPED TESTS (no expected output):")
            for st in skipped_tests:
                print(f" - {st}")

        if failed_tests:
            print("\nFAILED TESTS:")
            for ft in failed_tests:
                print(f" - {ft}")
            print("\nCheck the 'Actual output' and 'Status' fields in these files to debug.")
        elif results['PASS'] + results['SKIP'] == len(test_files):
            print("\nNo failures detected.")

    return results['FAIL']

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run tree-sitter-mcfunction tests.")
    parser.add_argument("--tc", action="store_true", help="Run a single test case (prompts for group and name).")
    args = parser.parse_args()
    
    target_path = None
    if args.tc:
        group_name = input("Enter test case group name (e.g. arguments): ").strip()
        if not group_name:
            print("Error: Group name cannot be empty.")
            sys.exit(1)

        test_name = input("Enter test case name (e.g. my_test): ").strip()
        if not test_name:
            print("Error: Test name cannot be empty.")
            sys.exit(1)

        if not test_name.endswith(".md"):
            test_name += ".md"
        
        target_path = os.path.join("test", f"tc-{group_name}", test_name)

    fail_count = run_tests(specific_tc=target_path)
    sys.exit(1 if fail_count > 0 else 0)
