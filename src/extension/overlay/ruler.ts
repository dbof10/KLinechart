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
import { OverlayTemplate } from "../../component/Overlay";
import { TextAttrs } from "../figure/text";
import { COLOR_DEMAND, COLOR_DEMAND_ALPHA, COLOR_SUPPLY, COLOR_SUPPLY_ALPHA } from "../../utils/ColorConstant";


// const ruler: OverlayTemplate = {
//   name: "ruler",
//   totalStep: 3,
//   needDefaultPointFigure: true,
//   needDefaultXAxisFigure: true,
//   needDefaultYAxisFigure: true,
//   createPointFigures: ({ coordinates, overlay, precision }) => {
//     const lines: LineAttrs[] = [];
//     const texts: TextAttrs[] = [];
//
//     if (coordinates.length > 1) {
//       const textX = (coordinates[1].x + coordinates[0].x) / 2;
//       const points = overlay.points;
//       const valueDif = points[1].value - points[0].value;
//       const barCount = points[1].dataIndex - points[0].dataIndex;
//
//       const percent = valueDif / points[0].value;
//       const y = coordinates[1].y;
//       lines.push({ coordinates: [{ x: coordinates[0].x, y }, { x: coordinates[1].x, y }] });
//       texts.push({
//         x: textX,
//         y,
//         text: `${(percent * 100).toFixed(1)}% ${barCount} bars`,
//         baseline: "bottom",
//       });
//     }
//     return [
//       {
//         type: "line",
//         attrs: lines,
//       }, {
//         type: "text",
//         ignoreEvent: true,
//         attrs: texts,
//       },
//     ];
//   },
// };

const ruler: OverlayTemplate = {
  name: "ruler",
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay }) => {
    const texts: TextAttrs[] = [];
    if (coordinates.length > 1) {
      const points = overlay.points;

      const textX = (coordinates[1].x + coordinates[0].x) / 2;

      const valueDif = points[1].value - points[0].value;
      const barCount = points[1].dataIndex - points[0].dataIndex;
      const percent = valueDif / points[0].value;
      const y = coordinates[1].y;

      let color;
      if(valueDif > 0) {
        color = COLOR_DEMAND_ALPHA
      }else {
        color = COLOR_SUPPLY_ALPHA
      }
      texts.push({
        x: textX,
        y,
        text: `${(percent * 100).toFixed(1)}% ${barCount} bars`,
        baseline: "bottom",
      });
      return [
        {
          type: "polygon",
          attrs: {
            coordinates: [
              coordinates[0],
              { x: coordinates[1].x, y: coordinates[0].y },
              coordinates[1],
              { x: coordinates[0].x, y: coordinates[1].y },
            ],
          },
          styles: {
            color,
            style: "stroke_fill"
          },
        },
        {
          type: "text",
          ignoreEvent: true,
          attrs: texts,
        },
      ];
    }
    return [];
  },
};

export default ruler;
