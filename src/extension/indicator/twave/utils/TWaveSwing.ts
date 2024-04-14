import { Swing } from "../model/Swing";
import { getBarByIndex, getIndexOfHighestValue, getIndexOfLowestValue } from "./TWaveHelper";
import { EnumWrapper } from "../model/EnumWrapper";
import { NumberWrapper } from "../model/NumberWrapper";
import { TWaveKLineData } from "../model/TWaveKLineData";
import { BarType } from "../model/BarType";
import { Bar } from "../model/Bar";
import KLineData from "../../../../common/KLineData";
import { TextPosition } from "../model/TextPosition";
import { calculateBuyAlgo, calculateSellAlgo } from "./TWaveAlgo";

export const INDEX_START = 20;
export const INDEX_START_SEARCH = -1;
const PrimaryDivisor = 1;
const THRESHOLD_NO_NEW_TRENDING_BAR: number = 4;
const PERCENTAGE_TREND_REMAIN: number = 0.5;

export function isReachedSwingLength(consecutiveBar: number, swingLength: number): boolean {
  return consecutiveBar === swingLength;
}


export function swingTrendUp(
  i: number,
  swingDirection: EnumWrapper<Swing>,
  p_lastSwingLowIndices: number[],
  p_lastSwingHighIndices: number[],
  prevTrendingBarIndex: NumberWrapper,
  data: TWaveKLineData[],
  highs: number[],
  lows: number[]): void {

  if (swingDirection.value === Swing.None || swingDirection.value === Swing.Down) {

    let lastSwingHighIndex: number;

    if (p_lastSwingHighIndices.length === 0) {
      lastSwingHighIndex = INDEX_START_SEARCH;
    } else {
      lastSwingHighIndex = p_lastSwingHighIndices[p_lastSwingHighIndices.length - 1];
    }

    let lastSwingLowIndex: number;

    if (prevTrendingBarIndex.value === INDEX_START_SEARCH) {

      lastSwingLowIndex = getIndexOfLowestValue(lows, i, i - INDEX_START);
      prevTrendingBarIndex.value = i;
    } else {
      lastSwingLowIndex = prevTrendingBarIndex.value;
      prevTrendingBarIndex.value = i;
    }

    // let price: number = data[lastSwingLowIndex].low;
    swingDirection.value = Swing.Up;


    calculateSwingDown(lastSwingLowIndex, lastSwingHighIndex, p_lastSwingLowIndices,
      p_lastSwingHighIndices, data);
    // drawLabel(Array_Volume, Array_DeltaVolume, Array_Signal, Array_Signal2, lastSwingLowIndex, price, DownText, high, low, time, Array_Atr);

    p_lastSwingLowIndices.push(lastSwingLowIndex); // add later we compare new low to previous 2 lows
  }
}

function calculateSwingDown(lastSwingLowIndex: number,
                            lastSwingHighIndex: number,
                            p_lastSwingLowIndices: number[],
                            p_lastSwingHighIndices: number[],
                            data: TWaveKLineData[]): void {

  if (lastSwingLowIndex > lastSwingHighIndex && lastSwingLowIndex !== INDEX_START_SEARCH &&
    lastSwingHighIndex !== INDEX_START_SEARCH) {

    calculateAccumulatedVolumeSwingDown(lastSwingLowIndex, lastSwingHighIndex, data);
    calculateBuyAlgo(lastSwingLowIndex, p_lastSwingLowIndices, p_lastSwingHighIndices, data);
  }
}

function calculateAccumulatedVolumeSwingDown(
  lastSwingLowIndex: number,
  lastSwingHighIndex: number,
  data: TWaveKLineData[]): void {

  if (lastSwingLowIndex > lastSwingHighIndex && lastSwingLowIndex !== INDEX_START_SEARCH &&
    lastSwingHighIndex !== INDEX_START_SEARCH) {

    let totalVolume: number = 0;
    let ask: number = 0;
    let bid: number = 0;

    for (let i = lastSwingHighIndex; i <= lastSwingLowIndex; i++) {
      totalVolume += data[i].volume;
      ask += data[i].askVol;
      bid += data[i].bidVol;
    }

    const delta = ask - bid;

    //  if (IS_DEBUG_BAR) {
    //   Array_Volume[lastSwingLowIndex] = lastSwingLowIndex;
    // } else {

    data[lastSwingLowIndex].totalVolume = totalVolume / PrimaryDivisor;
    data[lastSwingLowIndex].totalDeltaVolume = delta / PrimaryDivisor;
    data[lastSwingLowIndex].textPosition = TextPosition.Down;
    // }
  }
}


export function swingTrendDown(
  i: number,
  swingDirection: EnumWrapper<Swing>,
  p_lastSwingHighIndices: number[],
  p_lastSwingLowIndices: number[],
  prevTrendingBarIndex: NumberWrapper,
  data: TWaveKLineData[],
  highs: number[],
  lows: number[]): void {

  if (swingDirection.value === Swing.None || swingDirection.value === Swing.Up) {

    let lastSwingLowIndex: number;

    if (p_lastSwingLowIndices.length === 0) {
      lastSwingLowIndex = INDEX_START_SEARCH;
    } else {
      lastSwingLowIndex = p_lastSwingLowIndices[p_lastSwingLowIndices.length - 1];
    }

    let lastSwingHighIndex: number;

    if (prevTrendingBarIndex.value === INDEX_START_SEARCH) {
      lastSwingHighIndex = getIndexOfHighestValue(highs, i, i - INDEX_START);
      prevTrendingBarIndex.value = i;
    } else {
      lastSwingHighIndex = prevTrendingBarIndex.value;
      prevTrendingBarIndex.value = i;
    }

    // let price: number = data[lastSwingHighIndex].height;
    swingDirection.value = Swing.Down;

    calculateSwingUp(lastSwingHighIndex, lastSwingLowIndex,
      p_lastSwingHighIndices, p_lastSwingLowIndices, data);

    p_lastSwingHighIndices.push(lastSwingHighIndex); // add later we compare new high to previous 2 highs
  }
}

function calculateSwingUp(lastSwingHighIndex: number,
                          lastSwingLowIndex: number,
                          p_lastSwingHighIndices: number[],
                          p_lastSwingLowIndices: number[],
                          data: TWaveKLineData[]): void {

  if (lastSwingHighIndex > lastSwingLowIndex && lastSwingLowIndex !== INDEX_START_SEARCH &&
    lastSwingHighIndex !== INDEX_START_SEARCH) {

    calculateAccumulatedVolumeSwingUp(lastSwingHighIndex, lastSwingLowIndex, data);
    calculateSellAlgo(lastSwingHighIndex, p_lastSwingHighIndices, p_lastSwingLowIndices, data);
  }
}

function calculateAccumulatedVolumeSwingUp(lastSwingHighIndex: number,
                                           lastSwingLowIndex: number,
                                           data: TWaveKLineData[]): void {

  if (lastSwingHighIndex > lastSwingLowIndex && lastSwingLowIndex !== INDEX_START_SEARCH &&
    lastSwingHighIndex !== INDEX_START_SEARCH) {

    let totalVolume: number = 0;
    let ask: number = 0;
    let bid: number = 0;

    for (let i = lastSwingLowIndex; i <= lastSwingHighIndex; i++) {
      totalVolume += data[i].volume;
      ask += data[i].askVol;
      bid += data[i].bidVol;
    }

    const delta = ask - bid;


    data[lastSwingHighIndex].totalVolume = totalVolume / PrimaryDivisor;
    data[lastSwingHighIndex].totalDeltaVolume = delta / PrimaryDivisor;
    data[lastSwingHighIndex].textPosition = TextPosition.Up;

  }
}

export function canChangeDownInExceptionConditions(
  i: number,
  type: BarType,
  prevTrendingBarIndex: number,
  lastSwingLowIndex: number,
  swingLength: number,
  data: KLineData[],
  high: number[],
  low: number[],
  close: number[],
): boolean {
  const cond1: boolean = low[i] < low[lastSwingLowIndex];

  const currentSpread: number = high[i] - low[i];
  const prevSpread: number = high[i - 1] - low[i - 1];

  const currentBar: Bar = getBarByIndex(data[i]);
  const prevBar: Bar = getBarByIndex(data[i - 1]);

  const distance: number = i - prevTrendingBarIndex;

  const cond2: boolean = i - lastSwingLowIndex > swingLength;

  if (cond1) {
    return currentBar.close < prevBar.close && cond2;
  } else {
    let cond3: boolean = false;

    if (prevSpread === 0) {
      return false;
    }

    if (distance > THRESHOLD_NO_NEW_TRENDING_BAR) {
      const lowestCloseIdx: number = getIndexOfLowestValue(close, i, THRESHOLD_NO_NEW_TRENDING_BAR);
      const lowestLowIdx: number = getIndexOfLowestValue(low, i, THRESHOLD_NO_NEW_TRENDING_BAR);
      cond3 = currentBar.close < prevBar.low && lowestCloseIdx === i && lowestLowIdx === i &&
        (type === BarType.Down || type === BarType.Outside);
    } else if (distance >= THRESHOLD_NO_NEW_TRENDING_BAR) {
      const lowestCloseIdx: number = getIndexOfLowestValue(close, i, THRESHOLD_NO_NEW_TRENDING_BAR * swingLength);
      const lowestLowIdx: number = getIndexOfLowestValue(low, i, THRESHOLD_NO_NEW_TRENDING_BAR * swingLength);

      const hasBiggerSpread: boolean = (currentSpread / prevSpread) >= 2;

      const trendRemainThreshold: number = high[i - 1] - prevSpread * PERCENTAGE_TREND_REMAIN;

      const hasCurrentBarGoodContinuation: boolean = high[i] < trendRemainThreshold;

      cond3 = lowestCloseIdx === i && (type === BarType.Down || type === BarType.Outside) && hasBiggerSpread && hasCurrentBarGoodContinuation &&
        lowestLowIdx === i;
    }

    return cond3;
  }
}


export function canChangeUpInExceptionConditions(
  i: number,
  type: BarType,
  prevTrendingBarIndex: number,
  lastSwingHighIndex: number,
  swingLength: number,
  data: KLineData[],
  high: number[],
  low: number[],
  close: number[],
): boolean {
  const cond1: boolean = high[i] > high[lastSwingHighIndex];

  const distance: number = i - prevTrendingBarIndex;
  const currentSpread: number = high[i] - low[i];
  const prevSpread: number = high[i - 1] - low[i - 1];

  const currentBar: Bar = getBarByIndex(data[i]);
  const prevBar: Bar = getBarByIndex(data[i - 1]);
  const cond2: boolean = i - lastSwingHighIndex > swingLength;

  if (cond1) {
    return currentBar.close > prevBar.close && cond2;
  } else {
    let cond3: boolean = false;

    if (prevSpread === 0) {
      return false;
    }

    if (distance > THRESHOLD_NO_NEW_TRENDING_BAR) {
      const highestCloseIdx: number = getIndexOfHighestValue(close, i, THRESHOLD_NO_NEW_TRENDING_BAR);
      const highestHighIdx: number = getIndexOfHighestValue(high, i, THRESHOLD_NO_NEW_TRENDING_BAR);
      const hasBiggerSpread: boolean = (currentSpread / prevSpread) >= 1;

      cond3 = (currentBar.close > prevBar.high) && highestCloseIdx === i && highestHighIdx === i &&
        (type === BarType.Up || type === BarType.Outside) && hasBiggerSpread;
    } else if (distance >= THRESHOLD_NO_NEW_TRENDING_BAR) {
      const highestCloseIdx: number = getIndexOfHighestValue(close, i, THRESHOLD_NO_NEW_TRENDING_BAR * swingLength);
      const highestHighIdx: number = getIndexOfHighestValue(high, i, THRESHOLD_NO_NEW_TRENDING_BAR * swingLength);
      const hasBiggerSpread: boolean = (currentSpread / prevSpread) >= 2;
      const trendRemainThreshold: number = low[i - 1] + prevSpread * PERCENTAGE_TREND_REMAIN;
      const hasCurrentBarGoodContinuation: boolean = low[i] > trendRemainThreshold;

      cond3 = highestCloseIdx === i &&
        (type === BarType.Up || type === BarType.Outside) && hasBiggerSpread && hasCurrentBarGoodContinuation
        && highestHighIdx === i;
    }

    return cond3;
  }
}



