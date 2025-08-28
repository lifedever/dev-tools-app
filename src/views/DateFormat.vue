<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 日期转换 -->
      <div class="input-output-container">
        <!-- 输入区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">日期输入</div>
          </div>
          <div class="tool-card-body">
            <div class="input-section">
              <div class="input-group">
                <label class="input-label">选择或输入日期</label>
                <input
                  type="datetime-local"
                  v-model="selectedDateTime"
                  class="datetime-input"
                />
              </div>
              
              <div class="input-group">
                <label class="input-label">或输入时间戳</label>
                <input
                  type="number"
                  v-model="timestampInput"
                  placeholder="输入时间戳（秒或毫秒）"
                  class="timestamp-input"
                />
              </div>

              <button class="btn-primary" @click="convertFromTimestamp" :disabled="!timestampInput" style="width: 100%;">
                从时间戳转换
              </button>
            </div>
          </div>
        </div>

        <!-- 格式化结果 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">格式化结果</div>
          </div>
          <div class="tool-card-body">
            <div class="formats-list">
              <div v-for="format in dateFormats" :key="format.label" class="format-item">
                <div class="format-label">{{ format.label }}</div>
                <div class="format-value">
                  <input :value="format.value" readonly class="format-result" />
                  <button class="btn-secondary" @click="copyFormat(format.value)">复制</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'

const selectedDateTime = ref('')
const timestampInput = ref('')

// 获取当前日期作为默认值
const now = new Date()
const currentDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
selectedDateTime.value = currentDateTime

// 当前处理的日期对象
const currentDate = computed(() => {
  if (selectedDateTime.value) {
    return new Date(selectedDateTime.value)
  }
  return new Date()
})

// 日期格式化选项
const dateFormats = computed(() => {
  const date = currentDate.value
  
  return [
    {
      label: 'ISO 8601',
      value: date.toISOString()
    },
    {
      label: '中文完整格式',
      value: date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long'
      })
    },
    {
      label: '美式格式',
      value: date.toLocaleString('en-US')
    },
    {
      label: 'Unix 时间戳（秒）',
      value: Math.floor(date.getTime() / 1000).toString()
    },
    {
      label: 'Unix 时间戳（毫秒）',
      value: date.getTime().toString()
    },
    {
      label: 'RFC 2822',
      value: date.toUTCString()
    },
    {
      label: 'YYYY-MM-DD',
      value: date.toISOString().split('T')[0]
    },
    {
      label: 'HH:mm:ss',
      value: date.toTimeString().split(' ')[0]
    },
    {
      label: 'YYYY年MM月DD日',
      value: `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`
    },
    {
      label: 'MM/DD/YYYY',
      value: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`
    },
    {
      label: 'DD-MM-YYYY',
      value: `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
    },
    {
      label: '相对时间',
      value: getRelativeTime(date)
    }
  ]
})

// 从时间戳转换
const convertFromTimestamp = () => {
  if (!timestampInput.value) return
  
  let timestamp = parseInt(timestampInput.value)
  
  // 判断是秒还是毫秒
  if (timestamp.toString().length === 10) {
    timestamp *= 1000
  }
  
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) {
    message.error('无效的时间戳')
    return
  }
  
  // 转换为本地时间格式
  const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  selectedDateTime.value = localDateTime
  message.success('时间戳转换完成')
}

// 复制格式化结果
const copyFormat = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    message.success('已复制到剪贴板')
  } catch {
    message.error('复制失败')
  }
}

// 获取相对时间
const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (diff < 0) {
    const absDiff = Math.abs(diff)
    const futureSeconds = Math.floor(absDiff / 1000)
    const futureMinutes = Math.floor(futureSeconds / 60)
    const futureHours = Math.floor(futureMinutes / 60)
    const futureDays = Math.floor(futureHours / 24)
    
    if (futureDays > 0) return `${futureDays}天后`
    if (futureHours > 0) return `${futureHours}小时后`
    if (futureMinutes > 0) return `${futureMinutes}分钟后`
    return '即将到来'
  }
  
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  if (seconds > 0) return `${seconds}秒前`
  return '刚刚'
}

// 监听时间戳输入变化
watch(timestampInput, (newValue) => {
  if (newValue && newValue.length >= 10) {
    // 自动转换长时间戳
    convertFromTimestamp()
  }
})
</script>

<style scoped>
.input-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.datetime-input,
.timestamp-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  transition: var(--transition-fast);
}

.datetime-input:focus,
.timestamp-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.formats-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.format-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.format-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.format-value {
  display: flex;
  gap: var(--spacing-sm);
}

.format-result {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
</style>