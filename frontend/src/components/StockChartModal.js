import React, { useEffect } from 'react';
import './StockChartModal.scss';
import * as echarts from 'echarts';
import $ from 'jquery';

const StockChartModal = ({ onClose }) => {
    useEffect(() => {
        const chartDom = document.getElementById('chart-container');
        const myChart = echarts.init(chartDom, 'dark'); // 黑色主题
        const ROOT_PATH = 'https://echarts.apache.org/examples';

        const upColor = '#00da3c';
        const downColor = '#ec0000';

        function splitData(rawData) {
            let categoryData = [];
            let values = [];
            let volumes = [];
            for (let i = 0; i < rawData.length; i++) {
                categoryData.push(rawData[i].splice(0, 1)[0]);
                values.push(rawData[i]);
                volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);
            }
            return {
                categoryData,
                values,
                volumes
            };
        }

        function calculateMA(dayCount, data) {
            var result = [];
            for (var i = 0, len = data.values.length; i < len; i++) {
                if (i < dayCount) {
                    result.push('-');
                    continue;
                }
                var sum = 0;
                for (var j = 0; j < dayCount; j++) {
                    sum += data.values[i - j][1];
                }
                result.push(+(sum / dayCount).toFixed(3));
            }
            return result;
        }

        $.get(ROOT_PATH + '/data/asset/data/stock-DJI.json', function (rawData) {
            var data = splitData(rawData);
            myChart.setOption({
                animation: false,
                backgroundColor: 'black',
                legend: {
                    bottom: 10,
                    left: 'center',
                    textStyle: {
                        color: '#aaa'
                    },
                    data: ['Dow-Jones index', 'MA5', 'MA10', 'MA20', 'MA30']
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'cross' },
                    borderWidth: 1,
                    borderColor: '#333',
                    padding: 10,
                    textStyle: { color: '#fff' }
                },
                axisPointer: {
                    link: [{ xAxisIndex: 'all' }],
                    label: { backgroundColor: '#777' }
                },
                grid: [
                    { left: '10%', right: '8%', height: '50%' },
                    { left: '10%', right: '8%', top: '63%', height: '16%' }
                ],
                xAxis: [
                    {
                        type: 'category',
                        data: data.categoryData,
                        boundaryGap: false,
                        axisLine: { onZero: false, lineStyle: { color: '#aaa' } },
                        splitLine: { show: false },
                        min: 'dataMin',
                        max: 'dataMax'
                    },
                    {
                        type: 'category',
                        gridIndex: 1,
                        data: data.categoryData,
                        boundaryGap: false,
                        axisLine: { onZero: false, lineStyle: { color: '#aaa' } },
                        axisTick: { show: false },
                        splitLine: { show: false },
                        axisLabel: { show: false },
                        min: 'dataMin',
                        max: 'dataMax'
                    }
                ],
                yAxis: [
                    {
                        scale: true,
                        splitArea: { show: true },
                        axisLine: { lineStyle: { color: '#aaa' } }
                    },
                    {
                        scale: true,
                        gridIndex: 1,
                        splitNumber: 2,
                        axisLine: { show: false },
                        axisTick: { show: false },
                        splitLine: { show: false },
                        axisLabel: { show: false }
                    }
                ],
                dataZoom: [
                    {
                        type: 'inside',
                        xAxisIndex: [0, 1],
                        start: 98,
                        end: 100
                    },
                    {
                        show: true,
                        xAxisIndex: [0, 1],
                        type: 'slider',
                        top: '85%',
                        start: 98,
                        end: 100
                    }
                ],
                visualMap: {
                    show: false,
                    seriesIndex: 5,
                    dimension: 2,
                    pieces: [
                        { value: 1, color: downColor },
                        { value: -1, color: upColor }
                    ]
                },
                series: [
                    {
                        name: 'Dow-Jones index',
                        type: 'candlestick',
                        data: data.values,
                        itemStyle: {
                            color: upColor,
                            color0: downColor
                        }
                    },
                    { name: 'MA5', type: 'line', data: calculateMA(5, data), smooth: true },
                    { name: 'MA10', type: 'line', data: calculateMA(10, data), smooth: true },
                    { name: 'MA20', type: 'line', data: calculateMA(20, data), smooth: true },
                    { name: 'MA30', type: 'line', data: calculateMA(30, data), smooth: true },
                    {
                        name: 'Volume',
                        type: 'bar',
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data: data.volumes
                    }
                ]
            });
        });

        return () => {
            myChart.dispose();
        };
    }, []);

    return (
        <div className="stock-chart-modal">
            <div className="chart-content">
                <button className="close-btn" onClick={onClose}>×</button>
                <div id="chart-container"></div>
            </div>
        </div>
    );
};

export default StockChartModal;
