# string.md

### Input command
```mcfunction
say "foo"
say 'foo'
```

### Expected output
```scheme
(source_file
  (command
    (command_name)
    (string))
  (command
    (command_name)
    (string)))
```

### Actual output
```scheme
(source_file
  (command
    (command_name)
    (string))
  (command
    (command_name)
    (string)))
```

### Status: PASS
