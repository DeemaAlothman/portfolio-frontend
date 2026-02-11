"use client";

import { usePathname } from 'next/navigation';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFullscreen = pathname === '/slider-demo';

  return (
    <>
      {!isFullscreen && <Header />}
      {children}
      {!isFullscreen && <Footer />}
    </>
  );
}
