# nbt.md

### Input command
```mcfunction
$data merge block 10 10 10 {Key: $(value)}
$data merge block 10 10 10 {$(key): "value"}
$data merge block 10 10 10 {$(key): $(value)}
$data merge block 10 10 10 [$(value1), $(value2)]
```

### Expected output
```scheme
(source_file
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (nbt_compound
      (nbt_pair
        key: (string)
        value: (macro_argument
          (macro_interpolation)))))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (nbt_compound
      (nbt_pair
        key: (macro_argument
          (macro_interpolation))
        value: (string))))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (nbt_compound
      (nbt_pair
        key: (macro_argument
          (macro_interpolation))
        value: (macro_argument
          (macro_interpolation)))))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
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
    (keyword)
    (coordinates)
    (nbt_compound
      (nbt_pair
        key: (string)
        value: (macro_argument
          (macro_interpolation)))))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (nbt_compound
      (nbt_pair
        key: (macro_argument
          (macro_interpolation))
        value: (string))))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (nbt_compound
      (nbt_pair
        key: (macro_argument
          (macro_interpolation))
        value: (macro_argument
          (macro_interpolation)))))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (nbt_list
      (macro_argument
        (macro_interpolation))
      (macro_argument
        (macro_interpolation)))))
```

### Status: PASS
