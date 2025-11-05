'use client';

import React, { useEffect, useState } from 'react';

import { useDocumentStorage } from '~hooks/useDocumentStorage';
import type { CreateDocumentInput } from '~types/document';
import { createSampleData, testDocumentStorage } from '~utils/test-storage';

/**
 * Storage 测试页面
 */
export default function TestStoragePage() {
  const {
    documents,
    documentCount,
    lastReadDocument,
    addDocument,
    updateDocument,
    deleteDocument,
    clearAllDocuments,
    updateLastReadTime,
    getDocument,
    searchDocuments,
    getDocumentsBySource,
  } = useDocumentStorage();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 运行完整测试
   */
  const runFullTest = async () => {
    setIsLoading(true);
    await testDocumentStorage();
    setIsLoading(false);
  };

  /**
   * 创建示例数据
   */
  const createExamples = async () => {
    setIsLoading(true);
    await createSampleData();
    setIsLoading(false);
  };

  /**
   * 添加新文档
   */
  const handleAddDocument = async () => {
    if (!newDocTitle.trim() || !newDocContent.trim()) {
      alert('请填写标题和内容');
      return;
    }

    setIsLoading(true);
    const input: CreateDocumentInput = {
      title: newDocTitle,
      content: newDocContent,
      source: 'manual',
    };

    await addDocument(input);
    setNewDocTitle('');
    setNewDocContent('');
    setIsLoading(false);
  };

  /**
   * 搜索文档
   */
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    const results = await searchDocuments(searchQuery);
    setSearchResults(results);
    setIsLoading(false);
  };

  /**
   * 删除文档
   */
  const handleDeleteDocument = async (id: string) => {
    if (confirm('确定要删除这个文档吗？')) {
      setIsLoading(true);
      await deleteDocument(id);
      setSearchResults([]);
      setIsLoading(false);
    }
  };

  /**
   * 更新阅读时间
   */
  const handleUpdateReadTime = async (id: string) => {
    setIsLoading(true);
    await updateLastReadTime(id);
    setIsLoading(false);
  };

  /**
   * 清空所有文档
   */
  const handleClearAll = async () => {
    if (confirm('确定要清空所有文档吗？此操作不可恢复！')) {
      setIsLoading(true);
      await clearAllDocuments();
      setSearchResults([]);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Plasmo Storage 功能测试</h1>

        {/* 统计信息 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">存储统计</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">文档总数：</span>
              <span className="font-bold text-blue-600">{documentCount}</span>
            </div>
            <div>
              <span className="text-gray-600">最近阅读：</span>
              <span className="font-bold text-green-600">
                {lastReadDocument ? lastReadDocument.title : '无'}
              </span>
            </div>
          </div>
        </div>

        {/* 测试按钮 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">功能测试</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={runFullTest}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              运行完整测试
            </button>
            <button
              onClick={createExamples}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              创建示例数据
            </button>
            <button
              onClick={handleClearAll}
              disabled={isLoading || documentCount === 0}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              清空所有文档
            </button>
          </div>
        </div>

        {/* 添加文档 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">添加新文档</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="文档标题"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="文档内容（Markdown格式）"
              value={newDocContent}
              onChange={(e) => setNewDocContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddDocument}
              disabled={isLoading || !newDocTitle.trim() || !newDocContent.trim()}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              添加文档
            </button>
          </div>
        </div>

        {/* 搜索文档 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">搜索文档</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="搜索关键词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              搜索
            </button>
          </div>
        </div>

        {/* 文档列表 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            文档列表 {searchResults.length > 0 && `(搜索结果: ${searchResults.length})`}
          </h2>
          <div className="space-y-4">
            {(searchResults.length > 0 ? searchResults : documents).map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{doc.title}</h3>
                  <span className="text-xs text-gray-500">
                    来源: {doc.source === 'manual' ? '手动输入' : '网页抓取'}
                  </span>
                </div>
                <p className="text-gray-600 mb-2 line-clamp-2">
                  {doc.content.substring(0, 200)}...
                </p>
                <div className="text-xs text-gray-500 mb-3">
                  创建时间: {new Date(doc.createdAt).toLocaleString()}
                  {doc.lastReadTime && (
                    <span className="ml-4">
                      最后阅读: {new Date(doc.lastReadTime).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateReadTime(doc.id)}
                    disabled={isLoading}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    标记已读
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    disabled={isLoading}
                    className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
          {documents.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              暂无文档，点击上方"创建示例数据"按钮添加测试数据
            </p>
          )}
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded shadow">
            处理中...
          </div>
        )}
      </div>
    </div>
  );
}
