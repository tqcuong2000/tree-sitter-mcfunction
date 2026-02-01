# nbt.md

### Input command
```mcfunction
$data merge  {Key: $(value)}
$data merge  {$(key): "value"}
$data merge  {$(key): $(value)}
$data merge  [$(value1), $(value2)]
```

### Expected output
```scheme
(source_file
  (macro_command
    (command_name)
    (keyword)
    (nbt_compound
      (nbt_pair
        key: (nbt_key
          (string))
        value: (nbt_value
          (macro_argument
            (macro_interpolation))))))
  (macro_command
    (command_name)
    (keyword)
    (nbt_compound
      (nbt_pair
        key: (nbt_key
          (macro_argument
            (macro_interpolation)))
        value: (nbt_value
          (string)))))
  (macro_command
    (command_name)
    (keyword)
    (nbt_compound
      (nbt_pair
        key: (nbt_key
          (macro_argument
            (macro_interpolation)))
        value: (nbt_value
          (macro_argument
            (macro_interpolation))))))
  (macro_command
    (command_name)
    (keyword)
    (nbt_list
      (macro_argument
        (macro_interpolation))
      (macro_argument
        (macro_interpolation)))))
```

### Actual output
```scheme
(source_file
  (macro_command
    (command_name)
    (keyword)
    (nbt_compound
      (nbt_pair
        key: (nbt_key
          (string))
        value: (nbt_value
          (macro_argument
            (macro_interpolation))))))
  (macro_command
    (command_name)
    (keyword)
    (nbt_compound
      (nbt_pair
        key: (nbt_key
          (macro_argument
            (macro_interpolation)))
        value: (nbt_value
          (string)))))
  (macro_command
    (command_name)
    (keyword)
    (nbt_compound
      (nbt_pair
        key: (nbt_key
          (macro_argument
            (macro_interpolation)))
        value: (nbt_value
          (macro_argument
            (macro_interpolation))))))
  (macro_command
    (command_name)
    (keyword)
    (nbt_list
      (macro_argument
        (macro_interpolation))
      (macro_argument
        (macro_interpolation)))))
```

### Status: PASS
