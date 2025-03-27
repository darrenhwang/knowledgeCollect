import React, { useState, useEffect, useCallback } from 'react';
import { 
  Button, 
  Table, 
  Space, 
  Upload, 
  message, 
  Tag, 
  Tooltip, 
  Input, 
  Select,
  Progress,
  Card,
  Row,
  Col,
  Modal,
  Tabs,
  Typography,
  Popconfirm,
  Descriptions,
  List,
  Empty
} from 'antd';
import { 
  UploadOutlined, 
  FolderOpenOutlined, 
  FileTextOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  VideoCameraOutlined,
  DeleteOutlined,
  SearchOutlined,
  SyncOutlined,
  FileAddOutlined,
  EyeOutlined,
  BookOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  FormOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { processVideoFile, VideoProcessingConfig } from '../../services/videoProcessing';
import { addKnowledgePoints, addProcessResult, getKnowledgePoints, getProcessResults } from '../../services/storage';
import { processFile, KnowledgePoint, ProcessStatus, ProcessResult, FileType } from '../../services/extraction';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;
const { Dragger } = Upload;
const { Title, Text, Paragraph } = Typography;

// 文件类型定义
interface FileItem {
  id: string;
  name: string;
  path: string;
  type: FileType;  // 使用FileType枚举
  size: number;
  status: ProcessStatus;  // 使用ProcessStatus枚举
  processedAt?: string;
  progress?: number;
  originalFile?: File;
  uploadTime?: string;
}

// 获取文件类型图标
const getFileTypeIcon = (fileType: FileType) => {
  switch (fileType) {
    case FileType.PDF:
      return <FilePdfOutlined style={{ color: '#f5222d' }} />;
    case FileType.PPT:
    case FileType.PPTX:
      return <FileExcelOutlined style={{ color: '#fa8c16' }} />;
    case FileType.VIDEO:
      return <VideoCameraOutlined style={{ color: '#1890ff' }} />;
    default:
      return <FileTextOutlined style={{ color: '#8c8c8c' }} />;
  }
};

// 获取文件大小的可读格式
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
};

// 获取状态标签
const getStatusTag = (status: ProcessStatus) => {
  switch (status) {
    case ProcessStatus.PENDING:
      return <Tag color="default">待处理</Tag>;
    case ProcessStatus.PROCESSING:
      return <Tag color="processing" icon={<SyncOutlined spin />}>处理中</Tag>;
    case ProcessStatus.COMPLETED:
      return <Tag color="success">已完成</Tag>;
    case ProcessStatus.FAILED:
      return <Tag color="error">处理失败</Tag>;
    default:
      return <Tag color="default">未知状态</Tag>;
  }
};

interface FileManagerProps {
  highlightFileId?: string;
}

const FileManager: React.FC<FileManagerProps> = ({ highlightFileId }) => {
  // 文件状态
  const [files, setFiles] = useState<FileItem[]>([]);
  console.log('当前文件列表:', files);

  const [searchText, setSearchText] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [processingConfig, setProcessingConfig] = useState<VideoProcessingConfig>({
    extractAudio: true,
    performTranscription: true,
    extractKeyFrames: true,
    performOCR: true,
    minimumConfidence: 0.7,
    segmentDuration: 30,
    recognizeObjects: true,
    recognizeFaces: false
  });

  // 添加新状态
  const [processResults, setProcessResults] = useState<ProcessResult[]>([]);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [selectedFileKnowledgePoints, setSelectedFileKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // 获取导航钩子
  const navigate = useNavigate();
  
  // 查看文件详情 - 使用useCallback包装，避免依赖问题
  const handleViewFileDetails = useCallback((file: FileItem) => {
    setSelectedFile(file);
    setPreviewVisible(true);
    message.info(`查看文件详情: ${file.name}`);
  }, []);
  
  // 加载数据
  useEffect(() => {
    loadData();
  }, [refreshTrigger]);
  
  // 加载数据函数
  const loadData = () => {
    try {
      const results = getProcessResults();
      const points = getKnowledgePoints();
      
      setProcessResults(results);
      setKnowledgePoints(points);
      
      console.log(`已加载 ${results.length} 个处理结果和 ${points.length} 个知识点`);
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    }
  };
  
  // 刷新数据
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // 当highlightFileId变化时，高亮显示对应文件
  useEffect(() => {
    if (highlightFileId) {
      const fileToHighlight = files.find(file => file.id === highlightFileId);
      if (fileToHighlight) {
        handleViewFileDetails(fileToHighlight);
      }
    }
  }, [highlightFileId, files, handleViewFileDetails]);

  // 表格列定义
  const columns: ColumnsType<FileItem> = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {getFileTypeIcon(record.type)}
          <span>{text}</span>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '文件类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: FileType) => {
        let typeText = '';
        switch (type) {
          case FileType.PDF:
            typeText = 'PDF';
            break;
          case FileType.PPT:
          case FileType.PPTX:
            typeText = 'PPT';
            break;
          case FileType.VIDEO:
            typeText = '视频';
            break;
          default:
            typeText = '其他';
        }
        return <Tag>{typeText}</Tag>;
      },
      filters: [
        { text: 'PDF', value: FileType.PDF },
        { text: 'PPT', value: FileType.PPT },
        { text: '视频', value: FileType.VIDEO },
        { text: '其他', value: FileType.OTHER },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
      render: (size) => formatFileSize(size),
      sorter: (a, b) => a.size - b.size,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <>
          {getStatusTag(status)}
          {status === ProcessStatus.PROCESSING && record.progress !== undefined && (
            <Progress percent={record.progress} size="small" style={{ marginLeft: 10, width: 100 }} />
          )}
        </>
      ),
      filters: [
        { text: '待处理', value: ProcessStatus.PENDING },
        { text: '处理中', value: ProcessStatus.PROCESSING },
        { text: '已完成', value: ProcessStatus.COMPLETED },
        { text: '处理失败', value: ProcessStatus.FAILED },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '处理时间',
      dataIndex: 'processedAt',
      key: 'processedAt',
      render: (text) => text || '-',
      sorter: (a, b) => {
        if (!a.processedAt) return -1;
        if (!b.processedAt) return 1;
        return new Date(a.processedAt).getTime() - new Date(b.processedAt).getTime();
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              onClick={() => handleViewFileDetails(record)}
            >
              查看
            </Button>
          </Tooltip>
          <Tooltip title="处理文件">
            <Button
              type="link"
              size="small"
              disabled={record.status === ProcessStatus.PROCESSING}
              onClick={() => handleProcessFile(record.id)}
            >
              处理
            </Button>
          </Tooltip>
          {record.status === ProcessStatus.COMPLETED && (
            <>
              <Tooltip title="查看知识点">
                <Button
                  type="link"
                  size="small"
                  icon={<BookOutlined />}
                  onClick={() => handleViewKnowledgePoints(record.id)}
                >
                  知识点
                </Button>
              </Tooltip>
              <Tooltip title="生成问题">
                <Button
                  type="link"
                  size="small"
                  icon={<FormOutlined />}
                  onClick={() => handleGenerateQuestions(record.id)}
                >
                  生成问题
                </Button>
              </Tooltip>
            </>
          )}
          <Tooltip title="删除">
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteFile(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 过滤和排序的文件数据
  const filteredFiles = files.filter(file => {
    console.log('过滤前的文件:', file);
    
    // 根据activeTab过滤
    let tabMatch = true;
    if (activeTab === 'pending') {
      tabMatch = file.status === ProcessStatus.PENDING;
    } else if (activeTab === 'completed') {
      tabMatch = file.status === ProcessStatus.COMPLETED;
    } else if (activeTab === 'video') {
      tabMatch = file.type === FileType.VIDEO;
    } else if (activeTab === 'document') {
      tabMatch = file.type === FileType.PDF || file.type === FileType.PPT || file.type === FileType.PPTX;
    }
    
    const matchesSearch = searchText ? 
      file.name.toLowerCase().includes(searchText.toLowerCase()) : 
      true;
    
    const matchesFileType = fileTypeFilter ? 
      file.type === fileTypeFilter : 
      true;
    
    const matchesStatus = statusFilter ? 
      file.status === statusFilter : 
      true;
    
    const isMatch = matchesSearch && matchesFileType && matchesStatus && tabMatch;
    console.log(`文件 ${file.name} 匹配结果:`, isMatch);
    
    return isMatch;
  });
  
  console.log('过滤后的文件列表:', filteredFiles);
  
  // 文件上传的属性配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: undefined,  // 不使用自动上传
    beforeUpload: (file) => {
      // 检查文件类型的MimeType
      const isPdf = file.type === 'application/pdf';
      const isPpt = file.type === 'application/vnd.ms-powerpoint' || 
                    file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      const isVideo = file.type.startsWith('video/');
      
      // 检查文件扩展名作为备选方法
      const fileName = file.name || '';
      const extension = fileName.split('.').pop()?.toLowerCase() || '';
      
      const isPdfByExt = extension === 'pdf';
      const isPptByExt = extension === 'ppt' || extension === 'pptx';
      const isVideoByExt = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(extension);
      
      // 综合判断文件类型
      const isAllowedType = isPdf || isPdfByExt || isPpt || isPptByExt || isVideo || isVideoByExt;
      
      if (!isAllowedType) {
        message.error(`${file.name} 不是支持的文件类型!`);
        return Upload.LIST_IGNORE;
      }
      
      // 确定文件类型
      let fileType: FileType = FileType.OTHER;
      
      if (isPdf || isPdfByExt) {
        fileType = FileType.PDF;
      } else if (isPpt || isPptByExt) {
        fileType = extension === 'pptx' ? FileType.PPTX : FileType.PPT;
      } else if (isVideo || isVideoByExt) {
        fileType = FileType.VIDEO;
      }
      
      // 创建新的文件项
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        path: URL.createObjectURL(file),
        type: fileType,
        size: file.size,
        status: ProcessStatus.PENDING,
        originalFile: file,
        uploadTime: new Date().toISOString()
      };
      
      console.log('添加新文件:', newFile);
      
      // 更新文件列表
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles, newFile];
        console.log('更新后的文件列表:', updatedFiles);
        return updatedFiles;
      });
      
      message.success(`${file.name} 已添加到列表`);
      
      // 返回false阻止自动上传
      return false;
    },
    showUploadList: false,
    onChange: (info) => {
      console.log('上传状态变化:', info);
    },
    accept: '.pdf,.ppt,.pptx,.mp4,.avi,.mov,.wmv,.flv,.mkv'
  };

  // 选择文件夹
  const handleSelectFolder = async () => {
    try {
      // 这里应该调用Electron API打开文件夹选择对话框
      // 模拟选择了文件
      message.info('选择文件夹功能尚未实现，请使用上传按钮上传文件');
    } catch (error) {
      message.error('选择文件夹失败');
    }
  };

  // 搜索文件
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // 处理文件
  const handleProcessFile = async (fileId: string) => {
    console.log('开始处理文件:', fileId);
    const fileIndex = files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) {
      console.error('找不到文件:', fileId);
      return;
    }
    
    const file = files[fileIndex];
    console.log('获取到文件:', file);
    
    if (!file.originalFile) {
      message.error(`处理失败: 找不到文件 ${file.name} 的原始数据`);
      return;
    }
    
    // 更新状态为处理中
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[fileIndex] = {
        ...newFiles[fileIndex],
        status: ProcessStatus.PROCESSING,
        progress: 0
      };
      console.log('更新文件状态为处理中:', newFiles[fileIndex]);
      return newFiles;
    });
    
    try {
      // 根据文件类型处理
      let knowledgePoints: KnowledgePoint[] = [];
      let processResult: ProcessResult;
      
      // 为模拟环境创建一个伪文件路径，包含文件扩展名
      const simulatedPath = `${file.id}-${file.name}`; 
      
      if (file.type === FileType.VIDEO) {
        console.log('处理视频文件:', file.name);
        // 模拟视频处理
        await processVideoWithProgress(file, fileIndex);
        
        // 处理视频文件
        processResult = {
          fileId: file.id,
          fileName: file.name,
          fileType: FileType.VIDEO,
          status: ProcessStatus.COMPLETED,
          processedAt: Date.now(),
          knowledgePoints: Array(Math.floor(Math.random() * 10) + 5).fill(0).map((_, i) => ({
            id: `kp-${file.id}-${i}`,
            content: `视频中的知识点 ${i + 1}: ${file.name.split('.')[0]}相关内容`,
            confidence: Math.random() * 0.5 + 0.5,
            source: simulatedPath,
            sourceType: FileType.VIDEO,
            timestamp: Math.floor(Math.random() * 300),
            tags: ['视频', '自动提取', `知识点${i}`],
            category: '视频内容',
            createdAt: Date.now()
          }))
        };
        knowledgePoints = processResult.knowledgePoints;
      } else if (file.type === FileType.PDF) {
        console.log('处理PDF文件:', file.name);
        // 模拟PDF处理进度
        await simulateFileProcessing(fileIndex);
        
        // 处理PDF文件
        processResult = {
          fileId: file.id,
          fileName: file.name,
          fileType: FileType.PDF,
          status: ProcessStatus.COMPLETED,
          processedAt: Date.now(),
          knowledgePoints: Array(Math.floor(Math.random() * 10) + 8).fill(0).map((_, i) => ({
            id: `kp-${file.id}-${i}`,
            content: `PDF中的知识点 ${i + 1}: ${file.name.split('.')[0]}中的重要概念`,
            confidence: Math.random() * 0.5 + 0.5,
            source: simulatedPath,
            sourceType: FileType.PDF,
            page: Math.floor(Math.random() * 20) + 1,
            tags: ['PDF', '文本提取', `概念${i}`],
            category: 'PDF文档',
            createdAt: Date.now()
          }))
        };
        knowledgePoints = processResult.knowledgePoints;
      } else if (file.type === FileType.PPT || file.type === FileType.PPTX) {
        console.log('处理PPT文件:', file.name);
        // 模拟PPT处理进度
        await simulateFileProcessing(fileIndex);
        
        // 处理PPT文件
        processResult = {
          fileId: file.id,
          fileName: file.name,
          fileType: file.type,
          status: ProcessStatus.COMPLETED,
          processedAt: Date.now(),
          knowledgePoints: Array(Math.floor(Math.random() * 10) + 6).fill(0).map((_, i) => ({
            id: `kp-${file.id}-${i}`,
            content: `PPT中的知识点 ${i + 1}: ${file.name.split('.')[0]}中的幻灯片要点`,
            confidence: Math.random() * 0.5 + 0.5,
            source: simulatedPath,
            sourceType: file.type,
            page: Math.floor(Math.random() * 15) + 1,
            tags: ['PPT', '幻灯片', `要点${i}`],
            category: 'PPT演示',
            createdAt: Date.now()
          }))
        };
        knowledgePoints = processResult.knowledgePoints;
      } else {
        throw new Error(`不支持的文件类型: ${file.type}`);
      }
      
      // 将处理结果添加到存储
      if (processResult) {
        addProcessResult(processResult);
        console.log('添加处理结果到存储:', processResult);
      }
      
      // 将知识点添加到知识库
      if (knowledgePoints.length > 0) {
        addKnowledgePoints(knowledgePoints);
        console.log('添加知识点到知识库:', knowledgePoints.length);
        message.success(`已从文件中提取${knowledgePoints.length}个知识点并添加到知识库`);
      }
      
      // 处理完成，更新状态
      setFiles(prevFiles => {
        const newFiles = [...prevFiles];
        newFiles[fileIndex] = {
          ...newFiles[fileIndex],
          status: ProcessStatus.COMPLETED,
          processedAt: new Date().toISOString(),
          progress: 100
        };
        console.log('更新文件状态为已完成:', newFiles[fileIndex]);
        return newFiles;
      });
      
      message.success(`文件处理完成: ${file.name}`);
      
      // 刷新数据
      refreshData();
      
      // 延迟一下确保其他组件刷新数据
      setTimeout(() => {
        // 触发全局事件，通知其他组件刷新数据
        window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'fileProcessed', fileId: file.id } }));
      }, 500);
      
    } catch (error) {
      console.error('处理文件出错:', error);
      
      // 更新状态为失败
      setFiles(prevFiles => {
        const newFiles = [...prevFiles];
        newFiles[fileIndex] = {
          ...newFiles[fileIndex],
          status: ProcessStatus.FAILED
        };
        console.log('更新文件状态为失败:', newFiles[fileIndex]);
        return newFiles;
      });
      
      message.error(`处理文件失败: ${file.name}${error instanceof Error ? ` - ${error.message}` : ''}`);
    }
  };

  // 模拟视频处理带进度
  const processVideoWithProgress = async (file: FileItem, fileIndex: number) => {
    try {
      // 模拟处理过程
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 更新进度
        setFiles(prevFiles => {
          const newFiles = [...prevFiles];
          newFiles[fileIndex] = {
            ...newFiles[fileIndex],
            status: ProcessStatus.PROCESSING,
            progress: progress
          };
          return newFiles;
        });
      }
      
      console.log(`视频处理完成: ${file.name}`);
    } catch (error) {
      console.error('视频处理失败:', error);
      throw error;
    }
  };

  // 模拟文件处理
  const simulateFileProcessing = async (fileIndex: number) => {
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 更新进度
      setFiles(prevFiles => {
        const newFiles = [...prevFiles];
        newFiles[fileIndex] = {
          ...newFiles[fileIndex],
          progress: progress
        };
        return newFiles;
      });
    }
    
    // 处理完成，更新状态
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[fileIndex] = {
        ...newFiles[fileIndex],
        status: ProcessStatus.COMPLETED,
        processedAt: new Date().toISOString(),
        progress: 100
      };
      return newFiles;
    });
    
    message.success(`文件处理完成: ${files[fileIndex].name}`);
  };

  // 删除知识点
  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
    message.success('文件已删除');
  };

  // 批量处理文件
  const handleBatchProcess = () => {
    if (selectedFiles.length === 0) {
      message.warning('请先选择要处理的文件');
      return;
    }
    
    selectedFiles.forEach(fileId => {
      const file = files.find(f => f.id === fileId);
      if (file && file.status !== ProcessStatus.PROCESSING) {
        handleProcessFile(file.id);
      }
    });
    
    message.success(`开始处理 ${selectedFiles.length} 个文件`);
  };

  // 批量删除文件
  const handleBatchDelete = () => {
    if (selectedFiles.length === 0) {
      message.warning('请先选择要删除的文件');
      return;
    }
    
    setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
    setSelectedFiles([]);
    message.success(`已删除 ${selectedFiles.length} 个文件`);
  };

  // 表格选择变化
  const rowSelection = {
    selectedRowKeys: selectedFiles,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedFiles(selectedRowKeys as string[]);
    }
  };

  // 获取表格数据
  const getTableData = () => {
    return filteredFiles;
  };

  // 渲染文件表格
  const renderFileTable = (data: FileItem[]) => {
    return (
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ 
          defaultPageSize: 10, 
          showSizeChanger: true, 
          pageSizeOptions: ['10', '20', '50']
        }}
      />
    );
  };

  // 预览文件
  const handlePreviewFile = (file: FileItem) => {
    setSelectedFile(file);
    setPreviewVisible(true);
  };

  // 关闭预览
  const handleClosePreview = () => {
    setPreviewVisible(false);
    setSelectedFile(null);
  };

  // 查看文件的知识点
  const handleViewKnowledgePoints = (fileId: string) => {
    // 查找文件的处理结果
    const result = processResults.find(r => r.fileId === fileId);
    if (!result) {
      message.warning('该文件尚未处理或未找到处理结果');
      return;
    }
    
    // 显示知识点
    setSelectedFileKnowledgePoints(result.knowledgePoints);
    setShowKnowledgeModal(true);
  };
  
  // 跳转到问题生成页
  const handleGenerateQuestions = (fileId: string) => {
    const result = processResults.find(r => r.fileId === fileId);
    if (!result) {
      message.warning('该文件尚未处理或未找到处理结果');
      return;
    }
    
    // 跳转到问题生成页面，并传递文件ID
    navigate('/questions', { state: { fileId, fileName: result.fileName } });
  };

  return (
    <div className="file-manager">
      <Title level={4}>文件管理</Title>
      <Paragraph>上传并处理PPT、PDF和视频文件，提取知识点</Paragraph>
      
      <Card style={{ marginBottom: 16 }}>
        <Dragger 
          {...uploadProps} 
          style={{ padding: '20px 0' }}
          openFileDialogOnClick={true}
        >
          <p className="ant-upload-drag-icon">
            <FileAddOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持 PDF、PPT 和视频文件，单文件最大 500MB
          </p>
          <div style={{ marginTop: 16 }}>
            <Space size="large">
              <span><FilePdfOutlined style={{ color: '#f5222d' }} /> PDF文件</span>
              <span><FileExcelOutlined style={{ color: '#fa8c16' }} /> PPT文件</span>
              <span><VideoCameraOutlined style={{ color: '#1890ff' }} /> 视频文件</span>
            </Space>
          </div>
        </Dragger>
      </Card>
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              { key: 'all', label: '全部文件' },
              { key: 'pending', label: '待处理' },
              { key: 'completed', label: '已处理' },
              { key: 'video', label: '视频' },
              { key: 'document', label: '文档' }
            ]}
          />
          
          <Space>
            <Button 
              icon={<SyncOutlined />}
              onClick={refreshData}
            >
              刷新数据
            </Button>
            <Button 
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleBatchProcess}
              disabled={selectedFiles.length === 0}
            >
              批量处理
            </Button>
            <Button 
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '确认清空',
                  content: '确定要清空文件列表吗？此操作不会删除已处理的知识点。',
                  onOk: () => {
                    setFiles([]);
                    setSelectedFiles([]);
                    message.success('文件列表已清空');
                  }
                });
              }}
              disabled={files.length === 0}
            >
              清空列表
            </Button>
          </Space>
        </div>
        
        {renderFileTable(filteredFiles)}
      </Card>
      
      {/* 文件预览模态框 */}
      <Modal
        title={selectedFile?.name}
        open={previewVisible}
        onCancel={handleClosePreview}
        footer={null}
        width={800}
      >
        {selectedFile && (
          <div>
            <Card>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                {selectedFile.type === FileType.VIDEO ? (
                  <div style={{ background: '#f0f0f0', padding: 20, borderRadius: 4 }}>
                    <VideoCameraOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                    <p>视频预览</p>
                  </div>
                ) : selectedFile.type === FileType.PDF ? (
                  <div style={{ background: '#f0f0f0', padding: 20, borderRadius: 4 }}>
                    <FilePdfOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />
                    <p>PDF预览</p>
                  </div>
                ) : (
                  <div style={{ background: '#f0f0f0', padding: 20, borderRadius: 4 }}>
                    <FileExcelOutlined style={{ fontSize: 64, color: '#faad14' }} />
                    <p>PPT预览</p>
                  </div>
                )}
              </div>
              
              <Descriptions column={2}>
                <Descriptions.Item label="文件类型">
                  {selectedFile.type === FileType.PDF ? 'PDF文件' : 
                   selectedFile.type === FileType.PPT || selectedFile.type === FileType.PPTX ? 'PPT文件' : 
                   selectedFile.type === FileType.VIDEO ? '视频文件' : '其他文件'}
                </Descriptions.Item>
                <Descriptions.Item label="文件大小">{formatFileSize(selectedFile.size)}</Descriptions.Item>
                <Descriptions.Item label="处理状态">
                  {selectedFile.status === ProcessStatus.COMPLETED ? '已处理' : 
                   selectedFile.status === ProcessStatus.PROCESSING ? '处理中' : 
                   selectedFile.status === ProcessStatus.FAILED ? '处理失败' : '待处理'}
                </Descriptions.Item>
                {selectedFile.processedAt && (
                  <Descriptions.Item label="处理时间">{new Date(selectedFile.processedAt).toLocaleString()}</Descriptions.Item>
                )}
              </Descriptions>
              
              {selectedFile.status === ProcessStatus.PENDING && (
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={() => {
                    handleClosePreview();
                    handleProcessFile(selectedFile.id);
                  }}
                  style={{ marginTop: 16 }}
                >
                  处理此文件
                </Button>
              )}
            </Card>
          </div>
        )}
      </Modal>
      
      {/* 知识点查看模态框 */}
      <Modal
        title="文件知识点"
        open={showKnowledgeModal}
        onCancel={() => setShowKnowledgeModal(false)}
        footer={null}
        width={800}
      >
        {selectedFileKnowledgePoints.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={selectedFileKnowledgePoints}
            renderItem={item => (
              <List.Item
                key={item.id}
                extra={
                  <Space>
                    {item.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                    {item.confidence > 0.8 ? (
                      <Tag color="red">重要</Tag>
                    ) : item.confidence > 0.6 ? (
                      <Tag color="orange">中等</Tag>
                    ) : (
                      <Tag color="blue">普通</Tag>
                    )}
                  </Space>
                }
              >
                <List.Item.Meta
                  title={item.content.substring(0, 50) + (item.content.length > 50 ? '...' : '')}
                  description={`分类: ${item.category} | 来源: ${item.page ? `第${item.page}页` : item.timestamp ? `${Math.floor(item.timestamp / 60)}分${item.timestamp % 60}秒` : ''}`}
                />
                <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}>
                  {item.content}
                </Paragraph>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="没有找到知识点" />
        )}
      </Modal>
    </div>
  );
};

export default FileManager;