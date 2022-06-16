import * as ast from "./AST";

function lookupEntireStack(stack : [{[name: string] : any}], name : string, errors : string[]) : any {
    for (let i = stack.length - 1; i >= 0; i--) {
        if (name in stack[i]) {
            return stack[i][name];
        }
    }
    errors.push(`Undefined variable ${name}`);
}

function processMath(expression: ast.MathExpression, output : string[], stack : [{[name: string] : any}], errors: string[]) : number {
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

function processExpression(expression: ast.Expression, output : string[], stack : [{[name: string] : any}], errors : string[]) : any {
    if (errors.length > 0) return;
    switch (expression.kind) {
        case "ConstantExpression":
            return expression.value;
        case "ReferenceExpression":
            return lookupEntireStack(stack, expression.name, errors);
        case "MathExpression":
            return processMath(expression, output, stack, errors);
    }
}

function processStatement(statement: ast.Statement, output : string[], stack : [{[name: string] : any}], errors : string[]) : void {
    if (errors.length > 0) return;
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
        default:
            break;
    }
    
}

export function execute(program : ast.FIRSTProgram) : [string[], string[]]{

    let stack : [{[name: string] : any}] = [{}];
    let output : string[] = []
    let errors : string[] = [];

    if (program.statements === undefined) {
        errors.push("No statements found");
        return [output, errors];
    }

    for (let i = 0; i < program.statements.length; i++){
        const statement = program.statements[i];
        processStatement(statement, output, stack, errors);
    }

    return [output, errors];
}