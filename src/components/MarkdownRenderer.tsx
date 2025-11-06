'use client';

import Markdown from 'markdown-to-jsx';
import { useEffect, useState } from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const percentage = Math.min(100, Math.max(0,
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      ));
      setScrollPercentage(percentage);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始化

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>没有内容可显示</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8 sm:px-8 sm:py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-pre:rounded-lg prose-pre:shadow-lg">
          <Markdown
            options={{
              overrides: {
                h1: ({ children, ...props }) => (
                  <h1
                    className="text-4xl font-bold text-gray-900 dark:text-white mb-8 pb-4 border-b-2 border-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 scroll-mt-24"
                    {...props}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2
                    className="text-3xl font-semibold text-gray-900 dark:text-white mb-6 mt-12 scroll-mt-24"
                    {...props}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3
                    className="text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8 scroll-mt-20"
                    {...props}
                  >
                    {children}
                  </h3>
                ),
                h4: ({ children, ...props }) => (
                  <h4
                    className="text-xl font-medium text-gray-900 dark:text-white mb-3 mt-6 scroll-mt-20"
                    {...props}
                  >
                    {children}
                  </h4>
                ),
                h5: ({ children, ...props }) => (
                  <h5
                    className="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-4 scroll-mt-20"
                    {...props}
                  >
                    {children}
                  </h5>
                ),
                h6: ({ children, ...props }) => (
                  <h6
                    className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4 scroll-mt-20"
                    {...props}
                  >
                    {children}
                  </h6>
                ),
                p: ({ children, ...props }) => (
                  <p
                    className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg"
                    {...props}
                  >
                    {children}
                  </p>
                ),
                ul: ({ children, ...props }) => (
                  <ul
                    className="list-disc list-inside mb-6 text-gray-700 dark:text-gray-300 text-lg space-y-2"
                    {...props}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol
                    className="list-decimal list-inside mb-6 text-gray-700 dark:text-gray-300 text-lg space-y-2"
                    {...props}
                  >
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li
                    className="leading-relaxed"
                    {...props}
                  >
                    {children}
                  </li>
                ),
                blockquote: ({ children, ...props }) => (
                  <blockquote
                    className="border-l-4 border-gradient-to-b from-blue-500 to-purple-600 pl-6 py-4 my-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-r-lg italic text-gray-700 dark:text-gray-300 text-lg"
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
                code: ({ children, className, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 rounded-xl p-6 overflow-x-auto mb-8 border border-gray-700 shadow-2xl">
                      <pre className="text-sm font-mono text-gray-100 leading-relaxed">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code
                      className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 px-2 py-1 rounded-md text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children, ...props }) => (
                  <pre
                    className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 rounded-xl p-6 overflow-x-auto mb-8 border border-gray-700 shadow-2xl"
                    {...props}
                  >
                    {children}
                  </pre>
                ),
                strong: ({ children, ...props }) => (
                  <strong
                    className="font-bold text-gray-900 dark:text-white"
                    {...props}
                  >
                    {children}
                  </strong>
                ),
                em: ({ children, ...props }) => (
                  <em
                    className="italic text-gray-800 dark:text-gray-200"
                    {...props}
                  >
                    {children}
                  </em>
                ),
                a: ({ children, href, ...props }) => (
                  <a
                    href={href}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                ),
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <table
                      className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                      {...props}
                    >
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children, ...props }) => (
                  <thead
                    className="bg-gray-50 dark:bg-gray-800"
                    {...props}
                  >
                    {children}
                  </thead>
                ),
                tbody: ({ children, ...props }) => (
                  <tbody
                    className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
                    {...props}
                  >
                    {children}
                  </tbody>
                ),
                tr: ({ children, ...props }) => (
                  <tr
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                    {...props}
                  >
                    {children}
                  </tr>
                ),
                th: ({ children, ...props }) => (
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    {...props}
                  >
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                    {...props}
                  >
                    {children}
                  </td>
                ),
                hr: ({ ...props }) => (
                  <hr
                    className="my-8 border-t border-gray-300 dark:border-gray-600"
                    {...props}
                  />
                ),
                img: ({ src, alt, ...props }) => (
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full h-auto rounded-lg shadow-md my-6"
                    loading="lazy"
                    {...props}
                  />
                ),
              },
              // 禁用自动链接，以便我们更好地控制
              disableAutoLink: false,
            }}
          >
            {content}
          </Markdown>
        </div>
      </div>

      {/* 阅读进度指示器 */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-1 h-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="w-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-full transition-all duration-300"
          style={{ height: `${scrollPercentage}%` }}
        />
      </div>
    </div>
  );
}