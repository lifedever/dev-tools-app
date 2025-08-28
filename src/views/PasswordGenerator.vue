<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 配置和结果区域 -->
      <div class="input-output-container">
        <!-- 配置区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">密码配置</div>
          </div>
          <div class="tool-card-body">
            <div class="config-section">
              <!-- 密码长度 -->
              <div class="config-item">
                <label class="config-label">密码长度: {{ passwordLength }}</label>
                <input
                  type="range"
                  v-model="passwordLength"
                  min="4"
                  max="32"
                  class="slider"
                />
                <div class="slider-marks">
                  <span>4</span>
                  <span>8</span>
                  <span>16</span>
                  <span>24</span>
                  <span>32</span>
                </div>
              </div>

              <!-- 字符类型 -->
              <div class="config-item">
                <label class="config-label">字符类型</label>
                <div class="checkbox-group">
                  <label class="checkbox-item">
                    <input type="checkbox" value="lowercase" v-model="characterTypes" />
                    <span>小写字母 (a-z)</span>
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" value="uppercase" v-model="characterTypes" />
                    <span>大写字母 (A-Z)</span>
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" value="numbers" v-model="characterTypes" />
                    <span>数字 (0-9)</span>
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" value="symbols" v-model="characterTypes" />
                    <span>符号 (!@#$...)</span>
                  </label>
                </div>
              </div>

              <!-- 生成数量 -->
              <div class="config-item">
                <label class="config-label">生成数量</label>
                <input
                  type="number"
                  v-model="generateCount"
                  min="1"
                  max="10"
                  class="number-input"
                />
              </div>

              <!-- 重新生成按钮 -->
              <div class="config-item">
                <button 
                  class="btn-primary"
                  @click="generatePasswords"
                  :disabled="characterTypes.length === 0"
                  style="width: 100%;"
                >
                  重新生成
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 生成结果 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">
              生成结果
              <div class="button-group" v-if="passwords.length > 0">
                <button class="btn-primary" @click="copyAllPasswords">复制全部</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div v-if="passwords.length === 0" class="empty-state">
              <div class="empty-icon">🔐</div>
              <div class="empty-title">请先配置密码选项</div>
              <div class="empty-description">选择字符类型后将自动生成密码</div>
            </div>
            
            <div v-else class="passwords-list">
              <div 
                v-for="(password, index) in passwords" 
                :key="index"
                class="password-item"
              >
                <div class="password-content">
                  <input
                    :value="password"
                    readonly
                    class="password-input"
                  />
                  <button 
                    class="btn-secondary"
                    @click="copyPassword(password, index)"
                  >
                    复制
                  </button>
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
import { ref, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'

const passwordLength = ref(12)
const characterTypes = ref(['lowercase', 'uppercase', 'numbers', 'symbols'])
const generateCount = ref(1)
const passwords = ref<string[]>([])

// 字符集定义
const characterSets = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
}

// 获取字符集
const getCharacterSet = (): string => {
  let charset = ''
  characterTypes.value.forEach(type => {
    charset += characterSets[type as keyof typeof characterSets]
  })
  return charset
}

// 生成单个密码
const generateSinglePassword = (): string => {
  const charset = getCharacterSet()
  if (charset.length === 0) return ''
  
  let password = ''
  for (let i = 0; i < passwordLength.value; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  return password
}

// 生成密码
const generatePasswords = () => {
  if (characterTypes.value.length === 0) {
    passwords.value = []
    return
  }
  
  const newPasswords: string[] = []
  for (let i = 0; i < generateCount.value; i++) {
    const password = generateSinglePassword()
    if (password) {
      newPasswords.push(password)
    }
  }
  passwords.value = newPasswords
}

// 复制密码
const copyPassword = async (password: string, index: number) => {
  try {
    await navigator.clipboard.writeText(password)
    message.success(`密码 ${index + 1} 已复制`)
  } catch (error) {
    message.error('复制失败')
  }
}

// 复制所有密码
const copyAllPasswords = async () => {
  try {
    const allPasswords = passwords.value.join('\n')
    await navigator.clipboard.writeText(allPasswords)
    message.success('所有密码已复制')
  } catch (error) {
    message.error('复制失败')
  }
}

// 自动生成密码
watch([passwordLength, characterTypes, generateCount], () => {
  generatePasswords()
}, { deep: true })

// 组件挂载时自动生成
onMounted(() => {
  generatePasswords()
})
</script>

<style scoped>
.config-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
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

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--gray-200);
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: var(--text-sm);
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color);
}

.number-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  transition: var(--transition-fast);
}

.number-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.passwords-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.password-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.password-content {
  display: flex;
  gap: var(--spacing-sm);
}

.password-input {
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