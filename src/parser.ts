import { expectEOF, expectSingleResult, rule, Token } from 'typescript-parsec';
import { LEXER } from "./tokenizer";
import { alt, apply, kmid, lrec_sc, seq, str, tok, kright, rep, lrec } from 'typescript-parsec';
import { TokenKind } from './tokenizer';

import * as ast from "./AST";

function joinResults(left: ast.FIRSTProgram, right: ast.FIRSTProgram): ast.FIRSTProgram{
    return {
        statements: [...left.statements, ...right.statements]
    }
}

function applyConstantExpression(first: Token<TokenKind.Number> | Token<TokenKind.String>) : ast.ConstantExpression {
    return {
        kind: "ConstantExpression",
        value: first.kind === TokenKind.Number ? parseInt(first.text) : first.text,
        type: first.kind === TokenKind.Number ? "Number" : "String"
    }
}

function applyMove(first: [Token<TokenKind.Move>, ast.Expression]) : ast.Move {
    return {
        kind: "Move",
        direction: first[0].text.split(" ")[0],
        distance: first[1]
    }
}

function applySingleProgram(first: ast.Statement) : ast.FIRSTProgram {
    return {
        statements: [first]
    }
}

function applyVariableReference(first: Token<TokenKind.VariableReference>) : ast.ReferenceExpression {
    return {
        kind: "ReferenceExpression",
        name: first.text.split(" ")[0]
    }
}

function applyVariableDeclaration(first: [Token<TokenKind.Variable>, ast.ConstantExpression]) : ast.VariableDeclaration {
    return {
        kind: "VariableDeclaration",
        name: first[0].text.split(" ")[0],
        type: first[1].type,
        value: first[1]
    }
}

let CONST = rule<TokenKind, ast.ConstantExpression>();
let VAR_REF = rule<TokenKind, ast.ReferenceExpression>();
let VAR_DEC = rule<TokenKind, ast.VariableDeclaration>();
let MOVE = rule<TokenKind, ast.Move>();
let STATEMENT = rule<TokenKind, ast.FIRSTProgram>();
let EXPRESSION = rule<TokenKind, ast.Expression>();
let EXP = rule<TokenKind, ast.FIRSTProgram>();

MOVE.setPattern(
    apply(
        seq(tok(TokenKind.Move), kmid(tok(TokenKind.LParenthesis), EXPRESSION, tok(TokenKind.RParenthesis))),
        applyMove
    )
)

EXPRESSION.setPattern(
    alt(
        CONST,
        VAR_REF
    )
)

CONST.setPattern(
    apply(
        alt(
            tok(TokenKind.Number), 
            tok(TokenKind.String)
        ),
        applyConstantExpression
    )
);

VAR_REF.setPattern(
    apply(
        tok(TokenKind.VariableReference),
        applyVariableReference
    )
)

VAR_DEC.setPattern(
    apply(
        seq(tok(TokenKind.Variable), CONST),
        applyVariableDeclaration
    )
)

STATEMENT.setPattern(
    apply(alt(
        VAR_DEC, 
        MOVE
    ),
    applySingleProgram)
)

EXP.setPattern(
        lrec_sc(STATEMENT, STATEMENT, joinResults),
)

export function evaluate(expr : string) : (string[] | any) {
    try {
        return expectSingleResult(expectEOF(EXP.parse(LEXER.parse(expr))));
    } catch (error : any) {
        return error;
    }
}