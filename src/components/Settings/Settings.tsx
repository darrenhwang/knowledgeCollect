import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Slider,
  Divider,
  Tabs,
  Space,
  InputNumber,
  message,
  Radio,
  Row,
  Col,
  Upload
} from 'antd';
import {
  SaveOutlined,
  UploadOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;

// 默认设置
const defaultSettings = {
  general: {
    storagePath: 'E:/知识收集与教育/数据',
    language: 'zh_CN',
    theme: 'light',
    autoUpdate: true,
    startWithSystem: false
  },
  processing: {
    extractKnowledgeAuto: true,
    extractionAlgorithm: 'default',
    pdfExtractImages: true,
    videoQuality: 'medium',
    videoConvertFormat: 'mp3',
    maxParallelProcessing: 2
  },
  openai: {
    apiKey: '',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    useProxy: false,
    proxyUrl: ''
  },
  advanced: {
    debugMode: false,
    logLevel: 'info',
    clearCacheInterval: 7,
    maxCacheSize: 1024
  }
};

const Settings: React.FC = () => {
  // 状态
  const [generalForm] = Form.useForm();
  const [processingForm] = Form.useForm();
  const [openaiForm] = Form.useForm();
  const [advancedForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('general');
  
  // 保存表单
  const saveForm = async (formType: string) => {
    try {
      let values;
      
      switch (formType) {
        case 'general':
          values = await generalForm.validateFields();
          break;
        case 'processing':
          values = await processingForm.validateFields();
          break;
        case 'openai':
          values = await openaiForm.validateFields();
          break;
        case 'advanced':
          values = await advancedForm.validateFields();
          break;
        default:
          return;
      }
      
      // 实际应用中应该将设置保存到Electron Store
      console.log(`保存${formType}设置:`, values);
      message.success('设置已保存');
      
    } catch (error) {
      console.error('表单验证失败:', error);
      message.error('保存设置失败，请检查表单内容');
    }
  };
  
  // 重置表单
  const resetForm = (formType: string) => {
    switch (formType) {
      case 'general':
        generalForm.setFieldsValue(defaultSettings.general);
        break;
      case 'processing':
        processingForm.setFieldsValue(defaultSettings.processing);
        break;
      case 'openai':
        openaiForm.setFieldsValue(defaultSettings.openai);
        break;
      case 'advanced':
        advancedForm.setFieldsValue(defaultSettings.advanced);
        break;
    }
    
    message.info('已重置为默认设置');
  };
  
  // 选择文件夹
  const selectFolder = async () => {
    try {
      // 模拟文件夹选择对话框
      const testFolders = [
        'D:/知识收集与教育/数据',
        'E:/知识收集与教育/数据',
        'C:/Users/Documents/知识收集与教育'
      ];
      
      const selectedPath = testFolders[Math.floor(Math.random() * testFolders.length)];
      
      // 更新表单值
      generalForm.setFieldsValue({ storagePath: selectedPath });
      message.success(`已选择文件夹: ${selectedPath}`);
    } catch (error) {
      console.error('选择文件夹失败:', error);
      message.error('选择文件夹失败');
    }
  };
  
  return (
    <div>
      <Card bordered={false}>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition="left"
          style={{ minHeight: 500 }}
        >
          {/* 常规设置 */}
          <TabPane tab="常规设置" key="general">
            <Form
              form={generalForm}
              layout="vertical"
              initialValues={defaultSettings.general}
            >
              <Form.Item 
                label="数据存储路径" 
                name="storagePath"
                rules={[{ required: true, message: '请输入数据存储路径' }]}
              >
                <Input 
                  placeholder="请选择数据存储路径"
                  addonAfter={<FolderOpenOutlined onClick={selectFolder} />}
                />
              </Form.Item>
              
              <Form.Item label="界面语言" name="language">
                <Select>
                  <Option value="zh_CN">简体中文</Option>
                  <Option value="en_US">English</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="界面主题" name="theme">
                <Radio.Group>
                  <Radio value="light">浅色</Radio>
                  <Radio value="dark">深色</Radio>
                  <Radio value="system">跟随系统</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item 
                label="自动检查更新" 
                name="autoUpdate" 
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item 
                label="开机自启动" 
                name="startWithSystem" 
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={() => saveForm('general')}
                  >
                    保存设置
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={() => resetForm('general')}
                  >
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          
          {/* 处理设置 */}
          <TabPane tab="处理设置" key="processing">
            <Form
              form={processingForm}
              layout="vertical"
              initialValues={defaultSettings.processing}
            >
              <Form.Item 
                label="自动提取知识点" 
                name="extractKnowledgeAuto" 
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item label="提取算法" name="extractionAlgorithm">
                <Select>
                  <Option value="default">默认算法</Option>
                  <Option value="advanced">高级算法 (消耗更多资源)</Option>
                  <Option value="fast">快速算法 (精度较低)</Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                label="PDF文件提取图片" 
                name="pdfExtractImages" 
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item label="视频处理质量" name="videoQuality">
                <Select>
                  <Option value="low">低质量 (处理速度快)</Option>
                  <Option value="medium">中等质量</Option>
                  <Option value="high">高质量 (处理速度慢)</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="视频转换格式" name="videoConvertFormat">
                <Select>
                  <Option value="mp3">MP3</Option>
                  <Option value="wav">WAV</Option>
                  <Option value="ogg">OGG</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="最大并行处理数" name="maxParallelProcessing">
                <InputNumber min={1} max={8} />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={() => saveForm('processing')}
                  >
                    保存设置
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={() => resetForm('processing')}
                  >
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          
          {/* OpenAI设置 */}
          <TabPane tab="OpenAI设置" key="openai">
            <Form
              form={openaiForm}
              layout="vertical"
              initialValues={defaultSettings.openai}
            >
              <Form.Item 
                label="API Key" 
                name="apiKey"
                rules={[{ required: true, message: '请输入OpenAI API Key' }]}
              >
                <Input.Password placeholder="请输入OpenAI API Key" />
              </Form.Item>
              
              <Form.Item label="模型" name="model">
                <Select>
                  <Option value="gpt-3.5-turbo">GPT-3.5-Turbo</Option>
                  <Option value="gpt-4">GPT-4 (如可用)</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Temperature" name="temperature">
                <Slider 
                  min={0} 
                  max={1.0} 
                  step={0.1} 
                  marks={{
                    0: '精确',
                    0.5: '平衡',
                    1: '创意'
                  }} 
                />
              </Form.Item>
              
              <Form.Item label="最大Token数" name="maxTokens">
                <Slider 
                  min={100} 
                  max={4000} 
                  step={100} 
                  marks={{
                    100: '100',
                    2000: '2000',
                    4000: '4000'
                  }} 
                />
              </Form.Item>
              
              <Form.Item 
                label="使用代理" 
                name="useProxy" 
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item 
                label="代理URL" 
                name="proxyUrl"
                dependencies={['useProxy']}
              >
                <Input 
                  placeholder="http://127.0.0.1:7890" 
                  disabled={!openaiForm.getFieldValue('useProxy')} 
                />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={() => saveForm('openai')}
                  >
                    保存设置
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={() => resetForm('openai')}
                  >
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          
          {/* 高级设置 */}
          <TabPane tab="高级设置" key="advanced">
            <Form
              form={advancedForm}
              layout="vertical"
              initialValues={defaultSettings.advanced}
            >
              <Form.Item 
                label="调试模式" 
                name="debugMode" 
                valuePropName="checked"
                extra="开启后会记录更详细的日志信息"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item label="日志级别" name="logLevel">
                <Select>
                  <Option value="error">错误</Option>
                  <Option value="warn">警告</Option>
                  <Option value="info">信息</Option>
                  <Option value="debug">调试</Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                label="缓存清理间隔 (天)" 
                name="clearCacheInterval"
              >
                <InputNumber min={1} max={30} />
              </Form.Item>
              
              <Form.Item 
                label="最大缓存大小 (MB)" 
                name="maxCacheSize"
              >
                <InputNumber min={100} max={10240} step={100} />
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={() => saveForm('advanced')}
                  >
                    保存设置
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={() => resetForm('advanced')}
                  >
                    重置
                  </Button>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => message.info('未实现功能：清除所有数据')}
                  >
                    清除所有数据
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          
          {/* 关于 */}
          <TabPane tab="关于" key="about">
            <div style={{ padding: '20px 0' }}>
              <h2>知识收集与教育应用</h2>
              <p>版本: 0.1.0</p>
              <p>功能: 提取本地PPT、PDF和视频文件的核心内容，建立知识库并生成教育题目</p>
              <p>技术栈: Electron + React + TypeScript</p>
              
              <Divider />
              
              <h3>开源许可</h3>
              <p>本应用使用了以下开源项目:</p>
              <ul>
                <li>Electron</li>
                <li>React</li>
                <li>Ant Design</li>
                <li>FFmpeg</li>
                <li>pdf.js</li>
                <li>OpenAI API</li>
              </ul>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings; 