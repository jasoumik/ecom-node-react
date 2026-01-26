"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SettingsProvider } from "@/lib/settings-context";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <SettingsProvider>
      {!isAdmin && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdmin && (
        <>
            <Footer />
            <WhatsAppButton />
        </>
      )}
    </SettingsProvider>
  );
}
