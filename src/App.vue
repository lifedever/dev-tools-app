<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapsed: collapsed }">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo">
          <tool-outlined class="logo-icon" />
          <span v-if="!collapsed" class="logo-text">DevTools</span>
        </div>
      </div>

      <!-- 菜单区域 -->
      <div class="menu-section">
        <div class="menu-group" v-for="group in menuGroups" :key="group.title">
          <div class="group-title" v-if="!collapsed">{{ group.title }}</div>
          <div class="menu-items">
            <div v-for="item in group.items" :key="item.key" class="menu-item"
              :class="{ active: selectedKeys.includes(item.key) }" @click="handleMenuClick(item.key)">
              <component :is="item.icon" class="menu-icon" />
              <span v-if="!collapsed" class="menu-text">{{ item.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="header">
        <div class="header-left">
          <h1 class="page-title">{{ currentRouteTitle }}</h1>
        </div>
        <div class="header-right">
          <span class="version">v{{ packageInfo.version }}</span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <router-view />
      </div>

      <!-- 底部信息 -->
      <div class="footer">
        DevTools ©{{ new Date().getFullYear() }} Created with &nbsp;
        <a href="#" style="color: var(--primary-color); font-weight: bold;" @click.prevent="openExternalLink('https://github.com/lifedever')">Lifedever ❤️</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import packageInfo from "../package.json";
import { openExternalLink } from "@/utils/external-link";
import {
  ToolOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  CodeOutlined,
  TranslationOutlined,
  LockOutlined,
  ClockCircleOutlined,
  PictureOutlined,
  CalendarOutlined,
  DollarOutlined,
  ScheduleOutlined,
  FieldTimeOutlined,
  SafetyOutlined,
  QrcodeOutlined,
  NumberOutlined,
  LinkOutlined,
} from "@ant-design/icons-vue";

const route = useRoute();
const router = useRouter();

// 响应式状态
const collapsed = ref(false);
const selectedKeys = ref<string[]>([]);

// 菜单配置
const menuGroups = [
  {
    title: "文本处理",
    items: [
      { key: "StringProcessor", icon: FileTextOutlined, title: "字符串处理" },
      { key: "JsonTools", icon: CodeOutlined, title: "JSON工具" },
      { key: "Prettier", icon: CodeOutlined, title: "代码格式化" },
      { key: "TextCounter", icon: NumberOutlined, title: "文本计数" },
    ],
  },
  {
    title: "编码工具",
    items: [
      { key: "Encoding", icon: TranslationOutlined, title: "编码转换" },
      { key: "Hash", icon: LockOutlined, title: "哈希计算" },
      { key: "UrlCodec", icon: LinkOutlined, title: "URL编码" },
    ],
  },
  {
    title: "时间工具",
    items: [
      { key: "Timestamp", icon: FieldTimeOutlined, title: "时间戳转换" },
      { key: "DateFormat", icon: CalendarOutlined, title: "日期格式" },
      { key: "Crontab", icon: ScheduleOutlined, title: "Crontab生成" },
      { key: "Quartz", icon: ScheduleOutlined, title: "Quartz生成" },
    ],
  },
  {
    title: "实用工具",
    items: [
      { key: "ImageBase64", icon: PictureOutlined, title: "图片转换" },
      { key: "PasswordGenerator", icon: SafetyOutlined, title: "密码生成" },
      { key: "QRCode", icon: QrcodeOutlined, title: "二维码" },
      { key: "Currency", icon: DollarOutlined, title: "金额大写" },
    ],
  },
];

// 计算属性
const currentRouteTitle = computed(() => {
  for (const group of menuGroups) {
    const item = group.items.find((item) => item.key === route.name);
    if (item) return item.title;
  }
  return "DevTools";
});

// 切换侧边栏
const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
};

// 处理菜单点击
const handleMenuClick = (key: string) => {
  router.push({ name: key });
};


// 监听路由变化
watch(
  route,
  (newRoute) => {
    if (newRoute.name) {
      selectedKeys.value = [newRoute.name as string];
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-secondary);
}

/* 侧边栏样式 */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg,
      var(--bg-primary) 0%,
      var(--bg-secondary) 100%);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
  box-shadow: var(--shadow-lg);
}

.sidebar.collapsed {
  width: 64px;
}

.logo-section {
  height: 56px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  position: relative;
}

.logo {
  width: 130px;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  background: linear-gradient(135deg, 
    rgba(var(--primary-rgb), 0.1), 
    rgba(var(--primary-rgb), 0.05));
  border: 1px solid rgba(var(--primary-rgb), 0.2);
}

.logo:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
  background: linear-gradient(135deg, 
    rgba(var(--primary-rgb), 0.15), 
    rgba(var(--primary-rgb), 0.08));
  border-color: rgba(var(--primary-rgb), 0.3);
}

.logo-icon {
  font-size: 24px;
  color: var(--primary-color);
  text-shadow: 0 0 10px rgba(var(--primary-rgb), 0.3);
}

.logo-text {
  font-size: var(--text-lg);
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  transition: var(--transition-fast);
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
}

.menu-section {
  flex: 1;
  padding: var(--spacing-lg) 0;
  overflow-y: auto;
}

.menu-group {
  margin-bottom: var(--spacing-xl);
}

.group-title {
  padding: 0 var(--spacing-lg) var(--spacing-md);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
}

.menu-items {
  padding: 0 var(--spacing-md);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  margin: var(--spacing-xs) 0;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
  position: relative;
  font-size: var(--text-base);
  font-weight: 500;
}

.menu-item:hover {
  background: var(--primary-bg);
  color: var(--primary-color);
  transform: translateX(4px);
}

.menu-item.active {
  background: linear-gradient(135deg,
      var(--primary-color),
      var(--primary-dark));
  color: var(--text-inverse);
  font-weight: 600;
  box-shadow: var(--shadow-md);
}

.menu-item.active::before {
  content: "";
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 2px;
}

.menu-icon {
  font-size: 18px;
  min-width: 18px;
  opacity: 0.8;
  transition: var(--transition-fast);
}

.menu-item:hover .menu-icon {
  opacity: 1;
  transform: scale(1.1);
}

.menu-text {
  font-size: var(--text-base);
  white-space: nowrap;
  font-weight: 500;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left var(--transition-normal);
}

.sidebar.collapsed+.main-content {
  margin-left: 64px;
}

.header {
  height: 56px;
  padding: 0 var(--spacing-lg);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.page-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  background: linear-gradient(135deg,
      var(--primary-color),
      var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.version {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--primary-bg);
  border: 1px solid var(--primary-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: var(--bg-secondary);
}

.footer {
  height: 40px;
  padding: 0 var(--spacing-lg);
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: 500;
}

/* 滚动条样式 */
.menu-section::-webkit-scrollbar,
.content-area::-webkit-scrollbar {
  width: 6px;
}

.menu-section::-webkit-scrollbar-track,
.content-area::-webkit-scrollbar-track {
  background: transparent;
}

.menu-section::-webkit-scrollbar-thumb,
.content-area::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.menu-section::-webkit-scrollbar-thumb:hover,
.content-area::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar:not(.collapsed) {
    position: fixed;
    z-index: 1000;
    height: 100vh;
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
