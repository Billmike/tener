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

  describe('Comments', () => {
    it('should handle single-line comments', () => {
      const input = '// This is a comment\nlet x = 5;';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'comment', value: ' This is a comment' },
        { type: 'keyword', value: 'let' },
        { type: 'identifier', value: 'x' },
        { type: 'operator', value: '=' },
        { type: 'number', value: '5' },
        { type: 'punctuator', value: ';' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle multi-line comments', () => {
      const input = '/* This is a\nmulti-line\ncomment */\nlet x = 5;';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'comment', value: ' This is a\nmulti-line\ncomment ' },
        { type: 'keyword', value: 'let' },
        { type: 'identifier', value: 'x' },
        { type: 'operator', value: '=' },
        { type: 'number', value: '5' },
        { type: 'punctuator', value: ';' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle nested multi-line comments', () => {
      const input = '/* outer /* nested */ comment */';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'comment', value: ' outer /* nested */ comment ' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle comments in expressions', () => {
      const input = 'let x = 5 /* comment */ + 3; // end comment';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'keyword', value: 'let' },
        { type: 'identifier', value: 'x' },
        { type: 'operator', value: '=' },
        { type: 'number', value: '5' },
        { type: 'comment', value: ' comment ' },
        { type: 'operator', value: '+' },
        { type: 'number', value: '3' },
        { type: 'punctuator', value: ';' },
        { type: 'comment', value: ' end comment' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle comments in template literals', () => {
      const input = '`template ${/* comment */ 5} // not a comment`';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'template', value: 'template ' },
        { type: 'punctuator', value: '${' },
        { type: 'comment', value: ' comment ' },
        { type: 'number', value: ' 5' },
        { type: 'punctuator', value: '}' },
        { type: 'template', value: ' // not a comment' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle comment-like content in strings', () => {
      const input = '"// not a comment" + "/* also not a comment */"';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'string', value: '// not a comment' },
        { type: 'operator', value: '+' },
        { type: 'string', value: '/* also not a comment */' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle unterminated multi-line comment', () => {
      const input = '/* unterminated';
      expect(() => new Lexer(input).tokenize()).toThrow('Unterminated multi-line comment');
    });
  });

  describe('Comment Edge Cases', () => {
    it.skip('should handle comments followed by line terminators', () => {
      const input = '// comment\r\ncode';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'comment', value: ' comment' },
        { type: 'identifier', value: 'code' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle empty single-line comments', () => {
      const input = '//\ncode';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'comment', value: '' },
        { type: 'identifier', value: 'code' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle empty multi-line comments', () => {
      const input = '/**/code';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'comment', value: '' },
        { type: 'identifier', value: 'code' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle deeply nested multi-line comments', () => {
      const input = '/* l1 /* l2 /* l3 */ l2 */ l1 */';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'comment', value: ' l1 /* l2 /* l3 */ l2 */ l1 ' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle comments in regex literals', () => {
      const input = '/pattern/ // comment\n/* comment */';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'regex', value: 'pattern' },
        { type: 'comment', value: ' comment' },
        { type: 'comment', value: ' comment ' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle comments in complex expressions', () => {
      const input = 'x = /* c1 */ 5 /* c2 */ + /* c3 */ 3';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'identifier', value: 'x' },
        { type: 'operator', value: '=' },
        { type: 'comment', value: ' c1 ' },
        { type: 'number', value: '5' },
        { type: 'comment', value: ' c2 ' },
        { type: 'operator', value: '+' },
        { type: 'comment', value: ' c3 ' },
        { type: 'number', value: '3' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle comments with unusual whitespace', () => {
      const input = '/*\r\n\t\f\v*/';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'comment', value: '\r\n\t\f\v' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle multiple consecutive comments', () => {
      const input = '// c1\n// c2\n/* c3 *//* c4 */';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'comment', value: ' c1' },
        { type: 'comment', value: ' c2' },
        { type: 'comment', value: ' c3 ' },
        { type: 'comment', value: ' c4 ' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle comments with stars', () => {
      const input = '/* ** * ** */';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'comment', value: ' ** * ** ' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it.skip('should handle multi-line comment with multiple closes', () => {
      const input = '/* comment */ */ after';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'comment', value: ' comment ' },
        { type: 'operator', value: '*' },
        { type: 'operator', value: '/' },
        { type: 'identifier', value: 'after' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it('should handle comment-like sequences in string literals', () => {
      const input = '"http://example.com" + "/**/";';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'string', value: 'http://example.com' },
        { type: 'operator', value: '+' },
        { type: 'string', value: '/**/' },
        { type: 'punctuator', value: ';' },
        { type: 'eof', value: '' }
      ]);
    });
  });

  describe('JSX-like Syntax Edge Cases', () => {
    it.skip('should handle division operators between JSX tags', () => {
      const input = '<div>a / b</div>';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'operator', value: '<' },
        { type: 'identifier', value: 'div' },
        { type: 'operator', value: '>' },
        { type: 'identifier', value: 'a' },
        { type: 'operator', value: '/' },
        { type: 'identifier', value: 'b' },
        { type: 'operator', value: '<' },
        { type: 'operator', value: '/' },
        { type: 'identifier', value: 'div' },
        { type: 'operator', value: '>' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it.skip('should handle mixed JSX and regular expressions', () => {
      const input = '<div>{test.match(/regex/)} / <span>/not-regex/</span>';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'operator', value: '<' },
        { type: 'identifier', value: 'div' },
        { type: 'operator', value: '>' },
        { type: 'punctuator', value: '{' },
        { type: 'identifier', value: 'test' },
        { type: 'punctuator', value: '.' },
        { type: 'identifier', value: 'match' },
        { type: 'punctuator', value: '(' },
        { type: 'regex', value: 'regex' },
        { type: 'punctuator', value: ')' },
        { type: 'punctuator', value: '}' },
        { type: 'operator', value: '/' },
        { type: 'operator', value: '<' },
        { type: 'identifier', value: 'span' },
        { type: 'operator', value: '>' },
        { type: 'operator', value: '/' },
        { type: 'identifier', value: 'not-regex' },
        { type: 'operator', value: '/' },
        { type: 'operator', value: '<' },
        { type: 'operator', value: '/' },
        { type: 'identifier', value: 'span' },
        { type: 'operator', value: '>' },
        { type: 'eof', value: '' }
      ]);
    });
  
    it.skip('should handle comments and division in JSX content', () => {
      const input = '<div>/* comment */ 10 / 2 /* comment */</div>';
      const tokens = new Lexer(input).tokenize();
      
      expect(tokens.map(t => ({ type: t.type, value: t.value }))).toEqual([
        { type: 'operator', value: '<' },
        { type: 'identifier', value: 'div' },
        { type: 'operator', value: '>' },
        { type: 'comment', value: ' comment ' },
        { type: 'number', value: '10' },
        { type: 'operator', value: '/' },
        { type: 'number', value: '2' },
        { type: 'comment', value: ' comment ' },
        { type: 'operator', value: '<' },
        { type: 'operator', value: '/' },
        { type: 'identifier', value: 'div' },
        { type: 'operator', value: '>' },
        { type: 'eof', value: '' }
      ]);
    });
  });
});