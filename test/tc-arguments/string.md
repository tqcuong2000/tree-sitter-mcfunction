# string.yaml

### Command to run
```mcfunction
tellraw @s "hello"
```

### Expected output
```
(source_file
  (command
    (command_name)
    (selector
      (selector_variable))
    (string)))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (selector
      (selector_variable))
    (string)))
```

### Status: PASS
