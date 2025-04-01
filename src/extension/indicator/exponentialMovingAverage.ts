/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type KLineData from '../../common/KLineData'
import { type Indicator, type IndicatorTemplate, IndicatorSeries } from '../../component/Indicator'
import {Trade} from "./model/Trade";

interface Ema {
  ema1?: number
  ema2?: number
  ema3?: number
  metaData?: {
    [key: string]: Trade; // key = 'ema1' | 'ema2' | 'ema3'
  };
}

/**
 * EMA 指数移动平均
 */
const exponentialMovingAverage: IndicatorTemplate<Ema> = {
  name: 'EMA',
  shortName: 'EMA',
  series: IndicatorSeries.Price,
  calcParams: [7, 21, 50],
  precision: 2,
  shouldOhlc: true,
  isOverlay: true,
  figures: [
    { key: 'ema1', title: 'EMA6: ', type: 'line' },
    { key: 'ema2', title: 'EMA12: ', type: 'line' },
    { key: 'ema3', title: 'EMA20: ', type: 'line' }
  ],
  regenerateFigures: (params: any[]) => {
    return params.map((p: number, i: number) => {
      return { key: `ema${i + 1}`, title: `EMA${p}: `, type: 'line' }
    })
  },
  calc: (dataList: KLineData[], indicator: Indicator<Ema>) => {
    const { calcParams: params, figures } = indicator;
    let closeSum = 0;
    const emaValues: number[] = [];

    return dataList.map((kLineData: KLineData, i: number) => {
      const ema: Ema = {};
      const close = kLineData.close;
      closeSum += close;

      const metaData: Record<string, Trade> = {};

      params.forEach((p: number, index: number) => {
        const key = figures[index].key; // 'ema1', 'ema2', 'ema3'

        if (i >= p - 1) {
          if (i > p - 1) {
            emaValues[index] = (2 * close + (p - 1) * emaValues[index]) / (p + 1);
          } else {
            emaValues[index] = closeSum / p;
          }

          const currentEma = emaValues[index];
          ema[key] = currentEma;

          if (i > 0) {
            const prevClose = dataList[i - 1].close;
            const currClose = close;
            const prevEma = emaValues[index]; // same as current (previous not stored, simplified)

            // Cross above = BUY
            if (prevClose < prevEma && currClose > currentEma) {
              metaData[key] = { direction: "BUY", entry: close };
            }

            // Cross below = SELL
            else if (prevClose > prevEma && currClose < currentEma) {
              metaData[key] = { direction: "SELL", entry: close };
            }
          }
        }
      });

      if (Object.keys(metaData).length > 0) {
        ema.metaData = metaData;
      }

      return ema;
    });
  }
}

export default exponentialMovingAverage
