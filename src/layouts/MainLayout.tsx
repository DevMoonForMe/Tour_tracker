import type { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full relative">
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
