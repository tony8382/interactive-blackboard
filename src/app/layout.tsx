import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_TC } from "next/font/google"; // Import cute font
import { Toaster } from "sonner"; // Import Toaster
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Cute font for stickers
const cuteFont = Noto_Serif_TC({
  weight: ["400", "700"],
  subsets: ["latin"],
  preload: false,
  variable: "--font-cute",
});

export const metadata: Metadata = {
  title: "網路留言板",
  description: "一個讓你自由留言的網路黑板 (匿名 | 隨機 | 互動)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cuteFont.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
