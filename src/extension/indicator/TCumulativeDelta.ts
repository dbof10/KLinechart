import type KLineData from "../../common/KLineData";
import { type IndicatorStyle } from "../../common/Styles";

import {
  type Indicator,
  type IndicatorFigure,
  type IndicatorFigureStylesCallbackData,
  IndicatorSeries,
  type IndicatorTemplate,
} from "../../component/Indicator";

const Period = 20;

interface CumulativeDelta {
  cumDelta?: number;
  color?: string;
}

function getCumDelta(index: number, klineData: KLineData[]): number {
  let total: number = 0;
  const startIndex: number = index - Period;
  for (let i: number = startIndex; i < index; i++) {
    const delta: number = klineData[i].askVol - klineData[i].bidVol;
    total += delta;
  }
  return total / Period;
}

function getVolumeFigure(): IndicatorFigure<CumulativeDelta> {
  return {
    key: "cumDelta",
    type: "bar",
    baseValue: 0,
    styles: (data: IndicatorFigureStylesCallbackData<CumulativeDelta>, indicator: Indicator, defaultStyles: IndicatorStyle) => {
      return { color: data.current.indicatorData?.color };
    },
  };
}


const TCumulativeDelta: IndicatorTemplate<CumulativeDelta> = {
  name: "TCD",
  shortName: "TCumulative Delta",
  series: IndicatorSeries.Volume,
  shouldFormatBigNumber: true,
  minValue: 0,
  figures: [
    getVolumeFigure(),
  ],
  calc: (dataList: KLineData[], _: Indicator<CumulativeDelta>) => {
    const result: CumulativeDelta[] = [];
    dataList.forEach((kLineData: KLineData, i: number) => {
      const cd: CumulativeDelta = {};
      if (i >= Period) {
        const val = getCumDelta(i, dataList);
        if (val >= 0) {
          cd.color = "blue";
        } else {
          cd.color = "red";
        }
        cd.cumDelta = val;
      }
      result.push(cd);
    });
    return result;
  },
};

export default TCumulativeDelta;
