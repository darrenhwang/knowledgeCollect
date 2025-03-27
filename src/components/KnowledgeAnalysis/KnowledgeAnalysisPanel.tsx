import React, { useState, useEffect } from 'react';
import { Tabs, Button, Space, notification, Spin } from 'antd';
import { SyncOutlined, AppstoreOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { KnowledgePoint } from '../../services/extraction';
import { 
  KnowledgeRelation, 
  RelationType, 
  analyzeKnowledgeRelations 
} from '../../services/knowledgeAnalysis';
import KnowledgeGraph from './KnowledgeGraph';
import LearningPathGenerator from './LearningPathGenerator';
import { useAppContext } from '../../context/AppContext';

interface KnowledgeAnalysisPanelProps {
  knowledgePoints?: KnowledgePoint[];
}

const KnowledgeAnalysisPanel: React.FC<KnowledgeAnalysisPanelProps> = ({
  knowledgePoints = []
}) => {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState('graph');
  const [relations, setRelations] = useState<KnowledgeRelation[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  
  // 初始化时分析关系
  useEffect(() => {
    if (knowledgePoints.length > 1 && relations.length === 0) {
      handleAnalyzeRelations();
    }
  }, [knowledgePoints]);
  
  // 分析知识点关系
  const handleAnalyzeRelations = async () => {
    if (knowledgePoints.length < 2) {
      notification.warning({
        message: '知识点不足',
        description: '需要至少两个知识点才能进行关系分析'
      });
      return;
    }
    
    setAnalyzing(true);
    
    try {
      // 模拟分析延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 分析知识点关系
      const analyzedRelations = analyzeKnowledgeRelations(knowledgePoints);
      
      setRelations(analyzedRelations);
      
      notification.success({
        message: '分析完成',
        description: `成功分析出 ${analyzedRelations.length} 个知识点关联`
      });
    } catch (error) {
      console.error('分析知识点关系失败:', error);
      notification.error({
        message: '分析失败',
        description: '分析知识点关系时发生错误'
      });
    } finally {
      setAnalyzing(false);
    }
  };
  
  // 获取不同关系类型的统计
  const getRelationTypeStats = () => {
    const stats = Object.values(RelationType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as Record<RelationType, number>);
    
    relations.forEach(relation => {
      stats[relation.type]++;
    });
    
    return stats;
  };
  
  // 计算关系统计
  const relationStats = getRelationTypeStats();
  
  // Tab 项
  const tabItems = [
    {
      key: 'graph',
      label: (
        <span>
          <AppstoreOutlined />
          知识图谱
        </span>
      ),
      children: (
        <KnowledgeGraph 
          knowledgePoints={knowledgePoints}
          relations={relations}
          loading={analyzing}
          onRefresh={handleAnalyzeRelations}
        />
      )
    },
    {
      key: 'path',
      label: (
        <span>
          <NodeIndexOutlined />
          学习路径
        </span>
      ),
      children: (
        <LearningPathGenerator
          knowledgePoints={knowledgePoints}
          relations={relations}
          loading={analyzing}
        />
      )
    }
  ];
  
  return (
    <div className="knowledge-analysis-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>知识点关联分析</h2>
        
        <Space>
          <Button 
            type="primary" 
            icon={<SyncOutlined spin={analyzing} />} 
            onClick={handleAnalyzeRelations}
            loading={analyzing}
          >
            {analyzing ? '分析中...' : '重新分析关联'}
          </Button>
          
          <span style={{ marginLeft: 8 }}>
            已发现 <strong>{relations.length}</strong> 个关联
          </span>
        </Space>
      </div>
      
      {relations.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Space>
            {Object.entries(relationStats).map(([type, count]) => 
              count > 0 ? (
                <span key={type} style={{ marginRight: 16 }}>
                  {type === RelationType.SIMILAR ? '相似内容' : 
                   type === RelationType.PREREQUISITE ? '前置知识' :
                   type === RelationType.EXTENSION ? '知识延伸' :
                   type === RelationType.CONTRADICTION ? '知识矛盾' :
                   type === RelationType.PARENT_CHILD ? '父子关系' : type}:
                  <strong style={{ marginLeft: 4 }}>{count}</strong>
                </span>
              ) : null
            )}
          </Space>
        </div>
      )}
      
      <Tabs 
        items={tabItems}
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
      />
    </div>
  );
};

export default KnowledgeAnalysisPanel; 