import {TWaveKLineData} from "../model/TWaveKLineData";
import {Trade} from "../../model/Trade";
import {Swing} from "../model/Swing";

export function getTradeIfSignalPresent(
  e: TWaveKLineData,
  dataList: TWaveKLineData[],
): Trade | undefined {
  const current = e.marketStructure;

  if (!current) return undefined;

  const direction = current.swing === Swing.Down ? "SELL" : "BUY";
  const entry = e.close;

  let stoploss :number =0 ;
  if(current.swing === Swing.Down) {
    stoploss = dataList[current.previousSwingIndex].high
  } else if(current.swing === Swing.Up) {
    stoploss = dataList[current.previousSwingIndex].low
  }

  const metaData: Trade = {
    direction,
    entry,
    stoploss
  };

  return metaData
}
