"use server";

const Parser = require("@postlight/parser");

export async function parseArticle(url: string) {
  try {
    const result = await Parser.parse(url);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Failed to parse article" };
  }
}
