# nbtcompund-resouce_location.yaml

### Command to run
```mcfunction
function flags:lib/test/fol_1 {1:"id", _a:"test", b:hello}
```

### Expected output
```
(source_file
  (command
    (command_name)
    (resource_location)
    (nbt_compound
      (nbt_key)
      (string)
      (nbt_key)
      (string)
      (nbt_key)
      (unquoted_string))))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (resource_location)
    (nbt_compound
      (nbt_key)
      (string)
      (nbt_key)
      (string)
      (nbt_key)
      (unquoted_string))))
```

### Status: PASS
