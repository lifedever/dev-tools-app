<template>
  <div 
    class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out"
    :class="appStore.sidebarCollapsed ? 'w-16' : 'w-60'"
  >
    <!-- Logo 区域 -->
    <div class="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 pt-4">
      <div v-if="!appStore.sidebarCollapsed" class="flex items-center">
        <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
          <WrenchScrewdriverIcon class="w-5 h-5 text-white" />
        </div>
        <span class="ml-2 text-lg font-bold text-gradient">开发工具</span>
      </div>
      <div v-else class="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
        <WrenchScrewdriverIcon class="w-5 h-5 text-white" />
      </div>
    </div>
    
    <!-- 导航菜单 -->
    <nav class="p-3 space-y-1">
      <div v-for="category in menuCategories" :key="category.name" class="mb-4">
        <!-- 分类标题 -->
        <h3 
          v-if="!appStore.sidebarCollapsed" 
          class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          {{ category.name }}
        </h3>
        
        <!-- 分类分隔线（折叠状态） -->
        <div v-else class="h-px bg-gray-200 dark:bg-gray-700 mx-2 mb-2"></div>
        
        <!-- 菜单项 -->
        <router-link
          v-for="item in category.items"
          :key="item.path"
          :to="item.path"
          class="sidebar-item group relative"
          :class="isActiveRoute(item.path) ? 'sidebar-item-active' : 'sidebar-item-inactive'"
          @click="appStore.setCurrentTool(item.path.slice(1))"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="!appStore.sidebarCollapsed" class="ml-3 truncate">{{ item.name }}</span>
          
          <!-- 工具提示（折叠状态） -->
          <div 
            v-if="appStore.sidebarCollapsed"
            class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50"
          >
            {{ item.name }}
          </div>
          
          <!-- 收藏图标 -->
          <button
            v-if="!appStore.sidebarCollapsed && appStore.favorites.includes(item.path.slice(1))"
            class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            @click.prevent="appStore.toggleFavorite(item.path.slice(1))"
          >
            <StarIcon class="w-4 h-4 text-yellow-400" />
          </button>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '../stores/app';
import {
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  HashtagIcon,
  CodeBracketIcon,
  ClockIcon,
  SwatchIcon,
  StarIcon
} from '@heroicons/vue/24/outline';

const route = useRoute();
const appStore = useAppStore();

const menuCategories = [
  {
    name: '文本处理',
    items: [
      {
        name: '字符串处理',
        path: '/string-processor',
        icon: DocumentTextIcon
      },
      {
        name: '编码转换',
        path: '/encoding',
        icon: ShieldCheckIcon
      }
    ]
  },
  {
    name: '数据工具',
    items: [
      {
        name: '哈希计算',
        path: '/hash',
        icon: HashtagIcon
      },
      {
        name: 'JSON工具',
        path: '/json',
        icon: CodeBracketIcon
      }
    ]
  },
  {
    name: '转换工具',
    items: [
      {
        name: '时间转换',
        path: '/timestamp',
        icon: ClockIcon
      },
      {
        name: '颜色工具',
        path: '/color',
        icon: SwatchIcon
      }
    ]
  }
];

const isActiveRoute = (path) => {
  return route.path === path;
};
</script>
