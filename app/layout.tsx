import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { APP_DESCRIPTION, APP_MANIFEST_VERSION, APP_NAME } from "@/lib/app-config";

import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: APP_NAME,
  applicationName: APP_NAME,
  description: APP_DESCRIPTION,
  manifest: `/manifest.json?v=${APP_MANIFEST_VERSION}`,
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/icons/icon-192.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <link rel="manifest" href={`/manifest.json?v=${APP_MANIFEST_VERSION}`} />
      </head>
      <body
        suppressHydrationWarning
        className={`${bodyFont.variable} ${headingFont.variable} font-[var(--font-body)]`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
