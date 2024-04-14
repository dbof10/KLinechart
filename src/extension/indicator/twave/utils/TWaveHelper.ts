import KLineData from "../../../../common/KLineData";
import { Bar } from "../model/Bar";


export function getBarByIndex(data: KLineData): Bar {
  return {
    open: data.open,
    high: data.high,
    low: data.low,
    close: data.close,
    volume: data.volume!
  };
}


export function getIndexOfLowestValue(In: number[], Index: number, Length: number): number {
  let Low: number = Number.MAX_VALUE;
  let IndexAtLowest: number = 0;

  for (let SrcIndex: number = Index; SrcIndex > Index - Length; --SrcIndex) {
    if (SrcIndex < 0 || SrcIndex >= In.length)
      continue;

    if (In[SrcIndex] < Low) {
      Low = In[SrcIndex];
      IndexAtLowest = SrcIndex;
    }
  }

  return IndexAtLowest;
}

export function getIndexOfHighestValue(In: number[], Index: number, Length: number): number {
  let High: number = Number.MIN_VALUE;
  let IndexAtHighest: number = 0;

  for (let SrcIndex: number = Index; SrcIndex > Index - Length; --SrcIndex) {
    if (SrcIndex < 0 || SrcIndex >= In.length)
      continue;

    if (In[SrcIndex] > High) {
      High = In[SrcIndex];
      IndexAtHighest = SrcIndex;
    }
  }

  return IndexAtHighest;
}

