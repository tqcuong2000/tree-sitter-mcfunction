# named_compound.yaml

### Command to run
```mcfunction
data modify entity @s data{id:"test"} set value "test"
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
    (named_compound
      (argument_common)
      (nbt_key)
      (string))
    (argument_common)
    (argument_common)
    (string)))
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
    (named_compound
      (argument_common)
      (nbt_key)
      (string))
    (argument_common)
    (argument_common)
    (string)))
```

### Status: PASS
