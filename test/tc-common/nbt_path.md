# nbt_path.md

### Input command
```mcfunction
data get foo.bar
data get foo[0]
data get foo[{k:v}].bar
data get foo{1:"bar"}
```

### Expected output
```scheme
(source_file
  (command
    (command_name)
    (keyword)
    (nbt_path
      (keyword)
      (keyword)))
  (command
    (command_name)
    (keyword)
    (nbt_path
      (keyword)
      (number)))
  (command
    (command_name)
    (keyword)
    (nbt_path
      (keyword)
      (nbt_compound
        (nbt_pair
          key: (nbt_key
            (string))
          value: (nbt_value
            (string))))
      (keyword)))
  (command
    (command_name)
    (keyword)
    (nbt_path
      (keyword)
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
    (keyword)
    (nbt_path
      (keyword)
      (keyword)))
  (command
    (command_name)
    (keyword)
    (nbt_path
      (keyword)
      (number)))
  (command
    (command_name)
    (keyword)
    (nbt_path
      (keyword)
      (nbt_compound
        (nbt_pair
          key: (nbt_key
            (string))
          value: (nbt_value
            (string))))
      (keyword)))
  (command
    (command_name)
    (keyword)
    (nbt_path
      (keyword)
      (nbt_pair
        key: (nbt_key
          (string))
        value: (nbt_value
          (string))))))
```

### Status: PASS
