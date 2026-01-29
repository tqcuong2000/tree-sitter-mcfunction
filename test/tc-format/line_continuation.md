# line_continuation.yaml

### Command to run
```mcfunction
execute \
run \
say \
hello \
\
world
```

### Expected output
```
(source_file
  (command
    (command_name)
    (run_clause
      (command
        (command_name)
        (argument_common)
        (argument_common)))))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (run_clause
      (command
        (command_name)
        (argument_common)
        (argument_common)))))
```

### Status: PASS
