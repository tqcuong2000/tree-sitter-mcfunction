# boolean.md

### Input command
```mcfunction
execute if entity @s[tag=test] run say true
execute if entity @s[tag=test] run say false
```

### Expected output
```scheme
(source_file
  (command
    (command_name)
    (keyword)
    (keyword)
    (selector
      (selector_target)
      (nbt_list
        (nbt_pair
          key: (string)
          value: (string))))
    (keyword)
    (keyword)
    (boolean))
  (command
    (command_name)
    (keyword)
    (keyword)
    (selector
      (selector_target)
      (nbt_list
        (nbt_pair
          key: (string)
          value: (string))))
    (keyword)
    (keyword)
    (boolean)))
```

### Actual output
```scheme
(source_file
  (command
    (command_name)
    (keyword)
    (keyword)
    (selector
      (selector_target)
      (nbt_list
        (nbt_pair
          key: (string)
          value: (string))))
    (keyword)
    (keyword)
    (boolean))
  (command
    (command_name)
    (keyword)
    (keyword)
    (selector
      (selector_target)
      (nbt_list
        (nbt_pair
          key: (string)
          value: (string))))
    (keyword)
    (keyword)
    (boolean)))
```

### Status: PASS
