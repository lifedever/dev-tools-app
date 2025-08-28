import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    theme: 'light',
    sidebarCollapsed: false,
    currentTool: 'string-processor',
    recentTools: ['string-processor'],
    favorites: []
  }),
  
  getters: {
    isDark: (state) => state.theme === 'dark',
    sidebarWidth: (state) => state.sidebarCollapsed ? '64px' : '240px'
  },
  
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', this.isDark);
    },
    
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    
    setCurrentTool(tool) {
      this.currentTool = tool;
      
      // 添加到最近使用列表
      const index = this.recentTools.indexOf(tool);
      if (index > -1) {
        this.recentTools.splice(index, 1);
      }
      this.recentTools.unshift(tool);
      
      // 限制最近使用列表长度
      if (this.recentTools.length > 5) {
        this.recentTools = this.recentTools.slice(0, 5);
      }
    },
    
    toggleFavorite(tool) {
      const index = this.favorites.indexOf(tool);
      if (index > -1) {
        this.favorites.splice(index, 1);
      } else {
        this.favorites.push(tool);
      }
    },
    
    initializeTheme() {
      // 从系统偏好或本地存储读取主题设置
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.theme = savedTheme;
      } else {
        // 检测系统偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.theme = prefersDark ? 'dark' : 'light';
      }
      document.documentElement.classList.toggle('dark', this.isDark);
    }
  }
});
