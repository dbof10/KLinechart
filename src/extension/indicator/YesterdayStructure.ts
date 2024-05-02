import type { IndicatorTemplate } from "../../component/Indicator";
import { areSameDay } from "../../utils/TimeUtils";
import { COLOR_LIGHT_GRAY } from "../../utils/ColorConstant";


type HiLo = {
  high?: number
  low?: number
  newDay?: boolean
}

export const YesterdayStructure: IndicatorTemplate<HiLo> = {
  name: "YEST",
  isOverlay: true,
  calc: (kLineDataList) => {

    let currentDay: number;

    const indi: HiLo[] = [];

    let high: number;
    let low: number;

    let localHilo: HiLo;

    for (let i = 0; i < kLineDataList.length; i++) {
      const value = kLineDataList[i];
      const hilo: HiLo = {};
      currentDay = value.timestamp;
      if (i === 0) {
        high = value.high;
        low = value.low;
        indi.push(hilo);
        continue;
      }

      const prevData = kLineDataList[i - 1];
      const prevDate = prevData.timestamp;

      if (areSameDay(currentDay, prevDate)) {

        if (value.high > high) {
          high = value.high;
        }

        if (value.low < low) {
          low = value.low;
        }
        if (localHilo) {
          hilo.high = localHilo.high;
          hilo.low = localHilo.low;
          hilo.newDay = false;
        }
      } else {
        localHilo = {
          high,
          low,
        };
        high = value.high;
        low = value.low;

        if (localHilo) {
          hilo.high = localHilo.high;
          hilo.low = localHilo.low;
          hilo.newDay = true;
        }
      }

      indi.push(hilo);
    }

    return indi;
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

    ctx.font = `12px Helvetica Neue`;
    ctx.textAlign = "left";
    const result: HiLo[] = indicator.result;
    for (let i = from; i < to; i++) {
      const data = result[i];

      const x = xAxis.convertToPixel(i);

      ctx.fillStyle = COLOR_LIGHT_GRAY;
      const space = barSpace.gapBar / 2;

      if (data.high && data.low) {
        const yHigh = yAxis.convertToPixel(data.high);
        ctx.fillRect(x, yHigh, barSpace.bar - space, 1);
        const yLow = yAxis.convertToPixel(data.low);
        ctx.fillRect(x, yLow, barSpace.bar - space, 1);
        if (data.newDay) {
          ctx.fillText("Yesterday Low", x, yLow + 15);
          ctx.fillText("Yesterday High", x, yHigh - 5);
        }
      }
    }
    return false;
  },
};
