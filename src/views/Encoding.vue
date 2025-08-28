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
                placeholder="输入需要转换的文本..."
                class="textarea-input"
              ></textarea>
              <div class="stats-container">
                <span class="tag tag-primary">{{ inputText.length }} 字符</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输出区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">
              转换结果
              <div class="button-group">
                <button class="btn-primary" @click="copyResult" :disabled="!outputText">复制</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div class="textarea-container">
              <textarea
                v-model="outputText"
                placeholder="转换结果将显示在这里..."
                readonly
                class="textarea-output"
              ></textarea>
              <div class="stats-container" v-if="outputText">
                <span class="tag tag-success">转换完成</span>
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
            <h4 class="action-title">Base64</h4>
            <button class="btn-primary" @click="base64Encode" :disabled="!inputText">编码</button>
            <button class="btn-secondary" @click="base64Decode" :disabled="!inputText">解码</button>
          </div>

          <div class="action-group">
            <h4 class="action-title">URL</h4>
            <button class="btn-primary" @click="urlEncode" :disabled="!inputText">编码</button>
            <button class="btn-secondary" @click="urlDecode" :disabled="!inputText">解码</button>
          </div>

          <div class="action-group">
            <h4 class="action-title">HTML</h4>
            <button class="btn-primary" @click="htmlEncode" :disabled="!inputText">编码</button>
            <button class="btn-secondary" @click="htmlDecode" :disabled="!inputText">解码</button>
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

const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
}

const pasteText = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    message.success('文本已粘贴')
  } catch {
    message.info('请手动粘贴文本')
  }
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(outputText.value)
    message.success('结果已复制')
  } catch {
    message.error('复制失败')
  }
}

const base64Encode = () => {
  try {
    outputText.value = btoa(unescape(encodeURIComponent(inputText.value)))
    message.success('Base64编码完成')
  } catch {
    message.error('编码失败')
  }
}

const base64Decode = () => {
  try {
    outputText.value = decodeURIComponent(escape(atob(inputText.value)))
    message.success('Base64解码完成')
  } catch {
    message.error('解码失败')
  }
}

const urlEncode = () => {
  try {
    outputText.value = encodeURIComponent(inputText.value)
    message.success('URL编码完成')
  } catch {
    message.error('编码失败')
  }
}

const urlDecode = () => {
  try {
    outputText.value = decodeURIComponent(inputText.value)
    message.success('URL解码完成')
  } catch {
    message.error('解码失败')
  }
}

const htmlEncode = () => {
  try {
    outputText.value = inputText.value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
    message.success('HTML编码完成')
  } catch {
    message.error('编码失败')
  }
}

const htmlDecode = () => {
  try {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = inputText.value
    outputText.value = textarea.value
    message.success('HTML解码完成')
  } catch {
    message.error('解码失败')
  }
}
</script>