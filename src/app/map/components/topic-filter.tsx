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
import { newsTopicDropdown } from "@/shared/enum-list";
import { ChevronDown, Eraser } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function TopicFilters({
  shouldExpand = false,
  onSelectionChange,
}: {
  shouldExpand?: boolean;
  onSelectionChange?: (selectedTopics: string[]) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState(newsTopicDropdown.length);
  const measureRef = useRef<HTMLDivElement>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const { get, updateParams, remove } = useQueryParams();

  const getSelectedTopics = () => {
    const topicsParam = get("topics");
    if (!topicsParam) return [];

    if (Array.isArray(topicsParam)) {
      return topicsParam.filter((t) => typeof t === "string");
    }

    if (typeof topicsParam === "string") {
      return topicsParam.split(",").filter((t) => t.trim());
    }

    return [];
  };

  const selectedTopics = getSelectedTopics();
  const hasSelectedTopics = selectedTopics.length > 0;

  const isTopicSelected = (topic: TopicItem) => {
    return selectedTopics.includes(topic.topic);
  };

  const handleTopicClick = (topic: TopicItem) => {
    const isSelected = selectedTopics.includes(topic.topic);
    const newSelected = isSelected
      ? selectedTopics.filter((t: string) => t !== topic.topic)
      : [...selectedTopics, topic.topic];

    if (newSelected.length > 0) {
      updateParams({ topics: newSelected.join(",") });
    } else {
      updateParams({ topics: undefined });
    }

    onSelectionChange?.(newSelected);
  };

  const handleClearTopics = () => {
    remove("topics");
  };

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 740); // Custom breakpoint at 740px
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (isSmallScreen) {
      setVisibleItems(0); // Show no individual buttons on small screens
      return;
    }

    const calculateVisibleItems = () => {
      if (!containerRef.current || !measureRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.getBoundingClientRect().width;

      if (containerWidth === 0) {
        setVisibleItems(newsTopicDropdown.length);
        return;
      }

      const buttons = measureRef.current.querySelectorAll(
        "[data-topic-button]"
      );
      const moreButton = measureRef.current.querySelector("[data-more-button]");
      const clearButton = measureRef.current.querySelector(
        "[data-clear-button]"
      );

      const moreButtonWidth = moreButton?.getBoundingClientRect().width || 80;
      const clearButtonWidth = clearButton?.getBoundingClientRect().width || 70;
      const gap = 8;

      let totalWidth = 0;
      let itemsCount = 0;

      const reservedWidth = hasSelectedTopics ? clearButtonWidth + gap : 0;

      for (let i = 0; i < buttons.length && i < newsTopicDropdown.length; i++) {
        const button = buttons[i] as HTMLElement;
        const buttonWidth = button.getBoundingClientRect().width;
        const widthWithGap =
          totalWidth + buttonWidth + (itemsCount > 0 ? gap : 0);
        const remainingItems = newsTopicDropdown.length - (i + 1);
        const needsMoreButton = remainingItems > 0;

        const totalRequiredWidth =
          widthWithGap +
          (needsMoreButton ? moreButtonWidth + gap : 0) +
          reservedWidth;

        if (totalRequiredWidth > containerWidth && itemsCount > 0) {
          break;
        }

        totalWidth = widthWithGap;
        itemsCount++;
      }

      itemsCount = Math.max(1, itemsCount);

      if (itemsCount >= newsTopicDropdown.length) {
        setVisibleItems(newsTopicDropdown.length);
      } else {
        setVisibleItems(itemsCount);
      }
    };

    const timeoutId = setTimeout(calculateVisibleItems, 0);
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(calculateVisibleItems, 10);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [newsTopicDropdown, hasSelectedTopics, isSmallScreen]);

  const visibleTopics = isSmallScreen
    ? []
    : newsTopicDropdown.slice(0, visibleItems);
  const hiddenTopics = isSmallScreen
    ? newsTopicDropdown
    : newsTopicDropdown.slice(visibleItems);
  const showMoreButton = hiddenTopics.length > 0;

  const TopicButton = ({
    topic,
    isSelected,
  }: {
    topic: TopicItem;
    isSelected: boolean;
  }) => (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      className={cn(
        "rounded-full px-4 py-2 h-9 shadow-sm capitalize flex-shrink-0 transition-all duration-200",
        "dark:bg-gray-800 dark:text-white hover:dark:bg-gray-700 dark:border-gray-700 dark:hover:border-gray-600"
      )}
      style={
        isSelected
          ? { backgroundColor: topic.color, color: `${topic.color}/10` }
          : {}
      }
      onClick={() => handleTopicClick(topic)}
    >
      {isSelected ? (
        <span className="ml-2 text-xs opacity-90 font-extrabold">✓</span>
      ) : (
        <span className="text-sm mr-1">{topic.emoji}</span>
      )}
      {topic.topic}
    </Button>
  );

  const MoreButton = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full px-4 py-2 h-9 shadow-sm capitalize flex-shrink-0 transition-all duration-200",
            "dark:bg-gray-800 dark:text-white hover:dark:bg-gray-700 dark:border-gray-700 dark:hover:border-gray-600"
          )}
        >
          <span className="text-sm mr-1">
            {window.innerWidth < 640
              ? `${selectedTopics.length}`
              : `+${hiddenTopics.length}`}
          </span>
          {window.innerWidth < 640 ? "Topics" : "More"}
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
  );

  const ClearButton = () => (
    <Button
      onClick={handleClearTopics}
      variant="outline"
      className={cn(
        "capitalize transition-all duration-200 px-6 py-2 h-9 shadow-sm hover:bg-muted flex-shrink-0",
        "border border-gray-300 bg-red-200 text-red-400",
        "dark:bg-red-600 dark:text-white hover:dark:bg-gray-700 dark:border-red-700 dark:hover:border-gray-600"
      )}
      size="sm"
    >
      <Eraser className="h-3 w-3" />
      Clear
    </Button>
  );

  return (
    <>
      {/* Hidden measurement container - only needed for medium/large screens */}
      {!isSmallScreen && (
        <div
          ref={measureRef}
          className="fixed -top-96 left-0 opacity-0 pointer-events-none flex items-center gap-2"
          aria-hidden="true"
        >
          {newsTopicDropdown.map((topic, index) => (
            <div key={`measure-${topic.topic}-${index}`} data-topic-button>
              <TopicButton topic={topic} isSelected={isTopicSelected(topic)} />
            </div>
          ))}
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
          <Button
            variant="outline"
            size="sm"
            data-clear-button
            className="rounded-full px-6 py-2 h-9 shadow-sm text-gray-700 border border-gray-300 flex-shrink-0"
          >
            <Eraser className="h-3 w-3" />
            Clear
          </Button>
        </div>
      )}

      {/* Actual visible container */}
      <div
        ref={containerRef}
        className="flex items-center gap-2 min-w-0 flex-1 flex-wrap"
      >
        {/* Show individual topic buttons only on medium/large screens */}
        {(shouldExpand ? newsTopicDropdown : visibleTopics).map(
          (topic, index) => (
            <TopicButton
              key={`${topic.topic}-${index}`}
              topic={topic}
              isSelected={isTopicSelected(topic)}
            />
          )
        )}

        {/* Always show dropdown when there are hidden topics */}
        {showMoreButton && <MoreButton />}

        {/* Always show clear button when topics are selected */}
        {hasSelectedTopics && <ClearButton />}
      </div>
    </>
  );
}
