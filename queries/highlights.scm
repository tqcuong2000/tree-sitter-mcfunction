; Comments
(comment_tag_normal) @comment
(comment_content) @comment
(comment_tag_important) @tag
(comment_tag_directive) @comment

; Directive keys/values
(directive_key) @property
(directive_value) @string

; Commands
(command_name) @function

; Macros
(command_name_macro) @function
(macro_interpolation) @embedded

; Literals
(string) @string
(boolean) @boolean
(resource_location) @type


; NBT
(nbt_key) @property

; Selectors
(selector_variable) @variable.builtin
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
