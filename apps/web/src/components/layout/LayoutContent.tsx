"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SettingsProvider } from "@/lib/settings-context";
import { LanguageProvider } from "@/lib/language-context";
import { FloatingActionGroup } from "@/components/ui/FloatingActionGroup";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ToastContainer } from "@/components/ui/Toast";
import { BottomNav } from "@/components/layout/BottomNav";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <SettingsProvider>
      <LanguageProvider>
        {!isAdmin && <Header />}
        <main className="flex-grow pb-16 lg:pb-0"> {/* Add padding bottom for mobile nav */}
          {children}
        </main>
        {!isAdmin && (
          <>
              <Footer />
              <FloatingActionGroup />
              <BottomNav />
              <ToastContainer />
          </>
        )}
      </LanguageProvider>
    </SettingsProvider>
  );
}
