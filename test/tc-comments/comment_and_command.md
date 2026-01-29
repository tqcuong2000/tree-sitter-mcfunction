# comment_and_command.yaml

### Command to run
```mcfunction
# This is a comment
say "this is a command"
```

### Expected output
```
(source_file
  (comment_line
    (comment_normal
      tag: (comment_normal_tag)
      content: (comment_content)))
  (command
    (command_name)
    (string)))
```

### Actual output
```
(source_file
  (comment_line
    (comment_normal
      tag: (comment_normal_tag)
      content: (comment_content)))
  (command
    (command_name)
    (string)))
```

### Status: PASS
