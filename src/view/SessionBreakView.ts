import type VisibleData from "../common/VisibleData";

import ChildrenView from "./ChildrenView";
import { isValid } from "../common/utils/typeChecks";
import { isSpecificHour } from "../utils/TimeUtils";

export default class SessionBreakView extends ChildrenView {

  override drawImp(ctx: CanvasRenderingContext2D): void {
    const widget = this.getWidget();
    const pane = widget.getPane();
    const chartStore = pane.getChart().getChartStore();
    const bounding = widget.getBounding();
    const lineStyle = chartStore.getStyles().sessionBreak;
    const settings= chartStore.getTradingSettings();

    this.eachChildren((data: VisibleData) => {
      const { data: kLineData, x } = data;
      if (isValid(kLineData)) {

        const canDrawAt = isSpecificHour(kLineData.timestamp, settings.tradingHours.morningSession.open);

        if(canDrawAt) {
          this.createFigure({
            name: "line",
            attrs: {
              coordinates: [
                { x: data.x, y: 0 },
                { x: data.x, y: bounding.height },
              ],
            },
            styles: {
              style: lineStyle.style,
              color: lineStyle.color,
              size: 1,
              dashedValue: lineStyle.dashedValue,
            },
          })?.draw(ctx);
        }
      }
    });

  }

}
