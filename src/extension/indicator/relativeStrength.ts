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
import { type Indicator, type IndicatorTemplate } from "../../component/Indicator";
import { fetchData } from "../../repository/ChartRepository";
import { formatDate } from "../../repository/utils/DateUtils";

interface RS {
  symbol: number;
  market: number;
}

function calcRS(symbolData: KLineData[], marketData: KLineData[]): RS[] {
  if (symbolData.length !== marketData.length) {
    throw new Error("symbolData and marketData must be of equal size");
  }

  const rs: RS[] = new Array<RS>(symbolData.length);

  const rsValue: number[] = new Array<number>(symbolData.length).fill(0);

  for (let i = 0; i < symbolData.length; i++) {
    rsValue[i] = symbolData[i].close / marketData[i].close;
  }

  let sum = 0;
  const period = 20;

  for (let i = 0; i < symbolData.length; i++) {
    if (i < period) {
      sum += rsValue[i];
      rs[i] = {
        symbol: rsValue[i],
        market: 0,
      };
    } else {
      sum = sum - rsValue[i - period] + rsValue[i];
      rs[i] = {
        symbol: rsValue[i],
        market: sum / period,
      };
    }
  }

  return rs;
}


function processDataForSameSize(chartData: KLineData[], marketData: KLineData[]): KLineData[][] {
  if (chartData.length > marketData.length) {
    const newMarketData = stretchShorterList(chartData, marketData);
    return [chartData, newMarketData];
  } else if (chartData.length < marketData.length) {
    const newSymbolData = stretchShorterList(marketData, chartData);
    return [newSymbolData, marketData];
  } else {
    return [chartData, marketData];
  }
}

function stretchShorterList(longerList: KLineData[], shorterList: KLineData[]): KLineData[] {

  const newShortArray: KLineData[] = [];

  const firstLongDate = formatDate(longerList[0].timestamp);
  const firstShortDate = formatDate(shorterList[0].timestamp);

  const map: Map<string, KLineData> = new Map<string, KLineData>();

  shorterList.forEach(data => {
    const formattedDate = formatDate(data.timestamp);
    map.set(formattedDate, data);
  });

  if (firstLongDate !== firstShortDate) {
    throw "Data mismatch, improve the algo";
  }

  longerList.forEach((data: KLineData, index: number) => {
    const longDate = formatDate(data.timestamp);

    if (map.has(longDate)) {

      const shortItem = map.get(longDate);
      newShortArray.push(shortItem);
    } else {

      const prevDay = newShortArray[newShortArray.length - 1];
      const clonePrevDay: KLineData = {
        open: prevDay.open,
        high: prevDay.high,
        low: prevDay.low,
        close: prevDay.close,
        volume: prevDay.volume,
        timestamp: data.timestamp,
      };
      newShortArray.push(clonePrevDay);
    }
  });

  return newShortArray;

}


const relativeStrength: IndicatorTemplate<RS> = {
  name: "RS",
  shortName: "RS",
  calcParams: [20],
  figures: [
    { key: "symbol", title: "Symbol: ", type: "line" },
    { key: "market", title: "Market: ", type: "line" },
  ],
  calc: async (dataList: KLineData[], indicator: Indicator<RS>) => {
    const params = indicator.calcParams;

    if (dataList.length > 0) {
      const marketData = await fetchData("VN30F1M");
      if (marketData.length > 0) {
        const data = processDataForSameSize(dataList, marketData);
        return calcRS(data[0], data[1]);
      } else {
        return [];
      }
    } else {
      return [];
    }
  },
};

export default relativeStrength;
