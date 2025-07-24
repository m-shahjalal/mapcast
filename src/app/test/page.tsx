import { parseArticle } from "../map/action";

interface PageProps {
  searchParams: Promise<{ url?: string }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const { url } = await searchParams;

  if (!url) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">News Parser</h1>
        <p>Add a news URL using the ?url= parameter</p>
        <p className="text-sm text-gray-600 mt-2">
          Example: /news?url=https://example.com/article
        </p>
      </div>
    );
  }

  const result = await parseArticle(url);

  if (!result.success) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p>Failed to parse the article. Please check the URL.</p>
        <p className="text-sm text-gray-600 mt-2">URL: {url}</p>
      </div>
    );
  }

  const article = result.data;

  console.log(article); // Log the article data t

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

      {article.author && (
        <p className="text-gray-600 mb-2">By {article.author}</p>
      )}

      {article.date_published && (
        <p className="text-gray-500 mb-6">
          {new Date(article.date_published).toLocaleDateString()}
        </p>
      )}

      {article.lead_image_url && (
        <img
          src={article.lead_image_url}
          alt={article.title || ""}
          className="w-full mb-6 rounded"
        />
      )}

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
      />
    </div>
  );
}
