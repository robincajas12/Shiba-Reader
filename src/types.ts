/**
 * Core types for the Jitendex Dictionary Engine
 */

export type StructuredContentNode = 
  | string 
  | {
      tag?: string;
      content?: StructuredContentNode | StructuredContentNode[];
      text?: string;
      type?: string;
      data?: {
        content?: string;
        class?: string;
        code?: string;
      };
      style?: Record<string, any>;
      lang?: string;
      href?: string;
      title?: string;
      id?: string; // ID temporal para selección de acepciones
    };

/**
 * [term, reading, tags, rules, score, content]
 */
export type DictionaryEntry = [
  string, // term
  string, // reading
  string, // tags
  string, // rules
  number, // score
  StructuredContentNode | StructuredContentNode[] // content
];

export type LookupCandidate = {
  text: string;
  type: 'exact' | 'deinflected' | 'combined' | 'deinflected-combined' | 'prefix';
  original: string;
  info?: string;
};

export type LookupResult = {
  entry: DictionaryEntry;
  cand: LookupCandidate;
};

export type Token = {
  text: string;
  start: number;
};
