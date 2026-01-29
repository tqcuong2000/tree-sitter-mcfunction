export default grammar({
  name: "mcfunction",

  extras: ($) => [/[ \t\r]/, $._line_continuation],

  conflicts: ($) => [
    [$._argument_shared, $._absolute_coordinate],
    [$._argument_shared_macro, $._absolute_coordinate],
    [$._unquoted_identifier, $.macro_component],
  ],

  rules: {
    source_file: ($) =>
      seq(
        repeat(choice(seq($.comment_line, "\n"), seq($.command, "\n"), "\n")),
        optional(choice($.comment_line, $.command)),
      ),
    _line_continuation: ($) => token(seq("\\", optional(/[ \t]+/), /\r?\n/)),
    // For comment:
    comment_line: ($) =>
      choice($.comment_directive, $.comment_important, $.comment_normal),
    comment_content: ($) => token(repeat1(choice(/[^\\\r\n]/, /\\./, /\\[ \t]*\r?\n/))),
    // --- Normal Comments ---
    // A normal comment line (e.g., # content).
    comment_normal: ($) =>
      seq(
        field("tag", $.comment_normal_tag),
        field("content", optional($.comment_content)),
      ),
    // The tag prefix for normal comments (#).
    comment_normal_tag: ($) => token(/#/),

    // --- Important Comments ---
    // An important comment marked explicitly (e.g., #! content).
    comment_important: ($) =>
      seq(
        field("tag", $.comment_important_tag),
        field("content", optional($.comment_content)),
      ),
    // The tag prefix for important comments (#! or #@).
    comment_important_tag: ($) => token(prec(2, /#[!@]/)),

    // --- Directive Comments ---
    // A comment used as a processing directive (e.g., #> key: value).
    comment_directive: ($) =>
      seq(
        field("tag", $.comment_directive_tag),
        field("content", $._comment_directive_content),
      ),
    // The tag prefix for directive comments (#>).
    comment_directive_tag: ($) => token(prec(2, /#>/)),
    // The structured content for a directive comment.
    _comment_directive_content: ($) =>
      seq(
        field("key", $.comment_directive_key),
        ":",
        field("value", optional($.comment_content)),
      ),
    // The key part of a directive.
    comment_directive_key: ($) => token(/[^:#>\r\n]+/),
    // A command with its name and arguments.
    command: ($) => choice($._command_normal, $._command_macro),
    // Command types
    // Command types
    _command_normal: ($) =>
      prec.right(seq($.command_name, repeat($._argument_normal))),
    _command_macro: ($) =>
      prec.right(
        seq(
          $.command_name_macro,
          repeat($._argument_macro),
        ),
      ),
    _command_normal_macro: ($) =>
      prec.right(seq($.command_name, repeat($._argument_macro))),
    _command_macro_aware: ($) => choice($._command_macro, alias($._command_normal_macro, $.command)),
    // A argument_common argument type for content that doesn't match specialized types.
    argument_common: ($) =>
      choice(
        token(
          seq(
            choice(/[^"'\s\\\[{^~\\$.]/, seq("\\", /[^\r\n]/)),
            repeat(choice(/[^\s\\\$\[\{.]/, seq("\\", /[^\r\n]/))),
          ),
        ),
        "$",
      ),

    // Argument literal token: allows '$' (e.g. $(hello))
    // We strictly alias this to argument_common so it appears as such in the AST
    _argument_literal_token: ($) =>
      alias(
        token(
          seq(
            choice(/[^"'\s\\\[{^~.]/, seq("\\", /[^\r\n]/)),
            repeat(choice(/[^\s\\\[\{.]/, seq("\\", /[^\r\n]/))),
          ),
        ),
        $.argument_common
      ),

    // Argument literal rule: accepts standard common arguments OR the literal token with dollars
    _argument_literal: ($) =>
      choice($.argument_common, $._argument_literal_token),

    nbt_path: ($) => prec(4, seq(
      $._nbt_path_segment,
      repeat1(seq(token.immediate("."), $._nbt_path_segment))
    )),

    _nbt_path_segment: ($) => choice(
      $.named_compound,
      $.named_list,
      $.argument_common,
      $.string
    ),

    nbt_path_macro: ($) => alias(prec(4, seq(
      $._nbt_path_segment_macro,
      repeat1(seq(token.immediate("."), $._nbt_path_segment_macro))
    )), $.nbt_path),

    _nbt_path_segment_macro: ($) => choice(
      $.named_compound_macro,
      $.named_list_macro,
      $.argument_common,
      $.string,
      $.macro_interpolation
    ),

    // The name of the command being executed.
    command_name: ($) => token(/[a-zA-Z_][a-zA-Z0-9_.]*/),
    command_name_macro: ($) => seq("$", token(/[a-zA-Z0-9_.]+/)),
    // Arguments:
    // A string argument, either single or double quoted.
    string: ($) => choice($._double_quoted_string, $._single_quoted_string),
    // A string enclosed in double quotes.
    _double_quoted_string: ($) =>
      seq(
        '"',
        repeat(
          choice(
            $._string_content_double,
            alias(
              token.immediate(seq("$(", /[^)]*/, ")")),
              $.macro_interpolation,
            ),
          ),
        ),
        token.immediate('"'),
      ),
    _string_content_double: ($) => token.immediate(/[^"\\$]+|\\.|[$]/),

    // A string enclosed in single quotes.
    _single_quoted_string: ($) =>
      seq(
        "'",
        repeat(
          choice(
            $._string_content_single,
            alias(
              token.immediate(seq("$(", /[^)]*/, ")")),
              $.macro_interpolation,
            ),
          ),
        ),
        token.immediate("'"),
      ),
    _string_content_single: ($) => token.immediate(/[^'\\$]+|\\.|[$]/),
    // A boolean literal (true or false).
    boolean: ($) => choice(token(prec(2, "true")), token(prec(2, "false"))),
    // Fake player name
    fake_player: ($) => token(/#[^\s\{\[\]"']+/),
    // Unquoted string
    unquoted_string: ($) => prec(2, $._unquoted_identifier),
    // A numerical value, optionally with a type suffix (e.g., 1.0f).
    number: ($) =>
      token(
        prec(
          1,
          seq(
            /-?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?/,
            optional(/[bslfdtBSLFDT]/),
          ),
        ),
      ),
    // Named List
    named_list: ($) =>
      prec(2, seq($.argument_common, token.immediate("["), optional($._argument_normal), "]")),
    named_compound: ($) =>
      prec(3, seq(
        $.argument_common,
        token.immediate("{"),
        optional(seq($._nbt_pair, repeat(seq(",", $._nbt_pair)), optional(","))),
        "}"
      )),

    named_list_macro: ($) =>
      alias(prec(2, seq(
        choice($.argument_common, $.macro_interpolation, $.macro_component),
        token.immediate("["),
        optional($._argument_macro),
        "]"
      )), $.named_list),
    named_compound_macro: ($) =>
      alias(prec(3, seq(
        choice($.argument_common, $.macro_interpolation, $.macro_component),
        token.immediate("{"),
        optional(seq($._nbt_pair_macro, repeat(seq(",", $._nbt_pair_macro)), optional(","))),
        "}"
      )), $.named_compound),
    // An NBT array (e.g., [1, 2, 3]).
    nbt_array: ($) =>
      prec(
        1,
        seq(
          "[",
          optional(
            seq($._nbt_value, repeat(seq(",", $._nbt_value)), optional(",")),
          ),
          "]",
        ),
      ),
    // An NBT compound (e.g., {key: "value"}).
    nbt_compound: ($) =>
      seq(
        "{",
        optional(
          seq($._nbt_pair, repeat(seq(",", $._nbt_pair)), optional(",")),
        ),
        "}",
      ),

    // A key-value pair within an NBT compound.
    _nbt_pair: ($) => seq($.nbt_key, ":", $._nbt_value),
    _nbt_pair_macro: ($) => seq($.nbt_key_macro, ":", $._nbt_value_macro),

    // The key of an NBT pair.
    nbt_key: ($) => choice($.string, $._unquoted_identifier),
    nbt_key_macro: ($) => choice($.string, $._unquoted_identifier, $.macro_interpolation, $.macro_component),

    // A value within an NBT compound, including nested compounds.
    _nbt_value: ($) =>
      choice(
        $.string,
        $.number,
        $.boolean,
        $.nbt_compound,
        $.nbt_array,
        $.unquoted_string),
    _nbt_value_macro: ($) =>
      choice(
        $.string,
        $.number,
        $.boolean,
        $.nbt_compound_macro,
        $.nbt_array_macro,
        $.unquoted_string,
        $.macro_interpolation,
        $.macro_component),

    nbt_compound_macro: ($) =>
      alias(seq(
        "{",
        optional(
          seq($._nbt_pair_macro, repeat(seq(",", $._nbt_pair_macro)), optional(",")),
        ),
        "}",
      ), $.nbt_compound),

    nbt_array_macro: ($) =>
      alias(prec(
        1,
        seq(
          "[",
          optional(
            seq($._nbt_value_macro, repeat(seq(",", $._nbt_value_macro)), optional(",")),
          ),
          "]",
        ),
      ), $.nbt_array),
    // Selector

    selector: ($) =>
      prec.right(5, seq($.selector_variable, optional($.selector_arguments))),
    selector_macro: ($) =>
      alias(prec.right(5, seq($.selector_variable, optional($.selector_arguments_macro))), $.selector),
    selector_variable: ($) => token(prec(1, /@[parsen]/)),

    selector_arguments: ($) =>
      seq(
        token.immediate("["),
        optional(field("argument",
          seq(
            $.selector_argument,
            repeat(seq(",", $.selector_argument)),
            optional(","),
          )),
        ),
        "]",
      ),

    selector_arguments_macro: ($) =>
      seq(
        token.immediate("["),
        optional(field("argument",
          seq(
            $.selector_argument_macro,
            repeat(seq(",", $.selector_argument_macro)),
            optional(","),
          )),
        ),
        "]",
      ),

    selector_argument: ($) => seq($.selector_key, "=", $._selector_value),
    selector_argument_macro: ($) => seq($.selector_key_macro, "=", $._selector_value_macro),

    selector_key: ($) => $._unquoted_identifier,
    selector_key_macro: ($) => choice(prec(1, $.macro_interpolation), $._unquoted_identifier),

    _selector_value: ($) =>
      choice($.string, $.number, $.nbt_compound, $.selector_value_content),
    _selector_value_macro: ($) =>
      choice($.string, $.number, $.nbt_compound_macro, $.selector_value_content, $.macro_interpolation),

    selector_value_content: ($) => /[^\],{\[\s]+/,

    // Resource Location (e.g., minecraft:diamond)
    resource_location: ($) =>
      choice(
        token(prec(1, /[a-z0-9_.\-]+:[a-z0-9_.\-/]+/)),
        token(prec(2, seq('"', /[a-z0-9_.\-]+:[a-z0-9_.\-\/]+/, '"'))),
      ),

    // Coordinates sequence (3 numbers, relative, or local)
    coordinates: ($) =>
      prec.dynamic(2, seq($._coordinate, $._coordinate, $._coordinate)),

    // Single coordinate value
    _coordinate: ($) =>
      choice(
        $._absolute_coordinate,
        $._relative_coordinate,
        $._local_coordinate,
      ),

    // Absolute coordinate (e.g., 10, -5.5) - explicitly uses number
    _absolute_coordinate: ($) => alias($.number, "_number"),

    // Relative coordinate (e.g., ~10, ~)
    _relative_coordinate: ($) => token(prec(1, /~-?(\d+(\.\d+)?|\.\d+)?/)),

    // Local coordinate (e.g., ^10, ^)
    _local_coordinate: ($) => token(prec(1, /\^-?(\d+(\.\d+)?|\.\d+)?/)),

    // Macro interpolation (e.g., $(name))
    macro_interpolation: ($) => token(prec(1, seq("$(", /[^)]*/, ")"))),

    // Immediate macro interpolation for use inside other rules (no leading extras allowed)
    _macro_interpolation_immediate: ($) =>
      token.immediate(prec(2, seq("$(", /[^)]*/, ")"))),

    // A sequence of text and macros that forms an unquoted identifier
    _unquoted_identifier: ($) =>
      seq(
        choice(/[a-zA-Z0-9_]+/, $.macro_interpolation),
        repeat(
          choice(
            token.immediate(/[a-zA-Z0-9_]+/),
            alias($._macro_interpolation_immediate, $.macro_interpolation),
          ),
        ),
      ),
    // Immediate argument text for macro components
    _macro_arg_text_immediate: ($) => token.immediate(/([^\\$ \t\r\n\[\]\{\}]|\\[^\r\n])+/),

    macro_component: ($) =>
      prec.right(1, choice(
        seq(
          $.argument_common,
          repeat1(choice(
            alias($._macro_arg_text_immediate, $.argument_common),
            alias($._macro_interpolation_immediate, $.macro_interpolation),
          )),
        ),
        seq(
          $.macro_interpolation,
          repeat(choice(
            alias($._macro_arg_text_immediate, $.argument_common),
            alias($._macro_interpolation_immediate, $.macro_interpolation),
          )),
        ),
      )),

    // A single argument within a command.
    // A single argument within a command.
    _argument_shared: ($) =>
      choice(
        $.run_clause,
        $.nbt_path,
        $.named_list,
        $.named_compound,
        $.string,
        $.boolean,
        $.number,
        $.nbt_compound,
        $.nbt_array,
        $.selector,
        $.resource_location,
        $.coordinates,
        $.selector_arguments,
        $.fake_player,
      ),
    _argument_shared_macro: ($) =>
      choice(
        $.run_clause_macro,
        $.nbt_path_macro,
        $.named_list_macro,
        $.named_compound_macro,
        $.string,
        $.boolean,
        $.number,
        $.nbt_compound_macro,
        $.nbt_array_macro,
        $.selector_macro,
        $.resource_location,
        $.coordinates,
        $.selector_arguments_macro,
        $.fake_player,
      ),

    run_clause: ($) => prec(5, seq(
      "run",
      $.command
    )),
    run_clause_macro: ($) => alias(prec(5, seq(
      "run",
      $._command_macro_aware
    )), $.run_clause),
    _argument_normal: ($) =>
      choice(
        $._argument_shared,
        $._argument_literal,
      ),

    _argument_macro: ($) =>
      choice(
        $._argument_shared_macro,
        $.argument_common,
        $.macro_component,
      ),
  },
});