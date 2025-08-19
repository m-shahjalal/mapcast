export const mdxComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100 border-b-2 border-blue-500 pb-2"
      {...props}
    >
      {children}
    </h1>
  ),

  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-3xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200"
      {...props}
    >
      {children}
    </h2>
  ),

  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-2xl font-medium mt-5 mb-2 text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </h3>
  ),

  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
      {...props}
    >
      {children}
    </p>
  ),

  pre: ({ children }: { children: React.ReactNode }) => (
    <div className="my-6">{children}</div>
  ),

  code: ({ children, className, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    if (language) {
      return (
        <div
          language={language}
          PreTag="div"
          className="rounded-lg shadow-lg"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </div>
      );
    }

    return (
      <code
        className="text-pink-600 dark:text-pink-400 px-1 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },

  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="list-disc list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </ul>
  ),

  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="list-decimal list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </ol>
  ),

  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="ml-4" {...props}>
      {children}
    </li>
  ),

  a: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),

  blockquote: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-blue-500 pl-4 py-2 my-6 italic text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </blockquote>
  ),

  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6">
      <table
        className="min-w-full border-collapse shadow-sm rounded-md overflow-hidden"
        {...props}
      >
        {children}
      </table>
    </div>
  ),

  thead: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="" {...props}>
      {children}
    </thead>
  ),

  tbody: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody {...props}>{children}</tbody>
  ),

  tr: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className="border-b border-gray-200 dark:border-gray-700 transition-colors"
      {...props}
    >
      {children}
    </tr>
  ),

  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-6 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
      {...props}
    >
      {children}
    </td>
  ),

  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700 last:border-r-0"
      {...props}
    >
      {children}
    </th>
  ),

  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr
      className="my-8 border-t-2 border-gray-300 dark:border-gray-600"
      {...props}
    />
  ),

  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg shadow-md my-6 mx-auto block"
      {...props}
    />
  ),

  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </strong>
  ),

  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </em>
  ),
};

export const MDXWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <article className="prose prose-lg dark:prose-invert max-w-none">
      {children}
    </article>
  </div>
);

export default mdxComponents;
