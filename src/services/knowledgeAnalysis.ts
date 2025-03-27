import { notification } from 'antd';
import { KnowledgePoint } from './extraction';
import { getKnowledgePoints, updateKnowledgePoint } from './storage';

// 关联类型定义
export enum RelationType {
  SIMILAR = 'similar',       // 相似内容
  PREREQUISITE = 'prerequisite', // 前置知识
  EXTENSION = 'extension',    // 知识延伸
  CONTRADICTION = 'contradiction', // 知识矛盾
  PARENT_CHILD = 'parent_child',  // 父子关系
}

// 知识点关联接口
export interface KnowledgeRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  strength: number; // 关联强度: 0.0-1.0
  createdAt: number;
  description?: string;
}

// 知识图谱节点
export interface KnowledgeGraphNode {
  id: string;
  label: string;
  category: string;
  value: number; // 节点大小/重要性
  tags: string[];
}

// 知识图谱边
export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  value: number; // 边的粗细/关联强度
  label: string;
  type: RelationType;
}

// 知识图谱
export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

// 获取关联类型的名称
export const getRelationTypeName = (type: RelationType): string => {
  switch (type) {
    case RelationType.SIMILAR:
      return '相似内容';
    case RelationType.PREREQUISITE:
      return '前置知识';
    case RelationType.EXTENSION:
      return '知识延伸';
    case RelationType.CONTRADICTION:
      return '知识矛盾';
    case RelationType.PARENT_CHILD:
      return '父子关系';
    default:
      return '未知关系';
  }
};

// 创建知识点关联
export const createKnowledgeRelation = (
  sourceId: string,
  targetId: string,
  type: RelationType,
  strength: number,
  description?: string
): KnowledgeRelation | null => {
  try {
    // 获取所有知识点
    const knowledgePoints = getKnowledgePoints();
    
    // 验证源知识点和目标知识点是否存在
    const sourcePoint = knowledgePoints.find(point => point.id === sourceId);
    const targetPoint = knowledgePoints.find(point => point.id === targetId);
    
    if (!sourcePoint || !targetPoint) {
      notification.error({
        message: '创建关联失败',
        description: '源知识点或目标知识点不存在',
      });
      return null;
    }
    
    // 验证不是自关联
    if (sourceId === targetId) {
      notification.error({
        message: '创建关联失败',
        description: '不能创建自关联',
      });
      return null;
    }
    
    // 创建关联对象
    const relation: KnowledgeRelation = {
      id: `relation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceId,
      targetId,
      type,
      strength: Math.min(1, Math.max(0, strength)), // 确保强度在0-1之间
      createdAt: Date.now(),
      description,
    };
    
    // 将关联信息添加到源知识点和目标知识点（这里需要扩展KnowledgePoint接口）
    // 由于KnowledgePoint接口没有直接存储关联的字段，我们暂时不修改知识点对象
    // 可以考虑在后续更新中扩展KnowledgePoint接口
    
    notification.success({
      message: '创建关联成功',
      description: `已创建"${getRelationTypeName(type)}"关联`,
    });
    
    return relation;
  } catch (error) {
    console.error('创建知识点关联失败:', error);
    notification.error({
      message: '创建关联失败',
      description: '创建知识点关联时发生错误',
    });
    return null;
  }
};

// 自动分析知识点关系并生成关联
export const analyzeKnowledgeRelations = (points: KnowledgePoint[]): KnowledgeRelation[] => {
  const relations: KnowledgeRelation[] = [];
  
  // 不同类别之间的关联分析
  const categories = Array.from(new Set(points.map(point => point.category)));
  
  // 同一类别内的知识点可能有相似性
  categories.forEach(category => {
    const categoryPoints = points.filter(point => point.category === category);
    
    // 对每对知识点计算相似度
    for (let i = 0; i < categoryPoints.length; i++) {
      for (let j = i + 1; j < categoryPoints.length; j++) {
        const pointA = categoryPoints[i];
        const pointB = categoryPoints[j];
        
        // 计算内容相似度（简化实现，实际可以用更复杂的算法）
        const similarityScore = calculateContentSimilarity(pointA.content, pointB.content);
        
        // 如果相似度高于阈值，创建相似关联
        if (similarityScore > 0.5) {
          relations.push({
            id: `relation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sourceId: pointA.id,
            targetId: pointB.id,
            type: RelationType.SIMILAR,
            strength: similarityScore,
            createdAt: Date.now(),
            description: '系统自动检测的相似内容',
          });
        }
      }
    }
  });
  
  // 分析标签重叠，可能存在关联
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const pointA = points[i];
      const pointB = points[j];
      
      // 计算标签重叠度
      const commonTags = pointA.tags.filter(tag => pointB.tags.includes(tag));
      const tagOverlapScore = commonTags.length / Math.max(1, Math.min(pointA.tags.length, pointB.tags.length));
      
      // 如果标签重叠度高，创建关联
      if (commonTags.length >= 2 && tagOverlapScore > 0.4) {
        // 根据标签内容确定关系类型
        let relationType = RelationType.SIMILAR;
        
        // 这里简化处理，实际中可以基于标签含义进行更复杂的分析
        if (commonTags.some(tag => tag.includes('基础') || tag.includes('入门'))) {
          relationType = RelationType.PREREQUISITE;
        } else if (commonTags.some(tag => tag.includes('进阶') || tag.includes('延伸'))) {
          relationType = RelationType.EXTENSION;
        }
        
        relations.push({
          id: `relation-${Date.now()}-${i}-${j}`,
          sourceId: pointA.id,
          targetId: pointB.id,
          type: relationType,
          strength: tagOverlapScore,
          createdAt: Date.now(),
          description: `基于共同标签: ${commonTags.join(', ')}`,
        });
      }
    }
  }
  
  // 基于内容的关键词提取和分析
  // 这里是简化实现，实际应用中可以使用NLP技术进行更深入的分析
  
  return relations;
};

// 简单的内容相似性计算（基于相同词的比例）
const calculateContentSimilarity = (contentA: string, contentB: string): number => {
  // 将内容分词（简化处理，实际中应使用专业分词工具）
  const wordsA = contentA.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const wordsB = contentB.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  // 计算共同词数量
  const wordSetA = new Set(wordsA);
  const wordSetB = new Set(wordsB);
  
  let commonWords = 0;
  wordSetB.forEach(word => {
    if (wordSetA.has(word)) {
      commonWords++;
    }
  });
  
  // 计算相似度得分
  return commonWords / Math.max(1, Math.min(wordSetA.size, wordSetB.size));
};

// 生成知识图谱
export const generateKnowledgeGraph = (
  knowledgePoints: KnowledgePoint[],
  relations: KnowledgeRelation[]
): KnowledgeGraph => {
  // 创建图谱节点
  const nodes: KnowledgeGraphNode[] = knowledgePoints.map(point => ({
    id: point.id,
    label: point.content.substring(0, 20) + (point.content.length > 20 ? '...' : ''),
    category: point.category,
    value: point.confidence * 10, // 将置信度映射为节点大小
    tags: point.tags,
  }));
  
  // 创建图谱边
  const edges: KnowledgeGraphEdge[] = relations.map(relation => ({
    source: relation.sourceId,
    target: relation.targetId,
    value: relation.strength * 3, // 将关联强度映射为边的粗细
    label: getRelationTypeName(relation.type),
    type: relation.type,
  }));
  
  return { nodes, edges };
};

// 基于知识点内容和标签推荐相关知识点
export const recommendRelatedKnowledgePoints = (
  currentPointId: string,
  limit: number = 5
): KnowledgePoint[] => {
  const allPoints = getKnowledgePoints();
  const currentPoint = allPoints.find(point => point.id === currentPointId);
  
  if (!currentPoint) {
    return [];
  }
  
  // 计算每个知识点与当前知识点的相关度
  const scoredPoints = allPoints
    .filter(point => point.id !== currentPointId) // 排除当前知识点
    .map(point => {
      // 计算内容相似度
      const contentSimilarity = calculateContentSimilarity(currentPoint.content, point.content);
      
      // 计算标签重叠度
      const commonTags = currentPoint.tags.filter(tag => point.tags.includes(tag));
      const tagOverlap = commonTags.length / Math.max(1, Math.min(currentPoint.tags.length, point.tags.length));
      
      // 同类别加分
      const categoryBonus = currentPoint.category === point.category ? 0.2 : 0;
      
      // 计算总分（可根据需求调整各部分权重）
      const totalScore = contentSimilarity * 0.6 + tagOverlap * 0.3 + categoryBonus;
      
      return {
        point,
        score: totalScore,
      };
    });
  
  // 按相关度排序并返回前limit个
  return scoredPoints
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.point);
};

// 查找知识图中的关键节点（具有最多连接的节点）
export const findKeyKnowledgePoints = (
  relations: KnowledgeRelation[],
  limit: number = 5
): string[] => {
  // 统计每个知识点的关联数量
  const connectionCounts: Record<string, number> = {};
  
  relations.forEach(relation => {
    if (!connectionCounts[relation.sourceId]) {
      connectionCounts[relation.sourceId] = 0;
    }
    if (!connectionCounts[relation.targetId]) {
      connectionCounts[relation.targetId] = 0;
    }
    
    connectionCounts[relation.sourceId]++;
    connectionCounts[relation.targetId]++;
  });
  
  // 按关联数量排序
  return Object.entries(connectionCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, limit)
    .map(([id]) => id);
};

// 检测知识体系中的知识缺口
export const detectKnowledgeGaps = (
  knowledgePoints: KnowledgePoint[],
  relations: KnowledgeRelation[]
): string[] => {
  const gaps: string[] = [];
  
  // 按类别分组
  const categorizedPoints = knowledgePoints.reduce((groups, point) => {
    if (!groups[point.category]) {
      groups[point.category] = [];
    }
    groups[point.category].push(point);
    return groups;
  }, {} as Record<string, KnowledgePoint[]>);
  
  // 检查每个类别中的知识点密度
  Object.entries(categorizedPoints).forEach(([category, points]) => {
    // 如果一个类别只有少量知识点，可能存在知识缺口
    if (points.length < 3) {
      gaps.push(`类别"${category}"的知识点较少，考虑添加更多相关知识点`);
      return;
    }
    
    // 检查类别内部的知识点之间的连接性
    const categoryRelations = relations.filter(relation => 
      points.some(p => p.id === relation.sourceId) && 
      points.some(p => p.id === relation.targetId)
    );
    
    if (categoryRelations.length < points.length - 1) {
      gaps.push(`类别"${category}"的知识点之间关联不足，考虑建立更多知识关联`);
    }
  });
  
  // 检查是否有孤立的知识点（没有任何关联）
  const connectedPointIds = new Set<string>();
  relations.forEach(relation => {
    connectedPointIds.add(relation.sourceId);
    connectedPointIds.add(relation.targetId);
  });
  
  const isolatedPoints = knowledgePoints.filter(point => !connectedPointIds.has(point.id));
  if (isolatedPoints.length > 0) {
    gaps.push(`有${isolatedPoints.length}个孤立知识点，考虑将它们与其他知识点建立关联`);
  }
  
  return gaps;
};

// 生成学习路径
export const generateLearningPath = (
  knowledgePoints: KnowledgePoint[],
  relations: KnowledgeRelation[],
  targetPointIds: string[]
): KnowledgePoint[] => {
  // 创建知识点ID到知识点的映射
  const pointsMap = knowledgePoints.reduce((map, point) => {
    map[point.id] = point;
    return map;
  }, {} as Record<string, KnowledgePoint>);
  
  // 创建知识依赖图（邻接表表示）
  const dependencyGraph: Record<string, string[]> = {};
  knowledgePoints.forEach(point => {
    dependencyGraph[point.id] = [];
  });
  
  // 填充依赖关系（只考虑前置关系）
  relations.forEach(relation => {
    if (relation.type === RelationType.PREREQUISITE) {
      // 如果A是B的前置知识，则B依赖于A
      dependencyGraph[relation.targetId].push(relation.sourceId);
    } else if (relation.type === RelationType.PARENT_CHILD) {
      // 如果A是B的父节点，则B依赖于A
      dependencyGraph[relation.targetId].push(relation.sourceId);
    }
  });
  
  // 从目标知识点出发，通过反向DFS收集所有依赖
  const visited = new Set<string>();
  const path: KnowledgePoint[] = [];
  
  const dfs = (pointId: string) => {
    if (visited.has(pointId)) return;
    visited.add(pointId);
    
    // 递归访问所有依赖
    for (const dependencyId of dependencyGraph[pointId] || []) {
      dfs(dependencyId);
    }
    
    // 添加到路径
    if (pointsMap[pointId]) {
      path.push(pointsMap[pointId]);
    }
  };
  
  // 对每个目标知识点执行DFS
  targetPointIds.forEach(pointId => {
    if (pointsMap[pointId]) {
      dfs(pointId);
    }
  });
  
  // 最后添加目标知识点（如果它们不是其他目标的依赖）
  targetPointIds.forEach(pointId => {
    if (pointsMap[pointId] && !path.find(p => p.id === pointId)) {
      path.push(pointsMap[pointId]);
    }
  });
  
  return path;
}; 