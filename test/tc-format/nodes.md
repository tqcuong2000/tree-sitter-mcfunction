# nodes.yaml

### Command to run
```mcfunction
execute as name run say "hello"
```

### Expected output
```
(source_file
  (command
    (command_name)
    (argument_common)
    (argument_common)
    (run_clause
      (command
        (command_name)
        (string)))))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (argument_common)
    (argument_common)
    (run_clause
      (command
        (command_name)
        (string)))))
```

### Status: PASS
