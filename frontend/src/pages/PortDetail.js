import React, { useEffect, useState } from "react";
import * as echarts from "echarts";
import "./PortDetail.scss";
import Header from "../components/Header";

const PortDetail = ({ portName }) => {
    const [portfolioData, setPortfolioData] = useState([]);

    // === 计算函数 ===
    function calculateReturnPercent(initialValue, currentValue) {
        return ((currentValue - initialValue) / initialValue) * 100;
    }

    function calculateAnnualizedReturn(initialValue, currentValue) {
        return (Math.pow(currentValue / initialValue, 1 / (100 / 365)) - 1) * 100;
    }

    function calculateExcessReturn(portfolioReturn) {
        return portfolioReturn - 4.39;
    }

    function calculateSharpeRatio(portfolioReturns) {
        const excessReturns = portfolioReturns.map(r => r - 4.39);
        const avg = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
        const stdDev = Math.sqrt(
            excessReturns.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / excessReturns.length
        );
        return stdDev === 0 ? 0 : avg / stdDev;
    }

    function calculateMaxDrawdown(values) {
        let peak = values[0];
        let maxDrawdown = 0;
        for (let value of values) {
            if (value > peak) peak = value;
            const drawdown = (peak - value) / peak;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        }
        return maxDrawdown * 100;
    }

    function calculateBeta(portfolioReturns, benchmarkReturns) {
        const n = portfolioReturns.length;
        const avgPortfolio = portfolioReturns.reduce((a, b) => a + b, 0) / n;
        const avgBenchmark = benchmarkReturns.reduce((a, b) => a + b, 0) / n;
        let covariance = 0;
        let variance = 0;
        for (let i = 0; i < n; i++) {
            covariance += (portfolioReturns[i] - avgPortfolio) * (benchmarkReturns[i] - avgBenchmark);
            variance += Math.pow(benchmarkReturns[i] - avgBenchmark, 2);
        }
        return variance === 0 ? 0 : covariance / variance;
    }

    function calculateAlpha(portfolioReturns, benchmarkReturns) {
        const beta = calculateBeta(portfolioReturns, benchmarkReturns);
        const avgPortfolio = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length;
        const avgBenchmark = benchmarkReturns.reduce((a, b) => a + b, 0) / benchmarkReturns.length;
        return avgPortfolio - (4.39 + beta * (avgBenchmark - 4.39));
    }

    // 股票假数据
    const fakeStockData = [
        {
            ticker: "GE",
            company_name: "GE Aerospace",
            current_price: 270.31,
            change_amount: -0.48,
            change_percent: -0.18,
            open: 272.73,
            high: 273.80,
            low: 269.12,
            volume: 4092200,
        },
        {
            ticker: "PNC",
            company_name: "The PNC Financial Services Group, Inc.",
            current_price: 193.37,
            change_amount: 0.07,
            change_percent: 0.04,
            open: 195.23,
            high: 195.51,
            low: 192.87,
            volume: 1236600,
        },
        {
            ticker: "MSFT",
            company_name: "Microsoft Corporation",
            current_price: 512.57,
            change_amount: -1.19,
            change_percent: -0.23,
            open: 515.53,
            high: 517.62,
            low: 511.56,
            volume: 16444700,
        },
    ];

    // === 模拟数据 + 图表 ===
    const generatePortfolioData = () => {
        const values = [];
        let cumulative = 1.0;
        for (let i = 0; i < 100; i++) {
            const dailyReturn = (Math.random() - 0.5) * 0.2; // -10% ~ +10%
            cumulative *= 1 + dailyReturn;
            values.push(parseFloat((cumulative - 1).toFixed(4)));
        }
        return values;
    };

    useEffect(() => {
        const data = generatePortfolioData();
        setPortfolioData(data);

        // 折线图初始化
        const chartDom = document.getElementById("main");
        if (!chartDom) return;
        const myChart = echarts.init(chartDom);

        const option = {
            backgroundColor: "#000",
            tooltip: {
                trigger: "axis",
                backgroundColor: "#222",
                borderColor: "#555",
                textStyle: { color: "#fff" },
                formatter: params => {
                    const val = params[0].data;
                    return `${params[0].axisValue}<br/>收益率: ${(val * 100).toFixed(2)}%`;
                }
            },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: Array.from({ length: 100 }, (_, i) => `Day ${i + 1}`),
                axisLine: { lineStyle: { color: "#888" } },
                axisLabel: { color: "#ccc" },
            },
            yAxis: {
                type: "value",
                axisLine: { lineStyle: { color: "#888" } },
                axisLabel: {
                    color: "#ccc",
                    formatter: value => (value * 100).toFixed(2) + '%',
                },
                splitLine: { lineStyle: { color: "#333" } },
                min: -2.0,
                max: 2.0,
            },
            grid: { left: "10%", right: "10%", bottom: "15%", top: "10%" },
            series: [
                {
                    name: "Daily Return",
                    type: "line",
                    data: data,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: "rgba(0, 136, 212, 0.4)" },
                            { offset: 1, color: "rgba(0, 136, 212, 0.05)" },
                        ]),
                    },
                    lineStyle: {
                        color: "#08f",
                        width: 2,
                    },
                    symbol: "none",
                },
            ],
        };

        myChart.setOption(option);

        // ========== 第二个图表：指标柱状图 ==========
        const initialValue = 1;
        const finalValue = data[data.length - 1] + 1;
        const mockBenchmark = data.map(p => p * 0.8);

        // 先计算所有指标变量（必须先定义，避免“cannot access before initialization”）
        const returnPct = calculateReturnPercent(initialValue, finalValue);
        const annualized = calculateAnnualizedReturn(initialValue, finalValue);
        const excess = calculateExcessReturn(returnPct);
        const sharpe = calculateSharpeRatio(data.map(v => v * 100));
        const drawdown = calculateMaxDrawdown(data.map(v => v + 1));
        const beta = calculateBeta(data, mockBenchmark);
        const alpha = calculateAlpha(data, mockBenchmark);

        const summaryDom = document.getElementById("summaryChart");
        if (summaryDom) {
            const summaryChart = echarts.init(summaryDom);

            const summaryOption = {
                backgroundColor: "#000",
                tooltip: { trigger: "item" },
                xAxis: {
                    type: "category",
                    data: ["Return", "Annual", "Excess", "Sharpe", "Drawdown", "Alpha", "Beta"],
                    axisLabel: { color: "#ccc" },
                    axisLine: { lineStyle: { color: "#666" } },
                },
                yAxis: {
                    type: "value",
                    axisLabel: { color: "#ccc" },
                    splitLine: { lineStyle: { color: "#333" } },
                },
                series: [
                    {
                        data: [
                            returnPct,
                            annualized,
                            excess,
                            sharpe,
                            -drawdown, // 负向展示
                            alpha,
                            beta,
                        ],
                        type: "bar",
                        barWidth: "50%",
                        itemStyle: {
                            color: function(params) {
                                return params.data >= 0 ? "#3399ff" : "#ff4c4c"; // 亮蓝正，亮红负
                            }
                        }
                    }
                ],
            };

            summaryChart.setOption(summaryOption);
        }

        return () => {
            myChart.dispose();
        };
    }, []);

    return (
        <div className="portDetailPage">
            <Header />
            <div className="portPart1">
                <div className="portName">
                    <h3>{'Current Portfolio'}</h3>
                </div>
            </div>

            <div className="portPart2">
                <div className="polyLine">
                    <div id="main" style={{ width: "90vw", height: "400px" }}></div>
                </div>
            </div>

            <div className="portPart3">
                <div className="basicData">
                    <div className="smlTitle">Basic Data</div>
                    {fakeStockData.map((stock) => (
                        <div key={stock.ticker} className="stock-row">
                            <div className="stock-info">
                                <div className="ticker">{stock.ticker}</div>
                                <div className="company">{stock.company_name}</div>
                                <div className="price">${stock.current_price.toFixed(2)}</div>
                                <div className="volume">{stock.volume.toLocaleString()}</div>
                            </div>
                            <div className="stock-actions">
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Qty"
                                    className="quantity-input"
                                />
                                <button className="action-btn buy">+</button>
                                <button className="action-btn sell">−</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="summary">
                    <div className="smlTitle">Summary</div>
                    <div
                        id="summaryChart"
                        style={{ width: "100%", minWidth: "300px", height: "300px", marginTop: "20px" }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default PortDetail;
