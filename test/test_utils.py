import re
import os

class TestCase:
    def __init__(self, file_path, name, command, expected_output=None, actual_output=None, different=None, status="SKIP"):
        self.file_path = file_path
        self.name = name
        self.command = command
        self.expected_output = expected_output or ""
        self.actual_output = actual_output or ""
        self.different = different or ""
        self.status = status

    def save(self):
        """Saves the test case back to the markdown file."""
        with open(self.file_path, 'w', encoding='utf-8') as f:
            f.write(self.to_markdown())

    def to_markdown(self):
        """Converts the test case to markdown format."""
        # Ensure outputs are wrapped in code blocks if not empty
        expected = self.expected_output.strip()
        actual = self.actual_output.strip()
        diff = self.different.strip()

        md = f"""# {self.name}

### Input command
```mcfunction
{self.command.strip()}
```

### Expected output
```scheme
{expected}
```

### Actual output
```scheme
{actual}
```
"""
        if diff:
            md += f"""
### Different
```text
{diff}
```
"""
        md += f"""
### Status: {self.status}
"""
        return md

class TestCaseManager:
    @staticmethod
    def load(file_path):
        """Loads a TestCase from a markdown file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        name_match = re.match(r"#\s+(.*)", content)
        name = name_match.group(1) if name_match else os.path.basename(file_path)

        # Extract command
        # Matches content between ```mcfunction and ```
        command_match = re.search(r"```mcfunction\s+(.*?)\s+```", content, re.DOTALL)
        command = command_match.group(1) if command_match else ""

        # Extract other sections using a more robust split or regex
        # We look for the headers and take everything until the next header or EOF
        
        def extract_section(header_pattern, text):
            # Modified to avoid capturing the Status line if it's the last thing
            # We look for the header, then any whitespace, then capture until we see 
            # either a newline followed by another header (### ) or the special ### Status line
            # or the end of the string.
            pattern = header_pattern + r"\s*(.*?)(?=\n### |$)"
            match = re.search(pattern, text, re.DOTALL)
            if match:
                content = match.group(1).strip()
                # Remove wrapping code blocks if present
                if content.startswith("```") and content.endswith("```"):
                    lines = content.splitlines()
                    if len(lines) >= 2:
                        content = "\n".join(lines[1:-1])
                    else:
                        content = "" 
                return content
            return ""

        expected_output = extract_section(r"### Expected output", content)
        actual_output = extract_section(r"### Actual output", content)
        different = extract_section(r"### Different", content)
        
        # Status usually looks like "### Status: PASS"
        status_match = re.search(r"### Status:\s*(\S+)", content)
        status = status_match.group(1).strip() if status_match else "SKIP"

        return TestCase(
            file_path=file_path,
            name=name,
            command=command,
            expected_output=expected_output,
            actual_output=actual_output,
            different=different,
            status=status
        )

# Example usage
if __name__ == "__main__":
    import glob
    files = glob.glob(r"test/tc-*/*.md")
    if files:
        print(f"Loading {files[0]}...")
        tc = TestCaseManager.load(files[0])
        print(f"Command: {tc.command}")
        print(f"Status: {tc.status}")
