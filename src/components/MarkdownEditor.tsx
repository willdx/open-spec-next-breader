'use client';

import { useRef, useEffect } from 'react';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 自动调整textarea高度
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab键处理
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newValue = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newValue);

      // 设置光标位置
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }

    // Ctrl+S 保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      // 触发保存事件，由父组件处理
      const saveEvent = new CustomEvent('saveContent');
      window.dispatchEvent(saveEvent);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900">
      {/* 编辑器工具栏 */}
      <div className="bg-gradient-to-r from-gray-100/80 to-gray-50/80 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Markdown 编辑模式</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Ctrl+S 保存</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Tab 缩进</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {content.length} 字符
          </div>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="relative h-full">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-mono text-base bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-200 leading-relaxed"
            placeholder="在此输入 Markdown 内容...

# 标题
## 二级标题
### 三级标题

**粗体文本** 和 *斜体文本*

- 无序列表项
- 另一个列表项

1. 有序列表项
2. 另一个有序项

`内联代码`

```代码块
console.log('Hello World')
```

> 引用文本

[链接文本](https://example.com)

| 表格 | 列 |
|------|-----|
| 内容 | 内容 |

---

开始编写你的 Markdown 文档吧！💡"
            autoFocus
            spellCheck={false}
          />

          {/* 行号指示器 */}
          <div className="absolute left-2 top-6 text-xs text-gray-400 dark:text-gray-600 font-mono select-none pointer-events-none">
            {content.split('\n').map((_, index) => (
              <div key={index} className="leading-6">
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}