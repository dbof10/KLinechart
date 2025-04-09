import { Indicator, IndicatorTemplate } from "../../../component/Indicator";
import KLineData from "../../../common/KLineData";
import {COLOR_DEMAND, COLOR_SUPPLY} from "../../../utils/ColorConstant";


type Direction = "UP" | "DOWN" | "NONE";

type StructureLine = {
  price: number;
  direction: Direction;
  index: number;
}

const DIRECTION_UP: Direction = "UP";
const DIRECTION_DOWN: Direction = "DOWN";
const DIRECTION_NONE: Direction = "NONE";

const TAutoStructure: IndicatorTemplate<StructureLine | null> = {
  name: "TAS",
  shortName: "TAutoStructure",
  isOverlay: true,
  calcParams: [21],

  calc: (dataList: KLineData[], indicator: Indicator<StructureLine | null>) => {
    const result: (StructureLine | null)[] = [];
    const period = indicator.calcParams[0];

    const directionList: Direction[] = [];
    const volumeStreak: number[] = [];
    const hlbc: number[] = [];
    const wvbc: number[] = [];
    const normHLBC: number[] = [];
    const normWVBC: number[] = [];

    const autoLineFlag: Direction[] = [];

    let lineDirection: Direction = DIRECTION_NONE;
    const lines: StructureLine[] = [];

    for (let i = 0; i < dataList.length; i++) {
      const item = dataList[i];

      // Direction
      let dir: Direction = DIRECTION_NONE;
      if (item.close > item.open) dir = DIRECTION_UP;
      else if (item.close < item.open) dir = DIRECTION_DOWN;
      directionList.push(dir);

      // Volume streak
      let vol = 0;
      for (let j = i; j >= 0; j--) {
        if (directionList[j] !== dir) break;
        vol += dataList[j].volume ?? 0;
      }
      volumeStreak.push(vol);

      // WVBC
      let volCompare = -1;
      let oppositeCount = 0;
      for (let j = i - 1; j >= 0; j--) {
        if (directionList[j] === opposite(dir)) {
          oppositeCount++;
          continue;
        }
        if (volumeStreak[j] > vol) {
          volCompare = i - j - oppositeCount - 1;
          break;
        }
      }
      wvbc.push(Math.max(volCompare, 0));

      // HLBC
      let barsBack = -1;
      if (dir === DIRECTION_UP) {
        for (let j = i - 1; j >= 0; j--) {
          if (dataList[j].close > item.close) {
            barsBack = i - j - 1;
            break;
          }
        }
      } else if (dir === DIRECTION_DOWN) {
        for (let j = i - 1; j >= 0; j--) {
          if (dataList[j].close < item.close) {
            barsBack = i - j - 1;
            break;
          }
        }
      }
      hlbc.push(barsBack < 0 ? i : barsBack);

      // Normalize
      normHLBC.push(normalizeLast(hlbc, i, period));
      normWVBC.push(normalizeLast(wvbc, i, period));

      // Structure signal
      let signal: Direction = DIRECTION_NONE;
      if (
        i >= 2 &&
        normHLBC[i - 2] > 0 &&
        normWVBC[i - 2] > 0 &&
        directionList[i - 1] !== directionList[i - 2]
      ) {
        signal = directionList[i - 2];
      }
      autoLineFlag.push(signal);

      // Manage lines
      let structure: StructureLine | null = null;
      if (i >= 2 && signal !== DIRECTION_NONE) {
        if (lineDirection === DIRECTION_NONE) {
          lineDirection = signal;
        } else if (lineDirection !== signal) {
          lines.length = 0; // clear on direction flip
          lineDirection = signal;
        }

        const baseIndex = i - 2;
        structure = {
          index: baseIndex,
          direction: signal,
          price: signal === DIRECTION_UP ? dataList[baseIndex].high : dataList[baseIndex].low
        };
        lines.push(structure);
      }

      result.push(null); // default
      if (lines.length > 0) {
        result[i] = lines[lines.length - 1];
      }
    }

    return result;
  },

  draw: ({ ctx, xAxis, yAxis, visibleRange, indicator }) => {
    const { from, to } = visibleRange;
    const data = indicator.result;

    // Map of yInPixel -> { x1, x2, color }
    const yMap = new Map<number, { x1: number, x2: number, color: string }>();

    for (let i = from; i < to; i++) {
      const line = data[i];
      if (!line) continue;

      const y = yAxis.convertToPixel(line.price);
      const roundedY = Math.round(y); // round to nearest pixel to dedup

      const x1 = xAxis.convertToPixel(line.index);
      const x2 = xAxis.convertToPixel(i);
      const color = line.direction === DIRECTION_UP ? COLOR_SUPPLY : COLOR_DEMAND;

      if (!yMap.has(roundedY)) {
        yMap.set(roundedY, { x1, x2, color });
      } else {
        const entry = yMap.get(roundedY)!;
        entry.x2 = x2; // always extend to latest bar
      }
    }

    for (const [y, { x1, x2, color }] of yMap.entries()) {
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    return false;


  },
};

function opposite(dir: Direction): Direction {
  if (dir === DIRECTION_UP) return DIRECTION_DOWN;
  if (dir === DIRECTION_DOWN) return DIRECTION_UP;
  return DIRECTION_NONE;
}

function normalizeLast(arr: number[], current: number, period: number): number {
  if (current < period) return 0;
  const slice = arr.slice(current - period, current);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((sum, val) => sum + (val - mean) ** 2, 0) / period;
  const std = Math.sqrt(variance);
  const z = std === 0 ? 0 : (arr[current] - mean) / std;
  return Math.max(z, 0);
}

export default TAutoStructure;
