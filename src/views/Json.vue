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
            <h4 class="action-title">验证</h4>
            <button class="btn-primary" @click="validateJson" :disabled="!inputJson">验证格式</button>
            <button class="btn-secondary" @click="repairJson" :disabled="!inputJson">尝试修复</button>
          </div>

          <div class="action-group">
            <h4 class="action-title">转换</h4>
            <button class="btn-primary" @click="escapeJson" :disabled="!inputJson">转义</button>
            <button class="btn-secondary" @click="unescapeJson" :disabled="!inputJson">反转义</button>
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

// 清空所有内容
const clearAll = () => {
  inputJson.value = ''
  outputJson.value = ''
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
    "name": "开发工具",
    "version": "1.0.0",
    "tools": [
      { "name": "JSON工具", "type": "格式化" },
      { "name": "字符串处理", "type": "转换" }
    ],
    "config": {
      "theme": "light",
      "autoSave": true
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

// 格式化JSON
const formatJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed, null, 2)
    message.success('JSON格式化完成')
  } catch (error: any) {
    message.error(`格式化失败: ${error.message}`)
    // 尝试修复后再格式化
    const cleaned = cleanAndValidateJson(inputJson.value)
    if (cleaned) {
      try {
        const parsed = JSON.parse(cleaned)
        outputJson.value = JSON.stringify(parsed, null, 2)
        message.warning('已自动修复并格式化JSON')
      } catch {
        outputJson.value = `错误: ${error.message}`
      }
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
    outputJson.value = '✅ JSON格式正确'
    message.success('JSON格式验证通过')
  } catch (error: any) {
    outputJson.value = `❌ JSON格式错误: ${error.message}`
    message.error('JSON格式验证失败')
  }
}

// 修复JSON
const repairJson = () => {
  const repaired = cleanAndValidateJson(inputJson.value)
  if (repaired) {
    outputJson.value = repaired
    message.success('JSON修复完成')
  } else {
    outputJson.value = '无法自动修复此JSON'
    message.error('JSON修复失败')
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

// 清理和验证JSON的函数
const cleanAndValidateJson = (jsonString: string): string | null => {
  if (!jsonString || typeof jsonString !== 'string') {
    return null
  }

  let cleaned = jsonString.trim()

  // 移除可能的BOM
  if (cleaned.charCodeAt(0) === 0xFEFF) {
    cleaned = cleaned.slice(1)
  }

  // 替换常见的非标准引号
  cleaned = cleaned
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")

  // 尝试修复常见的JSON错误
  const fixes = [
    // 修复单引号
    { pattern: /'/g, replacement: '"' },
    // 修复未引用的键
    { pattern: /(\w+):/g, replacement: '"$1":' },
    // 修复尾随逗号
    { pattern: /,(\s*[}\]])/g, replacement: '$1' },
    // 修复多余的逗号
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
</script>