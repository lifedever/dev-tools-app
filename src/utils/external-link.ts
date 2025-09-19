// 打开外部链接的工具函数
export const openExternalLink = async (url: string): Promise<void> => {
  try {
    // 验证URL格式
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      throw new Error('无效的URL格式');
    }

    // 检查electronAPI是否可用（Electron环境）
    if (window.electronAPI && window.electronAPI.openExternalLink) {
      await window.electronAPI.openExternalLink(url);
    } else {
      // 如果在浏览器环境中，使用window.open
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    console.error('打开链接失败:', error);
    // 作为备选方案，尝试使用window.open
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (fallbackError) {
      console.error('备选方案也失败:', fallbackError);
      throw new Error('无法打开链接');
    }
  }
};

// 类型声明
declare global {
  interface Window {
    electronAPI?: {
      openExternalLink: (url: string) => Promise<boolean>;
      [key: string]: any;
    };
  }
}
