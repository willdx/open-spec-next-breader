import { useCallback, useEffect } from 'react';

import { useStorage } from '@plasmohq/storage/hook';

import { documentStorage, STORAGE_KEYS } from '~services/document-storage';
import type { CreateDocumentInput, DocumentData, UpdateDocumentInput } from '~types/document';

/**
 * 文档存储 Hook
 * 提供响应式的文档数据和操作方法
 */
export const useDocumentStorage = () => {
  // 响应式的文档列表数据
  const [documents, setDocuments] = useStorage<DocumentData[]>(STORAGE_KEYS.DOCUMENTS, []);

  // 初始化时加载现有数据
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const existingDocs = await documentStorage.getDocuments();
        if (existingDocs.length > 0 && documents.length === 0) {
          setDocuments(existingDocs);
        }
      } catch (error) {
        console.error('加载初始文档数据失败:', error);
      }
    };

    loadInitialData();
  }, [documents.length]); // 只在初始加载时执行一次

  /**
   * 添加新文档
   */
  const addDocument = useCallback(
    async (input: CreateDocumentInput): Promise<DocumentData> => {
      const newDocument = await documentStorage.addDocument(input);
      // 触发响应式更新
      setDocuments(await documentStorage.getDocuments());
      return newDocument;
    },
    [setDocuments]
  );

  /**
   * 更新文档
   */
  const updateDocument = useCallback(
    async (id: string, updates: UpdateDocumentInput): Promise<DocumentData | null> => {
      const updatedDocument = await documentStorage.updateDocument(id, updates);
      if (updatedDocument) {
        // 触发响应式更新
        setDocuments(await documentStorage.getDocuments());
      }
      return updatedDocument;
    },
    [setDocuments]
  );

  /**
   * 删除文档
   */
  const deleteDocument = useCallback(
    async (id: string): Promise<boolean> => {
      const success = await documentStorage.deleteDocument(id);
      if (success) {
        // 触发响应式更新
        setDocuments(await documentStorage.getDocuments());
      }
      return success;
    },
    [setDocuments]
  );

  /**
   * 清空所有文档
   */
  const clearAllDocuments = useCallback(async (): Promise<void> => {
    await documentStorage.clearAllDocuments();
    // 触发响应式更新
    setDocuments([]);
  }, [setDocuments]);

  /**
   * 更新文档的最后阅读时间
   */
  const updateLastReadTime = useCallback(
    async (id: string): Promise<boolean> => {
      const success = await documentStorage.updateLastReadTime(id);
      if (success) {
        // 触发响应式更新
        setDocuments(await documentStorage.getDocuments());
      }
      return success;
    },
    [setDocuments]
  );

  /**
   * 根据ID获取文档
   */
  const getDocument = useCallback(
    (id: string): DocumentData | undefined => {
      return documents.find((doc) => doc.id === id);
    },
    [documents]
  );

  /**
   * 搜索文档
   */
  const searchDocuments = useCallback(async (query: string): Promise<DocumentData[]> => {
    return documentStorage.searchDocuments(query);
  }, []);

  /**
   * 按来源获取文档
   */
  const getDocumentsBySource = useCallback(
    async (source: 'manual' | 'web'): Promise<DocumentData[]> => {
      return documentStorage.getDocumentsBySource(source);
    },
    []
  );

  /**
   * 获取文档总数
   */
  const documentCount = documents.length;

  /**
   * 获取最近阅读的文档
   */
  const lastReadDocument =
    documents
      .filter((doc) => doc.lastReadTime !== undefined)
      .sort((a, b) => b.lastReadTime! - a.lastReadTime!)[0] || null;

  return {
    // 数据
    documents,
    documentCount,
    lastReadDocument,

    // 操作方法
    addDocument,
    updateDocument,
    deleteDocument,
    clearAllDocuments,
    updateLastReadTime,
    getDocument,
    searchDocuments,
    getDocumentsBySource,
  };
};
