# fake_player.md

### Input command
```mcfunction
scoreboard set #global
scoreboard add #temp.score
```

### Expected output
```scheme
(source_file
  (command
    (command_name)
    (keyword)
    (fake_player))
  (command
    (command_name)
    (keyword)
    (fake_player)))
```

### Actual output
```scheme
(source_file
  (command
    (command_name)
    (keyword)
    (fake_player))
  (command
    (command_name)
    (keyword)
    (fake_player)))
```

### Status: PASS
