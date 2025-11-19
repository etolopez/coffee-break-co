'use client';

/**
 * Navigation History Hook
 * Tracks user navigation path and provides intelligent back navigation
 * Uses sessionStorage to persist navigation history across page refreshes
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Simple logger for navigation history
const logNavigation = (message: string, data?: any) => {
  // Enable logging for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Navigation: ${message}`, data);
  }
};

interface NavigationEntry {
  path: string;
  timestamp: number;
  title?: string;
}

interface NavigationHistory {
  entries: NavigationEntry[];
  currentIndex: number;
}

/**
 * Hook for managing navigation history and intelligent back navigation
 * @returns Object with navigation history methods and current state
 */
export function useNavigationHistory() {
  const pathname = usePathname();
  const router = useRouter();
  const [history, setHistory] = useState<NavigationHistory>({ entries: [], currentIndex: -1 });
  const lastPathnameRef = useRef<string>(''); // Track last pathname to prevent duplicate entries
  const isInitializedRef = useRef(false); // Track if history has been initialized

  // Initialize navigation history from sessionStorage
  useEffect(() => {
    if (isInitializedRef.current) return; // Prevent re-initialization
    
    const stored = sessionStorage.getItem('navigationHistory');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
        lastPathnameRef.current = parsed.entries[parsed.entries.length - 1]?.path || '';
      } catch (error) {
        console.warn('Failed to parse navigation history:', error);
        initializeHistory();
      }
    } else {
      initializeHistory();
    }
    
    isInitializedRef.current = true;
  }, []);

  // Initialize fresh navigation history
  const initializeHistory = useCallback(() => {
    const initialHistory: NavigationHistory = {
      entries: [{ path: pathname, timestamp: Date.now() }],
      currentIndex: 0
    };
    setHistory(initialHistory);
    lastPathnameRef.current = pathname;
    sessionStorage.setItem('navigationHistory', JSON.stringify(initialHistory));
  }, [pathname]);

  // Add new navigation entry
  const addEntry = useCallback((path: string, title?: string) => {
    // Safety check: ensure path is valid
    if (!path || typeof path !== 'string') {
      console.warn('Invalid path provided to addEntry:', path);
      return;
    }
    
    logNavigation('Adding navigation entry', { path, title });
    
    // Prevent adding duplicate entries for the same path
    if (lastPathnameRef.current === path) {
      logNavigation('Skipping duplicate path entry', { path });
      return;
    }
    
    const newEntry: NavigationEntry = {
      path,
      timestamp: Date.now(),
      title
    };

    setHistory(prev => {
      // Safety check: ensure prev is valid
      if (!prev || !Array.isArray(prev.entries)) {
        console.warn('Invalid history state, reinitializing');
        return {
          entries: [newEntry],
          currentIndex: 0
        };
      }
      
      // Remove any entries after current index (forward navigation cleanup)
      const entries = prev.entries.slice(0, prev.currentIndex + 1);
      
      // Add new entry
      entries.push(newEntry);
      
      // Limit history to last 20 entries to prevent memory issues
      if (entries.length > 20) {
        entries.shift();
      }
      
      const newHistory: NavigationHistory = {
        entries,
        currentIndex: entries.length - 1
      };
      
      // Update sessionStorage
      try {
        sessionStorage.setItem('navigationHistory', JSON.stringify(newHistory));
      } catch (error) {
        console.warn('Failed to save navigation history to sessionStorage:', error);
      }
      
      logNavigation('Navigation history updated', { 
        totalEntries: entries.length, 
        currentIndex: newHistory.currentIndex,
        newPath: path 
      });
      
      return newHistory;
    });
    
    // Update last pathname reference
    lastPathnameRef.current = path;
  }, []);

  // Navigate back to previous page
  const goBack = useCallback(() => {
    logNavigation('Attempting to go back', { 
      canGoBack: history.currentIndex > 0, 
      currentIndex: history.currentIndex,
      totalEntries: history.entries.length,
      entries: history.entries.map(e => e.path)
    });
    
    if (history.currentIndex > 0) {
      const targetIndex = history.currentIndex - 1;
      const targetEntry = history.entries[targetIndex];
      
      if (targetEntry) {
        logNavigation('Navigating back to', { 
          targetPath: targetEntry.path, 
          targetIndex,
          fromPath: history.entries[history.currentIndex]?.path
        });
        
        setHistory(prev => ({
          ...prev,
          currentIndex: targetIndex
        }));
        
        // Update sessionStorage
        const updatedHistory = {
          ...history,
          currentIndex: targetIndex
        };
        sessionStorage.setItem('navigationHistory', JSON.stringify(updatedHistory));
        
        // Navigate to the target path
        router.push(targetEntry.path);
        return true;
      }
    }
    
    logNavigation('Back navigation failed - no previous page available');
    return false;
  }, [history, router]);

  // Navigate forward (if available)
  const goForward = useCallback(() => {
    if (history.currentIndex < history.entries.length - 1) {
      const targetIndex = history.currentIndex + 1;
      const targetEntry = history.entries[targetIndex];
      
      if (targetEntry) {
        setHistory(prev => ({
          ...prev,
          currentIndex: targetIndex
        }));
        
        // Update sessionStorage
        const updatedHistory = {
          ...history,
          currentIndex: targetIndex
        };
        sessionStorage.setItem('navigationHistory', JSON.stringify(updatedHistory));
        
        // Navigate to the target path
        router.push(targetEntry.path);
        return true;
      }
    }
    return false;
  }, [history, router]);

  // Get the previous page path for back button text
  const getPreviousPage = useCallback((): NavigationEntry | null => {
    if (history.currentIndex > 0) {
      return history.entries[history.currentIndex - 1];
    }
    return null;
  }, [history]);

  // Get the next page path for forward button text
  const getNextPage = useCallback((): NavigationEntry | null => {
    if (history.currentIndex < history.entries.length - 1) {
      return history.entries[history.currentIndex + 1];
    }
    return null;
  }, [history]);

  // Check if back navigation is available
  const canGoBack = useMemo(() => history.currentIndex > 0, [history.currentIndex]);

  // Check if forward navigation is available
  const canGoForward = useMemo(() => history.currentIndex < history.entries.length - 1, [history.currentIndex, history.entries.length]);

  // Update current path in history when pathname changes
  useEffect(() => {
    // Skip if not initialized or if pathname is the same as last tracked
    if (!isInitializedRef.current || !pathname || lastPathnameRef.current === pathname) {
      return;
    }
    
    // Safety check: ensure pathname is valid
    if (typeof pathname !== 'string' || pathname.length === 0) {
      console.warn('Invalid pathname detected:', pathname);
      return;
    }
    
    logNavigation('Path changed, adding new entry', { 
      oldPath: lastPathnameRef.current, 
      newPath: pathname 
    });
    
    addEntry(pathname);
  }, [pathname, addEntry]);

  // Debug function to export navigation history to console
  const debugHistory = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Navigation History Debug');
      console.log('Current Path:', pathname);
      console.log('Total Entries:', history.entries.length);
      console.log('Current Index:', history.currentIndex);
      console.log('Can Go Back:', history.currentIndex > 0);
      console.log('Can Go Forward:', history.currentIndex < history.entries.length - 1);
      console.log('History Entries:', history.entries);
      console.log('Session Storage:', sessionStorage.getItem('navigationHistory'));
      console.groupEnd();
    }
  }, [pathname, history]);

  return {
    history: history.entries,
    currentIndex: history.currentIndex,
    currentPath: pathname,
    addEntry,
    goBack,
    goForward,
    getPreviousPage,
    getNextPage,
    canGoBack,
    canGoForward,
    initializeHistory,
    debugHistory
  };
}
