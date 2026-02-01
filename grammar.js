const line_continuation = token(seq("\\", optional(/[ \t]+/), /\r?\n/)),
  s = 3;

const num_regex = /-?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?/;
const coord_part_regex = new RegExp(
  `([~^]-?(\\d+(\\.\\d+)?|\\.\\d+)?|${num_regex.source}([bslfdtBSLFDT])?)`,
);

export default grammar({
  name: "mcfunction",

  extras: ($) => [/[ \t\r]/, line_continuation],
  conflicts: ($) => [[$.command], [$.macro_command]],
  rules: {
    source_file: ($) =>
      seq(
        repeat(choice(seq($._statement, $._newline), $._newline)),
        optional($._statement),
      ),
    _newline: ($) => choice("\n", "\r\n"),
    _statement: ($) => choice($.command, $.macro_command, $.comment),
    // Comments:
    comment: ($) =>
      choice($._comment_important, $._comment_directive, $._comment_normal),
    comment_important_tag: ($) => token(seq(/#+/, /!+|@+/)),
    comment_directive_tag: ($) => token(seq(/#+/, />+/)),
    comment_tag: ($) => token(/#+/),
    comment_content: ($) => token(allow_lc()),
    _comment_normal: ($) =>
      seq(
        field("tag", $.comment_tag),
        optional(field("content", $.comment_content)),
      ),
    _comment_important: ($) =>
      seq(
        field("tag", alias($.comment_important_tag, $.tag_important)),
        optional(
          field("content", alias($.comment_content, $.content_important)),
        ),
      ),
    _comment_directive: ($) =>
      seq(
        field("tag", alias($.comment_directive_tag, $.tag_directive)),
        optional(
          seq(
            field("key", alias($.comment_directive_key, $.key_directive)),
            optional(
              seq(
                ":",
                alias(
                  field("content", $.comment_directive_value),
                  $.content_directive,
                ),
              ),
            ),
          ),
        ),
      ),
    comment_directive_key: ($) => token(allow_lc(/[^\r\n:]/)),
    comment_directive_value: ($) => token(allow_lc()),
    // Commands:
    command: ($) => seq($.command_name, repeat($._argument)),
    macro_command: ($) =>
      seq(
        "$",
        choice($.command_name, alias($.macro_interpolation, $.command_name)),
        repeat(choice($._argument, $.macro_argument)),
      ),
    command_name: ($) => token(seq(/[a-z]/, allow_lc(/[a-zA-Z_0-9]/))),
    /* Atomic rules:
        - Rules that are matched as a single, indivisible unit (tokens).
        - Usually used for values like numbers, strings, or coordinates.
        - Priority is determined by the order of declaration in the rules object.
    */
    _argument: ($) =>
      choice(
        $.coordinates,
        $.string,
        $.number,
        $.resource_location,
        $.selector,
        $.nbt_list,
        $.nbt_compound,
        $.boolean,
        $.fake_player,
        $.nbt_path,
        $.run_clause,
        $.keyword,
      ),
    identifier: ($) =>
      token(
        seq(
          token(/[a-zA-Z0-9_.-]+/),
          optional(repeat1(seq("/", token(/[a-zA-Z0-9_.-]+/)))),
        ),
      ),
    string: ($) =>
      choice(
        token(seq("'", repeat(choice(/[^'\\\n$]/, /\\./, /\$[^(\n]/)), "'")),
        token(seq('"', repeat(choice(/[^"\\\n$]/, /\\./, /\$[^(\n]/)), '"')),
      ),
    number: ($) =>
      token(
        seq(/-?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?/, optional(/[bslfdtBSLFDT]/)),
      ),
    coordinates: ($) =>
      token(
        seq(
          coord_part_regex,
          /[ \t\r]+/,
          coord_part_regex,
          /[ \t\r]+/,
          coord_part_regex,
        ),
      ),
    macro_argument: ($) =>
      prec(
        2,
        choice(
          seq(
            alias(choice($.keyword, $.macro_fragment), $.macro_fragment),
            alias(
              token.immediate(seq("$(", /([^)]*)/, ")")),
              $.macro_interpolation,
            ),
            repeat(
              choice(
                alias(
                  token.immediate(seq("$(", /([^)]*)/, ")")),
                  $.macro_interpolation,
                ),
                alias(token.immediate(/[^\s:}\],"']+/), $.macro_fragment),
              ),
            ),
          ),
          seq(
            $.macro_interpolation,
            repeat(
              choice(
                alias(
                  token.immediate(seq("$(", /([^)]*)/, ")")),
                  $.macro_interpolation,
                ),
                alias(token.immediate(/[^\s:}\],"']+/), $.macro_fragment),
              ),
            ),
          ),
          seq(
            '"',
            repeat(token.immediate(/[^"\\$]+|\\./)),
            alias(
              token.immediate(seq("$(", /([^)]*)/, ")")),
              $.macro_interpolation,
            ),
            repeat(
              choice(
                alias(
                  token.immediate(seq("$(", /([^)]*)/, ")")),
                  $.macro_interpolation,
                ),
                token.immediate(/[^"\\$]+|\\./),
              ),
            ),
            token.immediate('"'),
          ),
        ),
      ),
    macro_interpolation: ($) => token(seq("$(", /([^)]*)/, ")")),
    macro_fragment: ($) => token(prec(-1, /[^\s:}\],"']+/)),
    namespace: ($) => token(/[a-zA-Z0-9_-]+/),
    boolean: ($) => choice("true", "false"),
    fake_player: ($) => token(/#[a-zA-Z0-9_.-]+/),
    keyword: ($) => token(/[a-zA-Z0-9_-]+/),
    /* Composite rules:
        - Rules that consist of multiple parts or tokens (structural nodes).
        - Used for complex constructs like selectors, NBT, or resource locations.
        - These define the actual structure of the syntax tree.
    */
    selector: ($) => prec.right(seq($.selector_target, optional($.nbt_list))),
    selector_target: ($) => token(seq("@", /[parsen]/)),
    nbt_list: ($) => seq("[", optional($._nbt_list_content), "]"),
    _nbt_list_content: ($) =>
      choice(
        seq($.nbt_pair, repeat(seq(",", $.nbt_pair))),
        seq($._nbt_argument, repeat(seq(",", $._nbt_argument))),
      ),
    _nbt_argument: ($) =>
      choice(
        $.string,
        $.number,
        $.resource_location,
        $.nbt_list,
        $.nbt_compound,
        $.boolean,
        $.macro_argument,
        alias($.keyword, $.string),
      ),
    nbt_compound: ($) => seq("{", optional($._nbt_compound_content), "}"),
    _nbt_compound_content: ($) =>
      seq($.nbt_pair, optional(repeat(seq(",", $.nbt_pair)))),
    nbt_key: ($) =>
      choice(alias($.keyword, $.string), $.string, $.macro_argument),
    nbt_value: ($) => $._nbt_argument,
    nbt_pair: ($) =>
      seq(field("key", $.nbt_key), /=|~|:/, field("value", $.nbt_value)),
    resource_location: ($) =>
      seq(
        field("namespace", $.namespace),
        ":",
        field("identifier", $.identifier),
      ),
    run_clause: ($) =>
      prec.left(
        2,
        seq("run", field("subcommand", choice($.command, $.macro_command))),
      ),
    nbt_path: ($) =>
      seq(
        choice($.keyword, $.string, $.macro_argument),
        choice(
          seq(
            optional(repeat(choice($._nbt_path_index, $._nbt_path_filter))),
            repeat1(seq(token.immediate("."), $._nbt_path_segment)),
          ),
          repeat1(choice($._nbt_path_index, $._nbt_path_filter)),
        ),
      ),
    _nbt_path_segment: ($) =>
      seq(
        choice($.keyword, $.string, $.macro_argument),
        optional(repeat(choice($._nbt_path_index, $._nbt_path_filter))),
      ),
    _nbt_path_index: ($) =>
      seq(token.immediate("["), optional($._nbt_list_content), "]"),
    _nbt_path_filter: ($) =>
      seq(token.immediate("{"), optional($._nbt_compound_content), "}"),
  },
});

function allow_lc(regex = /[^\r\n]/) {
  return repeat(choice(regex, line_continuation));
}
