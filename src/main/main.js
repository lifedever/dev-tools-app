const { app, BrowserWindow, ipcMain, clipboard, shell } = require('electron');
const path = require('path');
const crypto = require('crypto');
const forge = require('node-forge');

let mainWindow;

function createWindow() {
  const windowOptions = {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'DevTools',
    show: false, // 窗口创建时先隐藏，ready-to-show时再显示
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  };

  // 根据平台设置不同的窗口样式
  if (process.platform === 'darwin') {
    // macOS
    windowOptions.titleBarStyle = 'default';
    windowOptions.trafficLightPosition = { x: 20, y: 20 };
  } else if (process.platform === 'win32') {
    // Windows
    windowOptions.frame = true;
    windowOptions.titleBarStyle = 'default';
  } else {
    // Linux 和其他平台
    windowOptions.frame = true;
  }

  // 设置图标路径
  const iconPath = path.join(__dirname, '../assets/icon.png');
  if (require('fs').existsSync(iconPath)) {
    windowOptions.icon = iconPath;
  }

  mainWindow = new BrowserWindow(windowOptions);

  // 窗口准备好后再显示，避免闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 开发环境加载Vite服务器，生产环境加载构建后的文件
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 在打包后的应用中，dist文件夹被打包到app.asar中
    let indexPath;
    if (app.isPackaged) {
      // 打包后：__dirname 是 app.asar/src/main，需要跳到 app.asar 根目录然后进入 dist
      indexPath = path.join(__dirname, '../../dist/index.html');
    } else {
      // 开发时的路径
      indexPath = path.join(__dirname, '../../dist/index.html');
    }
    
    console.log('Loading file from:', indexPath);
    console.log('Current __dirname:', __dirname);
    console.log('app.isPackaged:', app.isPackaged);
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC 处理程序：字符串处理
ipcMain.handle('process-string', async (event, { text, operation }) => {
  try {
    switch (operation) {
      case 'format-markdown':
        // 处理从AI服务器复制的markdown，去除转义字符
        return text
          .replace(/\\r\\n/g, '\n')
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\\"/g, '"')
          .replace(/\\\'/g, "'")
          .replace(/\\\\/g, '\\')
          .trim();
      
      case 'escape-markdown':
        // 反向操作：转义markdown
        return text
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'")
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
      
      case 'base64-encode':
        return Buffer.from(text, 'utf8').toString('base64');
      
      case 'base64-decode':
        return Buffer.from(text, 'base64').toString('utf8');
      
      case 'url-encode':
        return encodeURIComponent(text);
      
      case 'url-decode':
        return decodeURIComponent(text);
      
      case 'html-encode':
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      
      case 'html-decode':
        return text
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'");
      
      case 'markdown':
        // 处理markdown格式
        return text
          .replace(/\\r\\n/g, '\n')
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\\"/g, '"')
          .replace(/\\\'/g, "'")
          .replace(/\\\\/g, '\\')
          .trim();
      
      case 'json-escape':
        // JSON转义
        return JSON.stringify(text).slice(1, -1);
      
      case 'json-unescape':
        // JSON反转义
        try {
          return JSON.parse('"' + text + '"');
        } catch (error) {
          throw new Error('无效的JSON转义字符串');
        }
      
      default:
        throw new Error(`未知操作: ${operation}`);
    }
  } catch (error) {
    throw new Error(`处理失败: ${error.message}`);
  }
});

// IPC 处理程序：哈希计算
ipcMain.handle('calculate-hash', async (event, { text, algorithm }) => {
  try {
    switch (algorithm) {
      case 'md5':
        return crypto.createHash('md5').update(text, 'utf8').digest('hex');
      
      case 'sha1':
        return crypto.createHash('sha1').update(text, 'utf8').digest('hex');
      
      case 'sha256':
        return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
      
      case 'sha512':
        return crypto.createHash('sha512').update(text, 'utf8').digest('hex');
      
      default:
        throw new Error(`未支持的哈希算法: ${algorithm}`);
    }
  } catch (error) {
    throw new Error(`哈希计算失败: ${error.message}`);
  }
});

// 增强的JSON清理和验证函数（主进程版本）
const cleanAndValidateJsonMain = (text) => {
  try {
    // 1. 直接尝试解析原始文本
    JSON.parse(text);
    return { valid: true, message: 'JSON格式正确', cleanedText: text };
  } catch (error) {
    // 2. 如果失败，尝试清理和修复
    try {
      let cleaned = text;
      
      // 移除BOM字符
      cleaned = cleaned.replace(/^\uFEFF/, '');
      
      // 移除注释 (// 和 /* */)
      cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
      cleaned = cleaned.replace(/\/\/.*$/gm, '');
      
      // 处理单引号为双引号
      cleaned = cleaned.replace(/'/g, '"');
      
      // 移除多余的逗号
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
      
      // 处理尾随逗号
      cleaned = cleaned.replace(/,(\s*})/g, '}');
      cleaned = cleaned.replace(/,(\s*])/g, ']');
      
      // 处理未引用的键名
      cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
      
      // 移除控制字符但保留有效的JSON转义序列
      cleaned = cleaned.replace(/[\x00-\x1f\x7f-\x9f]/g, (char) => {
        const code = char.charCodeAt(0);
        switch (code) {
          case 9: return '\\t';   // Tab
          case 10: return '\\n';  // 换行
          case 13: return '\\r';  // 回车
          default: return '';     // 移除其他控制字符
        }
      });
      
      // 处理多行字符串
      cleaned = cleaned.replace(/"([^"\\]*(\\.[^"\\]*)*)\n([^"\\]*(\\.[^"\\]*)*)"/, '"$1\\n$3"');
      
      // 再次尝试解析
      JSON.parse(cleaned);
      return { 
        valid: true, 
        message: 'JSON格式已修复并验证通过', 
        cleanedText: cleaned,
        wasFixed: true 
      };
    } catch (cleanError) {
      // 3. 如果清理后仍然失败，尝试部分修复
      try {
        let partialFixed = text;
        
        // 查找可能的截断位置
        const lastValidBrace = Math.max(
          partialFixed.lastIndexOf('}'),
          partialFixed.lastIndexOf(']')
        );
        
        if (lastValidBrace > 0) {
          partialFixed = partialFixed.substring(0, lastValidBrace + 1);
          JSON.parse(partialFixed);
          
          return {
            valid: true,
            message: '检测到JSON可能被截断，已修复为有效JSON',
            cleanedText: partialFixed,
            wasFixed: true,
            wasTruncated: true
          };
        }
      } catch (truncateError) {
        // 最后尝试：提取可能的JSON片段
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (jsonMatch) {
            JSON.parse(jsonMatch[0]);
            return {
              valid: true,
              message: '从文本中提取到有效的JSON片段',
              cleanedText: jsonMatch[0],
              wasFixed: true,
              wasExtracted: true
            };
          }
        } catch (extractError) {
          // 所有尝试都失败
        }
      }
      
      return { 
        valid: false, 
        message: `JSON解析失败: ${error.message}`,
        suggestions: [
          '检查是否有未闭合的括号或引号',
          '确认所有字符串都用双引号包围',
          '移除注释和尾随逗号',
          '检查特殊字符是否正确转义'
        ]
      };
    }
  }
};

// IPC 处理程序：JSON处理
ipcMain.handle('process-json', async (event, { text, operation }) => {
  try {
    switch (operation) {
      case 'validate':
        return cleanAndValidateJsonMain(text);
      
      case 'format':
        // 尝试清理后再格式化
        const validationResult = cleanAndValidateJsonMain(text);
        if (validationResult.valid) {
          const parsedData = JSON.parse(validationResult.cleanedText);
          return JSON.stringify(parsedData, null, 2);
        } else {
          throw new Error(validationResult.message);
        }
      
      case 'minify':
        // 尝试清理后再压缩
        const minifyValidation = cleanAndValidateJsonMain(text);
        if (minifyValidation.valid) {
          const minifyData = JSON.parse(minifyValidation.cleanedText);
          return JSON.stringify(minifyData);
        } else {
          throw new Error(minifyValidation.message);
        }
      
      default:
        throw new Error(`未知操作: ${operation}`);
    }
  } catch (error) {
    throw new Error(`JSON处理失败: ${error.message}`);
  }
});

// IPC 处理程序：时间戳转换
ipcMain.handle('convert-timestamp', async (event, { value, operation }) => {
  try {
    switch (operation) {
      case 'to-date':
        const timestamp = parseInt(value);
        const date = new Date(timestamp.toString().length === 10 ? timestamp * 1000 : timestamp);
        return {
          iso: date.toISOString(),
          local: date.toLocaleString('zh-CN'),
          utc: date.toUTCString()
        };
      
      case 'to-timestamp':
        const dateObj = new Date(value);
        return {
          seconds: Math.floor(dateObj.getTime() / 1000),
          milliseconds: dateObj.getTime()
        };
      
      case 'now':
        const now = new Date();
        return {
          timestamp: now.getTime(),
          timestampSeconds: Math.floor(now.getTime() / 1000),
          iso: now.toISOString(),
          local: now.toLocaleString('zh-CN')
        };
      
      default:
        throw new Error(`未知操作: ${operation}`);
    }
  } catch (error) {
    throw new Error(`时间转换失败: ${error.message}`);
  }
});

// IPC 处理程序：剪贴板操作
ipcMain.handle('clipboard-read-text', async () => {
  try {
    return clipboard.readText();
  } catch (error) {
    throw new Error(`剪贴板读取失败: ${error.message}`);
  }
});

ipcMain.handle('clipboard-write-text', async (event, text) => {
  try {
    clipboard.writeText(text);
    return true;
  } catch (error) {
    throw new Error(`剪贴板写入失败: ${error.message}`);
  }
});

// IPC 处理程序：打开外部链接
ipcMain.handle('open-external-link', async (event, url) => {
  try {
    // 验证URL格式
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      throw new Error('无效的URL格式，只支持http和https链接');
    }
    
    // 使用shell.openExternal在默认浏览器中打开链接
    await shell.openExternal(url);
    return true;
  } catch (error) {
    throw new Error(`打开链接失败: ${error.message}`);
  }
});
