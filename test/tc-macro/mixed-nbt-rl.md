# mixed-nbt-rl.yaml

### Command to run
```mcfunction
$data modify storage $(namespace):$(id) set value {key:$(val),$(key):val,$(key):$(val)}
```

### Expected output
```
(source_file
  (command
    (command_name_macro)
    (argument_common)
    (argument_common)
    (macro_component
      (macro_interpolation)
      (argument_common)
      (macro_interpolation))
    (argument_common)
    (argument_common)
    (nbt_compound
      (nbt_key)
      (unquoted_string
        (macro_interpolation))
      (nbt_key
        (macro_interpolation))
      (unquoted_string)
      (nbt_key
        (macro_interpolation))
      (unquoted_string
        (macro_interpolation)))))
```

### Actual output
```
(source_file
  (command
    (command_name_macro)
    (argument_common)
    (argument_common)
    (macro_component
      (macro_interpolation)
      (argument_common)
      (macro_interpolation))
    (argument_common)
    (argument_common)
    (nbt_compound
      (nbt_key)
      (unquoted_string
        (macro_interpolation))
      (nbt_key
        (macro_interpolation))
      (unquoted_string)
      (nbt_key
        (macro_interpolation))
      (unquoted_string
        (macro_interpolation)))))
```

### Status: PASS
