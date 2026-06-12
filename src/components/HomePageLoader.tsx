'use client';

import { useEffect, useState } from 'react';
import MatrixLoader from './MatrixLoader';

// Show MatrixLoader until hydration is complete + at least MIN_MS elapsed
const MIN_MS = 800;

export default function HomePageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = Date.now();
    let timerId: ReturnType<typeof setTimeout>;

    const rafId = requestAnimationFrame(() => {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, MIN_MS - elapsed);
      timerId = setTimeout(() => setVisible(false), delay);
    });

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, []);

  if (!visible) return null;
  return <MatrixLoader />;
}
