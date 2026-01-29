# nbt-list.yaml

### Command to run
```mcfunction
data modify storage data path set value [] \ 
data modify storage test path \ 
set value ["12",12,true]
```

### Expected output
```
(source_file
  (command
    (command_name)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (nbt_array)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (nbt_array
      (string)
      (number)
      (boolean))))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (nbt_array)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (argument_common)
    (nbt_array
      (string)
      (number)
      (boolean))))
```

### Status: PASS
