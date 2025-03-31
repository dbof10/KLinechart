import {BarType} from "../model/BarType";
import {Bar} from "../model/Bar";
import {Swing} from "../model/Swing";
import {EnumWrapper} from "../model/EnumWrapper";
import {
  calculateAccumulatedVolumeSwingDown,
  calculateAccumulatedVolumeSwingUp,
  calculateSwingDown,
  calculateSwingUp,
  INDEX_START,
  INDEX_START_SEARCH
} from "./TWaveSwing";
import {NumberWrapper} from "../model/NumberWrapper";
import {TWaveKLineData} from "../model/TWaveKLineData";


export function getBarType(bar: Bar, prevBar: Bar): BarType {

  if (bar.high > prevBar.high) {
    if (bar.low < prevBar.low)
      return BarType.Outside;
    else
      return BarType.Up;
  } else {
    if (bar.low < prevBar.low)
      return BarType.Down;
    else
      return BarType.Inisde;
  }

}

function clearPreviousDrawing(
  subgraphGannSwing: TWaveKLineData[],
  i: number,
  anchorPointIndex: number
): void {
  for (let j = i; j > anchorPointIndex; j--) {

    subgraphGannSwing[j].totalVolume = undefined
    subgraphGannSwing[j].totalDeltaVolume = undefined
    subgraphGannSwing[j].textPosition = undefined
    subgraphGannSwing[j].algo = undefined
    subgraphGannSwing[j].algo2 = undefined

  }
}


export function calculateRealtimeSwing(
  i: number,
  swingDirection: EnumWrapper<Swing>,
  p_lastSwingHighIndices: number[],
  p_lastSwingLowIndices: number[],
  prevTrendingBarIndex: NumberWrapper,
  dataList: TWaveKLineData[]
): void {

  if (swingDirection.value === Swing.Up) {
    let anchorPointIndex = INDEX_START_SEARCH;
    let lastSwingLowIndex: number;

    if (p_lastSwingLowIndices.length !== 0) {
      anchorPointIndex = p_lastSwingLowIndices[p_lastSwingLowIndices.length - 1];
      lastSwingLowIndex = anchorPointIndex;
    } else {
      anchorPointIndex = INDEX_START;
      lastSwingLowIndex = INDEX_START_SEARCH;
    }

    clearPreviousDrawing(dataList, i, anchorPointIndex);

    if (dataList[i].high > dataList[prevTrendingBarIndex.value].high || i === prevTrendingBarIndex.value || prevTrendingBarIndex.value === lastSwingLowIndex) {
      const price = dataList[i].high;
      prevTrendingBarIndex.value = i;

      calculateAccumulatedVolumeSwingUp(
        prevTrendingBarIndex.value, lastSwingLowIndex,
        dataList
      );
      // drawLabelRealtime(
      //   Array_Volume, Array_DeltaVolume, Array_Signal,
      //   Array_Signal2, drawData, prevTrendingBarIndex, price, UpText, high, low, time, Array_Atr
      // );
    } else {
      const price = dataList[prevTrendingBarIndex.value].high;

      calculateSwingUp(i, prevTrendingBarIndex.value, lastSwingLowIndex, p_lastSwingHighIndices, p_lastSwingLowIndices, dataList);
      // drawLabelRealtime(Array_Volume, Array_DeltaVolume, Array_Signal, Array_Signal2, drawData, prevTrendingBarIndex, price, UpText, high, low, time, Array_Atr);
    }
  } else if (swingDirection.value === Swing.Down) {
    let anchorPointIndex = INDEX_START_SEARCH;
    let lastSwingHighIndex: number;

    if (p_lastSwingHighIndices.length !== 0) {
      anchorPointIndex = p_lastSwingHighIndices[p_lastSwingHighIndices.length - 1];
      lastSwingHighIndex = anchorPointIndex;
    } else {
      anchorPointIndex = INDEX_START;
      lastSwingHighIndex = INDEX_START_SEARCH;
    }

    clearPreviousDrawing(dataList, i, anchorPointIndex);

    if (dataList[i].low < dataList[prevTrendingBarIndex.value].low || i === prevTrendingBarIndex.value || prevTrendingBarIndex.value === lastSwingHighIndex) {
      const price = dataList[i].low;
      prevTrendingBarIndex.value = i;


      calculateAccumulatedVolumeSwingDown(
        prevTrendingBarIndex.value,
        lastSwingHighIndex,
        dataList
      );

      // drawLabelRealtime(Array_Volume, Array_DeltaVolume,
      //   Array_Signal, Array_Signal2, drawData,
      //   prevTrendingBarIndex, price,
      //   DownText, high, low, time, Array_Atr
      // );
    } else {
      const price = dataList[prevTrendingBarIndex.value].low;

      calculateSwingDown(i,
        prevTrendingBarIndex.value, lastSwingHighIndex, p_lastSwingLowIndices,
        p_lastSwingHighIndices, dataList);
      // drawLabelRealtime(Array_Volume,
      //   Array_DeltaVolume, Array_Signal, Array_Signal2,
      //   drawData, prevTrendingBarIndex, price,
      //   DownText, high, low, time,
      //   Array_Atr
      // );
    }
  }
}
