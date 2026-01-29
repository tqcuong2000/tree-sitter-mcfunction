import os
import glob
import subprocess
import re
from test_utils import TestCaseManager

def strip_ranges(text):
    """Removes patterns like [0, 0] - [1, 5]"""
    return re.sub(r"\s*\[\d+, \d+\]\s*-\s*\[\d+, \d+\]", "", text)

def run_tests():
    # 1. Look for test/tc-**/**.md files
    search_path = os.path.join("test", "tc-*", "**", "*.md")
    test_files = glob.glob(search_path, recursive=True)
    
    if not test_files:
        print("No test cases found.")
        return

    results = {"PASS": 0, "FAIL": 0, "SKIP": 0}
    failed_tests = []

    print(f"Running {len(test_files)} tests...")

    for file_path in test_files:
        try:
            # 2. Load the test case
            tc = TestCaseManager.load(file_path)
            
            # Use a temp file to parse
            temp_file = "temp_test_run.mcfunction"
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
                if not tc.expected_output.strip():
                    tc.status = "SKIP"
                elif tc.actual_output == tc.expected_output.strip():
                    tc.status = "PASS"
                else:
                    tc.status = "FAIL"
                    failed_tests.append(file_path)
                
                # Update results count
                results[tc.status] += 1
                
                # Save the updated test case
                tc.save()
                
            finally:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    # Summary Output
    print("\n" + "="*30)
    print("TEST SUMMARY")
    print("="*30)
    print(f"TOTAL: {len(test_files)}")
    print(f"PASS:  {results['PASS']}")
    print(f"FAIL:  {results['FAIL']}")
    print(f"SKIP:  {results['SKIP']}")
    print("="*30)

    if failed_tests:
        print("\nFAILED TESTS:")
        for ft in failed_tests:
            print(f" - {ft}")
        print("\nCheck the 'Actual output' and 'Status' fields in these files to debug.")
    else:
        print("\nAll applicable tests passed!")

if __name__ == "__main__":
    run_tests()
