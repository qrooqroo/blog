'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWidgetsVisible } from '@/lib/useWidgetsVisible';

export default function WidgetsPanel({ children, locale: localeProp }: { children: React.ReactNode; locale?: string }) {
  const params = useParams<{ locale?: string }>();
  const { visible } = useWidgetsVisible();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const locale = localeProp ?? params?.locale ?? 'ko';
  if (locale === 'en') return null;
  if (!mounted || !visible) return null;
  return <>{children}</>;
}
