import KLineData from "../../../../common/KLineData";
import { TextPosition } from "./TextPosition";


export interface TWaveKLineData extends KLineData {
  totalVolume?: number;
  totalDeltaVolume?: number;
  textPosition?: TextPosition;
}
