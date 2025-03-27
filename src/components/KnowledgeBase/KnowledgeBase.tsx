import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  List, 
  Tag, 
  Space, 
  Drawer, 
  Tree, 
  Empty, 
  Tooltip,
  Typography,
  Divider,
  message,
  notification,
  Row,
  Col,
  Spin,
  Descriptions,
  Modal
} from 'antd';
import { 
  SearchOutlined, 
  BookOutlined, 
  TagOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined,
  NodeIndexOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import KnowledgeAnalysisPanel from '../KnowledgeAnalysis/KnowledgeAnalysisPanel';
import { getKnowledgePoints, deleteKnowledgePoint, updateKnowledgePoint } from '../../services/storage';
import { KnowledgePoint as StoredKnowledgePoint } from '../../services/extraction';

const { Search } = Input;
const { Text, Title, Paragraph } = Typography;

// 知识点类型定义
interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source: {
    fileName: string;
    fileType: string;
    location: string; // 如：页码、时间点等
  };
  importance: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt?: string;
}

// 模拟知识分类树
const categoryTreeData: TreeDataNode[] = [
  {
    title: '语文',
    key: 'chinese',
    children: [
      {
        title: '汉字',
        key: 'chinese-characters',
      },
      {
        title: '词语',
        key: 'chinese-words',
      },
      {
        title: '语法',
        key: 'chinese-grammar',
      },
      {
        title: '阅读理解',
        key: 'chinese-reading',
      },
    ],
  },
  {
    title: '数学',
    key: 'math',
    children: [
      {
        title: '数与计算',
        key: 'math-numbers',
      },
      {
        title: '几何',
        key: 'math-geometry',
      },
      {
        title: '代数',
        key: 'math-algebra',
      },
    ],
  },
  {
    title: '英语',
    key: 'english',
    children: [
      {
        title: '单词',
        key: 'english-vocabulary',
      },
      {
        title: '语法',
        key: 'english-grammar',
      },
      {
        title: '听力',
        key: 'english-listening',
      },
    ],
  },
  {
    title: '科学',
    key: 'science',
    children: [
      {
        title: '物理',
        key: 'science-physics',
      },
      {
        title: '化学',
        key: 'science-chemistry',
      },
      {
        title: '生物',
        key: 'science-biology',
      },
    ],
  },
];

// 模拟标签数据
const tagList = [
  { name: '重要概念', count: 12 },
  { name: '公式', count: 8 },
  { name: '定义', count: 15 },
  { name: '例子', count: 20 },
  { name: '规则', count: 7 },
  { name: '习题', count: 9 },
  { name: '技巧', count: 5 },
  { name: '解释', count: 14 },
  { name: '记忆', count: 11 },
  { name: '原理', count: 6 },
];

// 重要性标签渲染
const renderImportanceTag = (importance: string) => {
  switch (importance) {
    case 'high':
      return <Tag color="red">重要</Tag>;
    case 'medium':
      return <Tag color="orange">中等</Tag>;
    case 'low':
      return <Tag color="blue">普通</Tag>;
    default:
      return null;
  }
};

const KnowledgeBase: React.FC = () => {
  // 状态管理
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeItem | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // 从存储服务获取知识点数据
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  
  // 加载数据
  const loadKnowledgeItems = useCallback(() => {
    setLoading(true);
    try {
      const storedPoints = getKnowledgePoints();
      
      console.log(`加载了 ${storedPoints.length} 个知识点`);
      
      // 转换格式
      const formattedItems = storedPoints.map(point => {
        // 从文件路径中提取文件名
        const fileName = point.source.split(/[/\\]/).pop() || point.source;
        
        return {
          id: point.id,
          title: point.content.length > 30 ? point.content.substring(0, 30) + '...' : point.content,
          content: point.content,
          category: point.category,
          tags: point.tags,
          source: {
            fileName: fileName,
            fileType: point.sourceType,
            location: point.page ? `第${point.page}页` : point.timestamp ? `${Math.floor(point.timestamp / 60)}分${point.timestamp % 60}秒` : '-'
          },
          importance: point.confidence > 0.8 ? 'high' : point.confidence > 0.6 ? 'medium' : 'low',
          createdAt: new Date(point.createdAt).toISOString()
        } as KnowledgeItem;
      });
      
      setKnowledgeItems(formattedItems);
    } catch (error) {
      console.error('加载知识点失败:', error);
      message.error('加载知识点数据失败');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 初始加载
  useEffect(() => {
    loadKnowledgeItems();
    
    // 设置定时刷新（每30秒）
    const interval = setInterval(() => {
      loadKnowledgeItems();
    }, 30000);
    
    // 添加全局事件监听器
    const handleDataUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.type === 'fileProcessed') {
        console.log('知识库收到文件处理完成事件:', customEvent.detail);
        loadKnowledgeItems();
      }
    };
    
    window.addEventListener('dataUpdated', handleDataUpdated);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dataUpdated', handleDataUpdated);
    };
  }, [loadKnowledgeItems]);
  
  // 手动刷新
  const handleRefresh = () => {
    loadKnowledgeItems();
    message.success('知识库数据已刷新');
  };
  
  // 同步数据变化
  useEffect(() => {
    loadKnowledgeItems();
  }, [refreshTrigger, loadKnowledgeItems]);
  
  // 打开知识详情抽屉
  const showKnowledgeDetail = (item: KnowledgeItem) => {
    setSelectedKnowledge(item);
    setDrawerVisible(true);
  };
  
  // 关闭抽屉
  const onDrawerClose = () => {
    setDrawerVisible(false);
    setSelectedKnowledge(null);
  };
  
  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
  };
  
  // 处理分类选择
  const handleCategorySelect = (selectedKeys: React.Key[]) => {
    setSelectedCategory(selectedKeys.length > 0 ? selectedKeys[0] as string : null);
  };
  
  // 处理标签选择
  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  
  // 删除知识点
  const handleDeleteKnowledge = (id: string) => {
    try {
      // 从存储中删除
      const result = deleteKnowledgePoint(id);
      
      if (result) {
        // 更新本地状态
        setKnowledgeItems(prev => prev.filter(item => item.id !== id));
        message.success('知识点已删除');
        
        if (selectedKnowledge?.id === id) {
          onDrawerClose();
        }
        
        // 触发刷新
        setRefreshTrigger(prev => prev + 1);
      } else {
        message.error('删除知识点失败');
      }
    } catch (error) {
      console.error('删除知识点错误:', error);
      message.error('删除知识点时发生错误');
    }
  };
  
  // 过滤知识点列表
  const filteredKnowledgeItems = knowledgeItems.filter(item => {
    const matchesSearch = searchText
      ? item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.content.toLowerCase().includes(searchText.toLowerCase())
      : true;
    
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory || item.category.startsWith(`${selectedCategory}-`)
      : true;
    
    const matchesTags = selectedTags.length > 0
      ? selectedTags.every(tag => item.tags.includes(tag))
      : true;
    
    return matchesSearch && matchesCategory && matchesTags;
  });
  
  // 计算所有标签的使用次数
  const allTags = knowledgeItems.reduce((tags, item) => {
    item.tags.forEach(tag => {
      if (!tags[tag]) {
        tags[tag] = 0;
      }
      tags[tag]++;
    });
    return tags;
  }, {} as Record<string, number>);
  
  // 转换为排序后的标签列表
  const sortedTags = Object.entries(allTags)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  // 处理知识点关联分析
  const handleKnowledgeAnalysis = () => {
    if (filteredKnowledgeItems.length < 2) {
      notification.warning({
        message: '知识点不足',
        description: '需要至少两个知识点才能进行关联分析'
      });
      return;
    }
    setShowAnalysis(true);
  };
  
  // 关闭知识点关联分析
  const handleCloseAnalysis = () => {
    setShowAnalysis(false);
  };
  
  // 添加数据更新监听
  useEffect(() => {
    // 监听全局数据更新事件
    const handleDataUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.type === 'fileProcessed') {
        console.log('KnowledgeBase收到文件处理完成事件，刷新数据');
        loadKnowledgeItems();
      }
    };
    
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, [loadKnowledgeItems]);
  
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* 左侧边栏 */}
      <Card 
        style={{ width: 250, marginRight: 16, overflow: 'auto' }}
        title="知识库"
        extra={
          <Button 
            type="text" 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          />
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索知识点"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
        
        <Divider orientation="left">分类</Divider>
        <Tree
          treeData={categoryTreeData}
          defaultExpandAll
          onSelect={handleCategorySelect}
        />
        
        <Divider orientation="left">标签</Divider>
        <div style={{ marginBottom: 16 }}>
          {sortedTags.map(tag => (
            <Tag 
              key={tag.name}
              color={selectedTags.includes(tag.name) ? 'blue' : undefined}
              style={{ marginBottom: 8, cursor: 'pointer' }}
              onClick={() => handleTagClick(tag.name)}
            >
              {tag.name} ({tag.count})
            </Tag>
          ))}
        </div>
      </Card>
      
      {/* 右侧内容区 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Card
          title={
            <Space>
              <span>知识点列表</span>
              <Tag color="blue">{filteredKnowledgeItems.length} 个结果</Tag>
            </Space>
          }
          extra={
            <Space>
              <Tooltip title="分析知识关系">
                <Button 
                  icon={<NodeIndexOutlined />} 
                  onClick={() => setShowAnalysis(true)}
                >
                  知识关联分析
                </Button>
              </Tooltip>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
              >
                添加知识点
              </Button>
            </Space>
          }
        >
          <Spin spinning={loading}>
            {filteredKnowledgeItems.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={filteredKnowledgeItems}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                }}
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<EyeOutlined />}
                        onClick={() => showKnowledgeDetail(item)}
                      >
                        查看详情
                      </Button>,
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<EditOutlined />}
                      >
                        编辑
                      </Button>,
                      <Button 
                        type="link" 
                        danger 
                        size="small" 
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteKnowledge(item.id)}
                      >
                        删除
                      </Button>
                    ]}
                    extra={
                      <Space direction="vertical">
                        {renderImportanceTag(item.importance)}
                        <Space>
                          {item.tags.slice(0, 3).map(tag => (
                            <Tag key={tag} color="blue">{tag}</Tag>
                          ))}
                          {item.tags.length > 3 && <Tag>+{item.tags.length - 3}</Tag>}
                        </Space>
                      </Space>
                    }
                  >
                    <List.Item.Meta
                      title={<a onClick={() => showKnowledgeDetail(item)}>{item.title}</a>}
                      description={
                        <Text type="secondary">
                          来源：{item.source.fileName} ({item.source.location}) | 
                          分类：{item.category} | 
                          创建时间：{new Date(item.createdAt).toLocaleString()}
                        </Text>
                      }
                    />
                    <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}>
                      {item.content}
                    </Paragraph>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="没有找到符合条件的知识点" />
            )}
          </Spin>
        </Card>
      </div>
      
      {/* 知识点详情抽屉 */}
      <Drawer
        title="知识点详情"
        width={500}
        open={drawerVisible}
        onClose={onDrawerClose}
        footer={
          <Space>
            <Button onClick={onDrawerClose}>关闭</Button>
            <Button type="primary">编辑</Button>
          </Space>
        }
      >
        {selectedKnowledge && (
          <div>
            <Title level={4}>{selectedKnowledge.title}</Title>
            <Paragraph style={{ marginBottom: 16 }}>
              {selectedKnowledge.content}
            </Paragraph>
            
            <Divider />
            
            <Descriptions column={1}>
              <Descriptions.Item label="来源">
                {selectedKnowledge.source.fileName} ({selectedKnowledge.source.fileType})
              </Descriptions.Item>
              <Descriptions.Item label="位置">
                {selectedKnowledge.source.location}
              </Descriptions.Item>
              <Descriptions.Item label="分类">
                {selectedKnowledge.category}
              </Descriptions.Item>
              <Descriptions.Item label="标签">
                <Space>
                  {selectedKnowledge.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="重要程度">
                {renderImportanceTag(selectedKnowledge.importance)}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(selectedKnowledge.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
      
      {/* 知识分析模态框 */}
      <Modal
        title="知识关联分析"
        open={showAnalysis}
        onCancel={() => setShowAnalysis(false)}
        width={800}
        footer={null}
      >
        <KnowledgeAnalysisPanel />
      </Modal>
    </div>
  );
};

export default KnowledgeBase; 