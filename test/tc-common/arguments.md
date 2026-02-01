# arguments.md

### Input command
```mcfunction
say "string"
say 123
say [key=val]
say @s[type=minecraft:zombie]
```

### Expected output
```scheme
(source_file
  (command
    (command_name)
    (string))
  (command
    (command_name)
    (number))
  (command
    (command_name)
    (nbt_list
      (nbt_pair
        key: (string)
        value: (string))))
  (command
    (command_name)
    (selector
      (selector_target)
      (nbt_list
        (nbt_pair
          key: (string)
          value: (resource_location
            namespace: (namespace)
            identifier: (identifier)))))))
```

### Actual output
```scheme
(source_file
  (command
    (command_name)
    (string))
  (command
    (command_name)
    (number))
  (command
    (command_name)
    (nbt_list
      (nbt_pair
        key: (string)
        value: (string))))
  (command
    (command_name)
    (selector
      (selector_target)
      (nbt_list
        (nbt_pair
          key: (string)
          value: (resource_location
            namespace: (namespace)
            identifier: (identifier)))))))
```

### Status: PASS
