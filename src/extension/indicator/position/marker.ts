import {Indicator, IndicatorTemplate} from "../../../component/Indicator";
import KLineData from "../../../common/KLineData";

const COLOR_ENTRY = '#ffce55';   // Blue
const COLOR_WIN = '#04cf58';     // Green
const COLOR_LOSS = '#ea21ff';    // Red

type Marker = {
  status: "OPEN" | "CLOSE";
  price: number;
  color: string;
  direction: "BUY" | "SELL";
}

function drawTradeTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  direction: "UP" | "DOWN",
  color: string
) {
  ctx.beginPath();
  if (direction === "UP") {
    ctx.moveTo(x, y);
    ctx.lineTo(x - size, y + size);
    ctx.lineTo(x + size, y + size);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x - size, y - size);
    ctx.lineTo(x + size, y - size);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

const PositionMarker: IndicatorTemplate<Marker> = {
  name: "POS",
  shortName: "PositionMarker",
  isOverlay: true,
  calcParams: [],

  // We inject customData directly (from backtest result)
  calc: (dataList: KLineData[], indicator: Indicator<Marker>) => {
    const result: Marker[] = [];

    for (let i = 0; i < dataList.length; i++) {
      const item = dataList[i];

      const marker: Marker = {};

      if (item.tradeEntry) {
        marker.price = item.tradeEntry.entryPrice;
        marker.direction = item.tradeEntry.direction;

        if (item.tradeEntry.direction === "BUY") {
          marker.color = COLOR_ENTRY;
        } else {
          marker.color = COLOR_ENTRY;
        }
        marker.status = "OPEN";
        result.push(marker);

      } else if (item.tradeExit) {
        marker.price = item.tradeExit.exitPrice!;
        marker.direction = item.tradeExit.direction;
        marker.status = "CLOSE";

        if (item.tradeExit.result === "WIN") {
          marker.color = COLOR_WIN;
        } else {
          marker.color = COLOR_LOSS;
        }

        result.push(marker);
      } else {
        result.push(marker);
      }

    }

    return result;
  },

  draw: ({ctx, xAxis, yAxis, visibleRange, indicator}) => {
    const {from, to} = visibleRange;
    const data = indicator.result;


    const size = 8;


    for (let i = from; i < to; i++) {
      const marker = data[i];
      if (!marker.price || !marker.color || !marker.direction || !marker.status) continue;

      const x = xAxis.convertToPixel(i);
      const y = yAxis.convertToPixel(marker.price);

      let offsetY: number;
      let triangleDirection: "UP" | "DOWN";

      if (marker.status === "OPEN") {
        if (marker.direction === "BUY") {
          offsetY = 6;
          triangleDirection = "UP";
        } else {
          offsetY = -6;
          triangleDirection = "DOWN";
        }
      } else {
        // status === "CLOSE"
        if (marker.direction === "BUY") {
          offsetY = -6;
          triangleDirection = "DOWN";
        } else {
          offsetY = 6;
          triangleDirection = "UP";
        }
      }

      drawTradeTriangle(ctx, x, y + offsetY, size, triangleDirection, marker.color);
    }
    return false;
  }
};

export default PositionMarker;
