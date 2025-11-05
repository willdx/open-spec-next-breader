import '~style.css';

import { useState } from 'react';

import { useDocumentStorage } from '~hooks/useDocumentStorage';

function CustomPopup() {
  const { documentCount, lastReadDocument } = useDocumentStorage();
  const [isOpeningSidePanel, setIsOpeningSidePanel] = useState(false);

  // 打开 Side Panel 文档库
  const handleDocumentCountClick = async () => {
    if (isOpeningSidePanel) return;

    setIsOpeningSidePanel(true);
    try {
      // 获取当前窗口
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab.windowId) {
        // 打开侧边栏
        await chrome.sidePanel.open({ windowId: tab.windowId });

        // 延迟关闭popup，确保side panel先打开
        setTimeout(() => {
          window.close();
        }, 100);
      }
    } catch (error) {
      console.error('打开侧边栏失败:', error);
      alert('打开文档库失败，请重试');
    } finally {
      setIsOpeningSidePanel(false);
    }
  };

  const handleLastReadClick = () => {
    if (lastReadDocument) {
      // TODO: 实现跳转到主界面阅读功能
      alert(`点击了上次阅读: ${lastReadDocument.title}\n跳转功能待实现`);
    } else {
      alert('暂无阅读记录，请先添加文档');
    }
  };

  const handleExtractWebClick = () => {
    // TODO: 实现网页抓取功能
    alert('抓取网页内容功能待实现');
  };

  const handleManualInputClick = () => {
    // TODO: 实现手动输入功能
    alert('手动输入功能待实现');
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-800 mb-2">阅读助手</h1>
        <p className="text-sm text-gray-600">清晰的结构+精简的内容</p>
      </div>

      {/* Document Statistics */}
      <div
        className={`bg-blue-50 rounded-lg p-3 mb-4 cursor-pointer transition-colors ${
          isOpeningSidePanel ? 'bg-blue-100 opacity-75 cursor-not-allowed' : 'hover:bg-blue-100'
        }`}
        onClick={handleDocumentCountClick}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            {isOpeningSidePanel ? (
              <span className="text-white text-sm font-bold animate-pulse">⏳</span>
            ) : (
              <span className="text-white text-sm font-bold">📚</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              文档库
              {isOpeningSidePanel && <span className="text-xs text-blue-600 ml-1">打开中...</span>}
            </p>
            <p className="text-xs text-gray-600">{documentCount}个文档</p>
          </div>
        </div>
      </div>

      {/* Last Reading Record */}
      <div
        className="bg-green-50 rounded-lg p-3 mb-4 cursor-pointer hover:bg-green-100 transition-colors"
        onClick={handleLastReadClick}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">📖</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">上次阅读</p>
            <p className="text-xs text-gray-600">
              {lastReadDocument ? lastReadDocument.title : '暂无阅读记录'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleExtractWebClick}
          className="w-full bg-purple-500 text-white rounded-lg px-4 py-3 font-medium hover:bg-purple-600 transition-colors flex items-center justify-center"
        >
          <span className="mr-2">🌐</span>
          抓取网页内容
        </button>

        <button
          onClick={handleManualInputClick}
          className="w-full bg-indigo-500 text-white rounded-lg px-4 py-3 font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center"
        >
          <span className="mr-2">✏️</span>
          手动输入文档
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">v0.0.1 • 让阅读更高效</p>
      </div>
    </div>
  );
}

export default CustomPopup;
