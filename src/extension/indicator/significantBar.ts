import { Indicator, IndicatorTemplate } from "../../component/Indicator";
import KLineData from "../../common/KLineData";
import averageTrueRange from "./atr";

type SBarMarker = {
  type: "UP" | "DOWN" | null;
  price: number;
};

const EMPTY: SBarMarker = { type: null, price: 0};

const SBarDetector: IndicatorTemplate<SBarMarker> = {
  name: "SBA",
  shortName: "Significant Bar",
  isOverlay: true,
  calcParams: [14, 1.25, 1.5],

  calc: (dataList: KLineData[], indicator: Indicator<SBarMarker>) => {
    const result: SBarMarker[] = [];
    const [atrLength, sBarAtrMin, sBarAtrMax] = indicator.calcParams;

    const atrIndicator = {
      name: "ATR",
      shortName: "ATR",
      calcParams: [atrLength],
      precision: 2,
      result: [],
    } as unknown as Indicator<{ atr?: number }>;

    const atrValues = averageTrueRange.calc(dataList, atrIndicator);

    for (let i = 0; i < dataList.length; i++) {
      const bar = dataList[i];
      const atrVal = atrValues[i]?.atr;

      if (i < atrLength || !atrVal || !bar.open || !bar.high || !bar.low || !bar.close) {
        result.push(EMPTY);
        continue;
      }

      const spread = bar.high - bar.low;
      const mid = (bar.high + bar.low) / 2;
      const isBullishBody = bar.close > bar.open;
      const isBearishBody = bar.close < bar.open;
      const isSpreadOK = spread > atrVal * sBarAtrMin && spread <= atrVal * sBarAtrMax;

      if (isSpreadOK && bar.close > mid && isBullishBody) {
        result.push({ type: "UP", price: bar.low});
      } else if (isSpreadOK && bar.close < mid && isBearishBody) {
        result.push({ type: "DOWN", price: bar.high });
      } else {
        result.push(EMPTY);
      }
    }

    return result;
  },

  draw: ({ ctx, xAxis, yAxis, visibleRange, indicator, kLineDataList, barSpace }) => {
    const { from, to } = visibleRange;
    const data = indicator.result;
    const halfBarWidth = Math.floor(barSpace.bar / 2);

    for (let i = from; i < to; i++) {
      const marker = data[i];
      if (!marker || !marker.type) continue;

      const bar = kLineDataList[i];
      if (!bar) continue;

      const x = xAxis.convertToPixel(i);
      const yHigh = yAxis.convertToPixel(bar.high);
      const yLow = yAxis.convertToPixel(bar.low);

      const rectX = x - halfBarWidth;
      const rectY = Math.min(yHigh, yLow);
      const rectHeight = Math.abs(yHigh - yLow);
      const rectWidth = barSpace.bar;

      // Use pre-blended RGBA for better perf
      ctx.fillStyle =
        marker.type === "UP"
          ? "rgba(0, 191, 255, 0.25)"     // DeepSkyBlue
          : "rgba(255, 165, 0, 0.25)";    // Orange

      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    }

    return false;
  }
};

export default SBarDetector;
