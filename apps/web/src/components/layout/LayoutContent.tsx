"use client";

import { usePathname } from "next/navigation";
import { Header } from "./HeaderNew";
import { Footer } from "./Footer";
import { SettingsProvider } from "@/lib/settings-context";
import { LanguageProvider } from "@/lib/language-context";
import { FloatingActionGroup } from "@/components/ui/FloatingActionGroup";
import { ToastContainer } from "@/components/ui/Toast";
import { BottomNav } from "@/components/layout/BottomNav";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/register";
  // The home page is now the "Coming Soon" page, so we treat it like a standalone page
  const isHomePage = pathname === "/";

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <LanguageProvider>
          {!isAdmin && !isAuthPage && !isHomePage && <Header />}
          <main className={`flex-grow ${!isAuthPage && !isHomePage ? 'pb-16 lg:pb-0' : ''}`}>
            {children}
          </main>
          {!isAdmin && (
            <>
              {!isAuthPage && !isHomePage && <Footer />}
              {!isAuthPage && !isHomePage && <FloatingActionGroup />}
              {!isAuthPage && !isHomePage && <BottomNav />}
              <ToastContainer />
            </>
          )}
        </LanguageProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
