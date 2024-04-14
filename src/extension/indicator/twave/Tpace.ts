import KLineData from "../../../common/KLineData";
import { IndicatorStyle } from "../../../common/Styles";
import {
  Indicator,
  IndicatorFigure,
  IndicatorFigureStylesCallbackData,
  IndicatorSeries,
  IndicatorTemplate,
} from "../../../component/Indicator";
import { isValid } from "../../../common/utils/typeChecks";
import { COLOR_DEMAND, COLOR_SUPPLY } from "../../../utils/ColorConstant";

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
      let color: string;
      if (isValid(kLineData)) {
        if (kLineData.close > kLineData.open) {
          color = COLOR_DEMAND;
        } else {
          color = COLOR_SUPPLY;
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
        pace: pace,
      };
    });
  },
};

export default TPace;
