<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 二维码生成和识别 -->
      <div class="input-output-container">
        <!-- 生成二维码 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">生成二维码</div>
          </div>
          <div class="tool-card-body">
            <div class="generate-section">
              <div class="input-group">
                <label class="input-label">输入文本或URL</label>
                <textarea
                  v-model="inputText"
                  placeholder="输入要生成二维码的文本或URL..."
                  class="text-input"
                  rows="3"
                ></textarea>
              </div>

              <div class="config-grid">
                <div class="config-item">
                  <label class="config-label">大小</label>
                  <select v-model="qrSize" class="config-select">
                    <option value="128">128x128</option>
                    <option value="256">256x256</option>
                    <option value="512">512x512</option>
                  </select>
                </div>

                <div class="config-item">
                  <label class="config-label">容错级别</label>
                  <select v-model="errorLevel" class="config-select">
                    <option value="L">低 (L)</option>
                    <option value="M">中 (M)</option>
                    <option value="Q">较高 (Q)</option>
                    <option value="H">高 (H)</option>
                  </select>
                </div>
              </div>

              <button 
                class="btn-primary" 
                @click="generateQR" 
                :disabled="!inputText.trim()"
                style="width: 100%;"
              >
                生成二维码
              </button>

              <!-- 生成的二维码 -->
              <div v-if="qrCodeDataUrl" class="qr-result">
                <div class="qr-display">
                  <img :src="qrCodeDataUrl" :alt="inputText" class="qr-image" />
                </div>
                <div class="button-group">
                  <button class="btn-secondary" @click="downloadQR">下载</button>
                  <button class="btn-secondary" @click="copyQRImage">复制图片</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 识别二维码 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">识别二维码</div>
          </div>
          <div class="tool-card-body">
            <div class="scan-section">
              <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop="handleDrop">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  style="display: none;"
                />
                <div class="upload-content">
                  <div class="upload-icon">📷</div>
                  <div class="upload-title">选择二维码图片</div>
                  <div class="upload-description">点击选择或拖拽图片到这里</div>
                </div>
              </div>

              <!-- 预览图片 -->
              <div v-if="selectedImage" class="image-preview">
                <img :src="selectedImage" alt="选择的图片" class="preview-image" />
                <div class="preview-actions">
                  <button class="btn-primary" @click="scanQRCode" :disabled="isScanning">
                    {{ isScanning ? '识别中...' : '重新识别' }}
                  </button>
                  <button class="btn-secondary" @click="clearImage" :disabled="isScanning">清除图片</button>
                </div>
              </div>

              <!-- 识别状态 -->
              <div v-if="isScanning" class="scanning-status">
                <div class="scanning-icon">🔍</div>
                <div class="scanning-text">正在识别二维码...</div>
              </div>

              <!-- 识别结果 -->
              <div v-if="scanResult" class="scan-result">
                <div class="result-header">
                  <h4 class="result-title">识别结果</h4>
                  <button class="btn-primary" @click="copyResult">复制</button>
                </div>
                <div class="result-content">{{ scanResult }}</div>
              </div>

              <div v-if="scanError" class="scan-error">
                <div class="error-message">{{ scanError }}</div>
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
import QRCode from 'qrcode'
import jsQR from 'jsqr'

const inputText = ref('')
const qrSize = ref('256')
const errorLevel = ref('M')
const qrCodeDataUrl = ref('')

const fileInput = ref<HTMLInputElement>()
const selectedImage = ref('')
const scanResult = ref('')
const scanError = ref('')
const isScanning = ref(false)

// 生成二维码
const generateQR = async () => {
  if (!inputText.value.trim()) {
    message.warning('请输入文本')
    return
  }

  try {
    const options = {
      width: parseInt(qrSize.value),
      errorCorrectionLevel: errorLevel.value as any,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }

    qrCodeDataUrl.value = await QRCode.toDataURL(inputText.value, options)
    message.success('二维码生成成功')
  } catch (error) {
    message.error('二维码生成失败')
  }
}

// 下载二维码
const downloadQR = () => {
  if (!qrCodeDataUrl.value) return

  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = qrCodeDataUrl.value
  link.click()
  message.success('二维码已下载')
}

// 复制二维码图片
const copyQRImage = async () => {
  try {
    const response = await fetch(qrCodeDataUrl.value)
    const blob = await response.blob()
    
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])
      message.success('二维码图片已复制')
    } else {
      message.warning('当前浏览器不支持复制图片')
    }
  } catch {
    message.error('复制图片失败')
  }
}

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
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target?.result as string
    scanQRCode()
  }
  reader.readAsDataURL(file)
}

// 将图片转换为Canvas ImageData
const imageToImageData = (imageSrc: string): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法获取Canvas上下文'))
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      resolve(imageData)
    }
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = imageSrc
  })
}

// 扫描二维码
const scanQRCode = async () => {
  if (!selectedImage.value) {
    scanError.value = '请先选择图片'
    return
  }

  scanResult.value = ''
  scanError.value = ''
  isScanning.value = true

  try {
    // 将图片转换为ImageData
    const imageData = await imageToImageData(selectedImage.value)
    
    // 使用jsQR识别二维码，尝试多种反转方案以提高识别率
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    })
    
    if (code) {
      scanResult.value = code.data
      message.success('二维码识别成功')
    } else {
      scanError.value = '未检测到二维码，请确保图片清晰且包含二维码'
      message.warning('未检测到二维码')
    }
  } catch (error) {
    scanError.value = '二维码识别失败: ' + (error as Error).message
    message.error('二维码识别失败')
  } finally {
    isScanning.value = false
  }
}

// 清除图片
const clearImage = () => {
  selectedImage.value = ''
  scanResult.value = ''
  scanError.value = ''
  isScanning.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 复制识别结果
const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(scanResult.value)
    message.success('识别结果已复制')
  } catch {
    message.error('复制失败')
  }
}
</script>

<style scoped>
.generate-section,
.scan-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.text-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  resize: vertical;
  min-height: 80px;
  transition: var(--transition-fast);
}

.text-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.qr-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.qr-image {
  max-width: 100%;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
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

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-md);
}

.preview-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
}

.scanning-status {
  text-align: center;
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.scanning-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-sm);
  animation: pulse 1.5s ease-in-out infinite;
}

.scanning-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.scan-result {
  background: var(--success-bg);
  border: 1px solid var(--success-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.result-title {
  margin: 0;
  font-size: var(--text-base);
  color: var(--success-color);
}

.result-content {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  word-break: break-all;
  color: var(--text-primary);
}

.scan-error {
  background: var(--error-bg);
  border: 1px solid var(--error-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.error-message {
  color: var(--error-color);
  font-size: var(--text-sm);
}
</style>