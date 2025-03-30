import { TextPosition } from "./TextPosition";
import {Trade} from "../../model/Trade";

export interface TWaveBar {
  low?: number;
  high?: number;
  totalVolume?: string;
  totalDeltaVolume?: string;
  algo?: string;
  secondAlgo?: string;
  index: string;
  textPosition?: TextPosition;
  metaData?: Trade;
}
