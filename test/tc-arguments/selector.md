# selector.yaml

### Command to run
```mcfunction
tellraw @a[name=name] "hello"
```

### Expected output
```
(source_file
  (command
    (command_name)
    (selector
      (selector_variable)
      (selector_arguments
        argument: (selector_argument
          (selector_key)
          (selector_value_content))))
    (string)))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (selector
      (selector_variable)
      (selector_arguments
        argument: (selector_argument
          (selector_key)
          (selector_value_content))))
    (string)))
```

### Status: PASS
