import "./globals.css";
import type { Metadata } from "next";
import { Poppins, Hind_Siliguri } from "next/font/google"; // Removed Inter
import { LayoutContent } from "@/components/layout/LayoutContent";

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ["latin"], 
  variable: "--font-poppins" 
});
const hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali'],
  variable: '--font-hind',
});

export const metadata: Metadata = {
  title: "Prithibee | Baby & Mom Shop",
  description: "Premium baby and mom products in Bangladesh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${poppins.variable} ${hindSiliguri.variable} font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300`}>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
