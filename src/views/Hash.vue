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
                placeholder="输入需要计算哈希的文本..."
                class="textarea-input"
              ></textarea>
              <div class="stats-container">
                <span class="tag tag-primary">{{ inputText.length }} 字符</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">哈希结果</div>
          </div>
          <div class="tool-card-body">
            <div v-if="results.length > 0" class="hash-results">
              <div v-for="result in results" :key="result.type" class="hash-result">
                <div class="hash-label">{{ result.type.toUpperCase() }}</div>
                <div class="hash-content">
                  <input :value="result.value" readonly class="hash-value" />
                  <button class="btn-secondary" @click="copyHash(result.value)">复制</button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">🔐</div>
              <div class="empty-title">请输入文本</div>
              <div class="empty-description">选择下方的哈希算法开始计算</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-container">
        <div class="actions-grid">
          <div class="action-group">
            <h4 class="action-title">哈希算法</h4>
            <button class="btn-primary" @click="calculateHash('md5')" :disabled="!inputText">MD5</button>
            <button class="btn-primary" @click="calculateHash('sha1')" :disabled="!inputText">SHA1</button>
            <button class="btn-primary" @click="calculateHash('sha256')" :disabled="!inputText">SHA256</button>
            <button class="btn-primary" @click="calculateHash('sha512')" :disabled="!inputText">SHA512</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import CryptoJS from 'crypto-js'

const inputText = ref('')
const results = ref<Array<{type: string, value: string}>>([])

const clearInput = () => {
  inputText.value = ''
  results.value = []
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

const calculateHash = (type: string) => {
  if (!inputText.value.trim()) return
  
  try {
    let hash = ''
    switch (type) {
      case 'md5':
        hash = CryptoJS.MD5(inputText.value).toString()
        break
      case 'sha1':
        hash = CryptoJS.SHA1(inputText.value).toString()
        break
      case 'sha256':
        hash = CryptoJS.SHA256(inputText.value).toString()
        break
      case 'sha512':
        hash = CryptoJS.SHA512(inputText.value).toString()
        break
    }
    
    const existingIndex = results.value.findIndex(r => r.type === type)
    if (existingIndex >= 0) {
      results.value[existingIndex].value = hash
    } else {
      results.value.push({ type, value: hash })
    }
    
    message.success(`${type.toUpperCase()} 计算完成`)
  } catch (error) {
    message.error('计算失败')
  }
}

const copyHash = async (hash: string) => {
  try {
    await navigator.clipboard.writeText(hash)
    message.success('哈希值已复制')
  } catch {
    message.error('复制失败')
  }
}
</script>

<style scoped>
.hash-results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.hash-result {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.hash-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hash-content {
  display: flex;
  gap: var(--spacing-sm);
}

.hash-value {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  word-break: break-all;
}
</style>