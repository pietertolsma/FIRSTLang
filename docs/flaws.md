
The idea of ts-parsec is to *parse* a text, and *generate* a tree of nodes.

This tree is called the *abstract syntax tree (AST)* which describes the deterministic operations.

Once this is done, you can simply run through this tree and compute your desired output.
Currently, the computing part already happens in the parser, causing confusing results.