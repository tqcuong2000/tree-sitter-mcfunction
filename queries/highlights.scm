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
(macro_interpolation) @keyword

; Literals
(string) @string
(boolean) @attribute
(resource_location) @constant
(coordinates) @attribute


; NBT
(nbt_key) @property
(named_list) @string.special
(named_compound) @string.special

; Selectors
(selector_variable) @keyword
(selector_key) @property
(selector_value_content) @string

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