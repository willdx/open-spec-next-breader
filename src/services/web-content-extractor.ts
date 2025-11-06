import { Readability } from "@mozilla/readability"
import TurndownService from "turndown"

export interface ExtractedContent {
  title: string // 从 Markdown 正文中提取的标题
  content: string // Markdown 正文内容
  url: string // 来源 URL
}

/**
 * 从 Markdown 内容中提取标题
 */
function extractTitleFromMarkdown(markdown: string): string {
  const lines = markdown.split("\n")

  // 查找第一个 # 标题
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith("# ")) {
      return trimmedLine.substring(2).trim()
    }
  }

  // 如果没有 # 标题，查找第一个 ## 标题
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith("## ")) {
      return trimmedLine.substring(3).trim()
    }
  }

  // 如果都没有，使用第一行非空内容作为标题
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (
      trimmedLine &&
      !trimmedLine.startsWith("!") &&
      !trimmedLine.startsWith(">")
    ) {
      // 限制标题长度
      return trimmedLine.length > 50
        ? trimmedLine.substring(0, 50) + "..."
        : trimmedLine
    }
  }

  return "无标题文档"
}

export class WebContentExtractor {
  private turndownService: TurndownService

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: "atx",
      hr: "---",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
      fence: "```",
      emDelimiter: "_",
      strongDelimiter: "**",
      linkStyle: "inlined"
    })

    this.setupCustomRules()
  }

  private setupCustomRules() {
    // 移除脚本、样式、广告等无关元素
    this.turndownService.addRule("remove-elements", {
      filter: ["script", "style", "noscript", "iframe", "ins", "ads"],
      replacement: () => ""
    })

    // 处理图片
    this.turndownService.addRule("images", {
      filter: "img",
      replacement: (content, node) => {
        const img = node as HTMLImageElement
        const alt = img.alt || ""
        const src = img.src || ""
        return alt ? `![${alt}](${src})` : `![](${src})`
      }
    })

    // GitHub 代码块特殊处理 - 处理 div.highlight > pre 结构
    this.turndownService.addRule("github-highlight-codeblocks", {
      filter: (node) => {
        if (node.nodeName !== "PRE") return false

        // 检查父元素是否有 highlight class
        const parent = node.parentNode as HTMLElement
        if (!parent || parent.nodeName !== "DIV") return false

        return parent.classList && Array.from(parent.classList).some(cls =>
          cls.startsWith("highlight-source-") || cls.startsWith("highlight-")
        )
      },
      replacement: (content, node) => {
        const pre = node as HTMLElement
        const parent = pre.parentNode as HTMLElement

        console.log("🔧 GitHub 代码块处理:", {
          parentClass: parent.className,
          preClass: pre.className,
          contentLength: content.length,
          contentPreview: content.substring(0, 100)
        })

        // 提取语言信息
        const language = this.extractLanguageFromNode(parent, pre)
        const normalizedLang = this.normalizeLanguage(language)

        // 清理 GitHub 特有的 span 标签
        const cleanedContent = this.cleanGitHubCodeSpans(content)

        console.log(`✅ GitHub 代码块提取成功: 语言=${normalizedLang}, 长度=${cleanedContent.length}`)

        return `\n\n\`\`\`${normalizedLang}\n${cleanedContent}\n\`\`\`\n\n`
      }
    })

    // 标准代码块处理（增强版）
    this.turndownService.addRule("code-blocks", {
      filter: (node) => {
        if (node.nodeName !== "PRE") return false

        // 检查是否已经被 GitHub 规则处理过（避免重复处理）
        const parent = node.parentNode as HTMLElement
        if (parent && parent.nodeName === "DIV" && parent.classList) {
          const hasHighlightClass = Array.from(parent.classList).some(cls =>
            cls.startsWith("highlight-source-") || cls.startsWith("highlight-")
          )
          if (hasHighlightClass) return false // 已被 GitHub 规则处理
        }

        return node.querySelector("code") !== null
      },
      replacement: (content, node) => {
        const pre = node as HTMLElement
        const code = pre.querySelector("code")
        const className = code?.className || pre.className

        // 增强的语言提取
        const language = this.extractLanguageFromNode(pre, code) ||
                        this.extractLanguageFromClass(className)

        const normalizedLang = this.normalizeLanguage(language)

        console.log("📝 标准代码块处理:", {
          normalizedLang,
          contentLength: content.length
        })

        return `\n\n\`\`\`${normalizedLang}\n${content.replace(/^\n+|\n+$/g, "")}\n\`\`\`\n\n`
      }
    })

    // 处理表格
    this.turndownService.addRule("tables", {
      filter: "table",
      replacement: (content, node) => {
        const table = node as HTMLTableElement
        const rows = Array.from(table.querySelectorAll("tr"))
        if (rows.length === 0) return ""

        let markdown = "\n\n"
        rows.forEach((row, index) => {
          const cells = Array.from(row.querySelectorAll("td, th"))
          const rowData = cells.map((cell) => {
            const text = cell.textContent?.trim() || ""
            return text.replace(/\|/g, "\\|")
          })
          markdown += `| ${rowData.join(" | ")} |\n`

          if (index === 0 && row.querySelector("th")) {
            const separator = cells.map(() => "---").join(" | ")
            markdown += `| ${separator} |\n`
          }
        })
        return markdown + "\n"
      }
    })
  }

  /**
   * 从节点中提取语言信息
   */
  private extractLanguageFromNode(...nodes: (HTMLElement | null)[]): string {
    for (const node of nodes) {
      if (!node) continue

      // 1. 检查 highlight-source-* class
      if (node.classList) {
        for (const cls of node.classList) {
          if (cls.startsWith('highlight-source-')) {
            return cls.replace('highlight-source-', '')
          }
        }
      }

      // 2. 检查 data-* 属性
      const dataLang = node.getAttribute('data-lang') || node.getAttribute('data-language')
      if (dataLang) return dataLang

      // 3. 检查 className 的 language-* 前缀
      const className = node.className || ''
      const match = className.match(/language-(\w+)/)
      if (match) return match[1]
    }

    return ''
  }

  /**
   * 从 className 中提取语言
   */
  private extractLanguageFromClass(className: string): string {
    const match = className.match(/language-(\w+)/)
    return match ? match[1] : ''
  }

  /**
   * 标准化语言标识符
   */
  private normalizeLanguage(language: string): string {
    if (!language) return ''

    // 语言标准化映射
    const languageMap: { [key: string]: string } = {
      // Shell 相关
      'sh': 'bash',
      'shell': 'bash',
      'zsh': 'bash',
      'fish': 'bash',
      'powershell': 'powershell',
      'ps1': 'powershell',
      'bat': 'batch',
      'cmd': 'batch',

      // JavaScript 相关
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',

      // 其他常见语言
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'kt': 'kotlin',
      'swift': 'swift',
      'cs': 'csharp',
      'cpp': 'cpp',
      'cc': 'c',
      'h': 'c',
      'php': 'php',
      'scala': 'scala',
      'r': 'r',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'xml': 'xml',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'dockerfile': 'dockerfile',
      'makefile': 'makefile'
    }

    // 转换为小写并应用映射
    const normalized = language.toLowerCase().trim()
    return languageMap[normalized] || normalized
  }

  /**
   * 清理 GitHub 特有的 span 标签
   */
  private cleanGitHubCodeSpans(content: string): string {
    // 创建一个临时 DOM 来解析 span 标签
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content

    // 移除所有的 GitHub 语法高亮 span，但保留文本内容
    const spans = tempDiv.querySelectorAll('span')
    spans.forEach(span => {
      const parent = span.parentNode
      if (parent) {
        // 将 span 替换为纯文本
        parent.replaceChild(document.createTextNode(span.textContent || ''), span)
      }
    })

    return tempDiv.textContent || content
  }

  /**
   * 检查是否为 GitHub 项目页面
   */
  private isGitHubProjectPage(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return (
        urlObj.hostname.includes("github.com") &&
        urlObj.pathname.includes("/") &&
        !urlObj.pathname.includes("/issues/") &&
        !urlObj.pathname.includes("/pull/") &&
        !urlObj.pathname.includes("/discussions/")
      )
    } catch {
      return false
    }
  }

  /**
   * 直接提取 GitHub 页面的 README 内容
   */
  private extractGitHubReadme(doc: Document): string | null {
    try {
      console.log("🐙 检测到 GitHub 页面，直接提取 README 内容...")

      // GitHub README 通常在以下选择器中
      const readmeSelectors = [
        'article[itemprop="text"]',
        ".markdown-body",
        "#readme .Box-body",
        '[data-target="readme-toc.content"]'
      ]

      for (const selector of readmeSelectors) {
        const readmeElement = doc.querySelector(selector)
        if (
          readmeElement &&
          readmeElement.textContent &&
          readmeElement.textContent.trim().length > 100
        ) {
          console.log(`✅ GitHub README 区域找到，选择器: ${selector}`)
          console.log(
            `📄 README 原始文本长度: ${readmeElement.textContent.length}`
          )

          // 直接转换为 Markdown
          const markdown = this.turndownService.turndown(
            readmeElement as HTMLElement
          )
          console.log(`📝 README Markdown 长度: ${markdown.length}`)
          return markdown
        }
      }

      console.log("❌ GitHub README 未找到")
      return null
    } catch (error) {
      console.error("❌ GitHub README 提取失败:", error)
      return null
    }
  }

  /**
   * 从 HTML 内容中提取正文并转换为 Markdown
   */
  async extractFromHTML(
    html: string,
    url: string
  ): Promise<ExtractedContent | null> {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")

      let contentMarkdown = ""
      let title = ""

      // GitHub 页面特殊处理：直接提取 README
      if (this.isGitHubProjectPage(url)) {
        console.log("🐙 GitHub 项目页面，直接提取 README...")
        contentMarkdown = this.extractGitHubReadme(doc) || ""

        if (contentMarkdown) {
          console.log("✅ GitHub README 提取成功")
        } else {
          console.log("❌ GitHub README 提取失败，回退到 Readability.js")
        }
      }

      // 如果不是 GitHub 或 GitHub README 提取失败，使用 Readability
      if (!contentMarkdown) {
        console.log("📖 使用 Readability.js 提取内容...")

        const readability = new Readability(doc, {
          debug: false,
          maxElemsToParse: 0,
          nbTopCandidates: 5,
          charThreshold: 500,
          classesToPreserve: ["caption", "MathJax", "mathjax"],
          keepClasses: false
        })

        const article = readability.parse()

        if (!article) {
          throw new Error("Readability 未能提取到有效内容")
        }

        contentMarkdown = this.turndownService.turndown(article.content)
      }

      // 从 Markdown 内容中提取标题
      title = extractTitleFromMarkdown(contentMarkdown)

      console.log("=== 抓取结果 ===")
      console.log("提取的标题:", title)
      console.log("URL:", url)
      console.log("是否为 GitHub 页面:", this.isGitHubProjectPage(url))
      console.log(
        "使用方式:",
        this.isGitHubProjectPage(url) && contentMarkdown
          ? "GitHub README 直接提取"
          : "Readability.js"
      )
      console.log("Markdown 内容长度:", contentMarkdown.length)
      console.log(
        "Markdown 内容预览:",
        contentMarkdown.substring(0, 500) +
          (contentMarkdown.length > 500 ? "..." : "")
      )
      console.log("================")

      return {
        title,
        content: contentMarkdown,
        url
      }
    } catch (error) {
      console.error("网页内容提取失败:", error)
      throw new Error(
        `提取失败: ${error instanceof Error ? error.message : "未知错误"}`
      )
    }
  }

  /**
   * 从当前标签页抓取内容
   */
  async extractFromCurrentTab(): Promise<ExtractedContent | null> {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (!tab.url) {
        throw new Error("无法获取当前页面URL")
      }

      if (
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://")
      ) {
        throw new Error("不支持抓取浏览器内部页面")
      }

      if (tab.url.startsWith("file://")) {
        throw new Error("不支持抓取本地文件")
      }

      if (!tab.id) {
        throw new Error("无法获取标签页ID")
      }

      // 定义要注入的函数
      const getPageHTML = () => {
        return document.documentElement.outerHTML
      }

      console.log("开始执行脚本注入，标签页ID:", tab.id)

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getPageHTML
      })

      console.log("脚本执行结果:", results)

      if (!results || !results[0] || !results[0].result) {
        console.error("脚本执行失败，详细信息:", {
          hasResults: !!results,
          resultsLength: results?.length,
          firstResult: results?.[0],
          hasResult: !!results?.[0]?.result
        })
        throw new Error("无法获取页面内容")
      }

      const html = results[0].result
      return await this.extractFromHTML(html, tab.url)
    } catch (error) {
      console.error("抓取当前标签页失败:", error)
      throw error
    }
  }
}

export const webContentExtractor = new WebContentExtractor()
