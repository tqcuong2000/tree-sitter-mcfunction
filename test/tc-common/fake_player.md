# fake_player.md

### Input command
```mcfunction
scoreboard players set #global objective 1
scoreboard players add #temp.score objective 5
```

### Expected output
```scheme
(source_file
  (command
    (command_name)
    (keyword)
    (keyword)
    (fake_player)
    (keyword)
    (number))
  (command
    (command_name)
    (keyword)
    (keyword)
    (fake_player)
    (keyword)
    (number)))
```

### Actual output
```scheme
(source_file
  (command
    (command_name)
    (keyword)
    (keyword)
    (fake_player)
    (keyword)
    (number))
  (command
    (command_name)
    (keyword)
    (keyword)
    (fake_player)
    (keyword)
    (number)))
```

### Status: PASS
