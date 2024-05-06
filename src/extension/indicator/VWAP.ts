import { type Indicator, IndicatorSeries, IndicatorTemplate } from "../../component/Indicator";
import KLineData from "../../common/KLineData";


type VWAP = {
  vwap: number;
  vwap1U: number;
  vwap1L: number;
  vwap2U: number;
  vwap2L: number;
  vwap3U: number;
  vwap3L: number;
}

export const VWAP: IndicatorTemplate<VWAP> = {
  name: "VWAP",
  shortName: "VWAP",
  series: IndicatorSeries.Price,
  shouldOhlc: true,
  isOverlay: true,
  calcParams: [3],
  figures: [
    { key: "vwap", title: "VWAP: ", type: "line" },
    { key: "vwap1U", type: "line" },
    { key: "vwap1L", type: "line" },
    { key: "vwap2U", type: "line" },
    { key: "vwap2L", type: "line" },
    { key: "vwap3U",  type: "line" },
    { key: "vwap3L",  type: "line" },
  ],
  calc: (kLineDataList: KLineData[], indicator: Indicator<VWAP>) => {
    const list: VWAP[] = [];
    const params = indicator.calcParams;
    const numberOfDeviation = params[0];

    let iCumVolume: number;
    let iCumTypicalVolume: number;
    let v2Sum: number;

    const SD1 = 1.28;
    const SD2 = 2.01;
    const SD3 = 2.51;

    kLineDataList.forEach((e: KLineData) => {

      const vwap: VWAP = {};

      let hl3 = ((e.high + e.low + e.close) / 3);

      if (e.isStartOfSession) {
        iCumVolume = e.volume;
        iCumTypicalVolume = e.volume * hl3;
        v2Sum = e.volume * hl3 * hl3;
      } else {
        iCumVolume = iCumVolume + e.volume;
        iCumTypicalVolume = iCumTypicalVolume + (e.volume * hl3);
        v2Sum = v2Sum + e.volume * hl3 * hl3;
      }

      const curVWAP = (iCumTypicalVolume / iCumVolume);
      const deviation = Math.sqrt(Math.max(v2Sum / iCumVolume - curVWAP * curVWAP, 0));

      vwap.vwap = curVWAP;

      if (numberOfDeviation >= 1) {
        vwap.vwap1U = curVWAP + SD1 * deviation;
        vwap.vwap1L = curVWAP - SD1 * deviation;
      }
      if(numberOfDeviation >= 2) {
        vwap.vwap2U = curVWAP + SD2 * deviation;
        vwap.vwap2L = curVWAP - SD2 * deviation;
      }
      if(numberOfDeviation >= 3) {
        vwap.vwap3U = curVWAP + SD3 * deviation;
        vwap.vwap3L = curVWAP - SD3 * deviation;
      }
      list.push(vwap);
    });

    return list;
  },
};
