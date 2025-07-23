import { newsTopicList } from "@/shared/enum-list";

interface BaseFilters {
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
  sourceId?: string;
  topics?: (typeof newsTopicList)[number][];
  location?: string;
}

export interface NewsMapFilters {
  topics: (typeof newsTopicList)[number][];
  search?: string;
}
