# data_get_quoted_path.md

### Command to run
```mcfunction
data get entity @s equipment.body.components."minecraft:custom_data".data
```

### Expected output
```
(source_file
  (command
    (command_name)
    (argument_common)
    (argument_common)
    (selector
      (selector_variable))
    (nbt_path
      (argument_common)
      (argument_common)
      (argument_common)
      (string)
      (argument_common))))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (argument_common)
    (argument_common)
    (selector
      (selector_variable))
    (nbt_path
      (argument_common)
      (argument_common)
      (argument_common)
      (string)
      (argument_common))))
```

### Status: PASS
