import { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: 'Montserrat' }}>
      <main className="flex-1 pb-[67px]">
        {children}
      </main>
      <Navigation />
    </div>
  );
}
