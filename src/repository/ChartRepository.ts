import KLineData from "../common/KLineData";


export const fetchData: (symbol: string) => Promise<KLineData[]> = async (symbol: string) => {
    const resolution = "1D";
    const from = 1609434000;
    const to = 1712885714;
    const url = `https://vietvestors.online/v1/public/stocks/historical/${symbol}?resolution=${resolution}&from=${from}&to=${to}`;

    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const jsonData: Candle[] = await response.json();

  return jsonData.map((e) => {

    return {
      timestamp: e.timestamp * 1000,
      open: e.open,
      high: e.high,
      low: e.low,
      close: e.close
    }

  })
};
