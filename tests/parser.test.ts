
import {LEXER, TokenKind, evaluate} from '../src/parser';

describe('Lexer', () => {
    it('should be case insensitive', async () => {
        LEXER.parse(`FOR 10 BACKWARD 5 END`);
        LEXER.parse(`for 10 backward 5 end`);
    });

    it('should parse turn correctly', async () => {
        let parsed = LEXER.parse(`TURN 30`);
        expect(parsed?.kind).toBe(TokenKind.Turn);
    });

    it('should parse tokens correctly', async () => {
        let parsed = LEXER.parse(`FOR 10 FORWARD 5 END`);
        expect(parsed?.kind).toBe(TokenKind.For);
        expect(parsed?.text).toBe("FOR");
    });
});

describe('Parser', () => {
    it('should parse for correctly', async () => {
        let res = evaluate(`FOR 2 forward 5 end`);
        expect(res).toStrictEqual(["FORWARD 5", "FORWARD 5"]);
    });

    it('should parse turn correctly', async () => {
        let res = evaluate(`turn 90`);
        expect(res).toEqual(["TURN 90"]);
    });

    it('should parse color correctly', async () => {
        let res = evaluate(`color red`);
        expect(res).toEqual(["COLOR RED"]);

        res = evaluate(`for 1 color blue end color red forward 5`);
        expect(res).toEqual(['COLOR BLUE', 'COLOR RED', 'FORWARD 5']);

    });

    it('should parse correctly', async () => {
        let res = evaluate(`FOR 2 backward 5 for 1 forward 5 turn 90 end END`);
        expect(res).toEqual(["BACKWARD 5", "FORWARD 5", "TURN 90", "BACKWARD 5", "FORWARD 5", "TURN 90"]);

        res = evaluate(`COLOR RED TURN 10 COLOR BLACK FOR 2 backward 5 for 1 forward 5 turn 90 end END`);
        expect(res).toEqual(["COLOR RED", "TURN 10", "COLOR BLACK", "BACKWARD 5", "FORWARD 5", "TURN 90", "BACKWARD 5", "FORWARD 5", "TURN 90"]);
    });
});