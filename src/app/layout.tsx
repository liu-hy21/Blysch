import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pixel = localFont({
  src: "../fonts/fusion-pixel.woff2",
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blysch",
  description: "只属于我们两个人的空间",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${pixel.variable} h-full`} style={{ colorScheme: "light" }}>
      <body className={`${pixel.className} min-h-full text-ink`}>{children}</body>
    </html>
  );
}
