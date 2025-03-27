import { notification } from 'antd';
import { KnowledgePoint } from './extraction';

// 定义问题类型枚举
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  SHORT_ANSWER = 'short_answer',
}

// 定义问题难度枚举
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

// 定义问题选项接口
export interface QuestionOption {
  id: string;
  content: string;
  isCorrect: boolean;
}

// 定义问题接口
export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  options?: QuestionOption[];
  answer?: string;
  explanation?: string;
  relatedKnowledgePoints: string[]; // 相关知识点ID列表
  tags: string[];
  createdAt: number;
}

// 定义试卷接口
export interface Paper {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: number;
  totalScore?: number;
  timeLimit?: number; // 分钟
}

// 获取问题类型的中文名称
export const getQuestionTypeName = (type: QuestionType): string => {
  switch (type) {
    case QuestionType.SINGLE_CHOICE:
      return '单选题';
    case QuestionType.MULTIPLE_CHOICE:
      return '多选题';
    case QuestionType.TRUE_FALSE:
      return '判断题';
    case QuestionType.FILL_BLANK:
      return '填空题';
    case QuestionType.SHORT_ANSWER:
      return '简答题';
    default:
      return '未知类型';
  }
};

// 获取难度级别的中文名称
export const getDifficultyLevelName = (level: DifficultyLevel): string => {
  switch (level) {
    case DifficultyLevel.EASY:
      return '简单';
    case DifficultyLevel.MEDIUM:
      return '中等';
    case DifficultyLevel.HARD:
      return '困难';
    default:
      return '未知难度';
  }
};

// 根据知识点生成单选题
export const generateSingleChoiceQuestion = (knowledgePoint: KnowledgePoint): Question => {
  // 从知识点内容生成问题
  const content = `以下关于"${knowledgePoint.content.substring(0, 30)}..."的描述，哪一项是正确的？`;
  
  // 生成选项
  const options: QuestionOption[] = [
    {
      id: `option-${Date.now()}-1`,
      content: knowledgePoint.content.substring(0, 50) + (knowledgePoint.content.length > 50 ? '...' : ''),
      isCorrect: true,
    },
    {
      id: `option-${Date.now()}-2`,
      content: `这是一个错误的选项，与"${knowledgePoint.content.substring(0, 20)}"相关但不准确。`,
      isCorrect: false,
    },
    {
      id: `option-${Date.now()}-3`,
      content: `这是另一个错误的选项，完全不符合"${knowledgePoint.content.substring(0, 15)}"的描述。`,
      isCorrect: false,
    },
    {
      id: `option-${Date.now()}-4`,
      content: `这是第三个错误的选项，与实际知识点有所偏差。`,
      isCorrect: false,
    },
  ];
  
  // 随机打乱选项顺序
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  return {
    id: `question-single-${Date.now()}`,
    content,
    type: QuestionType.SINGLE_CHOICE,
    difficulty: Math.random() < 0.4 ? DifficultyLevel.EASY : (Math.random() < 0.7 ? DifficultyLevel.MEDIUM : DifficultyLevel.HARD),
    options,
    explanation: `正确答案基于知识点：${knowledgePoint.content}`,
    relatedKnowledgePoints: [knowledgePoint.id],
    tags: [...knowledgePoint.tags, '单选题'],
    createdAt: Date.now(),
  };
};

// 根据知识点生成多选题
export const generateMultipleChoiceQuestion = (knowledgePoints: KnowledgePoint[]): Question => {
  // 确保有至少2个知识点
  if (knowledgePoints.length < 2) {
    throw new Error('生成多选题至少需要2个知识点');
  }
  
  // 选择2-3个正确的知识点
  const correctCount = Math.min(knowledgePoints.length, Math.floor(Math.random() * 2) + 2);
  const correctPoints = knowledgePoints.slice(0, correctCount);
  
  // 生成问题内容
  const topic = correctPoints[0].category || correctPoints[0].tags[0] || '相关主题';
  const content = `关于"${topic}"，以下哪些选项是正确的？（多选）`;
  
  // 生成选项
  const options: QuestionOption[] = correctPoints.map((point, index) => ({
    id: `option-${Date.now()}-${index}`,
    content: point.content.substring(0, 50) + (point.content.length > 50 ? '...' : ''),
    isCorrect: true,
  }));
  
  // 添加一些错误选项
  const wrongOptions: QuestionOption[] = [
    {
      id: `option-${Date.now()}-wrong-1`,
      content: `这是一个错误的选项，与"${topic}"相关但内容不准确。`,
      isCorrect: false,
    },
    {
      id: `option-${Date.now()}-wrong-2`,
      content: `这是另一个错误的选项，与实际"${topic}"知识相悖。`,
      isCorrect: false,
    },
  ];
  
  // 合并选项并随机排序
  const allOptions = [...options, ...wrongOptions];
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }
  
  return {
    id: `question-multiple-${Date.now()}`,
    content,
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.MEDIUM, // 多选题默认中等难度
    options: allOptions,
    explanation: `正确答案基于以下知识点：${correctPoints.map(p => p.content.substring(0, 30)).join('；')}...`,
    relatedKnowledgePoints: correctPoints.map(p => p.id),
    tags: [...new Set(correctPoints.flatMap(p => p.tags)), '多选题'],
    createdAt: Date.now(),
  };
};

// 根据知识点生成判断题
export const generateTrueFalseQuestion = (knowledgePoint: KnowledgePoint): Question => {
  // 随机决定是正确还是错误的判断
  const isTrue = Math.random() < 0.5;
  
  // 生成问题内容
  let content = '';
  if (isTrue) {
    content = `判断：${knowledgePoint.content.substring(0, 80)}${knowledgePoint.content.length > 80 ? '...' : ''}`;
  } else {
    // 为了生成错误的判断，我们稍微修改一下知识点内容
    const originalContent = knowledgePoint.content.substring(0, 80);
    content = `判断：${originalContent.replace(/是|不是|有|没有|可以|不可以/, match => 
      match === '是' ? '不是' : 
      match === '不是' ? '是' : 
      match === '有' ? '没有' : 
      match === '没有' ? '有' : 
      match === '可以' ? '不可以' : '可以'
    )}${knowledgePoint.content.length > 80 ? '...' : ''}`;
  }
  
  // 生成选项
  const options: QuestionOption[] = [
    {
      id: `option-${Date.now()}-true`,
      content: '正确',
      isCorrect: isTrue,
    },
    {
      id: `option-${Date.now()}-false`,
      content: '错误',
      isCorrect: !isTrue,
    },
  ];
  
  return {
    id: `question-tf-${Date.now()}`,
    content,
    type: QuestionType.TRUE_FALSE,
    difficulty: Math.random() < 0.6 ? DifficultyLevel.EASY : DifficultyLevel.MEDIUM,
    options,
    explanation: isTrue 
      ? `判断正确，因为：${knowledgePoint.content}`
      : `判断错误，正确的内容应该是：${knowledgePoint.content}`,
    relatedKnowledgePoints: [knowledgePoint.id],
    tags: [...knowledgePoint.tags, '判断题'],
    createdAt: Date.now(),
  };
};

// 根据知识点生成填空题
export const generateFillBlankQuestion = (knowledgePoint: KnowledgePoint): Question => {
  const content = knowledgePoint.content;
  
  // 从内容中选择关键词作为填空
  const words = content.split(/\s+/).filter(word => word.length > 2);
  
  if (words.length === 0) {
    throw new Error('无法从知识点中提取关键词');
  }
  
  // 选择1-2个关键词
  const blankCount = Math.min(words.length, Math.floor(Math.random() * 2) + 1);
  const selectedWords: string[] = [];
  const selectedIndices = new Set<number>();
  
  for (let i = 0; i < blankCount; i++) {
    let index: number;
    do {
      index = Math.floor(Math.random() * words.length);
    } while (selectedIndices.has(index));
    
    selectedIndices.add(index);
    selectedWords.push(words[index]);
  }
  
  // 生成带有填空的问题内容
  let blankContent = content;
  selectedWords.forEach(word => {
    blankContent = blankContent.replace(word, '________');
  });
  
  return {
    id: `question-fill-${Date.now()}`,
    content: `填空：${blankContent}`,
    type: QuestionType.FILL_BLANK,
    difficulty: Math.random() < 0.4 ? DifficultyLevel.MEDIUM : DifficultyLevel.HARD,
    answer: selectedWords.join('；'),
    explanation: `完整的知识点：${content}`,
    relatedKnowledgePoints: [knowledgePoint.id],
    tags: [...knowledgePoint.tags, '填空题'],
    createdAt: Date.now(),
  };
};

// 根据知识点生成简答题
export const generateShortAnswerQuestion = (knowledgePoint: KnowledgePoint): Question => {
  // 根据知识点类型生成不同的问题
  let content = '';
  
  if (knowledgePoint.content.length > 100) {
    // 如果内容较长，可以让学生总结要点
    content = `请简要总结以下内容的要点：${knowledgePoint.content.substring(0, 100)}...`;
  } else {
    // 如果内容较短，可以让学生解释或扩展
    content = `请解释：${knowledgePoint.content}`;
  }
  
  return {
    id: `question-short-${Date.now()}`,
    content,
    type: QuestionType.SHORT_ANSWER,
    difficulty: DifficultyLevel.HARD,
    answer: knowledgePoint.content,
    explanation: `这个问题基于以下知识点：${knowledgePoint.content}`,
    relatedKnowledgePoints: [knowledgePoint.id],
    tags: [...knowledgePoint.tags, '简答题'],
    createdAt: Date.now(),
  };
};

// 基于知识点生成问题
export const generateQuestions = (
  knowledgePoints: KnowledgePoint[],
  options: {
    types: QuestionType[];
    difficulties: DifficultyLevel[];
    count: number;
  }
): Question[] => {
  if (knowledgePoints.length === 0) {
    notification.warning({
      message: '无法生成问题',
      description: '没有可用的知识点',
    });
    return [];
  }
  
  const questions: Question[] = [];
  const { types, difficulties, count } = options;
  
  // 尝试生成指定数量的问题
  let attempts = 0;
  const maxAttempts = count * 2; // 最大尝试次数
  
  while (questions.length < count && attempts < maxAttempts) {
    attempts++;
    
    try {
      // 随机选择一个知识点
      const randomIndex = Math.floor(Math.random() * knowledgePoints.length);
      const knowledgePoint = knowledgePoints[randomIndex];
      
      // 随机选择一个问题类型
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      // 根据问题类型生成问题
      let question: Question | null = null;
      
      switch (randomType) {
        case QuestionType.SINGLE_CHOICE:
          question = generateSingleChoiceQuestion(knowledgePoint);
          break;
        case QuestionType.MULTIPLE_CHOICE:
          // 多选题需要多个知识点
          if (knowledgePoints.length >= 2) {
            // 随机选择2-3个知识点
            const selectedPoints = [knowledgePoint];
            const availablePoints = knowledgePoints.filter(p => p.id !== knowledgePoint.id);
            
            if (availablePoints.length > 0) {
              const additionalCount = Math.min(availablePoints.length, Math.floor(Math.random() * 2) + 1);
              for (let i = 0; i < additionalCount; i++) {
                const idx = Math.floor(Math.random() * availablePoints.length);
                selectedPoints.push(availablePoints[idx]);
                availablePoints.splice(idx, 1);
              }
              question = generateMultipleChoiceQuestion(selectedPoints);
            }
          }
          break;
        case QuestionType.TRUE_FALSE:
          question = generateTrueFalseQuestion(knowledgePoint);
          break;
        case QuestionType.FILL_BLANK:
          question = generateFillBlankQuestion(knowledgePoint);
          break;
        case QuestionType.SHORT_ANSWER:
          question = generateShortAnswerQuestion(knowledgePoint);
          break;
      }
      
      // 检查问题是否符合难度要求
      if (question && difficulties.includes(question.difficulty)) {
        // 检查是否已经有相似的问题
        const isDuplicate = questions.some(q => 
          q.type === question?.type && 
          q.content === question.content
        );
        
        if (!isDuplicate) {
          questions.push(question);
        }
      }
    } catch (error) {
      console.error('生成问题时出错:', error);
      // 继续尝试下一个
    }
  }
  
  if (questions.length === 0) {
    notification.warning({
      message: '无法生成问题',
      description: '尝试多次但未能生成符合要求的问题，请尝试调整参数或增加知识点',
    });
  } else if (questions.length < count) {
    notification.info({
      message: '问题生成完成',
      description: `只能生成 ${questions.length} 个问题，少于请求的 ${count} 个`,
    });
  } else {
    notification.success({
      message: '问题生成完成',
      description: `成功生成 ${questions.length} 个问题`,
    });
  }
  
  return questions;
};

// 创建试卷
export const createPaper = (
  title: string,
  questions: Question[],
  description?: string,
  timeLimit?: number
): Paper => {
  if (questions.length === 0) {
    throw new Error('试卷必须包含至少一个问题');
  }
  
  const paper: Paper = {
    id: `paper-${Date.now()}`,
    title,
    description,
    questions,
    timeLimit,
    totalScore: questions.length * 10, // 每题10分
    createdAt: Date.now(),
  };
  
  notification.success({
    message: '试卷创建成功',
    description: `"${title}" 包含 ${questions.length} 个问题`,
  });
  
  return paper;
}; 