import type KLineData from "../../common/KLineData";
import { type Indicator, type IndicatorTemplate } from "../../component/Indicator";
import { fetchFutureData } from "../../repository/ChartRepository";
import { formatDate } from "../../repository/utils/DateUtils";

interface OI {
  oi?: number;
}


const openInterest: IndicatorTemplate<OI> = {
  name: "OI",
  shortName: "OI",
  minValue: 0,
  precision: 0,
  figures: [
    { key: "oi", title: "Aggregate OI: ", type: "line" },
  ],
  calc: async (dataList: KLineData[], indicator: Indicator<OI>) => {
    const { calcParams: params, figures } = indicator;

    if (dataList.length > 0) {
      const futureData = await fetchFutureData(dataList[0].timestamp, dataList[dataList.length - 1].timestamp);

      const map: Map<string, FutureContract> = new Map<string, FutureContract>();

      futureData.forEach(contract => {
        map.set(contract.displayDate, contract);
      });

      return dataList.map((kLineData, i) => {
        const date = formatDate(kLineData.timestamp);

        if (map.has(date)) {
          const oi: OI = {
            oi: map.get(date)!.io,
          };
          return oi;
        } else {
          const oi: OI = {};
          return oi;
        }
      });
    } else {
      return dataList.map((e: KLineData) => {
        const oi: OI = {};
        return oi;
      });
    }
  },
};

export default openInterest;
