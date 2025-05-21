import puppeteer from 'puppeteer';

export const generateCandlestickImage = async () => {

    const ohlcData = groupToOHLC(await fetchPrices('bitcoin'))  
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setContent(`
    <html>
        <head>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        </head>
        <body>
        <div id="chart" style="width:800px;height:600px;"></div>
        <script>
            const data = [{
            x: ${JSON.stringify(ohlcData.map(d => new Date(d.t).toISOString()))},
            open: ${JSON.stringify(ohlcData.map(d => d.o))},
            high: ${JSON.stringify(ohlcData.map(d => d.h))},
            low: ${JSON.stringify(ohlcData.map(d => d.l))},
            close: ${JSON.stringify(ohlcData.map(d => d.c))},
            type: 'candlestick',
            xaxis: 'x',
            yaxis: 'y'
            }];

            const layout = {
            margin: { t: 20, b: 20 },
            dragmode: false,
            xaxis: { rangeslider: { visible: false } },
            yaxis: { fixedrange: true }
            };

            Plotly.newPlot('chart', data, layout).then(() => window.renderDone = true);
        </script>
        </body>
    </html>
    `);

    await page.waitForFunction('window.renderDone === true', { timeout: 5000 });
    const chartDiv = await page.$('#chart');
    const buffer = await chartDiv.screenshot({ type: 'png' });

    await browser.close();
    return buffer;
}

export const fetchPrices = async (coin) => {
    const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=1`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Fetch error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.prices; // [[timestamp, price], ...]
}

export const groupToOHLC = (prices, intervalMinutes = 15) => {
    const interval = intervalMinutes * 60 * 1000;
    const ohlc = [];
    let candle = null;
  
    for (const [timestamp, price] of prices) {
      const t = Math.floor(timestamp / interval) * interval;
      if (!candle || candle.t !== t) {
        if (candle) ohlc.push(candle);
        candle = { t, o: price, h: price, l: price, c: price };
      } else {
        candle.h = Math.max(candle.h, price);
        candle.l = Math.min(candle.l, price);
        candle.c = price;
      }
    }
    if (candle) ohlc.push(candle);
    return ohlc;
}