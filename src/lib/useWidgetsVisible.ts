'use client';
import { useState, useEffect } from 'react';

const KEY = 'widgetsVisible';
const listeners = new Set<(v: boolean) => void>();

export function useWidgetsVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const v = saved !== null ? saved !== 'false' : false;
    setVisible(v);
    listeners.forEach(l => l(v));
    const listener = (v: boolean) => setVisible(v);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const toggle = () => {
    setVisible(prev => {
      const next = !prev;
      localStorage.setItem(KEY, String(next));
      listeners.forEach(l => l(next));
      return next;
    });
  };

  return { visible, toggle };
}
