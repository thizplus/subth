import type { Metadata } from "next";
import { Roboto, Google_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme";
import { AuthProvider } from "@/features/auth";
import { QueryProvider } from "@/providers/query-provider";
import { XPNotificationProvider } from "@/features/engagement";
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

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

const googleSans = Google_Sans({
  subsets: ["latin"],
  variable: "--font-google-sans",
  adjustFontFallback: false,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${roboto.variable} ${googleSans.variable} font-sans antialiased`}>
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
