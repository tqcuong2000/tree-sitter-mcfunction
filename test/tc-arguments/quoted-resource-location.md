# quoted-resource-location.yaml

### Command to run
```mcfunction
data modify entity @p SelectedItem.id set value "minecraft:diamond"
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
      (argument_common))
    (argument_common)
    (argument_common)
    (resource_location)))
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
      (argument_common))
    (argument_common)
    (argument_common)
    (resource_location)))
```

### Status: PASS
