import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DesktopOutlined,
  FileOutlined,
  BookOutlined,
  FormOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <DesktopOutlined />,
      label: '仪表盘'
    },
    {
      key: '/files',
      icon: <FileOutlined />,
      label: '文件管理'
    },
    {
      key: '/knowledge',
      icon: <BookOutlined />,
      label: '知识库'
    },
    {
      key: '/questions',
      icon: <FormOutlined />,
      label: '题目生成'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置'
    }
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  // 确定当前选中的菜单项
  const selectedKey = menuItems.find(item => 
    location.pathname === item.key || 
    (item.key !== '/' && location.pathname.startsWith(item.key))
  )?.key || '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          backgroundColor: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`
        }}
      >
        <div style={{ 
          height: 64, 
          margin: 16, 
          textAlign: 'center',
          color: token.colorPrimary,
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {collapsed ? '知识' : '知识收集与教育'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>
      {children}
    </Layout>
  );
};

export default MainLayout; 