# resource-location.md

### Input command
```mcfunction
summon minecraft:zombie
function foo:bar/my/func_
say "foo:bar"
say 'foo:bar/123'
```

### Expected output
```scheme
(source_file
  (command
    (command_name)
    (resource_location))
  (command
    (command_name)
    (resource_location))
  (command
    (command_name)
    (resource_location))
  (command
    (command_name)
    (resource_location)))
```

### Actual output
```scheme
(source_file
  (command
    (command_name)
    (resource_location))
  (command
    (command_name)
    (resource_location))
  (command
    (command_name)
    (resource_location))
  (command
    (command_name)
    (resource_location)))
```

### Status: PASS
