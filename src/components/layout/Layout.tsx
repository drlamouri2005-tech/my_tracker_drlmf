import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Particles } from '../ambient/Particles';
import { MobileNav } from './MobileNav';
import { MobileCorner } from './MobileCorner';

export function Layout({ children }: { children: ReactNode }) {
  return (
  <div className="min-h-screen flex flex-col">
    <Particles density={50} />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 relative min-h-screen">
        <TopBar />
        <div className="px-6 md:px-10 pb-28 pt-6 max-w-[1500px] mx-auto">{children}</div>
        <MobileNav />
        <MobileCorner />
      </main>
    </div>
  </div>
);
}
