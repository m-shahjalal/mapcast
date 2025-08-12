export const newsTopicList = [
  "all",
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
    color: "#ef4444", // red-500
  },
  {
    topic: "business",
    emoji: "💼",
    color: "#22c55e", // green-500
  },
  {
    topic: "technology",
    emoji: "💻",
    color: "#3b82f6", // blue-500
  },
  {
    topic: "health",
    emoji: "⚕️",
    color: "#eab308", // yellow-500
  },
  {
    topic: "science",
    emoji: "🔬",
    color: "#a855f7", // purple-500
  },
  {
    topic: "entertainment",
    emoji: "🎉",
    color: "#ec4899", // pink-500
  },
  {
    topic: "sports",
    emoji: "⚽️",
    color: "#f97316", // orange-500
  },
  {
    topic: "environment",
    emoji: "🌿",
    color: "#14b8a6", // teal-500
  },
  {
    topic: "education",
    emoji: "📚",
    color: "#6366f1", // indigo-500
  },
  {
    topic: "other",
    emoji: "📰",
    color: "#6b7280", // gray-500
  },
];
