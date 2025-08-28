# 快速启动指南

## 🚀 立即开始

### 1. 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 2. 启动开发环境
```bash
# 使用 pnpm (推荐)
pnpm dev

# 或使用 npm
npm run dev
```

**注意**: 如果使用pnpm遇到Electron安装问题，运行以下命令：
```bash
pnpm config set enable-pre-post-scripts true
pnpm rebuild electron
```

应用会自动打开，包含以下功能：

## 📱 主要功能

### 🔤 字符串处理 (你的刚需功能)
- **一键处理AI服务器文本**: 自动去除 `\r\n`、`\t` 等转义字符
- **Markdown格式化**: 将转义的markdown转换为可读格式
- **实时预览**: 处理后的markdown内容实时预览
- **快捷操作**: Cmd+V粘贴，Cmd+C复制

#### 使用示例：
```
输入: "# 标题\n\n这是一段**加粗**文本。\n\n- 列表项1\n- 列表项2"
输出: # 标题

这是一段**加粗**文本。

- 列表项1
- 列表项2
```

### 🔐 编码转换
- Base64编解码
- URL编解码
- HTML实体编解码
- 批量预览所有格式

### 🔑 哈希计算
- MD5、SHA1、SHA256、SHA512
- 自动计算模式
- 哈希值验证
- 批量导出

### 📋 JSON工具
- 格式化美化
- 压缩优化
- 语法验证
- 结构分析
- 路径查看器

### ⏰ 时间转换
- 时间戳转日期
- 日期转时间戳
- 批量转换
- 多时区显示

### 🎨 颜色工具
- 多格式转换 (HEX/RGB/HSL/HSV)
- 智能调色板生成
- 颜色分析
- CSS渐变生成器

## ⌨️ 快捷键

- `Cmd/Ctrl + V`: 粘贴内容
- `Cmd/Ctrl + C`: 复制结果
- `Cmd/Ctrl + A`: 全选
- `ESC`: 清空内容

## 🎯 使用技巧

1. **字符串处理最佳实践**:
   - 从AI对话复制文本后，直接粘贴到输入框
   - 点击"格式化Markdown"一键处理
   - 查看预览确认效果
   - 一键复制处理后的文本

2. **多工具协作**:
   - 侧边栏收藏常用工具
   - 最近使用记录快速访问
   - 深色模式护眼

3. **批量处理**:
   - 时间转换支持批量输入
   - 哈希计算可导出文件
   - JSON工具支持大文件

## 🔧 自定义配置

应用支持：
- 自动主题切换
- 侧边栏折叠
- 历史记录保存
- 收藏工具管理

## 📦 构建发布

```bash
# 构建前端
pnpm build-only  # 或 npm run build-only

# 构建桌面应用
pnpm build       # 或 npm run build
```

## 🐛 常见问题

**Q: 应用启动失败？**
A: 确保Node.js版本 >= 16，重新安装依赖: 
```bash
rm -rf node_modules .pnpm-lock.yaml package-lock.json
pnpm install  # 或 npm install
```

**Q: pnpm下Electron安装失败？**
A: 运行以下命令解决：
```bash
pnpm config set enable-pre-post-scripts true
pnpm rebuild electron
```

**Q: 字符串处理不正确？**
A: 检查输入文本格式，确保是从AI服务器直接复制的原始文本

**Q: 哈希计算结果不对？**
A: 确认输入文本没有多余的空格或换行符

**Q: PostCSS配置错误？**
A: 确保使用CommonJS语法，配置文件应使用 `module.exports` 而不是 `export default`

---

**享受高效的开发体验！** 🎉
