import { Storage } from "@plasmohq/storage";
import { openReadingMode as sendOpenReadingMode } from "~messaging/reading-messages";

const storage = new Storage();

export interface ReadingMessage {
  action: 'openReading';
  content: string;
  title?: string;
  id?: string;
}

export interface SaveDocumentMessage {
  action: 'saveDocument';
  id: string;
  content: string;
}

export interface CreateDocumentMessage {
  action: 'createDocument';
  content: string;
  title: string;
}

/**
 * 打开阅读界面 - 使用新的消息系统
 */
export async function openReadingMode(content: string, title?: string, id?: string) {
  try {
    // 使用统一的消息接口
    const response = await sendOpenReadingMode({
      content,
      title: title || '无标题文档',
      id
    });

    if (!response.success) {
      console.error('打开阅读模式失败:', response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('打开阅读模式失败:', error);
    return false;
  }
}

/**
 * 兼容性方法 - 直接使用 Chrome 消息 API（用于 fallback）
 */
export async function openReadingModeLegacy(content: string, title?: string, id?: string) {
  try {
    // 获取当前活动标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error('无法获取当前标签页');
    }

    // 发送消息给content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'openReading',
      content,
      title: title || '无标题文档',
      id
    } as ReadingMessage);

    if (!response?.success) {
      throw new Error('打开阅读模式失败');
    }

    return true;
  } catch (error) {
    console.error('打开阅读模式失败:', error);
    return false;
  }
}

/**
 * 保存文档到存储
 */
export async function saveDocumentToStorage(id: string, content: string) {
  try {
    const documents = await storage.get('documents') || [];
    const documentIndex = documents.findIndex((doc: any) => doc.id === id);

    if (documentIndex !== -1) {
      // 更新现有文档
      documents[documentIndex] = {
        ...documents[documentIndex],
        content,
        updatedAt: new Date().toISOString()
      };

      await storage.set('documents', documents);
      return true;
    } else {
      throw new Error('文档不存在');
    }
  } catch (error) {
    console.error('保存文档失败:', error);
    return false;
  }
}

/**
 * 创建新文档
 */
export async function createDocumentInStorage(content: string, title: string) {
  try {
    const documents = await storage.get('documents') || [];
    const newDocument = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'manual' as const
    };

    documents.unshift(newDocument);
    await storage.set('documents', documents);

    return {
      success: true,
      id: newDocument.id
    };
  } catch (error) {
    console.error('创建文档失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 从存储获取文档
 */
export async function getDocumentFromStorage(id: string) {
  try {
    const documents = await storage.get('documents') || [];
    const document = documents.find((doc: any) => doc.id === id);

    if (document) {
      return {
        success: true,
        document
      };
    } else {
      return {
        success: false,
        error: '文档不存在'
      };
    }
  } catch (error) {
    console.error('获取文档失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 处理来自background的消息
 */
export async function handleReadingMessage(message: any): Promise<any> {
  switch (message.action) {
    case 'saveDocument':
      return {
        success: await saveDocumentToStorage(message.id, message.content)
      };

    case 'createDocument':
      return await createDocumentInStorage(message.content, message.title);

    default:
      return {
        success: false,
        error: '未知的消息类型'
      };
  }
}