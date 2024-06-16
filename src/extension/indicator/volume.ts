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

import type KLineData from "../../common/KLineData";
import { type IndicatorStyle } from "../../common/Styles";


import {
  type Indicator,
  type IndicatorFigure,
  type IndicatorFigureStylesCallbackData,
  IndicatorSeries,
  type IndicatorTemplate,
  IndicatorFigureAttrsCallbackParams,
} from "../../component/Indicator";
import { COLOR_DEMAND, COLOR_SUPPLY } from "../../utils/ColorConstant";

interface Vol {
  volume?: number
  ma1?: number
  color: string
}

function getVolumeFigure (): IndicatorFigure<Vol> {
  return {
    key: 'volume',
    title: 'VOLUME: ',
    type: 'bar',
    baseValue: 0,
    styles: (data: IndicatorFigureStylesCallbackData<Vol>, indicator: Indicator, defaultStyles: IndicatorStyle) => {
      const color = data.current.indicatorData?.color
      return { color }
    }
  }
}

const volume: IndicatorTemplate<Vol> = {
  name: 'VOL',
  shortName: 'VOL',
  series: IndicatorSeries.Volume,
  calcParams: [20],
  shouldFormatBigNumber: true,
  precision: 0,
  minValue: 0,
  figures: [
    { key: 'ma1', title: 'MA20: ', type: 'line' },
    getVolumeFigure()
  ],
  regenerateFigures: (params: any[]) => {
    const figures: Array<IndicatorFigure<Vol>> = params.map((p: number, i: number) => {
      return { key: `ma${i + 1}`, title: `MA${p}: `, type: 'line' }
    })
    figures.push(getVolumeFigure())
    return figures
  },
  calc: (dataList: KLineData[], indicator: Indicator<Vol>) => {
    const { calcParams: params, figures } = indicator
    const volSums: number[] = []
    return dataList.map((kLineData: KLineData, i: number) => {
      const volume = kLineData.volume ?? 0
      let color: string;

      if (i < 2) {
        if (kLineData.close >= kLineData.open) {
          color = COLOR_DEMAND;

        } else {
          color = COLOR_SUPPLY;
        }
      } else {

        const itemAtI: KLineData = dataList[i];
        const itemAtMinus1: KLineData = dataList[i - 1];
        const itemAtMinus2: KLineData = dataList[i - 2];

        if (itemAtI.close === itemAtMinus1.close) {
          if (itemAtMinus1.close > itemAtMinus2.close) {
           color = COLOR_DEMAND;
          } else {
           color = COLOR_SUPPLY;
          }
        } else if (itemAtI.close > itemAtMinus1.close) {
          color = COLOR_DEMAND;
        } else {
          color = COLOR_SUPPLY;
        }
      }

      const vol: Vol = { volume, color }


      params.forEach((p, index) => {
        volSums[index] = (volSums[index] ?? 0) + volume
        if (i >= p - 1) {
          vol[figures[index].key] = volSums[index] / p
          volSums[index] -= (dataList[i - (p - 1)].volume ?? 0)
        }
      })
      return vol
    })
  }
}

export default volume
