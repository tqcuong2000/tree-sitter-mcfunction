# directive-comment.yaml

### Command to run
```mcfunction
#> Directive key: Derective value
```

### Expected output
```
(source_file
  (comment_line
    (comment_directive
      tag: (comment_directive_tag)
      key: (comment_directive_key)
      value: (comment_content))))
```

### Actual output
```
(source_file
  (comment_line
    (comment_directive
      tag: (comment_directive_tag)
      key: (comment_directive_key)
      value: (comment_content))))
```

### Status: PASS
