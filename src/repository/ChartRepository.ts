import KLineData from "../common/KLineData";


export const fetchData: (symbol: string, from: number, to: number) => Promise<KLineData[]> = async (symbol: string, from: number, to: number) => {
  const resolution = "1D";
  const url = `https://vietvestors.online/v1/public/stocks/historical/${symbol}?resolution=${resolution}&from=${from / 1000}&to=${to / 1000}`;
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
      close: e.close,
    };

  });
};

export const fetchFutureData: (from: number, to: number) => Promise<FutureContract[]> = async (from: number, to: number) => {
  const url = `https://vietvestors.online/v1/public/future/oi?from=${from / 1000}&to=${to / 1000}`;
  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }
  const jsonData: FutureContract[] = await response.json();

  return jsonData;
};
