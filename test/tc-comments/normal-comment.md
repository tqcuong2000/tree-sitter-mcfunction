# normal-comment.yaml

### Command to run
```mcfunction
# This is a normal comment
#This is a normal comment
#This is \
a normal comment
```

### Expected output
```
(source_file
  (comment_line
    (comment_normal
      tag: (comment_normal_tag)
      content: (comment_content)))
  (comment_line
    (comment_normal
      tag: (comment_normal_tag)
      content: (comment_content)))
  (comment_line
    (comment_normal
      tag: (comment_normal_tag)
      content: (comment_content))))
```

### Actual output
```
(source_file
  (comment_line
    (comment_normal
      tag: (comment_normal_tag)
      content: (comment_content)))
  (comment_line
    (comment_normal
      tag: (comment_normal_tag)
      content: (comment_content)))
  (comment_line
    (comment_normal
      tag: (comment_normal_tag)
      content: (comment_content))))
```

### Status: PASS
