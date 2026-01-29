import glob
import os
import subprocess
import re


def strip_ranges(text):
    return re.sub(r"\s*\[\d+, \d+\]\s*-\s*\[\d+, \d+\]", "", text)


def run_test(path):
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    code_lines = []
    expected_lines = []
    mode = None

    for line in lines:
        if line.startswith("command:"):
            mode = "code"
            # Check if there is something on the same line after 'command:'
            rest = line[len("command:") :].strip()
            if rest:
                if rest.startswith('"') and rest.endswith('"'):
                    rest = rest[1:-1].replace("\\\\", "\\")  # basic unescape
                code_lines.append(rest)
            continue
        elif line.startswith("expected:"):
            mode = "expected"
            rest = line[len("expected:") :].strip()
            if rest:
                if rest.startswith('"') and rest.endswith('"'):
                    rest = rest[1:-1]
                expected_lines.append(rest)
            continue

        if mode == "code":
            # Strip initial indentation (usually 2 spaces)
            l = line.rstrip()
            if l.startswith("  "):
                code_lines.append(l[2:])
            elif l.strip() == "":
                code_lines.append("")
        elif mode == "expected":
            l = line.rstrip()
            if l.startswith("  "):
                expected_lines.append(l[2:])
            elif l.strip() == "":
                expected_lines.append("")

    code = "\n".join(code_lines).strip()
    expected = "\n".join(expected_lines).strip()

    temp_file = "test/temp_test.mcfunction"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(code)

    result = subprocess.run(
        ["npx", "tree-sitter", "parse", temp_file],
        capture_output=True,
        text=True,
        shell=True,
    )
    actual = result.stdout + result.stderr

    # Strip ranges from actual output for comparison
    clean_actual = strip_ranges(actual)

    # Fuzzy match: all non-empty lines in expected should be in actual
    clean_expected = expected.replace("...", "")
    expected_match_lines = [
        line.strip() for line in clean_expected.split("\n") if line.strip()
    ]
    passed = True
    failure_details = []
    for line in expected_match_lines:
        # Strip ranges from expected line for comparison
        clean_line = strip_ranges(line)
        if clean_line not in clean_actual:
            failure_details.append(f"MISSING: '{clean_line}' (Original: '{line}')")
            passed = False
            # Don't break immediately to show all missing lines? 
            # Original logic broke immediately. I'll stick to original logic but capture validation msg.
            break

    os.remove(temp_file)
    return passed, failure_details


test_files = glob.glob("test/tc-*/*.yaml")

if not test_files:
    print("No test files found!")
    exit(1)

total = len(test_files)
passed_count = 0
failed_cases = []

print(f"Running {total} tests...")

for i, test_file in enumerate(test_files):
    # Print progress inline? Or just run silently and print final results?
    # Agent friendly: print failures clearly.
    try:
        passed, failure_details = run_test(test_file)

        if passed:
            passed_count += 1
            # print(f"[PASS] {test_file}") # Optional: reduce noise
        else:
            failed_cases.append((test_file, failure_details))
            print(f"[FAIL] {test_file}")
            for detail in failure_details:
                print(f"  - {detail}")

    except Exception as e:
        failed_cases.append((test_file, [str(e)]))
        print(f"[ERROR] {test_file}: {e}")

print("\n" + "="*30)
print(f"SUMMARY: {passed_count}/{total} passed.")
print("="*30)

if failed_cases:
    print("\nFAILED TESTS:")
    for path, errors in failed_cases:
        print(f"- {path}")
    exit(1)
else:
    print("\nAll tests passed!")
    exit(0)
