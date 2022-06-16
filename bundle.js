'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var typescriptParsec = require('typescript-parsec');

var TokenKind;
(function (TokenKind) {
    TokenKind[TokenKind["Number"] = 0] = "Number";
    TokenKind[TokenKind["String"] = 1] = "String";
    TokenKind[TokenKind["For"] = 2] = "For";
    TokenKind[TokenKind["End"] = 3] = "End";
    TokenKind[TokenKind["Move"] = 4] = "Move";
    TokenKind[TokenKind["Turn"] = 5] = "Turn";
    TokenKind[TokenKind["Space"] = 6] = "Space";
    TokenKind[TokenKind["Color"] = 7] = "Color";
    TokenKind[TokenKind["ColorType"] = 8] = "ColorType";
    TokenKind[TokenKind["BreakLine"] = 9] = "BreakLine";
    TokenKind[TokenKind["Variable"] = 10] = "Variable";
    TokenKind[TokenKind["VariableReference"] = 11] = "VariableReference";
})(TokenKind || (TokenKind = {}));
let heap = {};
const LEXER = typescriptParsec.buildLexer([
    [true, /^-?\d+/g, TokenKind.Number],
    [true, /^for/ig, TokenKind.For],
    [true, /^end/ig, TokenKind.End],
    [true, /^(forward|backward)/ig, TokenKind.Move],
    [true, /^(turn|rotate)/ig, TokenKind.Turn],
    [false, /^ /g, TokenKind.Space],
    [true, /^color/ig, TokenKind.Color],
    [true, /^(red|green|blue|yellow|black|none)/ig, TokenKind.ColorType],
    [true, /^[A-Za-z_]+[ ]?=[ ]?/g, TokenKind.Variable],
    [true, /^[A-Za-z_]+/g, TokenKind.VariableReference],
    [true, /^('|").*?('|")/g, TokenKind.String],
    [false, /^\n/g, TokenKind.BreakLine],
]);
function applyFor(first) {
    if (typeof first[1] === "string") {
        return ["ERROR: FOR loop variable must be a number"];
    }
    let res = [];
    for (let i = 0; i < first[1]; i++) {
        res = res.concat(first[2]);
    }
    return res;
}
function applyMove(first) {
    if (typeof first[1] === "string") {
        return ["ERROR: " + first[0].text.toUpperCase() + " must be followed by a number"];
    }
    return [first[0].text.toUpperCase() + " " + first[1]];
}
function applyTurn(first) {
    return ["TURN " + first[1]];
}
function applyColor(first) {
    return [first[0].text.toUpperCase() + " " + first[1]];
}
function applyNumber(first) {
    return parseInt(first.text);
}
function lookupVariable(first) {
    if (first.text in heap) {
        return heap[first.text];
    }
    else {
        return "undefined";
    }
}
function joinResults(first, second) {
    return first.concat(second);
}
function applyVariable(first) {
    heap[first[0].text.split(" ")[0]] = first[1];
    return [];
}
const FOR = typescriptParsec.rule();
const EXP = typescriptParsec.rule();
const NUM = typescriptParsec.rule();
const STRING = typescriptParsec.rule();
const ACTION = typescriptParsec.rule();
const COLOR = typescriptParsec.rule();
const TURN = typescriptParsec.rule();
const MOVE = typescriptParsec.rule();
const VAR = typescriptParsec.rule();
const VAR_REF = typescriptParsec.rule();
NUM.setPattern(typescriptParsec.apply(typescriptParsec.tok(TokenKind.Number), applyNumber));
STRING.setPattern(typescriptParsec.apply(typescriptParsec.tok(TokenKind.String), (first) => first.text.slice(1, -1)));
MOVE.setPattern(typescriptParsec.apply(typescriptParsec.alt(typescriptParsec.seq(typescriptParsec.tok(TokenKind.Move), NUM), typescriptParsec.seq(typescriptParsec.tok(TokenKind.Move), VAR_REF)), applyMove));
TURN.setPattern(typescriptParsec.apply(typescriptParsec.seq(typescriptParsec.tok(TokenKind.Turn), NUM), applyTurn));
COLOR.setPattern(typescriptParsec.apply(typescriptParsec.alt(typescriptParsec.seq(typescriptParsec.tok(TokenKind.Color), STRING), typescriptParsec.seq(typescriptParsec.tok(TokenKind.Color), VAR_REF)), applyColor));
VAR.setPattern(typescriptParsec.apply(typescriptParsec.alt(typescriptParsec.seq(typescriptParsec.tok(TokenKind.Variable), NUM), typescriptParsec.seq(typescriptParsec.tok(TokenKind.Variable), STRING), typescriptParsec.seq(typescriptParsec.tok(TokenKind.Variable), VAR_REF)), applyVariable));
VAR_REF.setPattern(typescriptParsec.apply(typescriptParsec.tok(TokenKind.VariableReference), lookupVariable));
FOR.setPattern(typescriptParsec.apply(typescriptParsec.alt(typescriptParsec.seq(typescriptParsec.tok(TokenKind.For), NUM, EXP, typescriptParsec.tok(TokenKind.End)), typescriptParsec.seq(typescriptParsec.tok(TokenKind.For), VAR_REF, EXP, typescriptParsec.tok(TokenKind.End))), applyFor));
ACTION.setPattern(typescriptParsec.alt(FOR, COLOR, TURN, MOVE, VAR));
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
