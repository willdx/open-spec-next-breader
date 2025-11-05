'use client';

interface MarkdownRendererProps {
  content: string;
}

// 简单的Markdown解析器（仅支持基本语法）
function parseMarkdown(markdown: string): JSX.Element[] {
  const lines = markdown.split('\n');
  const elements: JSX.Element[] = [];
  let currentParagraph: string[] = [];
  let listItems: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        elements.push(
          <p key={elements.length} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
            {parseInline(text)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      const ListTag = listType;
      elements.push(
        <ListTag key={elements.length} className={`${listType === 'ul' ? 'list-disc' : 'list-decimal'} list-inside mb-6 text-gray-700 dark:text-gray-300 text-lg space-y-2`}>
          {listItems.map((item, index) => (
            <li key={index} className="leading-relaxed">
              {parseInline(item)}
            </li>
          ))}
        </ListTag>
      );
      listItems = [];
      inList = false;
    }
  };

  const parseInline = (text: string): JSX.Element => {
    // 简单的内联解析
    let parsed = text;

    // 粗体
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // 斜体
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // 内联代码
    parsed = parsed.replace(/`(.*?)`/g, '<code class="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 px-2 py-1 rounded-md text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">$1</code>');

    return <span dangerouslySetInnerHTML={{ __html: parsed }} />;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // 标题
    if (trimmed.startsWith('#')) {
      flushParagraph();
      flushList();

      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const text = trimmed.replace(/^#+\s*/, '');

      const headingClass = level === 1
        ? 'text-4xl font-bold text-gray-900 dark:text-white mb-8 pb-4 border-b-2 border-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 scroll-mt-24'
        : level === 2
        ? 'text-3xl font-semibold text-gray-900 dark:text-white mb-6 mt-12 scroll-mt-24'
        : 'text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8 scroll-mt-20';

      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      elements.push(
        <HeadingTag key={elements.length} className={headingClass}>
          {parseInline(text)}
        </HeadingTag>
      );
    }
    // 列表
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      inList = true;
      listType = 'ul';
      listItems.push(trimmed.substring(2));
    }
    else if (trimmed.match(/^\d+\. /)) {
      flushParagraph();
      inList = true;
      listType = 'ol';
      listItems.push(trimmed.replace(/^\d+\.\s*/, ''));
    }
    // 代码块
    else if (trimmed.startsWith('```')) {
      flushParagraph();
      flushList();
      // 简单处理：不解析代码块内容，直接显示
      elements.push(
        <pre key={elements.length} className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 rounded-xl p-6 overflow-x-auto mb-8 border border-gray-700 shadow-2xl">
          <code className="text-sm font-mono text-gray-100 leading-relaxed">
            {line}
          </code>
        </pre>
      );
    }
    // 引用
    else if (trimmed.startsWith('>')) {
      flushParagraph();
      flushList();
      const text = trimmed.replace(/^>\s*/, '');
      elements.push(
        <blockquote key={elements.length} className="border-l-4 border-gradient-to-b from-blue-500 to-purple-600 pl-6 py-4 my-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-r-lg italic text-gray-700 dark:text-gray-300 text-lg">
          {parseInline(text)}
        </blockquote>
      );
    }
    // 空行
    else if (trimmed === '') {
      flushParagraph();
      flushList();
    }
    // 普通文本
    else {
      if (inList) {
        listItems.push(trimmed);
      } else {
        currentParagraph.push(trimmed);
      }
    }
  });

  // 处理最后的内容
  flushParagraph();
  flushList();

  return elements;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
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
          {parseMarkdown(content)}
        </div>
      </div>

      {/* 阅读进度指示器 */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-1 h-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="w-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-full transition-all duration-300"
          style={{ height: `${Math.min(100, Math.max(0, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100))}%` }}
        />
      </div>
    </div>
  );
}