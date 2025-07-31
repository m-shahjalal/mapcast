import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TopicItem } from "@/config/map-context";
import { useQueryParams } from "@/hooks/use-query";
import { cn } from "@/lib/utils";
import { newsTopicDropdown } from "@/shared/enum-list";
import { BaseFilters, NewsMapFilters } from "@/types/query-filter";
import { ChevronDown, Eraser } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function TopicFilters() {
  const [visibleItems, setVisibleItems] = useState(newsTopicDropdown.length);
  const { getParams, setParams } = useQueryParams<NewsMapFilters>();

  const containerRef = useRef<HTMLDivElement>(null);
  const isSelected = (topic: TopicItem) => selectedTopics.includes(topic.topic);

  const getSelectedTopics = () => {
    const param = getParams("topics");
    if (!param) return [];
    return Array.isArray(param)
      ? param.filter((t) => typeof t === "string")
      : param.split(",").filter((t: string) => t.trim());
  };

  const selectedTopics = getSelectedTopics();
  const selectedCount = selectedTopics.length;
  const hasSelected = selectedCount > 0;

  const toggleTopic = (topic: TopicItem) => {
    const newSelected = isSelected(topic)
      ? selectedTopics.filter((t: string) => t !== topic.topic)
      : [...selectedTopics, topic.topic];

    setParams("topics", newSelected);
  };

  useEffect(() => {
    const calculateVisible = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.getBoundingClientRect().width;
      if (containerWidth === 0) return;

      const avgBtnW = 130;
      const moreBtnW = 80;
      const clearBtnW = 80;
      const gap = 8;

      let available = containerWidth;
      const reservedWidth = (hasSelected ? clearBtnW : 0) + moreBtnW;
      available -= reservedWidth + gap;

      // Calculate how many items can fit
      const itemsCanFit = Math.floor(Math.max(0, available) / (avgBtnW + gap));

      // If we can fit all items, don't need more button space back
      if (itemsCanFit >= newsTopicDropdown.length) {
        available = containerWidth - (hasSelected ? clearBtnW + gap : 0);
        const canAllFit = Math.floor(available / (avgBtnW + gap));
        return setVisibleItems(Math.min(canAllFit, newsTopicDropdown.length));
      }

      setVisibleItems(Math.max(0, itemsCanFit));
    };

    const timeoutId = setTimeout(calculateVisible, 0);
    const resizer = new ResizeObserver(calculateVisible);

    if (containerRef.current) {
      resizer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizer.disconnect();
    };
  }, [hasSelected]);

  const visibleTopics = newsTopicDropdown.slice(0, visibleItems);
  const hiddenTopics = newsTopicDropdown.slice(visibleItems);
  const showMoreButton = hiddenTopics.length > 0;

  const TopicButton = ({ topic }: { topic: TopicItem }) => {
    const selected = isSelected(topic);
    return (
      <Button
        variant={selected ? "default" : "outline"}
        size="sm"
        className={cn(
          "rounded-full px-4 py-2 h-9 shadow-sm hover:bg-muted capitalize flex-shrink-0 transition-all duration-200",
          selected && "font-bold text-white"
        )}
        style={
          selected
            ? { backgroundColor: topic.color }
            : { backgroundColor: `${topic.color}99` }
        }
        onClick={() => toggleTopic(topic)}
      >
        {selected ? (
          <span className="ml-2 text-xs opacity-90 font-extrabold">✓</span>
        ) : (
          <span className="text-sm mr-1">{topic.emoji}</span>
        )}
        {topic.topic}
      </Button>
    );
  };

  return (
    <div ref={containerRef} className="flex items-center gap-2 min-w-0 flex-1">
      {/* Show visible topic buttons */}
      {visibleTopics.map((topic, index) => (
        <TopicButton key={`${topic.topic}-${index}`} topic={topic} />
      ))}

      {/* More dropdown for hidden topics */}
      {showMoreButton && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4 py-2 h-9 shadow-sm dark:bg-gray-800 dark:text-white text-gray-700 hover:bg-muted dark:hover:bg-gray-700 flex-shrink-0 border border-gray-300 bg-muted/70"
            >
              <span className="text-sm mr-1">+{hiddenTopics.length}</span>
              More
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 max-h-64 overflow-y-auto"
          >
            {hiddenTopics.map((topic, index) => (
              <DropdownMenuItem
                key={`hidden-${topic.topic}-${index}`}
                onClick={() => toggleTopic(topic)}
                className={cn(
                  "cursor-pointer transition-colors",
                  isSelected(topic) && "bg-muted font-medium"
                )}
              >
                <span className="mr-2">{topic.emoji}</span>
                <span className="capitalize flex-1">{topic.topic}</span>
                {isSelected(topic) && (
                  <span className="ml-2 text-xs text-green-600">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
