import React, { useEffect, useState } from "react";
import * as echarts from "echarts";
import "./PortDetail.scss";
import Header from "../components/Header";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PortDetail = () => {
    const { portid } = useParams();
    const nav = useNavigate();
    const portfolioDataFromStore = useSelector(state => state.userData.portfolioData);
    const [portfolioData, setPortfolioData] = useState([]);
    const [currentPortfolio, setCurrentPortfolio] = useState(null);
    const [stocks, setStocks] = useState([]);

    // 计算指标函数略（不变）

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

    // 获取当前投资组合
    useEffect(() => {
        if (portfolioDataFromStore && portid) {
            const portfolio = portfolioDataFromStore.find(p => p.portfolio_id.toString() === portid.toString());
            setCurrentPortfolio(portfolio || null);
            if (portfolio) {
                const formattedStocks = portfolio.holdings.map(h => ({
                    ticker: h.symbol,
                    company_name: h.company_name || h.symbol,
                    current_price: h.current_price,
                    change_amount: h.change_amount || 0,
                    change_percent: h.change_percent || 0,
                    open: h.open || 0,
                    high: h.high || 0,
                    low: h.low || 0,
                    volume: h.volume || 0,
                    quantity: h.quantity || 0,
                }));
                setStocks(formattedStocks);
            } else {
                setStocks([]);
            }
        }
    }, [portfolioDataFromStore, portid]);

    // 模拟收益率数据
    const generatePortfolioData = () => {
        const values = [];
        let cumulative = 1.0;
        for (let i = 0; i < 100; i++) {
            const dailyReturn = (Math.random() - 0.5) * 0.2;
            cumulative *= 1 + dailyReturn;
            values.push(parseFloat((cumulative - 1).toFixed(4)));
        }
        return values;
    };

    // 生成图表
    useEffect(() => {
        const data = generatePortfolioData();
        setPortfolioData(data);

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

        // Summary chart
        const finalValue = data[data.length - 1] + 1;
        const mockBenchmark = data.map(p => p * 0.8);
        const returnPct = calculateReturnPercent(1, finalValue);
        const annualized = calculateAnnualizedReturn(1, finalValue);
        const excess = calculateExcessReturn(returnPct);
        const sharpe = calculateSharpeRatio(data.map(v => v * 100));
        const drawdown = calculateMaxDrawdown(data.map(v => v + 1));
        const beta = calculateBeta(data, mockBenchmark);
        const alpha = calculateAlpha(data, mockBenchmark);

        const summaryDom = document.getElementById("summaryChart");
        if (summaryDom) {
            const summaryChart = echarts.init(summaryDom);
            summaryChart.setOption({
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
                            -drawdown,
                            alpha,
                            beta,
                        ],
                        type: "bar",
                        barWidth: "50%",
                        itemStyle: {
                            color: function (params) {
                                return params.data >= 0 ? "#3399ff" : "#ff4c4c";
                            }
                        }
                    }
                ],
            });
        }

        return () => myChart.dispose();
    }, [portid]);

    // 🔁 跳转到下一个 portfolio
    const handleNext = () => {
        if (!portfolioDataFromStore || !currentPortfolio) return;

        const currentIndex = portfolioDataFromStore.findIndex(p => p.portfolio_id.toString() === portid.toString());
        if (currentIndex !== -1 && currentIndex < portfolioDataFromStore.length - 1) {
            const nextPortfolio = portfolioDataFromStore[currentIndex + 1];
            nav(`/portdetail/${nextPortfolio.portfolio_id}`);
        }
    };

    return (
        <div className="portDetailPage">
            <Header />
            <div className="portPart1">
                <div className="portName">
                    <h3>{currentPortfolio ? currentPortfolio.name : `Portfolio ID: ${portid}`}</h3>
                </div>
                <div className="btn" onClick={handleNext} style={{ cursor: "pointer" }}>{">"}</div>
            </div>

            <div className="portPart2">
                <div className="polyLine">
                    <div id="main" style={{ width: "90vw", height: "400px" }}></div>
                </div>
            </div>

            <div className="portPart3">
                <div className="basicData">
                    <div className="smlTitle">Basic Data</div>
                    {stocks.length > 0 ? (
                        stocks.map((stock) => (
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
                                        defaultValue={stock.quantity}
                                    />
                                    <button className="action-btn buy">+</button>
                                    <button className="action-btn sell">−</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No stock data available for this portfolio.</div>
                    )}
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
