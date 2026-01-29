# nbt_compound.yaml

### Command to run
```mcfunction
tellraw name {text:"Hello, world!", italic:true}
```

### Expected output
```
(source_file
  (command
    (command_name)
    (argument_common)
    (nbt_compound
      (nbt_key)
      (string)
      (nbt_key)
      (boolean))))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (argument_common)
    (nbt_compound
      (nbt_key)
      (string)
      (nbt_key)
      (boolean))))
```

### Status: PASS
