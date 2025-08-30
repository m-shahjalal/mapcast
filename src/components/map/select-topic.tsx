import { useQueryParams } from "@/hooks/use-query";
import { newsTopicDropdown } from "@/shared/enum-list";
import { NewsMapFilters } from "@/types/query-filter";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Component } from "lucide-react";
import { useState } from "react";

const styles = {
  trigger:
    "w-full h-10 rounded-full bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:ring-0 focus:ring-transparent focus:border-gray-200/50 dark:focus:border-gray-700/50",
  content:
    "w-[var(--radix-select-trigger-width)] min-w-[180px] sm:max-w-[220px] rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white/95 via-white/90 to-gray-50/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-800/95 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10",
  item: "rounded-lg hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 focus:bg-gradient-to-r focus:from-blue-50/80 focus:to-indigo-50/80 dark:focus:from-blue-900/30 dark:focus:to-indigo-900/30 transition-all duration-200",
};

const isLightColor = (color: string): boolean => {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
};

const createGradientBackground = (color: string): string => {
  if (!color)
    return "bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60";

  return `linear-gradient(135deg, ${color}CC, ${color}99, ${color}66)`;
};

const getTextColor = (backgroundColor: string): string => {
  if (!backgroundColor) return "text-gray-700 dark:text-gray-200";

  return isLightColor(backgroundColor)
    ? "text-gray-800 dark:text-gray-900"
    : "text-white dark:text-gray-100";
};

export function TopicFilters({
  onChange,
  value,
}: {
  onChange?: (key: keyof NewsMapFilters, value: string | null) => void;
  value?: string;
}) {
  const { getParams, setParams } = useQueryParams<NewsMapFilters>();
  const topicParam = value ?? getParams("topic");
  const topic = newsTopicDropdown.find((i) => i.topic === topicParam);
  const [bgColor, setBgColor] = useState<string>(
    topic?.color ? createGradientBackground(topic.color) : ""
  );

  const dynamicTextColor = topic?.color
    ? getTextColor(topic.color)
    : "text-gray-700 dark:text-gray-200";

  const handleChange = async (v: string) => {
    const value = v === "all" ? null : v;
    const topic = newsTopicDropdown.find((i) => i.topic === v);

    if (v === "all" || !topic?.color) setBgColor("");
    else setBgColor(createGradientBackground(topic.color));

    if (onChange) onChange("topic", value);
    else setParams("topic", value);
  };

  return (
    <div className="flex items-center gap-2 min-w-[160px] w-full sm:max-w-[200px] flex-1">
      <Select
        defaultValue="all"
        value={value ?? topic?.topic}
        onValueChange={handleChange}
      >
        <SelectTrigger
          className={styles.trigger}
          style={bgColor ? { background: bgColor } : {}}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs flex-shrink-0">{topic?.emoji}</span>
              <span
                className={`text-sm font-medium truncate flex items-center gap-2 ${dynamicTextColor}`}
              >
                {value ?? topic?.topic ?? (
                  <>
                    <Component className="w-4 h-4" /> <span>All</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </SelectTrigger>
        <SelectContent className={styles.content}>
          <SelectItem value="all">
            <div className="flex items-center gap-3">
              <span className="text-xs flex-shrink-0">🔘</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                All
              </span>
            </div>
          </SelectItem>
          {newsTopicDropdown.map((item) => (
            <SelectItem key={item.topic} value={item.topic}>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 text-xs">{item.emoji}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {item.topic}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
