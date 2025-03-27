const { contextBridge, ipcRenderer } = require('electron');

// 暴露APIs到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // PDF处理
  processPdf: (filePath) => ipcRenderer.invoke('process-pdf', filePath),
  
  // PPT处理
  processPpt: (filePath) => ipcRenderer.invoke('process-ppt', filePath),
  
  // 视频处理
  processVideo: (filePath) => ipcRenderer.invoke('process-video', filePath),
  
  // 数据库操作
  saveKnowledgePoint: (data) => ipcRenderer.invoke('save-knowledge-point', data),
  getKnowledgePoints: (filters) => ipcRenderer.invoke('get-knowledge-points', filters),
  
  // 题目生成
  generateQuestions: (params) => ipcRenderer.invoke('generate-questions', params),
  
  // 系统操作
  showNotification: (message) => ipcRenderer.invoke('show-notification', message)
}); 