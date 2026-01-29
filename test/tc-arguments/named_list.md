# named_list.yaml

### Command to run
```mcfunction
data modify entity @s Pos[0] set value 1
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
    (named_list
      (argument_common)
      (number))
    (argument_common)
    (argument_common)
    (number)))
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
    (named_list
      (argument_common)
      (number))
    (argument_common)
    (argument_common)
    (number)))
```

### Status: PASS
