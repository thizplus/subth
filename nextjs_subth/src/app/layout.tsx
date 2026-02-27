import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme";
import { AuthProvider } from "@/features/auth";
import { QueryProvider } from "@/providers/query-provider";
import { XPNotificationProvider } from "@/features/engagement";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/analytics";
import "./globals.css";

// Organization Schema for E-E-A-T
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SubTH",
  alternateName: "ซับไทย",
  url: "https://subth.com",
  logo: "https://subth.com/logo.png",
  description: "เว็บรีวิววิดีโอซับไทย JAV AV จีน ฝรั่ง OnlyFans พร้อมข้อมูลนักแสดง ค่าย แท็ก",
  foundingDate: "2024",
  sameAs: [],
};

// WebSite Schema with SearchAction for site search
const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SubTH",
  alternateName: "ซับไทย",
  url: "https://subth.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://subth.com/member/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
  inLanguage: ["th", "en"],
};

// Inter - single font, variable weight (ลด network requests)
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // แสดง fallback font ก่อน แล้วค่อย swap
  variable: "--font-inter",
  // preload เฉพาะ latin subset ที่ใช้บ่อย
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "ซับไทย - รีวิว JAV AV จีน ฝรั่ง OnlyFans | SubTH",
    template: "%s | ซับไทย SubTH",
  },
  description: "เว็บรีวิววิดีโอซับไทย JAV AV จีน ฝรั่ง OnlyFans พร้อมข้อมูลนักแสดง ค่าย แท็ก อัปเดตใหม่ทุกวัน",
  keywords: [
    "ซับไทย",
    "subthai",
    "subth",
    "รีวิว jav",
    "jav ซับไทย",
    "av ซับไทย",
    "หนังจีนซับไทย",
    "หนังฝรั่งซับไทย",
    "onlyfans รีวิว",
    "รีวิววิดีโอ",
  ],
  authors: [{ name: "SubTH" }],
  creator: "SubTH",
  publisher: "SubTH",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://subth.com",
    siteName: "ซับไทย SubTH",
    title: "ซับไทย - รีวิว JAV AV จีน ฝรั่ง OnlyFans | SubTH",
    description: "เว็บรีวิววิดีโอซับไทย JAV AV จีน ฝรั่ง OnlyFans พร้อมข้อมูลนักแสดง ค่าย แท็ก",
  },
  twitter: {
    card: "summary_large_image",
    title: "ซับไทย - รีวิว JAV AV จีน ฝรั่ง OnlyFans | SubTH",
    description: "เว็บรีวิววิดีโอซับไทย JAV AV จีน ฝรั่ง OnlyFans พร้อมข้อมูลนักแสดง ค่าย แท็ก",
  },
  alternates: {
    canonical: "https://subth.com",
    languages: {
      "th": "https://subth.com",
      "en": "https://subth.com/en",
      "x-default": "https://subth.com/en",
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        {/* DNS prefetch for CDN and analytics */}
        <link rel="dns-prefetch" href="https://files.subth.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
        {/* OpenGraph locale alternates */}
        <meta property="og:locale:alternate" content="en_US" />
        {/* Google Tag Manager */}
        <GoogleTagManager />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <GoogleTagManagerNoScript />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <XPNotificationProvider>{children}</XPNotificationProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
