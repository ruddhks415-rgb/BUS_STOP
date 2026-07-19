import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const jnuFont = localFont({
  src: "../../public/fonts/jnu-font.ttf",
  variable: "--font-jnu",
  display: "swap",
});

export const metadata: Metadata = {
  title: "늘품 - 전남대학교",
  description: "전남대학교 캠퍼스 건물 및 버스 정류장 민원 제보 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${jnuFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
