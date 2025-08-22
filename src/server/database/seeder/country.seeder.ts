import { NewCountry } from "../schemas/country.schema";

type CountryFlag = {
  name: string;
  code: string;
  flag: string;
};

const flagDataMap = new Map<string, CountryFlag>();

type CountryFeatureCollection = {
  type: "FeatureCollection";
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: CountryFeature[];
};

type CountryFeature = {
  type: "Feature";
  properties: {
    name: string;
    "ISO3166-1-Alpha-3": string;
    "ISO3166-1-Alpha-2": string;
  };
  geometry: {
    type: "MultiPolygon" | "Polygon";
    coordinates: number[][][][] | number[][][];
  };
};

class CountryConverter {
  private flagDataMap: Map<string, CountryFlag>;

  constructor(flagData?: CountryFlag[]) {
    this.flagDataMap = new Map();
    if (flagData) {
      flagData.forEach((country) => {
        this.flagDataMap.set(country.code.toUpperCase(), country);
      });
    }
  }

  setFlagData(flagData: CountryFlag[]): void {
    this.flagDataMap.clear();
    flagData.forEach((country) => {
      this.flagDataMap.set(country.code.toUpperCase(), country);
    });
  }

  private validateCoordinates(coordinates: any): boolean {
    if (!Array.isArray(coordinates)) return false;

    const hasValidStructure = (coords: any, depth: number): boolean => {
      if (!Array.isArray(coords)) return false;

      if (depth === 0) {
        return (
          coords.length === 2 &&
          typeof coords[0] === "number" &&
          typeof coords[1] === "number"
        );
      }

      return coords.every((item: any) => hasValidStructure(item, depth - 1));
    };

    return (
      hasValidStructure(coordinates, 3) || hasValidStructure(coordinates, 2)
    );
  }

  private extractCoordinatePairs(coordinates: any): Array<[number, number]> {
    const pairs: Array<[number, number]> = [];

    const extract = (coords: any) => {
      if (!Array.isArray(coords)) return;

      if (
        coords.length === 2 &&
        typeof coords[0] === "number" &&
        typeof coords[1] === "number"
      ) {
        return pairs.push([coords[0], coords[1]]);
      }

      coords.forEach((item: any) => {
        if (Array.isArray(item)) extract(item);
      });
    };

    extract(coordinates);
    return pairs;
  }

  private calculateBoundingBox(
    geometry: any
  ): [number, number, number, number] {
    if (!geometry || !geometry.coordinates) return [0, 0, 0, 0];
    if (!this.validateCoordinates(geometry.coordinates)) return [0, 0, 0, 0];

    const coordinatePairs = this.extractCoordinatePairs(geometry.coordinates);

    if (coordinatePairs.length === 0) return [0, 0, 0, 0];

    return coordinatePairs.reduce(
      ([minLat, maxLat, minLon, maxLon], [lon, lat]) => [
        Math.min(minLat, lat),
        Math.max(maxLat, lat),
        Math.min(minLon, lon),
        Math.max(maxLon, lon),
      ],
      [Infinity, -Infinity, Infinity, -Infinity]
    );
  }

  private calculateCentroid(geometry: any): [number, number] {
    if (!geometry || !geometry.coordinates) return [0, 0];

    const coordinatePairs = this.extractCoordinatePairs(geometry.coordinates);
    if (coordinatePairs.length === 0) return [0, 0];

    const [sumLat, sumLon] = coordinatePairs.reduce(
      ([sLat, sLon], [lon, lat]) => [sLat + lat, sLon + lon],
      [0, 0]
    );
    return [sumLat / coordinatePairs.length, sumLon / coordinatePairs.length];
  }

  private isCountrySupported(code: string): boolean {
    return this.flagDataMap.has(code.toUpperCase());
  }

  private getNameMismatch(
    geoName: string,
    flagName: string
  ): "geo" | "flag" | null {
    const normalizeForComparison = (name: string) =>
      name
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const normalizedGeo = normalizeForComparison(geoName);
    const normalizedFlag = normalizeForComparison(flagName);

    if (normalizedGeo === normalizedFlag) return null;

    return "flag";
  }

  private inspectCoordinateStructure(coordinates: any, name: string): void {
    console.log(`\n=== Inspecting ${name} ===`);
    console.log("Type:", typeof coordinates);
    console.log("Is Array:", Array.isArray(coordinates));

    if (Array.isArray(coordinates)) {
      console.log("Length:", coordinates.length);
      console.log("First element type:", typeof coordinates[0]);
      console.log("First element is array:", Array.isArray(coordinates[0]));

      let current = coordinates;
      let depth = 0;
      while (Array.isArray(current) && current.length > 0 && depth < 5) {
        console.log(`Depth ${depth}: Array of length ${current.length}`);
        current = current[0];
        depth++;
      }

      const sample = JSON.stringify(coordinates).slice(0, 300);
      console.log("Sample:", sample + (sample.length === 300 ? "..." : ""));
    }
  }

  convert(
    data: CountryFeatureCollection,
    options: {
      filterByFlags?: boolean;
      debug?: boolean;
      includeInvalidGeometries?: boolean;
    } = {}
  ): NewCountry[] {
    const {
      filterByFlags = true,
      debug = false,
      includeInvalidGeometries = false,
    } = options;

    const results: NewCountry[] = [];
    const errors: Array<{ country: string; error: string }> = [];

    data.features.forEach((feature) => {
      try {
        const code = feature.properties["ISO3166-1-Alpha-2"];

        if (filterByFlags && !this.isCountrySupported(code)) {
          if (debug) {
            console.log(
              `Skipping ${feature.properties.name} - no flag data for code ${code}`
            );
          }
          return;
        }

        const flagData = this.flagDataMap.get(code.toUpperCase());

        if (debug) {
          this.inspectCoordinateStructure(
            feature.geometry.coordinates,
            feature.properties.name
          );
        }

        const boundingBox = this.calculateBoundingBox(feature.geometry);
        const [lat, lon] = this.calculateCentroid(feature.geometry);

        if (
          !includeInvalidGeometries &&
          (boundingBox.every((val) => val === 0) || (lat === 0 && lon === 0))
        ) {
          errors.push({
            country: feature.properties.name,
            error: "Invalid geometry - no valid coordinates found",
          });
          return;
        }

        let finalName = feature.properties.name;
        if (flagData) {
          const nameChoice = this.getNameMismatch(
            feature.properties.name,
            flagData.name
          );
          if (nameChoice === "flag") {
            finalName = flagData.name;
          }
        }

        results.push({
          name: finalName,
          boundingbox: boundingBox,
          lat: lat.toFixed(6),
          lon: lon.toFixed(6),
          importance: null,
          geojson: feature.geometry,
          code: code,
          flag: flagData?.flag,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push({
          country: feature.properties.name,
          error: errorMsg,
        });

        if (debug) {
          console.error(`Error processing ${feature.properties.name}:`, error);
        }
      }
    });

    if (debug || errors.length > 0) {
      console.log(`\n=== Conversion Summary ===`);
      console.log(`Successfully converted: ${results.length} countries`);
      console.log(`Errors encountered: ${errors.length}`);

      if (errors.length > 0) {
        console.log("\nErrors:");
        errors.forEach(({ country, error }) => {
          console.log(`- ${country}: ${error}`);
        });
      }
    }

    return results;
  }

  getCountryByCode(
    countries: NewCountry[],
    code: string
  ): NewCountry | undefined {
    return countries.find(
      (country) => country.code.toLowerCase() === code.toLowerCase()
    );
  }

  getCountryByName(
    countries: NewCountry[],
    name: string
  ): NewCountry | undefined {
    return countries.find((country) =>
      country.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  getCountriesWithFlags(countries: NewCountry[]): NewCountry[] {
    return countries.filter((country) => country.flag);
  }

  getCountriesWithoutFlags(countries: NewCountry[]): NewCountry[] {
    return countries.filter((country) => !country.flag);
  }

  // Validation method
  validateGeoJsonData(input: any): {
    isValid: boolean;
    errors: string[];
    data: CountryFeatureCollection | null;
  } {
    const errors: string[] = [];

    if (!input || typeof input !== "object") {
      errors.push("Data is not an object");
      return { isValid: false, errors, data: null };
    }

    if (input.type !== "FeatureCollection") {
      errors.push("Data type is not FeatureCollection");
    }

    if (!Array.isArray(input.features)) {
      errors.push("Features is not an array");
    } else if (input.features.length === 0) {
      errors.push("No features found");
    }

    const sampleSize = Math.min(3, input.features.length);
    for (let i = 0; i < sampleSize; i++) {
      const feature = input.features[i];
      if (!feature.properties || !feature.geometry) {
        errors.push(`Feature ${i} missing properties or geometry`);
      }

      if (!feature.properties?.["ISO3166-1-Alpha-2"]) {
        errors.push(`Feature ${i} missing ISO3166-1-Alpha-2 code`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: input as CountryFeatureCollection,
    };
  }
}

export {
  CountryConverter,
  type NewCountry,
  type CountryFlag,
  type CountryFeatureCollection,
};
