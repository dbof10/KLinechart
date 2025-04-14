import type KLineData from '../../common/KLineData';
import { type IndicatorTemplate, Indicator } from "../../component/Indicator";

interface Atr {
  atr?: number;
}

const averageTrueRange: IndicatorTemplate<Atr> = {
  name: 'ATR',
  shortName: 'ATR',
  precision: 2,
  calcParams: [14],
  figures: [
    { key: 'atr', title: 'ATR: ', type: 'line' }
  ],

  calc: (klineData: KLineData[], indicator: Indicator<Atr>) => {
    const atrValues: Atr[] = [];
    const period = indicator.calcParams[0];

    if (klineData.length === 0 || period <= 0) return atrValues;

    let trSum = 0;

    for (let i = 0; i < klineData.length; i++) {
      const atr: Atr = {};

      if (i === 0) {
        atrValues.push(atr); // No ATR on the first bar
        continue;
      }

      const curr = klineData[i];
      const prev = klineData[i - 1];

      const tr = Math.max(
        curr.high - curr.low,
        Math.abs(curr.high - prev.close),
        Math.abs(curr.low - prev.close)
      );

      if (i < period) {
        trSum += tr;
        atrValues.push(atr);
      } else if (i === period) {
        trSum += tr;
        atr.atr = trSum / period;
        atrValues.push(atr);
      } else {
        const prevATR = atrValues[i - 1].atr!;
        atr.atr = (prevATR * (period - 1) + tr) / period;
        atrValues.push(atr);
      }
    }

    return atrValues;
  }
};

export default averageTrueRange;
