'use client';

import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import MarkdownRenderer from './MarkdownRenderer';
import MarkdownEditor from './MarkdownEditor';
import ReadingToolbar from './ReadingToolbar';
import { handleReadingMessage } from '../services/reading-service';

interface ReadingData {
  content: string;
  title?: string;
  id?: string;
}

export function ReadingOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [readingData, setReadingData] = useState<ReadingData>({
    content: '',
    title: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    // 监听来自popup的消息
    const handleMessage = (request: any, sender: any, sendResponse: any) => {
      if (request.action === 'openReading') {
        setReadingData({
          content: request.content,
          title: request.title || '无标题文档',
          id: request.id
        });
        setContent(request.content);
        setIsVisible(true);
        setIsEditMode(false);
        sendResponse({ success: true });
      }
    };

    // ESC键关闭
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
      // Ctrl+E 切换编辑模式
      if (e.ctrlKey && e.key === 'e' && isVisible) {
        e.preventDefault();
        toggleEditMode();
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setReadingData({ content: '', title: '' });
      setContent('');
      setIsEditMode(false);
    }, 300);
  };

  const handleSave = async () => {
    try {
      let response;

      if (readingData.id) {
        // 保存到现有文档
        response = await handleReadingMessage({
          action: 'saveDocument',
          id: readingData.id,
          content: content
        });

        if (response.success) {
          setIsEditMode(false);
          setReadingData(prev => ({ ...prev, content }));
        }
      } else {
        // 创建新文档
        response = await handleReadingMessage({
          action: 'createDocument',
          content: content,
          title: readingData.title || '无标题文档'
        });

        if (response.success) {
          setIsEditMode(false);
          setReadingData(prev => ({
            ...prev,
            content,
            id: response.id
          }));
        }
      }

      if (!response.success) {
        console.error('保存失败:', response.error);
      }
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // 从编辑模式退出时，恢复原始内容
      setContent(readingData.content);
    }
    setIsEditMode(!isEditMode);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[999999] flex items-center justify-center p-0 transition-all duration-300 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* 背景层 - 模糊效果和渐变 */}
      <div
        className={`absolute inset-0 backdrop-blur-sm bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 transition-all duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* 内容层 */}
      <div className="relative w-full h-full max-h-[100vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          className={`relative w-full max-w-7xl max-h-[95vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 flex flex-col overflow-hidden transition-all duration-500 transform ${
            isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
          }`}
        >

          {/* 顶部装饰线 */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          <ReadingToolbar
            title={readingData.title || '阅读模式'}
            isEditMode={isEditMode}
            onClose={handleClose}
            onSave={handleSave}
            onToggleEdit={toggleEditMode}
          />

          <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900/95">
            {isEditMode ? (
              <MarkdownEditor
                content={content}
                onChange={setContent}
              />
            ) : (
              <MarkdownRenderer content={readingData.content} />
            )}
          </div>

          {/* 底部装饰线 */}
          <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-50" />
        </div>
      </div>

      {/* 快捷键提示 */}
      {isVisible && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs backdrop-blur-sm opacity-60">
          <div>ESC 关闭</div>
          <div>Ctrl+E 编辑</div>
        </div>
      )}
    </div>
  );
}

// 用于将组件挂载到页面的辅助函数
export function mountReadingOverlay() {
  const mountPoint = document.createElement('div');
  mountPoint.id = 'plasmo-reading-overlay';
  document.body.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  root.render(<ReadingOverlay />);

  return root;
}