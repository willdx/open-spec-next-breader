'use client';

import Markdown from 'markdown-to-jsx';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full overflow-hidden text-gray-500">
        <p>没有内容可显示</p>
      </div>
    );
  }

  return (
    <div className="prose prose-gray max-w-none overflow-hidden
                    prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:text-sm prose-code:rounded prose-code:font-mono
                    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-6 prose-pre:shadow-xl
                    prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic">
      <Markdown>{content}</Markdown>
    </div>
  );
}