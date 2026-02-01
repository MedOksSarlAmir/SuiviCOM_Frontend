import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SuiviCom AMIR - Sales Tracking",
  description: "Système de suivi commercial pour Sarl AMIR 2000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased text-zinc-950",
          inter.className
        )}
      >
        {/* We keep this simple. Auth guarding happens in the pages/middleware */}
        {children}
      </body>
    </html>
  );
}