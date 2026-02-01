# nbt_compound.md

### Input command
```mcfunction
tellraw @s {"text":"Hello, world!", color:green}
```

### Expected output
```scheme
(source_file
  (command
    (command_name)
    (selector
      (selector_target))
    (nbt_compound
      (nbt_pair
        key: (string)
        value: (string))
      (nbt_pair
        key: (string)
        value: (string)))))
```

### Actual output
```scheme
(source_file
  (command
    (command_name)
    (selector
      (selector_target))
    (nbt_compound
      (nbt_pair
        key: (string)
        value: (string))
      (nbt_pair
        key: (string)
        value: (string)))))
```

### Status: PASS
