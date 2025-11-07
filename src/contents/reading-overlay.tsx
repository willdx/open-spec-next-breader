"use client"

import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import cssText from "data-text:~style.css"

import { Save, Edit3, Eye, X } from "lucide-react"

import DraggableDivider from "~components/DraggableDivider"
import MarkdownEditor from "~components/MarkdownEditor"
import MarkdownRenderer from "~components/MarkdownRenderer"
import ReadingToolbar from "~components/ReadingToolbar"
import { handleReadingMessage } from "~services/reading-service"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

// 使用 Plasmo 官方推荐的 data-text: 导入方式
export const getStyle = () => {
  const style = document.createElement("style")
  // 适配 Shadow DOM 环境，将 :root 替换为 :host(plasmo-csui)
  style.textContent = cssText.replaceAll(':root', ':host(plasmo-csui)')
  return style
}

interface ReadingData {
  content: string
  title?: string
  id?: string
}

export default function ReadingOverlayContent() {
  const [isVisible, setIsVisible] = useState(false)
  const [readingData, setReadingData] = useState<ReadingData>({
    content: "",
    title: ""
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const [content, setContent] = useState("")

  // 分割线位置状态管理
  const [leftPanelWidth, setLeftPanelWidth] = useState(40) // 默认40%
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    // 监听来自popup的消息
    const handleMessage = (request: any, sender: any, sendResponse: any) => {
      if (request.action === "openReading") {
        setReadingData({
          content: request.content,
          title: request.title,
          id: request.id
        })
        setContent(request.content)
        setIsVisible(true)
        sendResponse({ success: true })
      } else if (request.action === "closeReading") {
        handleClose()
        sendResponse({ success: true })
      }
    }

    // ESC键关闭
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        handleClose()
      }
      // Ctrl+E 切换编辑模式
      if (e.ctrlKey && e.key === "e" && isVisible) {
        e.preventDefault()
        toggleEditMode()
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isVisible])

  // 禁用页面滚动 - 直接操作主页面DOM
  useEffect(() => {
    // 获取主页面（非Shadow DOM）的HTML和Body元素
    const hostDocument = document
    const hostBody = hostDocument.body
    const hostHtml = hostDocument.documentElement

    if (isVisible) {
      // 保存原始样式
      const originalBodyOverflow = hostBody.style.overflow
      const originalHtmlOverflow = hostHtml.style.overflow

      // 强制禁用滚动
      hostBody.style.setProperty('overflow', 'hidden', 'important')
      hostHtml.style.setProperty('overflow', 'hidden', 'important')

      // 保存原始样式以便恢复
      hostBody.dataset.originalOverflow = originalBodyOverflow
      hostHtml.dataset.originalOverflow = originalHtmlOverflow
    } else {
      // 恢复原始样式
      if (hostBody.dataset.originalOverflow !== undefined) {
        hostBody.style.overflow = hostBody.dataset.originalOverflow
        delete hostBody.dataset.originalOverflow
      } else {
        hostBody.style.removeProperty('overflow')
      }

      if (hostHtml.dataset.originalOverflow !== undefined) {
        hostHtml.style.overflow = hostHtml.dataset.originalOverflow
        delete hostHtml.dataset.originalOverflow
      } else {
        hostHtml.style.removeProperty('overflow')
      }
    }

    return () => {
      // 清理函数：确保恢复原始样式
      if (hostBody.dataset.originalOverflow !== undefined) {
        hostBody.style.overflow = hostBody.dataset.originalOverflow
        delete hostBody.dataset.originalOverflow
      } else {
        hostBody.style.removeProperty('overflow')
      }

      if (hostHtml.dataset.originalOverflow !== undefined) {
        hostHtml.style.overflow = hostHtml.dataset.originalOverflow
        delete hostHtml.dataset.originalOverflow
      } else {
        hostHtml.style.removeProperty('overflow')
      }
    }
  }, [isVisible])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      setReadingData({ content: "", title: "" })
      setContent("")
      setIsEditMode(false)
    }, 300)
  }

  const handleSave = async () => {
    try {
      let response

      if (readingData.id) {
        // 保存到现有文档
        response = await handleReadingMessage({
          action: "saveDocument",
          id: readingData.id,
          content: content
        })

        if (response.success) {
          setIsEditMode(false)
          setReadingData((prev) => ({ ...prev, content }))
        }
      } else {
        // 创建新文档
        response = await handleReadingMessage({
          action: "createDocument",
          content: content,
          title: readingData.title || "无标题文档"
        })

        if (response.success) {
          setIsEditMode(false)
          setReadingData((prev) => ({
            ...prev,
            content,
            id: response.id
          }))
        }
      }

      if (!response.success) {
        console.error("保存失败:", response.error)
      }
    } catch (error) {
      console.error("保存失败:", error)
    }
  }

  const toggleEditMode = () => {
    if (isEditMode) {
      // 从编辑模式退出时，恢复原始内容
      setContent(readingData.content)
    }
    setIsEditMode(!isEditMode)
  }

  // 处理分割线拖拽
  const handleDividerDrag = (newWidth: number) => {
    const containerWidth = window.innerWidth - 64 // 减去padding
    const percentage = (newWidth / containerWidth) * 100
    setLeftPanelWidth(Math.min(Math.max(percentage, 20), 60)) // 限制在20%-60%之间
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="reading-overlay-container fixed inset-0 z-[999999] w-screen h-screen flex flex-col bg-white overflow-hidden" onClick={handleClose}>
      {/* 内容层 - 点击事件不冒泡到外层 */}
      <div className="reading-content-wrapper flex-1 w-full h-full flex items-stretch justify-stretch overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="reading-content-box w-full h-full bg-white border-none rounded-none flex flex-col overflow-hidden">
          {/* 左上角关闭按钮 */}
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              zIndex: 10,
              background: "transparent",
              color: "#9ca3af",
              border: "none",
              borderRadius: "50%",
              width: "2.5rem",
              height: "2.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
              transition: "all 0.2s ease"
            }}
            title="关闭"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#6b7280";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9ca3af";
            }}>
            <X size={20} />
          </button>

          {/* 右上角工具组 */}
          <div
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              zIndex: 10,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "0.75rem",
              padding: "0.25rem",
              display: "flex",
              gap: "0.25rem",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
            }}>
            {isEditMode && (
              <button
                onClick={handleSave}
                style={{
                  background: "transparent",
                  color: "#9ca3af",
                  border: "none",
                  borderRadius: "0.5rem",
                  width: "2rem",
                  height: "2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  transition: "all 0.2s ease"
                }}
                title="保存"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#6b7280";
                  e.currentTarget.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#9ca3af";
                  e.currentTarget.style.background = "transparent";
                }}>
                <Save size={16} />
              </button>
            )}
            <button
              onClick={toggleEditMode}
              style={{
                background: "transparent",
                color: "#9ca3af",
                border: "none",
                borderRadius: "0.5rem",
                width: "2rem",
                height: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
                transition: "all 0.2s ease"
              }}
              title={isEditMode ? "预览" : "编辑"}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#6b7280";
                e.currentTarget.style.background = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#9ca3af";
                e.currentTarget.style.background = "transparent";
              }}>
              {isEditMode ? <Eye size={16} /> : <Edit3 size={16} />}
            </button>
          </div>

          {/* 双列布局内容区域 */}
          <div
            className="reading-two-column-layout grid h-full min-h-0 p-0 overflow-hidden"
            style={{
              gridTemplateColumns: `${leftPanelWidth}% 6px 1fr`
            }}>
            {/* 左侧面板 - 思维导图区域（暂时显示占位提示） */}
            <div className="mindmap-panel bg-slate-50 border border-gray-200 overflow-hidden flex flex-col p-0">
              <div
                className="mindmap-content flex-1 overflow-hidden bg-slate-50 flex items-center justify-center h-full text-gray-400 text-sm text-center">
                <div>
                  <div className="text-5xl mb-4">
                    🗺️
                  </div>
                  <div>思维导图功能</div>
                  <div className="text-xs mt-2">
                    即将上线...
                  </div>
                </div>
              </div>
            </div>

            {/* 可拖拽分割线 */}
            <DraggableDivider
              onDrag={handleDividerDrag}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
            />

            {/* 右侧面板 - 内容区域 */}
            <div className="content-panel overflow-hidden bg-white border border-gray-200 flex flex-col">
              <div className="reading-content-area flex-1 p-20 overflow-hidden">
                {/* 内层滚动容器 */}
                <div className="overflow-y-auto overflow-x-hidden h-full">
                  {isEditMode ? (
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-full border-none outline-none resize-none font-sans leading-relaxed text-lg bg-transparent"
                      placeholder="在这里输入内容..."
                      style={{ overflow: 'hidden' }}
                    />
                  ) : (
                    <MarkdownRenderer content={readingData.content} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
