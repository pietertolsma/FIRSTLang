
import {execute} from "../src/executioner";
import {EXAMPLE_PROGRAM} from "../src/AST";

describe("Executioner", () => {
    it("should execute for correctly", async () => {
        let output : string[] = execute(EXAMPLE_PROGRAM);

        expect(output).toEqual(["forward 0", "forward 1"]);
    });
})