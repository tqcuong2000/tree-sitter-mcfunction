# interpolation.md

### Input command
```mcfunction
$say hello_$(world)_hello keyword
```

### Expected output
```scheme
(source_file
  (macro_command
    (command_name)
    (macro_argument
      (macro_fragment)
      (macro_interpolation)
      (macro_fragment))
    (keyword)))
```

### Actual output
```scheme
(source_file
  (macro_command
    (command_name)
    (macro_argument
      (macro_fragment)
      (macro_interpolation)
      (macro_fragment))
    (keyword)))
```

### Status: PASS
