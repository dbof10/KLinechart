import type KLineData from "../../common/KLineData";
import { type IndicatorStyle } from "../../common/Styles";
import { formatValue } from "../../common/utils/format";
import { isValid } from "../../common/utils/typeChecks";

import {
  type Indicator,
  type IndicatorFigure,
  type IndicatorFigureStylesCallbackData,
  IndicatorSeries,
  type IndicatorTemplate,
} from "../../component/Indicator";

interface Pace {
  pace: number;
}

function getPace(i: KLineData): number {
  const num: number = Math.abs(i.close - i.open);

  if (i.close === i.open) {
    return 0;
  }
  let value: number = 0;
  const delta: number = i.askVol - i.bidVol;

  value = delta * num;
  return value;

}

function getVolumeFigure(): IndicatorFigure<Pace> {
  return {
    key: "pace",
    title: "VAL: ",
    type: "bar",
    baseValue: 0,
    styles: (data: IndicatorFigureStylesCallbackData<Pace>, indicator: Indicator, defaultStyles: IndicatorStyle) => {
      const kLineData = data.current.kLineData;
      let color = formatValue(indicator.styles, "bars[0].noChangeColor", (defaultStyles.bars)[0].noChangeColor);
      if (isValid(kLineData)) {
        if (kLineData.close > kLineData.open) {
          color = formatValue(indicator.styles, "bars[0].upColor", (defaultStyles.bars)[0].upColor);
        } else {
          color = formatValue(indicator.styles, "bars[0].downColor", (defaultStyles.bars)[0].downColor);
        }
      }
      return { color: color as string };
    },
  };
}

const TPace: IndicatorTemplate<Pace> = {
  name: "TPA",
  shortName: "TPace",
  series: IndicatorSeries.Volume,
  shouldFormatBigNumber: true,
  minValue: 0,
  figures: [
    getVolumeFigure(),
  ],
  calc: (dataList: KLineData[], indicator: Indicator<Pace>) => {
    return dataList.map((kLineData: KLineData, i: number) => {
      const pace = getPace(kLineData);
      return {
        pace: pace
      }
    });
  },
};

export default TPace;
