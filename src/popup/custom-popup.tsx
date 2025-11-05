import "~style.css"

import { useEffect, useRef, useState } from "react"

import { useDocumentStorage } from "~hooks/useDocumentStorage"
import { documentStorage } from "~services/document-storage"

function CustomPopup() {
  const { documentCount, lastReadDocument } = useDocumentStorage()
  const [isOpeningSidePanel, setIsOpeningSidePanel] = useState(false)

  // 编辑器状态管理
  const [isEditorMode, setIsEditorMode] = useState(false)
  const [editorContent, setEditorContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动标题提取函数
  const extractTitle = (content: string): string => {
    if (!content.trim()) {
      return "无标题文档"
    }

    const firstLine = content.split("\n")[0].trim()

    // 如果第一行以 # 开头，去掉 # 作为标题
    if (firstLine.startsWith("# ")) {
      return firstLine.substring(2).trim()
    }

    // 取第一行前30个字符作为标题
    let title = firstLine.substring(0, 30)

    // 如果第一行超过30个字符，添加省略号
    if (firstLine.length > 30) {
      title += "..."
    }

    return title || "无标题文档"
  }

  // 格式化阅读时间显示
  const formatReadTime = (timestamp?: number): string => {
    if (!timestamp) return ""

    const now = Date.now()
    const diffMs = now - timestamp
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays}天前`
    } else if (diffHours > 0) {
      return `${diffHours}小时前`
    } else if (diffMs > 60000) {
      return `${Math.floor(diffMs / 60000)}分钟前`
    } else {
      return "刚刚"
    }
  }

  // 打开编辑器
  const handleManualInputClick = () => {
    setIsEditorMode(true)
    setEditorContent("")
    // 等待DOM更新后聚焦文本框
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  // 保存文档
  const handleSaveDocument = async () => {
    if (!editorContent.trim()) {
      alert("请输入内容")
      return
    }

    setIsSaving(true)
    try {
      const title = extractTitle(editorContent)
      await documentStorage.addDocument({
        title,
        content: editorContent,
        source: "manual"
      })

      alert(`文档"${title}"保存成功！\n跳转功能待实现`)
      setIsEditorMode(false)
      setEditorContent("")
    } catch (error) {
      console.error("保存文档失败:", error)
      alert("保存文档失败，请重试")
    } finally {
      setIsSaving(false)
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditorMode(false)
    setEditorContent("")
  }

  // 键盘快捷键支持 (Ctrl+Enter 保存)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault()
      handleSaveDocument()
    }
  }

  // 打开 Side Panel 文档库
  const handleDocumentCountClick = async () => {
    if (isOpeningSidePanel) return

    setIsOpeningSidePanel(true)
    try {
      // 获取当前窗口
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (tab.windowId) {
        // 打开侧边栏
        await chrome.sidePanel.open({ windowId: tab.windowId })

        // 延迟关闭popup，确保side panel先打开
        setTimeout(() => {
          window.close()
        }, 100)
      }
    } catch (error) {
      console.error("打开侧边栏失败:", error)
      alert("打开文档库失败，请重试")
    } finally {
      setIsOpeningSidePanel(false)
    }
  }

  const handleLastReadClick = () => {
    if (lastReadDocument) {
      // 更新最后阅读时间（用户点击时重新记录）
      updateLastReadTime(lastReadDocument.id)

      // TODO: 实现跳转到主界面阅读功能
      alert(`上次阅读: ${lastReadDocument.title}\n\n内容预览:\n${lastReadDocument.content.substring(0, 100)}${lastReadDocument.content.length > 100 ? '...' : ''}\n\n跳转功能待实现`)
    } else {
      alert("暂无阅读记录\n\n请先在文档库中阅读任意文档后，这里将显示您的阅读历史")
    }
  }

  const handleExtractWebClick = () => {
    // TODO: 实现网页抓取功能
    alert("抓取网页内容功能待实现")
  }

  // 编辑器界面组件
  const EditorInterface = () => (
    <div className="w-80 bg-white rounded-lg shadow-lg p-4 h-96 flex flex-col">
      {/* 编辑器标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <span className="mr-2">📝</span>
          仅支持粘贴文档
        </h2>
      </div>

      {/* 文本输入区域 */}
      <div className="flex-1 mb-4">
        <textarea
          ref={textareaRef}
          value={editorContent}
          onChange={(e) => setEditorContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="手动输入体验不好, 但直接粘贴没问题😁"
          className="w-full h-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
          style={{ minHeight: "200px" }}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <button
          onClick={handleCancelEdit}
          disabled={isSaving}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          取消
        </button>
        <button
          onClick={handleSaveDocument}
          disabled={isSaving || !editorContent.trim()}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
          {isSaving ? (
            <>
              <span className="mr-2 animate-pulse">⏳</span>
              保存中...
            </>
          ) : (
            <>
              <span className="mr-2">💾</span>
              保存
            </>
          )}
        </button>
      </div>
    </div>
  )

  // 主界面组件
  const MainInterface = () => (
    <div className="w-80 bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-800 mb-2">阅读助手</h1>
        <p className="text-sm text-gray-600">清晰的结构+精简的内容</p>
      </div>

      {/* Document Statistics */}
      <div
        className={`bg-blue-50 rounded-lg p-3 mb-4 cursor-pointer transition-colors ${
          isOpeningSidePanel
            ? "bg-blue-100 opacity-75 cursor-not-allowed"
            : "hover:bg-blue-100"
        }`}
        onClick={handleDocumentCountClick}>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            {isOpeningSidePanel ? (
              <span className="text-white text-sm font-bold animate-pulse">
                ⏳
              </span>
            ) : (
              <span className="text-white text-sm font-bold">📚</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              文档库
              {isOpeningSidePanel && (
                <span className="text-xs text-blue-600 ml-1">打开中...</span>
              )}
            </p>
            <p className="text-xs text-gray-600">{documentCount}个文档</p>
          </div>
        </div>
      </div>

      {/* Last Reading Record */}
      <div
        className="bg-green-50 rounded-lg p-3 mb-4 cursor-pointer hover:bg-green-100 transition-colors"
        onClick={handleLastReadClick}>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">📖</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">上次阅读</p>
            <p className="text-xs text-gray-600 truncate">
              {lastReadDocument ? (
                <>
                  {lastReadDocument.title}
                  {lastReadDocument.lastReadTime && (
                    <span className="ml-1 text-green-600">
                      • {formatReadTime(lastReadDocument.lastReadTime)}
                    </span>
                  )}
                </>
              ) : (
                "暂无阅读记录"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleExtractWebClick}
          className="w-full bg-purple-500 text-white rounded-lg px-4 py-3 font-medium hover:bg-purple-600 transition-colors flex items-center justify-center">
          <span className="mr-2">🌐</span>
          抓取网页内容
        </button>

        <button
          onClick={handleManualInputClick}
          className="w-full bg-indigo-500 text-white rounded-lg px-4 py-3 font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center">
          <span className="mr-2">✏️</span>
          手动粘贴内容
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          v0.0.1 • 让阅读更高效
        </p>
      </div>
    </div>
  )

  // 根据编辑器状态渲染不同界面
  return isEditorMode ? <EditorInterface /> : <MainInterface />
}

export default CustomPopup
