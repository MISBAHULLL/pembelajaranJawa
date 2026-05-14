import { useState } from 'react';

/**
 * useLocalStorage — drop-in replacement untuk useState yang otomatis
 * sync ke localStorage.
 *
 * @param {string} key    - localStorage key
 * @param {*} initialValue - nilai default kalau key belum ada
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      // Support functional update: setValue(prev => ({ ...prev, x: 1 }))
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      // Silently ignore (e.g. private browsing storage quota exceeded)
    }
  };

  return [storedValue, setValue];
}
