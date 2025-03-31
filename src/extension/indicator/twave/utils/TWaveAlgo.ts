import {getBarByIndex} from "./TWaveHelper";
import {TWaveKLineData} from "../model/TWaveKLineData";
import {Swing} from "../model/Swing";

const LIMIT_SWING_COMPARISON = 2;

export const SIGNAL_STOOGE_BUY = 3000;
export const SIGNAL_STOOGE_SELL = 3001;
export const SIGNAL_SPRING = 3002;
export const SIGNAL_UPTHRUST = 3003;
export const SIGNAL_PULLBACK_BUY = 3004;
export const SIGNAL_PULLBACK_SELL = 3005;
export const LIMIT_BARS_FORM_ALGO = 2 // min distance to show algo to avoid noise


export function calculateSellAlgo(
  currentIndex: number,
  currentSwingHighIndex: number,
  p_lastSwingHighIndices: number[],
  p_lastSwingLowIndices: number[],
  data: TWaveKLineData[],
): void {


  const size = p_lastSwingHighIndices.length;

  let algoCount = 0;
  if (size > LIMIT_SWING_COMPARISON) {
    const prevIndex: number = p_lastSwingHighIndices.pop()!;
    const prevprevIndex = p_lastSwingHighIndices[p_lastSwingHighIndices.length - 1];
    p_lastSwingHighIndices.push(prevIndex);

    const currentBar = getBarByIndex(data[currentSwingHighIndex]);
    const prevBar = getBarByIndex(data[currentSwingHighIndex - 1]);
    const prevSwingBar = getBarByIndex(data[prevIndex]);

    const prevDeltaVolume = data[prevIndex].totalDeltaVolume;
    const prevprevDeltaVolume = data[prevprevIndex].totalDeltaVolume;
    const currentDeltaVolume = data[currentSwingHighIndex].totalDeltaVolume;

    const distanceToNearPivot = currentSwingHighIndex - p_lastSwingLowIndices[p_lastSwingLowIndices.length - 1];

    // Pullback algo
    if (p_lastSwingLowIndices.length > LIMIT_SWING_COMPARISON) {
      const prevLowIndex: number = p_lastSwingLowIndices.pop()!;
      const prevprevLowIndex = p_lastSwingLowIndices[p_lastSwingLowIndices.length - 1];
      p_lastSwingLowIndices.push(prevLowIndex);

      const prevLowDeltaVolume = data[prevLowIndex].totalDeltaVolume;
      const prevprevLowDeltaVolume = data[prevprevLowIndex].totalDeltaVolume;

      const cob = prevLowDeltaVolume < prevprevLowDeltaVolume;
      const demandDryup = currentDeltaVolume < prevDeltaVolume;

      if (demandDryup && currentBar.high < prevSwingBar.low && cob &&
        distanceToNearPivot > LIMIT_BARS_FORM_ALGO) {
        data[currentSwingHighIndex].algo = SIGNAL_PULLBACK_SELL;
        data[currentIndex].marketStructure = {
          swing: Swing.Down,
          confirmationBarIndex : currentIndex,
          previousSwingIndex: currentSwingHighIndex
        }
        algoCount++;
      }
    }

    // Upthrust algo
    if (currentBar.high > prevSwingBar.high && currentBar.close < prevSwingBar.high &&
      currentBar.close < prevBar.close && currentBar.volume > prevBar.volume) {
      if (algoCount > 0) {
        data[currentSwingHighIndex].algo2 = SIGNAL_UPTHRUST;
      } else {
        data[currentSwingHighIndex].algo = SIGNAL_UPTHRUST;
      }
      algoCount++;
    }

    if (currentDeltaVolume < prevDeltaVolume && prevDeltaVolume < prevprevDeltaVolume && distanceToNearPivot > LIMIT_BARS_FORM_ALGO) {
      if (algoCount > 0) {
        data[currentSwingHighIndex].algo2 = SIGNAL_STOOGE_SELL;
      } else {
        data[currentSwingHighIndex].algo = SIGNAL_STOOGE_SELL;
      }
      algoCount++;
    }
  }
}


export function calculateBuyAlgo(
  currentIndex : number,
  currentSwingLowIndex: number,
  p_lastSwingLowIndices: number[],
  p_lastSwingHighIndices: number[],
  data: TWaveKLineData[],
): void {

  const size = p_lastSwingLowIndices.length;

  let algoCount = 0;
  if (size > LIMIT_SWING_COMPARISON) {
    const prevIndex: number = p_lastSwingLowIndices.pop()!;
    const prevprevIndex = p_lastSwingLowIndices[p_lastSwingLowIndices.length - 1];
    p_lastSwingLowIndices.push(prevIndex);

    const currentBar = getBarByIndex(data[currentSwingLowIndex]);
    const prevBar = getBarByIndex(data[currentSwingLowIndex - 1]);
    const prevSwingBar = getBarByIndex(data[prevIndex]);

    const prevDeltaVolume = data[prevIndex].totalDeltaVolume;
    const prevprevDeltaVolume = data[prevprevIndex].totalDeltaVolume;
    const currentDeltaVolume = data[currentSwingLowIndex].totalDeltaVolume;

    // Pullback algo
    const distanceToNearPivot = currentSwingLowIndex - p_lastSwingHighIndices[p_lastSwingHighIndices.length - 1];
    if (p_lastSwingHighIndices.length > LIMIT_SWING_COMPARISON) {
      const prevHighIndex: number = p_lastSwingHighIndices.pop()!;
      const prevprevHighIndex = p_lastSwingHighIndices[p_lastSwingHighIndices.length - 1];
      p_lastSwingHighIndices.push(prevHighIndex);

      const prevHighDeltaVolume = data[prevHighIndex].totalDeltaVolume;
      const prevprevHighDeltaVolume = data[prevprevHighIndex].totalDeltaVolume;

      const cob = prevHighDeltaVolume > prevprevHighDeltaVolume;
      const supplyDryup = currentDeltaVolume > prevDeltaVolume;
      if (supplyDryup && currentBar.low > prevSwingBar.high && cob &&
        distanceToNearPivot > LIMIT_BARS_FORM_ALGO) {
        data[currentSwingLowIndex].algo = SIGNAL_PULLBACK_BUY;
        data[currentIndex].marketStructure = {
          swing: Swing.Up,
          confirmationBarIndex : currentIndex,
          previousSwingIndex: currentSwingLowIndex
        }
        algoCount++;
      }
    }

    // Spring algo
    if (currentBar.low < prevSwingBar.low && currentBar.close > prevSwingBar.low &&
      currentBar.close > prevBar.close && currentBar.volume > prevBar.volume) {
      if (algoCount > 0) {
        data[currentSwingLowIndex].algo2 = SIGNAL_SPRING;
      } else {
        data[currentSwingLowIndex].algo = SIGNAL_SPRING;
      }
      data[currentIndex].marketStructure = {
        swing: Swing.Up,
        confirmationBarIndex : currentIndex,
        previousSwingIndex: currentSwingLowIndex
      }

      algoCount++;
    }

    if (currentDeltaVolume > prevDeltaVolume && prevDeltaVolume > prevprevDeltaVolume &&
      distanceToNearPivot > LIMIT_BARS_FORM_ALGO ) {
      if (algoCount > 0) {
        data[currentSwingLowIndex].algo2 = SIGNAL_STOOGE_BUY;
      } else {
        data[currentSwingLowIndex].algo = SIGNAL_STOOGE_BUY;
      }
      data[currentIndex].marketStructure = {
        swing: Swing.Up,
        confirmationBarIndex : currentIndex,
        previousSwingIndex: currentSwingLowIndex
      }
      algoCount++;
    }
  }
}
