import {evaluate} from "../src/parser";
import {execute} from "../src/executioner";

describe("Evaluation", () => {
    it("should build the AST correctly", async () => {
        let tree = evaluate("test = 10 forward(test)");
        expect(tree).toEqual({
            statements: [
                {
                    kind: "VariableDeclaration",
                    name: "test",
                    type: "Number",
                    value: {
                        kind: "ConstantExpression",
                        value: 10,
                        type: "Number"
                    }
                },
                {
                    kind: "Move",
                    direction : "forward",
                    distance: {
                        kind : "ReferenceExpression",
                        name: "test",
                    },
                },
            ]
        });
    });

    it("Should produce the correct output", async () => {
        let tree = evaluate("test = 10 forward(test)");
        let output = execute(tree);
        expect(output).toEqual(["forward 10"]);
    });
})

// import {LEXER, TokenKind, evaluate} from '../src/parser';

// describe('Lexer', () => {
//     it('should be case insensitive', async () => {
//         LEXER.parse(`FOR 10 BACKWARD(5) END`);
//         LEXER.parse(`for 10 backward(5) end`);
//     });

//     it('should parse turn correctly', async () => {
//         let parsed = LEXER.parse(`TURN(30)`);
//         expect(parsed?.kind).toBe(TokenKind.Turn);
//     });

//     it('should parse tokens correctly', async () => {
//         let parsed = LEXER.parse(`FOR 10 FORWARD(5) END`);
//         expect(parsed?.kind).toBe(TokenKind.For);
//         expect(parsed?.text).toBe("FOR");
//     });
// });

// describe('Parser', () => {
//     it('should parse for correctly', async () => {
//         let res = evaluate(`FOR 2 forward(5) end`);
//         expect(res).toStrictEqual(["FORWARD 5", "FORWARD 5"]);
//     });

//     it('should allow math', async () => {
//         let res = evaluate(`test = 3 / 2 anotherTest = test + 2 forward(anotherTest)`);
//         expect(res).toStrictEqual(["FORWARD 3.5"]);
//     });

//     it('should allow math parenthesis', async () => {
//         let res = evaluate(`test = (3 * 2) forward(test)`);
//         expect(res).toStrictEqual(["FORWARD 6"]);
//     });

//     it('should allow multiplying negatively', async () => {
//         console.log("STARTING TEST NOW");
//         let res = evaluate(`test = -5 for 3 test = (-1 * test) forward(test) end`);
//         expect(res).toStrictEqual(["FORWARD -5", "FORWARD 5"]);
//     });

//     it('should allow math in variable setting', async () => {
//         let res = evaluate(`a = 2 a = a + 2 forward(a)`);
//         expect(res).toStrictEqual(["FORWARD 4"]);
//     });

//     it('should not allow string math', async () => {
//         let res = evaluate(`hello = "hello" test = 3 + hello color(test)`);
//         expect(res).toStrictEqual(["ERROR: Math operations can only be done on numbers"]);
//     });

//     it('should allow variable', async () => {
//         let res = evaluate(`test = 10 color(test)`);
//         expect(res).toStrictEqual(["COLOR 10"]);
//         res = evaluate(`test = "red" color(test)`);
//         expect(res).toStrictEqual(["COLOR red"]);

//         res = evaluate("runs = 2 for runs forward(1) end");
//         expect(res).toEqual(["FORWARD 1", "FORWARD 1"]);

//         res = evaluate(`runs = "test" for runs forward(1) end`);
//         expect(res).toEqual(["ERROR: FOR loop variable must be a number"]);
//     });

//     it('should allow negative numbers', async () => {
//         let res = evaluate(`forward(-5)`);
//         expect(res).toStrictEqual(["FORWARD -5"]);
//     });

//     it('should parse turn correctly', async () => {
//         let res = evaluate(`turn(90)`);
//         expect(res).toEqual(["TURN 90"]);
//     });

//     it('should parse color correctly', async () => {
//         let res = evaluate(`color("red")`);
//         expect(res).toEqual(["COLOR red"]);

//         res = evaluate(`for 1 color("blue") end color("red") forward(5)`);
//         expect(res).toEqual(['COLOR blue', 'COLOR red', 'FORWARD 5']);

//     });

//     it('should parse correctly', async () => {
//         let res = evaluate(`FOR 2 backward(5) for 1 forward(5) turn(90) end END`);
//         expect(res).toEqual(["BACKWARD 5", "FORWARD 5", "TURN 90", "BACKWARD 5", "FORWARD 5", "TURN 90"]);

//         res = evaluate(`COLOR("RED") TURN(10) COLOR("BLACK") FOR 2 backward(5) for 1 forward(5) turn(90) end END`);
//         expect(res).toEqual(["COLOR RED", "TURN 10", "COLOR BLACK", "BACKWARD 5", "FORWARD 5", "TURN 90", "BACKWARD 5", "FORWARD 5", "TURN 90"]);
//     });
// });