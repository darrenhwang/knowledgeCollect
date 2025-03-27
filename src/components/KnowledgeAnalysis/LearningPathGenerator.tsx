import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Select, 
  Button, 
  List, 
  Divider, 
  Tag, 
  Empty, 
  Steps, 
  Typography, 
  notification,
  Spin
} from 'antd';
import { RocketOutlined, NodeIndexOutlined, LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { KnowledgePoint } from '../../services/extraction';
import { KnowledgeRelation, generateLearningPath } from '../../services/knowledgeAnalysis';
import { useAppContext } from '../../context/AppContext';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface LearningPathGeneratorProps {
  knowledgePoints: KnowledgePoint[];
  relations: KnowledgeRelation[];
  loading?: boolean;
}

const LearningPathGenerator: React.FC<LearningPathGeneratorProps> = ({
  knowledgePoints = [],
  relations = [],
  loading = false
}) => {
  const { state } = useAppContext();
  const [form] = Form.useForm();
  const [targetPoints, setTargetPoints] = useState<string[]>([]);
  const [learningPath, setLearningPath] = useState<KnowledgePoint[]>([]);
  const [generating, setGenerating] = useState(false);
  
  // 根据知识点生成选项
  const knowledgeOptions = knowledgePoints.map(point => ({
    label: point.content.length > 30 ? point.content.substring(0, 30) + '...' : point.content,
    value: point.id,
    tags: point.tags,
    category: point.category
  }));
  
  // 按类别对知识点分组
  const categoryGroups = knowledgePoints.reduce((groups, point) => {
    const category = point.category || '未分类';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(point);
    return groups;
  }, {} as Record<string, KnowledgePoint[]>);
  
  // 生成学习路径
  const handleGeneratePath = async (values: { targetPoints: string[] }) => {
    if (!values.targetPoints || values.targetPoints.length === 0) {
      notification.warning({
        message: '请选择目标知识点',
        description: '请至少选择一个目标知识点来生成学习路径'
      });
      return;
    }
    
    setGenerating(true);
    setTargetPoints(values.targetPoints);
    
    try {
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成学习路径
      const path = generateLearningPath(
        knowledgePoints,
        relations,
        values.targetPoints
      );
      
      setLearningPath(path);
      
      notification.success({
        message: '学习路径已生成',
        description: `成功生成包含 ${path.length} 个知识点的学习路径`
      });
    } catch (error) {
      console.error('生成学习路径失败:', error);
      notification.error({
        message: '生成失败',
        description: '生成学习路径时发生错误'
      });
    } finally {
      setGenerating(false);
    }
  };
  
  // 清空路径
  const handleClearPath = () => {
    setLearningPath([]);
    form.resetFields();
  };
  
  // 导出学习路径
  const handleExportPath = () => {
    if (learningPath.length === 0) return;
    
    let content = '# 学习路径\n\n';
    content += `生成日期: ${new Date().toLocaleDateString()}\n\n`;
    content += '## 目标知识点\n\n';
    
    // 添加目标知识点
    const targetPointsData = knowledgePoints.filter(p => targetPoints.includes(p.id));
    targetPointsData.forEach(point => {
      content += `- ${point.content}\n`;
    });
    
    content += '\n## 完整学习路径\n\n';
    
    // 添加学习路径
    learningPath.forEach((point, index) => {
      content += `### 步骤 ${index + 1}: ${point.content.substring(0, 50)}${point.content.length > 50 ? '...' : ''}\n\n`;
      content += `${point.content}\n\n`;
      if (point.tags.length > 0) {
        content += `标签: ${point.tags.join(', ')}\n\n`;
      }
    });
    
    // 创建并下载文件
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `学习路径_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    
    notification.success({
      message: '导出成功',
      description: '学习路径已成功导出为Markdown文件'
    });
  };
  
  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RocketOutlined style={{ marginRight: 8 }} />
          <span>学习路径生成</span>
        </div>
      }
      extra={
        learningPath.length > 0 ? (
          <Button 
            icon={<SaveOutlined />} 
            onClick={handleExportPath}
            type="primary"
          >
            导出路径
          </Button>
        ) : null
      }
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGeneratePath}
          disabled={loading}
        >
          <Form.Item
            name="targetPoints"
            label="选择目标知识点"
            rules={[{ required: true, message: '请选择至少一个目标知识点' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择您想要学习的目标知识点"
              optionFilterProp="label"
              style={{ width: '100%' }}
              options={knowledgeOptions}
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={generating}
              icon={<NodeIndexOutlined />}
              style={{ marginRight: 8 }}
            >
              生成学习路径
            </Button>
            
            <Button 
              onClick={handleClearPath}
              disabled={learningPath.length === 0}
            >
              清空路径
            </Button>
          </Form.Item>
        </Form>
        
        <Divider />
        
        {learningPath.length > 0 ? (
          <div className="learning-path-container">
            <Title level={4}>学习路径</Title>
            <Paragraph>
              以下是基于您选择的目标知识点生成的最佳学习路径，按照此路径学习将有助于更高效地掌握知识。
            </Paragraph>
            
            <Steps
              direction="vertical"
              current={learningPath.length - 1}
              items={learningPath.map((point, index) => ({
                title: (
                  <div>
                    <strong>步骤 {index + 1}</strong>
                    {targetPoints.includes(point.id) && (
                      <Tag color="success" style={{ marginLeft: 8 }}>目标</Tag>
                    )}
                  </div>
                ),
                description: (
                  <div>
                    <Paragraph>{point.content}</Paragraph>
                    <div>
                      {point.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </div>
                ),
                icon: targetPoints.includes(point.id) ? <RocketOutlined /> : undefined
              }))}
            />
          </div>
        ) : generating ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            <p style={{ marginTop: 16 }}>正在生成学习路径...</p>
          </div>
        ) : (
          <Empty 
            description="选择目标知识点后生成学习路径" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        )}
      </Spin>
    </Card>
  );
};

export default LearningPathGenerator; 