# comment.md

### Input command
```mcfunction
#
#! Comment "test"
#@ Test \
@s[type=minecraf;zombie]
#>k:v #@12
```

### Expected output
```scheme
(source_file
  (comment
    tag: (comment_tag)
    content: (comment_content))
  (comment
    tag: (tag_important)
    content: (content_important))
  (comment
    tag: (tag_important)
    content: (content_important))
  (comment
    tag: (tag_directive)
    key: (key_directive)
    content: (content_directive)))
```

### Actual output
```scheme
(source_file
  (comment
    tag: (comment_tag)
    content: (comment_content))
  (comment
    tag: (tag_important)
    content: (content_important))
  (comment
    tag: (tag_important)
    content: (content_important))
  (comment
    tag: (tag_directive)
    key: (key_directive)
    content: (content_directive)))
```

### Status: PASS
