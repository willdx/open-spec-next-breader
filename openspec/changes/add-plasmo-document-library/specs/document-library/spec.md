## ADDED Requirements

### Requirement: Plasmo Side Panel 文档库

扩展程序 SHALL 提供一个基于 Plasmo side panel 的文档库管理界面，让用户能够查看、搜索、管理和访问所有保存的文档。

#### Scenario: Side Panel 文档库展示

- **WHEN** 用户打开浏览器侧边栏
- **THEN** 显示文档库界面，包含文档列表、搜索功能和操作按钮
- **AND** 界面适配侧边栏窄屏幕布局，支持垂直滚动

### Requirement: 文档列表展示

文档库 SHALL 以卡片形式展示所有保存的文档，并按修改时间倒序排列。

#### Scenario: 文档列表渲染

- **WHEN** 文档库加载时
- **THEN** 调用@plasmohq/storage获取文档数据
- **AND** 显示文档卡片，包含标题、内容预览、时间信息
- **AND** 按updatedAt字段倒序排列文档

#### Scenario: 空状态展示

- **WHEN** 文档库为空时
- **THEN** 显示空状态提示，引导用户添加文档

### Requirement: 文档搜索功能

文档库 SHALL 提供关键词搜索功能，支持按标题和内容搜索文档。

#### Scenario: 实时搜索

- **WHEN** 用户在搜索框输入关键词
- **THEN** 实时过滤文档列表，显示匹配的文档
- **AND** 高亮显示匹配的文档数量

#### Scenario: 搜索清空

- **WHEN** 用户清空搜索框
- **THEN** 显示完整的文档列表

### Requirement: 文档操作功能

文档库 SHALL 提供单文档删除和批量清空功能。

#### Scenario: 单文档删除

- **WHEN** 用户点击文档卡片的删除按钮
- **THEN** 显示确认对话框
- **AND** 确认后删除文档并更新列表

#### Scenario: 批量清空文档

- **WHEN** 用户点击"清空所有文档"按钮
- **THEN** 显示确认对话框
- **AND** 确认后删除所有文档并显示空状态

### Requirement: 文档访问跳转

文档库 SHALL 支持点击文档卡片跳转到主界面进行阅读和编辑。

#### Scenario: 文档卡片点击

- **WHEN** 用户点击文档卡片（非删除按钮区域）
- **THEN** 跳转到主界面阅读页面
- **AND** 传递文档ID参数，显示对应文档内容

### Requirement: Side Panel 权限配置

扩展程序 SHALL 正确配置 Chrome Side Panel API 权限。

#### Scenario: 权限自动配置

- **WHEN** 扩展构建时
- **THEN** manifest.json包含sidePanel权限
- **AND** Plasmo自动生成sidepanel.html页面

### Requirement: 响应式数据同步

Side Panel SHALL 实时响应存储数据的变化。

#### Scenario: 数据自动更新

- **WHEN** 其他组件添加、删除或更新文档时
- **THEN** Side Panel自动刷新文档列表
- **AND** 显示最新的文档数量和内容
