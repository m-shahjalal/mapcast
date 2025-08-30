import GoogleAnalytics from "@/components/layout/google-analytics";
import { SpinnerProvider } from "@/components/layout/loader-provider";
import Providers from "@/components/layout/provider";
import { generateSEOData } from "@/config/seo-meta";
import "../globals.css";
import "leaflet/dist/leaflet.css";

export async function generateMetadata(props: any) {
  const params = await props.searchParams;
  return await generateSEOData({ searchParams: params });
}

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
          <SpinnerProvider />
          {children}
        </Providers>
      </body>
    </html>
  );
}
