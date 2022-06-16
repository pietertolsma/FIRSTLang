import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, lrec_sc, seq, tok } from 'typescript-parsec';
export var TokenKind;
(function (TokenKind) {
    TokenKind[TokenKind["Number"] = 0] = "Number";
    TokenKind[TokenKind["For"] = 1] = "For";
    TokenKind[TokenKind["End"] = 2] = "End";
    TokenKind[TokenKind["Move"] = 3] = "Move";
    TokenKind[TokenKind["Turn"] = 4] = "Turn";
    TokenKind[TokenKind["Space"] = 5] = "Space";
    TokenKind[TokenKind["Color"] = 6] = "Color";
    TokenKind[TokenKind["ColorType"] = 7] = "ColorType";
    TokenKind[TokenKind["BreakLine"] = 8] = "BreakLine";
})(TokenKind || (TokenKind = {}));
export const LEXER = buildLexer([
    [true, /^\d+/g, TokenKind.Number],
    [true, /^for/ig, TokenKind.For],
    [true, /^end/ig, TokenKind.End],
    [true, /^(forward|backward)/ig, TokenKind.Move],
    [true, /^turn/ig, TokenKind.Turn],
    [false, /^ /g, TokenKind.Space],
    [true, /^color/ig, TokenKind.Color],
    [true, /^(red|green|blue|yellow|black|none)/ig, TokenKind.ColorType],
    [false, /^\n/g, TokenKind.BreakLine],
]);
function applyFor(first) {
    let res = [];
    for (let i = 0; i < parseInt(first[1].text); i++) {
        res = res.concat(first[2]);
    }
    return res;
}
function applyMove(first) {
    return [first[0].text.toUpperCase() + " " + first[1].text];
}
function applyTurn(first) {
    return ["TURN " + first[1].text];
}
function applyColor(first) {
    return [first[0].text.toUpperCase() + " " + first[1].text.toUpperCase()];
}
function joinResults(first, second) {
    return first.concat(second);
}
const FOR = rule();
const EXP = rule();
const ACTION = rule();
const COLOR = rule();
const TURN = rule();
const MOVE = rule();
MOVE.setPattern(apply(seq(tok(TokenKind.Move), tok(TokenKind.Number)), applyMove));
TURN.setPattern(apply(seq(tok(TokenKind.Turn), tok(TokenKind.Number)), applyTurn));
COLOR.setPattern(apply(seq(tok(TokenKind.Color), tok(TokenKind.ColorType)), applyColor));
FOR.setPattern(apply(seq(tok(TokenKind.For), tok(TokenKind.Number), EXP, tok(TokenKind.End)), applyFor));
ACTION.setPattern(alt(FOR, COLOR, TURN, MOVE));
EXP.setPattern(lrec_sc(ACTION, ACTION, joinResults));
export function evaluate(expr) {
    try {
        return expectSingleResult(expectEOF(EXP.parse(LEXER.parse(expr))));
    }
    catch (error) {
        return error;
    }
}
