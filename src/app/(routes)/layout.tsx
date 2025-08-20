import Providers from "@/components/layout/provider";
import "../globals.css";
import "leaflet/dist/leaflet.css";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
