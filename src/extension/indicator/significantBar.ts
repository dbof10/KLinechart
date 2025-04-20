import {Indicator, IndicatorTemplate} from "../../component/Indicator";
import KLineData from "../../common/KLineData";
import {COLOR_DEMAND, COLOR_SUPPLY} from "../../utils/ColorConstant";

const BOX_ALPHA = 0.2;


function drawTradeTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  direction: "UP" | "DOWN",
  color: string
) {
  ctx.beginPath();
  if (direction === "UP") {
    ctx.moveTo(x, y);
    ctx.lineTo(x - size, y + size);
    ctx.lineTo(x + size, y + size);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x - size, y - size);
    ctx.lineTo(x + size, y - size);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}


function drawRectWithAlpha(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  alpha: number
) {

  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fillRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
  ctx.globalAlpha = 1.0;
}


type SBarResult = {
  upSBar?: number;
  downSBar?: number;
  comboBox?: {
    from: number;
    to: number;
    high: number;
    low: number;
    color: string;
  };
};

const TBar: IndicatorTemplate<SBarResult> = {
  name: "SBA",
  shortName: "TBar",
  isOverlay: true,
  calcParams: [14, 1.25], // ATR period, multiplier

  calc: (dataList: KLineData[], indicator: Indicator<SBarResult>, params) => {
    const atrPeriod = indicator.calcParams[0];
    const multiplier = indicator.calcParams[1];

    const result: SBarResult[] = [];
    const atrList: number[] = [];
    const comboSeries: number[] = [];
    let direction: 1 | -1 | 0 = 0;

    const sma = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    for (let i = 0; i < dataList.length; i++) {
      const item = dataList[i];
      const prev = dataList[i - 1];

      const high = item.high;
      const low = item.low;
      const open = item.open;
      const close = item.close;
      const spread = high - low;

      // ATR
      const tr =
        i === 0
          ? high - low
          : Math.max(
            high - low,
            Math.abs(high - prev.close),
            Math.abs(low - prev.close)
          );
      atrList.push(tr);
      if (atrList.length > atrPeriod) atrList.shift();
      const atr = sma(atrList);

      const isBullish = close > open && close >= (prev?.close ?? 0);
      const isBearish = close < open && close <= (prev?.close ?? 0);
      const isInsideBar = prev && high < prev.high && low > prev.low;
      const commits =
        (isBullish && close > low + spread / 2) ||
        (isBearish && close < high - spread / 2);
      const isSBar = spread > atr * multiplier && !isInsideBar && commits;

      const barResult: SBarResult = {};

      if (isSBar) {
        if (isBullish) barResult.upSBar = low;
        if (isBearish) barResult.downSBar = high;

        if (comboSeries.length > 1) {
          const first = comboSeries[0];
          const last = comboSeries[comboSeries.length - 1];
          const firstBar = dataList[first];
          const lastBar = dataList[last];

          const comboHigh = direction === 1 ? lastBar.high : firstBar.high;
          const comboLow = direction === 1 ? firstBar.low : lastBar.low;
          const comboSpread = Math.abs(comboHigh - comboLow);

          const avgATR =
            comboSeries.reduce((sum, idx) => sum + (atrList[idx] ?? atr), 0) /
            comboSeries.length;

          const comboClose = lastBar.close;
          const comboCommits =
            (comboClose > comboLow + comboSpread / 2) ||
            (comboClose < comboHigh - comboSpread / 2);

          if (comboSpread > avgATR * multiplier && comboCommits) {
            for (let j = result.length; j <= last; j++) result.push({});
            result[last].comboBox = {
              from: first,
              to: last,
              high: comboHigh,
              low: comboLow,
              color: direction === 1 ? COLOR_DEMAND : COLOR_SUPPLY
            };
          }
        }

        comboSeries.length = 0;
        result.push(barResult);
        continue;
      }

      // Combo logic
      if (comboSeries.length === 0) {
        comboSeries.push(i);
      } else {
        const last = comboSeries[comboSeries.length - 1];
        const lastBar = dataList[last];
        const lastBullish = lastBar.close > lastBar.open;
        const lastBearish = lastBar.close < lastBar.open;

        const sameDirection =
          (isBullish && lastBullish) || (isBearish && lastBearish);
        const structural =
          (isBullish && (high > lastBar.high || isInsideBar)) ||
          (isBearish && (low < lastBar.low || isInsideBar));

        if (sameDirection && structural) {
          direction = isBullish ? 1 : -1;
          comboSeries.push(i);
        } else {
          comboSeries.length = 0;
          comboSeries.push(i);
        }
      }

      result.push(barResult);
    }

    return result;
  },

  draw: ({ctx, xAxis, yAxis, visibleRange, indicator}) => {
    const {from, to} = visibleRange;
    const data = indicator.result;

    for (let i = from; i < to; i++) {
      const d = data[i];
      if (!d) continue;

      const x = xAxis.convertToPixel(i);

      if (d.upSBar) {
        const y = yAxis.convertToPixel(d.upSBar);
        drawTradeTriangle(ctx, x, y + 6, 6, "UP", COLOR_DEMAND);
      }

      if (d.downSBar) {
        const y = yAxis.convertToPixel(d.downSBar);
        drawTradeTriangle(ctx, x, y - 6, 6, "DOWN", COLOR_SUPPLY);
      }

      if (d.comboBox) {
        const {from: boxFrom, to: boxTo, high, low, color} = d.comboBox;
        if (boxTo >= visibleRange.from && boxFrom <= visibleRange.to) {
          const x1 = xAxis.convertToPixel(boxFrom);
          const x2 = xAxis.convertToPixel(boxTo);
          const y1 = yAxis.convertToPixel(high);
          const y2 = yAxis.convertToPixel(low);
          drawRectWithAlpha(ctx, x1, y1, x2, y2, color, BOX_ALPHA);
        }
      }
    }

    return false;
  }
};

export default TBar;

