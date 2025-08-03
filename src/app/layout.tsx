import { InfinitePageLoader } from "@/components/page-loader";
import Providers from "@/components/provider";
import { Poppins } from "next/font/google";
import "./globals.css";
import PWADebugInfo from "@/components/pwa/pwa-debug";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["200", "400", "600", "700"],
});

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export const metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "PiNews News | Stay Updated",
  description: "Stay updated with the latest news from around the world.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Pinews" />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <InfinitePageLoader />
        <Providers>{children}</Providers>
        <PWADebugInfo />
      </body>
    </html>
  );
}
