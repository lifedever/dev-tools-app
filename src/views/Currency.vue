<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 输入输出区域 -->
      <div class="input-output-container">
        <!-- 输入区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">输入金额</div>
          </div>
          <div class="tool-card-body">
            <div class="input-section">
              <input
                type="number"
                v-model="amount"
                placeholder="请输入金额数字，如：1234.56"
                :min="0"
                :max="999999999999.99"
                step="0.01"
                class="amount-input"
              />
              <div class="input-tip">支持范围：0.01 - 999,999,999,999.99</div>
            </div>
          </div>
        </div>

        <!-- 结果区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">
              转换结果
              <div class="button-group" v-if="chineseAmount">
                <button class="btn-primary" @click="copyResult">复制</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div v-if="amount !== null && amount !== undefined && amount >= 0" class="result-section">
              <div class="result-item">
                <label class="result-label">阿拉伯数字</label>
                <div class="result-value arabic">¥{{ formattedAmount }}</div>
              </div>
              
              <div class="result-item">
                <label class="result-label">中文大写</label>
                <div class="result-value chinese">{{ chineseAmount }}</div>
              </div>
            </div>

            <div class="empty-state" v-else>
              <div class="empty-icon">💰</div>
              <div class="empty-title">请输入金额数字</div>
              <div class="empty-description">输入后将自动显示中文大写金额</div>
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

const amount = ref<number>()

// 格式化金额显示
const formattedAmount = computed(() => {
  if (amount.value === null || amount.value === undefined) return ''
  return amount.value.toFixed(2)
})

// 数字转中文大写
const numberToChinese = (num: number): string => {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟']
  const bigUnits = ['', '万', '亿', '万亿']
  
  if (num === 0) return '零'
  
  // 分离整数和小数部分
  const parts = num.toString().split('.')
  const integerPart = parseInt(parts[0])
  const decimalPart = parts[1] ? parseInt(parts[1].padEnd(2, '0').substring(0, 2)) : 0
  
  let result = ''
  
  // 转换整数部分
  if (integerPart === 0) {
    result = '零圆'
  } else {
    result = convertInteger(integerPart, digits, units, bigUnits) + '圆'
  }
  
  // 转换小数部分
  if (decimalPart === 0) {
    result += '整'
  } else {
    const jiao = Math.floor(decimalPart / 10)
    const fen = decimalPart % 10
    
    if (jiao > 0) {
      result += digits[jiao] + '角'
    }
    
    if (fen > 0) {
      if (jiao === 0 && integerPart > 0) {
        result += '零'
      }
      result += digits[fen] + '分'
    }
  }
  
  return result
}

const convertInteger = (num: number, digits: string[], units: string[], bigUnits: string[]): string => {
  let result = ''
  let unitIndex = 0
  let needZero = false
  
  while (num > 0) {
    const section = num % 10000
    if (section !== 0) {
      let sectionStr = convertSection(section, digits, units)
      if (unitIndex > 0) {
        sectionStr += bigUnits[unitIndex]
      }
      if (needZero && section < 1000) {
        result = '零' + result
      }
      result = sectionStr + result
      needZero = true
    } else if (result) {
      needZero = true
    }
    
    num = Math.floor(num / 10000)
    unitIndex++
  }
  
  return result
}

const convertSection = (num: number, digits: string[], units: string[]): string => {
  let result = ''
  let unitIndex = 0
  let lastDigit = 0
  
  while (num > 0) {
    const digit = num % 10
    if (digit !== 0) {
      if (lastDigit === 0 && result) {
        result = '零' + result
      }
      result = digits[digit] + units[unitIndex] + result
    }
    lastDigit = digit
    num = Math.floor(num / 10)
    unitIndex++
  }
  
  return result
}

// 中文大写金额
const chineseAmount = computed(() => {
  if (amount.value === null || amount.value === undefined || amount.value < 0) {
    return ''
  }
  
  try {
    return numberToChinese(amount.value)
  } catch (error) {
    return '转换错误'
  }
})

// 复制结果
const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(chineseAmount.value)
    message.success('大写金额已复制')
  } catch {
    message.error('复制失败')
  }
}
</script>

<style scoped>
.input-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.amount-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-lg);
  font-family: var(--font-mono);
  transition: var(--transition-fast);
}

.amount-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.input-tip {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.result-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.result-value {
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: var(--text-lg);
  font-weight: 600;
}

.result-value.arabic {
  background: var(--info-bg);
  color: var(--info-color);
  border: 1px solid var(--info-light);
  font-family: var(--font-mono);
}

.result-value.chinese {
  background: var(--success-bg);
  color: var(--success-color);
  border: 1px solid var(--success-light);
  font-size: var(--text-xl);
  line-height: var(--leading-relaxed);
}
</style>