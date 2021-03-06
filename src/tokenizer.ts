import { buildLexer } from 'typescript-parsec';

export enum TokenKind {
    Number,
    String,
    For,
    End,
    Add,
    Sub,
    Mul,
    Div,
    Move,
    Turn,
    Space,
    Color,
    LParenthesis,
    RParenthesis,
    BreakLine,
    Variable,
    VariableReference,
}

export const LEXER = buildLexer([
    [true, /^\(/g, TokenKind.LParenthesis],
    [true, /^\)/g, TokenKind.RParenthesis],
    [true, /^-?\d+/g, TokenKind.Number],
    [true, /^for/ig, TokenKind.For],
    [true, /^end/ig, TokenKind.End],
    [true, /^\+/ig, TokenKind.Add],
    [true, /^\-/ig, TokenKind.Sub],
    [true, /^\*/ig, TokenKind.Mul],
    [true, /^\//ig, TokenKind.Div],
    [true, /^(forward|backward)/ig, TokenKind.Move],
    [true, /^(turn|rotate)/ig, TokenKind.Turn],
    [false, /^ /g, TokenKind.Space],
    [true, /^color/ig, TokenKind.Color],
    [true, /^[A-Za-z_]+[ ]?=[ ]?/g, TokenKind.Variable],
    [true, /^[A-Za-z_]+/g, TokenKind.VariableReference],
    [true, /^('|").*?('|")/g, TokenKind.String],
    [false, /^\n/g, TokenKind.BreakLine],
]);