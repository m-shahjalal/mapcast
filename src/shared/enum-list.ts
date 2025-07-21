export const subscriptionTierList = ["free", "premium", "pro"] as const;
export const themeList = ["light", "dark", "auto"] as const;
export const frequencyList = [
  "realtime",
  "hourly",
  "daily",
  "weekly",
  "monthly",
] as const;
export const deliveryMethodList = ["email", "push", "both", "none"] as const;
export const flagTypeList = [
  "spam",
  "fake_news",
  "inappropriate",
  "copyright",
  "violence",
  "hate_speech",
] as const;
export const flagStatusList = ["pending", "approved", "rejected"] as const;
export const adLocationList = [
  "sidebar",
  "banner",
  "inline",
  "popup",
  "interstitial",
] as const;
export const adPageList = [
  "home",
  "news",
  "search",
  "profile",
  "timeline",
  "all",
] as const;
