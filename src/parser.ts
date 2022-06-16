import { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, kmid, lrec_sc, seq, str, tok, kright, rep, lrec } from 'typescript-parsec';

export enum TokenKind {
    Number,
    String,
    For,
    End,
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

let heap : {[name : string] : string | number} = {};

export const LEXER = buildLexer([
    [true, /^\(/g, TokenKind.LParenthesis],
    [true, /^\)/g, TokenKind.RParenthesis],
    [true, /^-?\d+/g, TokenKind.Number],
    [true, /^for/ig, TokenKind.For],
    [true, /^end/ig, TokenKind.End],
    [true, /^(forward|backward)/ig, TokenKind.Move],
    [true, /^(turn|rotate)/ig, TokenKind.Turn],
    [false, /^ /g, TokenKind.Space],
    [true, /^color/ig, TokenKind.Color],
    [true, /^[A-Za-z_]+[ ]?=[ ]?/g, TokenKind.Variable],
    [true, /^[A-Za-z_]+/g, TokenKind.VariableReference],
    [true, /^('|").*?('|")/g, TokenKind.String],
    [false, /^\n/g, TokenKind.BreakLine],
]);

function applyFor(first : [Token<TokenKind.For>, 
    number | string, 
    string[], 
    Token<TokenKind.End>]) : string[] {

    if (typeof first[1] === "string") {
        return ["ERROR: FOR loop variable must be a number"];
    }

    let res : string[] = [];

    for (let i = 0; i < first[1]; i++) {
        res = res.concat(first[2]);
    }
    return res;
}

function applyMove(first : [Token<TokenKind.Move>, number | string]) : string[] {
    if (typeof first[1] === "string") {
        return ["ERROR: " + first[0].text.toUpperCase() + " must be followed by a number"];
    }
    return [first[0].text.toUpperCase() + " " + first[1]];
}

function applyTurn(first : [Token<TokenKind.Turn>, number | string]) : string[] {
    if (typeof first[1] === "string") {
        return ["ERROR: " + first[0].text.toUpperCase() + " must be followed by a number"];
    }
    return ["TURN " + first[1]];
}

function applyColor(first : [Token<TokenKind.Color>, string | number]) : string[] {
    return [first[0].text.toUpperCase() + " " + first[1]];
}

function applyNumber(first : Token<TokenKind.Number>) : number {
    return parseInt(first.text);
}

function lookupVariable(first: Token<TokenKind.VariableReference>) : string | number {
    if (first.text in heap) {
        return heap[first.text];
    } else {
        return "undefined";
    }
}

function joinResults(first: string[], second: string[]) : string[] {
    return first.concat(second);
}

function applyVariable(first : [Token<TokenKind.Variable>, string | number]) : string[] {
    heap[first[0].text.split(" ")[0]] = first[1];
    return [];
}

const FOR = rule<TokenKind, string[]>();
const EXP = rule<TokenKind, string[]>();
const NUM = rule<TokenKind, number>();
const STRING = rule<TokenKind, string>();

const ACTION = rule<TokenKind, string[]>();

const COLOR = rule<TokenKind, string[]>();
const TURN = rule<TokenKind, string[]>();
const MOVE = rule<TokenKind, string[]>();
const VAR = rule<TokenKind, string[]>();
const VAR_REF = rule<TokenKind, string | number >();

NUM.setPattern(
    apply(tok(TokenKind.Number), applyNumber)
)

STRING.setPattern(
    apply(tok(TokenKind.String), (first: Token<TokenKind.String>) => first.text.slice(1, -1))
)

MOVE.setPattern(
    apply(
        alt(
            seq(tok(TokenKind.Move), kmid(tok(TokenKind.LParenthesis), NUM,  tok(TokenKind.RParenthesis))),
            seq(tok(TokenKind.Move), kmid(tok(TokenKind.LParenthesis), VAR_REF,  tok(TokenKind.RParenthesis)))
        ), applyMove)
)

TURN.setPattern(
    apply(
        alt(
            seq(tok(TokenKind.Turn), kmid(tok(TokenKind.LParenthesis), NUM, tok(TokenKind.RParenthesis))),
            seq(tok(TokenKind.Turn), kmid(tok(TokenKind.LParenthesis), VAR_REF, tok(TokenKind.RParenthesis)))
        ),applyTurn)
);

COLOR.setPattern(
    apply(
        alt(
            seq(tok(TokenKind.Color), kmid(tok(TokenKind.LParenthesis), STRING, tok(TokenKind.RParenthesis))),
            seq(tok(TokenKind.Color), kmid(tok(TokenKind.LParenthesis), VAR_REF, tok(TokenKind.RParenthesis)))
        ), applyColor
    )
);

VAR.setPattern(
    apply(
        alt(
            seq(tok(TokenKind.Variable), NUM),
            seq(tok(TokenKind.Variable), STRING),
            seq(tok(TokenKind.Variable), VAR_REF)
        ),
        applyVariable
    )
)

VAR_REF.setPattern(
    apply(tok(TokenKind.VariableReference), lookupVariable)
)

FOR.setPattern(
    apply(
        alt(
            seq(tok(TokenKind.For), NUM, EXP, tok(TokenKind.End)),
            seq(tok(TokenKind.For), VAR_REF, EXP, tok(TokenKind.End))
        ),
    applyFor)
)

ACTION.setPattern(
    alt(
        FOR,
        COLOR,
        TURN,
        MOVE,
        VAR,
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