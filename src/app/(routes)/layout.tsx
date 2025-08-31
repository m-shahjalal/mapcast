import GoogleAnalytics from "@/components/layout/google-analytics";
import Providers from "@/components/layout/provider";
import { generateSEOData } from "@/config/seo-meta";
import "../globals.css";
import "leaflet/dist/leaflet.css";
import { Viewport } from "next";

export async function generateMetadata(props: any) {
  const params = await props.searchParams;
  return await generateSEOData({ searchParams: params });
}

export const viewport: Viewport = {
  viewportFit: "auto",
  initialScale: 1,
  maximumScale: 1,
  width: "device-width",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "rgba(255, 255, 255, 0.05)" },
    { media: "(prefers-color-scheme: dark)", color: "rgba(0, 0, 0, 0.05)" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <GoogleAnalytics ga_id="G-FGXP13M35X" />
      <body className={`antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
