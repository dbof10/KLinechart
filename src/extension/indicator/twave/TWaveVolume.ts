import KLineData from "../../../common/KLineData";
import { IndicatorStyle } from "../../../common/Styles";
import {
  Indicator,
  IndicatorFigure,
  IndicatorFigureStylesCallbackData, IndicatorSeries,
  IndicatorTemplate,
} from "../../../component/Indicator";
import { COLOR_DEMAND, COLOR_SUPPLY } from "../../../utils/ColorConstant";

interface TWaveVol {
  volume?: number;
  color: string;
}

function getVolumeFigure(): IndicatorFigure<TWaveVol> {
  return {
    key: "volume",
    title: "VAL: ",
    type: "bar",
    baseValue: 0,
    styles: (data: IndicatorFigureStylesCallbackData<TWaveVol>, indicator: Indicator, defaultStyles: IndicatorStyle) => {
      const indi = data.current.indicatorData;

      return { color: indi?.color };
    },
  };
}

const TWaveVolume: IndicatorTemplate<TWaveVol> = {
  name: "TW",
  shortName: "TWave Volume",
  series: IndicatorSeries.Volume,
  shouldFormatBigNumber: true,
  figures: [
    getVolumeFigure(),
  ],
  calc: (dataList: KLineData[], indicator: Indicator<TWaveVol>) => {
    const { calcParams: params, figures } = indicator;
    const volSums: TWaveVol[] = [];

    const DataStartIndex = 2; //start drawing
    const Reverse = false;

    const Array_Direction: number[] = Array(dataList.length).fill(-1);

    for (let i = 0; i < dataList.length; i++) {

      if (i < DataStartIndex) {
        volSums.push({
          volume: 0,
          color: "red",
        });
        continue;
      }

      if (dataList[i].close === dataList[i - 1].close) {
        if (dataList[i - 1].close > dataList[i - 2].close) {
          Array_Direction[i] = 1;
        } else {
          Array_Direction[i] = 0;
        }
      } else if (dataList[i].close > dataList[i - 1].close) {
        Array_Direction[i] = 1;
      } else {
        Array_Direction[i] = 0;
      }

      const curDirection = Array_Direction[i];
      //   0 1 2 3 4 5 6 7 8 9
      //   1 1 1 1 1 1 1 0 0 1
      //         v
      let indexOfNewTrend = i;
      while (Array_Direction[indexOfNewTrend] == Array_Direction[indexOfNewTrend - 1] && indexOfNewTrend > DataStartIndex) {
        indexOfNewTrend--;
      }
      let vol = 0;

      for (let j = indexOfNewTrend; j <= i; j++) {
        vol += dataList[j].volume;
        let colorAt: string;

        if (curDirection == 1) {
          colorAt = COLOR_DEMAND;
        } else {
          colorAt = COLOR_SUPPLY;
        }

        volSums[j] = {
          volume: vol,
          color: colorAt,
        };

      }
    }

    return volSums;
  },

};

export default TWaveVolume;
