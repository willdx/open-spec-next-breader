<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a Plasmo + Next.js hybrid extension project. Use parallel development commands:

```bash
# Development (runs both Plasmo extension and Next.js app in parallel)
npm run dev
# or
pnpm dev

# Individual development servers
npm run dev:plasmo  # Plasmo extension development
npm run dev:next    # Next.js app on port 1947

# Production build
npm run build
# or
pnpm build
```

## Architecture

This project combines a Plasmo browser extension with a Next.js application:

- **Plasmo Extension**: Built in `src/popup/` with the main popup component at `src/popup/index.tsx`
- **Next.js App**: Standard Next.js app in `src/app/` with pages and layouts
- **Shared Components**: Reusable React components in `src/components/` (currently `Main.tsx`)
- **Path Aliases**: Uses `~*` mapping to `./src/*` for imports

### Key Structure

- `src/popup/index.tsx` - Extension popup entry point
- `src/app/page.tsx` - Next.js app main page
- `src/app/layout.tsx` - Next.js app root layout
- `src/components/main.tsx` - Shared Main component used by both popup and app

### Extension Configuration

- Manifest V3 with host permissions for `https://*/*`
- Tabs permission enabled
- Chrome MV3 build output in `build/chrome-mv3-dev/` during development

## Development Notes

- The extension popup and Next.js app share the same Main component but with different props
- Extension loads from `build/chrome-mv3-dev/` during development
- TypeScript configuration extends Plasmo base with Next.js plugin support
- 请用中文跟我交流
- 使用pnpm
- 不需要测试，我手动测试
- 使用Tailwind 3版本

## 🎯 Tailwind CSS 核心原则与最佳实践

### 基本原则

**"优先使用 Tailwind，零硬编码样式"**

### Plasmo + Tailwind 架构

#### 1. 内容脚本样式处理

```tsx
// ✅ 正确：使用 data-text: 导入完整 Tailwind
import cssText from "data-text:~style.css"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText.replaceAll(":root", ":host(plasmo-csui)")
  return style
}

// ❌ 错误：硬编码样式
export const getStyle = () => {
  style.textContent = `.custom-class { padding: 5rem !important; }`
}
```

#### 2. 样式定义优先级

```tsx
// 1. 优先使用 Tailwind 类
<div className="p-6 bg-white prose max-w-none">

// 2. getStyle() 只处理特殊情况（滚动条、Shadow DOM 适配等）
export const getStyle = () => {
  // 只处理 Tailwind 无法直接处理的样式
}

// 3. 避免重复定义
// ❌ 不要同时用 Tailwind 类和硬编码样式
```

#### 3. 配置要求

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contents/**/*.{js,ts,jsx,tsx,mdx}" // ✅ 必须包含内容脚本
  ],
  plugins: [require("@tailwindcss/typography")]
}
```

#### 4. 组件样式规范

```tsx
// ✅ 正确：纯 Tailwind 类
<div className="reading-content-area p-20 overflow-y-auto prose prose-gray">

// ❌ 错误：混用内联样式
<div className="reading-content-area" style={{ padding: '5rem' }}>

// ❌ 错误：在 getStyle() 中硬编码 Tailwind 类
style.textContent = `.p-20 { padding: 5rem !important; }`
```

### 常见问题解决

#### 当 Tailwind 类不生效时：

1. **检查 `tailwind.config.js` 的 content 配置**
2. **运行 `pnpm build` 确认无错误**
3. **确认没有在 `getStyle()` 中硬编码冲突样式**
4. **验证内容脚本使用了 `data-text:` 导入**

#### 调试方法：

```bash
# 检查构建后的 CSS 是否包含所需类
find build/chrome-mv3-dev -name "*.css" -exec grep -l "padding.*5rem" {} \;

# 验证构建
pnpm build:plasmo
```

### 关键教训

1. **实践胜过理论**：手动测试验证比假设分析重要
2. **相信官方文档**：Plasmo 完全支持 Tailwind 集成
3. **简单胜过复杂**：直接使用 Tailwind 类，不搞过度设计
4. **统一风格**：确保项目中所有地方都使用相同的样式定义方式

### 项目特定约定

- **边距**：使用 Tailwind 类（`p-4`, `p-6`, `p-8`, `p-20`）
- **滚动**：`overflow-y-auto overflow-x-hidden`
- **响应式**：`md:prose-lg lg:prose-xl`
- **深色模式**：`dark:prose-invert`
- **代码块**：使用 `prose-code:*` 和 `prose-pre:*` 修饰符

**记住：用 Tailwind 就坚持用 Tailwind，不要混用硬编码 CSS！**
