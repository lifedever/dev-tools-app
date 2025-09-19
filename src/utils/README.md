# 工具函数

## 外部链接工具 (external-link.ts)

### 功能描述
提供在Electron应用中安全打开外部链接的功能，支持在默认浏览器中打开HTTP/HTTPS链接。

### 使用方法

```typescript
import { openExternalLink } from '@/utils/external-link';

// 打开外部链接
const handleLinkClick = async () => {
  try {
    await openExternalLink('https://github.com/lifedever');
  } catch (error) {
    console.error('打开链接失败:', error);
  }
};
```

### 在Vue组件中使用

```vue
<template>
  <a href="#" @click.prevent="handleClick">打开GitHub</a>
</template>

<script setup>
import { openExternalLink } from '@/utils/external-link';

const handleClick = async () => {
  await openExternalLink('https://github.com/lifedever');
};
</script>
```

### 特性

- ✅ 自动检测运行环境（Electron vs 浏览器）
- ✅ 在Electron中使用系统默认浏览器打开链接
- ✅ 在浏览器中使用新标签页打开链接
- ✅ URL格式验证（仅支持HTTP/HTTPS）
- ✅ 错误处理和备选方案
- ✅ TypeScript类型支持

### 安全性

- 仅支持HTTP和HTTPS协议的链接
- 在浏览器环境中使用 `noopener,noreferrer` 安全选项
- 防止恶意链接执行本地文件或其他协议

### 错误处理

函数会自动处理各种错误情况：
1. 无效的URL格式
2. Electron API不可用
3. 系统浏览器打开失败

在所有情况下，都会尝试使用备选方案（window.open）来确保链接能够正常打开。
