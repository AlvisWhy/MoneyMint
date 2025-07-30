import React from 'react';
import CandlestickChart from '../components/CandlestickChart';

const sampleData = [
  {
    time: '2024-07-25',
    open: 250.1,
    high: 253.8,
    low: 248.3,
    close: 252.0,
  },
  {
    time: '2024-07-26',
    open: 252.0,
    high: 255.2,
    low: 251.0,
    close: 254.5,
  },
  // ...
];

const ChartPage = () => {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#f0f0f0' }}>
      <h2>K线图演示</h2>
      <CandlestickChart data={sampleData} />
    </div>
  );
};

export default ChartPage;