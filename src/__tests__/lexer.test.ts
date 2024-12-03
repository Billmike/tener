import { Lexer } from '../lexer/lexer';

describe('Lexer', () => {
  describe('Numbers', () => {
    it('should tokenize integer numbers', () => {
      const input = '42';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens).toHaveLength(2); // Including EOF
      expect(tokens[0]).toEqual({
        type: 'number',
        value: '42',
        start: 0,
        end: 2
      });
    });

    it('should tokenize decimal numbers', () => {
      const input = '3.14';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens[0]).toEqual({
        type: 'number',
        value: '3.14',
        start: 0,
        end: 4
      });
    });
  });

  describe('Strings', () => {
    it('should tokenize double-quoted strings', () => {
      const input = '"hello"';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens[0]).toEqual({
        type: 'string',
        value: 'hello',
        start: 0,
        end: 7
      });
    });

    it('should tokenize single-quoted strings', () => {
      const input = "'world'";
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens[0]).toEqual({
        type: 'string',
        value: 'world',
        start: 0,
        end: 7
      });
    });

    it('should handle escaped quotes', () => {
      const input = '"hello \\"world\\""';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens[0]).toEqual({
        type: 'string',
        value: 'hello "world"',
        start: 0,
        end: 15
      });
    });
  });

  describe('Identifiers and Keywords', () => {
    it('should tokenize identifiers', () => {
      const input = 'myVariable';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens[0]).toEqual({
        type: 'identifier',
        value: 'myVariable',
        start: 0,
        end: 10
      });
    });

    it('should recognize keywords', () => {
      const input = 'let const if';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens).toHaveLength(4); // Including EOF
      expect(tokens.map(t => t.type)).toEqual(['keyword', 'keyword', 'keyword', 'eof']);
    });
  });

  describe('Operators', () => {
    it('should tokenize single-character operators', () => {
      const input = '+ - *';
      const tokens = new Lexer(input).tokenize();

      console.log('tokens', tokens)
      
      expect(tokens).toHaveLength(4); // Including EOF
      expect(tokens.map(t => t.value)).toEqual(['+', '-', '*', '']);
      expect(tokens.map(t => t.type)).toEqual(['operator', 'operator', 'operator', 'eof']);
    });

    it('should tokenize two-character operators', () => {
      const input = '== != <= >=';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens).toHaveLength(5); // Including EOF
      expect(tokens.map(t => t.value)).toEqual(['==', '!=', '<=', '>=', '']);
    });
  });

  describe('Complex Expressions', () => {
    it('should tokenize a variable declaration', () => {
      const input = 'let x = 42;';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'keyword', value: 'let' },
        { type: 'identifier', value: 'x' },
        { type: 'operator', value: '=' },
        { type: 'number', value: '42' },
        { type: 'punctuator', value: ';' },
        { type: 'eof', value: '' }
      ]);
    });

    it('should tokenize a function call', () => {
      const input = 'console.log("hello");';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'identifier', value: 'console' },
        { type: 'punctuator', value: '.' },
        { type: 'identifier', value: 'log' },
        { type: 'punctuator', value: '(' },
        { type: 'string', value: 'hello' },
        { type: 'punctuator', value: ')' },
        { type: 'punctuator', value: ';' },
        { type: 'eof', value: '' }
      ]);
    });
  });

  describe('Error Handling', () => {
    it('should throw on unterminated string', () => {
      const input = '"unclosed';
      expect(() => new Lexer(input).tokenize()).toThrow('Unterminated string');
    });

    it('should throw on invalid characters', () => {
      const input = '@';
      expect(() => new Lexer(input).tokenize()).toThrow('Unexpected character');
    });
  });

  describe('Template Strings', () => {
    it('should tokenize basic template string', () => {
      const input = '`Hello, world`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens[0]).toEqual({
        type: 'template',
        value: 'Hello, world',
        start: 0,
        end: 13
      });
    });
  
    it('should tokenize template string with expressions', () => {
      const input = '`Hello, ${name}.`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: 'Hello, ' },
        { type: 'punctuator', value: '${' },
        { type: 'identifier', value: 'name' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '.' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle nested template expressions', () => {
      const input = '`Value: ${`nested ${x}`}`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: 'Value: ' },
        { type: 'punctuator', value: '${' },
        { type: 'template', value: 'nested ' },
        { type: 'punctuator', value: '${' },
        { type: 'identifier', value: 'x' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '' },
        { type: 'eof', value: '' }
      ]);
    });
  });
  
  describe('Regular Expressions', () => {
    it('should tokenize simple regex', () => {
      const input = '/ab+c/';
      const tokens = new Lexer(input).tokenize();

      console.log('tokens', tokens)
      
      expect(tokens[0]).toEqual({
        type: 'regex',
        value: 'ab+c',
        flags: '',
        start: 0,
        end: 6
      });
    });
  
    it('should tokenize regex with flags', () => {
      const input = '/test/gi';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens[0]).toEqual({
        type: 'regex',
        value: 'test',
        flags: 'gi',
        start: 0,
        end: 8
      });
    });
  
    it('should handle regex with special characters', () => {
      const input = '/\\w+\\s*/g';
      const tokens = new Lexer(input).tokenize();

      expect(tokens[0]).toEqual({
        type: 'regex',
        value: '\\w+\\s*',
        flags: 'g',
        start: 0,
        end: 9
      });
    });
  
    it('should handle regex after operator', () => {
      const input = 'x = /test/i';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value, flags: t.flags }))).toEqual([
        { type: 'identifier', value: 'x' },
        { type: 'operator', value: '=' },
        { type: 'regex', value: 'test', flags: 'i' },
        { type: 'eof', value: '' }
      ]);
    });
  });

  describe('Complex Template Strings', () => {
    it('should handle multiple expressions in one template', () => {
      const input = '`${x} + ${y} = ${x + y}`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: '' },
        { type: 'punctuator', value: '${' },
        { type: 'identifier', value: 'x' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: ' + ' },
        { type: 'punctuator', value: '${' },
        { type: 'identifier', value: 'y' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: ' = ' },
        { type: 'punctuator', value: '${' },
        { type: 'identifier', value: 'x' },
        { type: 'operator', value: '+' },
        { type: 'identifier', value: 'y' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle deeply nested template expressions', () => {
      const input = '`outer ${`middle ${`inner ${x}`}`}`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: 'outer ' },
        { type: 'punctuator', value: '${' },
        { type: 'template', value: 'middle ' },
        { type: 'punctuator', value: '${' },
        { type: 'template', value: 'inner ' },
        { type: 'punctuator', value: '${' },
        { type: 'identifier', value: 'x' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle template strings with expressions at the start', () => {
      const input = '`${prefix}content`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: '' },
        { type: 'punctuator', value: '${' },
        { type: 'identifier', value: 'prefix' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: 'content' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle template strings with expressions at the end', () => {
      const input = '`content${suffix}`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: 'content' },
        { type: 'punctuator', value: '${' },
        { type: 'identifier', value: 'suffix' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle empty template strings', () => {
      const input = '``';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: '' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle template strings with only expressions', () => {
      const input = '`${x}${y}${z}`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: '' },
        { type: 'punctuator', value: '${' },
        { type: 'identifier', value: 'x' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '' },
        { type: 'punctuator', value: '${' },
        { type: 'identifier', value: 'y' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '' },
        { type: 'punctuator', value: '${' },
        { type: 'identifier', value: 'z' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle expressions with object literals', () => {
      const input = '`${({ foo: "bar" })}`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: '' },
        { type: 'punctuator', value: '${' },
        { type: 'punctuator', value: '(' },
        { type: 'punctuator', value: '{' },
        { type: 'identifier', value: 'foo' },
        { type: 'punctuator', value: ':' },
        { type: 'string', value: 'bar' },
        { type: 'punctuator', value: '}' },
        { type: 'punctuator', value: ')' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle escaped backticks in template strings', () => {
      const input = '`escaped \\` backtick`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: 'escaped ` backtick' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle escaped dollar signs in template strings', () => {
      const input = '`\\${not an expression}`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: '${not an expression}' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle mixed escaped and actual expressions', () => {
      const input = '`\\${escaped} ${real}`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: '${escaped} ' },
        { type: 'punctuator', value: '${' },
        { type: 'identifier', value: 'real' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: '' },
        { type: 'eof', value: '' }
      ]);
    });
  });
});