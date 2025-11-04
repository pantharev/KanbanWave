'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Helper function to revive Date objects from JSON
function dateReviver(_key: string, value: any) {
  // Check if the value is a string that looks like an ISO date
  if (typeof value === 'string') {
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (isoDatePattern.test(value)) {
      return new Date(value);
    }
  }
  return value;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Store initial value in a ref so it doesn't cause re-renders
  const initialValueRef = useRef(initialValue);
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item, dateReviver));
        } else {
          setStoredValue(initialValueRef.current);
        }
      }
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      setStoredValue(initialValueRef.current);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error writing to localStorage for key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue, isLoaded] as const;
}
