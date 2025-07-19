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
  topicId?: string;
  locationId?: string;
}
