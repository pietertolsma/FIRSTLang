// export {evaluate} from "./parser"
import {evaluate} from "./parser";
import {execute} from "./executioner";

export default function (code : string) : [string[], string[]] {
    let tree = evaluate(code);
    let [output, errors] = execute(tree);
    return [output, errors];
}