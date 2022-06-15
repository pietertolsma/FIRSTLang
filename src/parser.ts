import { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, kmid, lrec_sc, seq, str, tok, kright, rep } from 'typescript-parsec';

export enum TokenKind {
    Number,
    For,
    End,
    Move,
    Space,
    BreakLine
}

export const LEXER = buildLexer([
    [true, /^\d/g, TokenKind.Number],
    [true, /^for/ig, TokenKind.For],
    [true, /^end/ig, TokenKind.End],
    [true, /^(UP|DOWN|RIGHT|LEFT)/ig, TokenKind.Move],
    [false, /^ /g, TokenKind.Space],
    [false, /^\n/g, TokenKind.BreakLine],
]);

function applyFor(first : [Token<TokenKind.For>, 
    Token<TokenKind.Number>, 
    string[][], 
    Token<TokenKind.End>]) : string[] {

    let res = [];

    for (let i = 0; i < parseInt(first[1].text); i++) {
        res = res.concat(first[2].flat());
    }
    return res;
}

function applyMove(first : Token<TokenKind.Move>) : string[] {
    return [first.text];
}

const FOR = rule<TokenKind, string[]>();
const EXP = rule<TokenKind, string[]>();

FOR.setPattern(
    apply(seq(tok(TokenKind.For), tok(TokenKind.Number), rep(EXP), tok(TokenKind.End)), applyFor)
)

EXP.setPattern(
    alt(
        FOR,
        apply(tok(TokenKind.Move), applyMove)
    )
)

export function evaluate(expr : string) : string[] {
    return expectSingleResult(expectEOF(EXP.parse(LEXER.parse(expr))));
}