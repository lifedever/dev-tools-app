const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 字符串处理
  processString: (text, operation) => ipcRenderer.invoke('process-string', { text, operation }),
  
  // 哈希计算
  calculateHash: (text, algorithm) => ipcRenderer.invoke('calculate-hash', { text, algorithm }),
  
  // JSON处理
  processJson: (text, operation) => ipcRenderer.invoke('process-json', { text, operation }),
  
  // 时间戳转换
  convertTimestamp: (value, operation) => ipcRenderer.invoke('convert-timestamp', { value, operation }),
  
  // 剪贴板操作（支持大文本）
  clipboard: {
    readText: () => ipcRenderer.invoke('clipboard-read-text'),
    writeText: (text) => ipcRenderer.invoke('clipboard-write-text', text)
  }
});
