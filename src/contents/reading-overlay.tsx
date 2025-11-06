'use client';

import type { PlasmoCSConfig } from "plasmo"
import { useState, useEffect } from 'react'
import MarkdownRenderer from '~components/MarkdownRenderer'
import MarkdownEditor from '~components/MarkdownEditor'
import ReadingToolbar from '~components/ReadingToolbar'
import { handleReadingMessage } from '~services/reading-service'

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

// 使用 Plasmo 的 getStyle API 来确保样式正确注入到 Shadow DOM
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    /* 基础样式 - 确保阅读覆盖层正确显示 */
    .reading-overlay-container {
      position: fixed !important;
      inset: 0 !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: rgba(0, 0, 0, 0.8) !important;
      backdrop-filter: blur(4px) !important;
    }

    .reading-content-wrapper {
      width: 100% !important;
      height: 100% !important;
      max-height: 100vh !important;
      padding: 2rem !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .reading-content-box {
      width: 100% !important;
      max-width: 90rem !important;
      max-height: 95vh !important;
      background: white !important;
      border-radius: 1rem !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }

    .reading-toolbar {
      padding: 1rem 1.5rem !important;
      border-bottom: 1px solid #e5e7eb !important;
      background: #f9fafb !important;
    }

    .reading-content-area {
      flex: 1 !important;
      overflow-y: auto !important;
      padding: 2rem !important;
      font-family: ui-sans-serif, system-ui, sans-serif !important;
      line-height: 1.6 !important;
      color: #1f2937 !important;
    }

    .reading-content-area h1 {
      font-size: 2rem !important;
      font-weight: bold !important;
      margin-bottom: 1rem !important;
      color: #111827 !important;
    }

    .reading-content-area h2 {
      font-size: 1.5rem !important;
      font-weight: bold !important;
      margin-bottom: 0.75rem !important;
      margin-top: 2rem !important;
      color: #111827 !important;
    }

    .reading-content-area p {
      margin-bottom: 1rem !important;
    }

    .reading-decoration-line {
      height: 0.25rem !important;
      background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899) !important;
    }

    .close-button {
      padding: 0.5rem 1rem !important;
      background: #ef4444 !important;
      color: white !important;
      border: none !important;
      border-radius: 0.375rem !important;
      cursor: pointer !important;
      font-weight: 500 !important;
    }

    .close-button:hover {
      background: #dc2626 !important;
    }
  `
  return style
}

interface ReadingData {
  content: string;
  title?: string;
  id?: string;
}

export default function ReadingOverlayContent() {
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
          title: request.title,
          id: request.id
        });
        setContent(request.content);
        setIsVisible(true);
        sendResponse({ success: true });
      } else if (request.action === 'closeReading') {
        handleClose();
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
    <div className="reading-overlay-container" onClick={handleClose}>
      {/* 内容层 */}
      <div className="reading-content-wrapper">
        <div className="reading-content-box">
          {/* 顶部装饰线 */}
          <div className="reading-decoration-line" />

          {/* 工具栏 */}
          <div className="reading-toolbar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
                {readingData.title || '阅读模式'}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isEditMode && (
                  <button
                    className="close-button"
                    onClick={handleSave}
                    style={{ background: '#10b981', marginRight: '0.5rem' }}
                  >
                    保存
                  </button>
                )}
                <button
                  className="close-button"
                  onClick={toggleEditMode}
                  style={{ background: '#3b82f6' }}
                >
                  {isEditMode ? '预览' : '编辑'}
                </button>
                <button className="close-button" onClick={handleClose}>
                  关闭
                </button>
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="reading-content-area">
            {isEditMode ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  lineHeight: 1.6,
                  fontSize: '1rem',
                  background: 'transparent'
                }}
                placeholder="在这里输入内容..."
              />
            ) : (
              <MarkdownRenderer content={readingData.content} />
            )}
          </div>

          {/* 底部装饰线 */}
          <div className="reading-decoration-line" />
        </div>
      </div>
    </div>
  );
}