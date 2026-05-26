'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useWidgetsVisible } from '@/lib/useWidgetsVisible';

export default function WidgetsPanel({ children }: { children: React.ReactNode }) {
  const params = useParams<{ locale?: string }>();
  const searchParams = useSearchParams();
  const { visible } = useWidgetsVisible();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const locale = params?.locale ?? searchParams.get('lang') ?? 'ko';
  if (locale === 'en') return null;
  if (!mounted || !visible) return null;
  return <>{children}</>;
}
