<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 输入输出区域 -->
      <div class="input-output-container">
        <!-- 输入区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">
              输入文本
              <div class="button-group">
                <button class="btn-secondary" @click="clearInput" :disabled="!inputText">清空</button>
                <button class="btn-secondary" @click="pasteText">粘贴</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div class="textarea-container">
              <textarea
                v-model="inputText"
                placeholder="请输入或粘贴需要处理的文本..."
                class="textarea-input"
              ></textarea>
              <div class="stats-container">
                <span class="tag tag-primary">{{ inputText.length }} 字符</span>
                <span class="tag tag-success">{{ inputText.split('\n').length }} 行</span>
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
                <button class="btn-primary" @click="copyResult" :disabled="!outputText">复制</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div class="textarea-container">
              <textarea
                v-model="outputText"
                placeholder="处理结果将显示在这里..."
                readonly
                class="textarea-output"
              ></textarea>
              <div class="stats-container" v-if="outputText">
                <span class="tag tag-success">处理完成</span>
                <span class="tag tag-info">{{ outputText.length }} 字符</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-container">
        <div class="actions-grid">
          <div class="action-group">
            <h4 class="action-title">格式处理</h4>
            <button class="btn-primary" @click="processMarkdown" :disabled="!inputText">格式化 Markdown</button>
            <button class="btn-secondary" @click="processEscapeMarkdown" :disabled="!inputText">转义 Markdown</button>
          </div>

          <div class="action-group">
            <h4 class="action-title">编码转换</h4>
            <button class="btn-primary" @click="processBase64Encode" :disabled="!inputText">Base64 编码</button>
            <button class="btn-secondary" @click="processBase64Decode" :disabled="!inputText">Base64 解码</button>
          </div>

          <div class="action-group">
            <h4 class="action-title">URL 处理</h4>
            <button class="btn-primary" @click="processUrlEncode" :disabled="!inputText">URL 编码</button>
            <button class="btn-secondary" @click="processUrlDecode" :disabled="!inputText">URL 解码</button>
          </div>

          <div class="action-group">
            <h4 class="action-title">JSON 处理</h4>
            <button class="btn-primary" @click="processJsonEscape" :disabled="!inputText">JSON 转义</button>
            <button class="btn-secondary" @click="processJsonUnescape" :disabled="!inputText">JSON 反转义</button>
          </div>

          <div class="action-group">
            <h4 class="action-title">HTML 处理</h4>
            <button class="btn-primary" @click="processHtmlEncode" :disabled="!inputText">HTML 编码</button>
            <button class="btn-secondary" @click="processHtmlDecode" :disabled="!inputText">HTML 解码</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'

const inputText = ref('')
const outputText = ref('')

// 通用处理函数
const processText = async (operation: string) => {
  if (!inputText.value.trim()) {
    message.warning('请先输入文本')
    return
  }

  try {
    // 检查是否在Electron环境
    if (window.electronAPI) {
      const result = await window.electronAPI.processString(inputText.value, operation)
      outputText.value = result
      message.success('处理完成')
    } else {
      // 浏览器环境的备选实现
      let result = ''
      switch (operation) {
        case 'format-markdown':
        case 'markdown':
          result = inputText.value
            .replace(/\\r\\n/g, '\n')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\\"/g, '"')
            .replace(/\\\'/g, "'")
            .replace(/\\\\/g, '\\')
            .trim()
          break
        case 'base64-encode':
          result = btoa(unescape(encodeURIComponent(inputText.value)))
          break
        case 'base64-decode':
          result = decodeURIComponent(escape(atob(inputText.value)))
          break
        case 'url-encode':
          result = encodeURIComponent(inputText.value)
          break
        case 'url-decode':
          result = decodeURIComponent(inputText.value)
          break
        case 'html-encode':
          result = inputText.value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
          break
        case 'html-decode':
          const textarea = document.createElement('textarea')
          textarea.innerHTML = inputText.value
          result = textarea.value
          break
        case 'json-escape':
          result = JSON.stringify(inputText.value).slice(1, -1)
          break
        case 'json-unescape':
          result = JSON.parse('"' + inputText.value + '"')
          break
        default:
          throw new Error(`未知操作: ${operation}`)
      }
      outputText.value = result
      message.success('处理完成')
    }
  } catch (error: any) {
    message.error(`处理失败: ${error.message}`)
  }
}

// 具体处理方法
const processMarkdown = () => processText('markdown')
const processEscapeMarkdown = () => processText('escape-markdown')
const processBase64Encode = () => processText('base64-encode')
const processBase64Decode = () => processText('base64-decode')
const processUrlEncode = () => processText('url-encode')
const processUrlDecode = () => processText('url-decode')
const processJsonEscape = () => processText('json-escape')
const processJsonUnescape = () => processText('json-unescape')
const processHtmlEncode = () => processText('html-encode')
const processHtmlDecode = () => processText('html-decode')

// 清空输入
const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
}

// 粘贴文本
const pasteText = async () => {
  try {
    if (window.electronAPI) {
      const text = await window.electronAPI.clipboard.readText()
      inputText.value = text
      message.success('文本已粘贴')
    } else {
      const text = await navigator.clipboard.readText()
      inputText.value = text
      message.success('文本已粘贴')
    }
  } catch {
    message.info('请手动粘贴文本（Ctrl+V）')
  }
}

// 复制结果
const copyResult = async () => {
  try {
    if (window.electronAPI) {
      await window.electronAPI.clipboard.writeText(outputText.value)
      message.success('结果已复制')
    } else {
      await navigator.clipboard.writeText(outputText.value)
      message.success('结果已复制')
    }
  } catch {
    message.error('复制失败')
  }
}
</script>