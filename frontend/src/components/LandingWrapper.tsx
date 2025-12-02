// =============================================
// Laba Platform - Landing Wrapper (FE3)
// =============================================
// Client component wrapper để include Header
// =============================================

'use client';

import { ReactNode } from 'react';
import Header from '@/components/Header';

interface LandingWrapperProps {
  children: ReactNode;
}

export default function LandingWrapper({ children }: LandingWrapperProps) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
