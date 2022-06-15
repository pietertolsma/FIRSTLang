import 'jest';
import {LEXER, TokenKind, evaluate} from '../src/parser';

describe('Lexer', () => {
    it('should be case insensitive', async () => {
        LEXER.parse(`FOR 10 DOWN END`);
        LEXER.parse(`for 10 down end`);
    });

    it('should parse tokens correctly', async () => {
        let parsed = LEXER.parse(`FOR 10 DOWN END`);
        expect(parsed.kind).toBe(TokenKind.For);
        expect(parsed.text).toBe("FOR");
    });
});

describe('Parser', () => {
    it('should parse correctly', async () => {
        let res = evaluate(`FOR 2 DOWN FOR 2 UP END\n END`);
        expect(res).toStrictEqual(["DOWN", "UP", "UP", "DOWN", "UP", "UP"]);
    });
});