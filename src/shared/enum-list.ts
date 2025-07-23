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

export const newsTopicList = [
  "politics",
  "business",
  "technology",
  "health",
  "science",
  "entertainment",
  "sports",
  "environment",
  "education",
  "other",
] as const;

export const newsTopicWithEmojis = {
  politics: "🏛️",
  business: "💼",
  technology: "💻",
  health: "⚕️",
  science: "🔬",
  entertainment: "🎉",
  sports: "⚽️",
  environment: "🌿",
  education: "📚",
  other: "📰",
};

export const newsTopicDropdown = [
  {
    topic: "politics",
    emoji: "🏛️",
    color: "bg-red-500",
  },
  {
    topic: "business",
    emoji: "💼",
    color: "bg-green-500",
  },
  {
    topic: "technology",
    emoji: "💻",
    color: "bg-blue-500",
  },
  {
    topic: "health",
    emoji: "⚕️",
    color: "bg-yellow-500",
  },
  {
    topic: "science",
    emoji: "🔬",
    color: "bg-purple-500",
  },
  {
    topic: "entertainment",
    emoji: "🎉",
    color: "bg-pink-500",
  },
  {
    topic: "sports",
    emoji: "⚽️",
    color: "bg-orange-500",
  },
  {
    topic: "environment",
    emoji: "🌿",
    color: "bg-teal-500",
  },
  {
    topic: "education",
    emoji: "📚",
    color: "bg-indigo-500",
  },
  {
    topic: "other",
    emoji: "📰",
    color: "bg-gray-500",
  },
];
