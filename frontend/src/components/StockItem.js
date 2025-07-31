import React, { useState, useEffect, useRef } from 'react';
import './StockItem.scss';
import * as echarts from 'echarts';
import { useSelector } from 'react-redux';

const StockItem = ({ data }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [quantity, setQuantity] = useState('');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const state = useSelector(state => state);
    console.log('redux state:', state);
    const userId = useSelector(state => state.userData.user.id);
    const portfolios = useSelector(state => state.userData.portfolioData);
    console.log(userId)
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

    const handleBuy = async () => {
        if (!selectedPortfolio || !quantity) return;

        const payload = {
            portfolio_id: parseInt(selectedPortfolio),
            symbol: ticker,
            quantity: parseInt(quantity),
            price: parseFloat(current_price)
        };

        try {
            const res = await fetch('https://backend-1383.onrender.com/api/trade/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            console.log('Buy success:', result);

            // 弹窗 + 关闭
            alert('Purchase completed!');
            closeModal(); // 👈 成功后关闭模态框
        } catch (err) {
            console.error('Buy error:', err);
            alert('Purchase failed.');
        }
    };

    useEffect(() => {
        if (!showModal || !chartRef.current) return;

        fetch(`https://moneymint.onrender.com/get-chart-data?ticker=${ticker}`)
            .then(res => res.json())
            .then(data => {
                const rawData = data.chart_data;
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
                            sum += values[i - j][1];
                        }
                        result.push((sum / dayCount).toFixed(2));
                    }
                    return result;
                }

                const ma5 = calculateMA(5);
                const ma10 = calculateMA(10);
                const ma20 = calculateMA(20);

                if (chartInstance.current) chartInstance.current.dispose();
                chartInstance.current = echarts.init(chartRef.current);

                chartInstance.current.setOption({
                    backgroundColor: '#000',
                    animation: false,
                    title: {
                        text: `${company_name} (${ticker})`,
                        left: 'center',
                        top: 4,
                        textStyle: {
                            color: '#fff',
                            fontSize: 16
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'cross' },
                        backgroundColor: '#222',
                        borderColor: '#aaa',
                        borderWidth: 1,
                        textStyle: { color: '#fff', fontSize: 12 },
                        padding: 10,
                    },
                    legend: {
                        data: ['MA5', 'MA10', 'MA20'],
                        textStyle: { color: '#ccc' },
                        top: 40,
                        left: 'center'
                    },
                    grid: { left: '10%', right: '10%', bottom: '15%' },
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
                            lineStyle: { width: 1.5, color: '#ffd700' }
                        },
                        {
                            name: 'MA10',
                            type: 'line',
                            data: ma10,
                            smooth: true,
                            showSymbol: false,
                            lineStyle: { width: 1.5, color: '#00bfff' }
                        },
                        {
                            name: 'MA20',
                            type: 'line',
                            data: ma20,
                            smooth: true,
                            showSymbol: false,
                            lineStyle: { width: 1.5, color: '#ff69b4' }
                        }
                    ]
                });
            })
            .catch(err => console.error('Error fetching chart data:', err));

        return () => {
            if (chartInstance.current) chartInstance.current.dispose();
        };
    }, [showModal, ticker, company_name]);

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
                        <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
                        <div className="modal-actions">
                            <input
                                type="number"
                                placeholder="Input Qty to Buy"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />

                            {userId ? (
                                portfolios.length > 0 ? (
                                    <>
                                        <select
                                            value={selectedPortfolio || ''}
                                            onChange={(e) => setSelectedPortfolio(e.target.value)}
                                        >
                                            <option value="" disabled>Select Portfolio</option>
                                            {portfolios.map(p => (
                                                <option key={p.portfolio_id} value={p.portfolio_id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button className="portfolio-btn" onClick={handleBuy}>
                                            Buy
                                        </button>
                                    </>
                                ) : (
                                    <div className="info-text">Please Create a Portfolio</div>
                                )
                            ) : (
                                <div className="info-text">Please log in</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StockItem;
