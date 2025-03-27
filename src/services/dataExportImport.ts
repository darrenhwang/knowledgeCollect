import { notification } from 'antd';
import { 
  getKnowledgePoints,
  getQuestions,
  getPapers,
  getSettings,
  saveKnowledgePoints,
  saveQuestions,
  savePapers,
  saveSettings,
  AppSettings
} from './storage';
import { KnowledgePoint } from './extraction';
import { Question, Paper } from './questionGeneration';
import { formatDateTime } from '../utils/helpers';

// 导出数据结构
export interface ExportData {
  version: string;
  exportDate: number;
  settings: AppSettings;
  knowledgePoints: KnowledgePoint[];
  questions: Question[];
  papers: Paper[];
}

// 获取当前版本号
const getCurrentVersion = (): string => '1.0.0';

// 导出所有数据
export const exportAllData = (): string => {
  try {
    const exportData: ExportData = {
      version: getCurrentVersion(),
      exportDate: Date.now(),
      settings: getSettings(),
      knowledgePoints: getKnowledgePoints(),
      questions: getQuestions(),
      papers: getPapers()
    };
    
    const jsonData = JSON.stringify(exportData, null, 2);
    
    notification.success({
      message: '导出成功',
      description: '所有数据已成功导出。',
    });
    
    return jsonData;
  } catch (error) {
    console.error('导出数据失败:', error);
    notification.error({
      message: '导出失败',
      description: '导出数据时发生错误，请重试。',
    });
    return '';
  }
};

// 将数据导出为文件
export const exportDataToFile = (): void => {
  const jsonData = exportAllData();
  if (!jsonData) return;
  
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // 创建下载链接
  const a = document.createElement('a');
  const timestamp = formatDateTime(Date.now()).replace(/[/:\s]/g, '-');
  a.download = `knowledge-app-export-${timestamp}.json`;
  a.href = url;
  a.click();
  
  // 清理
  URL.revokeObjectURL(url);
};

// 导入数据
export const importData = (jsonData: string): boolean => {
  try {
    const importedData = JSON.parse(jsonData) as ExportData;
    
    // 验证数据结构
    if (!importedData.version || !importedData.exportDate) {
      throw new Error('无效的数据格式');
    }
    
    // 导入设置
    if (importedData.settings) {
      saveSettings(importedData.settings);
    }
    
    // 导入知识点
    if (Array.isArray(importedData.knowledgePoints)) {
      saveKnowledgePoints(importedData.knowledgePoints);
    }
    
    // 导入问题
    if (Array.isArray(importedData.questions)) {
      saveQuestions(importedData.questions);
    }
    
    // 导入试卷
    if (Array.isArray(importedData.papers)) {
      savePapers(importedData.papers);
    }
    
    notification.success({
      message: '导入成功',
      description: `从${formatDateTime(importedData.exportDate)}的备份中恢复了数据。`,
    });
    
    return true;
  } catch (error) {
    console.error('导入数据失败:', error);
    notification.error({
      message: '导入失败',
      description: error instanceof Error ? error.message : '导入数据时发生未知错误。',
    });
    return false;
  }
};

// 从文件导入数据
export const importDataFromFile = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = event.target?.result as string;
        const success = importData(jsonData);
        resolve(success);
      } catch (error) {
        console.error('读取文件失败:', error);
        notification.error({
          message: '导入失败',
          description: '无法读取文件内容，请确保文件格式正确。',
        });
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('读取文件失败:', error);
      notification.error({
        message: '导入失败',
        description: '读取文件时发生错误。',
      });
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

// 合并导入数据（不替换现有数据，而是添加新数据）
export const mergeImportData = (jsonData: string): boolean => {
  try {
    const importedData = JSON.parse(jsonData) as ExportData;
    
    // 验证数据结构
    if (!importedData.version || !importedData.exportDate) {
      throw new Error('无效的数据格式');
    }
    
    // 获取现有数据
    const existingKnowledgePoints = getKnowledgePoints();
    const existingQuestions = getQuestions();
    const existingPapers = getPapers();
    
    // 合并知识点（避免重复）
    if (Array.isArray(importedData.knowledgePoints)) {
      const existingIds = new Set(existingKnowledgePoints.map(item => item.id));
      const newKnowledgePoints = importedData.knowledgePoints.filter(item => !existingIds.has(item.id));
      
      if (newKnowledgePoints.length > 0) {
        saveKnowledgePoints([...existingKnowledgePoints, ...newKnowledgePoints]);
      }
    }
    
    // 合并问题（避免重复）
    if (Array.isArray(importedData.questions)) {
      const existingIds = new Set(existingQuestions.map(item => item.id));
      const newQuestions = importedData.questions.filter(item => !existingIds.has(item.id));
      
      if (newQuestions.length > 0) {
        saveQuestions([...existingQuestions, ...newQuestions]);
      }
    }
    
    // 合并试卷（避免重复）
    if (Array.isArray(importedData.papers)) {
      const existingIds = new Set(existingPapers.map(item => item.id));
      const newPapers = importedData.papers.filter(item => !existingIds.has(item.id));
      
      if (newPapers.length > 0) {
        savePapers([...existingPapers, ...newPapers]);
      }
    }
    
    notification.success({
      message: '合并成功',
      description: `已成功合并${formatDateTime(importedData.exportDate)}的备份数据。`,
    });
    
    return true;
  } catch (error) {
    console.error('合并数据失败:', error);
    notification.error({
      message: '合并失败',
      description: error instanceof Error ? error.message : '合并数据时发生未知错误。',
    });
    return false;
  }
};

// 导出单个知识点到文件
export const exportKnowledgePoint = (knowledgePoint: KnowledgePoint): void => {
  try {
    const jsonData = JSON.stringify(knowledgePoint, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const a = document.createElement('a');
    a.download = `knowledge-point-${knowledgePoint.id}.json`;
    a.href = url;
    a.click();
    
    // 清理
    URL.revokeObjectURL(url);
    
    notification.success({
      message: '导出成功',
      description: '知识点已成功导出。',
    });
  } catch (error) {
    console.error('导出知识点失败:', error);
    notification.error({
      message: '导出失败',
      description: '导出知识点时发生错误，请重试。',
    });
  }
};

// 导出试卷到文件
export const exportPaper = (paper: Paper): void => {
  try {
    const jsonData = JSON.stringify(paper, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const a = document.createElement('a');
    a.download = `paper-${paper.id}.json`;
    a.href = url;
    a.click();
    
    // 清理
    URL.revokeObjectURL(url);
    
    notification.success({
      message: '导出成功',
      description: '试卷已成功导出。',
    });
  } catch (error) {
    console.error('导出试卷失败:', error);
    notification.error({
      message: '导出失败',
      description: '导出试卷时发生错误，请重试。',
    });
  }
};

// 导出试卷为纯文本
export const exportPaperAsText = (paper: Paper): string => {
  try {
    let textContent = `标题：${paper.title}\n`;
    
    if (paper.description) {
      textContent += `描述：${paper.description}\n`;
    }
    
    if (paper.timeLimit) {
      textContent += `时间限制：${paper.timeLimit}分钟\n`;
    }
    
    if (paper.totalScore) {
      textContent += `总分：${paper.totalScore}分\n`;
    }
    
    textContent += `创建时间：${formatDateTime(paper.createdAt)}\n\n`;
    textContent += `=== 试题内容 ===\n\n`;
    
    paper.questions.forEach((question, index) => {
      textContent += `${index + 1}. ${question.content}\n`;
      
      // 根据题目类型处理选项
      if (question.options && question.options.length > 0) {
        question.options.forEach((option, optIndex) => {
          const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D...
          textContent += `   ${optionLabel}. ${option.content}\n`;
        });
      }
      
      // 添加答案（如果存在）
      if (question.answer) {
        textContent += `   答案：${question.answer}\n`;
      } else if (question.options) {
        const correctOptions = question.options
          .filter(option => option.isCorrect)
          .map((_, index) => String.fromCharCode(65 + index))
          .join(', ');
        textContent += `   答案：${correctOptions}\n`;
      }
      
      // 添加解释（如果存在）
      if (question.explanation) {
        textContent += `   解释：${question.explanation}\n`;
      }
      
      textContent += `\n`;
    });
    
    return textContent;
  } catch (error) {
    console.error('导出试卷为文本失败:', error);
    notification.error({
      message: '导出失败',
      description: '导出试卷为文本时发生错误，请重试。',
    });
    return '';
  }
};

// 导出试卷为纯文本文件
export const exportPaperAsTextFile = (paper: Paper): void => {
  try {
    const textContent = exportPaperAsText(paper);
    if (!textContent) return;
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const a = document.createElement('a');
    a.download = `paper-${paper.title}.txt`;
    a.href = url;
    a.click();
    
    // 清理
    URL.revokeObjectURL(url);
    
    notification.success({
      message: '导出成功',
      description: '试卷已成功导出为文本文件。',
    });
  } catch (error) {
    console.error('导出试卷为文本文件失败:', error);
    notification.error({
      message: '导出失败',
      description: '导出试卷为文本文件时发生错误，请重试。',
    });
  }
}; 