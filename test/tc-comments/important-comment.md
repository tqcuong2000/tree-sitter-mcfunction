# important-comment.yaml

### Command to run
```mcfunction
#! Important \
comment \ 
line3
```

### Expected output
```
(source_file
  (comment_line
    (comment_important
      tag: (comment_important_tag)
      content: (comment_content))))
```

### Actual output
```
(source_file
  (comment_line
    (comment_important
      tag: (comment_important_tag)
      content: (comment_content))))
```

### Status: PASS
