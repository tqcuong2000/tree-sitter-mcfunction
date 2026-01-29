# non_macro_command.yaml

### Command to run
```mcfunction
say $(hello)
```

### Expected output
```
(source_file
  (command
    (command_name)
    (argument_common)))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (argument_common)))
```

### Status: PASS
