import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  List, 
  Typography, 
  Progress, 
  Button, 
  Divider,
  Tag,
  Space,
  Avatar,
  Empty,
  Spin
} from 'antd';
import {
  FileTextOutlined,
  FileAddOutlined,
  BookOutlined,
  FormOutlined,
  ClockCircleOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  FileOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  BarChartOutlined,
  NodeIndexOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { getProcessResults, getKnowledgePoints, getQuestions, getPapers } from '../../services/storage';
import { KnowledgePoint } from '../../services/extraction';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

// 格式化文件大小
const formatFileSize = (size: number): string => {
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

// 格式化时间为相对时间
const formatRelativeTime = (timestamp: string | number): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) {
    return `${diffDay} 天前`;
  } else if (diffHour > 0) {
    return `${diffHour} 小时前`;
  } else if (diffMin > 0) {
    return `${diffMin} 分钟前`;
  } else {
    return '刚刚';
  }
};

// 获取活动图标
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'extract':
      return <FileTextOutlined style={{ color: '#1890ff' }} />;
    case 'analyze':
      return <NodeIndexOutlined style={{ color: '#52c41a' }} />;
    case 'generate':
      return <FormOutlined style={{ color: '#722ed1' }} />;
    case 'video':
      return <VideoCameraOutlined style={{ color: '#faad14' }} />;
    default:
      return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
  }
};

const usageTips = [
  '上传文件后，系统会自动提取文件中的知识点',
  '使用知识点关联分析功能，可以生成知识图谱',
  '根据知识图谱生成学习路径，规划最佳学习顺序',
  '视频内容识别功能可提取视频中的音频、文字和关键帧'
];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  
  // 封装加载数据的逻辑为一个可重用的函数
  const loadData = useCallback(() => {
    setLoading(true);
    
    try {
      // 获取所有数据
      const results = getProcessResults();
      const points = getKnowledgePoints();
      const allQuestions = getQuestions();
      const allPapers = getPapers();
      
      setProcessedFiles(results);
      setKnowledgePoints(points);
      setQuestions(allQuestions);
      setPapers(allPapers);
      
      // 准备最近文件数据
      const recent = results
        .sort((a, b) => b.processedAt - a.processedAt)
        .slice(0, 4)
        .map(file => ({
          id: file.fileId,
          name: file.fileName,
          type: file.fileType,
          size: '3.5MB', // 这里应该从实际文件中获取
          status: file.status,
          knowledgePoints: file.knowledgePoints.length
        }));
      setRecentFiles(recent);
      
      // 准备最近活动数据
      const activities = [];
      
      // 添加最近处理文件的活动
      if (results.length > 0) {
        const latestFile = results.sort((a, b) => b.processedAt - a.processedAt)[0];
        activities.push({
          id: `extract-${latestFile.fileId}`,
          type: 'extract',
          content: `从"${latestFile.fileName}"中提取了${latestFile.knowledgePoints.length}个知识点`,
          time: formatRelativeTime(latestFile.processedAt),
          fileId: latestFile.fileId
        });
      }
      
      // 添加分析知识点的活动
      if (points.length > 0) {
        activities.push({
          id: 'analyze-points',
          type: 'analyze',
          content: `分析了${points.length}个知识点的关联关系`,
          time: '1小时前'
        });
      }
      
      // 添加生成问题的活动
      if (allQuestions.length > 0) {
        activities.push({
          id: 'generate-questions',
          type: 'generate',
          content: `生成了${allQuestions.length}道练习题`,
          time: '2小时前'
        });
      }
      
      // 添加视频处理活动
      const videoFiles = results.filter(r => r.fileType === 'video');
      if (videoFiles.length > 0) {
        const latestVideo = videoFiles.sort((a, b) => b.processedAt - a.processedAt)[0];
        activities.push({
          id: `video-${latestVideo.fileId}`,
          type: 'video',
          content: `处理了视频"${latestVideo.fileName}"`,
          time: formatRelativeTime(latestVideo.processedAt),
          fileId: latestVideo.fileId
        });
      }
      
      setRecentActivities(activities.slice(0, 4));
    } catch (error) {
      console.error('加载仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 初始加载和设置自动刷新
  useEffect(() => {
    loadData();
    
    // 设置定时刷新（每30秒）
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    
    setRefreshInterval(interval);
    
    // 添加全局事件监听器
    const handleDataUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.type === 'fileProcessed') {
        console.log('仪表盘收到文件处理完成事件:', customEvent.detail);
        loadData();
      }
    };
    
    window.addEventListener('dataUpdated', handleDataUpdated);
    
    // 组件卸载时清除定时器和事件监听器
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      window.removeEventListener('dataUpdated', handleDataUpdated);
    };
  }, [loadData]);
  
  // 手动刷新
  const handleRefresh = () => {
    loadData();
  };
  
  // 处理点击文件动作，修改为使用组件内部导航
  const handleFileClick = (fileId: string) => {
    // 使用设置activeTab来替代navigate
    // 向父组件通信，让它切换到文件管理页面
    window.dispatchEvent(new CustomEvent('switchTab', { 
      detail: { tab: 'files', fileId }
    }));
  };
  
  // 处理点击知识点动作
  const handleKnowledgeClick = () => {
    window.dispatchEvent(new CustomEvent('switchTab', { 
      detail: { tab: 'knowledge' }
    }));
  };
  
  // 处理点击生成问题动作
  const handleQuestionGeneration = (fileId?: string) => {
    window.dispatchEvent(new CustomEvent('switchTab', { 
      detail: { tab: 'questions', fileId }
    }));
  };
  
  // 获取图标
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'ppt':
      case 'pptx':
        return <FileOutlined style={{ color: '#faad14' }} />;
      case 'video':
        return <VideoCameraOutlined style={{ color: '#1890ff' }} />;
      default:
        return <FileTextOutlined />;
    }
  };
  
  // 添加数据更新监听
  useEffect(() => {
    // 监听全局数据更新事件
    const handleDataUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.type === 'fileProcessed') {
        console.log('Dashboard收到文件处理完成事件，刷新数据');
        loadData();
      }
    };
    
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, [loadData]);
  
  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>仪表盘</Title>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          loading={loading}
        >
          刷新数据
        </Button>
      </div>
      <Paragraph>欢迎使用知识收集和教育辅助系统，您可以在这里查看系统概览。</Paragraph>
      
      <Spin spinning={loading}>
        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card hoverable onClick={() => handleFileClick('')}>
              <Statistic
                title="已处理文件"
                value={processedFiles.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable onClick={handleKnowledgeClick}>
              <Statistic
                title="知识点数量"
                value={knowledgePoints.length}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable onClick={() => handleQuestionGeneration()}>
              <Statistic
                title="生成的问题"
                value={questions.length}
                prefix={<FormOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'analysis' } }))}>
              <Statistic
                title="知识关联"
                value={Math.floor(knowledgePoints.length * 0.6)} // 暂时模拟关联数量为知识点数量的60%
                prefix={<NodeIndexOutlined />}
              />
            </Card>
          </Col>
        </Row>
        
        {/* 内容卡片 */}
        <Row gutter={16}>
          {/* 左侧 */}
          <Col span={16}>
            {/* 最近文件 */}
            <Card 
              title="最近处理的文件" 
              style={{ marginBottom: 16 }}
              extra={<Button type="link" icon={<PlusOutlined />} onClick={() => handleFileClick('')}>上传文件</Button>}
            >
              {recentFiles.length > 0 ? (
                <List
                  dataSource={recentFiles}
                  renderItem={item => (
                    <List.Item
                      key={item.id}
                      actions={[
                        <Button type="link" size="small" onClick={() => handleFileClick(item.id)}>查看知识点</Button>,
                        <Button type="link" size="small" onClick={() => handleQuestionGeneration(item.id)}>生成问题</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar icon={getFileIcon(item.type)} />
                        }
                        title={
                          <a onClick={() => handleFileClick(item.id)}>{item.name}</a>
                        }
                        description={
                          <Space>
                            <Text type="secondary">{item.size}</Text>
                            {item.status === 'completed' ? (
                              <Tag color="success">已处理 ({item.knowledgePoints} 个知识点)</Tag>
                            ) : item.status === 'processing' ? (
                              <Tag color="processing">处理中</Tag>
                            ) : item.status === 'failed' ? (
                              <Tag color="error">失败</Tag>
                            ) : (
                              <Tag color="default">待处理</Tag>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: '暂无处理过的文件' }}
                />
              ) : (
                <Empty description="暂无处理过的文件" />
              )}
            </Card>
            
            {/* 最近活动 */}
            <Card title="最近活动">
              {recentActivities.length > 0 ? (
                <List
                  dataSource={recentActivities}
                  renderItem={item => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        avatar={
                          <Avatar icon={getActivityIcon(item.type)} />
                        }
                        title={
                          item.fileId ? (
                            <a onClick={() => handleFileClick(item.fileId)}>{item.content}</a>
                          ) : item.content
                        }
                        description={<Text type="secondary">{item.time}</Text>}
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: '暂无活动记录' }}
                />
              ) : (
                <Empty description="暂无活动记录" />
              )}
            </Card>
          </Col>
          
          {/* 右侧 */}
          <Col span={8}>
            {/* 使用进度 */}
            <Card title="资源使用" style={{ marginBottom: 16 }}>
              <Paragraph>存储空间使用</Paragraph>
              <Progress percent={Math.min(knowledgePoints.length / 10, 100)} status="active" />
              
              <Paragraph style={{ marginTop: 16 }}>知识点分类完成率</Paragraph>
              <Progress percent={Math.min(knowledgePoints.length / 5, 100)} status="active" />
              
              <Paragraph style={{ marginTop: 16 }}>知识图谱完成度</Paragraph>
              <Progress percent={Math.min(knowledgePoints.length / 20, 100)} status="active" />
            </Card>
            
            {/* 使用技巧 */}
            <Card title="使用技巧">
              <List
                dataSource={usageTips}
                renderItem={(item, index) => (
                  <List.Item key={index}>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
        
        {/* 新特性展示 */}
        <Card style={{ marginTop: 16 }}>
          <Title level={5}>新特性</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Card type="inner" title="知识点关联分析" extra={<Button type="link" onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'analysis' } }))}>查看详情</Button>}>
                <Space direction="vertical">
                  <Text>
                    <NodeIndexOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    自动分析知识点之间的关系，构建知识图谱
                  </Text>
                  <Text>
                    <BarChartOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                    检测知识体系中的缺口，提供学习建议
                  </Text>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card type="inner" title="视频内容增强识别" extra={<Button type="link" onClick={() => handleFileClick('')}>查看详情</Button>}>
                <Space direction="vertical">
                  <Text>
                    <VideoCameraOutlined style={{ marginRight: 8, color: '#faad14' }} />
                    自动提取视频音频和关键帧
                  </Text>
                  <Text>
                    <FileTextOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                    对关键帧进行OCR文字识别，分析视频主题
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>
      </Spin>
    </div>
  );
};

export default Dashboard; 