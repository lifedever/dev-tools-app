<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 输入输出区域 -->
      <div class="input-output-container">
        <!-- 输入区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">
              SQL输入
              <div class="button-group">
                <button class="btn-secondary" @click="clearInput" :disabled="!inputSql">清空</button>
                <button class="btn-secondary" @click="pasteSql">粘贴</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div class="config-section">
              <div class="config-row">
                <div class="config-item">
                  <label class="config-label">缩进类型</label>
                  <select v-model="indentType" class="config-select">
                    <option value="spaces">空格</option>
                    <option value="tabs">制表符</option>
                  </select>
                </div>
                <div class="config-item">
                  <label class="config-label">缩进大小</label>
                  <select v-model="indentSize" class="config-select">
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="8">8</option>
                  </select>
                </div>
                <div class="config-item">
                  <label class="config-label">关键字大小写</label>
                  <select v-model="keywordCase" class="config-select">
                    <option value="uppercase">大写</option>
                    <option value="lowercase">小写</option>
                    <option value="preserve">保持原样</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="textarea-container">
              <textarea
                v-model="inputSql"
                placeholder="输入需要格式化的SQL语句..."
                class="textarea-input"
                style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace;"
              ></textarea>
              <div class="stats-container">
                <span class="tag tag-primary">{{ inputSql.length }} 字符</span>
                <span class="tag tag-info">{{ inputSql.split('\n').length }} 行</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输出区域 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">
              格式化结果
              <div class="button-group">
                <button class="btn-primary" @click="copyResult" :disabled="!outputSql">复制</button>
              </div>
            </div>
          </div>
          <div class="tool-card-body">
            <div class="textarea-container">
              <textarea
                v-model="outputSql"
                placeholder="格式化结果将显示在这里..."
                readonly
                class="textarea-output"
                style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace;"
              ></textarea>
              <div class="stats-container" v-if="outputSql">
                <span class="tag tag-success">格式化完成</span>
                <span class="tag tag-info">{{ outputSql.length }} 字符</span>
                <span class="tag tag-warning">{{ outputSql.split('\n').length }} 行</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-container">
        <div class="actions-grid">
          <div class="action-group">
            <h4 class="action-title">格式化选项</h4>
            <button class="btn-primary" @click="formatSql" :disabled="!inputSql || isLoading">
              {{ isLoading ? '格式化中...' : '格式化SQL' }}
            </button>
            <button class="btn-secondary" @click="minifySql" :disabled="!inputSql">压缩SQL</button>
          </div>

          <div class="action-group">
            <h4 class="action-title">示例SQL</h4>
            <button class="btn-secondary" @click="loadSelectExample">SELECT示例</button>
            <button class="btn-secondary" @click="loadInsertExample">INSERT示例</button>
            <button class="btn-secondary" @click="loadUpdateExample">UPDATE示例</button>
            <button class="btn-secondary" @click="loadComplexExample">复杂查询</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'

const inputSql = ref('')
const outputSql = ref('')
const indentType = ref('spaces')
const indentSize = ref('2')
const keywordCase = ref('uppercase')
const isLoading = ref(false)

// SQL关键字列表
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 
  'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'INSERT', 'INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'NOT', 'NULL',
  'DEFAULT', 'AUTO_INCREMENT', 'UNIQUE', 'CHECK', 'AND', 'OR', 'IN', 'EXISTS',
  'BETWEEN', 'LIKE', 'IS', 'AS', 'DISTINCT', 'ALL', 'ANY', 'SOME', 'UNION',
  'INTERSECT', 'EXCEPT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'ELSE',
  'ELSEIF', 'WHILE', 'FOR', 'LOOP', 'REPEAT', 'UNTIL', 'DECLARE', 'CURSOR',
  'OPEN', 'FETCH', 'CLOSE', 'DEALLOCATE', 'BEGIN', 'COMMIT', 'ROLLBACK',
  'TRANSACTION', 'SAVEPOINT', 'RELEASE', 'LOCK', 'UNLOCK', 'GRANT', 'REVOKE',
  'WITH', 'RECURSIVE', 'CTE', 'OVER', 'PARTITION', 'ROW_NUMBER', 'RANK',
  'DENSE_RANK', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'COUNT', 'SUM',
  'AVG', 'MIN', 'MAX', 'STDDEV', 'VARIANCE', 'COALESCE', 'NULLIF', 'CAST',
  'CONVERT', 'SUBSTRING', 'LENGTH', 'TRIM', 'UPPER', 'LOWER', 'CONCAT'
]

// 清空输入
const clearInput = () => {
  inputSql.value = ''
  outputSql.value = ''
}

// 粘贴SQL
const pasteSql = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputSql.value = text
    message.success('SQL已粘贴')
  } catch {
    message.info('请手动粘贴SQL')
  }
}

// 复制结果
const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(outputSql.value)
    message.success('格式化结果已复制')
  } catch {
    message.error('复制失败')
  }
}

// 获取缩进字符
const getIndent = (level: number): string => {
  const indent = indentType.value === 'tabs' ? '\t' : ' '.repeat(parseInt(indentSize.value))
  return indent.repeat(level)
}

// 处理关键字大小写
const processKeyword = (keyword: string): string => {
  switch (keywordCase.value) {
    case 'uppercase':
      return keyword.toUpperCase()
    case 'lowercase':
      return keyword.toLowerCase()
    default:
      return keyword
  }
}

// 格式化SQL
const formatSql = async () => {
  if (!inputSql.value.trim()) {
    message.warning('请先输入SQL语句')
    return
  }

  isLoading.value = true
  
  try {
    const formatted = formatSqlString(inputSql.value)
    outputSql.value = formatted
    message.success('SQL格式化完成')
  } catch (error: any) {
    message.error(`格式化失败: ${error.message}`)
    outputSql.value = inputSql.value
  } finally {
    isLoading.value = false
  }
}

// SQL格式化核心逻辑
const formatSqlString = (sql: string): string => {
  // 移除多余的空白字符
  let formatted = sql.replace(/\s+/g, ' ').trim()
  
  // 处理关键字大小写
  SQL_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    formatted = formatted.replace(regex, processKeyword(keyword))
  })
  
  // 添加换行和缩进
  let indentLevel = 0
  const lines: string[] = []
  
  // 分割SQL语句
  const tokens = tokenizeSql(formatted)
  let currentLine = ''
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim()
    const upperToken = token.toUpperCase()
    
    if (!token) continue
    
    // 主要子句关键字，需要换行
    if (['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 
         'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'].includes(upperToken)) {
      if (currentLine.trim()) {
        lines.push(getIndent(indentLevel) + currentLine.trim())
        currentLine = ''
      }
      currentLine = processKeyword(token)
    }
    // JOIN相关关键字
    else if (['JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN'].includes(upperToken)) {
      if (currentLine.trim()) {
        lines.push(getIndent(indentLevel) + currentLine.trim())
        currentLine = ''
      }
      currentLine = processKeyword(token)
    }
    // AND, OR 逻辑运算符
    else if (['AND', 'OR'].includes(upperToken)) {
      if (currentLine.trim()) {
        lines.push(getIndent(indentLevel + 1) + currentLine.trim())
        currentLine = ''
      }
      currentLine = processKeyword(token)
    }
    // 子查询开始
    else if (token === '(') {
      currentLine += token
      indentLevel++
    }
    // 子查询结束
    else if (token === ')') {
      indentLevel = Math.max(0, indentLevel - 1)
      currentLine += token
    }
    // 逗号分隔
    else if (token === ',') {
      currentLine += token
      if (currentLine.trim()) {
        lines.push(getIndent(indentLevel) + currentLine.trim())
        currentLine = ''
      }
    }
    // 其他token
    else {
      if (currentLine && !currentLine.endsWith(' ')) {
        currentLine += ' '
      }
      currentLine += token
    }
  }
  
  // 添加最后一行
  if (currentLine.trim()) {
    lines.push(getIndent(indentLevel) + currentLine.trim())
  }
  
  return lines.join('\n').trim()
}

// 简单的SQL分词器
const tokenizeSql = (sql: string): string[] => {
  const tokens: string[] = []
  let current = ''
  let inString = false
  let stringChar = ''
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    
    if (inString) {
      current += char
      if (char === stringChar && sql[i - 1] !== '\\') {
        inString = false
        stringChar = ''
      }
    } else {
      if (char === '"' || char === "'") {
        if (current.trim()) {
          tokens.push(current.trim())
          current = ''
        }
        current += char
        inString = true
        stringChar = char
      } else if ([' ', '\t', '\n', '\r'].includes(char)) {
        if (current.trim()) {
          tokens.push(current.trim())
          current = ''
        }
      } else if (['(', ')', ',', ';'].includes(char)) {
        if (current.trim()) {
          tokens.push(current.trim())
          current = ''
        }
        tokens.push(char)
      } else {
        current += char
      }
    }
  }
  
  if (current.trim()) {
    tokens.push(current.trim())
  }
  
  return tokens
}

// 压缩SQL
const minifySql = () => {
  if (!inputSql.value.trim()) {
    message.warning('请先输入SQL语句')
    return
  }
  
  try {
    let minified = inputSql.value
      .replace(/\s+/g, ' ')
      .replace(/\s*([(),;])\s*/g, '$1')
      .trim()
    
    outputSql.value = minified
    message.success('SQL压缩完成')
  } catch (error: any) {
    message.error(`压缩失败: ${error.message}`)
  }
}

// 示例SQL
const loadSelectExample = () => {
  inputSql.value = `select u.id, u.name, u.email, p.title from users u left join posts p on u.id = p.user_id where u.status = 'active' and p.created_at > '2023-01-01' order by u.name asc`
}

const loadInsertExample = () => {
  inputSql.value = `insert into users (name, email, password, created_at) values ('张三', 'zhangsan@example.com', 'password123', now()), ('李四', 'lisi@example.com', 'password456', now())`
}

const loadUpdateExample = () => {
  inputSql.value = `update users set email = 'newemail@example.com', updated_at = now() where id = 1 and status = 'active'`
}

const loadComplexExample = () => {
  inputSql.value = `with sales_summary as (select region, sum(amount) as total_sales from sales where year = 2023 group by region) select r.region_name, ss.total_sales, (ss.total_sales / (select sum(total_sales) from sales_summary)) * 100 as percentage from regions r join sales_summary ss on r.region_id = ss.region order by ss.total_sales desc`
}
</script>

<style scoped>
.config-section {
  margin-bottom: var(--spacing-md);
}

.config-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
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
</style>
