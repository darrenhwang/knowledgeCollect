import React, { useState, useEffect } from 'react';
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
  Descriptions
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
  PlayCircleOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { processVideoFile, VideoProcessingConfig } from '../../services/videoProcessing';
import { addKnowledgePoints, addProcessResult } from '../../services/storage';
import { processFile, KnowledgePoint, ProcessStatus } from '../../services/extraction';
import { useDispatch } from 'react-redux';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

// 文件类型定义
interface FileItem {
  id: string;
  name: string;
  path: string;
  type: 'pdf' | 'ppt' | 'video' | 'other';
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  processedAt?: string;
  progress?: number;
}

// 获取文件类型图标
const getFileTypeIcon = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
      return <FilePdfOutlined style={{ color: '#f5222d' }} />;
    case 'ppt':
      return <FileExcelOutlined style={{ color: '#fa8c16' }} />;
    case 'video':
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
const getStatusTag = (status: string) => {
  switch (status) {
    case 'pending':
      return <Tag color="default">待处理</Tag>;
    case 'processing':
      return <Tag color="processing" icon={<SyncOutlined spin />}>处理中</Tag>;
    case 'completed':
      return <Tag color="success">已完成</Tag>;
    case 'error':
      return <Tag color="error">处理失败</Tag>;
    default:
      return <Tag color="default">未知状态</Tag>;
  }
};

const FileManager: React.FC = () => {
  // 模拟文件数据
  const [files, setFiles] = useState<FileItem[]>([]);
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
      render: (type) => {
        const typeText = type === 'pdf' ? 'PDF' : 
                         type === 'ppt' ? 'PPT' :
                         type === 'video' ? '视频' : '其他';
        return <Tag>{typeText}</Tag>;
      },
      filters: [
        { text: 'PDF', value: 'pdf' },
        { text: 'PPT', value: 'ppt' },
        { text: '视频', value: 'video' },
        { text: '其他', value: 'other' },
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
          {status === 'processing' && record.progress !== undefined && (
            <Progress percent={record.progress} size="small" style={{ marginLeft: 10, width: 100 }} />
          )}
        </>
      ),
      filters: [
        { text: '待处理', value: 'pending' },
        { text: '处理中', value: 'processing' },
        { text: '已完成', value: 'completed' },
        { text: '处理失败', value: 'error' },
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
              disabled={record.status === 'processing'}
              onClick={() => handleProcessFile(record.id)}
            >
              处理
            </Button>
          </Tooltip>
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

  // 上传文件配置
  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isAllowed = 
        file.type === 'application/pdf' || 
        file.type === 'application/vnd.ms-powerpoint' ||
        file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        file.type.startsWith('video/');
      
      if (!isAllowed) {
        message.error(`${file.name} 不是支持的文件类型!`);
      }
      
      // 这里只是模拟添加到列表，实际应用中应该上传至Electron主进程
      const fileType = file.type.includes('pdf') ? 'pdf' :
                     file.type.includes('powerpoint') || file.type.includes('presentation') ? 'ppt' :
                     file.type.startsWith('video/') ? 'video' : 'other';
      
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        path: URL.createObjectURL(file), // 这里只是为了演示
        type: fileType as 'pdf' | 'ppt' | 'video' | 'other',
        size: file.size,
        status: 'pending'
      };
      
      setFiles(prev => [...prev, newFile]);
      message.success(`${file.name} 已添加到列表`);
      
      // 阻止默认上传行为
      return false;
    },
    multiple: true,
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
    const fileIndex = files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;
    
    const file = files[fileIndex];
    
    // 更新状态为处理中
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[fileIndex] = {
        ...newFiles[fileIndex],
        status: 'processing',
        progress: 0
      };
      return newFiles;
    });
    
    try {
      // 根据文件类型处理
      let knowledgePoints: KnowledgePoint[] = [];
      
      if (file.type === 'video') {
        // 模拟视频处理
        await processVideoWithProgress(file, fileIndex);
        
        // 从视频处理中获取知识点
        // 实际应用中应该调用真正的视频处理函数
        const videoAnalysisResult = await processFile(file.path);
        knowledgePoints = videoAnalysisResult.knowledgePoints;
        
        // 将处理结果添加到存储
        addProcessResult(videoAnalysisResult);
      } else {
        // 处理其他类型文件
        await simulateFileProcessing(fileIndex);
        
        // 处理文件并获取知识点
        const processResult = await processFile(file.path);
        knowledgePoints = processResult.knowledgePoints;
        
        // 将处理结果添加到存储
        addProcessResult(processResult);
      }
      
      // 将知识点添加到知识库
      if (knowledgePoints.length > 0) {
        addKnowledgePoints(knowledgePoints);
        message.success(`已从文件中提取${knowledgePoints.length}个知识点并添加到知识库`);
      }
      
      // 处理完成，更新状态
      setFiles(prevFiles => {
        const newFiles = [...prevFiles];
        newFiles[fileIndex] = {
          ...newFiles[fileIndex],
          status: 'completed',
          processedAt: new Date().toISOString(),
          progress: 100
        };
        return newFiles;
      });
      
      message.success(`文件处理完成: ${file.name}`);
    } catch (error) {
      console.error('处理文件出错:', error);
      
      // 更新状态为失败
      setFiles(prevFiles => {
        const newFiles = [...prevFiles];
        newFiles[fileIndex] = {
          ...newFiles[fileIndex],
          status: 'error'
        };
        return newFiles;
      });
      
      message.error(`处理文件失败: ${file.name}`);
    }
  };

  // 模拟视频处理带进度
  const processVideoWithProgress = async (file: FileItem, fileIndex: number) => {
    try {
      // 如果存在真实文件，使用服务处理
      // 这里只模拟，实际需要调用视频处理服务
      // const result = await processVideoFile(file.originalFile!.path, processingConfig);
      
      // 模拟处理过程
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
          status: 'completed',
          processedAt: new Date().toISOString(),
          progress: 100
        };
        return newFiles;
      });
      
      message.success(`视频处理完成: ${file.name}`);
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
        status: 'completed',
        processedAt: new Date().toISOString(),
        progress: 100
      };
      return newFiles;
    });
    
    message.success(`文件处理完成: ${files[fileIndex].name}`);
  };

  // 查看文件详情
  const handleViewFileDetails = (file: FileItem) => {
    // 实现查看文件详情的逻辑
    message.info(`查看文件详情: ${file.name}`);
  };

  // 删除文件
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
      if (file && file.status !== 'processing') {
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

  // 过滤和排序的文件数据
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchText ? 
      file.name.toLowerCase().includes(searchText.toLowerCase()) : 
      true;
    
    const matchesFileType = fileTypeFilter ? 
      file.type === fileTypeFilter : 
      true;
    
    const matchesStatus = statusFilter ? 
      file.status === statusFilter : 
      true;
    
    return matchesSearch && matchesFileType && matchesStatus;
  });

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

  return (
    <div className="file-manager">
      <Title level={4}>文件管理</Title>
      <Paragraph>上传并处理PPT、PDF和视频文件，提取知识点</Paragraph>
      
      <Card style={{ marginBottom: 16 }}>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <FileAddOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持 PDF、PPT 和视频文件，单文件最大 500MB
          </p>
        </Dragger>
      </Card>
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
          >
            <TabPane tab="全部文件" key="all" />
            <TabPane tab="待处理" key="pending" />
            <TabPane tab="已处理" key="completed" />
            <TabPane tab="视频" key="video" />
            <TabPane tab="文档" key="document" />
          </Tabs>
          
          <Button 
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleBatchProcess}
            disabled={selectedFiles.length === 0}
          >
            批量处理
          </Button>
        </div>
        
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredFiles}
          rowKey="id"
          loading={loading}
          pagination={{ 
            defaultPageSize: 10, 
            showSizeChanger: true, 
            pageSizeOptions: ['10', '20', '50']
          }}
        />
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
                {selectedFile.type === 'video' ? (
                  <div style={{ background: '#f0f0f0', padding: 20, borderRadius: 4 }}>
                    <VideoCameraOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                    <p>视频预览</p>
                  </div>
                ) : selectedFile.type === 'pdf' ? (
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
                <Descriptions.Item label="文件类型">{selectedFile.type.toUpperCase()}</Descriptions.Item>
                <Descriptions.Item label="文件大小">{formatFileSize(selectedFile.size)}</Descriptions.Item>
                <Descriptions.Item label="处理状态">
                  {selectedFile.status === 'completed' ? '已处理' : 
                   selectedFile.status === 'processing' ? '处理中' : '待处理'}
                </Descriptions.Item>
                {selectedFile.processedAt && (
                  <Descriptions.Item label="处理时间">{new Date(selectedFile.processedAt).toLocaleString()}</Descriptions.Item>
                )}
              </Descriptions>
              
              {selectedFile.status === 'pending' && (
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
    </div>
  );
};

export default FileManager; 