import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TopicItem } from "@/lib/map-context";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface TopicFiltersProps {
  topics: TopicItem[];
  onTopicSelect?: (topic: TopicItem) => void;
  selectedTopics?: TopicItem[];
}

export function TopicFilters({
  topics,
  onTopicSelect,
  selectedTopics = [],
}: TopicFiltersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState(topics.length);
  const [containerWidth, setContainerWidth] = useState(0);

  // Sort topics: selected ones first, then unselected
  const sortedTopics = useMemo(() => {
    const selected = topics.filter((topic) =>
      selectedTopics.some((selected) => selected.topic === topic.topic)
    );
    const unselected = topics.filter(
      (topic) =>
        !selectedTopics.some((selected) => selected.topic === topic.topic)
    );
    return [...selected, ...unselected];
  }, [topics, selectedTopics]);

  const isTopicSelected = (topic: TopicItem) => {
    return selectedTopics.some((selected) => selected.topic === topic.topic);
  };

  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      setContainerWidth(containerRect.width);

      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.visibility = "hidden";
      tempContainer.style.whiteSpace = "nowrap";
      tempContainer.style.display = "flex";
      tempContainer.style.gap = "8px";
      document.body.appendChild(tempContainer);

      let totalWidth = 0;
      let itemsCount = 0;
      const moreButtonWidth = 80;

      for (let i = 0; i < sortedTopics.length; i++) {
        const topic = sortedTopics[i];
        const tempButton = document.createElement("button");
        tempButton.className = "rounded-full px-4 py-2 h-9 text-sm";
        tempButton.textContent = `${topic.emoji} ${topic.topic}`;
        tempContainer.appendChild(tempButton);

        const buttonWidth = tempButton.offsetWidth;

        const nextWidth =
          totalWidth + buttonWidth + (i < sortedTopics.length - 1 ? 8 : 0);
        const wouldNeedMoreButton = i < sortedTopics.length - 1;

        if (
          nextWidth + (wouldNeedMoreButton ? moreButtonWidth : 0) >
            containerRect.width &&
          itemsCount > 0
        ) {
          break;
        }

        totalWidth = nextWidth;
        itemsCount++;
      }

      document.body.removeChild(tempContainer);

      if (itemsCount === sortedTopics.length) {
        setVisibleItems(sortedTopics.length);
      } else {
        const adjustedCount = Math.max(1, itemsCount - 1);
        setVisibleItems(adjustedCount);
      }
    };

    calculateVisibleItems();

    const resizeObserver = new ResizeObserver(calculateVisibleItems);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [sortedTopics]);

  const visibleTopics = sortedTopics.slice(0, visibleItems);
  const hiddenTopics = sortedTopics.slice(visibleItems);
  const showMoreButton = hiddenTopics.length > 0;

  return (
    <div ref={containerRef} className="flex items-center gap-2 min-w-0 flex-1">
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
            onClick={() => onTopicSelect?.(topic)}
          >
            {isSelected ? (
              <span className="ml-2 text-xs opacity-90 font-extrabold">✓</span>
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
                  onClick={() => onTopicSelect?.(topic)}
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
  );
}
