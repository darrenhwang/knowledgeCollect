import React from 'react';
import { Layout, Typography, Card, Tabs } from 'antd';
import { BookOutlined, AppstoreOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import Dashboard from './components/Dashboard/Dashboard';
import FileManager from './components/FileManager/FileManager';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', paddingInline: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BookOutlined style={{ fontSize: '24px', marginRight: 16 }} />
          <Title level={3} style={{ margin: 0 }}>知识收集和教育辅助系统</Title>
        </div>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Card>
          <Tabs defaultActiveKey="1">
            <TabPane 
              tab={<span><AppstoreOutlined />仪表盘</span>} 
              key="1"
            >
              <Dashboard />
            </TabPane>
            <TabPane 
              tab={<span><FileTextOutlined />文件管理</span>} 
              key="2"
            >
              <FileManager />
            </TabPane>
            <TabPane 
              tab={<span><BookOutlined />知识库</span>} 
              key="3"
            >
              <div style={{ padding: 20 }}>
                <Text>知识库功能展示</Text>
              </div>
            </TabPane>
            <TabPane 
              tab={<span><SettingOutlined />设置</span>} 
              key="4"
            >
              <div style={{ padding: 20 }}>
                <Text>设置功能展示</Text>
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </Content>
      <Footer style={{ textAlign: 'center' }}>知识收集和教育辅助系统 ©2023</Footer>
    </Layout>
  );
};

export default App; 