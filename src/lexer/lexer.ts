import { KEYWORDS } from "./keywords";
import { Token, TokenType } from "./token";

export class Lexer {
  private input: string;
  private position: number;
  private current: number;
  private tokens: Token[];

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.current = 0;
    this.tokens = [];
  }

  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.position = this.current;
      this.scanToken();
    }

    this.addToken('eof', '');
    return this.tokens;
  }

  private scanToken(): void {
    const char = this.advance();

    switch (char) {
      // Single-character tokens
      case '(': this.addToken('punctuator', '('); break;
      case ')': this.addToken('punctuator', ')'); break;
      case '{': this.addToken('punctuator', '{'); break;
      case '}': this.addToken('punctuator', '}'); break;
      case ',': this.addToken('punctuator', ','); break;
      case '.': this.addToken('punctuator', '.'); break;
      case ';': this.addToken('punctuator', ';'); break;
      case '+': this.addToken('operator', '+'); break;
      case '-': this.addToken('operator', '-'); break;
      case '*': this.addToken('operator', '*'); break;
      case '/':
        if (this.isRegexStart()) {
          this.regex()
        } else {
          this.addToken('operator', '/')
        }
        break;
      case '`':
        this.template();
        break;

      // Two-character tokens
      case '=':
        this.addToken('operator', this.match('=') ? '==' : '=');
        break;
      case '!':
        this.addToken('operator', this.match('=') ? '!=' : '!');
        break;
      case '<':
        this.addToken('operator', this.match('=') ? '<=' : '<');
        break;
      case '>':
        this.addToken('operator', this.match('=') ? '>=' : '>');
        break;

      // Handle whitespace
      case ' ':
      case '\r':
      case '\t':
      case '\n':
        break;

      // String literals
      case '"': this.string('"'); break;
      case "'": this.string("'"); break;

      default:
        if (this.isDigit(char)) {
          this.number();
        } else if (this.isAlpha(char)) {
          this.identifier();
        } else {
          throw new Error(`Unexpected character: ${char} at position ${this.position}`);
        }
        break;
    }
  }

  private string(quote: string): void {
    const start = this.current - 1; // Include the opening quote
    let value = '';
    const originalStart = this.current;
  
    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance(); // Skip the backslash
        if (!this.isAtEnd()) {
          const escapedChar = this.advance();
          switch (escapedChar) {
            case '"':
            case "'":
            case '\\':
              value += escapedChar;
              break;
            default:
              value += '\\' + escapedChar;
          }
        }
      } else {
        value += this.advance();
      }
    }
  
    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at position ${this.position}`);
    }
  
    this.advance(); // Consume the closing quote
  
    // Calculate the correct end position
    const end = originalStart + value.length + 1; // Add 1 for the opening and closing quotes
  
    this.addToken('string', value, start, end);
  }
  

  private number(): void {
    while (this.isDigit(this.peek())) this.advance();

    // Look for decimal
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance(); // Consume the "."
      while (this.isDigit(this.peek())) this.advance();
    }

    const value = this.input.slice(this.position, this.current);
    this.addToken('number', value);
  }

  private identifier(): void {
    const start = this.position;
    
    while (this.isAlphaNumeric(this.peek())) this.advance();

    
    const end = this.current; // `current` is the correct position after the last valid character
    const value = this.input.slice(start, end);
    const type = KEYWORDS.has(value) ? 'keyword' : 'identifier';
    
    this.addToken(type, value, start, end);
  }  

  private isAtEnd(): boolean {
    return this.current >= this.input.length;
  }

  private advance(): string {
    return this.input[this.current++];
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.input[this.current];
  }

  private peekNext(): string {
    if (this.current + 1 >= this.input.length) return '\0';
    return this.input[this.current + 1];
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.input[this.current] !== expected) return false;
    this.current++;
    return true;
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') ||
           (char >= 'A' && char <= 'Z') ||
           char === '_';
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private addToken(type: TokenType, value: string, start?: number, end?: number, flags?: string): void {
    this.tokens.push({
      type,
      value,
      start: start !== undefined ? start : this.position,
      end: end !== undefined ? end : this.current,
      ...(flags !== undefined ? { flags } : {})
    });

    this.position = end || this.current;
  }

  private template(): void {
    const operatorsList = ['+', '-', '/', '*', '%'];
    const punctuatorsList = ['(', ')', '{', '}', ':', ','];
    let value = '';
    const start = this.current - 1;
  
    while (!this.isAtEnd() && this.peek() !== '`') {
      if (this.peek() === '\\') {
        this.advance();
        if (this.peek() === '$' || this.peek() === '`') {
          value += this.peek();
          this.advance();
        } else {
          // keep both the backlash and the character for other escape sequences
          value += '\\' + this.peek();
          this.advance();
        }
      } else if (this.peek() === '$' && this.peekNext() === '{') {
        // Add the template part before the expression
        if (value.length >= 0) {
          this.addToken('template', value, start, this.current);
        }
        value = '';
  
        // Handle the ${
        this.advance(); // $
        this.advance(); // {
        this.addToken('punctuator', '${', this.current - 2, this.current);
  
        // Parse the expression
        let braceCount = 1;
        while (!this.isAtEnd() && braceCount > 0) {
          if (this.peek() === '`') {
            this.advance();
            this.template();
          } else if (this.peek() === '{') {
            braceCount++;
            this.addToken('punctuator', '{', this.current, this.current + 1);
            this.advance();
          } else if (this.peek() === '}') {
            braceCount--;
            if (braceCount === 0) {
              break;
            }
            this.addToken('punctuator', '}', this.current, this.current + 1);
            this.advance();
          } else if (this.peek() === '"' || this.peek() === "'") {
            const quote = this.peek();
            this.advance();
            let stringValue = '';
            while (!this.isAtEnd() && this.peek() !== quote) {
              stringValue += this.advance()
            }
            if (this.peek() === quote) {
              this.advance();
              this.addToken('string', stringValue, this.current - stringValue.length - 2, this.current)
            }
          } else if (this.isAlpha(this.peek())) {
            this.position = this.current;
            this.identifier();
          } else if (punctuatorsList.includes(this.peek())) {
            this.addToken('punctuator', this.peek(), this.current, this.current + 1);
            this.advance()
          } else if (operatorsList.includes(this.peek())) {
            this.addToken('operator', this.peek())
            this.advance()
          } else {
            this.advance();
          }
        }
  
        if (this.peek() === '}') {
          this.advance();
          this.addToken('punctuator', '}', this.current - 1, this.current);
        } else {
          throw new Error('Unterminated template expression');
        }
      } else {
        value += this.advance();
      }
    }
  
    if (this.isAtEnd()) {
      throw new Error('Unterminated template literal');
    }
  
    // Add any remaining template content
    if (value.length >= 0) {
      this.addToken('template', value, this.position, this.current);
    }
    this.advance(); // closing backtick
  }


  private regex(): void {
    const start = this.current - 1;
    let value = '';

    // Parse the regex pattern
    while (!this.isAtEnd() && this.peek() !== '/') {
      if (this.peek() === '\\') {
        value += this.advance(); // Keep the backslash
      }
      value += this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error('Unterminated regular expression');
    }

    this.advance(); // Closing slash

    // Parse flags
    let flags = '';
    while (this.isRegexFlag(this.peek())) {
      flags += this.advance();
    }

    this.addToken('regex', value, start, this.current, flags)
  }

  private isRegexStart(): boolean {
    // Check if the previous token makes it valid for a regex to start
    const prevToken = this.tokens[this.tokens.length - 1];
    if (!prevToken) return true;

    return prevToken.type === 'operator' ||
           prevToken.type === 'punctuator' ||
           (prevToken.type === 'keyword' && 
            ['return', 'if', 'while', 'for'].includes(prevToken.value));
  }

  private isRegexFlag(char: string): boolean {
    return /[gimsy]/.test(char);
  }
  
}
