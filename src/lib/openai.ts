"use server";

import { AIInstructions } from "@/config/rss-constraints";
import { newsTopicList } from "@/shared/enum-list";
import { AINewsResponse, ScrapedArticle } from "@/types/ai-data-format";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export const aiInputNewsSchema = {
  name: "news_article",
  schema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        minLength: 10,
        maxLength: 200,
      },
      metaTitle: {
        type: "string",
        maxLength: 60,
      },
      metaDescription: {
        type: "string",
        minLength: 120,
        maxLength: 160,
      },
      summary: {
        type: "string",
        minLength: 50,
        maxLength: 300,
      },
      content: {
        type: "string",
        minLength: 200,
      },
      tags: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 8,
      },
      keywords: {
        type: "array",
        items: { type: "string" },
        minItems: 5,
        maxItems: 12,
      },
      topic: {
        type: "string",
        enum: newsTopicList,
      },

      locationName: {
        type: "string",
        description:
          "Primary location mentioned in the article (city, state, country format preferred)",
      },
    },
    required: [
      "title",
      "metaTitle",
      "metaDescription",
      "summary",
      "content",
      "tags",
      "keywords",
      "topic",
      "locationName",
    ],
    additionalProperties: false,
  },
};

export const getResultFromAI = async (
  article: ScrapedArticle
): Promise<AINewsResponse | void> => {
  console.log(
    `🤖 Processing article with AI: "${article.title.substring(0, 60)}..."`
  );
  console.log(
    `📰 Source: ${article.source} | 📏 Content length: ${article.content.length} chars`
  );

  try {
    console.log(`🚀 Sending request to AI model...`);

    const aiData = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: AIInstructions,
        },
        {
          role: "user",
          content: `Title: ${article.title}\nSource: ${article.source}\nURL: ${article.url}\nContent: ${article.content}\nLanguage: ${article.language}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: aiInputNewsSchema,
      },
      model: "deepseek/deepseek-chat-v3-0324:free",
    });

    console.log(`📡 Received AI response, parsing JSON...`);

    if (!aiData.choices?.[0]?.message?.content) {
      console.error(
        `❌ No content in AI response for article: ${article.title}`
      );
      return;
    }

    const aiNewsResponse = JSON.parse(
      aiData.choices[0].message.content
    ) as Omit<AINewsResponse, "url" | "source" | "publishedAt">;

    console.log(`✨ Successfully processed article!`);
    console.log(
      `📊 Generated: ${aiNewsResponse.tags?.length || 0} tags, ${
        aiNewsResponse.keywords?.length || 0
      } keywords`
    );
    console.log(
      `🎯 Topic: ${aiNewsResponse.topic} | 📍 Location: ${aiNewsResponse.locationName}`
    );
    console.log(
      `📝 Summary length: ${aiNewsResponse.summary?.length || 0} chars`
    );

    return { ...article, ...aiNewsResponse };
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`❌ JSON parsing failed for article: "${article.title}"`);
      console.error(`🔍 Raw AI response might be malformed`);
    } else if (error instanceof Error) {
      console.error(`❌ AI processing failed for article: "${article.title}"`);
      console.error(`🚨 Error: ${error.message}`);
    } else {
      console.error(
        `❌ Unknown error processing article: "${article.title}"`,
        error
      );
    }

    console.log(`⏭️  Skipping article due to processing error`);
  }
};
