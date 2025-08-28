<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 配置和结果区域 -->
      <div class="input-output-container">
        <!-- 时间设置 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">时间设置</div>
          </div>
          <div class="tool-card-body">
            <div class="cron-config">
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
                  <option v-for="i in 31" :key="i" :value="i.toString()">{{ i }}号</option>
                  <option value="*/2">每2天</option>
                  <option value="*/7">每7天</option>
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
                <label class="config-label">星期 (0-7)</label>
                <select v-model="weekday" class="config-select">
                  <option value="*">每天</option>
                  <option v-for="(w, i) in weekdays" :key="i" :value="i.toString()">{{ w }}</option>
                  <option value="1-5">工作日</option>
                  <option value="6,0">周末</option>
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
            <div class="cron-result">
              <div class="result-item">
                <label class="result-label">Crontab 表达式</label>
                <div class="result-value cron-expression">{{ cronExpression }}</div>
              </div>
              
              <div class="result-item">
                <label class="result-label">执行说明</label>
                <div class="result-value description">{{ cronDescription }}</div>
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
            <button class="btn-secondary" @click="setTemplate('0 0 * * *')">每天午夜执行</button>
            <button class="btn-secondary" @click="setTemplate('0 9 * * 1-5')">工作日上午9点</button>
            <button class="btn-secondary" @click="setTemplate('0 0 1 * *')">每月1号执行</button>
            <button class="btn-secondary" @click="setTemplate('0 0 * * 0')">每周日执行</button>
            <button class="btn-secondary" @click="setTemplate('*/5 * * * *')">每5分钟执行</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

const minute = ref('*')
const hour = ref('*')
const day = ref('*')
const month = ref('*')
const weekday = ref('*')

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

const cronExpression = computed(() => {
  return `${minute.value} ${hour.value} ${day.value} ${month.value} ${weekday.value}`
})

const cronDescription = computed(() => {
  const parts = []
  
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
  if (weekday.value !== '*') {
    if (weekday.value === '1-5') {
      parts.push('工作日')
    } else if (weekday.value === '6,0') {
      parts.push('周末')
    } else {
      const day = parseInt(weekday.value)
      parts.push(weekdays[day])
    }
  }
  
  return parts.join(', ')
})

const copyExpression = async () => {
  try {
    await navigator.clipboard.writeText(cronExpression.value)
    message.success('Crontab表达式已复制')
  } catch {
    message.error('复制失败')
  }
}

const setTemplate = (template: string) => {
  const parts = template.split(' ')
  minute.value = parts[0]
  hour.value = parts[1]
  day.value = parts[2]
  month.value = parts[3]
  weekday.value = parts[4]
  message.success('模板已应用')
}
</script>

<style scoped>
.cron-config {
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

.cron-result {
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

.cron-expression {
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
</style>