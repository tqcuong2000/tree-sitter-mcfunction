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
    (nbt_compound_macro
      (nbt_compound)
      (nbt_compound
        (nbt_key_macro
          (macro_component
            (argument_common)
            (macro_interpolation)
            (argument_common)
            (macro_interpolation)
            (argument_common)
            (macro_interpolation)))
        (macro_component
          (macro_interpolation)))
      (nbt_compound))))
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
    (nbt_compound_macro
      (nbt_compound)
      (nbt_compound
        (nbt_key_macro
          (macro_component
            (argument_common)
            (macro_interpolation)
            (argument_common)
            (macro_interpolation)
            (argument_common)
            (macro_interpolation)))
        (macro_component
          (macro_interpolation)))
      (nbt_compound))))
```

### Status: PASS
