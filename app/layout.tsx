import type React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vehicle Management System",
  description: "Manage your vehicles and repair details",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
          {children}
          {/* </ThemeProvider> */}
        </body>
      </html>
    </ClerkProvider>
  );
}

import "./globals.css";
