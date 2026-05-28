import { useState, useEffect } from 'react';
import { LookupResult } from '../types';
import { getTokens, lookupToken } from '../dictionaryUtils';

export const useDictionary = (initialText: string = '') => {
  const [text, setText] = useState<string>(initialText);
  const [tokens, setTokens] = useState<string[]>([]);
  const [results, setResults] = useState<LookupResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Actualizar tokens cuando cambia el texto
  useEffect(() => {
    setTokens(getTokens(text));
  }, [text]);

  const lookup = async (index: number) => {
    setLoading(true);
    setResults([]);
    const matches = await lookupToken(tokens, index);
    setResults(matches);
    setLoading(false);
  };

  return {
    text,
    setText,
    tokens,
    results,
    loading,
    lookup,
  };
};
