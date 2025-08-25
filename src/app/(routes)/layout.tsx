import Providers from "@/components/layout/provider";
import "../globals.css";
import "leaflet/dist/leaflet.css";
import { SpinnerProvider } from "@/components/layout/loader-provider";
import GoogleAnalytics from "@/components/layout/google-analytics";

export const metadata = {
  title: "MapCast News | Stay Updated",
  description: "Stay updated with the latest news from around the world.",
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
