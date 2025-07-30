import React, { useEffect } from "react";
import * as echarts from "echarts";
import "./PortDetail.scss";
import Header from "../components/Header";

const PortDetail = ({ portName }) => {
    // 生成一组模拟的每日收益率数据（100天，-10% 到 +10%）
    const generatePortfolioData = () => {
        const values = [];
        for (let i = 0; i < 100; i++) {
            // -0.10 到 +0.10 之间波动，转成百分比 例如 -10% 到 +10%
            const dailyReturn = (Math.random() - 0.5) * 0.2 + 0.05;
            values.push(parseFloat(dailyReturn.toFixed(4)));
        }
        return values;
    };

    useEffect(() => {
        const chartDom = document.getElementById("main");
        if (!chartDom) return;

        const myChart = echarts.init(chartDom);

        const portfolioData = generatePortfolioData();

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
                min: -0.15,  // 纵轴最小值
                max: 0.15,   // 纵轴最大值
            },
            grid: { left: "10%", right: "10%", bottom: "15%", top: "10%" },
            series: [
                {
                    name: "Daily Return",
                    type: "line",
                    data: portfolioData,
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

        return () => {
            myChart.dispose();
        };
    }, []);

    return (
        <div className="portDetailPage">
            <Header />
            <div className="portPart1">
                <div className="portName">
                    <h3>{portName || "Name of Port"}</h3>
                </div>
            </div>
            <div className="portPart2">
                <div className="polyLine">
                    <div id="main" style={{ width: "100%", height: "400px" }}></div>
                </div>
            </div>
            <div className="portPart3">
                <div className="basicData">
                    <div className="smlTitle">Basic Data</div>
                </div>
                <div className="summary"><div className="smlTitle">Summary</div></div>
            </div>
            <div className="portPart4">
                <div>Some Other Diagrams</div>
            </div>
        </div>
    );
};

export default PortDetail;
