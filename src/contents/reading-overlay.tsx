"use client"

import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import DraggableDivider from "~components/DraggableDivider"
import MarkdownEditor from "~components/MarkdownEditor"
import MarkdownRenderer from "~components/MarkdownRenderer"
import ReadingToolbar from "~components/ReadingToolbar"
import { handleReadingMessage } from "~services/reading-service"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

// 使用 Plasmo 的 getStyle API 来确保样式正确注入到 Shadow DOM
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    /* 基础样式 - 完全充满屏幕的全屏布局 */
    .reading-overlay-container {
      position: fixed !important;
      inset: 0 !important;
      z-index: 999999 !important;
      width: 100vw !important;
      height: 100vh !important;
      display: flex !important;
      flex-direction: column !important;
      background: white !important;
    }

    .reading-content-wrapper {
      flex: 1 !important;
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      align-items: stretch !important;
      justify-content: stretch !important;
    }

    .reading-content-box {
      width: 100% !important;
      height: 100% !important;
      background: white !important;
      border: none !important;
      border-radius: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }

    /* 双列布局样式 - 支持动态列宽，充满屏幕 */
    .reading-two-column-layout {
      display: grid !important;
      grid-template-columns: 40% 6px 1fr !important; /* 左侧40% + 分割线6px + 右侧剩余空间 */
      gap: 0 !important;
      height: 100% !important;
      min-height: 0 !important; /* 允许子元素收缩 */
      padding: 0 !important;
    }

    /* 左侧思维导图面板 */
    .mindmap-panel {
      background: #f8fafc !important;
      border: 1px solid #e5e7eb !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      padding: 0 !important;
    }

    .mindmap-content {
      flex: 1 !important;
      overflow: hidden !important;
      background: #f8fafc !important;
    }

    /* 右侧内容面板 */
    .content-panel {
      overflow: hidden !important;
      background: white !important;
      border: 1px solid #e5e7eb !important;
      display: flex !important;
      flex-direction: column !important;
    }

    /* 分割线 */
    .column-divider {
      width: 1px !important;
      background: #e5e7eb !important;
      align-self: stretch !important;
    }

    .reading-toolbar {
      padding: 1rem 1.5rem !important;
      border-bottom: 1px solid #e5e7eb !important;
      background: #f9fafb !important;
    }

    .reading-content-area {
      flex: 1 !important;
      overflow-y: auto !important;
      padding: 1.5rem !important;
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

    /* 响应式设计 - 小屏幕切换为单列布局 */
    @media (max-width: 1200px) {
      .reading-two-column-layout {
        grid-template-columns: 1fr !important;
      }

      .mindmap-panel {
        display: none !important;
      }
    }

    @media (max-width: 768px) {
      .reading-content-wrapper {
      }

      .reading-two-column-layout {
        padding: 0.5rem !important;
      }

      .reading-toolbar {
        padding: 0.75rem 1rem !important;
      }

      .reading-decoration-line {
        display: none !important;
      }
    }

    /* 大屏幕优化 */
    @media (min-width: 1600px) {
      .reading-content-wrapper {
      }

      .reading-two-column-layout {
      }
    }
  `
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
    <div className="reading-overlay-container" onClick={handleClose}>
      {/* 内容层 */}
      <div className="reading-content-wrapper">
        <div className="reading-content-box">
          {/* 工具栏 - 绝对定位在右上角 */}
          <div
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              zIndex: 10,
              display: "flex",
              gap: "0.5rem"
            }}>
            {isEditMode && (
              <button
                className="close-button"
                onClick={handleSave}
                style={{ background: "#10b981" }}>
                保存
              </button>
            )}
            <button
              className="close-button"
              onClick={toggleEditMode}
              style={{ background: "#3b82f6" }}>
              {isEditMode ? "预览" : "编辑"}
            </button>
            <button
              className="close-button"
              onClick={handleClose}
              style={{ background: "#ef4444" }}>
              关闭
            </button>
          </div>

          {/* 双列布局内容区域 */}
          <div
            className="reading-two-column-layout"
            style={{
              gridTemplateColumns: `${leftPanelWidth}% 6px 1fr`
            }}>
            {/* 左侧面板 - 思维导图区域（暂时显示占位提示） */}
            <div className="mindmap-panel">
              <div
                className="mindmap-content"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                  textAlign: "center"
                }}>
                <div>
                  <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                    🗺️
                  </div>
                  <div>思维导图功能</div>
                  <div style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
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
            <div className="content-panel">
              <div className="reading-content-area">
                {isEditMode ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      outline: "none",
                      resize: "none",
                      fontFamily: "ui-sans-serif, system-ui, sans-serif",
                      lineHeight: 1.6,
                      fontSize: "1rem",
                      background: "transparent"
                    }}
                    placeholder="在这里输入内容..."
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
  )
}
