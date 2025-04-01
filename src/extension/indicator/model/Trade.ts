
export interface Trade {
  direction: 'BUY' | 'SELL';
  entry: number;
  stoploss?: number
}
