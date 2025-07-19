import axios from "axios";
import * as cheerio from "cheerio";
// @ts-ignore
import { NlpManager } from "node-nlp";

interface LocationResult {
  location: string;
  confidence: number;
  type: "city" | "region" | "country" | "address" | "landmark";
  coordinates?: { lat: number; lng: number };
  specificity: number; // 1-10, higher = more specific for mapping
}

interface ArticleLocation {
  title: string;
  url: string;
  locations: LocationResult[];
  primary: LocationResult | null;
  mappableLocations: LocationResult[]; // Only locations suitable for mapping
  summary: string;
}

export class LocationExtractor {
  private nlp: NlpManager;
  private geocodingApiKey?: string; // Optional: for coordinate resolution

  constructor(geocodingApiKey?: string) {
    this.nlp = new NlpManager({ languages: ["en"], forceNER: true });
    this.geocodingApiKey = geocodingApiKey;
  }

  async extractFromArticles(items: any[]): Promise<ArticleLocation[]> {
    const results: ArticleLocation[] = [];

    for (const item of items) {
      if (!item.link) continue;

      try {
        const content = await this.fetchArticle(item.link);
        const text = `${item.title || ""} ${
          item.contentSnippet || ""
        } ${content}`;
        const locations = await this.extractLocations(text);

        // Filter for mappable locations
        const mappableLocations = locations.filter(
          (loc) => loc.specificity >= 6
        );

        const result: ArticleLocation = {
          title: item.title || "Untitled",
          url: item.link,
          locations,
          primary: this.getPrimaryLocation(locations, text),
          mappableLocations,
          summary: item.contentSnippet || item.content || item.content || "",
        };

        // Try to get coordinates for mappable locations
        if (this.geocodingApiKey && mappableLocations.length > 0) {
          await this.addCoordinates(mappableLocations);
        }

        results.push(result);
      } catch (error) {
        console.warn(`Failed to process ${item.link}:`, error);
      }
    }

    return results;
  }

  private async fetchArticle(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)" },
      });

      const $ = cheerio.load(data);
      $("script, style, nav, header, footer").remove();

      return $("article, .article-content, .entry-content, main, p")
        .text()
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000);
    } catch {
      return "";
    }
  }

  private async extractLocations(text: string): Promise<LocationResult[]> {
    const locations = new Map<string, LocationResult>();

    // Enhanced patterns for more specific locations
    const patterns = [
      // City, State/Country with specificity
      {
        regex:
          /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+([A-Z]{2,})\b/g,
        type: "city" as const,
        specificity: 9,
      },
      // City, State
      {
        regex: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+([A-Z]{2,})\b/g,
        type: "city" as const,
        specificity: 8,
      },
      // Specific addresses
      {
        regex:
          /\b(\d+\s+[A-Z][a-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln))\b/g,
        type: "address" as const,
        specificity: 10,
      },
      // Landmarks and specific places
      {
        regex:
          /\b(?:at|near|in)\s+([A-Z][a-z\s]+(?:Hospital|University|Airport|Station|Bridge|Park|Square|Center|Mall|Stadium))\b/g,
        type: "landmark" as const,
        specificity: 8,
      },
      // Neighborhoods/districts
      {
        regex:
          /\b(?:in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:district|neighborhood|area|quarter|ward)\b/g,
        type: "region" as const,
        specificity: 7,
      },
      // Bay, Harbor, specific geographic features
      {
        regex:
          /\b([A-Z][a-z\s]+(?:Bay|Harbor|Port|Beach|Island|Mountain|River|Lake))\b/g,
        type: "landmark" as const,
        specificity: 7,
      },
      // Province/state specific
      {
        regex: /\bin\s+([A-Z][a-z\s]+)\s+(?:Province|State|County)\b/g,
        type: "region" as const,
        specificity: 6,
      },
      // General location markers
      {
        regex: /\b(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
        type: "city" as const,
        specificity: 5,
      },
      // Dateline format (usually very specific)
      {
        regex: /^([A-Z\s]+)\s*\([^)]+\)\s*[-–—]/m,
        type: "city" as const,
        specificity: 8,
      },
    ];

    patterns.forEach(({ regex, type, specificity }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        for (let i = 1; i < match.length; i++) {
          const location = match[i];
          if (location && this.isValidLocation(location)) {
            const cleanLoc = location.trim();
            const confidence = this.calculateConfidence(cleanLoc, text);

            if (
              !locations.has(cleanLoc) ||
              locations.get(cleanLoc)!.specificity < specificity
            ) {
              locations.set(cleanLoc, {
                location: cleanLoc,
                confidence,
                type,
                specificity,
              });
            }
          }
        }
      }
    });

    // NLP-based extraction with type classification
    try {
      const nlpResult = await this.nlp.process("en", text);
      nlpResult.entities
        ?.filter((e: any) =>
          ["location", "city", "country", "organization"].includes(e.entity)
        )
        .forEach((e: any) => {
          if (this.isValidLocation(e.sourceText)) {
            const type = this.classifyLocationType(e.sourceText);
            const specificity = this.getSpecificityScore(e.sourceText, type);
            const confidence = this.calculateConfidence(e.sourceText, text);

            const cleanLoc = e.sourceText.trim();
            if (
              !locations.has(cleanLoc) ||
              locations.get(cleanLoc)!.specificity < specificity
            ) {
              locations.set(cleanLoc, {
                location: cleanLoc,
                confidence,
                type,
                specificity,
              });
            }
          }
        });
    } catch (error) {
      console.warn("NLP extraction failed:", error);
    }

    return Array.from(locations.values())
      .sort((a, b) => {
        // Prioritize by specificity first, then confidence
        if (a.specificity !== b.specificity) {
          return b.specificity - a.specificity;
        }
        return b.confidence - a.confidence;
      })
      .slice(0, 10);
  }

  private classifyLocationType(location: string): LocationResult["type"] {
    const lowerLoc = location.toLowerCase();

    if (
      /\d+\s+.*(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln)/.test(
        lowerLoc
      )
    ) {
      return "address";
    }
    if (
      /(?:hospital|university|airport|station|bridge|park|square|center|mall|stadium|bay|harbor|port|beach|island|mountain|river|lake)/.test(
        lowerLoc
      )
    ) {
      return "landmark";
    }
    if (
      /(?:district|neighborhood|area|quarter|ward|province|state|county)/.test(
        lowerLoc
      )
    ) {
      return "region";
    }
    if (
      location.length > 20 ||
      /\b(?:united states|united kingdom|saudi arabia)\b/.test(lowerLoc)
    ) {
      return "country";
    }

    return "city";
  }

  private getSpecificityScore(
    location: string,
    type: LocationResult["type"]
  ): number {
    const scores = {
      address: 10,
      landmark: 8,
      city: 7,
      region: 6,
      country: 3,
    };

    let baseScore = scores[type];

    // Adjust based on location characteristics
    if (location.includes(",")) baseScore += 1; // More specific if has state/country
    if (location.length > 30) baseScore -= 1; // Too long might be less precise
    if (
      /\b(?:central|downtown|old|new|north|south|east|west)\s+/i.test(location)
    ) {
      baseScore += 1; // Directional indicators add specificity
    }

    return Math.max(1, Math.min(10, baseScore));
  }

  private async addCoordinates(locations: LocationResult[]): Promise<void> {
    for (const location of locations) {
      try {
        // Using OpenStreetMap Nominatim (free) or Google Geocoding API
        const coords = await this.geocodeLocation(location.location);
        if (coords) {
          location.coordinates = coords;
        }
      } catch (error) {
        console.warn(`Failed to geocode ${location.location}:`, error);
      }
    }
  }

  private async geocodeLocation(
    location: string
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      if (this.geocodingApiKey) {
        // Google Geocoding API
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            location
          )}&key=${this.geocodingApiKey}`
        );

        if (response.data.results?.[0]?.geometry?.location) {
          const { lat, lng } = response.data.results[0].geometry.location;
          return { lat, lng };
        }
      } else {
        // Free Nominatim API (OpenStreetMap)
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            location
          )}&limit=1`,
          { headers: { "User-Agent": "NewsLocationExtractor/1.0" } }
        );

        if (response.data?.[0]) {
          return {
            lat: parseFloat(response.data[0].lat),
            lng: parseFloat(response.data[0].lon),
          };
        }
      }
    } catch (error) {
      console.warn(`Geocoding failed for ${location}:`, error);
    }

    return null;
  }

  private isValidLocation(loc: string): boolean {
    return (
      loc.length > 2 &&
      loc.length < 100 &&
      /^[A-Z]/.test(loc) &&
      !/^\d+$/.test(loc) &&
      ![
        "News",
        "Reuters",
        "AP",
        "CNN",
        "BBC",
        "Police",
        "Today",
        "Friday",
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
      ].includes(loc) &&
      !/^(January|February|March|April|May|June|July|August|September|October|November|December)/.test(
        loc
      )
    );
  }

  private calculateConfidence(location: string, text: string): number {
    const frequency = (text.match(new RegExp(location, "gi")) || []).length;
    const firstIndex = text.toLowerCase().indexOf(location.toLowerCase());
    const positionScore = Math.max(0, 1 - firstIndex / text.length);

    // Bonus for being in title or first paragraph
    const titleBonus = text
      .slice(0, 200)
      .toLowerCase()
      .includes(location.toLowerCase())
      ? 0.2
      : 0;

    return Math.min(
      0.3 + frequency * 0.2 + positionScore * 0.3 + titleBonus,
      1.0
    );
  }

  private getPrimaryLocation(
    locations: LocationResult[],
    text: string
  ): LocationResult | null {
    if (locations.length === 0) return null;

    // Prioritize mappable locations with high specificity
    const mappable = locations.filter((loc) => loc.specificity >= 6);
    if (mappable.length > 0) {
      return mappable.reduce((best, current) => {
        if (current.specificity !== best.specificity) {
          return current.specificity > best.specificity ? current : best;
        }
        return current.confidence > best.confidence ? current : best;
      });
    }

    // Fallback to highest confidence
    return locations.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
  }

  // Utility method to get only the most specific location for mapping
  getMappingLocation(articleLocation: ArticleLocation): LocationResult | null {
    if (articleLocation.mappableLocations.length === 0) return null;

    // Return the most specific location with coordinates if available
    const withCoords = articleLocation.mappableLocations.filter(
      (loc) => loc.coordinates
    );
    if (withCoords.length > 0) {
      return withCoords[0]; // Already sorted by specificity
    }

    return articleLocation.mappableLocations[0];
  }
}
