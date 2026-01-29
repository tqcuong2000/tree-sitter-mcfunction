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
    (macro_interpolation)))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (macro_interpolation)))
```

### Status: PASS
