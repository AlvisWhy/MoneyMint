import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const PieChart = React.memo(({ title = "Example Pie", data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }
        const option = {
            backgroundColor: "#000000",
            color: ["#007BFF", "#FF4D4F", "#00CCFF", "#FF6B81"],
            title: {
                text: title,
                left: "center",
                top: 20,
                textStyle: {
                    color: "#ccc",
                },
            },
            tooltip: {
                trigger: "item",
            },
            series: [
                {
                    name: title,
                    type: "pie",
                    radius: "55%",
                    center: ["50%", "50%"],
                    data: data.sort((a, b) => a.value - b.value),
                    roseType: "radius",
                    label: {
                        color: "rgba(255, 255, 255, 0.7)",
                    },
                    labelLine: {
                        lineStyle: {
                            color: "rgba(255, 255, 255, 0.3)",
                        },
                        smooth: 0.2,
                        length: 10,
                        length2: 20,
                    },
                    itemStyle: {
                        shadowBlur: 50,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                    },
                    animationType: "scale",
                    animationEasing: "elasticOut",
                    animationDelay: (idx) => Math.random() * 200,
                },
            ],
        };

        chartInstance.current.setOption(option);

        const handleResize = () => chartInstance.current.resize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [title, data]);

    return <div ref={chartRef} style={{ width: "300px", height: "250px" }} />;
});

export default PieChart;
