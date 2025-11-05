/**
 * Storage 功能测试工具
 * 用于开发和测试阶段验证存储功能
 */
import { documentStorage } from '~services/document-storage';
import type { CreateDocumentInput } from '~types/document';

/**
 * 创建测试文档数据
 */
const createTestDocument = (index: number): CreateDocumentInput => ({
  title: `测试文档 ${index + 1}`,
  content: `# 测试文档 ${index + 1}\n\n这是第${index + 1}个测试文档的内容。\n\n## 章节1\n\n内容...\n\n## 章节2\n\n更多内容...`,
  source: 'manual',
});

/**
 * 测试所有storage功能
 */
export const testDocumentStorage = async (): Promise<void> => {
  console.log('🧪 开始测试文档存储功能...');

  try {
    // 1. 测试添加文档
    console.log('📝 测试添加文档...');
    const doc1 = await documentStorage.addDocument(createTestDocument(0));
    console.log('✅ 添加文档成功:', doc1.id);

    const doc2 = await documentStorage.addDocument({
      ...createTestDocument(1),
      source: 'web',
      sourceUrl: 'https://example.com',
    });
    console.log('✅ 添加网页文档成功:', doc2.id);

    // 2. 测试获取所有文档
    console.log('📚 测试获取所有文档...');
    const allDocs = await documentStorage.getDocuments();
    console.log(`✅ 获取到 ${allDocs.length} 个文档`);

    // 3. 测试文档数量
    console.log('🔢 测试文档数量...');
    const count = await documentStorage.getDocumentCount();
    console.log(`✅ 文档总数: ${count}`);

    // 4. 测试获取单个文档
    console.log('🔍 测试获取单个文档...');
    const singleDoc = await documentStorage.getDocument(doc1.id);
    console.log('✅ 获取单个文档成功:', singleDoc?.title);

    // 5. 测试更新文档
    console.log('✏️ 测试更新文档...');
    const updatedDoc = await documentStorage.updateDocument(doc1.id, {
      title: '更新后的标题',
      lastReadTime: Date.now(),
    });
    console.log('✅ 更新文档成功:', updatedDoc?.title);

    // 6. 测试最近阅读
    console.log('📖 测试最近阅读...');
    const lastRead = await documentStorage.getLastReadDocument();
    console.log('✅ 最近阅读文档:', lastRead?.title);

    // 7. 测试搜索功能
    console.log('🔍 测试搜索功能...');
    const searchResults = await documentStorage.searchDocuments('测试');
    console.log(`✅ 搜索结果: ${searchResults.length} 个文档`);

    // 8. 测试按来源筛选
    console.log('🏷️ 测试按来源筛选...');
    const manualDocs = await documentStorage.getDocumentsBySource('manual');
    const webDocs = await documentStorage.getDocumentsBySource('web');
    console.log(`✅ 手动文档: ${manualDocs.length} 个, 网页文档: ${webDocs.length} 个`);

    // 9. 测试删除文档
    console.log('🗑️ 测试删除文档...');
    const deleteSuccess = await documentStorage.deleteDocument(doc2.id);
    console.log('✅ 删除文档结果:', deleteSuccess);

    // 10. 测试清空所有文档
    console.log('💥 测试清空所有文档...');
    await documentStorage.clearAllDocuments();
    const finalCount = await documentStorage.getDocumentCount();
    console.log(`✅ 清空后文档数量: ${finalCount}`);

    console.log('🎉 所有测试通过！');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
};

/**
 * 创建示例数据（用于开发测试）
 */
export const createSampleData = async (): Promise<void> => {
  console.log('📝 创建示例数据...');

  const sampleDocuments: CreateDocumentInput[] = [
    {
      title: 'React 开发指南',
      content: `# React 开发指南

## 基础概念

React 是一个用于构建用户界面的 JavaScript 库。

## 组件与Props

### 函数组件

\`\`\`javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

### Class组件

\`\`\`javascript
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
\`\`\`

## State 与生命周期

### State

State 是组件的私有数据。

\`\`\`javascript
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}
\`\`\``,
      source: 'manual',
    },
    {
      title: 'JavaScript 高级特性',
      content: `# JavaScript 高级特性

## 闭包

闭包是指函数可以访问其外部作用域的变量。

\`\`\`javascript
function outerFunction(x) {
  return function innerFunction(y) {
    return x + y; // 访问外部变量 x
  };
}

const addFive = outerFunction(5);
console.log(addFive(3)); // 输出: 8
\`\`\`

## 原型链

JavaScript 中的继承通过原型链实现。

\`\`\`javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  console.log(this.name + ' makes a noise.');
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.speak = function() {
  console.log(this.name + ' barks.');
};
\`\`\``,
      source: 'manual',
      lastReadTime: Date.now() - 86400000, // 1天前
    },
    {
      title: '获取的网页内容示例',
      content: `# 网页标题

这是一个从网页抓取的内容示例。

## 主要内容

- 列表项 1
- 列表项 2
- 列表项 3

\`\`\`javascript
// 示例代码
function example() {
  console.log('Hello from web content!');
}
\`\`\``,
      source: 'web',
      sourceUrl: 'https://example.com/article',
      lastReadTime: Date.now() - 3600000, // 1小时前
    },
  ];

  for (const doc of sampleDocuments) {
    const newDoc = await documentStorage.addDocument(doc);
    console.log(`✅ 创建文档: ${newDoc.title}`);
  }

  console.log(`✅ 总共创建了 ${sampleDocuments.length} 个示例文档`);
};
