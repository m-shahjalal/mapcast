import { generateEnum } from "../utils/database";
import {
  adLocationList,
  adPageList,
  deliveryMethodList,
  flagStatusList,
  flagTypeList,
  frequencyList,
  newsTopicList,
  subscriptionTierList,
  themeList,
} from "@/shared/enum-list";

export const subscriptionTierEnum = generateEnum(subscriptionTierList);
export const themeEnum = generateEnum(themeList);
export const frequencyEnum = generateEnum(frequencyList);
export const deliveryMethodEnum = generateEnum(deliveryMethodList);
export const flagTypeEnum = generateEnum(flagTypeList);
export const flagStatusEnum = generateEnum(flagStatusList);
export const adLocationEnum = generateEnum(adLocationList);
export const adPageEnum = generateEnum(adPageList);

export const newsTopicEnum = generateEnum(newsTopicList);
