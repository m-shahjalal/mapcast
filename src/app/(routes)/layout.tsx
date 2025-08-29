import Providers from "@/components/layout/provider";
import "../globals.css";
import "leaflet/dist/leaflet.css";
import { SpinnerProvider } from "@/components/layout/loader-provider";
import GoogleAnalytics from "@/components/layout/google-analytics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MapCast News | Stay Updated",
  description: "Stay updated with the latest news from around the world.",
  verification: { google: "_V-psXwKrv-EDgVThwlKUgdLWRKXycLEfPAPmCsx6hE" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <GoogleAnalytics ga_id="G-FGXP13M35X" />
        <Providers>
          <SpinnerProvider />
          {children}
        </Providers>
      </body>
    </html>
  );
}
