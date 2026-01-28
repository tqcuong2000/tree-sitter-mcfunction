# Tree-sitter Grammar Guide for Developers

> **Complete reference for building tree-sitter parsers from scratch**
>
> After reading this guide, you will understand how to write grammar.js files, avoid common pitfalls, and build working parsers.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Project Structure](#2-project-structure)
3. [Grammar DSL Fundamentals](#3-grammar-dsl-fundamentals)
4. [Token vs Rule Design](#4-token-vs-rule-design)
5. [Naming Conventions](#5-naming-conventions)
6. [Common Grammar Functions](#6-common-grammar-functions)
7. [Precedence & Associativity](#7-precedence--associativity)
8. [Extras & Whitespace Handling](#8-extras--whitespace-handling)
9. [Conflict Resolution](#9-conflict-resolution)
10. [Keywords & Identifiers](#10-keywords--identifiers)
11. [Error Recovery](#11-error-recovery)
12. [Regular Expression Limitations](#12-regular-expression-limitations)
13. [Best Practices & Common Mistakes](#13-best-practices--common-mistakes)
14. [Practical Examples](#14-practical-examples)
15. [Grammar Template Skeleton](#15-grammar-template-skeleton)
16. [Grammar Builder Checklist](#16-grammar-builder-checklist)
17. [References](#17-references)

---

## 1. Introduction

### What is Tree-sitter?

**Tree-sitter** is a parser generator tool and incremental parsing library that builds concrete syntax trees for source code. It's designed to be fast, robust, and error-tolerant.

**Source:** [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter)

### How Tree-sitter Works

Tree-sitter operates in two phases:

1. **Lexical Analysis (Lexer):** Converts source code into tokens using regular expressions
2. **Syntactic Analysis (Parser):** Builds a syntax tree using Context-Free Grammar (CFG) rules

```
Source Code → [Lexer] → Tokens → [Parser] → Syntax Tree
```

**Key Insight:** 
- Lexer uses **regex patterns** (within `token()`)
- Parser uses **grammar rules** (CFG with `seq`, `choice`, `repeat`, etc.)

---

## 2. Project Structure

### Essential Files

When you run `tree-sitter init`, you get the following structure:

```
tree-sitter-yourlang/
├── grammar.js              # Grammar definition (REQUIRED)
├── src/
│   ├── parser.c           # Generated parser (auto-generated)
│   ├── grammar.json       # Compiled grammar (auto-generated)
│   └── node-types.json    # Node type info (auto-generated)
├── bindings/              # Language bindings
├── queries/
│   └── highlights.scm     # Syntax highlighting queries
├── test/
│   └── corpus/            # Test cases
├── package.json           # NPM metadata
└── tree-sitter.json       # CLI configuration
```

**Source:** [Tree-sitter CLI - Init](https://tree-sitter.github.io/tree-sitter/cli/init)

### Workflow

```bash
# 1. Edit your grammar
vim grammar.js

# 2. Generate the parser
tree-sitter generate

# 3. Test your parser
tree-sitter parse example.txt

# 4. Run tests
tree-sitter test
```

**Source:** [Creating Parsers - Getting Started](https://tree-sitter.github.io/tree-sitter/creating-parsers/1-getting-started)

---

## 3. Grammar DSL Fundamentals

### Basic Grammar Structure

```javascript
module.exports = grammar({
  name: 'my_language',
  
  extras: $ => [
    /\s/,          // whitespace
    $.comment,
  ],
  
  rules: {
    source_file: $ => repeat($._statement),
    
    _statement: $ => choice(
      $.expression,
      $.return_statement,
    ),
    
    // ... more rules
  }
});
```

**Source:** [Grammar DSL - Schema](https://tree-sitter.github.io/tree-sitter/assets/schemas/grammar.schema)

### Grammar Configuration Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Grammar name (required) |
| `rules` | Object | Grammar rules (required) |
| `extras` | Array | Tokens allowed anywhere (whitespace, comments) |
| `inline` | Array | Rules to inline/remove from tree |
| `conflicts` | Array | Intentional LR(1) ambiguities |
| `externals` | Array | External scanner tokens |
| `precedences` | Array | Named precedence levels |
| `word` | String | Token for keyword matching |
| `supertypes` | Array | Abstract node type categories |

**Source:** [Grammar Configuration Fields](https://tree-sitter.github.io/tree-sitter/print)

### Rule Types

Tree-sitter rules are represented internally as:

- `STRING`: String literal (e.g., `'if'`, `'+'`)
- `PATTERN`: Regular expression (e.g., `/[a-z]+/`)
- `SYMBOL`: Reference to another rule (e.g., `$.identifier`)
- `SEQ`: Sequence of rules
- `CHOICE`: Alternatives
- `REPEAT`: Zero or more
- `REPEAT1`: One or more
- `TOKEN`: Atomic lexical token
- `FIELD`: Named child node
- `PREC`: Precedence wrapper
- `ALIAS`: Rename node

**Source:** [Grammar Rule Definitions](https://tree-sitter.github.io/tree-sitter/assets/schemas/grammar.schema)

---

## 4. Token vs Rule Design

### When to Use `token()`

**Use `token()` for lexical units that should be matched atomically:**

```javascript
//  Good: Comment is a single token
comment: $ => token(/#[^\n]*/),

//  Good: Multi-line comment as single token
multiline_comment: $ => token(seq(
  '/*',
  /[^*]*\*+([^/*][^*]*\*+)*/,
  '/'
)),

//  Good: Identifier with regex
identifier: $ => token(/[a-zA-Z_][a-zA-Z0-9_]*/),
```

**Source:** [Token Helper Function](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

### When NOT to Use `token()`

**Don't use `token()` for structural rules:**

```javascript
//  Bad: This should be a regular rule
function_call: $ => token(seq(
  $.identifier,
  '(',
  $.arguments,
  ')'
)),

//  Good: Structural rule without token()
function_call: $ => seq(
  $.identifier,
  '(',
  optional($.arguments),
  ')'
),
```

### `token.immediate()`

**Use when token must appear with no whitespace:**

```javascript
// Template literal: `hello ${name}`
template_literal: $ => seq(
  '`',
  repeat(choice(
    $.template_chars,
    seq(
      '${',
      $.expression,
      token.immediate('}')  // No space before }
    )
  )),
  '`'
),
```

**Source:** [Immediate Token](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

### Critical Rule

> **Regex only works inside `token()`**. You cannot use regex in regular CFG rules for nested structures.

---

## 5. Naming Conventions

### Named Nodes

**Rules without underscore prefix create named nodes:**

```javascript
rules: {
  // These appear as named nodes in the tree
  identifier: $ => /[a-z]+/,
  function_definition: $ => seq('func', $.identifier),
  binary_expression: $ => seq($.expr, '+', $.expr),
}
```

**Syntax tree output:**
```
(function_definition
  (identifier))
```

**Source:** [Named vs Anonymous Nodes](https://tree-sitter.github.io/tree-sitter/print)

### Anonymous Nodes

**String literals become anonymous nodes:**

```javascript
// 'func', '(', ')', '{', '}' are anonymous
function_definition: $ => seq(
  'func',           // anonymous
  $.identifier,     // named
  '(',             // anonymous
  ')',             // anonymous
  $.block          // named
),
```

### Hidden Rules

**Rules starting with `_` are hidden from the tree:**

```javascript
rules: {
  statement: $ => choice(
    $.return_statement,
    $.expression_statement,
  ),
  
  // Hidden - wraps a single child
  _expression: $ => choice(
    $.binary_expression,
    $.unary_expression,
    $.identifier,
    $.number,
  ),
}
```

**Why hide rules?**
- Reduce tree depth and noise
- Useful for rules that just wrap alternatives
- Common pattern: `_expression`, `_statement`, `_type`

**Source:** [Hidden Rules](https://tree-sitter.github.io/tree-sitter/creating-parsers/3-writing-the-grammar)

### Supertypes

**Group multiple node types under abstract categories:**

```javascript
module.exports = grammar({
  name: 'my_lang',
  
  supertypes: [
    '_expression',    // Groups all expression types
    '_statement',     // Groups all statement types
  ],
  
  rules: {
    _expression: $ => choice(
      $.binary_expr,
      $.unary_expr,
      $.literal,
    ),
  }
});
```

**Source:** [Supertypes](https://tree-sitter.github.io/tree-sitter/print)

---

## 6. Common Grammar Functions

### `seq(rule1, rule2, ...)`

**Match rules in sequence (concatenation):**

```javascript
// Matches: func foo() {}
function_definition: $ => seq(
  'func',
  $.identifier,
  $.parameter_list,
  $.block
),
```

**Source:** [Sequence Rule](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

### `choice(rule1, rule2, ...)`

**Match one alternative (union):**

```javascript
// Matches: if OR for OR while
keyword: $ => choice(
  'if',
  'for',
  'while'
),

_statement: $ => choice(
  $.if_statement,
  $.for_statement,
  $.return_statement,
),
```

**Source:** [Choice Rule](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

### `repeat(rule)`

**Zero or more occurrences:**

```javascript
// Matches: "", "aaa", "aaaaaaa"
source_file: $ => repeat($.statement),

// Matches zero or more parameters
parameter_list: $ => seq(
  '(',
  repeat(seq($.parameter, ',')),
  optional($.parameter),
  ')'
),
```

**Source:** [Repeat Rule](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

### `repeat1(rule)`

**One or more occurrences:**

```javascript
// Must have at least one statement
block: $ => seq(
  '{',
  repeat1($.statement),  // At least 1
  '}'
),

// At least one digit
number: $ => /\d+/,  // equivalent to repeat1(/\d/)
```

**Source:** [Repeat1 Rule](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

### `optional(rule)`

**Zero or one occurrence:**

```javascript
// Optional return type
function_definition: $ => seq(
  'func',
  $.identifier,
  $.parameters,
  optional(seq(':', $.type)),  // May or may not have type
  $.block
),
```

**Source:** [Optional Rule](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

### `field(name, rule)`

**Assign a name to child nodes:**

```javascript
function_definition: $ => seq(
  'func',
  field('name', $.identifier),
  field('parameters', $.parameter_list),
  field('return_type', optional($.type)),
  field('body', $.block)
),

// Access in C API: ts_node_child_by_field_name(node, "name", 4)
```

**Benefits:**
- Access children by name instead of index
- More maintainable than positional access
- Used in queries: `(function_definition name: (identifier) @func-name)`

**Source:** [Field Names](https://tree-sitter.github.io/tree-sitter/creating-parsers/3-writing-the-grammar)

### `alias(rule, name)`

**Rename a node in the syntax tree:**

```javascript
// Make different operators appear with same name
_binary_operator: $ => choice(
  alias('+', $.add),
  alias('-', $.subtract),
  alias('*', $.multiply),
),

// Named alias (symbol)
statement: $ => alias($.expression, $.expression_statement),

// Anonymous alias (string)
keyword: $ => alias('fn', 'function'),
```

**Source:** [Alias Helper Function](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

---

## 7. Precedence & Associativity

### Why Precedence Matters

**Without precedence, you get conflicts:**

```
Error: Unresolved conflict for symbol sequence:

  _expression  '*'  _expression  •  '*'  …

Possible interpretations:

  1:  _expression  '*'  (binary_expression  _expression  •  '*'  _expression)
  2:  (binary_expression  _expression  '*'  _expression)  •  '*'  …
```

**Source:** [Tree-sitter Error - Ambiguity](https://tree-sitter.github.io/tree-sitter/creating-parsers/3-writing-the-grammar)

### `prec(number, rule)`

**Assign numeric precedence:**

```javascript
_expression: $ => choice(
  $.identifier,
  $.number,
  prec(2, $.multiplication),   // Higher precedence
  prec(1, $.addition),          // Lower precedence
  prec(3, $.unary_expression),  // Highest precedence
),

multiplication: $ => seq($._expression, '*', $._expression),
addition: $ => seq($._expression, '+', $._expression),
unary_expression: $ => seq('-', $._expression),
```

**Result:** 
- `-a * b` parses as `(-a) * b`, not `-(a * b)`
- `a + b * c` parses as `a + (b * c)`

**Source:** [Precedence Helper](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

### `prec.left(number, rule)`

**Left associativity - matches ending earlier:**

```javascript
binary_expression: $ => choice(
  prec.left(2, seq($._expression, '*', $._expression)),
  prec.left(2, seq($._expression, '/', $._expression)),
  prec.left(1, seq($._expression, '+', $._expression)),
  prec.left(1, seq($._expression, '-', $._expression)),
),
```

**Result:**
- `a * b * c` → `(a * b) * c` (left associative)
- `a + b + c` → `(a + b) + c`

**Source:** [Left Associativity](https://tree-sitter.github.io/tree-sitter/creating-parsers/3-writing-the-grammar)

### `prec.right(number, rule)`

**Right associativity - matches ending later:**

```javascript
// Assignment is right-associative
assignment: $ => prec.right(1, seq(
  $.identifier,
  '=',
  $._expression
)),

// Exponentiation is right-associative
power: $ => prec.right(3, seq(
  $._expression,
  '**',
  $._expression
)),
```

**Result:**
- `a = b = c` → `a = (b = c)`
- `2 ** 3 ** 2` → `2 ** (3 ** 2)` = 512

### `prec.dynamic(number, rule)`

**Runtime disambiguation when conflicts arise:**

```javascript
// Handles ambiguous parsing at runtime
expression: $ => choice(
  prec.dynamic(1, $.cast_expression),
  prec.dynamic(0, $.binary_expression),
),
```

**Use when:** Multiple interpretations are valid during parsing, and you need runtime resolution.

**Source:** [Dynamic Precedence](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

### Common Precedence Levels

```javascript
// Typical precedence hierarchy (higher number = higher precedence)
binary_expression: $ => choice(
  // Level 1: Logical OR
  prec.left(1, seq($._expression, '||', $._expression)),
  
  // Level 2: Logical AND
  prec.left(2, seq($._expression, '&&', $._expression)),
  
  // Level 3: Equality
  prec.left(3, seq($._expression, '==', $._expression)),
  prec.left(3, seq($._expression, '!=', $._expression)),
  
  // Level 4: Relational
  prec.left(4, seq($._expression, '<', $._expression)),
  prec.left(4, seq($._expression, '>', $._expression)),
  
  // Level 5: Addition/Subtraction
  prec.left(5, seq($._expression, '+', $._expression)),
  prec.left(5, seq($._expression, '-', $._expression)),
  
  // Level 6: Multiplication/Division
  prec.left(6, seq($._expression, '*', $._expression)),
  prec.left(6, seq($._expression, '/', $._expression)),
  
  // Level 7: Unary
  prec(7, seq('-', $._expression)),
  prec(7, seq('!', $._expression)),
  
  // Level 8: Member access
  prec.left(8, seq($._expression, '.', $.identifier)),
  prec.left(8, seq($._expression, '[', $._expression, ']')),
),
```

---

## 8. Extras & Whitespace Handling

### The `extras` Field

**Define tokens that can appear anywhere between other tokens:**

```javascript
module.exports = grammar({
  name: 'my_language',
  
  extras: $ => [
    /\s/,              // Whitespace (space, tab, newline)
    $.comment,         // Line comments
    $.block_comment,   // Block comments
  ],
  
  rules: {
    // extras are automatically allowed between any tokens
  }
});
```

**Source:** [Defining Extras](https://tree-sitter.github.io/tree-sitter/creating-parsers/3-writing-the-grammar)

### Best Practice: Define Complex Extras as Rules

```javascript
//  Less preferable - inline definition
extras: $ => [
  /\s/,
  token(choice(
    seq('//', /.*/),
    seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')
  ))
],

//  More preferable - separate rule
extras: $ => [
  /\s/,
  $.comment,
],

rules: {
  comment: $ => token(choice(
    seq('//', /.*/),
    seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')
  )),
}
```

**Why?**
- Better performance
- Smaller parser size
- More readable

**Source:** [Extras Best Practice](https://tree-sitter.github.io/tree-sitter/print)

### Example: Comments

```javascript
rules: {
  // Line comment: // anything until newline
  line_comment: $ => token(seq('//', /.*/)),
  
  // Block comment: /* ... */
  block_comment: $ => token(seq(
    '/*',
    /[^*]*\*+([^/*][^*]*\*+)*/,
    '/'
  )),
  
  // Shell-style comment: # anything
  comment: $ => token(/#[^\n]*/),
}
```

---

## 9. Conflict Resolution

### Understanding Conflicts

**Tree-sitter uses LR(1) parsing, which can have ambiguities:**

```
Error: Unresolved conflict for symbol sequence:

  '-'  _expression  •  '*'  …

Possible interpretations:

  1:  '-'  (binary_expression  _expression  •  '*'  _expression)
  2:  (unary_expression  '-'  _expression)  •  '*'  …

Possible resolutions:

  1:  Specify a higher precedence in `binary_expression`
  2:  Specify a higher precedence in `unary_expression`
  3:  Add a conflict for these rules: `binary_expression` `unary_expression`
```

**Source:** [Unresolved Conflict Error](https://tree-sitter.github.io/tree-sitter/creating-parsers/3-writing-the-grammar)

### Solution 1: Use Precedence

```javascript
// Fix: Give unary higher precedence
_expression: $ => choice(
  prec.left(1, $.binary_expression),
  prec(2, $.unary_expression),  // Higher precedence
  $.identifier,
),
```

### Solution 2: Declare Intentional Conflicts

**When ambiguity is unavoidable, declare it explicitly:**

```javascript
module.exports = grammar({
  name: 'javascript',
  
  conflicts: $ => [
    [$.array, $.array_pattern],           // Conflict 1
    [$.object, $.object_pattern],         // Conflict 2
    [$.expression, $.primary_expression], // Conflict 3
  ],
  
  rules: {
    // ...
  }
});
```

**What this does:**
- Tells tree-sitter: "These conflicts are intentional"
- Parser will explore both interpretations
- GLR (Generalized LR) parsing handles ambiguity

**Source:** [Conflicts Declaration](https://tree-sitter.github.io/tree-sitter/print)

### When to Use `conflicts`

Use `conflicts` when:
1. Both interpretations are valid in different contexts
2. Precedence cannot resolve the ambiguity
3. The language itself is inherently ambiguous

**Example: JavaScript Array vs Array Pattern**

```javascript
// Could be array literal or destructuring pattern
[a, b, c]

// As expression: array literal
let x = [a, b, c];

// As pattern: destructuring
let [a, b, c] = values;
```

---

## 10. Keywords & Identifiers

### The Problem

**Keywords can be mistaken for identifiers:**

```javascript
// Without special handling:
identifier: $ => /[a-z]+/,

// "instanceof" could be tokenized as identifier
// even when it should be a keyword
```

### The `word` Token

**Improves keyword matching and error detection:**

```javascript
module.exports = grammar({
  name: 'javascript',
  
  word: $ => $.identifier,  // Specify the "word" token
  
  rules: {
    identifier: $ => /[a-z_][a-z0-9_]*/,
    
    _expression: $ => choice(
      $.identifier,
      $.binary_expression,
      // ...
    ),
    
    binary_expression: $ => choice(
      seq($._expression, 'instanceof', $._expression),
      seq($._expression, 'in', $._expression),
      // ...
    ),
  }
});
```

**What it does:**
1. Tree-sitter identifies keywords that match the word token pattern
2. During lexing, it matches the word token first
3. Then checks if it's a keyword in the current context
4. Prevents `instanceofFoo` from being split into two tokens

**Benefits:**
- Correct keyword recognition
- Better error detection
- Performance improvement (simpler lexing function)

**Source:** [The word Token](https://tree-sitter.github.io/tree-sitter/creating-parsers/3-writing-the-grammar)

### Reserved Words

**Override global reserved word set for specific rules:**

```javascript
// For context-sensitive keywords
parameter: $ => choice(
  reserved(['if', 'else'], $.conditional_keyword),
  $.identifier
),
```

**Source:** [Reserved Keywords](https://tree-sitter.github.io/tree-sitter/print)

---

## 11. Error Recovery

### ERROR Nodes

**When parser encounters invalid syntax, it creates ERROR nodes:**

```javascript
// Source code with error:
func foo( {  // Missing closing paren
  return 1;
}

// Syntax tree includes:
(source_file
  (function_definition
    (identifier)
    (ERROR)  // <-- Error node
    (block ...)))
```

**Source:** [ERROR Node](https://tree-sitter.github.io/tree-sitter/using-parsers/queries/1-syntax)

### MISSING Nodes

**Parser inserts expected tokens that are missing:**

```javascript
// Source code:
if (condition)  // Missing block

// Tree includes MISSING node for expected block
(if_statement
  condition: (identifier)
  consequence: (MISSING))
```

**Source:** [MISSING Node](https://tree-sitter.github.io/tree-sitter/using-parsers/queries/1-syntax)

### Querying Errors

```scheme
; Match any error node
(ERROR) @error-node

; Match missing nodes
(MISSING) @missing-node
```

### External Scanner Error Recovery

**In external scanners, handle error recovery mode:**

```c
bool tree_sitter_my_language_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {
  // Check if in error recovery mode
  if (valid_symbols[ERROR_SENTINEL]) {
    return false;  // Let internal lexer handle it
  }
  
  // Normal scanning logic...
}
```

**Source:** [Error Recovery in External Scanner](https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners)

---

## 12. Regular Expression Limitations

### What Regex CAN Do in Tree-sitter

 **Character matching:**
```javascript
identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
number: $ => /\d+/,
hex_number: $ => /0x[0-9a-fA-F]+/,
```

 **Character classes and ranges:**
```javascript
whitespace: $ => /[\s\t\n\r]+/,
letter: $ => /[a-zA-Z]/,
```

 **Quantifiers:**
```javascript
one_or_more: $ => /a+/,
zero_or_more: $ => /a*/,
optional: $ => /a?/,
exact: $ => /a{3}/,
range: $ => /a{2,5}/,
```

 **Alternation:**
```javascript
keyword: $ => /if|else|while|for/,
```

 **Grouping:**
```javascript
comment: $ => token(seq('//', /.*/)),
```

 **Unicode escapes:**
```javascript
unicode_char: $ => /\u0041/,  // 'A'
```

**Source:** [Regex in Tree-sitter](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

### What Regex CANNOT Do

 **Nested structures** (requires CFG):
```javascript
//  Wrong: Cannot match nested parens with regex
nested_parens: $ => /\(([^()]|\([^()]*\))*\)/,  // Fails for ((()))

//  Correct: Use grammar rules
nested_parens: $ => seq(
  '(',
  repeat(choice(
    $.nested_parens,  // Recursion!
    /[^()]/
  )),
  ')'
),
```

 **Lookahead/Lookbehind** (not in LR(1)):
```javascript
//  Not supported in tree-sitter regex
identifier: $ => /(?<!\.)\b[a-z]+\b/,  // Lookbehind not supported
```

 **Backreferences:**
```javascript
//  Not supported
quoted_string: $ => /(['"]).*?\1/,  // Backreference \1
```

 **Context-dependent matching:**
```javascript
//  Regex cannot handle different quote types dynamically
// Need grammar rules instead
```

### Critical Understanding

> **Regex in tree-sitter is ONLY for lexical tokens, not structural parsing.**
>
> For nested, recursive, or context-dependent structures, use grammar rules with `seq`, `choice`, `repeat`, etc.

**Source:** [Regex Limitations](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

---

## 13. Best Practices & Common Mistakes

###  Best Practices

#### 1. Use `token()` for Lexical Units

```javascript
//  Good
comment: $ => token(/#[^\n]*/),
string: $ => token(seq('"', /[^"]*/, '"')),
```

#### 2. Define Extras as Separate Rules

```javascript
//  Good
extras: $ => [/\s/, $.comment],
rules: {
  comment: $ => token(/#[^\n]*/),
}
```

#### 3. Use `prec.left` for Operators

```javascript
//  Good - clear associativity
binary_expr: $ => prec.left(1, seq($.expr, '+', $.expr)),
```

#### 4. Hide Wrapper Rules

```javascript
//  Good - reduces tree noise
_expression: $ => choice(
  $.binary_expr,
  $.literal,
  $.identifier,
),
```

#### 5. Use `field()` for Named Access

```javascript
//  Good - semantic access
function_def: $ => seq(
  'func',
  field('name', $.identifier),
  field('body', $.block),
),
```

#### 6. Test Edge Cases

```javascript
//  Good - test corpus with edge cases
==================
Empty function
==================
func foo() {}
---
(source_file
  (function_definition
    name: (identifier)
    body: (block)))
```

###  Common Mistakes

#### 1. Using Regex for Nested Structures

```javascript
//  Wrong - regex cannot handle nesting
balanced_parens: $ => /\(([^()]|\([^()]*\))*\)/,

//  Correct - use recursion
balanced_parens: $ => seq(
  '(',
  repeat(choice($.balanced_parens, /[^()]/)),
  ')'
),
```

#### 2. Forgetting `token()` Wrapper

```javascript
//  Wrong - comment will be split into tokens
comment: $ => seq('#', /.*/),

//  Correct - atomic token
comment: $ => token(seq('#', /.*/)),
```

#### 3. Overlapping Token Patterns

```javascript
//  Wrong - ambiguous
identifier: $ => /[a-z]+/,
keyword_if: $ => /if/,  // Overlaps with identifier!

//  Correct - use string literals for keywords
keyword: $ => choice('if', 'else', 'while'),
identifier: $ => /[a-z]+/,
```

#### 4. Not Specifying Precedence

```javascript
//  Wrong - will cause conflicts
binary_expr: $ => seq($.expr, '+', $.expr),

//  Correct - specify precedence
binary_expr: $ => prec.left(1, seq($.expr, '+', $.expr)),
```

#### 5. Greedy Regex Consuming Too Much

```javascript
//  Wrong - .* is greedy
string: $ => token(seq('"', /.*/, '"')),  // Matches "foo" "bar" as one string

//  Correct - use negated character class
string: $ => token(seq('"', /[^"]*/, '"')),
```

#### 6. Creating Unnecessary Named Nodes

```javascript
//  Wrong - too much tree depth
plus_operator: $ => '+',
multiply_operator: $ => '*',

//  Correct - use anonymous strings
binary_expr: $ => choice(
  seq($.expr, '+', $.expr),
  seq($.expr, '*', $.expr),
),
```

#### 7. Not Using `extras` for Whitespace

```javascript
//  Wrong - manual whitespace handling
statement: $ => seq(optional(/\s/), $.expr, optional(/\s/)),

//  Correct - use extras
extras: $ => [/\s/],
rules: {
  statement: $ => $.expr,  // Whitespace handled automatically
}
```

---

## 14. Practical Examples

### Example 1: Identifier

**Rule Definition:**

```javascript
identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
```

**Explanation:**
- Uses regex pattern for lexical matching
- First character: letter or underscore
- Subsequent characters: letters, digits, or underscores
- This is a **named node** (no underscore prefix)

**Test Cases:**

 **Matches:**
- `foo`
- `_bar`
- `myVar123`
- `__private__`

 **Does NOT match:**
- `123abc` (starts with digit)
- `my-var` (contains hyphen)
- `` (empty string)

**Common Mistakes:**

```javascript
//  Wrong: Missing token() when combining with other rules
identifier: $ => seq(/[a-z]/, repeat(/[a-z0-9]/)),

//  Correct: Use regex directly or wrap in token()
identifier: $ => /[a-z][a-z0-9]*/,
// OR
identifier: $ => token(seq(/[a-z]/, repeat(/[a-z0-9]/))),
```

---

### Example 2: Namespaced Identifier

**Rule Definition:**

```javascript
namespaced_identifier: $ => seq(
  field('namespace', $.identifier),
  ':',
  field('name', $.identifier)
),

identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
```

**Explanation:**
- Uses `seq()` to match parts in order
- Uses `field()` to name child nodes
- Colon `:` is an anonymous node
- This is a **structural rule**, not a token

**Test Cases:**

 **Matches:**
- `minecraft:stone`
- `mymod:custom_block`
- `namespace:id123`

 **Does NOT match:**
- `onlyidentifier` (missing colon)
- `namespace:` (missing second identifier)
- `:name` (missing first identifier)
- `name space:id` (space not allowed in identifier)

**Common Mistakes:**

```javascript
//  Wrong: Using token() for structural rule
namespaced_identifier: $ => token(seq(
  $.identifier,
  ':',
  $.identifier
)),
// This prevents whitespace: "foo : bar" won't match

//  Wrong: Using regex for the whole thing
namespaced_identifier: $ => /[a-z]+:[a-z]+/,
// Loses structure - can't access namespace/name separately

//  Correct: Use seq() with field()
namespaced_identifier: $ => seq(
  field('namespace', $.identifier),
  ':',
  field('name', $.identifier)
),
```

**Usage in Queries:**

```scheme
; Extract namespace and name separately
(namespaced_identifier
  namespace: (identifier) @namespace
  name: (identifier) @name)
```

---

### Example 3: Line Comment

**Rule Definition:**

```javascript
comment: $ => token(/#[^\n]*/),

// Add to extras to allow anywhere
extras: $ => [/\s/, $.comment],
```

**Explanation:**
- `token()` makes it a single atomic token
- `#` starts the comment
- `[^\n]*` matches anything except newline
- Included in `extras` so it can appear anywhere

**Test Cases:**

 **Matches:**
- `# This is a comment`
- `#`
- `# 123 special chars !@#$%`

 **Does NOT match:**
- `// C-style comment` (wrong syntax)
- `#!\nNewline` (stops at newline)

**Common Mistakes:**

```javascript
//  Wrong: Without token(), this splits into separate nodes
comment: $ => seq('#', /.*/),

//  Wrong: Greedy .* might consume too much
comment: $ => token(seq('#', /.*/)),  // Actually OK for line comments

//  Wrong: Not including in extras
// Comments won't be allowed everywhere

//  Correct
comment: $ => token(/#[^\n]*/),
extras: $ => [/\s/, $.comment],
```

---

### Example 4: Important Comment

**Rule Definition:**

```javascript
// From mcfunction grammar
important_comment: $ => token(/#[!>][^\n]*/),
comment: $ => token(/#[^!>\n][^\n]*/),

extras: $ => [/\s/, $.comment, $.important_comment],
```

**Explanation:**
- `#!` or `#>` starts important comment
- Regular comment excludes `!` and `>` after `#`
- Both are separate token types (different nodes)
- Order matters: important_comment should be checked first

**Test Cases:**

 **important_comment matches:**
- `#! Important directive`
- `#> Special marker`
- `#!/usr/bin/env` (shebang)

 **comment matches:**
- `# Regular comment`
- `## Not important`
- `#@ Other prefix`

 **Neither matches:**
- `// Wrong syntax`
- No leading `#`

**Common Mistakes:**

```javascript
//  Wrong: Overlapping patterns cause ambiguity
important_comment: $ => token(/#[!>].*/),
comment: $ => token(/#.*/),  // This captures EVERYTHING starting with #

//  Correct: Exclude important prefixes from regular comment
comment: $ => token(/#[^!>\n][^\n]*/),
important_comment: $ => token(/#[!>][^\n]*/),

//  Wrong: Wrong order in choice
_item: $ => choice(
  $.comment,            // Matches first, important_comment never reached!
  $.important_comment,
),

//  Correct: Specific patterns first
_item: $ => choice(
  $.important_comment,  // Check this first
  $.comment,
),
```

---

### Example 5: String Literal

**Rule Definition:**

```javascript
string_literal: $ => token(choice(
  seq('"', repeat(/[^"\\]|\\.?/), '"'),
  seq("'", repeat(/[^'\\]|\\.?/), "'"),
)),
```

**Explanation:**
- `token()` makes entire string one token
- `choice()` allows double or single quotes
- `[^"\\]` matches any char except quote or backslash
- `\\.?` matches escape sequences (backslash + any char)
- Quote type must match at both ends

**Test Cases:**

 **Matches:**
- `"hello world"`
- `'single quoted'`
- `"with \"escaped\" quotes"`
- `"newline: \n"`
- `""`

 **Does NOT match:**
- `"mismatched'` (different quote types)
- `"unclosed` (missing closing quote)
- `'multi
  line'` (newline not handled by this regex)

**Common Mistakes:**

```javascript
//  Wrong: Greedy .* consumes too much
string_literal: $ => token(seq('"', /.*/, '"')),
// Input: "foo" + "bar"
// Matches: "foo" + "bar" (entire thing as one string!)

//  Wrong: Not handling escapes
string_literal: $ => token(seq('"', /[^"]*/, '"')),
// Can't match: "say \"hello\""

//  Wrong: Not using token()
string_literal: $ => seq('"', /[^"]*/, '"'),
// Parser treats each part as separate token

//  Correct with escape sequences
string_literal: $ => token(seq(
  '"',
  repeat(choice(
    /[^"\\]/,      // Normal char
    /\\./,         // Escape sequence
  )),
  '"'
)),
```

**Enhanced Version (Multi-line strings):**

```javascript
string_literal: $ => token(choice(
  // Regular string
  seq('"', repeat(choice(/[^"\\]/, /\\./)), '"'),
  
  // Template literal (backtick)
  seq('`', repeat(choice(/[^`\\]/, /\\./)), '`'),
)),
```

---

### Example 6: Binary Expression with Precedence

**Rule Definition:**

```javascript
_expression: $ => choice(
  $.binary_expression,
  $.unary_expression,
  $.identifier,
  $.number,
),

binary_expression: $ => choice(
  // Multiplication (precedence 2)
  prec.left(2, seq(
    field('left', $._expression),
    field('operator', '*'),
    field('right', $._expression)
  )),
  
  // Division (precedence 2)
  prec.left(2, seq(
    field('left', $._expression),
    field('operator', '/'),
    field('right', $._expression)
  )),
  
  // Addition (precedence 1)
  prec.left(1, seq(
    field('left', $._expression),
    field('operator', '+'),
    field('right', $._expression)
  )),
  
  // Subtraction (precedence 1)
  prec.left(1, seq(
    field('left', $._expression),
    field('operator', '-'),
    field('right', $._expression)
  )),
),

unary_expression: $ => prec(3, seq(
  field('operator', choice('-', '!')),
  field('argument', $._expression)
)),

identifier: $ => /[a-z]+/,
number: $ => /\d+/,
```

**Explanation:**
- Higher precedence number = binds tighter
- `prec.left()` = left associative
- Multiplication/division: precedence 2
- Addition/subtraction: precedence 1
- Unary: precedence 3 (highest)
- `field()` names child nodes for semantic access

**Test Cases:**

 **Parses correctly:**

| Input | Parse Tree | Explanation |
|-------|-----------|-------------|
| `a + b * c` | `(+ a (* b c))` | Multiplication binds tighter |
| `a * b + c` | `(+ (* a b) c)` | Same precedence rule |
| `-a * b` | `(* (- a) b)` | Unary has highest precedence |
| `a + b + c` | `(+ (+ a b) c)` | Left associative |
| `a - b - c` | `(- (- a b) c)` | Left associative |

**Visual tree for `a + b * c`:**

```
(binary_expression
  left: (identifier)           ; a
  operator: "+"
  right: (binary_expression    ; b * c
    left: (identifier)         ; b
    operator: "*"
    right: (identifier)))      ; c
```

**Common Mistakes:**

```javascript
//  Wrong: No precedence specified
binary_expression: $ => seq($._expression, '+', $._expression),
// Error: Unresolved conflict for 'a + b + c'

//  Wrong: Same precedence for all operators
binary_expression: $ => choice(
  prec.left(1, seq($._expression, '*', $._expression)),
  prec.left(1, seq($._expression, '+', $._expression)),
),
// Result: a + b * c parsed as (a + b) * c  (WRONG!)

//  Wrong: Right associative for addition
binary_expression: $ => prec.right(1, seq($._expression, '+', $._expression)),
// Result: a + b + c parsed as a + (b + c)  (unusual)

//  Correct: Clear precedence hierarchy
binary_expression: $ => choice(
  prec.left(2, seq($._expression, '*', $._expression)),
  prec.left(1, seq($._expression, '+', $._expression)),
),
```

**Testing Precedence:**

```bash
# Create test file
echo "a + b * c" > test.txt

# Parse and view tree
tree-sitter parse test.txt

# Expected output:
# (source_file
#   (expression
#     (binary_expression
#       left: (identifier)
#       operator: "+"
#       right: (binary_expression
#         left: (identifier)
#         operator: "*"
#         right: (identifier)))))
```

---

## 15. Grammar Template Skeleton

**Use this template to start a new grammar quickly:**

```javascript
module.exports = grammar({
  name: 'your_language_name',
  
  // Optional: Specify word token for keyword handling
  word: $ => $.identifier,
  
  // Optional: Tokens allowed anywhere (whitespace, comments)
  extras: $ => [
    /\s/,              // Whitespace
    $.comment,         // Line comments
    // $.block_comment, // Block comments (if needed)
  ],
  
  // Optional: Rules to inline (hide from tree)
  inline: $ => [
    // $._expression,
  ],
  
  // Optional: Intentional ambiguities
  conflicts: $ => [
    // [$.rule1, $.rule2],
  ],
  
  // Optional: Abstract supertypes
  supertypes: $ => [
    // $._expression,
    // $._statement,
  ],
  
  rules: {
    // Entry point: what constitutes a valid source file
    source_file: $ => repeat($._statement),
    
    // Hidden rule: groups statement types
    _statement: $ => choice(
      $.expression_statement,
      $.return_statement,
      $.if_statement,
      // Add more statement types...
    ),
    
    // Expression statement: expression followed by semicolon
    expression_statement: $ => seq(
      $._expression,
      ';'
    ),
    
    // Return statement
    return_statement: $ => seq(
      'return',
      optional($._expression),
      ';'
    ),
    
    // If statement
    if_statement: $ => seq(
      'if',
      '(',
      field('condition', $._expression),
      ')',
      field('consequence', $.block),
      optional(seq(
        'else',
        field('alternative', $.block)
      ))
    ),
    
    // Block: curly braces with statements
    block: $ => seq(
      '{',
      repeat($._statement),
      '}'
    ),
    
    // Hidden rule: groups expression types
    _expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.identifier,
      $.number,
      $.string,
      // Add more expression types...
    ),
    
    // Binary expressions with precedence
    binary_expression: $ => choice(
      // Arithmetic
      prec.left(2, seq($._expression, '*', $._expression)),
      prec.left(2, seq($._expression, '/', $._expression)),
      prec.left(1, seq($._expression, '+', $._expression)),
      prec.left(1, seq($._expression, '-', $._expression)),
      
      // Comparison
      prec.left(3, seq($._expression, '==', $._expression)),
      prec.left(3, seq($._expression, '!=', $._expression)),
      prec.left(3, seq($._expression, '<', $._expression)),
      prec.left(3, seq($._expression, '>', $._expression)),
    ),
    
    // Unary expression (higher precedence)
    unary_expression: $ => prec(4, choice(
      seq('-', $._expression),
      seq('!', $._expression),
    )),
    
    // Function call
    call_expression: $ => prec.left(5, seq(
      field('function', $._expression),
      '(',
      field('arguments', optional($.argument_list)),
      ')'
    )),
    
    // Argument list: comma-separated expressions
    argument_list: $ => seq(
      $._expression,
      repeat(seq(',', $._expression))
    ),
    
    // Identifier: letters, digits, underscore (starts with letter/underscore)
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    
    // Number: integer or float
    number: $ => /\d+(\.\d+)?/,
    
    // String: double-quoted with escapes
    string: $ => token(seq(
      '"',
      repeat(choice(
        /[^"\\]/,      // Any char except quote/backslash
        /\\./,         // Escape sequence
      )),
      '"'
    )),
    
    // Line comment: // until end of line
    comment: $ => token(seq('//', /.*/)),
    
    // Optional: Block comment
    // block_comment: $ => token(seq(
    //   '/*',
    //   /[^*]*\*+([^/*][^*]*\*+)*/,
    //   '/'
    // )),
  }
});
```

**Usage:**

1. Copy template to `grammar.js`
2. Change `name` to your language name
3. Modify rules to match your language syntax
4. Run `tree-sitter generate`
5. Test with `tree-sitter parse example-file`

---

## 16. References

All information in this guide is sourced from official tree-sitter documentation:

### Primary Sources

1. **Tree-sitter Official Documentation**
   - https://tree-sitter.github.io/tree-sitter
   - Retrieved via Context7: `/websites/tree-sitter_github_io_tree-sitter`

2. **Grammar DSL**
   - [Grammar Schema](https://tree-sitter.github.io/tree-sitter/assets/schemas/grammar.schema)
   - [Creating Parsers - Grammar DSL](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)

3. **Writing Grammars**
   - [Writing the Grammar](https://tree-sitter.github.io/tree-sitter/creating-parsers/3-writing-the-grammar)
   - [Getting Started](https://tree-sitter.github.io/tree-sitter/creating-parsers/1-getting-started)

4. **Precedence & Conflicts**
   - [Precedence Documentation](https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl)
   - [Conflict Resolution](https://tree-sitter.github.io/tree-sitter/creating-parsers/3-writing-the-grammar)

5. **External Scanners**
   - [External Scanners](https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners)

6. **Query Syntax**
   - [Query Syntax](https://tree-sitter.github.io/tree-sitter/using-parsers/queries/1-syntax)
   - [Query Operators](https://tree-sitter.github.io/tree-sitter/using-parsers/queries/2-operators)

7. **CLI Tools**
   - [CLI Init](https://tree-sitter.github.io/tree-sitter/cli/init)
   - [CLI Generate](https://tree-sitter.github.io/tree-sitter/cli/generate)


### Additional Resources

- Tree-sitter GitHub: https://github.com/tree-sitter/tree-sitter
- Example Grammars: https://github.com/tree-sitter
- Tree-sitter Playground: https://tree-sitter.github.io/tree-sitter/playground

---

## Conclusion

This guide provides everything needed to build tree-sitter parsers from scratch. Key takeaways:

1. **Understand the two-phase process:** Lexer (tokens) → Parser (syntax tree)
2. **Use `token()` for lexical units**, regular rules for structure
3. **Apply precedence** to avoid conflicts
4. **Regex has limits** - use grammar rules for nesting
5. **Test thoroughly** with edge cases
6. **Follow the checklist** before finalizing

With this knowledge, you can now build robust, efficient parsers for any language.

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-25  
**License:** Documentation sourced from Tree-sitter official docs (MIT License)
