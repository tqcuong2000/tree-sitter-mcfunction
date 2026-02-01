# line-continuation.md

### Input command
```mcfunction
say \
line \
\
continuation
```

### Expected output
```scheme
(source_file
  (command
    (command_name)
    (keyword)
    (keyword)))
```

### Actual output
```scheme
(source_file
  (command
    (command_name)
    (keyword)
    (keyword)))
```

### Status: PASS
