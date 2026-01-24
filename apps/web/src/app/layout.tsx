import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/Toast";
import { headers } from "next/headers";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Prithibee | Baby & Mother Care",
  description: "Premium baby and mother products platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // In Next.js 13+, headers() is a function that returns a ReadonlyHeaders interface.
  // However, getting the pathname in a Server Component layout is tricky.
  // The 'x-invoke-path' header is not reliably available in all environments (like dev).
  
  // A better approach for layout conditional rendering is to use Route Groups.
  // But since we are in the root layout, we can't easily know the path without middleware or client component.
  
  // Let's try a simpler approach: 
  // We will render Header/Footer always here, but hide them via CSS or make them Client Components that check path.
  // OR better: Move Header/Footer into a Client Component wrapper that checks usePathname().
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} font-sans antialiased transition-colors duration-300 bg-white dark:bg-slate-950 flex flex-col min-h-screen`}
      >
        <LayoutContent>{children}</LayoutContent>
        <ToastContainer />
      </body>
    </html>
  );
}

// Client Component wrapper to handle conditional rendering based on path
import { LayoutContent } from "@/components/layout/LayoutContent";
