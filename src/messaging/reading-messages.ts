// 统一的阅读模式消息类型定义

export interface ReadingOverlayMessage {
  action: 'openReading' | 'closeReading' | 'toggleEditMode';
  content?: string;
  title?: string;
  id?: string;
}

export interface ReadingDocumentMessage {
  action: 'createDocument' | 'saveDocument' | 'getDocument' | 'deleteDocument';
  id?: string;
  content?: string;
  title?: string;
}

export interface ReadingResponse {
  success: boolean;
  data?: any;
  error?: string;
  id?: string;
}

/**
 * 发送消息给阅读覆盖层 Content UI
 */
export const sendToReadingOverlay = async (message: ReadingOverlayMessage): Promise<ReadingResponse> => {
  try {
    // 获取当前活动标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      return { success: false, error: '无法获取当前标签页' };
    }

    // 发送消息给content script
    const response = await chrome.tabs.sendMessage(tab.id, message);
    return response || { success: false, error: '无响应' };
  } catch (error) {
    console.error('发送阅读覆盖层消息失败:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 打开阅读模式
 */
export const openReadingMode = async (params: {
  content: string;
  title?: string;
  id?: string;
}): Promise<ReadingResponse> => {
  return await sendToReadingOverlay({
    action: 'openReading',
    ...params
  });
};

/**
 * 关闭阅读模式
 */
export const closeReadingMode = async (): Promise<ReadingResponse> => {
  return await sendToReadingOverlay({
    action: 'closeReading'
  });
};

/**
 * 处理文档相关的消息
 */
export const handleDocumentMessage = async (message: ReadingDocumentMessage): Promise<ReadingResponse> => {
  try {
    // 这里可以添加具体的文档处理逻辑
    // 目前转发给现有的 reading-service 处理
    const response = await chrome.runtime.sendMessage(message);
    return response || { success: false, error: '无响应' };
  } catch (error) {
    console.error('处理文档消息失败:', error);
    return { success: false, error: error.message };
  }
};