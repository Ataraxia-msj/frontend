import React from 'react';
import { createRoot } from 'react-dom/client';  // ← 改这里
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);             // ← 创建根
root.render(<App />);                            // ← 渲染组件
