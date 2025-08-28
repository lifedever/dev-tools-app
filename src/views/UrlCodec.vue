<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 输入输出区域 -->
      <div class="input-output-container">
        <!-- 输入区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">
              输入URL
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
                placeholder="输入URL..."
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
            <h4 class="action-title">URL 编码/解码</h4>
            <button class="btn-primary" @click="encode" :disabled="!inputText">编码</button>
            <button class="btn-secondary" @click="decode" :disabled="!inputText">解码</button>
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

const encode = () => {
  try {
    outputText.value = encodeURIComponent(inputText.value)
    message.success('URL编码完成')
  } catch {
    message.error('编码失败')
  }
}

const decode = () => {
  try {
    outputText.value = decodeURIComponent(inputText.value)
    message.success('URL解码完成')
  } catch {
    message.error('解码失败')
  }
}
</script>