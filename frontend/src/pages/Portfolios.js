import React, { useState, useEffect, useMemo } from "react";
import PieChart from "../components/PieChart";
import "./portfolios.scss";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Slider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { useSelector } from "react-redux";

const Portfolios = () => {
    const nav = useNavigate();
    const storePortfolioData = useSelector((state) => state.userData.portfolioData);
    const userId = useSelector((state) => state.userData.user.id);

    const [rawData, setRawData] = useState({ balance: 0, portfolios: [] });

    // 充值弹窗相关
    const [chargingOpen, setChargingOpen] = useState(false);
    const [chargeAmount, setChargeAmount] = useState("");

    // 创建新组合弹窗相关
    const [createOpen, setCreateOpen] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState("");

    const openChargeModal = () => setChargingOpen(true);
    const closeChargeModal = () => {
        setChargingOpen(false);
        setChargeAmount("");
    };

    const openCreateModal = () => setCreateOpen(true);
    const closeCreateModal = () => {
        setCreateOpen(false);
        setNewPortfolioName("");
    };

    // 充值确认
    const handleChargeConfirm = async () => {
        const amount = parseFloat(chargeAmount);
        if (!userId) {
            alert("User not logged in.");
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            alert("Please input valid amount.");
            return;
        }

        try {
            const res = await fetch("https://backend-1383.onrender.com/api/trade/charge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    amount: amount
                })
            });

            if (!res.ok) throw new Error("Charge failed");

            const data = await res.json();

            alert("Charge successful!");
            closeChargeModal();

            if (data.url) {
                window.location.href = data.url;  // 浏览器跳转到新的URL
                // 或者 window.location.assign(data.url);
            }
        } catch (err) {
            console.error("Charge error:", err);
            alert("Failed to charge account.");
        }
    };


    // 创建组合确认
    const handleCreateConfirm = async () => {
        const name = newPortfolioName.trim();
        if (!userId) {
            alert("User not logged in.");
            return;
        }
        if (!name) {
            alert("Please input a portfolio name.");
            return;
        }

        try {
            const res = await fetch("https://backend-1383.onrender.com/api/portfolios/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    name: name
                })
            });

            if (!res.ok) throw new Error("Create portfolio failed");

            const createdPortfolio = await res.json();
            alert("Portfolio created successfully!");
            closeCreateModal();

            // 如果需要，重新加载数据或更新状态
            // 这里可以添加刷新redux或重新fetch的逻辑

        } catch (err) {
            console.error("Create portfolio error:", err);
            alert("Failed to create portfolio.");
        }
    };

    useEffect(() => {
        if (storePortfolioData && Array.isArray(storePortfolioData) && storePortfolioData.length > 0) {
            const calculated = storePortfolioData.map((p) => {
                const total_value = p.holdings.reduce(
                    (sum, h) => sum + h.current_price * h.quantity,
                    0
                );
                return {
                    portfolio_id: p.portfolio_id,
                    portfolio_name: p.name,
                    total_value,
                    stocks: p.holdings.map((h) => ({
                        symbol: h.symbol,
                        quantity: h.quantity,
                        current_price: h.current_price,
                        total_value: h.current_price * h.quantity
                    }))
                };
            });

            const invested = calculated.reduce((sum, p) => sum + p.total_value, 0);
            setRawData({
                balance: 2000000 - invested,
                portfolios: calculated
            });
        } else {
            fetch("https://backend-1383.onrender.com/api/pieData/totalRatio/1")
                .then((res) => res.json())
                .then((data) => setRawData(data))
                .catch((err) => console.error("Failed to load portfolios:", err));
        }
    }, [storePortfolioData]);

    const invested = useMemo(() => {
        if (!rawData || !Array.isArray(rawData.portfolios)) return 0;
        return rawData.portfolios.reduce((sum, p) => sum + p.total_value, 0);
    }, [rawData]);

    const chart1 = useMemo(() => {
        if (!rawData || !Array.isArray(rawData.portfolios)) return [];
        return [
            { value: rawData.balance || 0, name: "Cash Balance" },
            { value: invested, name: "Invested Assets" }
        ];
    }, [rawData, invested]);

    const chart2 = useMemo(() => {
        if (!rawData || !Array.isArray(rawData.portfolios)) return [];
        return rawData.portfolios.map((p) => ({
            value: p.total_value,
            name: p.portfolio_name
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
            name: symbol
        }));
    }, [rawData]);

    const [expanded, setExpanded] = useState({});
    const [sliders, setSliders] = useState({});

    const toggleExpand = (portfolioId) => {
        setExpanded((prev) => ({
            ...prev,
            [portfolioId]: !prev[portfolioId]
        }));
    };

    const handleSliderChange = (portfolioId, symbol, value) => {
        setSliders((prev) => ({
            ...prev,
            [`${portfolioId}-${symbol}`]: value
        }));
    };

    const handleConfirm = (portfolioId, symbol) => {
        const val = sliders[`${portfolioId}-${symbol}`];
        console.log(`Confirmed: Portfolio ${portfolioId}, Stock ${symbol}, New Quantity: ${val}`);
        // TODO: 调用API同步数量更改
    };

    return (
        <div className="portfolios">
            <Header />
            <div className="portfoliosBody">
                <div className="part1">
                    <div className="buttonR" onClick={openChargeModal}>Charging</div>
                    <div className="button" onClick={openCreateModal}>Create New Portfolio</div>
                </div>

                <div className="part2">
                    <div className="diagram">
                        <PieChart title="Balance vs Invested" data={chart1} />
                        {rawData.portfolios.length > 0 && (
                            <>
                                <PieChart title="Investment by Portfolio" data={chart2} />
                                <PieChart title="Investment by Stock" data={chart3} />
                            </>
                        )}
                    </div>
                </div>

                <div className="part3">
                    <div className="portTitle">
                        <div className="leftTitle">
                            <div className="myPortBtn">My Portfolios</div>
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
                                <div
                                    className="portfolioHeader"
                                    onClick={() => toggleExpand(portfolio.portfolio_id)}
                                >
                                    <h4
                                        onClick={() => {
                                            nav(`/portdetail/${portfolio.portfolio_id}`);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {portfolio.portfolio_name}
                                    </h4>
                                    <div className="rightele">
                                        <div className="totalValue">
                                            ${portfolio.total_value.toLocaleString()}
                                        </div>
                                        <div className="toggleBtn">
                                            {expanded[portfolio.portfolio_id] ? "▲" : "▼"}
                                        </div>
                                    </div>
                                </div>

                                {expanded[portfolio.portfolio_id] && (
                                    <div className="stockList">
                                        {portfolio.stocks.map((stock) => (
                                            <div className="stockRow" key={stock.symbol}>
                                                <div className="symbol">{stock.symbol}</div>
                                                <div className="symbolRight">
                                                    <div className="value">
                                                        ${stock.total_value.toLocaleString()}
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

            {/* Charging 弹窗 */}
            <Dialog open={chargingOpen} onClose={closeChargeModal}>
                <DialogTitle style={{ background: "#222", color: "#fff" }}>Charge Balance</DialogTitle>
                <DialogContent style={{ background: "#111" }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Enter Amount"
                        fullWidth
                        variant="outlined"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(e.target.value)}
                        inputProps={{ style: { color: "#fff" } }}
                        InputLabelProps={{ style: { color: "#ccc" } }}
                        sx={{ input: { background: "#222" } }}
                    />
                </DialogContent>
                <DialogActions style={{ background: "#111" }}>
                    <Button onClick={closeChargeModal} sx={{ color: "#ccc" }}>Cancel</Button>
                    <Button onClick={handleChargeConfirm} sx={{ color: "#00aaff" }}>Confirm</Button>
                </DialogActions>
            </Dialog>

            {/* 创建新组合弹窗 */}
            <Dialog open={createOpen} onClose={closeCreateModal}>
                <DialogTitle style={{ background: "#222", color: "#fff" }}>Create New Portfolio</DialogTitle>
                <DialogContent style={{ background: "#111" }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Portfolio Name"
                        fullWidth
                        variant="outlined"
                        value={newPortfolioName}
                        onChange={(e) => setNewPortfolioName(e.target.value)}
                        inputProps={{ style: { color: "#fff" } }}
                        InputLabelProps={{ style: { color: "#ccc" } }}
                        sx={{ input: { background: "#222" } }}
                    />
                </DialogContent>
                <DialogActions style={{ background: "#111" }}>
                    <Button onClick={closeCreateModal} sx={{ color: "#ccc" }}>Cancel</Button>
                    <Button onClick={handleCreateConfirm} sx={{ color: "#00aaff" }}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Portfolios;
