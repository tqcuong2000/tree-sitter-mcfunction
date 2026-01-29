export default grammar({
  name: "mcfunction",

  extras: ($) => [/[ \t\r]/, /\\\r?\n/],

  conflicts: ($) => [[$._argument, $._absolute_coordinate]],

  rules: {
    source_file: ($) =>
      seq(
        repeat(choice(seq($.comment_line, "\n"), seq($.command, "\n"), "\n")),
        optional(choice($.comment_line, $.command)),
      ),
    // For comment:
    comment_line: ($) =>
      choice($.comment_directive, $.comment_important, $.comment_normal),
    comment_content: ($) => token(repeat1(choice(/[^\\\r\n]/, /\\./, /\\\r?\n/))),
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
    _command_normal: ($) =>
      prec.right(seq($.command_name, repeat($._argument))),
    _command_macro: ($) =>
      prec.right(
        seq(
          $.command_name_macro,
          repeat(choice($._argument, $.macro_interpolation)),
        ),
      ),
    // A argument_common argument type for content that doesn't match specialized types.
    argument_common: ($) =>
      choice(
        token(
          seq(
            choice(/[^"'\s\\\[{^~\\$]/, seq("\\", /[^\r\n]/)),
            repeat(choice(/[^\s\\\$]/, seq("\\", /[^\r\n]/))),
          ),
        ),
        "$",
      ),
    // The name of the command being executed.
    command_name: ($) => token(/[a-z0-9_.]+/),
    command_name_macro: ($) => seq("$", token(/[a-z0-9_.]+/)),
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
    boolean: ($) => choice("true", "false"),
    // Fake player name
    fake_player: ($) => token(/#[^\s\{\[\]"']+/),
    // Unquoted string
    unquoted_string: ($) => $._unquoted_identifier,
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

    // The key of an NBT pair.
    nbt_key: ($) => choice($.string, $._unquoted_identifier),

    // A value within an NBT compound, including nested compounds.
    _nbt_value: ($) =>
      choice(
        $.string,
        $.number,
        $.boolean,
        $.nbt_compound,
        $.nbt_array,
        $.unquoted_string),
    // Selector

    selector: ($) =>
      prec.right(seq($.selector_variable, optional($.selector_arguments))),
    selector_variable: ($) => token(prec(1, /@[parsen]/)),

    selector_arguments: ($) =>
      seq(
        "[",
        optional(field("argument",
          seq(
            $.selector_argument,
            repeat(seq(",", $.selector_argument)),
            optional(","),
          )),
        ),
        "]",
      ),

    selector_argument: ($) => seq($.selector_key, "=", $._selector_value),

    selector_key: ($) => choice(prec(1, $.macro_interpolation), $._unquoted_identifier),

    _selector_value: ($) =>
      choice($.string, $.number, $.nbt_compound, $.selector_value_content, $.macro_interpolation),

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
    // A single argument within a command.
    _argument: ($) =>
      choice(
        $.string,
        $.boolean,
        $.number,
        $.nbt_compound,
        $.nbt_array,
        $.argument_common,
        $.selector,
        $.resource_location,
        $.coordinates,
        $.selector_arguments,
        $.fake_player,
      ),
  },
});
