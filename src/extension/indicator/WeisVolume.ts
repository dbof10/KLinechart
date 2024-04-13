import type KLineData from "../../common/KLineData";
import { type IndicatorStyle } from "../../common/Styles";

import {
  type Indicator,
  type IndicatorFigure,
  type IndicatorFigureStylesCallbackData,
  IndicatorSeries,
  type IndicatorTemplate,
} from "../../component/Indicator";

interface WeisVol {
  volume?: number;
  color: string;
}

function getWeisVolumeFigure(): IndicatorFigure<WeisVol> {
  return {
    key: "volume",
    title: "WEIS VOLUME: ",
    type: "bar",
    baseValue: 0,
    styles: (data: IndicatorFigureStylesCallbackData<WeisVol>, indicator: Indicator, defaultStyles: IndicatorStyle) => {
      const indi = data.current.indicatorData;

      return { color: indi?.color };
    },
  };
}

const weisVolume: IndicatorTemplate<WeisVol> = {
  name: "WV",
  shortName: "Weis Volume",
  series: IndicatorSeries.Volume,
  shouldFormatBigNumber: true,
  precision: 0,
  minValue: 0,
  figures: [
    getWeisVolumeFigure(),
  ],
  calc: (dataList: KLineData[], indicator: Indicator<WeisVol>) => {
    const { calcParams: params, figures } = indicator;
    const volSums: WeisVol[] = [];

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
          colorAt = "blue";
        } else {
          colorAt = "red";
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

export default weisVolume;
