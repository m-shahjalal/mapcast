import Providers from "@/components/provider";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { InfinitePageLoader } from "@/components/page-loader";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["200", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "PiNews News | Stay Updated",
  description: "Stay updated with the latest news from around the world.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <InfinitePageLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
