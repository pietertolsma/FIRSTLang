import 'jest';
import {LEXER, TokenKind, evaluate} from '../src/parser';

describe('Lexer', () => {
    it('should be case insensitive', async () => {
        LEXER.parse(`FOR 10 BACKWARD END`);
        LEXER.parse(`for 10 backward end`);
    });

    it('should parse turn correctly', async () => {
        let parsed = LEXER.parse(`TURN 30`);
        expect(parsed.kind).toBe(TokenKind.Turn);
    });

    it('should parse tokens correctly', async () => {
        let parsed = LEXER.parse(`FOR 10 FORWARD END`);
        expect(parsed.kind).toBe(TokenKind.For);
        expect(parsed.text).toBe("FOR");
    });
});

describe('Parser', () => {
    it('should parse for correctly', async () => {
        let res = evaluate(`FOR 2 forward end`);
        expect(res).toStrictEqual(["FORWARD", "FORWARD"]);
    });

    it('should parse turn correctly', async () => {
        let res = evaluate(`turn 90`);
        expect(res).toEqual(["TURN 90"]);
    });

    it('should parse correctly', async () => {
        let res = evaluate(`FOR 2 backward for 1 forward turn 90 end END`);
        expect(res).toEqual(["BACKWARD", "FORWARD", "TURN 90", "BACKWARD", "FORWARD", "TURN 90"]);
    });
});