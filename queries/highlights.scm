; Comments
(comment_normal) @comment
(comment_important) @string.special
(comment_directive_tag) @string.special
(comment_directive_key) @string.special
(comment_directive (comment_content)) @comment

; Commands
(command_name) @function

; Macros
(command_name_macro) @function
(macro_interpolation) @variable.parameter

; Literals
(string) @string
(boolean) @variable
(resource_location) @module


; NBT
(nbt_key) @property

; Selectors
(selector_variable) @module
(selector_key) @property

; Punctuation
[
  "{"
  "}"
  "["
  "]"
] @punctuation.bracket

[
  ":"
  ","
  "="
] @punctuation.delimiter
