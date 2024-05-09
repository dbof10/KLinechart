
import type KLineData from '../../common/KLineData'
import { type IndicatorTemplate, IndicatorSeries, Indicator } from "../../component/Indicator";

interface Atr {
  atr?: number
}

const averageTrueRange: IndicatorTemplate<Atr> = {
  name: 'ATR',
  shortName: 'ATR',
  precision: 2,
  calcParams: [14],
  figures: [
    { key: 'atr', title: 'ATR: ', type: 'line' }
  ],
  calc: (klineData: KLineData[], indicator: Indicator<Atr> ) => {
    const atrValues: Atr[] = [];
    const period = indicator.calcParams[0];

    for (let i = 0; i < klineData.length; i++) {

      const atr : Atr = {}
      if(i < period) {
        atrValues.push(atr);
        continue;
      }
      let trSum = 0;

      for (let j = 0; j < period; j++) {
        const tr = Math.max(
          klineData[i - j].high - klineData[i - j].low, // True Range
          Math.abs(klineData[i - j].high - klineData[i - j - 1].close), // High minus previous close
          Math.abs(klineData[i - j].low - klineData[i - j - 1].close) // Low minus previous close
        );

        trSum += tr;
      }

       atr.atr = trSum / period;
      atrValues.push(atr);
    }

    return atrValues;

  }
}

export default averageTrueRange
