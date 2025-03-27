import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Slider,
  Divider,
  List,
  Radio,
  Checkbox,
  Typography,
  Space,
  message,
  Tag,
  Row,
  Col,
  Modal
} from 'antd';
import {
  FileTextOutlined,
  SaveOutlined,
  PrinterOutlined,
  ExportOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// 题目类型
type QuestionType = 'single' | 'multiple' | 'completion' | 'judgment' | 'short';

// 题目难度
type DifficultyLevel = 'easy' | 'medium' | 'hard';

// 题目定义
interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  answer: string | string[];
  analysis?: string;
  difficulty: DifficultyLevel;
  category: string;
  relatedKnowledge: string[];
}

// 试卷定义
interface Paper {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: string;
}

// 题型显示名称映射
const questionTypeMap = {
  'single': '单选题',
  'multiple': '多选题',
  'completion': '填空题',
  'judgment': '判断题',
  'short': '简答题'
};

// 难度显示名称映射
const difficultyMap = {
  'easy': '简单',
  'medium': '中等',
  'hard': '困难'
};

// 难度颜色映射
const difficultyColorMap = {
  'easy': 'success',
  'medium': 'warning',
  'hard': 'error'
};

// 学科分类数据
const categories = [
  { value: 'chinese', label: '语文' },
  { value: 'math', label: '数学' },
  { value: 'english', label: '英语' },
  { value: 'science', label: '科学' },
  { value: 'other', label: '其他' }
];

// 模拟题目数据
const mockQuestions: Question[] = [
  {
    id: '1',
    type: 'single',
    content: '水的三态是指什么？',
    options: ['固态、液态、气态', '冰、水、水蒸气', '固态、流动态、飞散态', '结晶态、流动态、气化态'],
    answer: '0',
    analysis: '水的三态是指物质存在的三种状态：固态(冰)、液态(水)和气态(水蒸气)。',
    difficulty: 'easy',
    category: 'science',
    relatedKnowledge: ['水的三态变化']
  },
  {
    id: '2',
    type: 'multiple',
    content: '以下哪些是形容词？',
    options: ['beautiful', 'run', 'happy', 'book', 'smart'],
    answer: ['0', '2', '4'],
    analysis: 'beautiful(美丽的)、happy(快乐的)和smart(聪明的)是形容词，用来描述名词。run(跑)是动词，book(书)是名词。',
    difficulty: 'medium',
    category: 'english',
    relatedKnowledge: ['形容词的用法']
  },
  {
    id: '3',
    type: 'completion',
    content: '两个数相加，交换加数的位置，和不变。这一性质称为加法的____性质。',
    answer: '交换',
    analysis: '加法交换律：两个数相加，交换加数的位置，和不变。例如：a + b = b + a',
    difficulty: 'easy',
    category: 'math',
    relatedKnowledge: ['加法交换律']
  },
  {
    id: '4',
    type: 'judgment',
    content: '水蒸气冷却会直接变成冰。',
    answer: 'false',
    analysis: '水蒸气冷却通常会先变成液态水，然后液态水继续冷却才会变成冰。水蒸气直接变成冰的过程称为"升华"，需要特定条件。',
    difficulty: 'medium',
    category: 'science',
    relatedKnowledge: ['水的三态变化']
  },
  {
    id: '5',
    type: 'short',
    content: '简述加法交换律并举例说明。',
    answer: '加法交换律是指两个数相加，交换加数的位置，和不变。例如：3 + 5 = 5 + 3 = 8，或者用字母表示：a + b = b + a。',
    difficulty: 'hard',
    category: 'math',
    relatedKnowledge: ['加法交换律']
  }
];

// 模拟试卷数据
const mockPapers: Paper[] = [
  {
    id: '1',
    title: '小学数学基础测验',
    description: '针对一年级学生的基础数学能力测试',
    questions: [mockQuestions[2], mockQuestions[4]],
    createdAt: '2023-06-01T08:30:00Z'
  },
  {
    id: '2',
    title: '科学探索测验',
    description: '关于自然科学的基础知识测试',
    questions: [mockQuestions[0], mockQuestions[3]],
    createdAt: '2023-06-05T14:20:00Z'
  }
];

const QuestionGenerator: React.FC = () => {
  // 状态管理
  const [form] = Form.useForm();
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [papers, setPapers] = useState<Paper[]>(mockPapers);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentPaper, setCurrentPaper] = useState<Paper | null>(null);

  // 生成题目
  const handleGenerateQuestions = async (values: any) => {
    try {
      setLoading(true);
      
      // 模拟生成过程，实际应用中应调用后端API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 根据选择的知识点和类型进行筛选
      let filtered = [...mockQuestions];
      
      if (values.knowledgePoints && values.knowledgePoints.length > 0) {
        filtered = filtered.filter(q => 
          q.relatedKnowledge.some(k => values.knowledgePoints.includes(k))
        );
      }
      
      if (values.questionTypes && values.questionTypes.length > 0) {
        filtered = filtered.filter(q => values.questionTypes.includes(q.type));
      }
      
      if (values.difficulty) {
        filtered = filtered.filter(q => q.difficulty === values.difficulty);
      }
      
      if (values.category) {
        filtered = filtered.filter(q => q.category === values.category);
      }
      
      // 随机打乱顺序
      filtered.sort(() => Math.random() - 0.5);
      
      // 根据数量选择题目
      const count = values.questionCount || 5;
      const result = filtered.slice(0, count);
      
      if (result.length === 0) {
        message.warning('没有找到符合条件的题目');
      } else if (result.length < count) {
        message.info(`仅找到 ${result.length} 道符合条件的题目`);
      }
      
      setGeneratedQuestions(result);
      setSelectedQuestions(result.map(q => q.id));
      
    } catch (error) {
      message.error('生成题目失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 创建试卷
  const handleCreatePaper = () => {
    if (selectedQuestions.length === 0) {
      message.warning('请先选择题目');
      return;
    }
    
    Modal.confirm({
      title: '创建试卷',
      content: (
        <Form layout="vertical">
          <Form.Item label="试卷标题" name="title" rules={[{ required: true }]}>
            <Input placeholder="请输入试卷标题" />
          </Form.Item>
          <Form.Item label="试卷说明" name="description">
            <TextArea placeholder="请输入试卷说明（选填）" rows={3} />
          </Form.Item>
        </Form>
      ),
      onOk: (close) => {
        const formElem = document.querySelector('.ant-modal-content form') as HTMLFormElement;
        const formData = new FormData(formElem);
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        
        if (!title) {
          message.error('请输入试卷标题');
          return;
        }
        
        const selectedQs = generatedQuestions.filter(q => selectedQuestions.includes(q.id));
        
        const newPaper: Paper = {
          id: Date.now().toString(),
          title,
          description,
          questions: selectedQs,
          createdAt: new Date().toISOString()
        };
        
        setPapers(prev => [newPaper, ...prev]);
        message.success('试卷创建成功');
        close();
      }
    });
  };

  // 预览试卷
  const handlePreviewPaper = (paper: Paper) => {
    setCurrentPaper(paper);
    setPreviewVisible(true);
  };

  // 删除试卷
  const handleDeletePaper = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这份试卷吗？',
      onOk: () => {
        setPapers(prev => prev.filter(p => p.id !== id));
        message.success('试卷已删除');
      }
    });
  };

  // 渲染选项
  const renderOptions = (options: string[], type: QuestionType, answer: string | string[]) => {
    if (type === 'single') {
      return (
        <Radio.Group disabled value={answer}>
          {options.map((option, index) => (
            <div key={index} style={{ margin: '8px 0' }}>
              <Radio value={index.toString()}>
                {String.fromCharCode(65 + index)}. {option}
              </Radio>
            </div>
          ))}
        </Radio.Group>
      );
    } else if (type === 'multiple') {
      return (
        <Checkbox.Group disabled value={answer as string[]}>
          {options.map((option, index) => (
            <div key={index} style={{ margin: '8px 0' }}>
              <Checkbox value={index.toString()}>
                {String.fromCharCode(65 + index)}. {option}
              </Checkbox>
            </div>
          ))}
        </Checkbox.Group>
      );
    }
    return null;
  };

  // 渲染题目
  const renderQuestion = (question: Question, index: number) => {
    return (
      <div key={question.id} style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text strong>{index + 1}. [{questionTypeMap[question.type]}] </Text>
          {question.content}
          <Tag color={difficultyColorMap[question.difficulty]} style={{ marginLeft: 8 }}>
            {difficultyMap[question.difficulty]}
          </Tag>
        </Paragraph>
        
        {question.options && renderOptions(question.options, question.type, question.answer)}
        
        {question.type === 'completion' && (
          <Paragraph style={{ marginTop: 16 }}>
            <Text strong>答案: </Text>{question.answer}
          </Paragraph>
        )}
        
        {question.type === 'judgment' && (
          <Radio.Group disabled value={question.answer === 'true'}>
            <Radio value={true}>正确</Radio>
            <Radio value={false}>错误</Radio>
          </Radio.Group>
        )}
        
        {question.type === 'short' && (
          <div>
            <Paragraph style={{ marginTop: 16, background: '#f5f5f5', padding: 16 }}>
              <Text strong>参考答案: </Text>{question.answer}
            </Paragraph>
          </div>
        )}
        
        {question.analysis && (
          <Paragraph style={{ marginTop: 8, color: '#888' }}>
            <Text strong>解析: </Text>{question.analysis}
          </Paragraph>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
      {/* 左侧：生成控制面板 */}
      <Card 
        title="题目生成" 
        style={{ width: 350, marginRight: 16, height: '100%', overflow: 'auto' }} 
        bordered={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerateQuestions}
          initialValues={{
            questionCount: 5,
            questionTypes: ['single', 'multiple', 'completion', 'judgment'],
            difficulty: 'medium',
          }}
        >
          <Form.Item label="知识点" name="knowledgePoints">
            <Select
              mode="multiple"
              placeholder="请选择知识点"
              style={{ width: '100%' }}
              optionFilterProp="label"
            >
              <Option value="水的三态变化">水的三态变化</Option>
              <Option value="加法交换律">加法交换律</Option>
              <Option value="形容词的用法">形容词的用法</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="学科分类" name="category">
            <Select placeholder="请选择学科">
              {categories.map(cat => (
                <Option key={cat.value} value={cat.value}>{cat.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="题目类型" name="questionTypes">
            <Select
              mode="multiple"
              placeholder="请选择题目类型"
            >
              <Option value="single">单选题</Option>
              <Option value="multiple">多选题</Option>
              <Option value="completion">填空题</Option>
              <Option value="judgment">判断题</Option>
              <Option value="short">简答题</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="难度级别" name="difficulty">
            <Select placeholder="请选择难度级别">
              <Option value="easy">简单</Option>
              <Option value="medium">中等</Option>
              <Option value="hard">困难</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="题目数量" name="questionCount">
            <Slider min={1} max={20} marks={{ 1: '1', 5: '5', 10: '10', 20: '20' }} />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              生成题目
            </Button>
          </Form.Item>
        </Form>
        
        <Divider>已保存试卷</Divider>
        
        <List
          dataSource={papers}
          renderItem={paper => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  size="small"
                  icon={<FileTextOutlined />} 
                  onClick={() => handlePreviewPaper(paper)}
                >
                  预览
                </Button>,
                <Button 
                  type="link" 
                  danger 
                  size="small"
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDeletePaper(paper.id)}
                >
                  删除
                </Button>
              ]}
            >
              <List.Item.Meta
                title={paper.title}
                description={`题目数量: ${paper.questions.length} | 创建时间: ${new Date(paper.createdAt).toLocaleDateString()}`}
              />
            </List.Item>
          )}
        />
      </Card>
      
      {/* 右侧：题目列表 */}
      <Card
        title="题目列表"
        style={{ flex: 1, height: '100%', overflow: 'auto' }}
        bordered={false}
        extra={
          <Space>
            <Button 
              icon={<SaveOutlined />} 
              onClick={handleCreatePaper} 
              disabled={selectedQuestions.length === 0}
            >
              创建试卷
            </Button>
            <Button 
              icon={<PrinterOutlined />} 
              disabled={selectedQuestions.length === 0}
            >
              打印
            </Button>
            <Button 
              icon={<ExportOutlined />} 
              disabled={selectedQuestions.length === 0}
            >
              导出
            </Button>
          </Space>
        }
      >
        {generatedQuestions.length > 0 ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text>已选择 {selectedQuestions.length} 道题目</Text>
              <Checkbox 
                style={{ marginLeft: 16 }}
                checked={selectedQuestions.length === generatedQuestions.length}
                indeterminate={selectedQuestions.length > 0 && selectedQuestions.length < generatedQuestions.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedQuestions(generatedQuestions.map(q => q.id));
                  } else {
                    setSelectedQuestions([]);
                  }
                }}
              >
                全选
              </Checkbox>
            </div>
            
            {generatedQuestions.map((question, index) => (
              <Card 
                key={question.id}
                style={{ marginBottom: 16 }}
                hoverable
              >
                <Checkbox 
                  checked={selectedQuestions.includes(question.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedQuestions(prev => [...prev, question.id]);
                    } else {
                      setSelectedQuestions(prev => prev.filter(id => id !== question.id));
                    }
                  }}
                  style={{ position: 'absolute', right: 16, top: 16 }}
                />
                {renderQuestion(question, index)}
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <FileTextOutlined style={{ fontSize: 48, color: '#ccc' }} />
            <Paragraph style={{ marginTop: 16 }}>
              暂无题目，请点击左侧"生成题目"按钮
            </Paragraph>
          </div>
        )}
      </Card>
      
      {/* 试卷预览模态框 */}
      <Modal
        title={currentPaper?.title || '试卷预览'}
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button key="print" icon={<PrinterOutlined />}>
            打印
          </Button>,
          <Button key="export" icon={<ExportOutlined />}>
            导出
          </Button>
        ]}
      >
        {currentPaper && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={3}>{currentPaper.title}</Title>
              {currentPaper.description && (
                <Paragraph>{currentPaper.description}</Paragraph>
              )}
            </div>
            
            {currentPaper.questions.map((question, index) => (
              renderQuestion(question, index)
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuestionGenerator; 