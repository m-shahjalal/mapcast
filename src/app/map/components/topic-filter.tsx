"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { TopicItem } from "@/lib/map-context";

interface TopicFiltersProps {
  topics: TopicItem[];
  onTopicSelect?: (topic: TopicItem) => void;
}

export function TopicFilters({ topics, onTopicSelect }: TopicFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="rounded-full px-4 py-2 h-9 shadow-sm bg-white hover:bg-muted"
          onClick={() => onTopicSelect?.(topic)}
        >
          {typeof topic.icon === "string" ? (
            <span className="text-sm mr-2">{topic.icon}</span>
          ) : (
            <span className="mr-2">{topic.icon}</span>
          )}
          {topic.label}
        </Button>
      ))}
    </div>
  );
}
