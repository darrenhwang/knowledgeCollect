import { notification } from 'antd';
import { getSettings, saveSettings } from './storage';

// 主题类型定义
export type ThemeType = 'light' | 'dark';

// 色彩变量定义
export interface ThemeColors {
  // 基础色彩
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  
  // 功能色彩
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // 组件色彩
  cardBackground: string;
  sidebarBackground: string;
  headerBackground: string;
  
  // 其他色彩
  shadow: string;
  overlay: string;
  divider: string;
}

// 亮色主题颜色
export const lightThemeColors: ThemeColors = {
  // 基础色彩
  primary: '#1890ff',
  secondary: '#722ed1',
  background: '#f0f2f5',
  surface: '#ffffff',
  text: 'rgba(0, 0, 0, 0.85)',
  textSecondary: 'rgba(0, 0, 0, 0.45)',
  border: '#d9d9d9',
  
  // 功能色彩
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#1890ff',
  
  // 组件色彩
  cardBackground: '#ffffff',
  sidebarBackground: '#ffffff',
  headerBackground: '#ffffff',
  
  // 其他色彩
  shadow: 'rgba(0, 0, 0, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.45)',
  divider: '#f0f0f0',
};

// 暗色主题颜色
export const darkThemeColors: ThemeColors = {
  // 基础色彩
  primary: '#177ddc',
  secondary: '#9254de',
  background: '#141414',
  surface: '#1f1f1f',
  text: 'rgba(255, 255, 255, 0.85)',
  textSecondary: 'rgba(255, 255, 255, 0.45)',
  border: '#303030',
  
  // 功能色彩
  success: '#49aa19',
  warning: '#d89614',
  error: '#a61d24',
  info: '#177ddc',
  
  // 组件色彩
  cardBackground: '#1f1f1f',
  sidebarBackground: '#1f1f1f',
  headerBackground: '#1f1f1f',
  
  // 其他色彩
  shadow: 'rgba(0, 0, 0, 0.45)',
  overlay: 'rgba(0, 0, 0, 0.65)',
  divider: '#303030',
};

// 获取当前主题类型
export const getCurrentTheme = (): ThemeType => {
  const settings = getSettings();
  return settings.theme;
};

// 获取当前主题颜色
export const getCurrentThemeColors = (): ThemeColors => {
  const themeType = getCurrentTheme();
  return themeType === 'light' ? lightThemeColors : darkThemeColors;
};

// 设置主题
export const setTheme = (theme: ThemeType): void => {
  const settings = getSettings();
  
  if (settings.theme === theme) {
    return; // 主题没有变化，不需要切换
  }
  
  // 更新 localStorage 中的设置
  settings.theme = theme;
  saveSettings(settings);
  
  // 更新 body 类名
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  
  // 应用 CSS 变量到 root 元素
  applyThemeColors(theme === 'light' ? lightThemeColors : darkThemeColors);
  
  notification.success({
    message: '主题已切换',
    description: `已切换到${theme === 'light' ? '浅色' : '深色'}主题`,
  });
};

// 应用主题颜色
export const applyThemeColors = (colors: ThemeColors): void => {
  const root = document.documentElement;
  
  // 设置 CSS 变量
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
};

// 初始化主题
export const initializeTheme = (): void => {
  const theme = getCurrentTheme();
  
  // 更新 body 类名
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  
  // 应用 CSS 变量
  applyThemeColors(theme === 'light' ? lightThemeColors : darkThemeColors);
};

// 切换主题
export const toggleTheme = (): void => {
  const currentTheme = getCurrentTheme();
  const newTheme: ThemeType = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
};

// 检测系统偏好主题
export const detectSystemTheme = (): ThemeType => {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDarkScheme ? 'dark' : 'light';
};

// 自动根据系统主题设置
export const setSystemTheme = (): void => {
  const systemTheme = detectSystemTheme();
  setTheme(systemTheme);
  
  // 添加监听器以响应系统主题的变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const newTheme: ThemeType = e.matches ? 'dark' : 'light';
    setTheme(newTheme);
  });
}; 