import LanguageChange from "../components/LanguageChange";
import './MainPage.scss';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import OverallIndex from "../components/OverallIndex";
import StockItem from "../components/StockItem";
import SearchIcon from '@mui/icons-material/Search';

const MainPage = () => {
    const nav = useNavigate();
    const [marketData, setMarketData] = useState({});
    const [stockList, setStockList] = useState([]);

    // 获取市场指数
    useEffect(() => {
        fetch('https://moneymint.onrender.com/main_index')
            .then(res => res.json())
            .then(data => setMarketData(data))
            .catch(err => console.error("Error fetching market data:", err));
    }, []);

    // 获取随机股票列表
    useEffect(() => {
        fetch('https://moneymint.onrender.com/random-stocks')
            .then(res => res.json())
            .then(data => setStockList(data))
            .catch(err => console.error("Error fetching stock list:", err));
    }, []);

    const renderIndex = (key, title) => {
        const data = marketData[key];
        if (!data) return null;

        const [sp, val, perVal] = data;
        const color = val >= 0 ? 'red' : 'green';

        return (
            <OverallIndex
                key={key}
                title={title}
                sp={sp.toFixed(2)}
                val={<span style={{ color }}>{val >= 0 ? '+' : ''}{val.toFixed(2)}</span>}
                perVal={<span style={{ color }}>{perVal >= 0 ? '+' : ''}{perVal.toFixed(2)}%</span>}
            />
        );
    };

    return (
        <div className='mainPage'>
            <div className='header'>
                <h3>USER</h3>
                <h3>CONTACT</h3>
                <h3 onClick={() => nav('/portfolios')}>PORTFOLIO</h3>
                <h3 onClick={() => nav('/login')}>LOG IN</h3>
            </div>

            <div className='mainPageBody'>
                <div className="searchStock">
                    <input placeholder="Search For a Stock" />
                    <div className="searchBtn">
                        <SearchIcon />
                    </div>
                </div>

                <div className='mainPageMarket'>
                    <div className="secTitle">
                        <h3>Market Indices</h3>
                    </div>
                    <div className="mainMarketIndices">
                        {renderIndex("DJI", "Dow Jones")}
                        {renderIndex("IXIC", "Nasdaq")}
                        {renderIndex("GSPC", "S&P 500")}
                        {renderIndex("^VIX", "VIX Volatility")}
                    </div>
                </div>

                <div className='mainPageStocks'>
                    <div className="secTitle">
                        <h3>Stocks</h3>
                    </div>
                    <div className="allStocks">
                        <div className="stockTitleRow">
                            <div className="name">
                                <span className="name">Company</span>
                            </div>

                            <span className="price">Price</span>
                            <span className="change">Change</span>
                            <span className="percent">%</span>
                            <span className="open">Open</span>
                            <span className="high">High</span>
                            <span className="low">Low</span>
                            <span className="volume">Volume</span>

                        </div>
                        <hr className="stockTitleDivider" />

                        {stockList.map(stock => (
                            <StockItem key={stock.ticker} data={stock} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mainPageFooter">
                <LanguageChange />
            </div>
        </div>
    );
};

export default MainPage;
