import KLineData from "../../../common/KLineData";
import { Indicator, IndicatorFigureStylesCallbackData, IndicatorTemplate } from "../../../component/Indicator";
import { IndicatorStyle } from "../../../common/Styles";
import { COLOR_DEMAND, COLOR_SUPPLY } from "../../../utils/ColorConstant";


const Period = 20;

interface BidAskOscillator {
  bid?: number;
  ask?: number;
}

function calculateBidAsk(index: number, klineData: KLineData): BidAsk {
  const startIndex: number = index - Period;
  let cumbid = 0;
  let cumask = 0;
  for (let i = startIndex; i < index; i++) {
    cumbid += klineData.bidVol!;
    cumask += klineData.askVol!;
  }
  cumbid /= Period;
  cumask /= Period;

  return {
    bid: cumbid,
    ask: cumask,
  };
}

const TBidAskOscillator: IndicatorTemplate<BidAskOscillator> = {
  name: "TBA",
  shortName: "TBidAsk Oscillator",
  shouldFormatBigNumber: true,
  figures: [
    {
      key: "bid",
      title: "Supply: ",
      type: "line",
      styles: (data: IndicatorFigureStylesCallbackData<BidAskOscillator>, indicator: Indicator, defaultStyles: IndicatorStyle) => {
        return { color: COLOR_SUPPLY };
      },
    },
    {
      key: "ask", title: "Demand: ", type: "line",
      styles: (data: IndicatorFigureStylesCallbackData<BidAskOscillator>, indicator: Indicator, defaultStyles: IndicatorStyle) => {
        return { color: COLOR_DEMAND };
      },
    },
  ],
  calc: (dataList: KLineData[], indicator: Indicator<BidAskOscillator>) => {
    const params = indicator.calcParams;
    const result: BidAskOscillator[] = [];
    dataList.forEach((kLineData: KLineData, i: number) => {
      const bdo: BidAskOscillator = {};
      if (i >= Period) {
        const val = calculateBidAsk(i, kLineData);
        bdo.bid = val.bid;
        bdo.ask = val.ask;
      }
      result.push(bdo);
    });
    return result;
  },
};

export default TBidAskOscillator;
