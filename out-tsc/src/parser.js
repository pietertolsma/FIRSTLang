import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, seq, tok, rep } from 'typescript-parsec';
export var TokenKind;
(function (TokenKind) {
    TokenKind[TokenKind["Number"] = 0] = "Number";
    TokenKind[TokenKind["For"] = 1] = "For";
    TokenKind[TokenKind["End"] = 2] = "End";
    TokenKind[TokenKind["Move"] = 3] = "Move";
    TokenKind[TokenKind["Turn"] = 4] = "Turn";
    TokenKind[TokenKind["Space"] = 5] = "Space";
    TokenKind[TokenKind["BreakLine"] = 6] = "BreakLine";
})(TokenKind || (TokenKind = {}));
export const LEXER = buildLexer([
    [true, /^\d+/g, TokenKind.Number],
    [true, /^for/ig, TokenKind.For],
    [true, /^end/ig, TokenKind.End],
    [true, /^(forward|backward)/ig, TokenKind.Move],
    [true, /^turn/ig, TokenKind.Turn],
    [false, /^ /g, TokenKind.Space],
    [false, /^\n/g, TokenKind.BreakLine],
]);
function applyFor(first) {
    let res = [];
    for (let i = 0; i < parseInt(first[1].text); i++) {
        res = res.concat(first[2].flat());
    }
    return res;
}
function applyMove(first) {
    return [first.text.toUpperCase()];
}
function applyTurn(first) {
    return ["TURN " + first[1].text];
}
const FOR = rule();
const EXP = rule();
FOR.setPattern(apply(seq(tok(TokenKind.For), tok(TokenKind.Number), rep(EXP), tok(TokenKind.End)), applyFor));
EXP.setPattern(alt(FOR, apply(tok(TokenKind.Move), applyMove), apply(seq(tok(TokenKind.Turn), tok(TokenKind.Number)), applyTurn)));
export function evaluate(expr) {
    return expectSingleResult(expectEOF(EXP.parse(LEXER.parse(expr))));
}
