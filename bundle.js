'use strict';

var typescriptParsec = require('typescript-parsec');

var TokenKind;
(function (TokenKind) {
    TokenKind[TokenKind["Number"] = 0] = "Number";
    TokenKind[TokenKind["String"] = 1] = "String";
    TokenKind[TokenKind["For"] = 2] = "For";
    TokenKind[TokenKind["End"] = 3] = "End";
    TokenKind[TokenKind["Add"] = 4] = "Add";
    TokenKind[TokenKind["Sub"] = 5] = "Sub";
    TokenKind[TokenKind["Mul"] = 6] = "Mul";
    TokenKind[TokenKind["Div"] = 7] = "Div";
    TokenKind[TokenKind["Move"] = 8] = "Move";
    TokenKind[TokenKind["Turn"] = 9] = "Turn";
    TokenKind[TokenKind["Space"] = 10] = "Space";
    TokenKind[TokenKind["Color"] = 11] = "Color";
    TokenKind[TokenKind["LParenthesis"] = 12] = "LParenthesis";
    TokenKind[TokenKind["RParenthesis"] = 13] = "RParenthesis";
    TokenKind[TokenKind["BreakLine"] = 14] = "BreakLine";
    TokenKind[TokenKind["Variable"] = 15] = "Variable";
    TokenKind[TokenKind["VariableReference"] = 16] = "VariableReference";
})(TokenKind || (TokenKind = {}));
const LEXER = typescriptParsec.buildLexer([
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

function joinResults(left, right) {
    return {
        statements: [...left.statements, ...right.statements]
    };
}
function applyConstantExpression(first) {
    return {
        kind: "ConstantExpression",
        value: first.kind === TokenKind.Number ? parseInt(first.text) : first.text,
        type: first.kind === TokenKind.Number ? "Number" : "String"
    };
}
function applyMove(first) {
    return {
        kind: "Move",
        direction: first[0].text.split(" ")[0],
        distance: first[1]
    };
}
function applyFor(first) {
    return {
        kind: "For",
        name: first[1].name,
        start: first[1].value,
        end: first[2],
        step: {
            kind: "ConstantExpression",
            value: 1,
            type: "Number"
        },
        body: first[3]
    };
}
function statementToProgram(first) {
    return {
        statements: [first]
    };
}
function applyVariableReference(first) {
    return {
        kind: "ReferenceExpression",
        name: first.text.split(" ")[0],
        type: "unknown"
    };
}
function applyVariableDeclaration(first) {
    return {
        kind: "VariableDeclaration",
        name: first[0].text.split(" ")[0],
        type: first[1].type,
        value: first[1]
    };
}
let CONST = typescriptParsec.rule();
let VAR_REF = typescriptParsec.rule();
let VAR_DEC = typescriptParsec.rule();
let FOR = typescriptParsec.rule();
let MOVE = typescriptParsec.rule();
let STATEMENT = typescriptParsec.rule();
let EXPRESSION = typescriptParsec.rule();
let EXP = typescriptParsec.rule();
MOVE.setPattern(typescriptParsec.apply(typescriptParsec.seq(typescriptParsec.tok(TokenKind.Move), typescriptParsec.kmid(typescriptParsec.tok(TokenKind.LParenthesis), EXPRESSION, typescriptParsec.tok(TokenKind.RParenthesis))), applyMove));
EXPRESSION.setPattern(typescriptParsec.alt(CONST, VAR_REF));
CONST.setPattern(typescriptParsec.apply(typescriptParsec.alt(typescriptParsec.tok(TokenKind.Number), typescriptParsec.tok(TokenKind.String)), applyConstantExpression));
VAR_REF.setPattern(typescriptParsec.apply(typescriptParsec.tok(TokenKind.VariableReference), applyVariableReference));
VAR_DEC.setPattern(typescriptParsec.apply(typescriptParsec.seq(typescriptParsec.tok(TokenKind.Variable), EXPRESSION), applyVariableDeclaration));
FOR.setPattern(typescriptParsec.apply(typescriptParsec.seq(typescriptParsec.tok(TokenKind.For), typescriptParsec.kleft(VAR_DEC, typescriptParsec.str('to')), EXPRESSION, typescriptParsec.kleft(typescriptParsec.rep(STATEMENT), typescriptParsec.tok(TokenKind.End))), applyFor));
STATEMENT.setPattern(typescriptParsec.alt(VAR_DEC, MOVE, FOR));
EXP.setPattern(typescriptParsec.lrec_sc(typescriptParsec.apply(STATEMENT, statementToProgram), typescriptParsec.apply(STATEMENT, statementToProgram), joinResults));
function evaluate(expr) {
    try {
        return typescriptParsec.expectSingleResult(typescriptParsec.expectEOF(EXP.parse(LEXER.parse(expr))));
    }
    catch (error) {
        return error;
    }
}

function lookupEntireStack(stack, name, errors) {
    for (let i = stack.length - 1; i >= 0; i--) {
        if (name in stack[i]) {
            return stack[i][name];
        }
    }
    errors.push(`Undefined variable ${name}`);
}
function processMath(expression, output, stack, errors) {
    switch (expression.operator) {
        case "add":
            return processExpression(expression.left, output, stack, errors) + processExpression(expression.right, output, stack, errors);
        case "sub":
            return processExpression(expression.left, output, stack, errors) - processExpression(expression.right, output, stack, errors);
        case "mul":
            return processExpression(expression.left, output, stack, errors) * processExpression(expression.right, output, stack, errors);
        case "div":
            return processExpression(expression.left, output, stack, errors) / processExpression(expression.right, output, stack, errors);
        default:
            errors.push(`Unknown operator ${expression.operator}`);
            return 0;
    }
}
function processExpression(expression, output, stack, errors) {
    if (errors.length > 0)
        return;
    switch (expression.kind) {
        case "ConstantExpression":
            return expression.value;
        case "ReferenceExpression":
            return lookupEntireStack(stack, expression.name, errors);
        case "MathExpression":
            return processMath(expression, output, stack, errors);
    }
}
function processStatement(statement, output, stack, errors) {
    if (errors.length > 0)
        return;
    switch (statement.kind) {
        case "For":
            const start = processExpression(statement.start, output, stack, errors);
            const end = processExpression(statement.end, output, stack, errors);
            const step = processExpression(statement.step, output, stack, errors);
            for (let i = start; i < end; i += step) {
                stack.push({});
                stack[stack.length - 1][statement.name] = i;
                for (let j = 0; j < statement.body.length; j++) {
                    processStatement(statement.body[j], output, stack, errors);
                }
                stack.pop();
            }
            break;
        case "Move":
            const distance = processExpression(statement.distance, output, stack, errors);
            output.push(statement.direction + " " + distance);
            break;
        case "VariableDeclaration":
            stack[stack.length - 1][statement.name] = processExpression(statement.value, output, stack, errors);
    }
}
function execute(program) {
    let stack = [{}];
    let output = [];
    let errors = [];
    if (program.statements === undefined) {
        errors.push("No statements found");
        return [output, errors];
    }
    for (let i = 0; i < program.statements.length; i++) {
        const statement = program.statements[i];
        processStatement(statement, output, stack, errors);
    }
    return [output, errors];
}

// export {evaluate} from "./parser"
function app (code) {
    let tree = evaluate(code);
    let [output, errors] = execute(tree);
    return [output, errors];
}

module.exports = app;
