import LanguageChange from "../components/LanguageChange";
import './MainPage.scss';
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import OverallIndex from "../components/OverallIndex";
import StockItem from "../components/StockItem";
import SearchIcon from '@mui/icons-material/Search';
import Header from "../components/Header";

const MainPage = () => {
    const nav = useNavigate();
    const [marketData, setMarketData] = useState({});
    const [stockList, setStockList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchText, setSearchText] = useState("");

    const observer = useRef();

    // 获取市场指数
    useEffect(() => {
        fetch('https://moneymint.onrender.com/main_index')
            .then(res => res.json())
            .then(data => setMarketData(data))
            .catch(err => console.error("Error fetching market data:", err));
    }, []);

    // 初始加载股票数据
    useEffect(() => {
        loadMoreStocks();
    }, []);

    const loadMoreStocks = () => {
        if (loading || !hasMore) return;
        setLoading(true);

        fetch('https://moneymint.onrender.com/random-stocks')
            .then(res => res.json())
            .then(data => {
                if (data.length === 0) {
                    setHasMore(false);
                } else {
                    setStockList(prev => [...prev, ...data]);
                }
            })
            .catch(err => console.error("Error fetching stock list:", err))
            .finally(() => setLoading(false));
    };

    const lastStockRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                loadMoreStocks();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

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

    const handleSearch = async () => {
        const query = searchText.trim().toUpperCase();
        if (!query) return alert("Please input stock ticker");

        try {
            const res = await fetch('https://moneymint.onrender.com/get-multi-stock-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tickers: [query] })
            });

            if (!res.ok) throw new Error("Request failed");
            const data = await res.json();

            if (!data || data.length === 0 || !data[0].ticker) {
                alert("Please input right name");
                return;
            }

            // 添加到 stockList 的最前面
            setStockList(prev => [data[0], ...prev]);
            setSearchText(""); // 清空输入
        } catch (error) {
            console.error("Search error:", error);
            alert("Please input right name");
        }
    };

    return (
        <div className='mainPage'>
            <Header />
            <div className='mainPageBody'>
                <div className="searchStock">
                    <input
                        placeholder="Search For a Stock"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    />
                    <div className="searchBtn" onClick={handleSearch}>
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
                    <div className="stockTitleRow">
                        <div className="name">
                            <span className="name">Company</span>
                        </div>
                        <span className="price">Price</span>
                        <span className="change">Change</span>
                        <span className="percent">Percentage</span>
                        <span className="open">Open</span>
                        <span className="high">High</span>
                        <span className="low">Low</span>
                        <span className="volume">Volume</span>
                    </div>
                    <hr className="stockTitleDivider" />
                    <div className="allStocks">
                        {stockList.map((stock, index) => {
                            if (index === stockList.length - 1) {
                                return <div ref={lastStockRef} key={stock.ticker}>
                                    <StockItem data={stock} />
                                </div>;
                            }
                            return <StockItem key={stock.ticker} data={stock} />;
                        })}

                        {loading && (
                            <div className="loading-text" style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>
                                Loading<span className="loading-dots"></span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
