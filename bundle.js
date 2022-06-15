'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var typescriptParsec = require('typescript-parsec');

var TokenKind;
(function (TokenKind) {
    TokenKind[TokenKind["Number"] = 0] = "Number";
    TokenKind[TokenKind["For"] = 1] = "For";
    TokenKind[TokenKind["End"] = 2] = "End";
    TokenKind[TokenKind["Move"] = 3] = "Move";
    TokenKind[TokenKind["Turn"] = 4] = "Turn";
    TokenKind[TokenKind["Space"] = 5] = "Space";
    TokenKind[TokenKind["BreakLine"] = 6] = "BreakLine";
})(TokenKind || (TokenKind = {}));
const LEXER = typescriptParsec.buildLexer([
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
const FOR = typescriptParsec.rule();
const EXP = typescriptParsec.rule();
FOR.setPattern(typescriptParsec.apply(typescriptParsec.seq(typescriptParsec.tok(TokenKind.For), typescriptParsec.tok(TokenKind.Number), typescriptParsec.rep(EXP), typescriptParsec.tok(TokenKind.End)), applyFor));
EXP.setPattern(typescriptParsec.alt(FOR, typescriptParsec.apply(typescriptParsec.tok(TokenKind.Move), applyMove), typescriptParsec.apply(typescriptParsec.seq(typescriptParsec.tok(TokenKind.Turn), typescriptParsec.tok(TokenKind.Number)), applyTurn)));
function evaluate(expr) {
    return typescriptParsec.expectSingleResult(typescriptParsec.expectEOF(EXP.parse(LEXER.parse(expr))));
}

exports.evaluate = evaluate;
