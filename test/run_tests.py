import glob
import os
import subprocess
from pathlib import Path

import yaml


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

    temp_file = "temp_test.mcfunction"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(code)

    result = subprocess.run(
        ["npx", "tree-sitter", "parse", temp_file],
        capture_output=True,
        text=True,
        shell=True,
    )
    actual = result.stdout + result.stderr

    # Fuzzy match: all non-empty lines in expected should be in actual
    clean_expected = expected.replace("...", "")
    expected_match_lines = [
        line.strip() for line in clean_expected.split("\n") if line.strip()
    ]
    passed = True
    for line in expected_match_lines:
        if line not in actual:
            print(f"FAILED TO FIND LINE: '{line}'")
            # print(f"ACTUAL WAS: '{actual}'")
            passed = False
            break

    os.remove(temp_file)
    return passed, actual, expected


script_path = Path(__file__).resolve()
script_dir = script_path.parent

test_files = glob.glob(f"{script_dir}/tc-*/*.yaml")
print(f"Discovered {len(test_files)} tests: {test_files}")

summary_data = {
    "summary": {"total": len(test_files), "passed": 0, "failed": 0},
    "test_cases": [],
}

if not test_files:
    print("No test files found!")
    exit(1)

for i, test_file in enumerate(test_files):
    print(f"Running {test_file}...")
    try:
        passed, actual, expected = run_test(test_file)

        test_case = {
            "id": i + 1,
            "path": test_file.replace("\\", "/"),
            "status": "PASS" if passed else "FAIL",
        }

        if passed:
            summary_data["summary"]["passed"] += 1
        else:
            summary_data["summary"]["failed"] += 1
            test_case["expected_result"] = expected
            test_case["actual_result"] = actual

        summary_data["test_cases"].append(test_case)

    except Exception as e:
        print(f"Error running {test_file}: {e}")
        summary_data["summary"]["failed"] += 1
        summary_data["test_cases"].append(
            {
                "id": i + 1,
                "path": test_file.replace("\\", "/"),
                "status": "FAIL",
                "error": str(e),
            }
        )

print(f"Total: {summary_data['summary']['total']}")
print(f"Passed: {summary_data['summary']['passed']}")
print(f"Failed: {summary_data['summary']['failed']}")

with open("test-summary.yaml", "w", encoding="utf-8") as f:
    yaml.dump(summary_data, f, sort_keys=False, indent=2, width=1000)
