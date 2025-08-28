<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 转换区域 -->
      <div class="input-output-container">
        <!-- 图片转Base64 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">图片转Base64</div>
          </div>
          <div class="tool-card-body">
            <div class="convert-section">
              <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop="handleDrop">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  style="display: none;"
                />
                <div class="upload-content">
                  <div class="upload-icon">🖼️</div>
                  <div class="upload-title">选择图片文件</div>
                  <div class="upload-description">支持 JPG、PNG、GIF、WebP 等格式</div>
                </div>
              </div>

              <!-- 图片预览 -->
              <div v-if="selectedImage" class="image-preview">
                <img :src="selectedImage" alt="预览图片" class="preview-image" />
                <div class="image-info">
                  <span class="tag tag-info">{{ imageInfo.name }}</span>
                  <span class="tag tag-primary">{{ imageInfo.size }}</span>
                  <span class="tag tag-success">{{ imageInfo.type }}</span>
                </div>
              </div>

              <!-- Base64结果 -->
              <div v-if="base64Result" class="result-section">
                <div class="result-header">
                  <h4 class="result-title">Base64 编码结果</h4>
                  <div class="button-group">
                    <button class="btn-primary" @click="copyBase64">复制</button>
                    <button class="btn-secondary" @click="downloadBase64">下载</button>
                  </div>
                </div>
                <textarea
                  :value="base64Result"
                  readonly
                  class="result-textarea"
                  rows="6"
                ></textarea>
                <div class="stats-container">
                  <span class="tag tag-info">{{ base64Result.length }} 字符</span>
                  <span class="tag tag-success">编码完成</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Base64转图片 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">Base64转图片</div>
          </div>
          <div class="tool-card-body">
            <div class="decode-section">
              <div class="input-group">
                <label class="input-label">Base64 编码</label>
                <textarea
                  v-model="base64Input"
                  placeholder="粘贴Base64编码..."
                  class="base64-input"
                  rows="6"
                ></textarea>
                <div class="button-group">
                  <button class="btn-secondary" @click="pasteBase64">粘贴</button>
                  <button class="btn-secondary" @click="clearBase64">清空</button>
                </div>
              </div>

              <button 
                class="btn-primary" 
                @click="decodeBase64" 
                :disabled="!base64Input.trim()"
                style="width: 100%;"
              >
                转换为图片
              </button>

              <!-- 解码结果 -->
              <div v-if="decodedImage" class="decoded-result">
                <div class="result-header">
                  <h4 class="result-title">转换结果</h4>
                  <div class="button-group">
                    <button class="btn-primary" @click="downloadDecoded">下载图片</button>
                  </div>
                </div>
                <div class="decoded-preview">
                  <img :src="decodedImage" alt="解码图片" class="decoded-image" />
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
import { ref } from 'vue'
import { message } from 'ant-design-vue'

const fileInput = ref<HTMLInputElement>()
const selectedImage = ref('')
const base64Result = ref('')
const base64Input = ref('')
const decodedImage = ref('')

const imageInfo = ref({
  name: '',
  size: '',
  type: ''
})

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processImageFile(file)
  }
}

// 处理拖拽
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    processImageFile(file)
  }
}

// 处理图片文件
const processImageFile = (file: File) => {
  // 更新文件信息
  imageInfo.value = {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    selectedImage.value = result
    base64Result.value = result
    message.success('图片转Base64完成')
  }
  reader.readAsDataURL(file)
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 复制Base64
const copyBase64 = async () => {
  try {
    await navigator.clipboard.writeText(base64Result.value)
    message.success('Base64编码已复制')
  } catch {
    message.error('复制失败')
  }
}

// 下载Base64
const downloadBase64 = () => {
  const blob = new Blob([base64Result.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'base64.txt'
  link.click()
  URL.revokeObjectURL(url)
  message.success('Base64文件已下载')
}

// 粘贴Base64
const pasteBase64 = async () => {
  try {
    const text = await navigator.clipboard.readText()
    base64Input.value = text
    message.success('Base64已粘贴')
  } catch {
    message.info('请手动粘贴Base64编码')
  }
}

// 清空Base64
const clearBase64 = () => {
  base64Input.value = ''
  decodedImage.value = ''
}

// 解码Base64
const decodeBase64 = () => {
  try {
    let base64Data = base64Input.value.trim()
    
    // 检查是否包含数据URL前缀
    if (!base64Data.startsWith('data:')) {
      // 尝试添加常见的图片前缀
      if (base64Data.startsWith('/9j/')) {
        base64Data = 'data:image/jpeg;base64,' + base64Data
      } else if (base64Data.startsWith('iVBORw0KGgo')) {
        base64Data = 'data:image/png;base64,' + base64Data
      } else if (base64Data.startsWith('R0lGODlh') || base64Data.startsWith('R0lGODdh')) {
        base64Data = 'data:image/gif;base64,' + base64Data
      } else {
        base64Data = 'data:image/png;base64,' + base64Data
      }
    }
    
    decodedImage.value = base64Data
    message.success('Base64转图片完成')
  } catch (error) {
    message.error('Base64解码失败，请检查数据格式')
  }
}

// 下载解码图片
const downloadDecoded = () => {
  const link = document.createElement('a')
  link.href = decodedImage.value
  link.download = 'decoded-image.png'
  link.click()
  message.success('图片已下载')
}
</script>

<style scoped>
.convert-section,
.decode-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.upload-area {
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  text-align: center;
  cursor: pointer;
  transition: var(--transition-fast);
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: var(--primary-bg);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.upload-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.upload-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.image-preview {
  text-align: center;
}

.preview-image,
.decoded-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-md);
}

.image-info {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.result-section,
.decoded-result {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.result-title {
  margin: 0;
  font-size: var(--text-base);
  color: var(--text-primary);
}

.result-textarea,
.base64-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  resize: vertical;
  transition: var(--transition-fast);
}

.base64-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.result-textarea {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.decoded-preview {
  text-align: center;
}
</style>