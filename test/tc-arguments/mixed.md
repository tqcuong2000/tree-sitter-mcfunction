# mixed.yaml

### Command to run
```mcfunction
execute positioned ^-1.1 ^1 ^-.1 as \ @s[nbt={data:{test:true}}] run data modify storage \ minecraft:test set set value \ {data:[1,"test"],name:"test"}
```

### Expected output
```
(source_file
  (command
    (command_name)
    (argument_common)
    (coordinates)
    (argument_common)
    (named_list
      (argument_common)
      (named_compound
        (argument_common)
        (nbt_key)
        (nbt_compound
          (nbt_key)
          (boolean))))
    (run_clause
      (command
        (command_name)
        (argument_common)
        (argument_common)
        (argument_common)
        (argument_common)
        (argument_common)
        (argument_common)
        (named_compound
          (argument_common)
          (nbt_key)
          (nbt_array
            (number)
            (string))
          (nbt_key)
          (string))))))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (argument_common)
    (coordinates)
    (argument_common)
    (named_list
      (argument_common)
      (named_compound
        (argument_common)
        (nbt_key)
        (nbt_compound
          (nbt_key)
          (boolean))))
    (run_clause
      (command
        (command_name)
        (argument_common)
        (argument_common)
        (argument_common)
        (argument_common)
        (argument_common)
        (argument_common)
        (named_compound
          (argument_common)
          (nbt_key)
          (nbt_array
            (number)
            (string))
          (nbt_key)
          (string))))))
```

### Status: PASS
