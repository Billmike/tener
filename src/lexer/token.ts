export type TokenType =
  | 'number'
  | 'string'
  | 'identifier'
  | 'operator'
  | 'keyword'
  | 'punctuator'
  | 'template'
  | 'regex'
  | 'eof';

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
  flags?: string; // For regex tokens
}