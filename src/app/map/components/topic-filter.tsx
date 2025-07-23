import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryParams } from "@/hooks/use-query";
import { TopicItem } from "@/lib/map-context";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TopicFiltersProps {
  topics: TopicItem[];
}

export function TopicFilters({ topics }: TopicFiltersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState(topics.length);
  const measureRef = useRef<HTMLDivElement>(null);

  const { get, updateParams } = useQueryParams();

  // Get selected topics as array of strings from URL params
  const getSelectedTopics = () => {
    const topicsParam = get("topics");
    if (!topicsParam) return [];

    // Handle both array and string formats
    if (Array.isArray(topicsParam)) {
      return topicsParam.filter((t) => typeof t === "string");
    }

    // If it's a string, split by comma
    if (typeof topicsParam === "string") {
      return topicsParam.split(",").filter((t) => t.trim());
    }

    return [];
  };

  const selectedTopics = getSelectedTopics();

  const isTopicSelected = (topic: TopicItem) => {
    return selectedTopics.includes(topic.topic);
  };

  const handleTopicClick = (topic: TopicItem) => {
    const isSelected = selectedTopics.includes(topic.topic);

    const newSelected = isSelected
      ? selectedTopics.filter((t: string) => t !== topic.topic)
      : [...selectedTopics, topic.topic];

    // Update URL params - convert array to comma-separated string or remove param
    if (newSelected.length > 0) {
      updateParams({ topics: newSelected.join(",") });
    } else {
      updateParams({ topics: undefined });
    }

    console.log("Selected topics:", newSelected); // Debugging line
  };

  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!containerRef.current || !measureRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.getBoundingClientRect().width;

      // If container is very wide or no width yet, show all items initially
      if (containerWidth === 0) {
        setVisibleItems(topics.length);
        return;
      }

      const buttons = measureRef.current.querySelectorAll(
        "[data-topic-button]"
      );
      const moreButton = measureRef.current.querySelector("[data-more-button]");
      const moreButtonWidth = moreButton
        ? moreButton.getBoundingClientRect().width
        : 80;

      let totalWidth = 0;
      let itemsCount = 0;
      const gap = 8; // gap-2 = 8px

      for (let i = 0; i < buttons.length && i < topics.length; i++) {
        const button = buttons[i] as HTMLElement;
        const buttonWidth = button.getBoundingClientRect().width;

        const widthWithGap =
          totalWidth + buttonWidth + (itemsCount > 0 ? gap : 0);
        const remainingItems = topics.length - (i + 1);
        const needsMoreButton = remainingItems > 0;

        // Check if adding this button (plus more button if needed) exceeds container width
        if (
          widthWithGap + (needsMoreButton ? moreButtonWidth + gap : 0) >
            containerWidth &&
          itemsCount > 0
        ) {
          break;
        }

        totalWidth = widthWithGap;
        itemsCount++;
      }

      // Ensure at least 1 item is visible
      itemsCount = Math.max(1, itemsCount);

      // If all items fit, don't show more button
      if (itemsCount >= topics.length) {
        setVisibleItems(topics.length);
      } else {
        setVisibleItems(itemsCount);
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(calculateVisibleItems, 0);

    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize calculations
      setTimeout(calculateVisibleItems, 10);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [topics]);

  const visibleTopics = topics.slice(0, visibleItems);
  const hiddenTopics = topics.slice(visibleItems);
  const showMoreButton = hiddenTopics.length > 0;

  return (
    <>
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        className="fixed -top-96 left-0 opacity-0 pointer-events-none flex items-center gap-2"
        aria-hidden="true"
      >
        {topics.map((topic, index) => {
          const isSelected = isTopicSelected(topic);
          return (
            <Button
              key={`measure-${topic.topic}-${index}`}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              data-topic-button
              className={cn(
                "rounded-full px-4 py-2 h-9 shadow-sm capitalize flex-shrink-0",
                isSelected
                  ? cn("text-white border-2 border-white", topic.color)
                  : cn("text-white border border-white/30", topic.color)
              )}
            >
              {isSelected ? (
                <span className="ml-2 text-xs opacity-90 font-extrabold">
                  ✓
                </span>
              ) : (
                <span className="text-sm mr-1">{topic.emoji}</span>
              )}
              {topic.topic}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          data-more-button
          className="rounded-full px-4 py-2 h-9 shadow-sm text-gray-700 border border-gray-300 flex-shrink-0"
        >
          <span className="text-sm mr-1">+99</span>
          More
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Actual visible container */}
      <div
        ref={containerRef}
        className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden"
      >
        {visibleTopics.map((topic, index) => {
          const isSelected = isTopicSelected(topic);
          return (
            <Button
              key={`${topic.topic}-${index}`}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full px-4 py-2 h-9 shadow-sm hover:bg-muted capitalize flex-shrink-0 transition-all duration-200",
                isSelected
                  ? cn(
                      "text-white border-2 border-white shadow-lg transform scale-105 hover:text-gray-700 hover:border-white/90",
                      topic.color
                    )
                  : cn(
                      "text-white border border-white/30 hover:border-white/50",
                      topic.color
                    )
              )}
              onClick={() => handleTopicClick(topic)}
            >
              {isSelected ? (
                <span className="ml-2 text-xs opacity-90 font-extrabold">
                  ✓
                </span>
              ) : (
                <span className="text-sm mr-1">{topic.emoji}</span>
              )}
              {topic.topic}
            </Button>
          );
        })}

        {showMoreButton && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-4 py-2 h-9 shadow-sm text-gray-700 hover:bg-muted flex-shrink-0 border border-gray-300"
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
              {hiddenTopics.map((topic, index) => {
                const isSelected = isTopicSelected(topic);
                return (
                  <DropdownMenuItem
                    key={`hidden-${topic.topic}-${index}`}
                    onClick={() => handleTopicClick(topic)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected && "bg-muted font-medium"
                    )}
                  >
                    <span className="mr-2">{topic.emoji}</span>
                    <span className="capitalize flex-1">{topic.topic}</span>
                    {isSelected && (
                      <span className="ml-2 text-xs text-green-600">✓</span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </>
  );
}
