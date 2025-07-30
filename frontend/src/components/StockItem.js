import React, { useState, useEffect } from 'react';
import './StockItem.scss';
import * as echarts from 'echarts';

const StockItem = ({ data }) => {
    const [showModal, setShowModal] = useState(false);

    const {
        ticker,
        company_name,
        current_price,
        change_amount,
        change_percent,
        open,
        high,
        low,
        volume
    } = data;

    const color = change_amount >= 0 ? 'red' : 'green';

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    useEffect(() => {
        if (!showModal) return;

        const chartDom = document.getElementById('kline-chart');
        if (!chartDom) return;
        const myChart = echarts.init(chartDom);

        const upColor = '#00da3c';
        const downColor = '#ec0000';

        fetch(`https://moneymint.onrender.com/get-chart-data?ticker=${ticker}`)
            .then(res => res.json())
            .then(rawData => {
                const categoryData = [];
                const values = [];

                for (let i = 0; i < rawData.length; i++) {
                    const [date, open, close, low, high] = rawData[i];
                    categoryData.push(date);
                    values.push([open, close, low, high]);
                }

                function calculateMA(dayCount) {
                    const result = [];
                    for (let i = 0; i < values.length; i++) {
                        if (i < dayCount) {
                            result.push('-');
                            continue;
                        }
                        let sum = 0;
                        for (let j = 0; j < dayCount; j++) {
                            sum += values[i - j][1]; // 收盘价
                        }
                        result.push((sum / dayCount).toFixed(2));
                    }
                    return result;
                }

                const ma5 = calculateMA(5);
                const ma10 = calculateMA(10);
                const ma20 = calculateMA(20);

                myChart.setOption({
                    backgroundColor: '#000',
                    animation: false,
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'cross' },
                        backgroundColor: '#222',
                        borderColor: '#aaa',
                        borderWidth: 1,
                        textStyle: {
                            color: '#fff',
                            fontSize: 12
                        },
                        padding: 10,
                    },
                    legend: {
                        data: ['K线', 'MA5', 'MA10', 'MA20'],
                        textStyle: { color: '#ccc' }
                    },
                    xAxis: {
                        type: 'category',
                        data: categoryData,
                        axisLine: { lineStyle: { color: '#888' } },
                    },
                    yAxis: {
                        scale: true,
                        axisLine: { lineStyle: { color: '#888' } },
                        splitLine: { lineStyle: { color: '#444' } },
                    },
                    grid: { left: '10%', right: '10%', bottom: '15%' },
                    series: [
                        {
                            name: 'K线',
                            type: 'candlestick',
                            data: values,
                            itemStyle: {
                                color: '#00da3c',
                                color0: '#ec0000',
                                borderColor: '#00da3c',
                                borderColor0: '#ec0000'
                            }
                        },
                        {
                            name: 'MA5',
                            type: 'line',
                            data: ma5,
                            smooth: true,
                            showSymbol: false,
                            lineStyle: {
                                width: 1.5,
                                color: '#ffd700'
                            }
                        },
                        {
                            name: 'MA10',
                            type: 'line',
                            data: ma10,
                            smooth: true,
                            showSymbol: false,
                            lineStyle: {
                                width: 1.5,
                                color: '#00bfff'
                            }
                        },
                        {
                            name: 'MA20',
                            type: 'line',
                            data: ma20,
                            smooth: true,
                            showSymbol: false,
                            lineStyle: {
                                width: 1.5,
                                color: '#ff69b4'
                            }
                        }
                    ]
                });
            })
            .catch(err => {
                console.error('Error fetching chart data:', err);
            });

        return () => {
            myChart.dispose();
        };
    }, [showModal, ticker]);

    return (
        <>
            <div className="stock-item" onClick={openModal}>
                <div className="stock-summary">
                    <div className="stock-name">
                        <strong>{company_name}</strong>
                        <div className="ticker">{ticker}</div>
                    </div>

                    <div className="stock-data">
                        <div>{current_price.toFixed(2)}</div>
                        <div style={{ color }}>{change_amount.toFixed(2)}</div>
                        <div style={{ color }}>{change_percent.toFixed(2)}%</div>
                        <div>{open.toFixed(2)}</div>
                        <div>{high.toFixed(2)}</div>
                        <div>{low.toFixed(2)}</div>
                        <div>{volume.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-btn" onClick={closeModal}>✕</button>
                        <div id="kline-chart" style={{ width: '100%', height: '500px' }}></div>
                        <div className="modal-actions">
                            <button className="portfolio-btn">Add to Existing Portfolio</button>
                            <button className="portfolio-btn">Create and Add to a New Portfolio</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StockItem;
