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
    TokenKind[TokenKind["Color"] = 6] = "Color";
    TokenKind[TokenKind["ColorType"] = 7] = "ColorType";
    TokenKind[TokenKind["BreakLine"] = 8] = "BreakLine";
})(TokenKind || (TokenKind = {}));
const LEXER = typescriptParsec.buildLexer([
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
const FOR = typescriptParsec.rule();
const EXP = typescriptParsec.rule();
const ACTION = typescriptParsec.rule();
const COLOR = typescriptParsec.rule();
const TURN = typescriptParsec.rule();
const MOVE = typescriptParsec.rule();
MOVE.setPattern(typescriptParsec.apply(typescriptParsec.seq(typescriptParsec.tok(TokenKind.Move), typescriptParsec.tok(TokenKind.Number)), applyMove));
TURN.setPattern(typescriptParsec.apply(typescriptParsec.seq(typescriptParsec.tok(TokenKind.Turn), typescriptParsec.tok(TokenKind.Number)), applyTurn));
COLOR.setPattern(typescriptParsec.apply(typescriptParsec.seq(typescriptParsec.tok(TokenKind.Color), typescriptParsec.tok(TokenKind.ColorType)), applyColor));
FOR.setPattern(typescriptParsec.apply(typescriptParsec.seq(typescriptParsec.tok(TokenKind.For), typescriptParsec.tok(TokenKind.Number), EXP, typescriptParsec.tok(TokenKind.End)), applyFor));
ACTION.setPattern(typescriptParsec.alt(FOR, COLOR, TURN, MOVE));
EXP.setPattern(typescriptParsec.lrec_sc(ACTION, ACTION, joinResults));
function evaluate(expr) {
    try {
        return typescriptParsec.expectSingleResult(typescriptParsec.expectEOF(EXP.parse(LEXER.parse(expr))));
    }
    catch (error) {
        return error;
    }
}

exports.evaluate = evaluate;
