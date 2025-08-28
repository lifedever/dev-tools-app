<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 输入输出区域 -->
      <div class="input-output-container">
        <!-- 输入区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">
              代码输入
              <div class="button-group">
                <button class="btn-secondary" @click="clearInput" :disabled="!inputCode">清空</button>
                <button class="btn-secondary" @click="pasteCode">粘贴</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div class="config-section">
              <div class="config-item">
                <label class="config-label">语言类型</label>
                <select v-model="selectedParser" class="config-select">
                  <option value="babel">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="css">CSS</option>
                  <option value="scss">SCSS</option>
                  <option value="less">Less</option>
                  <option value="html">HTML</option>
                  <option value="vue">Vue</option>
                  <option value="json">JSON</option>
                  <option value="markdown">Markdown</option>
                  <option value="yaml">YAML</option>
                </select>
              </div>
            </div>
            
            <div class="textarea-container">
              <textarea
                v-model="inputCode"
                placeholder="输入需要格式化的代码..."
                class="textarea-input"
                style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace;"
              ></textarea>
              <div class="stats-container">
                <span class="tag tag-primary">{{ inputCode.length }} 字符</span>
                <span class="tag tag-info">{{ inputCode.split('\n').length }} 行</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输出区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">
              格式化结果
              <div class="button-group">
                <button class="btn-primary" @click="copyResult" :disabled="!outputCode">复制</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div class="textarea-container">
              <textarea
                v-model="outputCode"
                placeholder="格式化结果将显示在这里..."
                readonly
                class="textarea-output"
                style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace;"
              ></textarea>
              <div class="stats-container" v-if="outputCode">
                <span class="tag tag-success">格式化完成</span>
                <span class="tag tag-info">{{ outputCode.length }} 字符</span>
                <span class="tag tag-warning">{{ outputCode.split('\n').length }} 行</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-container">
        <div class="actions-grid">
          <div class="action-group">
            <h4 class="action-title">格式化选项</h4>
            <button class="btn-primary" @click="formatCode" :disabled="!inputCode || isLoading">
              {{ isLoading ? '格式化中...' : '格式化代码' }}
            </button>
          </div>

          <div class="action-group">
            <h4 class="action-title">快速格式化</h4>
            <button class="btn-secondary" @click="formatAsJS" :disabled="!inputCode">JavaScript</button>
            <button class="btn-secondary" @click="formatAsCSS" :disabled="!inputCode">CSS</button>
            <button class="btn-secondary" @click="formatAsHTML" :disabled="!inputCode">HTML</button>
            <button class="btn-secondary" @click="formatAsJSON" :disabled="!inputCode">JSON</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'

const inputCode = ref('')
const outputCode = ref('')
const selectedParser = ref('babel')
const isLoading = ref(false)

// 清空输入
const clearInput = () => {
  inputCode.value = ''
  outputCode.value = ''
}

// 粘贴代码
const pasteCode = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputCode.value = text
    message.success('代码已粘贴')
  } catch {
    message.info('请手动粘贴代码')
  }
}

// 复制结果
const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(outputCode.value)
    message.success('格式化结果已复制')
  } catch {
    message.error('复制失败')
  }
}

// 格式化代码（简化版本，不依赖Prettier库）
const formatCode = async () => {
  if (!inputCode.value.trim()) {
    message.warning('请先输入代码')
    return
  }

  isLoading.value = true
  
  try {
    let formatted = ''
    
    switch (selectedParser.value) {
      case 'json':
        try {
          const parsed = JSON.parse(inputCode.value)
          formatted = JSON.stringify(parsed, null, 2)
        } catch {
          formatted = inputCode.value
          message.warning('JSON格式不正确，返回原始代码')
        }
        break
        
      case 'css':
      case 'scss':
      case 'less':
        formatted = formatCSS(inputCode.value)
        break
        
      case 'html':
        formatted = formatHTML(inputCode.value)
        break
        
      default:
        formatted = formatJavaScript(inputCode.value)
        break
    }
    
    outputCode.value = formatted
    message.success('代码格式化完成')
  } catch (error: any) {
    message.error(`格式化失败: ${error.message}`)
    outputCode.value = inputCode.value
  } finally {
    isLoading.value = false
  }
}

// 简单的JavaScript格式化
const formatJavaScript = (code: string): string => {
  let formatted = code
    .replace(/;\s*\n/g, ';\n')
    .replace(/{\s*\n/g, '{\n')
    .replace(/}\s*\n/g, '}\n')
    .replace(/,\s*\n/g, ',\n')
  
  const lines = formatted.split('\n')
  let indentLevel = 0
  const indentSize = 2
  
  return lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    
    if (trimmed.includes('}')) indentLevel = Math.max(0, indentLevel - 1)
    const indented = ' '.repeat(indentLevel * indentSize) + trimmed
    if (trimmed.includes('{')) indentLevel++
    
    return indented
  }).join('\n')
}

// 简单的CSS格式化
const formatCSS = (code: string): string => {
  return code
    .replace(/\s*{\s*/g, ' {\n  ')
    .replace(/;\s*/g, ';\n  ')
    .replace(/\s*}\s*/g, '\n}\n')
    .replace(/,\s*/g, ',\n')
    .trim()
}

// 简单的HTML格式化
const formatHTML = (code: string): string => {
  let formatted = code
    .replace(/></g, '>\n<')
    .replace(/^\s+|\s+$/gm, '')
  
  const lines = formatted.split('\n')
  let indentLevel = 0
  const indentSize = 2
  
  return lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    
    if (trimmed.startsWith('</')) indentLevel = Math.max(0, indentLevel - 1)
    const indented = ' '.repeat(indentLevel * indentSize) + trimmed
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
      indentLevel++
    }
    
    return indented
  }).join('\n')
}

// 快速格式化选项
const formatAsJS = () => {
  selectedParser.value = 'babel'
  formatCode()
}

const formatAsCSS = () => {
  selectedParser.value = 'css'
  formatCode()
}

const formatAsHTML = () => {
  selectedParser.value = 'html'
  formatCode()
}

const formatAsJSON = () => {
  selectedParser.value = 'json'
  formatCode()
}
</script>

<style scoped>
.config-section {
  margin-bottom: var(--spacing-md);
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.config-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.config-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  background: var(--bg-primary);
  transition: var(--transition-fast);
}

.config-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}
</style>