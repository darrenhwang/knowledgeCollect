import { notification } from 'antd';

// 定义文件类型
export enum FileType {
  PDF = 'pdf',
  PPT = 'ppt',
  PPTX = 'pptx',
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  TEXT = 'text',
  OTHER = 'other',
}

// 定义知识点接口
export interface KnowledgePoint {
  id: string;
  content: string;
  source: string;
  sourceType: FileType;
  page?: number;
  timestamp?: number;
  tags: string[];
  category: string;
  createdAt: number;
  confidence: number;
}

// 定义处理状态
export enum ProcessStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// 定义文件处理结果接口
export interface ProcessResult {
  fileId: string;
  fileName: string;
  fileType: FileType;
  status: ProcessStatus;
  message?: string;
  knowledgePoints: KnowledgePoint[];
  processedAt: number;
}

// 获取文件类型
export const getFileType = (filePath: string): FileType => {
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'pdf':
      return FileType.PDF;
    case 'ppt':
      return FileType.PPT;
    case 'pptx':
      return FileType.PPTX;
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'mkv':
      return FileType.VIDEO;
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'aac':
      return FileType.AUDIO;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
      return FileType.IMAGE;
    case 'txt':
    case 'doc':
    case 'docx':
    case 'rtf':
    case 'md':
      return FileType.TEXT;
    default:
      return FileType.OTHER;
  }
};

// 模拟PDF文件处理
export const processPdfFile = async (filePath: string): Promise<KnowledgePoint[]> => {
  console.log(`正在处理PDF文件: ${filePath}`);
  
  // 模拟异步处理
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟生成的知识点
      const knowledgePoints: KnowledgePoint[] = [];
      
      // 生成10个随机知识点
      for (let i = 0; i < 10; i++) {
        knowledgePoints.push({
          id: `kp-pdf-${Date.now()}-${i}`,
          content: `PDF文件中的知识点 #${i + 1}: 这是从文件中提取的一个段落，包含了关于特定主题的信息。`,
          source: filePath,
          sourceType: FileType.PDF,
          page: Math.floor(Math.random() * 20) + 1,
          tags: ['PDF', '自动提取', `标签${i % 5}`],
          category: `类别${Math.floor(i / 3) + 1}`,
          createdAt: Date.now(),
          confidence: Math.random() * 0.3 + 0.7, // 70%-100%的置信度
        });
      }
      
      resolve(knowledgePoints);
    }, 2000); // 模拟处理需要2秒
  });
};

// 模拟PPT文件处理
export const processPptFile = async (filePath: string): Promise<KnowledgePoint[]> => {
  console.log(`正在处理PPT文件: ${filePath}`);
  
  // 模拟异步处理
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟生成的知识点
      const knowledgePoints: KnowledgePoint[] = [];
      
      // 生成8个随机知识点
      for (let i = 0; i < 8; i++) {
        knowledgePoints.push({
          id: `kp-ppt-${Date.now()}-${i}`,
          content: `PPT幻灯片中的知识点 #${i + 1}: 这是从幻灯片中提取的关键信息，可能包含了图表数据或重点内容。`,
          source: filePath,
          sourceType: FileType.PPT,
          page: Math.floor(Math.random() * 15) + 1,
          tags: ['PPT', '关键点', `主题${i % 4}`],
          category: `类别${Math.floor(i / 2) + 1}`,
          createdAt: Date.now(),
          confidence: Math.random() * 0.2 + 0.75, // 75%-95%的置信度
        });
      }
      
      resolve(knowledgePoints);
    }, 1500); // 模拟处理需要1.5秒
  });
};

// 模拟视频文件处理
export const processVideoFile = async (filePath: string): Promise<KnowledgePoint[]> => {
  console.log(`正在处理视频文件: ${filePath}`);
  
  // 模拟异步处理
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟生成的知识点
      const knowledgePoints: KnowledgePoint[] = [];
      
      // 生成12个随机知识点
      for (let i = 0; i < 12; i++) {
        knowledgePoints.push({
          id: `kp-video-${Date.now()}-${i}`,
          content: `视频中的知识点 #${i + 1}: 这是从视频${Math.floor(i / 3) * 5}分${(i % 3) * 20}秒处提取的内容，包含了讲解的要点。`,
          source: filePath,
          sourceType: FileType.VIDEO,
          timestamp: Math.floor(i / 3) * 300 + (i % 3) * 20, // 时间戳（秒）
          tags: ['视频', '讲解', `主题${i % 6}`],
          category: `类别${Math.floor(i / 4) + 1}`,
          createdAt: Date.now(),
          confidence: Math.random() * 0.25 + 0.65, // 65%-90%的置信度
        });
      }
      
      resolve(knowledgePoints);
    }, 3000); // 模拟处理需要3秒
  });
};

// 处理文件并提取知识点
export const processFile = async (filePath: string): Promise<ProcessResult> => {
  const fileName = filePath.split(/[/\\]/).pop() || '';
  const fileId = `file-${Date.now()}`;
  const fileType = getFileType(filePath);
  
  // 创建初始结果
  let result: ProcessResult = {
    fileId,
    fileName,
    fileType,
    status: ProcessStatus.PROCESSING,
    knowledgePoints: [],
    processedAt: Date.now(),
  };
  
  try {
    // 根据文件类型选择不同的处理方法
    let knowledgePoints: KnowledgePoint[] = [];
    
    switch (fileType) {
      case FileType.PDF:
        knowledgePoints = await processPdfFile(filePath);
        break;
      case FileType.PPT:
      case FileType.PPTX:
        knowledgePoints = await processPptFile(filePath);
        break;
      case FileType.VIDEO:
        knowledgePoints = await processVideoFile(filePath);
        break;
      default:
        throw new Error(`不支持的文件类型: ${fileType}`);
    }
    
    // 更新结果
    result = {
      ...result,
      status: ProcessStatus.COMPLETED,
      knowledgePoints,
      processedAt: Date.now(),
    };
    
    notification.success({
      message: '文件处理成功',
      description: `从"${fileName}"中提取了${knowledgePoints.length}个知识点`,
    });
  } catch (error) {
    console.error('文件处理失败:', error);
    
    // 更新失败结果
    result = {
      ...result,
      status: ProcessStatus.FAILED,
      message: error instanceof Error ? error.message : '未知错误',
      processedAt: Date.now(),
    };
    
    notification.error({
      message: '文件处理失败',
      description: error instanceof Error ? error.message : '处理文件时出现未知错误',
    });
  }
  
  return result;
};

// 批量处理文件
export const processFiles = async (filePaths: string[]): Promise<ProcessResult[]> => {
  console.log(`开始批量处理 ${filePaths.length} 个文件`);
  
  const results: ProcessResult[] = [];
  
  // 依次处理每个文件（这里可以改为并行处理）
  for (const filePath of filePaths) {
    const result = await processFile(filePath);
    results.push(result);
  }
  
  return results;
};

// 从处理结果中提取知识点
export const extractKnowledgePoints = (results: ProcessResult[]): KnowledgePoint[] => {
  return results
    .filter(result => result.status === ProcessStatus.COMPLETED)
    .flatMap(result => result.knowledgePoints);
}; 