export const urlUtils = {
  isValidUrl: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ["http:", "https:"].includes(urlObj.protocol);
    } catch {
      return false;
    }
  },

  normalizeUrl: (url: string): string => {
    if (!url?.trim()) return "";

    const trimmed = url.trim();
    if (urlUtils.isValidUrl(trimmed)) return trimmed;

    if (/^(www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(trimmed)) {
      return `https://${trimmed}`;
    }

    return trimmed;
  },

  validateRssUrl: (
    url: string
  ): { valid: boolean; normalized: string; error?: string } => {
    if (!url?.trim()) {
      return { valid: false, normalized: "", error: "URL is required" };
    }

    const normalized = urlUtils.normalizeUrl(url);

    if (!urlUtils.isValidUrl(normalized)) {
      return { valid: false, normalized, error: "Invalid URL format" };
    }

    // Basic RSS URL pattern validation
    const rssPatterns = [
      /\/rss\.xml$/i,
      /\/feed\.xml$/i,
      /\/feeds?\/.*\.xml$/i,
      /\/rss\/?$/i,
      /\/feed\/?$/i,
      /\/atom\.xml$/i,
    ];

    const hasRssPattern = rssPatterns.some((pattern) =>
      pattern.test(normalized)
    );

    if (!hasRssPattern) {
      console.warn(`URL doesn't match common RSS patterns: ${normalized}`);
    }

    return { valid: true, normalized };
  },
};