import type { Metadata } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono, Bricolage_Grotesque } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Coeus Asset Workspace",
  description: "Internal asset and inventory workspace for Coeus Solutions",
};

// Set the theme before first paint to avoid a flash. Falls back to the OS
// preference when the user hasn't chosen one; the toggle persists their choice.
const themeInit = `try{var t=localStorage.getItem('coeus-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme:dark)').matches;document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${plexMono.variable} ${bricolage.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
      </head>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
