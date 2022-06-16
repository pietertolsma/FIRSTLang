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
                        type: "unknown"
                    },
                },
            ]
        });
    });

    it("should build the for loop AST correctly", async () => {
        let tree = evaluate("for i = 0 to 10 forward(i) end");
        expect(tree).toEqual({
            statements: [
              {
                "body":  [
                   {
                    "direction": "forward",
                    "distance":  {
                      "kind": "ReferenceExpression",
                      "name": "i",
                      "type": "unknown",
                    },
                    "kind": "Move",
                  },
                ],
                "end":  {
                  "kind": "ConstantExpression",
                  "type": "Number",
                  "value": 10,
                },
                "kind": "For",
                "name": "i",
                "start":  {
                  "kind": "ConstantExpression",
                  "type": "Number",
                  "value": 0,
                },
                "step": {
                  "kind": "ConstantExpression",
                  "type": "Number",
                  "value": 1,
                },
              },
            ]
            });
    });
    
    it("Should not include = sign in variable", async () => {
        let tree = evaluate("test= 10 forward(test)");
        let [output, errors] : [string[], string[]] = execute(tree);
        expect(output).toEqual(["forward 10"]);
    });

    it("Should produce the correct output", async () => {
        let tree = evaluate("test = 10 forward(test)");
        let [output, errors] : [string[], string[]] = execute(tree);
        expect(output).toEqual(["forward 10"]);
    });

    it("Should scope correctly", async () => {
        let tree = evaluate("for i = 0 to 1 test = 4 forward(1) end forward(test)");
        let [output, errors] : [string[], string[]] = execute(tree);
        expect(errors).toEqual(["Undefined variable test"]);
    });

    it("Should produce the correct output with for loop containing both variables", async () => {
        let tree = evaluate("test = 10 hi = 12 for test = test to hi forward(test) end");
        let [output, errors] : [string[], string[]] = execute(tree);
        expect(output).toEqual(["forward 10", "forward 11"]);
    });

    it("Should produce the correct output with for loop", async () => {
        let tree = evaluate("test = 10 for test = test to 12 forward(test) end");
        let [output, errors] : [string[], string[]] = execute(tree);
        expect(output).toEqual(["forward 10", "forward 11"]);
    });
})