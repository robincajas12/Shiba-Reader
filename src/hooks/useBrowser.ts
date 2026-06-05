import { useCallback } from 'react';

// Simple singleton to hold state across screens without Context for now
let browserHistory: any[] = [];
let browserBookmarks: any[] = [
  { id: '1', title: 'NHK News Web Easy', url: 'https://www3.nhk.or.jp/news/easy/' },
  { id: '2', title: 'Aozora Bunko', url: 'https://www.aozora.gr.jp/' },
  { id: '3', title: 'Watanoc', url: 'https://watanoc.com/' },
];

const listeners: any[] = [];
const notify = () => listeners.forEach(l => l());

export const useBrowser = () => {
  const addToHistory = useCallback((url: string) => {
    const newItem = { id: Date.now().toString(), url, timestamp: Date.now() };
    browserHistory = [newItem, ...browserHistory.filter(item => item.url !== url)].slice(0, 20);
    notify();
  }, []);

  const addBookmark = useCallback((title: string, url: string) => {
    browserBookmarks = [...browserBookmarks, { id: Date.now().toString(), title, url }];
    notify();
  }, []);

  // Simple subscription to updates
  const [_, setTick] = (require('react').useState)(0);
  (require('react').useEffect)(() => {
    const listener = () => setTick((t: any) => t + 1);
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    history: browserHistory,
    bookmarks: browserBookmarks,
    addToHistory,
    addBookmark
  };
};
