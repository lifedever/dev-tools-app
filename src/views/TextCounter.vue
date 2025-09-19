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
                <button class="btn-secondary" @click="clearText" :disabled="!text">清空</button>
                <button class="btn-secondary" @click="pasteText">粘贴</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div class="textarea-container">
              <textarea
                v-model="text"
                placeholder="输入文本进行统计..."
                class="textarea-input"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 统计结果 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">统计结果</div>
          </div>
          <div class="tool-card-body">
            <div class="stats-grid">
              <div class="stat-item stat-primary">
                <div class="stat-label">字符数</div>
                <div class="stat-value">{{ stats.chars }}</div>
              </div>
              <div class="stat-item stat-success">
                <div class="stat-label">字数</div>
                <div class="stat-value">{{ stats.words }}</div>
              </div>
              <div class="stat-item stat-info">
                <div class="stat-label">行数</div>
                <div class="stat-value">{{ stats.lines }}</div>
              </div>
              <div class="stat-item stat-warning">
                <div class="stat-label">段落数</div>
                <div class="stat-value">{{ stats.paragraphs }}</div>
              </div>
              <div class="stat-item stat-error">
                <div class="stat-label">字节数</div>
                <div class="stat-value">{{ stats.bytes }}</div>
              </div>
              <div class="stat-item stat-primary">
                <div class="stat-label">中文字符</div>
                <div class="stat-value">{{ stats.chinese }}</div>
              </div>
              <div class="stat-item stat-purple">
                <div class="stat-label">GPT Tokens</div>
                <div class="stat-value">{{ stats.tokens }}</div>
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
import { encode } from 'gpt-tokenizer'

const text = ref('')

const stats = computed(() => {
  if (!text.value) return { chars: 0, words: 0, lines: 0, paragraphs: 0, bytes: 0, chinese: 0, tokens: 0 }
  
  const chars = text.value.length
  const words = text.value.trim().split(/\s+/).filter(w => w).length
  const lines = text.value.split('\n').length
  const paragraphs = text.value.split(/\n\s*\n/).filter(p => p.trim()).length
  const bytes = new TextEncoder().encode(text.value).length
  const chinese = (text.value.match(/[\u4e00-\u9fff]/g) || []).length
  const tokens = encode(text.value).length
  
  return { chars, words, lines, paragraphs, bytes, chinese, tokens }
})

const clearText = () => {
  text.value = ''
}

const pasteText = async () => {
  try {
    const clipboardText = await navigator.clipboard.readText()
    text.value = clipboardText
    message.success('文本已粘贴')
  } catch {
    message.info('请手动粘贴文本')
  }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.stat-item {
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  text-align: center;
  transition: var(--transition-fast);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-primary {
  background: var(--primary-bg);
  border: 1px solid var(--primary-light);
}

.stat-success {
  background: var(--success-bg);
  border: 1px solid var(--success-light);
}

.stat-warning {
  background: var(--warning-bg);
  border: 1px solid var(--warning-light);
}

.stat-error {
  background: var(--error-bg);
  border: 1px solid var(--error-light);
}

.stat-info {
  background: var(--info-bg);
  border: 1px solid var(--info-light);
}

.stat-purple {
  background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
  border: 1px solid #c084fc;
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
}
</style>