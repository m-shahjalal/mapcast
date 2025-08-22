import Providers from "@/components/layout/provider";
import "../globals.css";
import "leaflet/dist/leaflet.css";
import { SpinnerProvider } from "@/components/layout/loader-provider";

export const metadata = {
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
      <body className={`antialiased`}>
        <Providers>
          <SpinnerProvider />
          {children}
        </Providers>
      </body>
    </html>
  );
}
