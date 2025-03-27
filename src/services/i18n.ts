import { notification } from 'antd';
import { getSettings, saveSettings } from './storage';

// 语言类型
export type LanguageCode = 'zh-CN' | 'en-US';

// 翻译键值类型
export type TranslationKey = 
  | 'common.ok'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.add'
  | 'common.edit'
  | 'common.delete'
  | 'common.save'
  | 'common.reset'
  | 'common.search'
  | 'common.filter'
  | 'common.loading'
  | 'common.noData'
  | 'common.error'
  | 'common.success'
  | 'common.warning'
  | 'common.info'
  | 'common.uploadFile'
  | 'common.processing'
  | 'common.processed'
  | 'common.failed'
  | 'common.settings'
  | 'common.help'
  | 'common.about'
  | 'common.logout'
  | 'common.more'
  | 'dashboard.title'
  | 'dashboard.recentFiles'
  | 'dashboard.recentActivities'
  | 'dashboard.statistics'
  | 'dashboard.quickActions'
  | 'dashboard.tips'
  | 'fileManager.title'
  | 'fileManager.uploadFiles'
  | 'fileManager.selectFiles'
  | 'fileManager.processFiles'
  | 'fileManager.deleteFiles'
  | 'fileManager.fileType'
  | 'fileManager.fileSize'
  | 'fileManager.fileStatus'
  | 'fileManager.dropFilesHere'
  | 'knowledgeBase.title'
  | 'knowledgeBase.searchKnowledge'
  | 'knowledgeBase.categories'
  | 'knowledgeBase.tags'
  | 'knowledgeBase.addKnowledge'
  | 'knowledgeBase.editKnowledge'
  | 'knowledgeBase.deleteKnowledge'
  | 'knowledgeBase.viewDetails'
  | 'knowledgeBase.categoryAll'
  | 'questionGenerator.title'
  | 'questionGenerator.generateQuestions'
  | 'questionGenerator.selectKnowledgePoints'
  | 'questionGenerator.questionType'
  | 'questionGenerator.questionDifficulty'
  | 'questionGenerator.questionCount'
  | 'questionGenerator.generatePaper'
  | 'questionGenerator.previewPaper'
  | 'questionGenerator.exportPaper'
  | 'questionGenerator.singleChoice'
  | 'questionGenerator.multipleChoice'
  | 'questionGenerator.trueFalse'
  | 'questionGenerator.fillBlank'
  | 'questionGenerator.shortAnswer'
  | 'questionGenerator.easy'
  | 'questionGenerator.medium'
  | 'questionGenerator.hard'
  | 'settings.title'
  | 'settings.general'
  | 'settings.appearance'
  | 'settings.theme'
  | 'settings.language'
  | 'settings.defaultFilePath'
  | 'settings.autoSave'
  | 'settings.extraction'
  | 'settings.extractImages'
  | 'settings.extractTables'
  | 'settings.minConfidence'
  | 'settings.openai'
  | 'settings.apiKey'
  | 'settings.advanced'
  | 'settings.resetSettings'
  | 'settings.exportData'
  | 'settings.importData'
  | 'settings.clearData';

// 翻译接口
export interface Translations {
  [key: string]: string;
}

// 中文翻译
export const zhCN: Translations = {
  'common.ok': '确定',
  'common.cancel': '取消',
  'common.confirm': '确认',
  'common.add': '添加',
  'common.edit': '编辑',
  'common.delete': '删除',
  'common.save': '保存',
  'common.reset': '重置',
  'common.search': '搜索',
  'common.filter': '筛选',
  'common.loading': '加载中...',
  'common.noData': '暂无数据',
  'common.error': '错误',
  'common.success': '成功',
  'common.warning': '警告',
  'common.info': '信息',
  'common.uploadFile': '上传文件',
  'common.processing': '处理中',
  'common.processed': '已处理',
  'common.failed': '失败',
  'common.settings': '设置',
  'common.help': '帮助',
  'common.about': '关于',
  'common.logout': '退出',
  'common.more': '更多',
  
  'dashboard.title': '仪表盘',
  'dashboard.recentFiles': '最近文件',
  'dashboard.recentActivities': '最近活动',
  'dashboard.statistics': '统计数据',
  'dashboard.quickActions': '快捷操作',
  'dashboard.tips': '使用技巧',
  
  'fileManager.title': '文件管理',
  'fileManager.uploadFiles': '上传文件',
  'fileManager.selectFiles': '选择文件',
  'fileManager.processFiles': '处理文件',
  'fileManager.deleteFiles': '删除文件',
  'fileManager.fileType': '文件类型',
  'fileManager.fileSize': '文件大小',
  'fileManager.fileStatus': '文件状态',
  'fileManager.dropFilesHere': '将文件拖放到此处',
  
  'knowledgeBase.title': '知识库',
  'knowledgeBase.searchKnowledge': '搜索知识点',
  'knowledgeBase.categories': '分类',
  'knowledgeBase.tags': '标签',
  'knowledgeBase.addKnowledge': '添加知识点',
  'knowledgeBase.editKnowledge': '编辑知识点',
  'knowledgeBase.deleteKnowledge': '删除知识点',
  'knowledgeBase.viewDetails': '查看详情',
  'knowledgeBase.categoryAll': '全部',
  
  'questionGenerator.title': '题目生成',
  'questionGenerator.generateQuestions': '生成题目',
  'questionGenerator.selectKnowledgePoints': '选择知识点',
  'questionGenerator.questionType': '题目类型',
  'questionGenerator.questionDifficulty': '难度级别',
  'questionGenerator.questionCount': '题目数量',
  'questionGenerator.generatePaper': '生成试卷',
  'questionGenerator.previewPaper': '预览试卷',
  'questionGenerator.exportPaper': '导出试卷',
  'questionGenerator.singleChoice': '单选题',
  'questionGenerator.multipleChoice': '多选题',
  'questionGenerator.trueFalse': '判断题',
  'questionGenerator.fillBlank': '填空题',
  'questionGenerator.shortAnswer': '简答题',
  'questionGenerator.easy': '简单',
  'questionGenerator.medium': '中等',
  'questionGenerator.hard': '困难',
  
  'settings.title': '设置',
  'settings.general': '常规设置',
  'settings.appearance': '外观',
  'settings.theme': '主题',
  'settings.language': '语言',
  'settings.defaultFilePath': '默认文件路径',
  'settings.autoSave': '自动保存',
  'settings.extraction': '提取设置',
  'settings.extractImages': '提取图片',
  'settings.extractTables': '提取表格',
  'settings.minConfidence': '最小置信度',
  'settings.openai': 'OpenAI设置',
  'settings.apiKey': 'API密钥',
  'settings.advanced': '高级设置',
  'settings.resetSettings': '重置设置',
  'settings.exportData': '导出数据',
  'settings.importData': '导入数据',
  'settings.clearData': '清除数据',
};

// 英文翻译
export const enUS: Translations = {
  'common.ok': 'OK',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.add': 'Add',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.save': 'Save',
  'common.reset': 'Reset',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.loading': 'Loading...',
  'common.noData': 'No Data',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.warning': 'Warning',
  'common.info': 'Information',
  'common.uploadFile': 'Upload File',
  'common.processing': 'Processing',
  'common.processed': 'Processed',
  'common.failed': 'Failed',
  'common.settings': 'Settings',
  'common.help': 'Help',
  'common.about': 'About',
  'common.logout': 'Logout',
  'common.more': 'More',
  
  'dashboard.title': 'Dashboard',
  'dashboard.recentFiles': 'Recent Files',
  'dashboard.recentActivities': 'Recent Activities',
  'dashboard.statistics': 'Statistics',
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.tips': 'Tips',
  
  'fileManager.title': 'File Manager',
  'fileManager.uploadFiles': 'Upload Files',
  'fileManager.selectFiles': 'Select Files',
  'fileManager.processFiles': 'Process Files',
  'fileManager.deleteFiles': 'Delete Files',
  'fileManager.fileType': 'File Type',
  'fileManager.fileSize': 'File Size',
  'fileManager.fileStatus': 'File Status',
  'fileManager.dropFilesHere': 'Drop files here',
  
  'knowledgeBase.title': 'Knowledge Base',
  'knowledgeBase.searchKnowledge': 'Search Knowledge',
  'knowledgeBase.categories': 'Categories',
  'knowledgeBase.tags': 'Tags',
  'knowledgeBase.addKnowledge': 'Add Knowledge',
  'knowledgeBase.editKnowledge': 'Edit Knowledge',
  'knowledgeBase.deleteKnowledge': 'Delete Knowledge',
  'knowledgeBase.viewDetails': 'View Details',
  'knowledgeBase.categoryAll': 'All',
  
  'questionGenerator.title': 'Question Generator',
  'questionGenerator.generateQuestions': 'Generate Questions',
  'questionGenerator.selectKnowledgePoints': 'Select Knowledge Points',
  'questionGenerator.questionType': 'Question Type',
  'questionGenerator.questionDifficulty': 'Difficulty Level',
  'questionGenerator.questionCount': 'Question Count',
  'questionGenerator.generatePaper': 'Generate Paper',
  'questionGenerator.previewPaper': 'Preview Paper',
  'questionGenerator.exportPaper': 'Export Paper',
  'questionGenerator.singleChoice': 'Single Choice',
  'questionGenerator.multipleChoice': 'Multiple Choice',
  'questionGenerator.trueFalse': 'True/False',
  'questionGenerator.fillBlank': 'Fill in the Blank',
  'questionGenerator.shortAnswer': 'Short Answer',
  'questionGenerator.easy': 'Easy',
  'questionGenerator.medium': 'Medium',
  'questionGenerator.hard': 'Hard',
  
  'settings.title': 'Settings',
  'settings.general': 'General',
  'settings.appearance': 'Appearance',
  'settings.theme': 'Theme',
  'settings.language': 'Language',
  'settings.defaultFilePath': 'Default File Path',
  'settings.autoSave': 'Auto Save',
  'settings.extraction': 'Extraction',
  'settings.extractImages': 'Extract Images',
  'settings.extractTables': 'Extract Tables',
  'settings.minConfidence': 'Minimum Confidence',
  'settings.openai': 'OpenAI Settings',
  'settings.apiKey': 'API Key',
  'settings.advanced': 'Advanced',
  'settings.resetSettings': 'Reset Settings',
  'settings.exportData': 'Export Data',
  'settings.importData': 'Import Data',
  'settings.clearData': 'Clear Data',
};

// 语言映射
export const languageMap: Record<LanguageCode, Translations> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// 获取当前语言
export const getCurrentLanguage = (): LanguageCode => {
  const settings = getSettings();
  return settings.language as LanguageCode;
};

// 翻译函数
export const translate = (key: TranslationKey, variables?: Record<string, string>): string => {
  const language = getCurrentLanguage();
  const translations = languageMap[language];
  
  if (!translations) {
    console.error(`未找到语言 ${language} 的翻译`);
    return key;
  }
  
  let translation = translations[key];
  
  if (!translation) {
    console.error(`未找到键 ${key} 的翻译`);
    return key;
  }
  
  // 替换变量
  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      translation = translation.replace(new RegExp(`{${varKey}}`, 'g'), value);
    });
  }
  
  return translation;
};

// 简写翻译函数
export const t = translate;

// 设置语言
export const setLanguage = (language: LanguageCode): void => {
  const settings = getSettings();
  
  if (settings.language === language) {
    return; // 语言没有变化，不需要切换
  }
  
  // 更新 localStorage 中的设置
  settings.language = language;
  saveSettings(settings);
  
  // 更新 html 的 lang 属性
  document.documentElement.setAttribute('lang', language);
  
  notification.success({
    message: translate('common.success'),
    description: `${language === 'zh-CN' ? '语言已切换为中文' : 'Language changed to English'}`,
  });
};

// 获取浏览器语言
export const getBrowserLanguage = (): LanguageCode => {
  const browserLang = navigator.language;
  return browserLang.startsWith('zh') ? 'zh-CN' : 'en-US';
};

// 初始化语言
export const initializeLanguage = (): void => {
  const language = getCurrentLanguage();
  document.documentElement.setAttribute('lang', language);
}; 