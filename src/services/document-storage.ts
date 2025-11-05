import { Storage } from '@plasmohq/storage';

import type { CreateDocumentInput, DocumentData, UpdateDocumentInput } from '~types/document';

/**
 * Storage Keys 常量定义
 */
export const STORAGE_KEYS = {
  DOCUMENTS: 'documents',
} as const;

/**
 * 文档存储服务类
 * 提供类型安全的文档CRUD操作
 */
export class DocumentStorageService {
  private storage: Storage;

  constructor() {
    this.storage = new Storage({
      area: 'local',
      copiedKeyList: [STORAGE_KEYS.DOCUMENTS],
    });
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 获取当前时间戳
   */
  private getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * 添加新文档
   */
  async addDocument(input: CreateDocumentInput): Promise<DocumentData> {
    const now = this.getCurrentTimestamp();
    const document: DocumentData = {
      id: this.generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    const documents = await this.getDocuments();
    documents.push(document);
    await this.storage.set(STORAGE_KEYS.DOCUMENTS, documents);

    return document;
  }

  /**
   * 获取所有文档
   */
  async getDocuments(): Promise<DocumentData[]> {
    const documents = await this.storage.get<DocumentData[]>(STORAGE_KEYS.DOCUMENTS);
    return documents || [];
  }

  /**
   * 根据ID获取单个文档
   */
  async getDocument(id: string): Promise<DocumentData | undefined> {
    const documents = await this.getDocuments();
    return documents.find((doc) => doc.id === id);
  }

  /**
   * 更新文档
   */
  async updateDocument(id: string, updates: UpdateDocumentInput): Promise<DocumentData | null> {
    const documents = await this.getDocuments();
    const index = documents.findIndex((doc) => doc.id === id);

    if (index === -1) {
      return null;
    }

    documents[index] = {
      ...documents[index],
      ...updates,
      updatedAt: this.getCurrentTimestamp(),
    };

    await this.storage.set(STORAGE_KEYS.DOCUMENTS, documents);
    return documents[index];
  }

  /**
   * 删除单个文档
   */
  async deleteDocument(id: string): Promise<boolean> {
    const documents = await this.getDocuments();
    const filteredDocuments = documents.filter((doc) => doc.id !== id);

    if (filteredDocuments.length === documents.length) {
      return false; // 没有找到要删除的文档
    }

    await this.storage.set(STORAGE_KEYS.DOCUMENTS, filteredDocuments);
    return true;
  }

  /**
   * 清空所有文档
   */
  async clearAllDocuments(): Promise<void> {
    await this.storage.set(STORAGE_KEYS.DOCUMENTS, []);
  }

  /**
   * 获取文档总数
   */
  async getDocumentCount(): Promise<number> {
    const documents = await this.getDocuments();
    return documents.length;
  }

  /**
   * 获取最近阅读的文档
   */
  async getLastReadDocument(): Promise<DocumentData | null> {
    const documents = await this.getDocuments();
    const documentsWithReadTime = documents.filter((doc) => doc.lastReadTime !== undefined);

    if (documentsWithReadTime.length === 0) {
      return null;
    }

    // 按lastReadTime倒序排序，取第一个
    const sortedDocuments = documentsWithReadTime.sort((a, b) => b.lastReadTime! - a.lastReadTime!);

    return sortedDocuments[0];
  }

  /**
   * 更新文档的最后阅读时间
   */
  async updateLastReadTime(id: string): Promise<boolean> {
    return !!(await this.updateDocument(id, {
      lastReadTime: this.getCurrentTimestamp(),
    }));
  }

  /**
   * 搜索文档（按标题和内容）
   */
  async searchDocuments(query: string): Promise<DocumentData[]> {
    const documents = await this.getDocuments();
    const lowerQuery = query.toLowerCase();

    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 按来源筛选文档
   */
  async getDocumentsBySource(source: 'manual' | 'web'): Promise<DocumentData[]> {
    const documents = await this.getDocuments();
    return documents.filter((doc) => doc.source === source);
  }
}

/**
 * 单例实例
 */
export const documentStorage = new DocumentStorageService();
