
export interface PositionMarker {
  direction: "BUY" | "SELL";
  entryPrice: number;
  exitPrice?: number;
  result?: "WIN" | "LOSS";
}
