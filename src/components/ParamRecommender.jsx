import React, { useState, useRef, useEffect } from 'react';
import { recommend } from '../api';

// 参数配置：名称 + 滑块范围（可根据实际业务调整）
const PARAM_CONFIG = [
  { name: 'X',          min: 250,   max: 400,  step: 1 },
  { name: 'Y',          min: 530,   max: 730,  step: 1 },
  { name: 'Base_W1',    min: 240,   max: 340,  step: 1 },
  { name: 'outerRadius',min: 50,   max: 60,  step: 1 },
  { name: 'innerRadius',min: 32,   max: 40,  step: 1 },
  // … 如有更多参数，继续添加
];

// 简单节流函数：保证 func 最多每 limit 毫秒执行一次
function throttle(func, limit) {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

export default function ParamRecommender() {
  // 本地滑块即时值
  const [inputValues, setInputValues] = useState(
    PARAM_CONFIG.reduce((acc, { name, min }) => {
      acc[name] = min;
      return acc;
    }, {})
  );
  // 后端返回的推荐值
  const [recs, setRecs] = useState({});
  // 加载状态：正在请求参数名称列表
  const [loadingFor, setLoadingFor] = useState(null);

  // 真正调用后端并更新推荐值
  const doRecommend = async (param, value) => {
    try {
      setLoadingFor(param);
      const data = await recommend(param, parseFloat(value));
      setRecs(data.recommendations);
    } catch (e) {
      console.error('recommend error:', e);
    } finally {
      setLoadingFor(null);
    }
  };

  // 用节流包裹，限制 200ms 一次
  const throttledRecommend = useRef(throttle(doRecommend, 200)).current;

  // 处理滑块变化：更新本地值，并立即（节流）调用推荐
  const handleSliderChange = (param, value) => {
    setInputValues(vals => ({ ...vals, [param]: value }));
    throttledRecommend(param, value);
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">参数推荐系统（滑块＋节流＋实时推荐）</h2>

      {PARAM_CONFIG.map(({ name, min, max, step }) => (
        <div key={name} className="flex items-center space-x-4">
          <label htmlFor={name} className="w-24">{name}</label>

          <input
            id={name}
            type="range"
            min={min}
            max={max}
            step={step}
            value={inputValues[name]}
            onChange={e => handleSliderChange(name, e.target.value)}
            className="flex-1"
          />

          {/* 当前值 */}
          <span className="w-16 text-right">
            {Number(inputValues[name]).toFixed(step < 1 ? 1 : 0)}
          </span>

          {/* 推荐值 or 加载中指示 */}
          <span className="w-24 text-blue-600 flex items-center">
            {loadingFor === name
              ? '⏳'  // 请求中显示转圈
              : recs[name] !== undefined
                ? `↪ ${recs[name].toFixed(2)}`
                : '--'
            }
          </span>
        </div>
      ))}
    </div>
  );
}