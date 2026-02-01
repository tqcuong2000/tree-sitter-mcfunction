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
    (macro_interpolation)
    (keyword))
  (macro_command
    (macro_interpolation)))
```

### Actual output
```scheme
(source_file
  (macro_command
    (macro_interpolation)
    (keyword))
  (macro_command
    (macro_interpolation)))
```

### Status: PASS
