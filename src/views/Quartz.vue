<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 配置和结果区域 -->
      <div class="input-output-container">
        <!-- 时间设置 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">Quartz 表达式配置</div>
          </div>
          <div class="tool-card-body">
            <div class="quartz-config">
              <div class="config-item">
                <label class="config-label">秒 (0-59)</label>
                <select v-model="second" class="config-select">
                  <option value="*">每秒</option>
                  <option value="0">第0秒</option>
                  <option v-for="i in 59" :key="i" :value="i.toString()">第{{ i }}秒</option>
                  <option value="*/5">每5秒</option>
                  <option value="*/10">每10秒</option>
                  <option value="*/15">每15秒</option>
                  <option value="*/30">每30秒</option>
                </select>
              </div>

              <div class="config-item">
                <label class="config-label">分钟 (0-59)</label>
                <select v-model="minute" class="config-select">
                  <option value="*">每分钟</option>
                  <option value="0">第0分钟</option>
                  <option v-for="i in 59" :key="i" :value="i.toString()">第{{ i }}分钟</option>
                  <option value="*/5">每5分钟</option>
                  <option value="*/10">每10分钟</option>
                  <option value="*/15">每15分钟</option>
                  <option value="*/30">每30分钟</option>
                </select>
              </div>

              <div class="config-item">
                <label class="config-label">小时 (0-23)</label>
                <select v-model="hour" class="config-select">
                  <option value="*">每小时</option>
                  <option v-for="i in 24" :key="i-1" :value="(i-1).toString()">{{ i-1 }}点</option>
                  <option value="*/2">每2小时</option>
                  <option value="*/6">每6小时</option>
                  <option value="*/12">每12小时</option>
                </select>
              </div>

              <div class="config-item">
                <label class="config-label">日期 (1-31)</label>
                <select v-model="day" class="config-select">
                  <option value="*">每天</option>
                  <option value="?">不指定</option>
                  <option v-for="i in 31" :key="i" :value="i.toString()">{{ i }}号</option>
                  <option value="*/2">每2天</option>
                  <option value="L">最后一天</option>
                </select>
              </div>

              <div class="config-item">
                <label class="config-label">月份 (1-12)</label>
                <select v-model="month" class="config-select">
                  <option value="*">每月</option>
                  <option v-for="(m, i) in months" :key="i+1" :value="(i+1).toString()">{{ m }}</option>
                  <option value="*/3">每季度</option>
                  <option value="*/6">每半年</option>
                </select>
              </div>

              <div class="config-item">
                <label class="config-label">星期 (1-7)</label>
                <select v-model="weekday" class="config-select">
                  <option value="*">每天</option>
                  <option value="?">不指定</option>
                  <option v-for="(w, i) in weekdays" :key="i+1" :value="(i+1).toString()">{{ w }}</option>
                  <option value="1-5">工作日</option>
                  <option value="6,7">周末</option>
                </select>
              </div>

              <div class="config-item">
                <label class="config-label">年份 (可选)</label>
                <select v-model="year" class="config-select">
                  <option value="">不指定</option>
                  <option value="*">每年</option>
                  <option v-for="y in yearRange" :key="y" :value="y.toString()">{{ y }}年</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 生成结果 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">
              生成结果
              <div class="button-group">
                <button class="btn-primary" @click="copyExpression">复制</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div class="quartz-result">
              <div class="result-item">
                <label class="result-label">Quartz 表达式</label>
                <div class="result-value quartz-expression">{{ quartzExpression }}</div>
              </div>
              
              <div class="result-item">
                <label class="result-label">表达式说明</label>
                <div class="result-value description">{{ quartzDescription }}</div>
              </div>

              <div class="result-item">
                <label class="result-label">表达式结构</label>
                <div class="expression-structure">
                  <div class="structure-item">
                    <div class="structure-label">秒</div>
                    <div class="structure-value">{{ second }}</div>
                  </div>
                  <div class="structure-item">
                    <div class="structure-label">分</div>
                    <div class="structure-value">{{ minute }}</div>
                  </div>
                  <div class="structure-item">
                    <div class="structure-label">时</div>
                    <div class="structure-value">{{ hour }}</div>
                  </div>
                  <div class="structure-item">
                    <div class="structure-label">日</div>
                    <div class="structure-value">{{ day }}</div>
                  </div>
                  <div class="structure-item">
                    <div class="structure-label">月</div>
                    <div class="structure-value">{{ month }}</div>
                  </div>
                  <div class="structure-item">
                    <div class="structure-label">周</div>
                    <div class="structure-value">{{ weekday }}</div>
                  </div>
                  <div class="structure-item" v-if="year">
                    <div class="structure-label">年</div>
                    <div class="structure-value">{{ year }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 常用模板 -->
      <div class="actions-container">
        <div class="actions-grid">
          <div class="action-group">
            <h4 class="action-title">常用模板</h4>
            <button class="btn-secondary" @click="setTemplate('0 0 0 * * ?')">每天午夜</button>
            <button class="btn-secondary" @click="setTemplate('0 0 9 ? * MON-FRI')">工作日9点</button>
            <button class="btn-secondary" @click="setTemplate('0 0 0 1 * ?')">每月1号</button>
            <button class="btn-secondary" @click="setTemplate('0 0 0 ? * SUN')">每周日</button>
            <button class="btn-secondary" @click="setTemplate('0 */5 * * * ?')">每5分钟</button>
            <button class="btn-secondary" @click="setTemplate('0 0 */2 * * ?')">每2小时</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

const second = ref('0')
const minute = ref('0')
const hour = ref('*')
const day = ref('*')
const month = ref('*')
const weekday = ref('?')
const year = ref('')

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 年份范围
const yearRange = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i <= currentYear + 10; i++) {
    years.push(i)
  }
  return years
})

// Quartz表达式
const quartzExpression = computed(() => {
  const parts = [second.value, minute.value, hour.value, day.value, month.value, weekday.value]
  if (year.value) {
    parts.push(year.value)
  }
  return parts.join(' ')
})

// 表达式说明
const quartzDescription = computed(() => {
  const parts = []
  
  // 秒
  if (second.value === '*') {
    parts.push('每秒')
  } else if (second.value.includes('*/')) {
    const interval = second.value.split('/')[1]
    parts.push(`每${interval}秒`)
  } else {
    parts.push(`第${second.value}秒`)
  }
  
  // 分钟
  if (minute.value === '*') {
    parts.push('每分钟')
  } else if (minute.value.includes('*/')) {
    const interval = minute.value.split('/')[1]
    parts.push(`每${interval}分钟`)
  } else {
    parts.push(`第${minute.value}分钟`)
  }
  
  // 小时
  if (hour.value === '*') {
    parts.push('每小时')
  } else if (hour.value.includes('*/')) {
    const interval = hour.value.split('/')[1]
    parts.push(`每${interval}小时`)
  } else {
    parts.push(`${hour.value}点`)
  }
  
  // 日期
  if (day.value === '*') {
    parts.push('每天')
  } else if (day.value === '?') {
    parts.push('(日期不指定)')
  } else if (day.value === 'L') {
    parts.push('最后一天')
  } else if (day.value.includes('*/')) {
    const interval = day.value.split('/')[1]
    parts.push(`每${interval}天`)
  } else {
    parts.push(`${day.value}号`)
  }
  
  // 月份
  if (month.value === '*') {
    parts.push('每月')
  } else if (month.value.includes('*/')) {
    const interval = month.value.split('/')[1]
    if (interval === '3') parts.push('每季度')
    else if (interval === '6') parts.push('每半年')
    else parts.push(`每${interval}个月`)
  } else {
    parts.push(`${months[parseInt(month.value) - 1]}`)
  }
  
  // 星期
  if (weekday.value === '*') {
    parts.push('每天')
  } else if (weekday.value === '?') {
    parts.push('(星期不指定)')
  } else if (weekday.value === '1-5') {
    parts.push('工作日')
  } else if (weekday.value === '6,7') {
    parts.push('周末')
  } else {
    const day = parseInt(weekday.value)
    if (day >= 1 && day <= 7) {
      parts.push(weekdays[day - 1])
    }
  }
  
  // 年份
  if (year.value && year.value !== '*') {
    parts.push(`${year.value}年`)
  }
  
  return parts.join(', ')
})

// 复制表达式
const copyExpression = async () => {
  try {
    await navigator.clipboard.writeText(quartzExpression.value)
    message.success('Quartz表达式已复制')
  } catch {
    message.error('复制失败')
  }
}

// 设置模板
const setTemplate = (template: string) => {
  const parts = template.split(' ')
  second.value = parts[0] || '0'
  minute.value = parts[1] || '0'
  hour.value = parts[2] || '*'
  day.value = parts[3] || '*'
  month.value = parts[4] || '*'
  weekday.value = parts[5] || '?'
  year.value = parts[6] || ''
  message.success('模板已应用')
}
</script>

<style scoped>
.quartz-config {
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

.config-select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  background: var(--bg-primary);
  transition: var(--transition-fast);
}

.config-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.quartz-result {
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

.quartz-expression {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  color: var(--primary-color);
  background: var(--primary-bg);
  border: 1px solid var(--primary-light);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.description {
  color: var(--text-primary);
  background: var(--success-bg);
  border: 1px solid var(--success-light);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  line-height: var(--leading-relaxed);
}

.expression-structure {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: var(--spacing-sm);
}

.structure-item {
  text-align: center;
  padding: var(--spacing-sm);
  background: var(--info-bg);
  border: 1px solid var(--info-light);
  border-radius: var(--radius-sm);
}

.structure-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.structure-value {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--info-color);
  font-weight: 600;
}
</style>