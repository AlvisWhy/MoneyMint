import React, { useState, useEffect, useMemo } from "react";
import PieChart from "../components/PieChart";
import "./portfolios.scss";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Slider, Button } from "@mui/material";

const Portfolios = () => {
    const nav = useNavigate();

    // 初始化 rawData 为空对象
    const [rawData, setRawData] = useState({ balance: 0, portfolios: [] });

    // 模拟接口调用，首次加载时请求数据
    useEffect(() => {
        fetch("https://backend-1383.onrender.com/api/pieData/totalRatio/1")
            .then((res) => res.json())
            .then((data) => {
                setRawData(data);
            })
            .catch((err) => {
                console.error("Failed to load portfolios:", err);
            });
    }, []);

    // 使用 useMemo 缓存图表数据，保证 rawData.portfolios 已存在且是数组
    const invested = useMemo(() => {
        if (!rawData || !Array.isArray(rawData.portfolios)) return 0;
        return rawData.portfolios.reduce((sum, p) => sum + p.total_value, 0);
    }, [rawData]);

    const chart1 = useMemo(() => {
        if (!rawData || !Array.isArray(rawData.portfolios)) return [];
        return [
            { value: rawData.balance || 0, name: "Cash Balance" },
            { value: invested, name: "Invested Assets" },
        ];
    }, [rawData, invested]);

    const chart2 = useMemo(() => {
        if (!rawData || !Array.isArray(rawData.portfolios)) return [];
        return rawData.portfolios.map((p) => ({
            value: p.total_value,
            name: p.portfolio_name,
        }));
    }, [rawData]);

    const chart3 = useMemo(() => {
        if (!rawData || !Array.isArray(rawData.portfolios)) return [];
        const stockTotals = {};
        rawData.portfolios.forEach((p) => {
            p.stocks.forEach((s) => {
                stockTotals[s.symbol] = (stockTotals[s.symbol] || 0) + s.total_value;
            });
        });
        return Object.entries(stockTotals).map(([symbol, value]) => ({
            value,
            name: symbol,
        }));
    }, [rawData]);

    // 状态管理
    const [expanded, setExpanded] = useState({});
    const [sliders, setSliders] = useState({});

    const toggleExpand = (portfolioId) => {
        setExpanded((prev) => ({
            ...prev,
            [portfolioId]: !prev[portfolioId],
        }));
    };

    const handleSliderChange = (portfolioId, symbol, value) => {
        setSliders((prev) => ({
            ...prev,
            [`${portfolioId}-${symbol}`]: value,
        }));
    };

    const handleConfirm = (portfolioId, symbol) => {
        const val = sliders[`${portfolioId}-${symbol}`];
        console.log(`Confirmed: Portfolio ${portfolioId}, Stock ${symbol}, New Quantity: ${val}`);
        // TODO: 实际操作，比如调用API更新数据
    };

    if (!rawData || !Array.isArray(rawData.portfolios)) {
        return <div>Loading portfolios...</div>; // 加载状态
    }

    return (
        <div className="portfolios">
            <Header />
            <div className="portfoliosBody">
                <div className="part1">
                    <div className="button">Overview of All portfolios</div>
                    <div className="button">Create New Portfolio</div>
                </div>

                <div className="part2">
                    <div className="diagram">
                        <PieChart title="Balance vs Invested" data={chart1} />
                        <PieChart title="Investment by Portfolio" data={chart2} />
                        <PieChart title="Investment by Stock" data={chart3} />
                    </div>
                </div>

                <div className="part3">
                    <div className="portTitle">
                        <div className="leftTitle">
                            <div className="myPortBtn">My Portfolios</div>
                            <div className="myPortBtn">My Holdings</div>
                        </div>
                        <div className="rightTitle">How to Utilize My Portfolio and My Holdings</div>
                    </div>

                    <div className="portBody">
                        <div className="headerRow">
                            <div className="headerName">
                                <h3>Name</h3>
                            </div>
                            <h3>Total Value</h3>
                        </div>

                        {rawData.portfolios.map((portfolio) => (
                            <div className="portfolioItem" key={portfolio.portfolio_id}>
                                <div className="portfolioHeader" onClick={() => toggleExpand(portfolio.portfolio_id)}>
                                    <h4>{portfolio.portfolio_name}</h4>
                                    <div className="rightele">
                                        <div className="totalValue">${portfolio.total_value.toLocaleString()}</div>
                                        <div className="toggleBtn">{expanded[portfolio.portfolio_id] ? "▲" : "▼"}</div>
                                    </div>
                                </div>

                                {expanded[portfolio.portfolio_id] && (
                                    <div className="stockList">
                                        {portfolio.stocks.map((stock) => (
                                            <div className="stockRow" key={stock.symbol}>
                                                <div className="symbol">{stock.symbol}</div>
                                                <div className="symbolRight">
                                                    <div className="value">${stock.total_value.toLocaleString()}</div>
                                                    <div className="sliderControl">
                                                        <Slider
                                                            value={sliders[`${portfolio.portfolio_id}-${stock.symbol}`] ?? stock.quantity}
                                                            min={0}
                                                            max={stock.quantity * 2}
                                                            step={100}
                                                            onChange={(e, newValue) => handleSliderChange(portfolio.portfolio_id, stock.symbol, newValue)}
                                                            size="small"
                                                            sx={{ color: "#00aaff", width: 150 }}
                                                        />
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleConfirm(portfolio.portfolio_id, stock.symbol)}
                                                            sx={{ marginLeft: 1, color: "#00aaff", borderColor: "#00aaff" }}
                                                        >
                                                            Confirm
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Portfolios;
