export default grammar({
  name: "mcfunction",

  extras: ($) => [
    /[ \t\r]/, 
    /\\\r?\n/,
  ],

  conflicts: ($) => [
    [$._argument, $._absolute_coordinate],
  ],

  rules: {
    source_file: ($) => repeat(choice($.comment_line, $.command, "\n")),
    // For comment:
    comment_line: ($) =>
      choice($._comment_directive, $._comment_important, $._comment_normal),
    comment_content: ($) => token(repeat1(choice(/[^\n\\]/, /\\./, /\\\r?\n/))),
    // --- Normal Comments ---
    // A normal comment line (e.g., # content).
    _comment_normal: ($) =>
      seq(
        field("tag", $.comment_tag_normal),
        field("content", optional($.comment_content)),
      ),
    // The tag prefix for normal comments (#).
    comment_tag_normal: ($) => token(prec(1, /#/)),

    // --- Important Comments ---
    // An important comment marked explicitly (e.g., #! content).
    _comment_important: ($) =>
      seq(
        field("tag", $.comment_tag_important),
        field("content", optional($.comment_content)),
      ),
    // The tag prefix for important comments (#! or #@).
    comment_tag_important: ($) => token(prec(2, /#[!@]/)),

    // --- Directive Comments ---
    // A comment used as a processing directive (e.g., #> key: value).
    _comment_directive: ($) =>
      seq(
        field("tag", $.comment_tag_directive),
        field("content", $.directive_content),
      ),
    // The tag prefix for directive comments (#>).
    comment_tag_directive: ($) => token(prec(2, /#>/)),
    // The structured content for a directive comment.
    directive_content: ($) =>
      seq($.directive_key, ":", optional($.directive_value)),
    // The key part of a directive.
    directive_key: ($) => token(/[^:\r\n]+/),
    // The value part of a directive.
    directive_value: ($) => $.comment_content,
    // A command with its name and arguments.
    command: ($) => choice($._command_normal, $._command_macro),
    // Command types
    _command_normal: ($) =>prec.right(seq($.command_name, repeat($._argument))),
    _command_macro: ($) => prec.right(seq($.command_name_macro, repeat(choice($._argument, $.macro_interpolation)))),
    // A argument_common argument type for content that doesn't match specialized types.
    argument_common: ($) =>
      choice(
        token(
          seq(
            choice(/[^"'\s\\\[{^~\\$]/, seq("\\", /[^\r\n]/)),
            repeat(choice(/[^\s\\\$]/, seq("\\", /[^\r\n]/))),
          ),
        ),
        "$"
      ),
    // The name of the command being executed.
    command_name: ($) => token(/[a-z0-9_.]+/),
    command_name_macro: ($) => seq("$", token(/[a-z0-9_.]+/)),
    // Arguments:
    // A string argument, either single or double quoted.
    string: ($) => choice($._double_quoted_string, $._single_quoted_string),
    // A string enclosed in double quotes.
    _double_quoted_string: ($) =>
      token(seq('"', repeat(choice(/[^"\\\n]/, /\\./)), '"')),
    // A string enclosed in single quotes.
    _single_quoted_string: ($) =>
      token(seq("'", repeat(choice(/[^'\\\n]/, /\\./)), "'")),
    // A boolean literal (true or false).
    boolean: ($) => choice("true", "false"),
    // A numerical value, optionally with a type suffix (e.g., 1.0f).
    number: ($) =>
      token(
        prec(
          1,
          seq(/-?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?/, optional(/[bslfdtBSLFDT]/)),
        ),
      ),
    // An NBT array (e.g., [1, 2, 3]).
    nbt_array: ($) =>
      prec(1,
        seq(
          "[",
          optional(
            seq($._nbt_value, repeat(seq(",", $._nbt_value)), optional(",")),
          ),
          "]",
        )),
    // A value that can be stored in an NBT array.
    _nbt_value: ($) => choice($.string, $.number, $.boolean, $.nbt_array),
    // An NBT compound (e.g., {key: "value"}).
    nbt_compound: ($) =>
      seq(
        "{",
        optional(seq($._nbt_pair, repeat(seq(",", $._nbt_pair)), optional(","))),
        "}",
      ),

    // A key-value pair within an NBT compound.
    _nbt_pair: ($) => seq($.nbt_key, ":", $._nbt_value),

    // The key of an NBT pair.
    nbt_key: ($) => choice($.string, /[a-zA-Z_][a-zA-Z0-9_]*/),

    // A value within an NBT compound, including nested compounds.
    _nbt_value: ($) =>
      choice($.string, $.number, $.boolean, $.nbt_compound, $.nbt_array),
    // Selector

    selector: ($) => prec.right(seq($.selector_variable, optional($._selector_arguments))),

    selector_variable: ($) => token(prec(1, /@[parsen]/)),

    _selector_arguments: ($) =>
      seq(
        "[",
        optional(
          seq(
            $._selector_argument,
            repeat(seq(",", $._selector_argument)),
            optional(","),
          ),
        ),
        "]",
      ),

    _selector_argument: ($) => seq($.selector_key, "=", $._selector_value),

    selector_key: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    _selector_value: ($) =>
      choice($.string, $.number, $.nbt_compound, $.selector_value_content),

    selector_value_content: ($) => /[^\],\s]+/,

    // Resource Location (e.g., minecraft:diamond)
    resource_location: ($) => token(prec(1, /[a-z0-9_.\-]+:[^\s\{\[]+/)),

    // Coordinates sequence (3 numbers, relative, or local)
    coordinates: ($) => prec.dynamic(2, seq($._coordinate, $._coordinate, $._coordinate)),

    // Single coordinate value
    _coordinate: ($) => choice($._absolute_coordinate, $._relative_coordinate, $._local_coordinate),

    // Absolute coordinate (e.g., 10, -5.5) - explicitly uses number
    _absolute_coordinate: ($) => alias($.number, "_number"),

    // Relative coordinate (e.g., ~10, ~)
    _relative_coordinate: ($) => token(prec(1, /~-?(\d+(\.\d+)?|\.\d+)?/)),

    // Local coordinate (e.g., ^10, ^)
    _local_coordinate: ($) => token(prec(1, /\^-?(\d+(\.\d+)?|\.\d+)?/)),

    // Macro interpolation (e.g., $(name))
    macro_interpolation: ($) => token(prec(1, seq("$(", /[^)]*/, ")"))),
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
        $._selector_arguments,
      ),
  },
});
