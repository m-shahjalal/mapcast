"use server";

import { LocationService } from "../services/location.service";

export const getCountryData = async (name: string) => {
  return await LocationService.findByName(name);
};
