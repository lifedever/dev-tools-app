import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: { name: 'StringProcessor' }
  },
  {
    path: '/string-processor',
    name: 'StringProcessor',
    component: () => import('@/views/StringProcessor.vue'),
    meta: { title: '字符串处理', icon: 'FileTextOutlined' }
  },
  {
    path: '/json-tools',
    name: 'JsonTools',
    component: () => import('@/views/JsonTools.vue'),
    meta: { title: 'JSON工具', icon: 'CodeOutlined' }
  },
  {
    path: '/encoding',
    name: 'Encoding',
    component: () => import('@/views/Encoding.vue'),
    meta: { title: '编码转换', icon: 'TranslationOutlined' }
  },
  {
    path: '/hash',
    name: 'Hash',
    component: () => import('@/views/Hash.vue'),
    meta: { title: '哈希计算', icon: 'LockOutlined' }
  },
  {
    path: '/timestamp',
    name: 'Timestamp',
    component: () => import('@/views/Timestamp.vue'),
    meta: { title: '时间戳', icon: 'ClockCircleOutlined' }
  },
  {
    path: '/image-base64',
    name: 'ImageBase64',
    component: () => import('@/views/ImageBase64.vue'),
    meta: { title: '图片Base64', icon: 'PictureOutlined' }
  },
  {
    path: '/prettier',
    name: 'Prettier',
    component: () => import('@/views/PrettierTool.vue'),
    meta: { title: '代码格式化', icon: 'CodeOutlined' }
  },
  {
    path: '/currency',
    name: 'Currency',
    component: () => import('@/views/Currency.vue'),
    meta: { title: '人民币转换', icon: 'DollarOutlined' }
  },
  {
    path: '/crontab',
    name: 'Crontab',
    component: () => import('@/views/Crontab.vue'),
    meta: { title: 'Crontab生成', icon: 'ScheduleOutlined' }
  },
  {
    path: '/quartz',
    name: 'Quartz',
    component: () => import('@/views/Quartz.vue'),
    meta: { title: 'Quartz表达式', icon: 'FieldTimeOutlined' }
  },
  {
    path: '/date-format',
    name: 'DateFormat',
    component: () => import('@/views/DateFormat.vue'),
    meta: { title: '日期格式', icon: 'CalendarOutlined' }
  },
  {
    path: '/password-generator',
    name: 'PasswordGenerator',
    component: () => import('@/views/PasswordGenerator.vue'),
    meta: { title: '密码生成', icon: 'SafetyOutlined' }
  },
  {
    path: '/qrcode',
    name: 'QRCode',
    component: () => import('@/views/QRCode.vue'),
    meta: { title: '二维码工具', icon: 'QrcodeOutlined' }
  },
  {
    path: '/text-counter',
    name: 'TextCounter',
    component: () => import('@/views/TextCounter.vue'),
    meta: { title: '文本计数', icon: 'NumberOutlined' }
  },
  {
    path: '/url-codec',
    name: 'UrlCodec',
    component: () => import('@/views/UrlCodec.vue'),
    meta: { title: 'URL编解码', icon: 'LinkOutlined' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
