import { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, kmid, lrec_sc, seq, str, tok, kright, rep, lrec } from 'typescript-parsec';

export enum TokenKind {
    Number,
    For,
    End,
    Move,
    Turn,
    Space,
    Color,
    ColorType,
    BreakLine
}

export const LEXER = buildLexer([
    [true, /^\d+/g, TokenKind.Number],
    [true, /^for/ig, TokenKind.For],
    [true, /^end/ig, TokenKind.End],
    [true, /^(forward|backward)/ig, TokenKind.Move],
    [true, /^(turn|rotate)/ig, TokenKind.Turn],
    [false, /^ /g, TokenKind.Space],
    [true, /^color/ig, TokenKind.Color],
    [true, /^(red|green|blue|yellow|black|none)/ig, TokenKind.ColorType],
    [false, /^\n/g, TokenKind.BreakLine],
]);

function applyFor(first : [Token<TokenKind.For>, 
    Token<TokenKind.Number>, 
    string[], 
    Token<TokenKind.End>]) : string[] {

    let res : string[] = [];

    for (let i = 0; i < parseInt(first[1].text); i++) {
        res = res.concat(first[2]);
    }
    return res;
}

function applyMove(first : [Token<TokenKind.Move>, Token<TokenKind.Number>]) : string[] {
    return [first[0].text.toUpperCase() + " " + first[1].text];
}

function applyTurn(first : [Token<TokenKind.Turn>, Token<TokenKind.Number>]) : string[] {
    return ["TURN " + first[1].text];
}

function applyColor(first : [Token<TokenKind.Color>, Token<TokenKind.ColorType>]) : string[] {
    return [first[0].text.toUpperCase() + " " + first[1].text.toUpperCase()];
}

function joinResults(first: string[], second: string[]) : string[] {
    return first.concat(second);
}

const FOR = rule<TokenKind, string[]>();
const EXP = rule<TokenKind, string[]>();

const ACTION = rule<TokenKind, string[]>();

const COLOR = rule<TokenKind, string[]>();
const TURN = rule<TokenKind, string[]>();
const MOVE = rule<TokenKind, string[]>();

MOVE.setPattern(
    apply(seq(tok(TokenKind.Move), tok(TokenKind.Number)), applyMove)
)

TURN.setPattern(
    apply(seq(tok(TokenKind.Turn), tok(TokenKind.Number)), applyTurn)
);

COLOR.setPattern(
    apply(seq(tok(TokenKind.Color), tok(TokenKind.ColorType)), applyColor)
)

FOR.setPattern(
    apply(seq(tok(TokenKind.For), tok(TokenKind.Number), EXP, tok(TokenKind.End)), applyFor)
)

ACTION.setPattern(
    alt(
        FOR,
        COLOR,
        TURN,
        MOVE
    )
)

EXP.setPattern(
        lrec_sc(ACTION, ACTION, joinResults),
)

export function evaluate(expr : string) : (string[] | any) {
    try {
        return expectSingleResult(expectEOF(EXP.parse(LEXER.parse(expr))));
    } catch (error : any) {
        return error;
    }
}