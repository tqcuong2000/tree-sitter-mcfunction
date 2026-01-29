# macro_return_run_data.md

### Command to run
```mcfunction
$return run data get entity data.$(flag)
```

### Expected output
```
(source_file
  (command
    (command_name_macro)
    (run_clause_macro
      (run_clause)
      (run_clause
        (command
          (command_name)
          (argument_common)
          (argument_common)
          (nbt_path_macro
            (nbt_path
              (argument_common))
            (nbt_path
              (macro_interpolation))))))))
```

### Actual output
```
(source_file
  (command
    (command_name_macro)
    (run_clause_macro
      (run_clause)
      (run_clause
        (command
          (command_name)
          (argument_common)
          (argument_common)
          (nbt_path_macro
            (nbt_path
              (argument_common))
            (nbt_path
              (macro_interpolation))))))))
```

### Status: PASS
