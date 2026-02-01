# nbt_value.md

### Input command
```mcfunction
$test "$(foo)"
```

### Expected output
```scheme
(source_file
  (macro_command
    (command_name)
    (macro_argument
      (macro_interpolation))))
```

### Actual output
```scheme
(source_file
  (macro_command
    (command_name)
    (macro_argument
      (macro_interpolation))))
```

### Status: PASS
