# tree-sitter-mcfunction

This project is a Tree-sitter grammar parser for Minecraft function files (.mcfunction). It provides syntax parsing for various elements of Minecraft functions, including commands, comments, NBT data, selectors, and scoreboard operations.

## Features

This parser supports:
- Minecraft commands
- Comments (normal, important, directive)
- NBT data structures
- Entity selectors
- Scoreboard operations

## Development

Here are the common commands used for developing this project:

- **Build**: Run `tree-sitter generate` to generate the parser from the grammar definition.
- **Test**: Run `python test/run.py` to validate the grammar against test cases.
- **Playground**: Run `npm start` to build the WASM file and open the interactive playground in your browser.
- **WebAssembly**: Run `tree-sitter build --wasm` to generate the WebAssembly module.

## Contributions

Contributions are welcome! Please follow these guidelines:

- Fork the repository.
- Ensure your code follows the existing style and conventions.
- Write tests for your changes.
- Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License.
tellraw @s {"text":"Hello, world!", color:green}