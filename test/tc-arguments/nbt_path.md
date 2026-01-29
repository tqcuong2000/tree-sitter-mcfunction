# nbt_path_test.md

### Command to run
```mcfunction
data get entity @s foo.bar
data get entity @s foo[1].bar
data get entity @s foo.bar{baz:1}
data get entity @s foo[1].bar{baz:1}.qux
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
      (argument_common)))
  (command
    (command_name)
    (argument_common)
    (argument_common)
    (selector
      (selector_variable))
    (nbt_path
      (named_list
        (argument_common)
        (number))
      (argument_common)))
  (command
    (command_name)
    (argument_common)
    (argument_common)
    (selector
      (selector_variable))
    (nbt_path
      (argument_common)
      (named_compound
        (argument_common)
        (nbt_key)
        (number))))
  (command
    (command_name)
    (argument_common)
    (argument_common)
    (selector
      (selector_variable))
    (nbt_path
      (named_list
        (argument_common)
        (number))
      (named_compound
        (argument_common)
        (nbt_key)
        (number))
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
      (argument_common)))
  (command
    (command_name)
    (argument_common)
    (argument_common)
    (selector
      (selector_variable))
    (nbt_path
      (named_list
        (argument_common)
        (number))
      (argument_common)))
  (command
    (command_name)
    (argument_common)
    (argument_common)
    (selector
      (selector_variable))
    (nbt_path
      (argument_common)
      (named_compound
        (argument_common)
        (nbt_key)
        (number))))
  (command
    (command_name)
    (argument_common)
    (argument_common)
    (selector
      (selector_variable))
    (nbt_path
      (named_list
        (argument_common)
        (number))
      (named_compound
        (argument_common)
        (nbt_key)
        (number))
      (argument_common))))
```

### Status: PASS
