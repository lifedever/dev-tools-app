<template>
  <div class="tool-container">
    <div class="tool-content">
      <!-- 颜色选择和转换 -->
      <div class="input-output-container">
        <!-- 颜色选择器 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">颜色选择器</div>
          </div>
          <div class="tool-card-body">
            <div class="color-picker-section">
              <div class="color-display" :style="{ backgroundColor: selectedColor }">
                <input
                  type="color"
                  v-model="selectedColor"
                  class="color-input"
                />
              </div>
              
              <div class="color-inputs">
                <div class="input-group">
                  <label class="input-label">HEX</label>
                  <input
                    v-model="hexColor"
                    placeholder="#FF0000"
                    class="color-text-input"
                    @input="updateFromHex"
                  />
                </div>
                
                <div class="input-group">
                  <label class="input-label">RGB</label>
                  <input
                    v-model="rgbColor"
                    placeholder="rgb(255, 0, 0)"
                    class="color-text-input"
                    @input="updateFromRgb"
                  />
                </div>
                
                <div class="input-group">
                  <label class="input-label">HSL</label>
                  <input
                    v-model="hslColor"
                    placeholder="hsl(0, 100%, 50%)"
                    class="color-text-input"
                    @input="updateFromHsl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 颜色格式转换 -->
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">颜色格式</div>
          </div>
          <div class="tool-card-body">
            <div class="color-formats">
              <div v-for="format in colorFormats" :key="format.label" class="format-item">
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

      <!-- 调色板生成 -->
      <div class="actions-container">
        <div class="tool-card">
          <div class="tool-card-header">
            <div class="tool-card-title">调色板生成</div>
          </div>
          <div class="tool-card-body">
            <div class="palette-section">
              <div class="palette-controls">
                <button class="btn-primary" @click="generatePalette('monochromatic')">单色调色板</button>
                <button class="btn-secondary" @click="generatePalette('complementary')">互补色</button>
                <button class="btn-secondary" @click="generatePalette('triadic')">三角色</button>
                <button class="btn-secondary" @click="generatePalette('analogous')">相似色</button>
              </div>
              
              <div v-if="palette.length > 0" class="palette-display">
                <div 
                  v-for="(color, index) in palette" 
                  :key="index"
                  class="palette-color"
                  :style="{ backgroundColor: color }"
                  @click="selectPaletteColor(color)"
                  :title="color"
                >
                  <span class="palette-color-text">{{ color }}</span>
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

const selectedColor = ref('#FF0000')
const hexColor = ref('#FF0000')
const rgbColor = ref('rgb(255, 0, 0)')
const hslColor = ref('hsl(0, 100%, 50%)')
const palette = ref<string[]>([])

// 颜色格式转换
const colorFormats = computed(() => {
  const rgb = hexToRgb(selectedColor.value)
  if (!rgb) return []
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  return [
    { label: 'HEX', value: selectedColor.value.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
    { label: 'HSL', value: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)` },
    { label: 'HSLA', value: `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, 1)` },
    { label: 'CSS变量', value: `--primary-color: ${selectedColor.value};` },
    { label: 'Android', value: `#FF${selectedColor.value.substring(1).toUpperCase()}` },
    { label: 'Swift', value: `UIColor(red: ${(rgb.r/255).toFixed(3)}, green: ${(rgb.g/255).toFixed(3)}, blue: ${(rgb.b/255).toFixed(3)}, alpha: 1.0)` }
  ]
})

// 监听颜色变化
watch(selectedColor, (newColor) => {
  hexColor.value = newColor
  const rgb = hexToRgb(newColor)
  if (rgb) {
    rgbColor.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    hslColor.value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`
  }
})

// 从不同格式更新颜色
const updateFromHex = () => {
  if (isValidHex(hexColor.value)) {
    selectedColor.value = hexColor.value
  }
}

const updateFromRgb = () => {
  const rgb = parseRgb(rgbColor.value)
  if (rgb) {
    selectedColor.value = rgbToHex(rgb.r, rgb.g, rgb.b)
  }
}

const updateFromHsl = () => {
  const hsl = parseHsl(hslColor.value)
  if (hsl) {
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l)
    selectedColor.value = rgbToHex(rgb.r, rgb.g, rgb.b)
  }
}

// 复制颜色格式
const copyFormat = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    message.success('颜色值已复制')
  } catch {
    message.error('复制失败')
  }
}

// 生成调色板
const generatePalette = (type: string) => {
  const rgb = hexToRgb(selectedColor.value)
  if (!rgb) return
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors: string[] = []
  
  switch (type) {
    case 'monochromatic':
      for (let i = 0; i < 5; i++) {
        const lightness = Math.max(10, Math.min(90, hsl.l + (i - 2) * 20))
        const color = hslToRgb(hsl.h, hsl.s, lightness)
        colors.push(rgbToHex(color.r, color.g, color.b))
      }
      break
      
    case 'complementary':
      colors.push(selectedColor.value)
      const complementaryHue = (hsl.h + 180) % 360
      const complementary = hslToRgb(complementaryHue, hsl.s, hsl.l)
      colors.push(rgbToHex(complementary.r, complementary.g, complementary.b))
      break
      
    case 'triadic':
      for (let i = 0; i < 3; i++) {
        const hue = (hsl.h + i * 120) % 360
        const color = hslToRgb(hue, hsl.s, hsl.l)
        colors.push(rgbToHex(color.r, color.g, color.b))
      }
      break
      
    case 'analogous':
      for (let i = -2; i <= 2; i++) {
        const hue = (hsl.h + i * 30 + 360) % 360
        const color = hslToRgb(hue, hsl.s, hsl.l)
        colors.push(rgbToHex(color.r, color.g, color.b))
      }
      break
  }
  
  palette.value = colors
  message.success(`${type === 'monochromatic' ? '单色' : type === 'complementary' ? '互补色' : type === 'triadic' ? '三角色' : '相似色'}调色板已生成`)
}

// 选择调色板中的颜色
const selectPaletteColor = (color: string) => {
  selectedColor.value = color
  message.success(`已选择颜色 ${color}`)
}

// 辅助函数
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 }
}

const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360
  s /= 100
  l /= 100
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

const isValidHex = (hex: string) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

const parseRgb = (rgb: string) => {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  return match ? {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3])
  } : null
}

const parseHsl = (hsl: string) => {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  return match ? {
    h: parseInt(match[1]),
    s: parseInt(match[2]),
    l: parseInt(match[3])
  } : null
}
</script>

<style scoped>
.color-picker-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.color-display {
  width: 100%;
  height: 120px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-light);
  position: relative;
  cursor: pointer;
  transition: var(--transition-fast);
}

.color-display:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
}

.color-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.color-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.color-text-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  transition: var(--transition-fast);
}

.color-text-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.color-formats {
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

.palette-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.palette-controls {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.palette-display {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.palette-color {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: end;
  justify-content: center;
  padding: var(--spacing-xs);
  transition: var(--transition-fast);
  border: 2px solid var(--border-light);
}

.palette-color:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-lg);
}

.palette-color-text {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 4px;
  border-radius: 2px;
}
</style>