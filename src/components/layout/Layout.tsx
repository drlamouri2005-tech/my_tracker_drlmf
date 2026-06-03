import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Particles } from '../ambient/Particles';
import { MobileNav } from './MobileNav';
import { MobileCorner } from './MobileCorner';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Particles density={50} />
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>
        <TopBar />
        <div className="px-6 md:px-10 pb-28 pt-6 max-w-[1500px] mx-auto">{children}</div>
        <MobileNav />
        <MobileCorner />
      </main>
    </div>
  );
}