<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 当前时间和转换工具 -->
      <div class="input-output-container">
        <!-- 当前时间 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">当前时间</div>
          </div>
          <div class="tool-card-body">
            <div class="current-time">
              <div class="time-item">
                <label class="time-label">时间戳 (秒)</label>
                <div class="time-value">{{ currentTimestamp }}</div>
              </div>
              <div class="time-item">
                <label class="time-label">时间戳 (毫秒)</label>
                <div class="time-value">{{ currentTimestamp * 1000 }}</div>
              </div>
              <div class="time-item">
                <label class="time-label">当前时间</label>
                <div class="time-value">{{ currentDateTime }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 转换工具 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">转换工具</div>
          </div>
          <div class="tool-card-body">
            <div class="convert-section">
              <div class="input-group">
                <label class="input-label">输入时间戳或日期时间</label>
                <input
                  v-model="inputValue"
                  placeholder="输入时间戳或日期时间"
                  class="convert-input"
                />
              </div>
              
              <button class="btn-primary" @click="convert" :disabled="!inputValue" style="width: 100%;">
                转换
              </button>
              
              <div v-if="result" class="result-container result-success">
                <div class="result-label">转换结果</div>
                <div class="result-value">{{ result }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTimestamp = ref(0)
const currentDateTime = ref('')
const inputValue = ref('')
const result = ref('')

let timer: number

const updateCurrentTime = () => {
  const now = new Date()
  currentTimestamp.value = Math.floor(now.getTime() / 1000)
  currentDateTime.value = now.toLocaleString('zh-CN')
}

const convert = () => {
  if (!inputValue.value) return
  
  const value = inputValue.value.trim()
  
  // 尝试作为时间戳解析
  if (/^\d+$/.test(value)) {
    const timestamp = parseInt(value)
    const date = new Date(timestamp.toString().length === 10 ? timestamp * 1000 : timestamp)
    result.value = `转换结果: ${date.toLocaleString('zh-CN')}`
  } else {
    // 尝试作为日期解析
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      result.value = `转换结果: ${Math.floor(date.getTime() / 1000)} (秒) / ${date.getTime()} (毫秒)`
    } else {
      result.value = '无效的日期格式'
    }
  }
}

onMounted(() => {
  updateCurrentTime()
  timer = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.current-time {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.time-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.time-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.time-value {
  padding: var(--spacing-md);
  background: var(--primary-bg);
  border: 1px solid var(--primary-light);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-base);
  color: var(--primary-color);
  font-weight: 600;
}

.convert-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.convert-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  transition: var(--transition-fast);
}

.convert-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}
</style>