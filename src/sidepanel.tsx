import '~style.css';

import { useMemo, useState } from 'react';

import { useDocumentStorage } from '~hooks/useDocumentStorage';
import type { DocumentData } from '~types/document';
import { openReadingMode } from '~services/reading-service';

/**
 * Side Panel 文档库组件
 */
function SidePanel() {
  const {
    documents,
    documentCount,
    deleteDocument,
    clearAllDocuments,
    searchDocuments,
    addDocument,
  } = useDocumentStorage();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingTestData, setIsAddingTestData] = useState(false);
  const [openingDocument, setOpeningDocument] = useState<string | null>(null);

  // 按更新时间倒序排列文档
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [documents]);

  // 处理搜索
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchDocuments(query);
      setSearchResults(results);
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchResults([]);
    }
  };

  // 当前显示的文档列表
  const displayDocuments = isSearching ? searchResults : sortedDocuments;

  // 处理文档点击
  const handleDocumentClick = async (doc: DocumentData) => {
    if (openingDocument) return;

    setOpeningDocument(doc.id);
    try {
      // 更新最后阅读时间
      await addDocument({
        ...doc,
        lastReadTime: Date.now()
      });

      // 打开阅读模式
      const success = await openReadingMode(
        doc.content,
        doc.title,
        doc.id
      );

      if (!success) {
        console.error('打开阅读模式失败');
      }
    } catch (error) {
      console.error('打开文档失败:', error);
    } finally {
      setOpeningDocument(null);
    }
  };

  // 添加测试数据
  const handleAddTestData = async () => {
    if (isAddingTestData) return;

    setIsAddingTestData(true);
    try {
      const testData = [
        {
          title: 'Side Panel 测试文档1',
          content:
            '# Side Panel 测试文档1\n\n这是通过Side Panel添加的第一条测试文档。\n\n## 功能验证\n\n- ✅ Storage写入功能\n- ✅ 数据显示功能\n- ✅ 响应式更新',
          source: 'manual' as const,
        },
        {
          title: '网页抓取测试文档',
          content:
            '# 网页抓取测试文档\n\n这是一条模拟网页抓取的测试文档。\n\n## 测试内容\n\n- 原始网页：https://example.com\n- 抓取时间：' +
            new Date().toLocaleString() +
            '\n- 处理状态：已完成',
          source: 'web' as const,
          sourceUrl: 'https://example.com',
        },
        {
          title: 'Markdown 语法测试',
          content:
            '# Markdown 语法测试\n\n这是一个用于测试Markdown渲染的文档。\n\n## 文本格式\n\n**粗体文本** 和 *斜体文本*\n\n## 列表测试\n\n- 项目1\n- 项目2\n  - 子项目2.1\n  - 子项目2.2\n\n## 代码测试\n\n```javascript\nconsole.log("Hello Side Panel!");\n```\n\n## 链接测试\n\n[GitHub](https://github.com)',
          source: 'manual' as const,
        },
      ];

      // 依次添加测试数据
      for (const doc of testData) {
        await addDocument(doc);
        // 稍微延迟，避免快速连续操作
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log('测试数据添加完成，共添加了', testData.length, '个文档');
    } catch (error) {
      console.error('添加测试数据失败:', error);
    } finally {
      setIsAddingTestData(false);
    }
  };

  return (
    <div className="min-w-64 w-full h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-3 flex-shrink-0">
        <h1 className="text-base font-bold text-gray-800">文档库</h1>
        {isSearching && (
          <p className="text-xs text-gray-500 mt-1">搜索结果: {searchResults.length} 个文档</p>
        )}
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 p-3 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索文档..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="清空搜索"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col p-4">
        {displayDocuments.length === 0 ? (
          // 空状态
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              {isSearching ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">🔍 无搜索结果</p>
                  <p className="text-sm text-yellow-600 mt-2">没有找到匹配"{searchQuery}"的文档</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">📚 暂无文档</p>
                  <p className="text-sm text-blue-600 mt-2">
                    使用popup页面的功能添加你的第一个文档
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // 文档列表
          <div className="flex-1 overflow-y-auto space-y-3 px-1">
            {displayDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 ${
                  openingDocument === doc.id
                    ? 'border-blue-500 bg-blue-50 opacity-75'
                    : 'border-gray-200'
                }`}
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center flex-1 mr-2">
                    {openingDocument === doc.id && (
                      <span className="animate-pulse mr-2 text-blue-500">⏳</span>
                    )}
                    <h3 className="font-semibold text-gray-800 leading-tight text-sm break-words">
                      {doc.title}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定要删除文档"${doc.title}"吗？`)) {
                        deleteDocument(doc.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-xs leading-none p-1 hover:bg-red-50 rounded flex-shrink-0"
                    title="删除文档"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2 leading-relaxed">
                  {doc.content.substring(0, 100)}...
                </p>
                <div className="flex flex-col gap-1 text-xs text-gray-500">
                  <span className="flex items-center">
                    🕒{' '}
                    {doc.lastReadTime
                      ? `最后阅读: ${new Date(doc.lastReadTime).toLocaleDateString()}`
                      : `创建于: ${new Date(doc.createdAt).toLocaleDateString()}`}
                  </span>
                  {doc.source && (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs">
                      {doc.source === 'manual' ? '✏️ 手动' : '🌐 网页'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer with Actions */}
      <footer className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
        <div className="flex flex-col gap-2">
          {/* 测试按钮 */}
          <div className="flex justify-between items-center">
            {/* <button
              onClick={handleAddTestData}
              disabled={isAddingTestData}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                isAddingTestData
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}>
              {isAddingTestData ? "添加中..." : "添加测试数据"}
            </button> */}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {documentCount > 0 && `当前 ${documentCount} 个文档`}
            </span>
            {documents.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('确定要清空所有文档吗？此操作不可恢复！')) {
                    clearAllDocuments();
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearching(false);
                  }
                }}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
              >
                清空所有
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SidePanel;
