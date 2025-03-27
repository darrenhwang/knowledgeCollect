import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notification } from 'antd';
import { KnowledgePoint } from '../services/extraction';
import { Question, Paper } from '../services/questionGeneration';
import {
  getKnowledgePoints,
  saveKnowledgePoints,
  getQuestions,
  saveQuestions,
  getPapers,
  savePapers,
  getSettings,
  saveSettings,
  AppSettings,
  DEFAULT_SETTINGS
} from '../services/storage';

// 定义应用程序状态接口
interface AppState {
  knowledgePoints: KnowledgePoint[];
  questions: Question[];
  papers: Paper[];
  settings: AppSettings;
  isLoading: boolean;
  selectedKnowledgePoint: KnowledgePoint | null;
  selectedQuestion: Question | null;
  selectedPaper: Paper | null;
}

// 定义应用程序上下文接口
interface AppContextType {
  // 状态
  state: AppState;
  
  // 知识点相关方法
  addKnowledgePoint: (point: KnowledgePoint) => void;
  updateKnowledgePoint: (point: KnowledgePoint) => void;
  deleteKnowledgePoint: (pointId: string) => void;
  addKnowledgePoints: (points: KnowledgePoint[]) => void;
  selectKnowledgePoint: (point: KnowledgePoint | null) => void;
  
  // 问题相关方法
  addQuestion: (question: Question) => void;
  updateQuestion: (question: Question) => void;
  deleteQuestion: (questionId: string) => void;
  addQuestions: (questions: Question[]) => void;
  selectQuestion: (question: Question | null) => void;
  
  // 试卷相关方法
  addPaper: (paper: Paper) => void;
  updatePaper: (paper: Paper) => void;
  deletePaper: (paperId: string) => void;
  selectPaper: (paper: Paper | null) => void;
  
  // 设置相关方法
  updateSettings: (settings: AppSettings) => void;
  resetSettings: () => void;
  
  // 其他方法
  setLoading: (isLoading: boolean) => void;
  resetState: () => void;
}

// 创建上下文
const AppContext = createContext<AppContextType | undefined>(undefined);

// 初始状态
const initialState: AppState = {
  knowledgePoints: [],
  questions: [],
  papers: [],
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  selectedKnowledgePoint: null,
  selectedQuestion: null,
  selectedPaper: null,
};

// 提供者组件
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // 状态
  const [state, setState] = useState<AppState>(initialState);
  
  // 在组件挂载时从本地存储加载数据
  useEffect(() => {
    const loadData = async () => {
      setState(prevState => ({
        ...prevState,
        isLoading: true
      }));
      
      try {
        // 从本地存储加载数据
        const knowledgePoints = getKnowledgePoints();
        const questions = getQuestions();
        const papers = getPapers();
        const settings = getSettings();
        
        setState(prevState => ({
          ...prevState,
          knowledgePoints,
          questions,
          papers,
          settings,
          isLoading: false
        }));
      } catch (error) {
        console.error('加载应用数据失败:', error);
        notification.error({
          message: '加载失败',
          description: '无法加载应用数据，请刷新页面重试。',
        });
        
        setState(prevState => ({
          ...prevState,
          isLoading: false
        }));
      }
    };
    
    loadData();
  }, []);
  
  // 知识点相关方法
  const addKnowledgePoint = (point: KnowledgePoint) => {
    setState(prevState => {
      const updatedPoints = [...prevState.knowledgePoints, point];
      saveKnowledgePoints(updatedPoints);
      return {
        ...prevState,
        knowledgePoints: updatedPoints
      };
    });
  };
  
  const updateKnowledgePoint = (point: KnowledgePoint) => {
    setState(prevState => {
      const index = prevState.knowledgePoints.findIndex(p => p.id === point.id);
      if (index === -1) {
        notification.error({
          message: '更新失败',
          description: '找不到指定的知识点。',
        });
        return prevState;
      }
      
      const updatedPoints = [...prevState.knowledgePoints];
      updatedPoints[index] = point;
      saveKnowledgePoints(updatedPoints);
      
      return {
        ...prevState,
        knowledgePoints: updatedPoints,
        selectedKnowledgePoint: point
      };
    });
  };
  
  const deleteKnowledgePoint = (pointId: string) => {
    setState(prevState => {
      const updatedPoints = prevState.knowledgePoints.filter(p => p.id !== pointId);
      
      if (updatedPoints.length === prevState.knowledgePoints.length) {
        notification.error({
          message: '删除失败',
          description: '找不到指定的知识点。',
        });
        return prevState;
      }
      
      saveKnowledgePoints(updatedPoints);
      
      return {
        ...prevState,
        knowledgePoints: updatedPoints,
        selectedKnowledgePoint: prevState.selectedKnowledgePoint?.id === pointId ? null : prevState.selectedKnowledgePoint
      };
    });
  };
  
  const addKnowledgePoints = (points: KnowledgePoint[]) => {
    if (points.length === 0) return;
    
    setState(prevState => {
      const updatedPoints = [...prevState.knowledgePoints, ...points];
      saveKnowledgePoints(updatedPoints);
      return {
        ...prevState,
        knowledgePoints: updatedPoints
      };
    });
  };
  
  const selectKnowledgePoint = (point: KnowledgePoint | null) => {
    setState(prevState => ({
      ...prevState,
      selectedKnowledgePoint: point
    }));
  };
  
  // 问题相关方法
  const addQuestion = (question: Question) => {
    setState(prevState => {
      const updatedQuestions = [...prevState.questions, question];
      saveQuestions(updatedQuestions);
      return {
        ...prevState,
        questions: updatedQuestions
      };
    });
  };
  
  const updateQuestion = (question: Question) => {
    setState(prevState => {
      const index = prevState.questions.findIndex(q => q.id === question.id);
      if (index === -1) {
        notification.error({
          message: '更新失败',
          description: '找不到指定的问题。',
        });
        return prevState;
      }
      
      const updatedQuestions = [...prevState.questions];
      updatedQuestions[index] = question;
      saveQuestions(updatedQuestions);
      
      return {
        ...prevState,
        questions: updatedQuestions,
        selectedQuestion: question
      };
    });
  };
  
  const deleteQuestion = (questionId: string) => {
    setState(prevState => {
      const updatedQuestions = prevState.questions.filter(q => q.id !== questionId);
      
      if (updatedQuestions.length === prevState.questions.length) {
        notification.error({
          message: '删除失败',
          description: '找不到指定的问题。',
        });
        return prevState;
      }
      
      saveQuestions(updatedQuestions);
      
      return {
        ...prevState,
        questions: updatedQuestions,
        selectedQuestion: prevState.selectedQuestion?.id === questionId ? null : prevState.selectedQuestion
      };
    });
  };
  
  const addQuestions = (questions: Question[]) => {
    if (questions.length === 0) return;
    
    setState(prevState => {
      const updatedQuestions = [...prevState.questions, ...questions];
      saveQuestions(updatedQuestions);
      return {
        ...prevState,
        questions: updatedQuestions
      };
    });
  };
  
  const selectQuestion = (question: Question | null) => {
    setState(prevState => ({
      ...prevState,
      selectedQuestion: question
    }));
  };
  
  // 试卷相关方法
  const addPaper = (paper: Paper) => {
    setState(prevState => {
      const updatedPapers = [...prevState.papers, paper];
      savePapers(updatedPapers);
      return {
        ...prevState,
        papers: updatedPapers
      };
    });
  };
  
  const updatePaper = (paper: Paper) => {
    setState(prevState => {
      const index = prevState.papers.findIndex(p => p.id === paper.id);
      if (index === -1) {
        notification.error({
          message: '更新失败',
          description: '找不到指定的试卷。',
        });
        return prevState;
      }
      
      const updatedPapers = [...prevState.papers];
      updatedPapers[index] = paper;
      savePapers(updatedPapers);
      
      return {
        ...prevState,
        papers: updatedPapers,
        selectedPaper: paper
      };
    });
  };
  
  const deletePaper = (paperId: string) => {
    setState(prevState => {
      const updatedPapers = prevState.papers.filter(p => p.id !== paperId);
      
      if (updatedPapers.length === prevState.papers.length) {
        notification.error({
          message: '删除失败',
          description: '找不到指定的试卷。',
        });
        return prevState;
      }
      
      savePapers(updatedPapers);
      
      return {
        ...prevState,
        papers: updatedPapers,
        selectedPaper: prevState.selectedPaper?.id === paperId ? null : prevState.selectedPaper
      };
    });
  };
  
  const selectPaper = (paper: Paper | null) => {
    setState(prevState => ({
      ...prevState,
      selectedPaper: paper
    }));
  };
  
  // 设置相关方法
  const updateSettings = (settings: AppSettings) => {
    setState(prevState => {
      saveSettings(settings);
      return {
        ...prevState,
        settings
      };
    });
  };
  
  const resetSettings = () => {
    setState(prevState => {
      saveSettings(DEFAULT_SETTINGS);
      return {
        ...prevState,
        settings: DEFAULT_SETTINGS
      };
    });
  };
  
  // 其他方法
  const setLoading = (isLoading: boolean) => {
    setState(prevState => ({
      ...prevState,
      isLoading
    }));
  };
  
  const resetState = () => {
    setState(initialState);
  };
  
  // 上下文值
  const contextValue: AppContextType = {
    state,
    addKnowledgePoint,
    updateKnowledgePoint,
    deleteKnowledgePoint,
    addKnowledgePoints,
    selectKnowledgePoint,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addQuestions,
    selectQuestion,
    addPaper,
    updatePaper,
    deletePaper,
    selectPaper,
    updateSettings,
    resetSettings,
    setLoading,
    resetState,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// 自定义钩子，用于在组件中访问上下文
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext必须在AppProvider内部使用');
  }
  
  return context;
}; 