import { notification } from 'antd';
import { KnowledgePoint, ProcessResult } from './extraction';
import { Question, Paper } from './questionGeneration';

// 本地存储键
const STORAGE_KEYS = {
  KNOWLEDGE_POINTS: 'knowledge_points',
  PROCESS_RESULTS: 'process_results',
  QUESTIONS: 'questions',
  PAPERS: 'papers',
  SETTINGS: 'settings',
};

// 将数据保存到本地存储
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
  } catch (error) {
    console.error(`保存数据到本地存储失败 [${key}]:`, error);
    notification.error({
      message: '保存数据失败',
      description: '无法将数据保存到本地存储，请检查浏览器设置或清理缓存后重试。',
    });
  }
};

// 从本地存储获取数据
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const jsonData = localStorage.getItem(key);
    if (jsonData) {
      return JSON.parse(jsonData) as T;
    }
  } catch (error) {
    console.error(`从本地存储获取数据失败 [${key}]:`, error);
    notification.error({
      message: '读取数据失败',
      description: '无法从本地存储读取数据，将返回默认值。',
    });
  }
  return defaultValue;
};

// 从本地存储移除数据
export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`从本地存储删除数据失败 [${key}]:`, error);
  }
};

// 清除所有本地存储数据
export const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
    notification.success({
      message: '数据已清除',
      description: '所有本地存储的数据已被清除。',
    });
  } catch (error) {
    console.error('清除本地存储失败:', error);
    notification.error({
      message: '清除数据失败',
      description: '无法清除本地存储的数据。',
    });
  }
};

// 保存知识点
export const saveKnowledgePoints = (knowledgePoints: KnowledgePoint[]): void => {
  saveToLocalStorage(STORAGE_KEYS.KNOWLEDGE_POINTS, knowledgePoints);
};

// 获取所有知识点
export const getKnowledgePoints = (): KnowledgePoint[] => {
  return getFromLocalStorage<KnowledgePoint[]>(STORAGE_KEYS.KNOWLEDGE_POINTS, []);
};

// 添加知识点
export const addKnowledgePoint = (knowledgePoint: KnowledgePoint): void => {
  const knowledgePoints = getKnowledgePoints();
  knowledgePoints.push(knowledgePoint);
  saveKnowledgePoints(knowledgePoints);
  
  notification.success({
    message: '知识点已添加',
    description: '新的知识点已成功添加到知识库。',
  });
};

// 批量添加知识点
export const addKnowledgePoints = (newPoints: KnowledgePoint[]): void => {
  if (newPoints.length === 0) return;
  
  const knowledgePoints = getKnowledgePoints();
  const updatedPoints = [...knowledgePoints, ...newPoints];
  saveKnowledgePoints(updatedPoints);
  
  notification.success({
    message: '知识点已添加',
    description: `${newPoints.length} 个新知识点已成功添加到知识库。`,
  });
};

// 更新知识点
export const updateKnowledgePoint = (updatedPoint: KnowledgePoint): boolean => {
  const knowledgePoints = getKnowledgePoints();
  const index = knowledgePoints.findIndex(point => point.id === updatedPoint.id);
  
  if (index === -1) {
    notification.error({
      message: '更新失败',
      description: '找不到指定的知识点。',
    });
    return false;
  }
  
  knowledgePoints[index] = updatedPoint;
  saveKnowledgePoints(knowledgePoints);
  
  notification.success({
    message: '知识点已更新',
    description: '知识点信息已成功更新。',
  });
  
  return true;
};

// 删除知识点
export const deleteKnowledgePoint = (pointId: string): boolean => {
  const knowledgePoints = getKnowledgePoints();
  const filteredPoints = knowledgePoints.filter(point => point.id !== pointId);
  
  if (filteredPoints.length === knowledgePoints.length) {
    notification.error({
      message: '删除失败',
      description: '找不到指定的知识点。',
    });
    return false;
  }
  
  saveKnowledgePoints(filteredPoints);
  
  notification.success({
    message: '知识点已删除',
    description: '知识点已从知识库中移除。',
  });
  
  return true;
};

// 保存处理结果
export const saveProcessResults = (results: ProcessResult[]): void => {
  saveToLocalStorage(STORAGE_KEYS.PROCESS_RESULTS, results);
};

// 获取所有处理结果
export const getProcessResults = (): ProcessResult[] => {
  return getFromLocalStorage<ProcessResult[]>(STORAGE_KEYS.PROCESS_RESULTS, []);
};

// 添加处理结果
export const addProcessResult = (result: ProcessResult): void => {
  const results = getProcessResults();
  results.push(result);
  saveProcessResults(results);
};

// 批量添加处理结果
export const addProcessResults = (newResults: ProcessResult[]): void => {
  if (newResults.length === 0) return;
  
  const results = getProcessResults();
  const updatedResults = [...results, ...newResults];
  saveProcessResults(updatedResults);
};

// 删除处理结果
export const deleteProcessResult = (fileId: string): boolean => {
  const results = getProcessResults();
  const filteredResults = results.filter(result => result.fileId !== fileId);
  
  if (filteredResults.length === results.length) {
    return false;
  }
  
  saveProcessResults(filteredResults);
  return true;
};

// 保存问题
export const saveQuestions = (questions: Question[]): void => {
  saveToLocalStorage(STORAGE_KEYS.QUESTIONS, questions);
};

// 获取所有问题
export const getQuestions = (): Question[] => {
  return getFromLocalStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
};

// 添加问题
export const addQuestion = (question: Question): void => {
  const questions = getQuestions();
  questions.push(question);
  saveQuestions(questions);
};

// 批量添加问题
export const addQuestions = (newQuestions: Question[]): void => {
  if (newQuestions.length === 0) return;
  
  const questions = getQuestions();
  const updatedQuestions = [...questions, ...newQuestions];
  saveQuestions(updatedQuestions);
  
  notification.success({
    message: '问题已添加',
    description: `${newQuestions.length} 个新问题已成功添加。`,
  });
};

// 更新问题
export const updateQuestion = (updatedQuestion: Question): boolean => {
  const questions = getQuestions();
  const index = questions.findIndex(q => q.id === updatedQuestion.id);
  
  if (index === -1) {
    notification.error({
      message: '更新失败',
      description: '找不到指定的问题。',
    });
    return false;
  }
  
  questions[index] = updatedQuestion;
  saveQuestions(questions);
  
  notification.success({
    message: '问题已更新',
    description: '问题信息已成功更新。',
  });
  
  return true;
};

// 删除问题
export const deleteQuestion = (questionId: string): boolean => {
  const questions = getQuestions();
  const filteredQuestions = questions.filter(q => q.id !== questionId);
  
  if (filteredQuestions.length === questions.length) {
    notification.error({
      message: '删除失败',
      description: '找不到指定的问题。',
    });
    return false;
  }
  
  saveQuestions(filteredQuestions);
  
  notification.success({
    message: '问题已删除',
    description: '问题已成功删除。',
  });
  
  return true;
};

// 保存试卷
export const savePapers = (papers: Paper[]): void => {
  saveToLocalStorage(STORAGE_KEYS.PAPERS, papers);
};

// 获取所有试卷
export const getPapers = (): Paper[] => {
  return getFromLocalStorage<Paper[]>(STORAGE_KEYS.PAPERS, []);
};

// 添加试卷
export const addPaper = (paper: Paper): void => {
  const papers = getPapers();
  papers.push(paper);
  savePapers(papers);
};

// 更新试卷
export const updatePaper = (updatedPaper: Paper): boolean => {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === updatedPaper.id);
  
  if (index === -1) {
    notification.error({
      message: '更新失败',
      description: '找不到指定的试卷。',
    });
    return false;
  }
  
  papers[index] = updatedPaper;
  savePapers(papers);
  
  notification.success({
    message: '试卷已更新',
    description: '试卷信息已成功更新。',
  });
  
  return true;
};

// 删除试卷
export const deletePaper = (paperId: string): boolean => {
  const papers = getPapers();
  const filteredPapers = papers.filter(p => p.id !== paperId);
  
  if (filteredPapers.length === papers.length) {
    notification.error({
      message: '删除失败',
      description: '找不到指定的试卷。',
    });
    return false;
  }
  
  savePapers(filteredPapers);
  
  notification.success({
    message: '试卷已删除',
    description: '试卷已成功删除。',
  });
  
  return true;
};

// 保存应用设置
export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  openaiApiKey?: string;
  defaultFilePath?: string;
  autoSave: boolean;
  extractionSettings: {
    extractImages: boolean;
    extractTables: boolean;
    minConfidence: number;
  };
  questionSettings: {
    defaultQuestionTypes: string[];
    defaultDifficulty: string;
    defaultQuestionCount: number;
  };
}

// 默认应用设置
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'zh-CN',
  autoSave: true,
  extractionSettings: {
    extractImages: true,
    extractTables: true,
    minConfidence: 0.7,
  },
  questionSettings: {
    defaultQuestionTypes: ['single_choice', 'true_false'],
    defaultDifficulty: 'medium',
    defaultQuestionCount: 10,
  },
};

// 保存设置
export const saveSettings = (settings: AppSettings): void => {
  saveToLocalStorage(STORAGE_KEYS.SETTINGS, settings);
  
  notification.success({
    message: '设置已保存',
    description: '应用设置已成功更新。',
  });
};

// 获取设置
export const getSettings = (): AppSettings => {
  return getFromLocalStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
};

// 重置设置为默认值
export const resetSettings = (): void => {
  saveSettings(DEFAULT_SETTINGS);
  
  notification.info({
    message: '设置已重置',
    description: '所有设置已恢复为默认值。',
  });
}; 