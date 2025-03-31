import KLineData from "../../../../common/KLineData";
import { TextPosition } from "./TextPosition";
import {MarketStructure} from "./MarketStructure";


export interface TWaveKLineData extends KLineData {
  totalVolume?: number;
  totalDeltaVolume?: number;
  textPosition?: TextPosition;
  algo?: number
  algo2?: number
  marketStructure?: MarketStructure
}
