# nbt_compound.md

### Input command
```mcfunction
tellraw @s {"text":green,color:"red"}
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
        key: (nbt_key
          (string))
        value: (nbt_value
          (string)))
      (nbt_pair
        key: (nbt_key
          (string))
        value: (nbt_value
          (string))))))
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
        key: (nbt_key
          (string))
        value: (nbt_value
          (string)))
      (nbt_pair
        key: (nbt_key
          (string))
        value: (nbt_value
          (string))))))
```

### Status: PASS
