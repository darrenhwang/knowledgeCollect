import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import FileManager from './components/FileManager/FileManager';
import KnowledgeBase from './components/KnowledgeBase/KnowledgeBase';
import QuestionGenerator from './components/QuestionGenerator/QuestionGenerator';
import Settings from './components/Settings/Settings';
import './App.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fileId, setFileId] = useState<string | undefined>(undefined);

  // 监听自定义事件，用于组件间通信
  useEffect(() => {
    const handleSwitchTab = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { tab, fileId } = customEvent.detail;
      
      if (tab) {
        setActiveTab(tab);
      }
      
      if (fileId !== undefined) {
        setFileId(fileId);
      }
    };
    
    window.addEventListener('switchTab', handleSwitchTab);
    
    return () => {
      window.removeEventListener('switchTab', handleSwitchTab);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'dashboard',
              label: '仪表盘',
              children: <Dashboard />
            },
            {
              key: 'files',
              label: '文件管理',
              children: <FileManager highlightFileId={activeTab === 'files' ? fileId : undefined} />
            },
            {
              key: 'knowledge',
              label: '知识库',
              children: <KnowledgeBase />
            },
            {
              key: 'questions',
              label: '问题生成',
              children: <QuestionGenerator fileId={activeTab === 'questions' ? fileId : undefined} />
            },
            {
              key: 'settings',
              label: '设置',
              children: <Settings />
            }
          ]}
        />
      </div>
    </Router>
  );
};

export default App; 