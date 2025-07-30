import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

const PieChart = ({ title = "Example Pie", data }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        const chart = echarts.init(chartRef.current);
        const option = {
            backgroundColor: '#000000',
            title: {
                text: title,
                left: 'center',
                top: 20,
                textStyle: {
                    color: '#ccc'
                }
            },
            tooltip: {
                trigger: 'item'
            },
            visualMap: {
                show: false,
                min: 80,
                max: 600,
                inRange: {
                    colorLightness: [0, 1]
                }
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '50%'],
                    data: data.sort((a, b) => a.value - b.value),
                    roseType: 'radius',
                    label: {
                        color: 'rgba(255, 255, 255, 0.3)'
                    },
                    labelLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.3)'
                        },
                        smooth: 0.2,
                        length: 10,
                        length2: 20
                    },
                    itemStyle: {
                        color: '#c23531',
                        shadowBlur: 200,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    animationType: 'scale',
                    animationEasing: 'elasticOut',
                    animationDelay: idx => Math.random() * 200
                }
            ]
        };

        chart.setOption(option);
        return () => chart.dispose();
    }, [data, title]);

    return <div ref={chartRef} style={{ width: '300px', height: '250px' }} />;
};

export default PieChart;
