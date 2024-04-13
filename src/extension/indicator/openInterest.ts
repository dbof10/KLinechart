import type KLineData from "../../common/KLineData";
import { type Indicator, type IndicatorTemplate } from "../../component/Indicator";
import { fetchFutureData } from "../../repository/ChartRepository";
import { formatDate } from "../../repository/utils/DateUtils";

interface OI {
  oi: number;
}


const openInterest: IndicatorTemplate<OI> = {
  name: "OI",
  shortName: "OI",
  figures: [
    { key: "oi", title: "Aggregate OI: ", type: "line" },
  ],
  calc: async (dataList: KLineData[], indicator: Indicator<OI>) => {
    const { calcParams: params, figures } = indicator;

    const futureData = await fetchFutureData();

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
        const oi: OI = {
          oi: 0
        };
        return oi;
      }
    });
  },
};

export default openInterest;
