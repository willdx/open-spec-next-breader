## ADDED Requirements

### Requirement: 自定义Popup页面

扩展程序 SHALL 提供一个功能完整的自定义popup页面，作为用户访问扩展功能的主要入口。

#### Scenario: Popup页面功能展示

- **WHEN** 用户点击浏览器扩展图标
- **THEN** 显示包含以下功能的popup界面：
  - 文档库中的文档数量统计
  - 上次阅读文档记录（可点击跳转）
  - 抓取当前网页内容按钮
  - 手动输入Markdown内容按钮

### Requirement: 文档统计显示

Popup页面 SHALL 显示当前文档库中保存的文档数量。

#### Scenario: 显示文档数量

- **WHEN** popup页面加载时
- **THEN** 在页面顶部显示"文档库：X个文档"的统计信息
- **AND** 点击统计信息时显示Alert占位提示

### Requirement: 阅读历史记录

Popup页面 SHALL 显示用户最近阅读的文档记录。

#### Scenario: 显示上次阅读

- **WHEN** popup页面加载时
- **THEN** 显示"上次阅读：[文档标题]"的记录
- **AND** 点击阅读记录时显示Alert占位提示跳转功能

### Requirement: 网页内容抓取

Popup页面 SHALL 提供抓取当前浏览器标签页内容的功能入口。

#### Scenario: 抓取网页按钮

- **WHEN** 用户点击"抓取网页"按钮
- **THEN** 显示Alert占位提示抓取功能
- **AND** 按钮样式符合项目设计规范

### Requirement: 手动内容输入

Popup页面 SHALL 提供手动输入Markdown内容的功能入口。

#### Scenario: 手动输入按钮

- **WHEN** 用户点击"手动输入"按钮
- **THEN** 显示Alert占位提示输入功能
- **AND** 按钮样式符合项目设计规范
