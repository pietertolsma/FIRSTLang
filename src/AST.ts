
/** ===========================================================================
 *              TYPES
    ===========================================================================
 */
export interface PrimitiveType<T> {
    kind: 'PrimitiveType',
    name: T
}

export type VoidType = PrimitiveType<'Void'>
export type NumberType = PrimitiveType<'Number'>
export type StringType = PrimitiveType<'String'>
export type BooleanType = PrimitiveType<'Boolean'>

export type EntityName = string

export type Type = 
    | VoidType
    | NumberType
    | StringType
    | BooleanType
    | EntityName
    ;

/** ===========================================================================
 *             EXPRESSIONS
    ===========================================================================
 */

export interface ReferenceExpression {
    kind: 'ReferenceExpression';
    name: EntityName;
}

export interface ConstantExpression {
    kind: 'ConstantExpression';
    type: Type;
    value: any;
}

export interface MathExpression {
    kind: 'MathExpression';
    left: Expression;
    operator: "add" | "sub" | "mul" | "div";
    right: Expression;
}

export interface ColorExpression {
    kind: 'ColorExpression';
    color: Expression
}

export type Expression = 
    | ReferenceExpression
    | MathExpression
    | ConstantExpression
    ;
/** ===========================================================================
 *            DECLARATIONS
 * ============================================================================
 * */

export interface VariableDeclaration {
    kind: 'VariableDeclaration';
    name: EntityName;
    type: Type;
    value: Expression;
}

export interface For {
    kind: 'For';
    name: EntityName;
    start: Expression;
    end: Expression;
    step: Expression;
    body: Statement[];
}

export interface Move {
    kind: 'Move';
    distance: Expression;
    direction: "forward" | "backward" | any;
}

export type Declaration = 
    | VariableDeclaration
    | For
    | Move
    ;

/**
 * ===========================================================================
 * 
 *                             STATEMENTS
 * 
 * ===========================================================================
 */

export type Statement = 
    | Expression
    | Declaration
    ;

/**
 * ===========================================================================
 * 
 *                            PROGRAM
 * 
 *  ===========================================================================
 */

export interface FIRSTProgram {
    statements: Statement[]
}


/**
 * Example of AST:
 */

export const EXAMPLE_PROGRAM : FIRSTProgram = {
    statements: [
        {
            kind: "VariableDeclaration",
            name: "x",
            type: "Number",
            value: {
                kind: "MathExpression",
                operator: "mul",
                left: {
                    kind: "ConstantExpression",
                    value: 1,
                    type: "Number"
                },
                right: {
                    kind: "ConstantExpression",
                    value: 2,
                    type: "Number"
                }
            }
        },
        {
            kind: "For",
            name: "i",
            start: {
                kind: "ConstantExpression",
                value: 0,
                type: "Number"
            },
            end: {
                kind: "ReferenceExpression",
                name: "x",
            },
            step: {
                kind: "ConstantExpression",
                value: 1,
                type: "Number"
            },
            body: [
                {
                    kind: "VariableDeclaration",
                    name: "x",
                    type: "Number",
                    value: {
                        kind: "ReferenceExpression",
                        name: "i",
                    }
                },
                {
                    kind: "Move",
                    distance: {
                        kind: "ReferenceExpression",
                        name: "x",
                    },
                    direction: "forward"
                }
            ]
        }
    ]
}