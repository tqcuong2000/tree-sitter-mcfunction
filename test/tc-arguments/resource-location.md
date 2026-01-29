# resource-location.yaml

### Command to run
```mcfunction
give @s minecraft:diamond[custom_data={}] advancement grant @s only minecraft:story/mine_diamond
```

### Expected output
```
(source_file
  (command
    (command_name)
    (selector
      (selector_variable))
    (resource_location)
    (selector_arguments
      argument: (selector_argument
        (selector_key)
        (nbt_compound)))
    (argument_common)
    (argument_common)
    (selector
      (selector_variable))
    (argument_common)
    (resource_location)))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (selector
      (selector_variable))
    (resource_location)
    (selector_arguments
      argument: (selector_argument
        (selector_key)
        (nbt_compound)))
    (argument_common)
    (argument_common)
    (selector
      (selector_variable))
    (argument_common)
    (resource_location)))
```

### Status: PASS
