import { useState, useCallback, useEffect } from 'react';
import { dbEngine } from '../db/engine';
import { Bookmark, HistoryEntry } from '../db/schemas/Browser';

export const DEFAULT_GOOGLE_BOOKMARK = {
  title: 'Google',
  url: 'https://www.google.com/'
};

const normalizeBookmarkUrl = (url: string) => url.trim().replace(/\/+$/, '').toLowerCase();

export const hasDefaultGoogleBookmark = (bookmarkList: Bookmark[]) => {
  const normalizedDefault = normalizeBookmarkUrl(DEFAULT_GOOGLE_BOOKMARK.url);

  return bookmarkList.some((bookmark) => {
    const normalizedUrl = normalizeBookmarkUrl(bookmark.url);
    return normalizedUrl === normalizedDefault;
  });
};

const dedupeBookmarksByUrl = (bookmarkList: Bookmark[]) => {
  const seen = new Set<string>();
  return bookmarkList.filter((bookmark) => {
    const normalizedUrl = normalizeBookmarkUrl(bookmark.url);
    if (seen.has(normalizedUrl)) {
      return false;
    }
    seen.add(normalizedUrl);
    return true;
  });
};

export const useBrowser = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  const historyRepo = dbEngine.getRepository('HistoryRepository');
  const bookmarkRepo = dbEngine.getRepository('BookmarkRepository');

  const loadBrowserData = useCallback(async () => {
    try {
      const recentHistory = await historyRepo.getRecent();
      const rawBookmarks = await bookmarkRepo.getAll();
      const bookmarksWithoutDuplicates = dedupeBookmarksByUrl(rawBookmarks);

      const duplicateIds = rawBookmarks
        .filter((bookmark) => !bookmarksWithoutDuplicates.some((uniqueBookmark) => uniqueBookmark.id === bookmark.id))
        .map((bookmark) => bookmark.id);

      for (const duplicateId of duplicateIds) {
        await bookmarkRepo.delete(duplicateId);
      }

      let allBookmarks = dedupeBookmarksByUrl(await bookmarkRepo.getAll());

      if (!hasDefaultGoogleBookmark(allBookmarks)) {
        await bookmarkRepo.insert({
          ...DEFAULT_GOOGLE_BOOKMARK,
          created_at: Date.now()
        } as Bookmark);
        allBookmarks = dedupeBookmarksByUrl(await bookmarkRepo.getAll());
      }

      setHistory(recentHistory);
      setBookmarks(allBookmarks);
    } catch (error) {
      console.error("Error loading browser data from DB:", error);
    }
  }, [historyRepo, bookmarkRepo]);

  useEffect(() => {
    loadBrowserData();
  }, [loadBrowserData]);

  const addToHistory = useCallback(async (url: string) => {
    try {
      // Remove previous entry for same URL if exists to keep it fresh at the top
      await historyRepo.deleteByUrl(url);
      
      await historyRepo.insert({
          url,
          timestamp: Date.now()
      } as HistoryEntry);
      
      // Reload history to reflect changes
      const recentHistory = await historyRepo.getRecent();
      setHistory(recentHistory);
    } catch (error) {
      console.error("Error adding to history:", error);
    }
  }, [historyRepo]);

  const addBookmark = useCallback(async (title: string, url: string) => {
    try {
      const existing = await bookmarkRepo.findByUrl(url);
      if (existing) return; // Already bookmarked

      await bookmarkRepo.insert({
          title,
          url,
          created_at: Date.now()
      } as Bookmark);
      
      const allBookmarks = await bookmarkRepo.getAll();
      setBookmarks(allBookmarks);
    } catch (error) {
      console.error("Error adding bookmark:", error);
    }
  }, [bookmarkRepo]);

  const removeBookmark = useCallback(async (id: number) => {
    try {
      await bookmarkRepo.delete(id);
      const allBookmarks = await bookmarkRepo.getAll();
      setBookmarks(allBookmarks);
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  }, [bookmarkRepo]);

  const clearHistory = useCallback(async () => {
    try {
      await historyRepo.deleteAll();
      setHistory([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  }, [historyRepo]);

  const isBookmarked = useCallback(async (url: string) => {
    try {
      const existing = await bookmarkRepo.findByUrl(url);
      return !!existing;
    } catch (error) {
      return false;
    }
  }, [bookmarkRepo]);

  return {
    history,
    bookmarks,
    addToHistory,
    addBookmark,
    removeBookmark,
    clearHistory,
    isBookmarked,
    refreshBrowserData: loadBrowserData
  };
};
