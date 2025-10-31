import { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-telegram-bg">
      <main className="flex-1 pb-16">
        {children}
      </main>
      <Navigation />
    </div>
  );
}
