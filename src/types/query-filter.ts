import { newsTopicList } from "@/shared/enum-list";

export interface BaseFilters {
  search?: string;
  limit?: number;
  page?: number;
  orderBy?: string;
  order?: "asc" | "desc";
}

export interface LocationFilters extends BaseFilters {
  regionId?: number;
  subregionId?: number;
  countryId?: number;
  stateId?: number;
}

export interface NewsFilters extends BaseFilters {
  sourceDomain?: string;
  topic?: (typeof newsTopicList)[number];
  location?: string;
}

export interface MapCastFilters {
  topic: (typeof newsTopicList)[number];
  country?: string;
  search?: string;
  from?: Date;
  to?: Date;
}

// Keeping NewsMapFilters for backward compatibility
export type NewsMapFilters = MapCastFilters;
