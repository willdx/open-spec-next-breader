# Project Context

## Purpose

本项目旨在构建一个基于 **Plasmo + Next.js** 的浏览器扩展（Chrome Extension）。
标语是“清晰的结构+简洁的内容”。
清晰的结构: 是指我们基于markdown文档天然的heading层次，将markdown文档构建为思维导图（也就是**ReactFlow 节点图**），让用户能快速了解内容的知识结构。
简洁的内容: 思维导图的每一个节点就是一个小章节，用户每次只需要关注当前节点的内容，进行阅读, 用户每次浏览的信息量短而集中，帮助用户提示效率。

目标包括：

- 1.自定义 **Popup 页面**: Popup 页面是浏览器扩展的入口，用户点击扩展图标时打开。里面包含了本扩展要支持的功能入口。使用plasmo的Adding a Popup Page的方案来添加。
  - 1.显示文档库中的**文档数量**
  - 2.显示**上次阅读**文档记录（在初次保存和后续从文档库中打开时将阅读时间存储到文档的lastReadTime字段），点击可跳转至主界面
  - 3.**抓取网页按钮**：抓取当前浏览器标签页内容转为 Markdown，跳转至阅读界面进行阅读
  - 4.**手动输入按钮**：打开弹窗，让用户输入 Markdown 内容，确定后跳转至阅读界面
- 2.**手动输入Markdown文档**页面

  - 文本输入框：提示用户输入markdown内容。
  - 提交：点弹框的右下角提交按钮，跳转到**阅读界面**进行阅读。
  - 退出： 点弹框的右上角退出弹窗。

- 3.**从网页抓取 Markdown 文档**功能；

  - 当用户点击popup页面的抓取网页按钮时，会调用一些自定义的方法，将当前标签页的网页内容转为Markdown，并在阅读页面渲染显示。

- 4.**阅读页面**: 阅读页面是2栏结构，左侧是思维导图，右侧是 Markdown 文档。

  - **左侧思维导图**

    - 1.默认选中第一个章节节点，并将该节点的数据渲染到右侧markdown区
    - 2.支持点节点切换节点选中状态，节点选中状态和普通状态的样式要不一样，然后将选中节点的数据渲染到右侧markdown区域
    - 3.支持dfs深度优先 以及 bfs广度优先的顺序，使用键盘的方向键来切换选中章节节点

  - **中间拖拽分隔线**, 拖拽分隔线reactFlow的思维导图自适应，撑满屏幕，提升用户阅读体验

  - **右侧vditor Markdown面板**, 使用vditor 渲染，模式是预览模式
    1.1 当编辑了某个章节的内容后，要点保存才会真正存储到storage
    1.2 需要监听输入内容的变化，给用户提示有内容未保存，最好就是保存按钮对于有更改的情况样式上做一点提醒
    1.3 有更新但用户没有点保存就准备切到另一个节点，那么提示用户2.预览模式，阅读内容

  - **工具栏 (ToolBar)**， 页面右上角
    - 保存按钮: 当用户想要将手动输入或者从网页爬取的Markdown文档保存到扩展存储中, 点保存按钮。
    - 退出按钮: 用户点击这个按钮可以退出扩展，并返回到浏览器。

- 5.**文档库管理**模块: 表现形式side panel
  - **内容：** 调用@plasmohq/storage方法获取数据进行列表展示。
  - **交互：** 点击数据条目卡片，跳转到“主界面”进行阅读和编辑。
  - **删除：** 每个条目的右上角有删除按钮，点击就删除文档。
  - **全部删除：** 点击就删除所有文档。
  - **搜索：** 支持关键词搜索。
  - **排序：** 默认修改时间倒序。
  - **退出：** 点弹框的右上角退出弹窗。

---

## Tech Stack

- **Plasmo Framework**（Chrome Extension 框架）
- **Next.js 14+**（前端页面与逻辑组织）
- **React 18+**
- **TypeScript**
- **TailwindCSS**
- **ReactFlow**（知识节点图可视化）
- **Plasmo Storage**（扩展存储）
- **React Context + Hooks**（状态管理）

---

## Project Conventions

### Code Style

- 采用 **TypeScript**；
- 遵循 **Prettier** 格式化规则；
- 使用 **函数式组件 (FC)** 与 **Hooks**；
- 命名规范：
  - 组件：`PascalCase`
  - 工具函数：`camelCase`
  - 常量：`SCREAMING_SNAKE_CASE`
  - 文件名：`kebab-case`
- 所有 UI 组件保持「无副作用」「可组合性强」。

---

### Architecture Patterns

- **应用架构**
  extension/
  ├─ popup/ # 自定义 Popup 页面
  ├─ background/ # 后台脚本逻辑（如消息通信）
  ├─ content/ # 内容脚本（与网页交互）
  ├─ options/ # 设置页面
  ├─ storage/ # 数据存储逻辑（chrome.storage）
  └─ ui/ # 通用 UI 组件（基于 Tailwind）

- **核心理念**
- 所有状态通过 React Context 提供；单一数据源（Chapter Tree） + 纯计算派生状态。
- 可计算属性与派生状态优先；
- 使用plasma的Content Scripts UI来实现手动输入页面和主要的阅读页面。Plasmo通过创建一个Shadow DOM来隔离组件样式，防止与网页样式相互影响。
- 使用plasma来创建Adding a Side Panel，来实现文档库管理模块。

---

### Testing Strategy

- 开发者手动测试

---

### Git Workflow

- 分支策略：目前都在main分支开发
- 提交规范（遵循 Conventional Commits）：
  feat: 新增自定义 Popup 页面
  fix: 修复 Markdown 解析性能问题
  refactor: 重构状态管理逻辑
  chore: 更新依赖版本

- 每个 PR 必须通过 Prettier。

---

## Domain Context

- React Context 状态管理:状态管理基于 React Context，数据结构基于数据驱动。

  ```tsx
  export interface ChapterContextType {
    // 章节树（唯一数据源）
    chapterTree: ChapterNode
    // 后面都是计算属性
    reactflow: {
      // 计算属性：ReactFlow 节点/边
      nodes: Node[] // 选中状态放在 ReactFlow 节点，而不是 Chapter Tree, slected=true, 初始打开页面第一个页面的selected=true
      edges: Edge[]
      // 计算属性：DFS / BFS 顺
      dfsOrder: string[]
      bfsOrder: string[]
      // 计算属性：选中节点
      selectedNodeId: string | null
    }
  }
  ```

- 数据流:

  ```text
  输入源1.网页内容（HTML）
      ↓
  extractReadableContent()
  —— 从网页中提取正文内容（可用 Readability / DOMParser）
      ↓
  convertToMarkdown()
  —— 将正文转为 Markdown 字符串（可用 Turndown）
      ↓
  parseMarkdownToAST()   <-  输入源2.手动输入直接输入markdown内容
  —— 解析 Markdown 为语法树（AST）（remark / markdown-it）
      ↓
  astToChapterTree()
  —— 将 AST 转为章节树（基于标题层级构建父子关系）
      ↓
  chapterTreeToFlow()
  —— 将章节树转换为 ReactFlow 所需节点/边数据结构
      ↓
  useDagreLayout()
  —— 使用 dagre 算法为节点自动计算布局坐标
      ↓
  ReactFlow 渲染
  —— 渲染思维导图 + 节点交互 + Markdown 编辑区同步
  ```

- ReactFlow + dagre 布局

  - 1.页面加载时，不渲染节点（fitView={false}）。
  - 2.模拟异步请求 → 获取节点与边。
  - 3.使用 Dagre 布局计算每个节点的位置。
  - 4.布局完成后再设置节点，并延迟一帧调用 fitView()。
  - 5.整个过程用户只看到平滑的“进入动画”，不会闪或跳。

  ```tsx
  import { useReactFlow } from "@xyflow/react"

  const { fitView } = useReactFlow()

  // 1.fitView={false}，因为设置为true也没用，所以这里设置为false
  ;<ReactFlow nodes={[]} edges={[]} fitView={false} />

  // 2.加载完节点并布局后：手动调用 fitView 方法
  setNodes(layoutedNodes)
  requestAnimationFrame(() => fitView({ padding: 0.2, duration: 100 }))
  ```

- Plasmo 存储的示例

  ```tsx
  import { useStorage } from "@plasmohq/storage/hook"

  function Popup() {
    const [count, setCount] = useStorage("count", 0)

    return (
      <button onClick={() => setCount((c) => c + 1)}>
        Clicked {count} times
      </button>
    )
  }
  ```

---

## Important Constraints

- 浏览器扩展受 Chrome Manifest V3 限制；
- Next.js 需作为 Plasmo 的前端渲染层嵌入；
- 不支持多节点同时选中（当前交互模型）；
- 状态管理必须使用 React Context；
- 网络请求需符合浏览器 CSP 限制；
- 未来兼容性：Edge / Firefox。
- UI风格
  - **视觉风格：** 扁平化设计（Flat Design），无多余阴影或装饰性渐变。界面干净，强调信息层次与可读性。
  - **色彩：** Tailwind 默认色彩系统，现代、清晰、对比合理。shadcn/ui 提供一致的品牌色。
  - **排版：** 高度可控，间距统一，字体清晰可读。
  - **组件风格：** shadcn/ui 提供组件化 UI（Button、Card、Tabs、Dialog…），交互逻辑完善，视觉与操作一致性高。
  - **交互反馈：** 按钮、输入框、表单、Tab 等提供 hover、focus、active 状态反馈，细节友好。
  - **整体感受：** 现代扁平化、极简可读、组件化且响应式的 UI 风格。

---

## External Dependencies

- `plasmo`：浏览器扩展运行时；
- `next`：前端框架；
- `reactflow`：可视化节点图；
- `tailwindcss`：UI 样式；
- `@plasmohq/storage`：统一存储；
- `markdown-it` / `remark`（Markdown AST 解析器）。
- vditor （Markdown 编辑器， 暂时仅使用它的预览功能）

---
