# common.yaml

### Command to run
```mcfunction
$function my$(func)id $(args)
```

### Expected output
```
(source_file
  (command
    (command_name_macro)
    (macro_component
      (argument_common)
      (macro_interpolation)
      (argument_common))
    (macro_component
      (macro_interpolation))))
```

### Actual output
```
(source_file
  (command
    (command_name_macro)
    (macro_component
      (argument_common)
      (macro_interpolation)
      (argument_common))
    (macro_component
      (macro_interpolation))))
```

### Status: PASS
