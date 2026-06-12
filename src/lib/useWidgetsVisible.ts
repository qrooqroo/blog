'use client';
import { useState, useEffect, useCallback } from 'react';

const KEY = 'widgetsVisible';
const listeners = new Set<(v: boolean) => void>();

function getStored(): boolean {
  const saved = localStorage.getItem(KEY);
  return saved !== null ? saved !== 'false' : false;
}

export function useWidgetsVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStored());
    const listener = (v: boolean) => setVisible(v);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const toggle = useCallback(() => {
    const next = !getStored();
    localStorage.setItem(KEY, String(next));
    listeners.forEach(l => l(next));
  }, []);

  return { visible, toggle };
}
