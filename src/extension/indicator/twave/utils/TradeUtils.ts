import {TextPosition} from "../model/TextPosition";
import {TWaveKLineData} from "../model/TWaveKLineData";
import {Trade} from "../../model/Trade";

export function getTradeIfSignalPresent(
  e: TWaveKLineData,
  signal1: string,
  signal2: string
): Trade | undefined {
  const current = e;

  const hasSignal = signal1.length > 0 || signal2.length > 0;
  if (!hasSignal) return undefined;

  const direction = current.textPosition === TextPosition.Up ? "SELL" : "BUY";
  const entry = current.close;

  const metaData: Trade = {
    direction,
    entry,
  };

  return metaData
}
