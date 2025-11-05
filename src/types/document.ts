/**
 * 文档数据类型定义
 */
export interface DocumentData {
  id: string; // 唯一标识符
  title: string; // 文档标题
  content: string; // Markdown内容
  createdAt: number; // 创建时间戳
  updatedAt: number; // 更新时间戳
  lastReadTime?: number; // 最后阅读时间（可选）
  source?: 'manual' | 'web'; // 来源：手动输入 或 网页抓取
  sourceUrl?: string; // 如果是网页抓取，记录原始URL
}

/**
 * 创建文档时的输入数据（排除自动生成字段）
 */
export type CreateDocumentInput = Omit<DocumentData, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 更新文档时的输入数据（部分字段可选）
 */
export type UpdateDocumentInput = Partial<Pick<DocumentData, 'title' | 'content' | 'lastReadTime'>>;
