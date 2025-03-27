import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  List, 
  Tag, 
  Space, 
  Drawer, 
  Tabs, 
  Tree, 
  Empty, 
  Tooltip,
  Typography,
  Divider,
  message,
  notification,
  Row,
  Col
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
  NodeIndexOutlined
} from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import KnowledgeAnalysisPanel from '../KnowledgeAnalysis/KnowledgeAnalysisPanel';
import { getKnowledgePoints, deleteKnowledgePoint, updateKnowledgePoint } from '../../services/storage';
import { KnowledgePoint as StoredKnowledgePoint } from '../../services/extraction';

const { Search } = Input;
const { TabPane } = Tabs;
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
  
  // 从存储服务获取知识点数据
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  
  // 加载数据
  useEffect(() => {
    loadKnowledgeItems();
  }, []);
  
  // 从存储加载知识点
  const loadKnowledgeItems = () => {
    try {
      const storedPoints = getKnowledgePoints();
      
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
    }
  };
  
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
  
  return (
    <div className="knowledge-base-container">
      <Row gutter={16} style={{ height: '100%' }}>
        {/* 左侧边栏 */}
        <Col span={6} style={{ height: '100%' }}>
          <Card title="分类与标签" style={{ marginBottom: 16 }}>
            <Tabs defaultActiveKey="category">
              <TabPane tab="分类" key="category">
                <Tree
                  treeData={categoryTreeData}
                  defaultExpandAll
                  onSelect={handleCategorySelect}
                  selectedKeys={selectedCategory ? [selectedCategory] : []}
                />
              </TabPane>
              <TabPane tab="标签" key="tags">
                <Space wrap>
                  {tagList.map(tag => (
                    <Tag 
                      key={tag.name}
                      color={selectedTags.includes(tag.name) ? 'blue' : 'default'}
                      style={{ cursor: 'pointer', marginBottom: 8 }}
                      onClick={() => handleTagClick(tag.name)}
                    >
                      {tag.name} ({tag.count})
                    </Tag>
                  ))}
                </Space>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
        
        {/* 主内容区域 */}
        <Col span={18} style={{ height: '100%' }}>
          <Card 
            title="知识库" 
            extra={
              <Space>
                <Input.Search
                  placeholder="搜索知识点"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                />
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setSelectedKnowledge(null)}
                >
                  添加知识点
                </Button>
                <Button 
                  icon={<NodeIndexOutlined />} 
                  onClick={handleKnowledgeAnalysis}
                  disabled={filteredKnowledgeItems.length < 2}
                >
                  关联分析
                </Button>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div style={{ marginBottom: 16 }}>
              {(searchText || selectedCategory || selectedTags.length > 0) && (
                <div style={{ marginTop: 8 }}>
                  <Space wrap>
                    {searchText && (
                      <Tag closable onClose={() => setSearchText('')}>
                        搜索: {searchText}
                      </Tag>
                    )}
                    {selectedCategory && (
                      <Tag closable onClose={() => setSelectedCategory(null)}>
                        分类: {categoryTreeData.find(c => c.key === selectedCategory)?.title || 
                          categoryTreeData.flatMap(c => c.children || []).find(sc => sc.key === selectedCategory)?.title}
                      </Tag>
                    )}
                    {selectedTags.map(tag => (
                      <Tag 
                        key={tag} 
                        closable 
                        onClose={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                      >
                        标签: {tag}
                      </Tag>
                    ))}
                    <Button 
                      type="link" 
                      onClick={() => {
                        setSearchText('');
                        setSelectedCategory(null);
                        setSelectedTags([]);
                      }}
                    >
                      清除全部
                    </Button>
                  </Space>
                </div>
              )}
            </div>
            
            {filteredKnowledgeItems.length > 0 ? (
              <List
                itemLayout="vertical"
                size="large"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['5', '10', '20', '50']
                }}
                dataSource={filteredKnowledgeItems}
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <Tooltip title="查看详情">
                        <Button 
                          type="link" 
                          icon={<EyeOutlined />} 
                          onClick={() => showKnowledgeDetail(item)}
                        >
                          查看
                        </Button>
                      </Tooltip>,
                      <Tooltip title="编辑">
                        <Button 
                          type="link" 
                          icon={<EditOutlined />}
                        >
                          编辑
                        </Button>
                      </Tooltip>,
                      <Tooltip title="删除">
                        <Button 
                          type="link" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteKnowledge(item.id)}
                        >
                          删除
                        </Button>
                      </Tooltip>
                    ]}
                    extra={
                      <div>
                        <div style={{ marginBottom: 4 }}>
                          <BookOutlined /> 来源: {item.source.fileName}
                        </div>
                        <div>
                          <TagOutlined /> 位置: {item.source.location}
                        </div>
                      </div>
                    }
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{item.title}</Text>
                          {renderImportanceTag(item.importance)}
                        </Space>
                      }
                      description={
                        <Space wrap>
                          {item.tags.map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </Space>
                      }
                    />
                    <Paragraph 
                      ellipsis={{ rows: 2, expandable: false }}
                      style={{ marginBottom: 0 }}
                    >
                      {item.content}
                    </Paragraph>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="没有找到相关知识点" />
            )}
          </Card>
          
          {/* 如果显示关联分析，渲染知识点关联分析面板 */}
          {showAnalysis && (
            <Card 
              title="知识点关联分析" 
              extra={
                <Button type="link" onClick={handleCloseAnalysis}>关闭分析</Button>
              }
            >
              <KnowledgeAnalysisPanel knowledgePoints={filteredKnowledgeItems} />
            </Card>
          )}
        </Col>
      </Row>
      
      {/* 知识点详情抽屉 */}
      <Drawer
        title={selectedKnowledge ? "知识点详情" : "添加知识点"}
        placement="right"
        onClose={onDrawerClose}
        open={selectedKnowledge !== null}
        width={600}
      >
        {selectedKnowledge && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                {renderImportanceTag(selectedKnowledge.importance)}
                {selectedKnowledge.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </div>
            
            <Title level={5}>内容</Title>
            <Paragraph>{selectedKnowledge.content}</Paragraph>
            
            <Divider />
            
            <Title level={5}>来源信息</Title>
            <Paragraph>
              <ul>
                <li><Text strong>文件名：</Text>{selectedKnowledge.source.fileName}</li>
                <li><Text strong>文件类型：</Text>{selectedKnowledge.source.fileType.toUpperCase()}</li>
                <li><Text strong>位置：</Text>{selectedKnowledge.source.location}</li>
              </ul>
            </Paragraph>
            
            <Divider />
            
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">创建时间：{new Date(selectedKnowledge.createdAt).toLocaleString()}</Text>
              {selectedKnowledge.updatedAt && (
                <div>
                  <Text type="secondary">更新时间：{new Date(selectedKnowledge.updatedAt).toLocaleString()}</Text>
                </div>
              )}
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default KnowledgeBase; 