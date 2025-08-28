<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 输入输出区域 -->
      <div class="input-output-container">
        <!-- 输入区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">
              JSON 输入
              <div class="button-group">
                <button class="btn-secondary" @click="clearAll" :disabled="!inputJson">清空</button>
                <button class="btn-secondary" @click="pasteJson">粘贴</button>
                <button class="btn-secondary" @click="loadSample">示例</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div class="textarea-container">
              <textarea
                v-model="inputJson"
                placeholder="输入或粘贴JSON数据..."
                class="textarea-input"
              ></textarea>
              <div class="stats-container">
                <span class="tag tag-primary">{{ inputJson.length }} 字符</span>
                <span class="tag" :class="isValidJson ? 'tag-success' : 'tag-error'">
                  {{ isValidJson ? '格式正确' : '格式错误' }}
                </span>
                <span class="tag tag-info" v-if="isValidJson">{{ jsonSize }} 大小</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输出区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">
              处理结果
              <div class="button-group">
                <button class="btn-primary" @click="copyResult" :disabled="!outputJson">复制</button>
                <button class="btn-secondary" @click="downloadResult" :disabled="!outputJson">下载</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div class="textarea-container">
              <textarea
                v-model="outputJson"
                placeholder="处理结果将显示在这里..."
                readonly
                class="textarea-output"
              ></textarea>
              <div class="stats-container" v-if="outputJson">
                <span class="tag tag-success">处理完成</span>
                <span class="tag tag-info">{{ outputJson.length }} 字符</span>
                <span class="tag tag-warning">{{ compressionRatio }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-container">
        <div class="actions-grid">
          <div class="action-group">
            <h4 class="action-title">格式化</h4>
            <button class="btn-primary" @click="formatJson" :disabled="!inputJson">格式化</button>
            <button class="btn-secondary" @click="minifyJson" :disabled="!inputJson">压缩</button>
          </div>

          <div class="action-group">
            <h4 class="action-title">验证修复</h4>
            <button class="btn-primary" @click="validateJson" :disabled="!inputJson">验证格式</button>
            <button class="btn-secondary" @click="repairJson" :disabled="!inputJson">智能修复</button>
          </div>

          <div class="action-group">
            <h4 class="action-title">转换工具</h4>
            <button class="btn-primary" @click="escapeJson" :disabled="!inputJson">转义字符串</button>
            <button class="btn-secondary" @click="unescapeJson" :disabled="!inputJson">反转义</button>
          </div>

          <div class="action-group">
            <h4 class="action-title">分析工具</h4>
            <button class="btn-primary" @click="analyzeJson" :disabled="!isValidJson">结构分析</button>
            <button class="btn-secondary" @click="extractKeys" :disabled="!isValidJson">提取键名</button>
          </div>
        </div>
      </div>

      <!-- JSON分析结果 -->
      <div v-if="analysisResult" class="analysis-container">
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">JSON 分析结果</div>
          </div>
          <div class="tool-card-body">
            <div class="analysis-grid">
              <div class="analysis-item">
                <div class="analysis-label">对象数量</div>
                <div class="analysis-value">{{ analysisResult.objects }}</div>
              </div>
              <div class="analysis-item">
                <div class="analysis-label">数组数量</div>
                <div class="analysis-value">{{ analysisResult.arrays }}</div>
              </div>
              <div class="analysis-item">
                <div class="analysis-label">键的数量</div>
                <div class="analysis-value">{{ analysisResult.keys }}</div>
              </div>
              <div class="analysis-item">
                <div class="analysis-label">最大深度</div>
                <div class="analysis-value">{{ analysisResult.depth }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

const inputJson = ref('')
const outputJson = ref('')
const analysisResult = ref<any>(null)

// 验证JSON格式
const isValidJson = computed(() => {
  if (!inputJson.value.trim()) return false
  try {
    JSON.parse(inputJson.value)
    return true
  } catch {
    return false
  }
})

// 计算JSON大小
const jsonSize = computed(() => {
  if (!isValidJson.value) return ''
  const bytes = new TextEncoder().encode(inputJson.value).length
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
})

// 压缩比率
const compressionRatio = computed(() => {
  if (!inputJson.value || !outputJson.value) return ''
  const ratio = ((inputJson.value.length - outputJson.value.length) / inputJson.value.length * 100)
  if (ratio > 0) return `压缩 ${ratio.toFixed(1)}%`
  if (ratio < 0) return `扩展 ${Math.abs(ratio).toFixed(1)}%`
  return '无变化'
})

// 清空所有内容
const clearAll = () => {
  inputJson.value = ''
  outputJson.value = ''
  analysisResult.value = null
}

// 粘贴JSON
const pasteJson = async () => {
  try {
    if (window.electronAPI) {
      const text = await window.electronAPI.clipboard.readText()
      inputJson.value = text
    } else {
      const text = await navigator.clipboard.readText()
      inputJson.value = text
    }
    message.success('JSON已粘贴')
  } catch {
    message.info('请手动粘贴JSON')
  }
}

// 加载示例
const loadSample = () => {
  inputJson.value = JSON.stringify({
    "name": "开发工具集合",
    "version": "1.0.0",
    "description": "一个包含多种开发工具的桌面应用",
    "tools": [
      {
        "id": 1,
        "name": "JSON工具",
        "category": "数据处理",
        "features": ["格式化", "压缩", "验证", "修复"],
        "popular": true
      },
      {
        "id": 2,
        "name": "字符串处理",
        "category": "文本工具",
        "features": ["Markdown格式化", "编码转换", "Base64"],
        "popular": true
      }
    ],
    "config": {
      "theme": "auto",
      "language": "zh-CN",
      "autoSave": true,
      "advanced": {
        "enableCache": true,
        "cacheSize": "100MB",
        "debug": false
      }
    },
    "statistics": {
      "totalUsers": 15420,
      "dailyActive": 3240,
      "rating": 4.8,
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  }, null, 2)
  message.success('示例JSON已加载')
}

// 复制结果
const copyResult = async () => {
  try {
    if (window.electronAPI) {
      await window.electronAPI.clipboard.writeText(outputJson.value)
    } else {
      await navigator.clipboard.writeText(outputJson.value)
    }
    message.success('结果已复制')
  } catch {
    message.error('复制失败')
  }
}

// 下载结果
const downloadResult = () => {
  const blob = new Blob([outputJson.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'result.json'
  link.click()
  URL.revokeObjectURL(url)
  message.success('文件已下载')
}

// 格式化JSON
const formatJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed, null, 2)
    message.success('JSON格式化完成')
  } catch (error: any) {
    // 尝试智能修复
    const repaired = cleanAndValidateJson(inputJson.value)
    if (repaired) {
      try {
        const parsed = JSON.parse(repaired)
        outputJson.value = JSON.stringify(parsed, null, 2)
        message.warning('已自动修复并格式化JSON')
      } catch {
        outputJson.value = `格式化失败: ${error.message}`
        message.error('JSON格式错误')
      }
    } else {
      outputJson.value = `格式化失败: ${error.message}`
      message.error('JSON格式错误')
    }
  }
}

// 压缩JSON
const minifyJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed)
    message.success('JSON压缩完成')
  } catch (error: any) {
    message.error(`压缩失败: ${error.message}`)
  }
}

// 验证JSON
const validateJson = () => {
  try {
    JSON.parse(inputJson.value)
    outputJson.value = '✅ JSON格式正确\n\n详细信息:\n- 语法正确\n- 结构完整\n- 可以安全解析'
    message.success('JSON格式验证通过')
  } catch (error: any) {
    outputJson.value = `❌ JSON格式错误\n\n错误信息: ${error.message}\n\n建议:\n1. 检查是否有多余的逗号\n2. 确保所有字符串都用双引号\n3. 检查括号是否匹配\n4. 尝试使用智能修复功能`
    message.error('JSON格式验证失败')
  }
}

// 智能修复JSON
const repairJson = () => {
  const repaired = cleanAndValidateJson(inputJson.value)
  if (repaired) {
    outputJson.value = repaired
    message.success('JSON智能修复完成')
  } else {
    outputJson.value = '无法自动修复此JSON，请手动检查以下问题:\n\n1. 键名是否用双引号包围\n2. 是否有多余的逗号\n3. 字符串是否正确转义\n4. 括号是否正确匹配'
    message.error('JSON智能修复失败')
  }
}

// 转义JSON
const escapeJson = () => {
  try {
    outputJson.value = JSON.stringify(inputJson.value)
    message.success('JSON转义完成')
  } catch (error: any) {
    message.error(`转义失败: ${error.message}`)
  }
}

// 反转义JSON
const unescapeJson = () => {
  try {
    outputJson.value = JSON.parse(inputJson.value)
    message.success('JSON反转义完成')
  } catch (error: any) {
    message.error(`反转义失败: ${error.message}`)
  }
}

// 分析JSON结构
const analyzeJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    const analysis = analyzeJsonStructure(parsed)
    analysisResult.value = analysis
    
    outputJson.value = `JSON结构分析报告:

📊 基本统计:
- 对象数量: ${analysis.objects}
- 数组数量: ${analysis.arrays}  
- 键的总数: ${analysis.keys}
- 最大嵌套深度: ${analysis.depth}
- 数据类型分布: ${JSON.stringify(analysis.types, null, 2)}

🔍 详细信息:
- 总节点数: ${analysis.totalNodes}
- 字符串值: ${analysis.stringValues}
- 数字值: ${analysis.numberValues}
- 布尔值: ${analysis.booleanValues}
- 空值: ${analysis.nullValues}`

    message.success('JSON结构分析完成')
  } catch (error: any) {
    message.error(`分析失败: ${error.message}`)
  }
}

// 提取所有键名
const extractKeys = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    const keys = extractAllKeys(parsed)
    const uniqueKeys = [...new Set(keys)].sort()
    
    outputJson.value = `JSON键名提取结果:

📋 所有唯一键名 (${uniqueKeys.length}个):
${uniqueKeys.map(key => `- ${key}`).join('\n')}

📊 键名统计:
- 总键名数: ${keys.length}
- 唯一键名: ${uniqueKeys.length}
- 重复率: ${((keys.length - uniqueKeys.length) / keys.length * 100).toFixed(1)}%

🔗 键名路径:
${generateKeyPaths(parsed).map(path => `- ${path}`).join('\n')}`

    message.success('JSON键名提取完成')
  } catch (error: any) {
    message.error(`提取失败: ${error.message}`)
  }
}

// 辅助函数
const cleanAndValidateJson = (jsonString: string): string | null => {
  if (!jsonString || typeof jsonString !== 'string') return null

  let cleaned = jsonString.trim()
  
  // 移除BOM
  if (cleaned.charCodeAt(0) === 0xFEFF) {
    cleaned = cleaned.slice(1)
  }

  // 常见修复
  const fixes = [
    { pattern: /'/g, replacement: '"' },
    { pattern: /(\w+):/g, replacement: '"$1":' },
    { pattern: /,(\s*[}\]])/g, replacement: '$1' },
    { pattern: /,{2,}/g, replacement: ',' }
  ]

  for (const fix of fixes) {
    const original = cleaned
    cleaned = cleaned.replace(fix.pattern, fix.replacement)
    
    try {
      JSON.parse(cleaned)
      return cleaned
    } catch {
      cleaned = original
    }
  }

  return null
}

const analyzeJsonStructure = (obj: any, depth = 0): any => {
  const result = {
    objects: 0,
    arrays: 0,
    keys: 0,
    depth: depth,
    types: {} as Record<string, number>,
    totalNodes: 0,
    stringValues: 0,
    numberValues: 0,
    booleanValues: 0,
    nullValues: 0
  }

  const analyze = (item: any, currentDepth: number) => {
    result.totalNodes++
    result.depth = Math.max(result.depth, currentDepth)
    
    const type = Array.isArray(item) ? 'array' : typeof item
    result.types[type] = (result.types[type] || 0) + 1
    
    if (type === 'string') result.stringValues++
    else if (type === 'number') result.numberValues++
    else if (type === 'boolean') result.booleanValues++
    else if (item === null) result.nullValues++
    
    if (Array.isArray(item)) {
      result.arrays++
      item.forEach(element => analyze(element, currentDepth + 1))
    } else if (item && typeof item === 'object') {
      result.objects++
      Object.keys(item).forEach(key => {
        result.keys++
        analyze(item[key], currentDepth + 1)
      })
    }
  }

  analyze(obj, 0)
  return result
}

const extractAllKeys = (obj: any): string[] => {
  const keys: string[] = []
  
  const extract = (item: any) => {
    if (Array.isArray(item)) {
      item.forEach(extract)
    } else if (item && typeof item === 'object') {
      Object.keys(item).forEach(key => {
        keys.push(key)
        extract(item[key])
      })
    }
  }
  
  extract(obj)
  return keys
}

const generateKeyPaths = (obj: any, prefix = ''): string[] => {
  const paths: string[] = []
  
  const generate = (item: any, path: string) => {
    if (Array.isArray(item)) {
      paths.push(`${path}[]`)
      if (item.length > 0) {
        generate(item[0], `${path}[0]`)
      }
    } else if (item && typeof item === 'object') {
      Object.keys(item).forEach(key => {
        const newPath = path ? `${path}.${key}` : key
        paths.push(newPath)
        generate(item[key], newPath)
      })
    }
  }
  
  generate(obj, prefix)
  return paths.slice(0, 20) // 限制显示数量
}
</script>

<style scoped>
.analysis-container {
  margin-top: var(--spacing-lg);
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.analysis-item {
  text-align: center;
  padding: var(--spacing-md);
  background: var(--info-bg);
  border: 1px solid var(--info-light);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.analysis-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.analysis-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-xs);
}

.analysis-value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--info-color);
  font-family: var(--font-mono);
}
</style>