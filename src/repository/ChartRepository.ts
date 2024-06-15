import KLineData from "../common/KLineData";


export const fetchData: (symbol: string, from: number, to: number) => Promise<KLineData[]> = async (symbol: string, from: number, to: number) => {
  const resolution = "1D";
  const url = `https://vietvestors.online/v1/public/historical/${symbol}?resolution=${resolution}&from=${from / 1000}&to=${to / 1000}`;
  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }
  const jsonData = await response.json();

  const data: KLineData = [];
  for (let i = 0; i < jsonData.timestamp.length; i++) {
    const timestamp = jsonData.timestamp[i] * 1000;

    const kline: KLineData = {
      open: jsonData.open[i],
      high: jsonData.high[i],
      low: jsonData.low[i],
      close: jsonData.close[i],
      volume: jsonData.volume[i],
      timestamp: timestamp
    };
    data.push(kline);
  }

  return data;
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
