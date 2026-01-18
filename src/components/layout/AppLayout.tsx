import { type ReactNode } from "react";
import { Navigation } from "./Navigation";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="min-h-full bg-wine-dark flex flex-col">
      <header className="sticky top-0 z-10 bg-wine-dark border-b border-warm-gray/20 px-4 py-3">
        <h1 className="text-electric-cyan text-xl font-bold text-center max-w-lg mx-auto">
          {title ?? "Exercise Tracker"}
        </h1>
      </header>

      <main className="flex-1 px-4 py-4 pb-20 max-w-lg mx-auto w-full">
        {children}
      </main>

      <Navigation />
    </div>
  );
}
