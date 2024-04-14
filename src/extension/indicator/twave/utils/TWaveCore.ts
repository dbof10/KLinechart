import { BarType } from "../model/BarType";
import { Bar } from "../model/Bar";
import { Swing } from "../model/Swing";
import { EnumWrapper } from "../model/EnumWrapper";
import { DrawData } from "../model/DrawData";
import { INDEX_START, INDEX_START_SEARCH } from "./TWaveSwing";
import { NumberWrapper } from "../model/NumberWrapper";


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


export function calculateRealtimeSwing(
  i: number,
  swingLength: number,
  swingDirection: EnumWrapper<Swing>,
  p_lastSwingHighIndices: number[],
  p_lastSwingLowIndices: number[],
  drawData: DrawData,
  prevTrendingBarIndex: NumberWrapper,
  high: number[],
  low: number[]
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

   // clearPreviousDrawing(Subgraph_GannSwing, i, anchorPointIndex, drawData);

    if (high[i] > high[prevTrendingBarIndex.value] || i === prevTrendingBarIndex.value || prevTrendingBarIndex.value === lastSwingLowIndex) {
      const price = high[i];
      prevTrendingBarIndex.value = i;

      // if (EnableSwingDrawing) {
      //   Subgraph_GannSwing[i] = price;
      //   ExtColorsBuffer[i] = 0;
      // }

      // calculateAccumulatedVolumeSwingUp(Array_Volume, Array_DeltaVolume,
      //   prevTrendingBarIndex, lastSwingLowIndex, open, high, low, close, volume
      // );
      // drawLabelRealtime(
      //   Array_Volume, Array_DeltaVolume, Array_Signal,
      //   Array_Signal2, drawData, prevTrendingBarIndex, price, UpText, high, low, time, Array_Atr
      // );
    } else {
      const price = high[prevTrendingBarIndex.value];

      // if (EnableSwingDrawing) {
      //   Subgraph_GannSwing[prevTrendingBarIndex] = price;
      //   ExtColorsBuffer[prevTrendingBarIndex] = 0;
      //
      //   Subgraph_GannSwing[i] = close[i];
      //   ExtColorsBuffer[i] = 1;
      // }

     // calculateSwingUp(prevTrendingBarIndex, lastSwingLowIndex, p_lastSwingHighIndices, p_lastSwingLowIndices, Array_Volume, Array_DeltaVolume, Array_Signal, Array_Signal2, open, high, low, close, volume);
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

   // clearPreviousDrawing(Subgraph_GannSwing, i, anchorPointIndex, drawData);

    if (low[i] < low[prevTrendingBarIndex.value] || i === prevTrendingBarIndex.value || prevTrendingBarIndex.value === lastSwingHighIndex) {
      const price = low[i];
      prevTrendingBarIndex.value = i;

      // if (EnableSwingDrawing) {
      //   Subgraph_GannSwing[i] = price;
      //   ExtColorsBuffer[i] = 0;
      // }

      // calculateAccumulatedVolumeSwingDown(
      //   Array_Volume,
      //   Array_DeltaVolume,
      //   prevTrendingBarIndex,
      //   lastSwingHighIndex,
      //   open,
      //   high,
      //   low,
      //   close,
      //   volume
      // );

      // drawLabelRealtime(Array_Volume, Array_DeltaVolume,
      //   Array_Signal, Array_Signal2, drawData,
      //   prevTrendingBarIndex, price,
      //   DownText, high, low, time, Array_Atr
      // );
    } else {
      const price = low[prevTrendingBarIndex.value];

      // if (EnableSwingDrawing) {
      //   Subgraph_GannSwing[prevTrendingBarIndex] = price;
      //   ExtColorsBuffer[prevTrendingBarIndex] = 0;
      //
      //   Subgraph_GannSwing[i] = close[i];
      //   ExtColorsBuffer[i] = 1;
      // }

      // calculateSwingDown(
      //   prevTrendingBarIndex, lastSwingHighIndex, p_lastSwingLowIndices,
      //   p_lastSwingHighIndices, Array_Volume,
      //   Array_DeltaVolume, Array_Signal, Array_Signal2, open, high, low, close, volume);
      // drawLabelRealtime(Array_Volume,
      //   Array_DeltaVolume, Array_Signal, Array_Signal2,
      //   drawData, prevTrendingBarIndex, price,
      //   DownText, high, low, time,
      //   Array_Atr
      // );
    }
  }
}
