from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import random

TICKER_LIST = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "JPM", "V", "PG",
    "DIS", "NFLX", "PEP", "KO", "INTC", "ADBE", "CSCO", "CRM", "WMT", "BA",
    "T", "XOM", "CVX", "MRK", "PFE", "NKE", "MCD", "HD", "UNH", "WFC",
    "ABBV", "COST", "ORCL", "QCOM", "IBM", "MDT", "GS", "LMT", "GE", "BKNG",
    "CAT", "BLK", "PYPL", "AMAT", "TMO", "TXN", "UPS", "AXP", "MO", "F",
    "GM", "FDX", "SBUX", "DHR", "DE", "MMM", "LOW", "SPGI", "ISRG", "CVS",
    "RTX", "BMY", "GILD", "ZTS", "CL", "PLD", "MS", "USB", "ADP", "ETN",
    "BDX", "ADI", "NOW", "EL", "VRTX", "REGN", "CMCSA", "C", "SO", "DUK",
    "NEE", "ECL", "APD", "SCHW", "TGT", "PNC", "HUM", "AON", "BK", "CHTR",
    "MAR", "KMB", "ROST", "DLR", "VZ", "HPQ", "EBAY", "ILMN", "AVGO", "TSM",
    "HON", "ADI", "ABT", "FIS", "PAYX", "IDXX"
]



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/financial-data")
def get_financial_data(
    ticker: str = Query(..., description="Stock ticker symbol (e.g. AAPL)"),
    period: str = Query("1mo", description="Data period (e.g. 1d, 5d, 1mo, etc.)"),
    interval: str = Query("1d", description="Data interval (e.g. 1m, 5m, 1d, etc.)")
):
    try:
        data = yf.download(ticker, period=period, interval=interval)

        if data.empty:
            raise HTTPException(status_code=404, detail="No data found for the given parameters.")

        # Flatten MultiIndex columns if necessary
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = ['_'.join(map(str, col)).strip() for col in data.columns]

        # Reset index to move date to column
        data.reset_index(inplace=True)

        # Convert all datetime columns to string
        for col in data.columns:
            if pd.api.types.is_datetime64_any_dtype(data[col]):
                data[col] = data[col].astype(str)

        # Ensure all column names are strings
        data.columns = [str(col) for col in data.columns]

        records = data.to_dict(orient="records")
        return JSONResponse(content=records)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/current-price")
def get_current_price(
    ticker: str = Query(..., description="Stock ticker symbol (e.g. AAPL)")
):
    try:
        stock = yf.Ticker(ticker)
        stock_info = stock.info
        price = stock_info.get("currentPrice")
        previous_close = stock_info.get("previousClose")
        daily_change = (price - previous_close) / previous_close * 100

        if price is None:
            raise HTTPException(status_code=404, detail="Price not available or ticker invalid")

        return {"ticker": ticker.upper(),
                "current_price": price,
                "daily_change": daily_change}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/main_index")
def get_main_index():
    try:
        indices = {
            "DJI": yf.Ticker("^DJI").info,
            "IXIC": yf.Ticker("^IXIC").info,
            "GSPC": yf.Ticker("^GSPC").info,
            "^VIX": yf.Ticker("^VIX").info
        }

        indices_return = {
            "DJI": [indices["DJI"].get("regularMarketPrice"), indices["DJI"].get("regularMarketPrice") - indices["DJI"].get("previousClose") ,(indices["DJI"].get("regularMarketPrice") - indices["DJI"].get("previousClose")) / indices["DJI"].get("previousClose") * 100],
            "IXIC": [indices["IXIC"].get("regularMarketPrice"), indices["IXIC"].get("regularMarketPrice") - indices["IXIC"].get("previousClose"), (indices["IXIC"].get("regularMarketPrice") - indices["IXIC"].get("previousClose")) / indices["IXIC"].get("previousClose") * 100],
            "GSPC": [indices["GSPC"].get("regularMarketPrice"), indices["GSPC"].get("regularMarketPrice") - indices["GSPC"].get("previousClose"), (indices["GSPC"].get("regularMarketPrice") - indices["GSPC"].get("previousClose")) / indices["GSPC"].get("previousClose") * 100],
            "^VIX": [indices["^VIX"].get("regularMarketPrice"), indices["^VIX"].get("regularMarketPrice") - indices["^VIX"].get("previousClose"), (indices["^VIX"].get("regularMarketPrice") - indices["^VIX"].get("previousClose")) / indices["^VIX"].get("previousClose") * 100]
        }
        if any(price is None for price in indices.values()):
            raise HTTPException(status_code=404, detail="One or more indices not available")

        return indices_return

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/random-stocks")
def get_random_stocks():
    try:
        selected = random.sample(TICKER_LIST, 20)
        data = []

        for ticker in selected:
            stock = yf.Ticker(ticker)
            fast_info = stock.fast_info
            info = stock.info

            current = info.get("currentPrice")
            open_price = fast_info.get("open")
            high = fast_info.get("dayHigh")
            low = fast_info.get("dayLow")
            prev_close = fast_info.get("previousClose")
            volume = fast_info.get('lastVolume')

            # print(current)
            if current is not None and prev_close is not None:
                change = round(current - prev_close, 2)
                change_percent = round((change / prev_close) * 100, 2)
            else:
                change = None
                change_percent = None

            data.append({
                "ticker": ticker,
                "company_name": info['longName'],
                "current_price": current,
                "change_amount": change,
                "change_percent": change_percent,
                "open": open_price,
                "high": high,
                "low": low,
                "volume": volume
            })

        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

def fetch_chart_data(ticker, period="3mo", interval="1d"):
    data = yf.download(ticker, period=period, interval=interval)
    if data.empty:
        raise HTTPException(status_code=404, detail="No data found for the given parameters.")

    if isinstance(data.columns, pd.MultiIndex):
        data.columns = [col[0] for col in data.columns]

    data.reset_index(inplace=True)

    for col in data.columns:
        if pd.api.types.is_datetime64_any_dtype(data[col]):
            data[col] = data[col].astype(str)

    data.columns = [str(col) for col in data.columns]

    records = data.to_dict(orient="records")
    chart_data = [
        [
            record['Date'],
            record.get('Open', None),
            record.get('Close', None),
            record.get('Low', None),
            record.get('High', None),
            record.get('Volume', None)
        ]
        for record in records
    ]

    # Get ticker info
    stock = yf.Ticker(ticker)
    info = stock.info

    result = {
        "ticker": ticker,
        "company_name": info.get("longName"),
        "chart_data": chart_data
    }

    return result


@app.get("/get-chart-data")
def get_chart_data(
    ticker: str = Query(..., description="Stock ticker symbol (e.g. AAPL)"),
    period: str = Query("3mo", description="Data period (e.g. 1d, 5d, 1mo, etc.)"),
    interval: str = Query("1d", description="Data interval (e.g. 1m, 5m, 1d, etc.)")
):
    try:
        records = fetch_chart_data(ticker, period, interval)
        return JSONResponse(content=records)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/search-stock-kline")
def search_stock(
    query: str = Query(..., description="Search query for stock ticker or company name"),
    period: str = Query("3mo", description="Data period (e.g. 1d, 5d, 1mo, etc.)"),
    interval: str = Query("1d", description="Data interval (e.g. 1m, 5m, 1d, etc.)")
):
    try:
        search = yf.Search(query).quotes
        if len(search) == 0:
            raise HTTPException(status_code=404, detail="No stocks found for the given query")
        ticker = search[0]['symbol']
        records = fetch_chart_data(ticker, period, interval)
        return JSONResponse(content=records)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/get-multi-stock-data")
def get_multi_stock_data(
    tickers: list[str] = Body(..., embed=True, description="List of stock ticker symbols")
):
    try:
        data = []
        for ticker in tickers:
            stock = yf.Ticker(ticker)
            fast_info = stock.fast_info
            info = stock.info

            current = info.get("currentPrice")
            open_price = fast_info.get("open")
            high = fast_info.get("dayHigh")
            low = fast_info.get("dayLow")
            prev_close = fast_info.get("previousClose")
            volume = fast_info.get('lastVolume')

            if current is not None and prev_close is not None:
                change = round(current - prev_close, 2)
                change_percent = round((change / prev_close) * 100, 2)
            else:
                change = None
                change_percent = None

            data.append({
                "ticker": ticker,
                "company_name": info.get('longName'),
                "current_price": current,
                "change_amount": change,
                "change_percent": change_percent,
                "open": open_price,
                "high": high,
                "low": low,
                "volume": volume
            })

        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
