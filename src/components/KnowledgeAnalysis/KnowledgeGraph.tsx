import React, { useRef, useEffect, useState } from 'react';
import { Card, Empty, Spin, Button, Space, Select, Tooltip, message } from 'antd';
import { ReloadOutlined, ZoomInOutlined, ZoomOutOutlined, SaveOutlined } from '@ant-design/icons';
import { KnowledgePoint } from '../../services/extraction';
import { 
  KnowledgeRelation, 
  RelationType, 
  generateKnowledgeGraph, 
  getRelationTypeName,
  findKeyKnowledgePoints,
  detectKnowledgeGaps
} from '../../services/knowledgeAnalysis';
import { useAppContext } from '../../context/AppContext';

// 引入 G6 图可视化库
// 注意：实际项目中需要安装 @antv/g6 依赖并正确引入
// 这里假设已经安装了依赖
// import G6 from '@antv/g6';

// 为方便展示，这里简化图形渲染，实际项目中应使用专业的图可视化库如G6
interface GraphProps {
  width: number;
  height: number;
  data: {
    nodes: any[];
    edges: any[];
  };
}

// 简化的图形渲染组件
const SimpleGraph: React.FC<GraphProps> = ({ width, height, data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 如果没有数据，显示提示
    if (!data.nodes.length) {
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('暂无图谱数据', width / 2, height / 2);
      return;
    }
    
    // 简单布局：将节点均匀分布在圆周上
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5;
    
    // 存储节点位置
    const nodePositions: Record<string, {x: number, y: number}> = {};
    
    // 绘制节点
    data.nodes.forEach((node, index) => {
      const angle = (index / data.nodes.length) * Math.PI * 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // 存储位置信息
      nodePositions[node.id] = { x, y };
      
      // 绘制节点
      ctx.beginPath();
      ctx.arc(x, y, node.value || 10, 0, Math.PI * 2);
      
      // 根据分类设置不同颜色
      const hue = hashStringToInt(node.category) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      ctx.fill();
      
      // 绘制边框
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 绘制标签
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label || node.id, x, y + 20);
    });
    
    // 绘制边
    data.edges.forEach(edge => {
      const source = nodePositions[edge.source];
      const target = nodePositions[edge.target];
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        
        // 根据类型设置不同颜色
        const type = edge.type || 'default';
        switch (type) {
          case 'similar':
            ctx.strokeStyle = '#52c41a';
            break;
          case 'prerequisite':
            ctx.strokeStyle = '#1890ff';
            break;
          case 'extension':
            ctx.strokeStyle = '#722ed1';
            break;
          case 'contradiction':
            ctx.strokeStyle = '#f5222d';
            break;
          case 'parent_child':
            ctx.strokeStyle = '#fa8c16';
            break;
          default:
            ctx.strokeStyle = '#d9d9d9';
        }
        
        ctx.lineWidth = edge.value || 1;
        ctx.stroke();
        
        // 绘制箭头
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowLength = 10;
        
        ctx.beginPath();
        ctx.moveTo(
          target.x - Math.cos(angle) * 15,
          target.y - Math.sin(angle) * 15
        );
        ctx.lineTo(
          target.x - Math.cos(angle) * 15 - Math.cos(angle - Math.PI / 6) * arrowLength,
          target.y - Math.sin(angle) * 15 - Math.sin(angle - Math.PI / 6) * arrowLength
        );
        ctx.lineTo(
          target.x - Math.cos(angle) * 15 - Math.cos(angle + Math.PI / 6) * arrowLength,
          target.y - Math.sin(angle) * 15 - Math.sin(angle + Math.PI / 6) * arrowLength
        );
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
      }
    });
  }, [width, height, data]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      style={{ border: '1px solid #f0f0f0', borderRadius: '4px' }}
    />
  );
};

// 字符串哈希函数
const hashStringToInt = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// 导出组件属性
interface KnowledgeGraphProps {
  knowledgePoints?: KnowledgePoint[];
  relations?: KnowledgeRelation[];
  loading?: boolean;
  onRefresh?: () => void;
}

// 知识图谱组件
const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  knowledgePoints = [],
  relations = [],
  loading = false,
  onRefresh
}) => {
  const { state } = useAppContext();
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [visibleTypes, setVisibleTypes] = useState<RelationType[]>(Object.values(RelationType));
  const [filteredData, setFilteredData] = useState({ nodes: [], edges: [] });
  const [gaps, setGaps] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // 当知识点或关系变化时重新生成图谱
  useEffect(() => {
    if (knowledgePoints.length) {
      const graph = generateKnowledgeGraph(knowledgePoints, relations);
      setGraphData(graph);
      
      // 检测知识缺口
      const knowledgeGaps = detectKnowledgeGaps(knowledgePoints, relations);
      setGaps(knowledgeGaps);
    } else {
      setGraphData({ nodes: [], edges: [] });
      setGaps([]);
    }
  }, [knowledgePoints, relations]);
  
  // 根据选择的关系类型筛选图谱数据
  useEffect(() => {
    // 筛选边
    const filteredEdges = graphData.edges.filter(edge => 
      visibleTypes.includes(edge.type as RelationType)
    );
    
    // 获取有关联的节点ID
    const connectedNodeIds = new Set<string>();
    filteredEdges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    // 只显示有关联的节点
    const filteredNodes = graphData.nodes.filter(node => 
      connectedNodeIds.has(node.id)
    );
    
    setFilteredData({
      nodes: filteredNodes,
      edges: filteredEdges
    });
  }, [graphData, visibleTypes]);
  
  // 测量容器尺寸
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
        }
      });
      
      resizeObserver.observe(containerRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);
  
  // 处理关系类型变化
  const handleTypeChange = (types: RelationType[]) => {
    setVisibleTypes(types);
  };
  
  // 保存图谱为图片
  const handleSaveGraph = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      try {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `知识图谱_${new Date().toISOString().split('T')[0]}.png`;
        a.click();
        message.success('图谱已保存为图片');
      } catch (error) {
        console.error('保存图谱失败:', error);
        message.error('保存图谱失败');
      }
    }
  };
  
  return (
    <Card 
      title="知识图谱分析"
      extra={
        <Space>
          <Select
            mode="multiple"
            placeholder="选择关系类型"
            style={{ width: 300 }}
            value={visibleTypes}
            onChange={handleTypeChange}
            options={Object.values(RelationType).map(type => ({
              label: getRelationTypeName(type),
              value: type
            }))}
            maxTagCount={3}
          />
          <Tooltip title="刷新">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={onRefresh}
              disabled={loading}
            />
          </Tooltip>
          <Tooltip title="保存图谱">
            <Button 
              icon={<SaveOutlined />} 
              onClick={handleSaveGraph}
              disabled={loading || filteredData.nodes.length === 0}
            />
          </Tooltip>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <div ref={containerRef} style={{ width: '100%', height: 600, position: 'relative' }}>
          {filteredData.nodes.length > 0 ? (
            <SimpleGraph 
              width={dimensions.width || 800} 
              height={dimensions.height || 600} 
              data={filteredData} 
            />
          ) : (
            <Empty 
              description="暂无知识图谱数据，请添加更多知识点和关联" 
              style={{ marginTop: 100 }}
            />
          )}
        </div>
        
        {gaps.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4>知识缺口识别</h4>
            <ul>
              {gaps.map((gap, index) => (
                <li key={index}>{gap}</li>
              ))}
            </ul>
          </div>
        )}
      </Spin>
    </Card>
  );
};

export default KnowledgeGraph; 