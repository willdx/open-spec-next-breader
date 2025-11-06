'use client';

import { useState, useEffect } from 'react';

interface OutlineItem {
  id: string;
  level: number;
  title: string;
  children: OutlineItem[];
}

export default function DocumentOutline({ content }: { content: string }) {
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // 解析 Markdown 文档生成目录
  useEffect(() => {
    const parseMarkdownOutline = (markdown: string): OutlineItem[] => {
      const lines = markdown.split('\n');
      const items: OutlineItem[] = [];
      const stack: OutlineItem[] = [];

      lines.forEach((line, index) => {
        // 匹配标题行
        const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const title = headerMatch[2].trim();
          const id = `heading-${index}`;

          const item: OutlineItem = {
            id,
            level,
            title,
            children: []
          };

          // 确定父级关系
          while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
          }

          if (stack.length === 0) {
            items.push(item);
          } else {
            stack[stack.length - 1].children.push(item);
          }

          stack.push(item);
        }
      });

      return items;
    };

    const parsedOutline = parseMarkdownOutline(content);
    setOutline(parsedOutline);
  }, [content]);

  const handleItemClick = (itemId: string) => {
    setActiveId(itemId);
    // 滚动到对应的标题
    const element = document.getElementById(itemId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderOutlineItem = (item: OutlineItem, depth: number = 0) => {
    const isActive = activeId === item.id;
    const paddingLeft = `${depth * 16 + 8}px`;

    return (
      <div key={item.id} style={{ marginBottom: '0.5rem' }}>
        <div
          className={`outline-item ${isActive ? 'active' : ''}`}
          style={{
            paddingLeft,
            cursor: 'pointer',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: depth === 0 ? '0.875rem' : depth === 1 ? '0.825rem' : '0.8rem',
            fontWeight: isActive ? '600' : '400',
            color: isActive ? '#3b82f6' : '#6b7280',
            background: isActive ? '#eff6ff' : 'transparent',
            borderLeft: isActive ? '2px solid #3b82f6' : 'none',
            transition: 'all 0.2s ease'
          }}
          onClick={() => handleItemClick(item.id)}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ opacity: 0.6 }}>{'#'.repeat(item.level)}</span>
            <span style={{ flex: 1 }}>{item.title}</span>
          </div>
        </div>

        {item.children.length > 0 && (
          <div style={{ paddingLeft: '1rem' }}>
            {item.children.map(child => renderOutlineItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (outline.length === 0) {
    return (
      <div className="mindmap-content" style={{
      padding: '1rem',
      textAlign: 'center',
      color: '#9ca3af',
      fontSize: '0.875rem'
    }}>
        <div style={{ marginBottom: '1rem' }}>📄</div>
        <div>无文档标题</div>
        <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
          请在文档中添加标题来生成目录
        </div>
      </div>
    );
  }

  return (
    <div className="mindmap-content">
      <div className="mindmap-header">📑 文档大纲</div>
      <div style={{ fontSize: '0.875rem' }}>
        {outline.map(item => renderOutlineItem(item))}
      </div>
    </div>
  );
}