/**
 * Parses the root domain from a URL
 * @param url - The URL to parse
 * @returns The root domain or null if invalid
 */
export function parseRootDomain(url: string): string | null {
  try {
    const normalizedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    const urlObj = new URL(normalizedUrl);
    const hostname = urlObj.hostname.toLowerCase();

    const withoutWww = hostname.startsWith("www.")
      ? hostname.slice(4)
      : hostname;

    if (!withoutWww.includes(".") || withoutWww.length < 3) {
      return null;
    }

    return withoutWww;
  } catch (error) {
    return null;
  }
}
