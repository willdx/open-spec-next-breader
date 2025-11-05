## Why

当前popup页面的"手动输入文档"按钮仅显示Alert占位提示，用户无法实际输入内容。为了提供更简洁、直接的用户体验，决定在popup页面内部实现模态编辑器，避免复杂的Content Script架构。

## What Changes

- 在popup组件内部实现模态编辑器，覆盖整个popup页面
- 使用React状态管理控制主界面和编辑器界面的切换
- 实现简化版文本编辑器，只有内容输入框（标题自动提取）
- 添加自动标题提取逻辑，从内容第一行提取标题
- 保存后显示跳转占位提示并返回主界面（主阅读页面待实现）
- 取消功能直接返回主界面
- 集成现有的documentStorage服务进行数据存储
- 优化popup布局，确保编辑器界面用户友好

## Impact

- Affected specs: `popup` (modify existing button behavior and add modal editor)
- Affected code: `src/popup/custom-popup.tsx` (modify)
- No content script permissions needed
- No cross-component communication required
- Simplified architecture with all functionality in popup