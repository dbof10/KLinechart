import { Indicator, IndicatorAlertCallback, IndicatorTemplate } from "../../../component/Indicator";
import KLineData from "../../../common/KLineData";
import { getBarByIndex } from "./utils/TWaveHelper";
import { Bar } from "./model/Bar";
import { calculateRealtimeSwing, getBarType } from "./utils/TWaveCore";
import { BarType } from "./model/BarType";
import { Swing } from "./model/Swing";
import {
  canChangeDownInExceptionConditions,
  canChangeUpInExceptionConditions,
  INDEX_START,
  INDEX_START_SEARCH,
  isReachedSwingLength,
  swingTrendDown,
  swingTrendUp,
} from "./utils/TWaveSwing";
import { EnumWrapper } from "./model/EnumWrapper";
import { NumberWrapper } from "./model/NumberWrapper";
import { TWaveKLineData } from "./model/TWaveKLineData";
import { DrawData } from "./model/DrawData";
import { TextPosition } from "./model/TextPosition";
import { formatBigNumber } from "../../../common/utils/format";
import {
  SIGNAL_PULLBACK_BUY,
  SIGNAL_PULLBACK_SELL,
  SIGNAL_SPRING,
  SIGNAL_STOOGE_BUY,
  SIGNAL_STOOGE_SELL,
  SIGNAL_UPTHRUST,
} from "./utils/TWaveAlgo";
import { COLOR_DEMAND, COLOR_SUPPLY } from "../../../utils/ColorConstant";
import Nullable from "../../../common/Nullable";
import { areSameMinute, formatTimestamp } from "../../../utils/TimeUtils";
import { Alert } from "../Alert";
import { generateRandomUUID } from "../../../utils/UUID";

const SwingLength = 2;

interface TWave {
  low?: number;
  high?: number;
  totalVolume?: string;
  totalDeltaVolume?: number;
  algo?: string;
  secondAlgo?: string;
  index: string;
  textPosition?: TextPosition;
}

function onRender(dataList: TWaveKLineData[], highs: number[], lows: number[], closes: number[],
                  alertCallback: Nullable<IndicatorAlertCallback>): TWave[] {

  let prevDirectionalBarIndex: number = INDEX_START_SEARCH;
  let prevDirectionalBarType: BarType = BarType.None;
  let consecutiveBar: number = 0;
  const swingDirection: EnumWrapper<Swing> = new EnumWrapper<Swing>(Swing.None);
  const prevTrendingBarIndex: NumberWrapper = new NumberWrapper(INDEX_START_SEARCH);
  const p_lastSwingHighIndices: number[] = [];
  const p_lastSwingLowIndices: number[] = [];
  const drawData: DrawData = {};

  for (let index = 0; index < dataList.length; index++) {

    if (index < INDEX_START) {
      continue;
    }

    const currentBar: Bar = getBarByIndex(dataList[index]);
    const prevBar: Bar = getBarByIndex(dataList[index - 1]);
    const type: BarType = getBarType(currentBar, prevBar);

    calculateRealtimeSwing(index, SwingLength,
      swingDirection,
      p_lastSwingHighIndices, p_lastSwingLowIndices, drawData,
      prevTrendingBarIndex,
      highs, lows);

    if (swingDirection.value === Swing.Up && p_lastSwingLowIndices.length !== 0) {

      const lastSwingLowIndex = p_lastSwingLowIndices[p_lastSwingLowIndices.length - 1];

      if (canChangeDownInExceptionConditions(index, type, prevTrendingBarIndex.value, lastSwingLowIndex,
        SwingLength, dataList, highs, lows, closes)) {


        prevDirectionalBarIndex = index;
        prevDirectionalBarType = BarType.Down;
        consecutiveBar = 0;

        swingTrendDown(index, swingDirection, p_lastSwingHighIndices,
          p_lastSwingLowIndices,
          prevTrendingBarIndex, dataList, highs, lows);
        // DrawDebugSwingStartBar(i, "Do1", time, low);
        continue;
      }

    } else if (swingDirection.value === Swing.Down && p_lastSwingHighIndices.length != 0) {

      const lastSwingHighIndex = p_lastSwingHighIndices[p_lastSwingHighIndices.length - 1];

      if (canChangeUpInExceptionConditions(index, type, prevTrendingBarIndex.value, lastSwingHighIndex,
        SwingLength, dataList, highs, lows, closes)) {

        prevDirectionalBarIndex = index;
        prevDirectionalBarType = BarType.Up;
        consecutiveBar = 0;

        swingTrendUp(index, swingDirection, p_lastSwingLowIndices,
          p_lastSwingHighIndices, prevTrendingBarIndex, dataList, highs, lows);
        // DrawDebugSwingStartBar(i, "Up1", time, low);
        continue;
      }

    }

    if (type == BarType.Up) {
      if (prevDirectionalBarIndex === INDEX_START_SEARCH) {
        prevDirectionalBarIndex = index;
        prevDirectionalBarType = BarType.Up;
        consecutiveBar = 1;
        continue;
      }

      if (prevDirectionalBarType === BarType.Down) {
        if (swingDirection.value === Swing.Up)    //remove this condition if any bugs
        {
          if (currentBar.high >= dataList[prevTrendingBarIndex.value].high || prevTrendingBarIndex.value === index) {
            prevDirectionalBarIndex = index;
            prevDirectionalBarType = BarType.Up;
            consecutiveBar = 1;
          }
        } else {
          prevDirectionalBarIndex = index;
          prevDirectionalBarType = BarType.Up;
          consecutiveBar = 1;
        }
        continue;
      }

      const prevDirectionalBar: Bar = getBarByIndex(dataList[prevDirectionalBarIndex]);
      if (currentBar.high > prevDirectionalBar.high) {
        prevDirectionalBarIndex = index;
        prevDirectionalBarType = BarType.Up;
        consecutiveBar++;

        if (isReachedSwingLength(consecutiveBar, SwingLength)) {
          swingTrendUp(
            index, swingDirection, p_lastSwingLowIndices,
            p_lastSwingHighIndices, prevTrendingBarIndex, dataList, highs, lows);

          // DrawDebugSwingStartBar(i, "Up2", time, low);
        }
      }

    } else if (type == BarType.Down) {
      if (prevDirectionalBarIndex === INDEX_START_SEARCH) {
        prevDirectionalBarType = BarType.Down;
        consecutiveBar = 1;
        prevDirectionalBarIndex = index;
        continue;
      }
      if (prevDirectionalBarType === BarType.Up) {
        if (swingDirection.value === Swing.Down)    //remove this condition if any bugs
        {
          if (currentBar.low <= dataList[prevTrendingBarIndex.value].low || prevTrendingBarIndex.value === index) {
            prevDirectionalBarType = BarType.Down;
            consecutiveBar = 1;
            prevDirectionalBarIndex = index;
          }
        } else {
          prevDirectionalBarType = BarType.Down;
          consecutiveBar = 1;
          prevDirectionalBarIndex = index;
        }
        continue;
      }

      const prevDirectionalBar: Bar = getBarByIndex(dataList[prevDirectionalBarIndex]);
      if (currentBar.low < prevDirectionalBar.low) {
        prevDirectionalBarIndex = index;
        consecutiveBar++;
        prevDirectionalBarType = BarType.Down;
        if (isReachedSwingLength(consecutiveBar, SwingLength)) {
          swingTrendDown(
            index, swingDirection,
            p_lastSwingHighIndices,
            p_lastSwingLowIndices,
            prevTrendingBarIndex, dataList, highs, lows);

          //  DrawDebugSwingStartBar(i, "Do2", time, low);

        }

      }
    } else if (type === BarType.Outside) {
      if (currentBar.close <= prevBar.low) {
        if (prevDirectionalBarIndex == INDEX_START_SEARCH) {
          prevDirectionalBarType = BarType.Down;
          consecutiveBar = 1;
          prevDirectionalBarIndex = index;
          continue;
        }
        if (prevDirectionalBarType == BarType.Down) {
          const prevDirectionalBar: Bar = getBarByIndex(dataList[prevDirectionalBarIndex]);

          if (currentBar.low < prevDirectionalBar.low) {
            prevDirectionalBarIndex = index;
            prevDirectionalBarType = BarType.Down;
            consecutiveBar++;
            if (isReachedSwingLength(consecutiveBar, SwingLength)) {

              swingTrendDown(
                index, swingDirection,
                p_lastSwingHighIndices,
                p_lastSwingLowIndices,
                prevTrendingBarIndex, dataList, highs, lows);
              // DrawDebugSwingStartBar(i, "Do3", time, low);

            }
          }
        } else if (prevDirectionalBarType == BarType.Up) {
          prevDirectionalBarType = BarType.Down;
          prevDirectionalBarIndex = index;
          consecutiveBar = 1;
        }
        continue;
      } else if (currentBar.close >= prevBar.high) {
        if (prevDirectionalBarIndex == INDEX_START_SEARCH) {
          prevDirectionalBarType = BarType.Up;
          consecutiveBar = 1;
          prevDirectionalBarIndex = index;
          continue;
        }
        if (prevDirectionalBarType == BarType.Up) {
          const prevDirectionalBar: Bar = getBarByIndex(dataList[prevDirectionalBarIndex]);

          if (currentBar.high > prevDirectionalBar.high) {
            prevDirectionalBarIndex = index;
            prevDirectionalBarType = BarType.Up;
            consecutiveBar++;

            if (isReachedSwingLength(consecutiveBar, SwingLength)) {
              swingTrendUp(index, swingDirection,
                p_lastSwingLowIndices, p_lastSwingHighIndices, prevTrendingBarIndex, dataList, highs, lows);
              // DrawDebugSwingStartBar(i, "Up3", time, low);
            }
          }

        } else if (prevDirectionalBarType == BarType.Down) {
          prevDirectionalBarType = BarType.Up;
          prevDirectionalBarIndex = index;
          consecutiveBar = 1;
        }
        continue;
      }
      if (prevDirectionalBarType == BarType.Up) {
        const prevDirectionalBar: Bar = getBarByIndex(dataList[prevDirectionalBarIndex]);
        if (currentBar.high > prevDirectionalBar.high && currentBar.close > prevDirectionalBar.low
          && prevTrendingBarIndex.value !== index) {

          prevDirectionalBarType = BarType.Up;
          prevDirectionalBarIndex = index;
          consecutiveBar++;

          if (isReachedSwingLength(consecutiveBar, SwingLength)) {
            swingTrendUp(index, swingDirection,
              p_lastSwingLowIndices, p_lastSwingHighIndices, prevTrendingBarIndex, dataList, highs, lows);
            // DrawDebugSwingStartBar(i, "Up4", time, low);
          }
        }

      } else if (prevDirectionalBarType == BarType.Down) {
        const prevDirectionalBar: Bar = getBarByIndex(dataList[prevDirectionalBarIndex]);
        if (currentBar.low < prevDirectionalBar.low && currentBar.close < prevDirectionalBar.high
          && prevTrendingBarIndex.value !== index) {
          prevDirectionalBarType = BarType.Down;
          prevDirectionalBarIndex = index;
          consecutiveBar++;
          if (isReachedSwingLength(consecutiveBar, SwingLength)) {
            swingTrendDown(
              index, swingDirection,
              p_lastSwingHighIndices,
              p_lastSwingLowIndices,
              prevTrendingBarIndex, dataList, highs, lows);
            //   DrawDebugSwingStartBar(i, "Do4", time, low);
          }
        }
      }
    }
  }

  return dataList.map((e: TWaveKLineData, index: number) => {
    const twave: TWave = { index: index.toString() };
    if (e.totalVolume !== undefined && e.totalDeltaVolume !== undefined) {
      twave.totalVolume = formatBigNumber(e.totalVolume);
      twave.totalDeltaVolume = formatBigNumber(e.totalDeltaVolume);
      twave.textPosition = e.textPosition;
      const signal1 = signalToString(e.algo);
      const signal2 = signalToString(e.algo2);
      if (signal1.length > 0 || signal2.length > 0) {
        const current = Date.now();
        if (areSameMinute(e.timestamp, current)) {
          const alert: Alert = {
            id: e.timestamp.toString() + "_" + generateRandomUUID(),
            message: `Alert signal ${signal1} ${signal2} at ${formatTimestamp(e.timestamp)}`,
          };
          alertCallback(alert);
        }
      }
      twave.algo = signal1;
      twave.secondAlgo = signal2;
    }
    twave.high = e.high;
    twave.low = e.low;
    return twave;
  });


}

function signalToString(value?: number): string {
  if (value === undefined) {
    return "";
  }
  switch (value) {
    case SIGNAL_STOOGE_SELL:
    case SIGNAL_STOOGE_BUY:
      return "#";
    case SIGNAL_SPRING:
      return "SP";
    case SIGNAL_UPTHRUST:
      return "UT";
    case SIGNAL_PULLBACK_BUY:
    case SIGNAL_PULLBACK_SELL:
      return "PB";
    default:
      return "";
  }
}

const TWave: IndicatorTemplate<TWave> = {
  name: "TWA",
  shortName: "TWave",
  isOverlay: true,
  calc: (dataList: KLineData[], _: Indicator<TWave>, alertCallback: Nullable<IndicatorAlertCallback<Alert>>) => {

    const extendedData: TWaveKLineData[] = [];
    const highs: number[] = [];
    const lows: number[] = [];
    const closes: number[] = [];

    dataList.forEach((e: KLineData) => {
      const item = {
        open: e.open,
        high: e.high,
        low: e.low,
        close: e.close,
        volume: e.volume,
        timestamp: e.timestamp,
        bidVol: e.bidVol,
        askVol: e.askVol,
      };
      extendedData.push(item);
      highs.push(e.high);
      lows.push(e.low);
      closes.push(e.close);
    });
    return onRender(extendedData, highs, lows, closes, alertCallback);
  },
  draw: ({
           ctx,
           barSpace,
           visibleRange,
           indicator,
           xAxis,
           yAxis,
         }) => {
    const { from, to } = visibleRange;

    const fontSize = 14;
    ctx.font = `${fontSize}px Helvetica Neue`;
    ctx.textAlign = "center";
    const result = indicator.result;
    for (let i = from; i < to; i++) {
      const data = result[i];
      const x = xAxis.convertToPixel(i);

      if (data.totalVolume !== undefined) {
        const yBottom = yAxis.convertToPixel(data.low!);
        const yTop = yAxis.convertToPixel(data.high!);
        if (data.textPosition === TextPosition.Up) {
          ctx.fillStyle = COLOR_DEMAND;

          const initialPadding = yTop - 10 - fontSize;
          ctx.fillText(data.totalDeltaVolume?.toString(), x, initialPadding);
          if (data.algo?.length > 0) {
            ctx.fillText(data.algo!, x, initialPadding - 15 - fontSize);
          }
          if (data.secondAlgo?.length > 0) {
            ctx.fillText(data.secondAlgo!, x, initialPadding - 30 - fontSize);
          }
        } else {
          ctx.fillStyle = COLOR_SUPPLY;

          const initialPadding = yBottom + 10 + fontSize;
          ctx.fillText(data.totalDeltaVolume?.toString(), x, initialPadding);
          if (data.algo?.length > 0) {
            ctx.fillText(data.algo!, x, initialPadding + 15 + fontSize);
          }
          if (data.secondAlgo?.length > 0) {
            ctx.fillText(data.secondAlgo!, x, initialPadding + 30 + fontSize);
          }
        }
      }
    }
    return false;
  },
};

export default TWave;
