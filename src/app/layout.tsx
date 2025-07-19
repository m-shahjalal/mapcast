import Providers from "@/components/provider";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const en = Poppins({
  subsets: ["latin"],
  variable: "--font-english",
  display: "swap",
  weight: ["200", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "PinPoint News | Stay Updated",
  description: "Stay updated with the latest news from around the world.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${en.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
