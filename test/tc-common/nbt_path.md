# nbt_path.md

### Input command
```mcfunction
$data get block ~ ~ ~ foo.bar
$data get block ~ ~ ~ foo[0]
$data get block ~ ~ ~ foo[{k:v}].bar
$data get block ~ ~ ~ 1.2
$data get block ~ ~ ~ foo [0]
```

### Expected output
```scheme
(source_file
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (nbt_path
      (keyword)
      (keyword)))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (nbt_path
      (keyword)
      (number)))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (nbt_path
      (keyword)
      (nbt_compound
        (nbt_pair
          key: (string)
          value: (string)))
      (keyword)))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (number))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (keyword)
    (nbt_list
      (number))))
```

### Actual output
```scheme
(source_file
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (nbt_path
      (keyword)
      (keyword)))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (nbt_path
      (keyword)
      (number)))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (nbt_path
      (keyword)
      (nbt_compound
        (nbt_pair
          key: (string)
          value: (string)))
      (keyword)))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (number))
  (macro_command
    (command_name)
    (keyword)
    (keyword)
    (coordinates)
    (keyword)
    (nbt_list
      (number))))
```

### Status: PASS
