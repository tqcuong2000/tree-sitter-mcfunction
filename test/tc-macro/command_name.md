# command_name.md

### Input command
```mcfunction
$$(cmd) arg1
$$(dynamic_command)
```

### Expected output
```scheme
(source_file
  (macro_command
    (command_name)
    (keyword))
  (macro_command
    (command_name)))
```

### Actual output
```scheme
(source_file
  (macro_command
    (command_name)
    (keyword))
  (macro_command
    (command_name)))
```

### Status: PASS
