# run_keyword.md

### Command to run
```mcfunction
execute run say hello
execute as @a run tellraw @s "hi"
```

### Expected output
```
(source_file
  (command
    (command_name)
    (run_clause
      (command
        (command_name)
        (argument_common))))
  (command
    (command_name)
    (argument_common)
    (selector
      (selector_variable))
    (run_clause
      (command
        (command_name)
        (selector
          (selector_variable))
        (string)))))
```

### Actual output
```
(source_file
  (command
    (command_name)
    (run_clause
      (command
        (command_name)
        (argument_common))))
  (command
    (command_name)
    (argument_common)
    (selector
      (selector_variable))
    (run_clause
      (command
        (command_name)
        (selector
          (selector_variable))
        (string)))))
```

### Status: PASS
