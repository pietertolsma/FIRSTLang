import * as ast from "./AST";

function lookupEntireStack(stack : [{[name: string] : any}], name : string) : any {
    for (let i = stack.length - 1; i >= 0; i--) {
        if (name in stack[i]) {
            return stack[i][name];
        }
    }
    throw new Error(`Undefined variable ${name}`);
}

function processMath(expression: ast.MathExpression, output : string[], stack : [{[name: string] : any}]) : number {
    switch (expression.operator) {
        case "add":
            return processExpression(expression.left, output, stack) + processExpression(expression.right, output, stack);
        case "sub":
            return processExpression(expression.left, output, stack) - processExpression(expression.right, output, stack);
        case "mul":
            return processExpression(expression.left, output, stack) * processExpression(expression.right, output, stack);
        case "div":
            return processExpression(expression.left, output, stack) / processExpression(expression.right, output, stack);
        default:
            throw new Error(`Unknown operator ${expression.operator}`);
    }

}

function processExpression(expression: ast.Expression, output : string[], stack : [{[name: string] : any}]) : any {
        switch (expression.kind) {
            case "ConstantExpression":
                return expression.value;
            case "ReferenceExpression":
                return lookupEntireStack(stack, expression.name);
            case "MathExpression":
                return processMath(expression, output, stack);
        }
}

function processStatement(statement: ast.Statement, output : string[], stack : [{[name: string] : any}]) : void {
    switch (statement.kind) {
        case "For":
            const start = processExpression(statement.start, output, stack);
            const end = processExpression(statement.end, output, stack);
            const step = processExpression(statement.step, output, stack);
            for (let i = start; i < end; i += step) {
                stack.push({});
                stack[stack.length - 1][statement.name] = i;

                for (let j = 0; j < statement.body.length; j++) {
                    processStatement(statement.body[j], output, stack);
                }
                stack.pop();
            }
            break;
        case "Move":
            const distance = processExpression(statement.distance, output, stack);
            output.push(statement.direction + " " + distance);
            break;
        case "VariableDeclaration":
            stack[stack.length - 1][statement.name] = processExpression(statement.value, output, stack);
        default:
            break;
    }
    
}

export function execute(ast : ast.FIRSTProgram) : string[] {

    let stack : [{[name: string] : any}] = [{}];
    let output : string[] = []

    for (const statement of ast.statements) {
        processStatement(statement, output, stack);
    }

    return output;
}